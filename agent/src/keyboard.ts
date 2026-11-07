// agent/keyboard — emula teclas via `SendInput` com `KEYEVENTF_SCANCODE`.
//
// Muitos jogos usam Raw Input ou DirectInput; essas camadas ignoram
// simulação por virtual-key code. Só o scancode HID (KEYEVENTF_SCANCODE)
// chega até elas. A chamada `SendInput` fica isolada aqui para os testes
// mockarem sem tocar em native modules.

import { createRequire } from 'node:module'

// `node:` prefix só serve pra builtin do Node; native module não tem.
const req = createRequire(import.meta.url)

type SendInputFn = (
  inputs: Array<{ scan: number; up: boolean; flags: number }>,
  count: number,
  cbSize: number,
) => number

// `SendInput(nInputs, pInputs, cbSize)` devolve o nº de inputs inseridos.
// O add-on N-API (`agent/native/sendinput.cpp`) é compilado por `node-gyp`
// (ver `agent/native/binding.gyp` e o script `build:native` em package.json);
// o ponte JS (`agent/native/sendinput.js`) tenta carregar o `.node` e, se
// não existe, delega a um no-op. Para desenvolvimento sem native build,
// toleramos essa ausência.
let sendInputImpl: SendInputFn | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = req('../native/sendinput.cjs') as
    | SendInputFn
    | { default?: unknown; sendInput?: SendInputFn }
  // `sendinput.cjs` (ponte) exporta a função direta no modo stub/no-op;
  // quando o `.node` real é carregado ele devolve o add-on N-API
  // (`module.exports` = função registrada via `NAPI_MODULE`). Tratamos as
  // duas formas: função direta, ou objeto com `.sendInput`/`.default`.
  const fn: unknown =
    typeof mod === 'function' ? mod : (mod.sendInput ?? mod.default)
  if (typeof fn === 'function') sendInputImpl = fn as SendInputFn
} catch {
  sendInputImpl = null
}

/**
 * Scan codes Set 2 (PS/2 estendido) das teclas F13–F20.
 *
 * Com `KEYEVENTF_SCANCODE` o valor em `wScan` **precisa** ser o Set 2
 * completo, com o bit estendido (0x80) incluído — senão o driver injeta a
 * tecla "errada". F13–F20 são a linha de F-keys extras, estendidas.
 *
 * Não estão no teclado físico do usuário mas são reconhecidos pelo Windows
 * (padrão HID / PS/2 set 2) — por isso não conflitam com nada.
 *
 * - F13: 0x87 · F14: 0x88 · F15: 0x89 · F16: 0x8A
 * - F17: 0x8B · F18: 0x8C · F19: 0x8D · F20: 0x8E
 */
export const BTN_SCANCODES: Record<string, number> = {
  BTN_1: 0x87,
  BTN_2: 0x88,
  BTN_3: 0x89,
  BTN_4: 0x8a,
  BTN_5: 0x8b,
  BTN_6: 0x8c,
  BTN_7: 0x8d,
  BTN_8: 0x8e,
}

export const KEYEVENTF_KEYUP = 0x0002
export const KEYEVENTF_SCANCODE = 0x0008

export interface KeyResult {
  ok: boolean
  detail: string
}

/**
 * Emite um `SendInput` com KEYEVENTF_SCANCODE para o scancode indicado.
 *
 * - `up === false` → keydown (KEYEVENTF_SCANCODE)
 * - `up === true`  → keyup   (KEYEVENTF_SCANCODE | KEYEVENTF_KEYUP)
 *
 * Retorna `{ ok, detail }`; `detail` traz diagnóstico (inputs enviados,
 * ou erro do native module).
 */
export function sendScancode(code: number, up: boolean): KeyResult {
  if (!sendInputImpl) {
    return { ok: false, detail: 'sendinput native module not available' }
  }
  try {
    const flags = KEYEVENTF_SCANCODE | (up ? KEYEVENTF_KEYUP : 0)
    const inputs = [{ scan: code, up, flags }]
    const n = sendInputImpl(inputs, 1, 80) // 80 = sizeof(INPUT) em x64
    return n === 1
      ? { ok: true, detail: up ? 'keyup sent' : 'keydown sent' }
      : { ok: false, detail: `SendInput inserted ${n}/1 event(s)` }
  } catch (err) {
    return {
      ok: false,
      detail: `SendInput threw: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

/**
 * Pressiona e segura a tecla por `holdMs` milissegundos.
 *
 * - `holdMs > 0`  → keydown, aguarda `holdMs`, keyup (comportamento padrão).
 * - `holdMs === 0` → só keydown (modo "segurar enquanto o dedo está no
 *   botão": o cliente chama `key-up` depois para soltar).
 */
export async function simulateKeyHold(
  code: number,
  holdMs = 50,
): Promise<KeyResult> {
  if (!Number.isInteger(code) || code < 0 || code > 0xffff) {
    return { ok: false, detail: `invalid scancode 0x${code?.toString(16)}` }
  }
  const down = sendScancode(code, false)
  if (!down.ok) return down
  if (holdMs <= 0) return down
  await new Promise((r) => setTimeout(r, holdMs))
  const up = sendScancode(code, true)
  if (!up.ok) {
    // keydown chegou mas keyup falhou — tenta um up redundante pra não
    // deixar a tecla "presa" no estado interno do OS.
    sendScancode(code, true)
  }
  return up
}

/** Solta a tecla (chamada pelo cliente ao tirar o dedo do botão). */
export async function releaseKey(code: number): Promise<KeyResult> {
  if (!Number.isInteger(code) || code < 0 || code > 0xffff) {
    return { ok: false, detail: `invalid scancode 0x${code?.toString(16)}` }
  }
  return sendScancode(code, true)
}
