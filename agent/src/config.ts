// agent/config — lê/grava `agent/config.json` (config por máquina).
//
// O contrato de config vive em `shared` (o mesmo tipo que a web importa).
// O agente é o dono do estado: a web só manda `config.get` / `config.set`.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { Config, OpenApp, GameEntry } from 'shared'

/** Patch parcial aceito por `saveConfig` — chaves desconhecidas são ignoradas. */
export type ConfigPatch = Partial<Config>

const CONFIG_PATH = new URL('../config.json', import.meta.url)

export const DEFAULT_CONFIG: Config = {
  screenshotDir: `${process.env.USERPROFILE ?? ''}\\AppDeck\\shots`,
  clipDir: `${process.env.USERPROFILE ?? ''}\\AppDeck\\clips`,
  enabledApps: ['discord', 'obs'],
  games: [],
}

/** Carrega `config.json`, mesclando com `DEFAULT_CONFIG` (campos ausentes). */
export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf8')
    const parsed = JSON.parse(raw) as Partial<Config>
    const enabledApps = Array.isArray(parsed.enabledApps)
      ? (parsed.enabledApps as OpenApp[]).filter((a) => a === 'discord' || a === 'obs')
      : DEFAULT_CONFIG.enabledApps
    const games = Array.isArray(parsed.games)
      ? (parsed.games as GameEntry[]).filter(
          (g) => g && typeof g.exePath === 'string' && g.exePath.length > 0,
        )
      : DEFAULT_CONFIG.games
    return {
      screenshotDir:
        typeof parsed.screenshotDir === 'string'
          ? parsed.screenshotDir
          : DEFAULT_CONFIG.screenshotDir,
      clipDir:
        typeof parsed.clipDir === 'string' ? parsed.clipDir : DEFAULT_CONFIG.clipDir,
      enabledApps,
      games,
    }
  } catch {
    // Arquivo ausente/corrompido → defaults. Garante que o agente sempre sobe.
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * Grava um patch parcial em `config.json` (mantém o resto).
 * O patch só aceita as chaves do `Config` — chaves desconhecidas são
 * ignoradas (defesa contra `config.set` malicioso).
 */
export async function saveConfig(patch: ConfigPatch): Promise<Config> {
  const current = await loadConfig()
  const next: Config = {
    ...current,
    ...pickDefined(patch),
  }
  const dir = dirname(CONFIG_PATH.href)
  await mkdir(dir, { recursive: true })
  await writeFile(CONFIG_PATH, JSON.stringify(next, null, 2) + '\n', 'utf8')
  return next
}

function pickDefined(patch: Partial<Config>): Partial<Config> {
  const out: Partial<Config> = {}
  if (typeof patch.screenshotDir === 'string') out.screenshotDir = patch.screenshotDir
  if (typeof patch.clipDir === 'string') out.clipDir = patch.clipDir
  if (Array.isArray(patch.enabledApps)) {
    out.enabledApps = (patch.enabledApps as OpenApp[]).filter(
      (a) => a === 'discord' || a === 'obs',
    )
  }
  if (Array.isArray(patch.games)) {
    out.games = (patch.games as GameEntry[]).filter(
      (g) => g && typeof g.exePath === 'string' && g.exePath.length > 0,
    )
  }
  return out
}
