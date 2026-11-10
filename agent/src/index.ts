// agent/index — bootstrap: WebSocket Server + loop de métricas + ações +
// config.
//
// Porta: 5555 por padrão; sobrepõe via `PORT`.

import { WebSocketServer, WebSocket } from 'ws'
import { SystemMetrics, defaultMetrics } from './metrics.js'
import { defaultActions, AckResult } from './actions.js'
import { loadConfig, saveConfig, type ConfigPatch } from './config.js'
import {
  validateMessage,
  type Message,
  type Config,
  type Action,
  type ActionArgs,
  type OpenAppArgs,
  type ScreenshotCropArgs,
  type ScreenshotFullArgs,
  type AddGameArgs,
  type LaunchExeArgs,
  type SimulateKeyDownArgs,
  type SimulateKeyUpArgs,
  type GameEntry,
} from 'shared'

const PORT = Number(process.env.PORT) || 5555

export interface AgentDeps {
  port?: number
  actions?: typeof defaultActions
  metrics?: SystemMetrics
  wssFactory?: (port: number) => WebSocketServer
}

export async function startAgent(deps: AgentDeps = {}): Promise<{
  wss: WebSocketServer
  stop: () => Promise<void>
}> {
  const port = deps.port ?? PORT
  const metrics = deps.metrics ?? defaultMetrics
  const actions = deps.actions ?? defaultActions

  const wss = deps.wssFactory
    ? deps.wssFactory(port)
    : new WebSocketServer({ port })
  await new Promise<void>((resolve, reject) => {
    wss.on('listening', resolve)
    wss.on('error', reject)
  })

  const clients = new Set<WebSocket>()

  wss.on('connection', (socket) => {
    clients.add(socket)
    socket.on('close', () => clients.delete(socket))
    socket.on('error', () => clients.delete(socket))

    // Cada socket tem seu próprio handler de `message` — o WebSocketServer
    // não emite `message` diretamente (só nos clients).
    socket.on('message', async (raw) => {
      const msg = validateMessage(safeJson(raw.toString()))
      if (!msg) return

      switch (msg.type) {
        case 'action': {
          const action = msg.payload as Action
          const result = await dispatchAction(action, actions)
          broadcast(
            JSON.stringify({
              type: result.ok ? 'ack' : 'error',
              payload: { for_: 'action', ok: result.ok, detail: result.detail },
            }),
          )
          break
        }
        case 'config': {
          const cfgMsg = msg.payload as
            | { scope: 'get' }
            | { scope: 'set'; key: string; value: string }
          if (cfgMsg.scope === 'get') {
            const cfg = await loadConfig()
            broadcast(JSON.stringify({ type: 'config', payload: cfg }))
          } else if (cfgMsg.scope === 'set') {
            const patch: ConfigPatch = buildConfigPatch(cfgMsg)
            const next = await saveConfig(patch)
            broadcast(
              JSON.stringify({
                type: 'ack',
                payload: { for_: 'config', ok: true, detail: 'config updated' },
              }),
            )
            broadcast(JSON.stringify({ type: 'config', payload: next }))
          }
          break
        }
        default:
          break
      }
    })
  })

  // Loop de métricas: emite `metrics` a cada 1s pra todos os clientes.
  const metricsTimer = setInterval(async () => {
    const m = await metrics.collect()
    const payload = JSON.stringify({ type: 'metrics', payload: m })
    broadcast(payload)
  }, 1000)

  function broadcast(rawJson: string) {
    for (const c of clients) {
      try {
        if (c.readyState === WebSocket.OPEN) c.send(rawJson)
      } catch {
        clients.delete(c)
      }
    }
  }

  async function stop() {
    clearInterval(metricsTimer)
    for (const c of clients) c.close()
    await new Promise<void>((resolve) => wss.close(() => resolve()))
  }

  async function dispatchAction(
    action: Action,
    actions: typeof defaultActions,
  ): Promise<AckResult> {
    const config = await loadConfig()
    switch (action.name) {
      case 'open-app': {
        const args = action.args as OpenAppArgs
        return actions.openApp(args.app, config)
      }
      case 'screenshot-full': {
        return actions.screenshotFull(config.screenshotDir, config)
      }
      case 'screenshot-crop': {
        const args = action.args as ScreenshotCropArgs
        if (args.width <= 0 || args.height <= 0) {
          return { ok: false, detail: 'invalid crop dimensions' }
        }
        return actions.screenshotCrop(
          config.screenshotDir,
          { x: args.x, y: args.y, width: args.width, height: args.height },
          config,
        )
      }
      case 'add-game': {
        const args = action.args as AddGameArgs
        const result = await actions.addGame(
          {
            name: args.name,
            exePath: args.exePath,
            platform: args.platform,
          },
          config,
        )
        if (result.ok) {
          const next = await loadConfig()
          broadcast(JSON.stringify({ type: 'config', payload: next }))
        }
        return result
      }
      case 'launch-exe': {
        const args = action.args as LaunchExeArgs
        return actions.launchExe(args.exePath, config)
      }
      case 'key-down': {
        const args = action.args as SimulateKeyDownArgs
        return actions.keyDown(args.btn, args.holdMs ?? 50, config)
      }
      case 'key-up': {
        const args = action.args as SimulateKeyUpArgs
        return actions.keyUp(args.btn, config)
      }
      default:
        return { ok: false, detail: `unknown action ${action.name}` }
    }
  }

  console.log(`[agent] WebSocket Server em ws://0.0.0.0:${port}`)
  return { wss, stop }
}

function buildConfigPatch(msg: {
  scope: 'set'
  key: string
  value: string
}): ConfigPatch {
  switch (msg.key) {
    case 'screenshotDir':
      return { screenshotDir: msg.value }
    case 'clipDir':
      return { clipDir: msg.value }
    case 'enabledApps': {
      try {
        const parsed = JSON.parse(msg.value)
        if (Array.isArray(parsed)) {
          return {
            enabledApps: parsed.filter(
              (a: string) => a === 'discord' || a === 'obs',
            ),
          }
        }
      } catch {
        // Valor mal formatado → desliga todos (comportamento seguro).
        return { enabledApps: [] }
      }
      return {}
    }
    case 'games': {
      try {
        const parsed = JSON.parse(msg.value)
        if (Array.isArray(parsed)) {
          return {
            games: parsed.filter(
              (g: unknown) =>
                g &&
                typeof g === 'object' &&
                typeof (g as { exePath?: unknown }).exePath === 'string' &&
                (g as { exePath: string }).exePath.length > 0,
            ) as GameEntry[],
          }
        }
      } catch {
        return { games: [] }
      }
      return {}
    }
    default:
      return {}
  }
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Boot quando rodar direto: `npm run dev:agent`.
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('index.ts')
) {
  startAgent()
    .catch((err) => {
      console.error('[agent] falha ao subir:', err)
      process.exit(1)
    })
}
