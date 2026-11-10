// shared/protocol — contrato de mensagem (fronteira agent ⇄ web)
//
// Este módulo é a fronteira entre o agente (servidor) e a web (cliente).
// Qualquer mudança aqui exige bump de versão no contrato e atualização dos
// dois lados.

// ---------- Métricas (agent → web) ----------

export interface Metrics {
  /** Utilização de CPU em percentual (0–100). */
  cpu: number
  /** Utilização de RAM em percentual (0–100). */
  ram: number
  /** RAM usada em GB. */
  ramUsedGB: number
  /** FPS do processo focado; -1 se não detectado. */
  fps: number
  /** ISO timestamp da coleta. */
  timestamp: string
}

// ---------- Ações (web → agent) ----------

export type OpenApp = 'discord' | 'obs'

export interface OpenAppArgs {
  app: OpenApp
}

export interface ScreenshotFullArgs {
  /** Vazio na fase 1; a pasta de saída vem de config.screenshotDir. */
}

export interface ScreenshotCropArgs {
  /** Coordenada no topo-esquerdo da área selecionada (px). */
  x: number
  y: number
  /** Dimensão da área selecionada (px). */
  width: number
  height: number
}

/**
 * Registro de um jogo cujo .exe a detecção automática não encontrou.
 * Persistido pelo agente em `config.games`; o caminho do .exe é validado.
 */
export interface GameEntry {
  /** Nome curto exibido no deck (ex. "Cyberpunk 2077"). */
  name: string
  /** Caminho absoluto do executável (ex. `C:\Games\cpgame\bin64\cyberpunk2077_x64.exe`). */
  exePath: string
  /** Plataforma/origem, apenas para exibição (ex. "Manual", "Steam"). */
  platform?: string
}

/** Criação de um jogo manual: o nome é derivado do .exe; `exePath` é obrigatório. */
export interface AddGameArgs {
  exePath: string
  name?: string
  platform?: string
}

/** Abre um jogo já registrado, pelo caminho do .exe. */
export interface LaunchExeArgs {
  exePath: string
}

/**
 * Simula uma tecla via `SendInput` com `KEYEVENTF_SCANCODE` — o único modo
 * que funciona em jogos Raw Input / DirectInput (VK code é ignorado).
 *
 * `keyCode` é o **scan code** HID da tecla (ex.: F13=0x71 … F20=0x78).
 * O web cliente só conhece `BTN_1..8`; o agente traduz para o scan code.
 *
 * `holdMs > 0` → keydown, aguar `holdMs` ms, keyup (o comportamento padrão:
 * segurar ~50 ms). `holdMs === 0` → só keydown (modo "segurar enquanto o
 * dedo está no botão"; o web cliente chama `key-up` ao soltar).
 */
export interface SimulateKeyDownArgs {
  /** `BTN_1..8` (F13–F20). */
  btn: string
  /**
   * Milissegundos a segurar a tecla após o keydown. Padrão: 50.
   * `0` → só keydown (modo "segurar enquanto o dedo está no botão";
   * o cliente envia `key-up` quando solta).
   */
  holdMs?: number
}

export interface SimulateKeyUpArgs {
  btn: string
}

export type ActionName =
  | 'open-app'
  | 'screenshot-full'
  | 'screenshot-crop'
  | 'add-game'
  | 'launch-exe'
  | 'key-down'
  | 'key-up'

export type ActionArgs =
  | OpenAppArgs
  | ScreenshotFullArgs
  | ScreenshotCropArgs
  | AddGameArgs
  | LaunchExeArgs
  | SimulateKeyDownArgs
  | SimulateKeyUpArgs

export interface Action {
  name: ActionName
  args: ActionArgs
}

// ---------- Configuração (web ⇄ agent) ----------

export interface Config {
  screenshotDir: string
  clipDir: string
  /** Apps que aparecem no deck. `enabledApps` fora significa todos desligados. */
  enabledApps: OpenApp[]
  /** Jogos adicionados manualmente (detecção automática não encontrou o .exe). */
  games: GameEntry[]
}

export type ConfigKey = 'screenshotDir' | 'clipDir' | 'enabledApps' | 'games'
export type ConfigScope = 'get' | 'set'

export interface ConfigGet {
  scope: 'get'
  key?: ConfigKey
}

export interface ConfigSet {
  scope: 'set'
  key: ConfigKey
  /**
   * Para `screenshotDir`/`clipDir`, um path; para `enabledApps`, um JSON
   * stringificado (ex. `["discord"]`). O agente grava como recebido.
   */
  value: string
}

export type ConfigMessage = ConfigGet | ConfigSet

// ---------- Ack / Error (agent → web) ----------

export interface Ack {
  /** Identificador do tipo de mensagem que originou o ack. */
  for_: string
  ok: boolean
  detail: string
}

// ---------- Envelope (todas as mensagens) ----------

export interface MessageMetrics {
  type: 'metrics'
  payload: Metrics
}

export interface MessageAction {
  type: 'action'
  payload: Action
}

export interface MessageConfig {
  type: 'config'
  payload: ConfigMessage | Config
}

export interface MessageAck {
  type: 'ack'
  payload: Ack
}

export interface MessageError {
  type: 'error'
  payload: Ack
}

export type Message =
  | MessageMetrics
  | MessageAction
  | MessageConfig
  | MessageAck
  | MessageError

// ---------- Validação ----------

/**
 * Valida uma mensagem recebida contra o contrato.
 *
 * @returns a mensagem tipada, ou `null` se não for válida.
 *
 * Usado pelos dois lados: o agent valida tudo que a web manda; a web valida
 * tudo que o agent manda.
 */
export function validateMessage(raw: unknown): Message | null {
  if (typeof raw !== 'object' || raw === null) return null

  const msg = raw as Partial<Message> & { type?: string }

  switch (msg.type) {
    case 'metrics': {
      const p = msg.payload
      if (
        typeof p?.cpu !== 'number' ||
        typeof p?.ram !== 'number' ||
        typeof p?.ramUsedGB !== 'number' ||
        typeof p?.fps !== 'number' ||
        typeof p?.timestamp !== 'string'
      ) {
        return null
      }
      return { type: 'metrics', payload: p as Metrics }
    }

    case 'action': {
      const p = msg.payload
      if (!p || typeof p.name !== 'string') return null
      const name = p.name
      if (name === 'open-app') {
        if (typeof p.args !== 'object' || p.args === null) return null
        const a = p.args as Record<string, unknown>
        if (a.app !== 'discord' && a.app !== 'obs') return null
      }
      if (name === 'screenshot-crop') {
        const a = p.args as Record<string, unknown> | undefined
        if (
          !a ||
          typeof a.x !== 'number' ||
          typeof a.y !== 'number' ||
          typeof a.width !== 'number' ||
          typeof a.height !== 'number'
        ) {
          return null
        }
      }
      if (name === 'add-game') {
        const a = p.args as Record<string, unknown> | undefined
        if (!a || typeof a.exePath !== 'string' || a.exePath.length === 0) {
          return null
        }
      }
      if (name === 'launch-exe') {
        const a = p.args as Record<string, unknown> | undefined
        if (!a || typeof a.exePath !== 'string' || a.exePath.length === 0) {
          return null
        }
      }
      if (name === 'key-down' || name === 'key-up') {
        const a = p.args as Record<string, unknown> | undefined
        if (!a || typeof a.btn !== 'string' || !a.btn.startsWith('BTN_') || a.btn.length < 5) {
          return null
        }
      }
      // screenshot-full: args podem ser ausentes ou vazio
      return { type: 'action', payload: p as Action }
    }

    case 'config': {
      const p = msg.payload
      if (!p || typeof p !== 'object') return null
      const cfg = p as unknown as Record<string, unknown>
      // Config (agent → web): tem as chaves screenshotDir/clipDir/enabledApps
      if ('screenshotDir' in cfg || 'clipDir' in cfg || 'enabledApps' in cfg) {
        return { type: 'config', payload: p as Config }
      }
      // ConfigMessage (web → agent): tem scope
      if (cfg.scope === 'get' || cfg.scope === 'set') {
        return { type: 'config', payload: p as ConfigMessage }
      }
      return null
    }

    case 'ack': {
      const p = msg.payload
      if (typeof p?.for_ !== 'string' || typeof p?.ok !== 'boolean' || typeof p?.detail !== 'string') {
        return null
      }
      return { type: 'ack', payload: p as Ack }
    }

    case 'error': {
      const p = msg.payload
      if (typeof p?.for_ !== 'string' || typeof p?.ok !== 'boolean' || typeof p?.detail !== 'string') {
        return null
      }
      return { type: 'error', payload: p as Ack }
    }

    default:
      return null
  }
}
