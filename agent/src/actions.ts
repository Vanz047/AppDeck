// agent/actions — abre apps, tira screenshot e gerencia jogos manuais no PC.
//
// O I/O fica atrás da interface IActions (wrapper puro). Testes mockam;
// runtime usa a implementação real.

import { spawn } from 'node:child_process'
import { platform } from 'node:os'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import { Monitor } from 'node-screenshots'

import type { Config, GameEntry, AddGameArgs } from 'shared'

import { saveConfig } from './config.js'
import { simulateKeyHold, releaseKey, BTN_SCANCODES, KeyResult } from './keyboard.js'

export interface IActions {
  openApp(name: 'discord' | 'obs', config: Config): Promise<AckResult>
  screenshotFull(dir: string, config: Config): Promise<AckResult>
  screenshotCrop(
    dir: string,
    crop: { x: number; y: number; width: number; height: number },
    config: Config,
  ): Promise<AckResult>
  /**
   * Registra um jogo manual: valida que `exePath` aponta para um `.exe`
   * existente na máquina e adiciona a `config.games`. O estado fica no agente
   * (dono do `config.json`) — a web só pede e recebe o `ack`.
   */
  addGame(game: AddGameArgs, config: Config): Promise<AckResult>
  /** Abre um jogo pelo caminho do .exe. Não exige registro prévio. */
  launchExe(exePath: string, config: Config): Promise<AckResult>
  /**
   * Simula uma tecla do deck ("tecla nova"). `btn` é `BTN_1..8` → F13–F20.
   * `holdMs > 0` segura a tecla por esse tempo; `holdMs === 0` só emite
   * keydown (modo "segurar enquanto o dedo está no botão").
   */
  keyDown(btn: string, holdMs: number, config: Config): Promise<AckResult>
  /** Solta uma tecla do deck (o cliente chama quando o dedo sai do botão). */
  keyUp(btn: string, config: Config): Promise<AckResult>
}

export interface AckResult {
  ok: boolean
  detail: string
}

async function openWindows(uriOrCmd: string): Promise<AckResult> {
  return new Promise((resolve) => {
    const proc = spawn('cmd', ['/c', 'start', '', uriOrCmd])
    let settled = false
    const finish = (r: AckResult) => {
      if (settled) return
      settled = true
      resolve(r)
    }
    proc.on('error', (err) => {
      finish({ ok: false, detail: `start failed: ${err.message}` })
    })
    proc.on('exit', (code) => {
      finish(
        code === 0
          ? { ok: true, detail: `opened ${uriOrCmd}` }
          : { ok: false, detail: `start exited with code ${code}` },
      )
    })
    setTimeout(() => {
      finish({ ok: false, detail: 'timeout waiting for start' })
    }, 5000)
  })
}

function resolveAppTarget(name: 'discord' | 'obs'): string {
  return name === 'discord' ? 'discord:/' : 'obs-studio.exe'
}

export class SystemActions implements IActions {
  async openApp(name: 'discord' | 'obs', config: Config): Promise<AckResult> {
    if (!config.enabledApps.includes(name)) {
      return { ok: false, detail: `${name} is disabled in settings` }
    }
    if (platform() !== 'win32') {
      return { ok: false, detail: 'phase 1 targets Windows only' }
    }
    return openWindows(resolveAppTarget(name))
  }

  async screenshotFull(
    dir: string,
    config: Config,
  ): Promise<AckResult> {
    return capture(dir, null)
  }

  async screenshotCrop(
    dir: string,
    crop: { x: number; y: number; width: number; height: number },
    config: Config,
  ): Promise<AckResult> {
    return capture(dir, crop)
  }

  async addGame(game: AddGameArgs, config: Config): Promise<AckResult> {
    if (!game || typeof game.exePath !== 'string' || game.exePath.length === 0) {
      return { ok: false, detail: 'add-game: exePath is required' }
    }
    if (platform() !== 'win32') {
      return { ok: false, detail: 'add-game: phase 1 targets Windows only' }
    }
    const ext = path.extname(game.exePath).toLowerCase()
    if (ext !== '.exe') {
      return { ok: false, detail: `add-game: only .exe supported, got "${ext}"` }
    }
    try {
      const s = await stat(game.exePath)
      if (!s.isFile()) {
        return { ok: false, detail: `add-game: ${game.exePath} is not a file` }
      }
    } catch {
      return {
        ok: false,
        detail: `add-game: ${game.exePath} not found on this machine`,
      }
    }
    const entry: GameEntry = {
      name: game.name || path.basename(game.exePath, '.exe'),
      exePath: game.exePath,
      platform: game.platform || 'Manual',
    }
    await saveConfig({ games: [...(config.games ?? []), entry] })
    return { ok: true, detail: `registered ${entry.name}` }
  }

  async launchExe(exePath: string, config: Config): Promise<AckResult> {
    if (platform() !== 'win32') {
      return { ok: false, detail: 'launch-exe: phase 1 targets Windows only' }
    }
    if (!exePath || typeof exePath !== 'string') {
      return { ok: false, detail: 'launch-exe: exePath is required' }
    }
    try {
      await stat(exePath)
    } catch {
      return { ok: false, detail: `launch-exe: ${exePath} not found` }
    }
    return openWindows(exePath)
  }

  async keyDown(btn: string, holdMs: number, config: Config): Promise<AckResult> {
    if (platform() !== 'win32') {
      return { ok: false, detail: 'key-down: phase 1 targets Windows only' }
    }
    const code = BTN_SCANCODES[btn]
    if (code === undefined) {
      return { ok: false, detail: `key-down: unknown btn "${btn}" (expect BTN_1..8)` }
    }
    const hold = Number.isFinite(holdMs) && holdMs >= 0 ? Math.round(holdMs) : 50
    const r: KeyResult = await simulateKeyHold(code, hold)
    return {
      ok: r.ok,
      detail: `key-down ${btn} (${r.detail})${hold > 0 ? `, held ${hold}ms` : ''}`,
    }
  }

  async keyUp(btn: string, config: Config): Promise<AckResult> {
    if (platform() !== 'win32') {
      return { ok: false, detail: 'key-up: phase 1 targets Windows only' }
    }
    const code = BTN_SCANCODES[btn]
    if (code === undefined) {
      return { ok: false, detail: `key-up: unknown btn "${btn}" (expect BTN_1..8)` }
    }
    const r: KeyResult = await releaseKey(code)
    return { ok: r.ok, detail: `key-up ${btn} (${r.detail})` }
  }
}

/**
 * Captura a tela do monitor principal via `node-screenshots` e, se `crop`
 * for especificado, recorta a região usando `Image.crop()` nativo (eficiente).
 *
 * Na fase 1, o crop usa coordenadas 1:1 (sem escala canvas→PC — fase 2).
 */
async function capture(
  dir: string,
  crop: { x: number; y: number; width: number; height: number } | null,
): Promise<AckResult> {
  try {
    await mkdir(dir, { recursive: true })
    const monitors = Monitor.all()
    const primary = monitors.find((m) => m.isPrimary()) ?? monitors[0]
    const image = await primary.captureImage()

    // crop nativo via Image.cropSync (mais rápido que crop assíncrono pra
    // pixel count alto — não há I/O no crop, é só ponteiro).
    const finalImage =
      crop && image.width >= crop.x + crop.width && image.height >= crop.y + crop.height
        ? image.cropSync(crop.x, crop.y, crop.width, crop.height)
        : image

    const buffer = await finalImage.toPng()
    const base = `appdeck-${Date.now()}-${randomUUID().slice(0, 8)}`
    const suffix = crop
      ? ` ${crop.x},${crop.y} ${crop.width}x${crop.height}`
      : ''
    const filePath = path.join(dir, `${base}${suffix}.png`)
    await writeFile(filePath, buffer)
    return {
      ok: true,
      detail: crop
        ? `screenshot-crop saved (crop ${crop.x},${crop.y} ${crop.width}x${crop.height}, scale 1:1 — escala em fase 2): ${filePath}`
        : `screenshot-full saved to ${filePath}`,
    }
  } catch (err) {
    return {
      ok: false,
      detail: `screenshot failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

export const defaultActions: IActions = new SystemActions()
