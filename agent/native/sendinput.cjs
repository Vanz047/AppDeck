// agent/native/sendinput — ponte entre `keyboard.ts` e o add-on N-API.
//
// O `keyboard.ts` faz `require('../native/sendinput.cjs')` e chama a função
// `sendInput(inputs, count, cbSize) -> number`. Esse arquivo tenta carregar
// o binário compilado (`sendinput.node`) quando existe; se não (dev sem
// native build), delega a um no-op que devolve 0, e o `keyboard.ts` reporta
// `ok: false` com um detail diagnóstico.
//
// Para compilar o binário de verdade:
//   cd agent && npx node-gyp rebuild --directory .
// Gera `build/Release/sendinput.node`.
//
// O arquivo é `.cjs` (CommonJS explícito) porque `agent/package.json` tem
// `"type":"module"` — com `.js` o Node trataria como ESM e `module.exports`
// quebraria. O `keyboard.ts` carrega via `createRequire`, que respeita o
// sufixo `.cjs` como CJS e devolve a função direto (sem `.default`).

const path = require('node:path')

// Caminhos possíveis para o .node (ordem: mesmo dir, depois build/Release).
const candidatePaths = [
  path.join(__dirname, 'sendinput.node'),
  path.join(__dirname, '..', 'build', 'Release', 'sendinput.node'),
  path.join(__dirname, '..', 'build', 'Debug', 'sendinput.node'),
]

let native = null
for (const p of candidatePaths) {
  try {
    native = require(p)
    break
  } catch {
    native = null
  }
}

function noop() {
  return 0
}

// O add-on N-API exporta um objeto `{ sendInput, name, platform }`. Se
// carregou, usamos o `sendInput`; senão, o no-op.
const fn =
  native && typeof native.sendInput === 'function'
    ? native.sendInput.bind(native)
    : noop

// Exporta a função SEMPRE como `module.exports` (CJS) — o chamador (ESM)
// faz `createRequire` e espera a função direto, sem `.default`.
module.exports = fn
module.exports.native = !!native // diagnóstico: true se o .node foi achado
module.exports.nativePath = native ? candidatePaths[0] : null
