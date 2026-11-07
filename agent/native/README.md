# agent/native — add-on N-API `SendInput`

Emulação de teclas (F13–F20, expostas como `BTN_1..8`) via a Win32 API
`SendInput`, com `KEYEVENTF_SCANCODE`. O C++ compila para um `.node` que o
agente carrega; sem ele, um **fallback em JS** mantém o pipeline rodando.

## Por quê scan code e não virtual-key

Jogos usam Raw Input / DirectInput; essas camadas **ignoram** teclas
simuladas por virtual-key code (`wVk`). Só o scancode HID
(`KEYEVENTF_SCANCODE`) chega até elas. Por isso o `keyboard.ts` injeta via
`wScan`, não `wVk`.

> **Limitação honesta:** `SendInput` com scancode dá a *melhor* chance de
> funcionar, mas **não é garantia** — jogos em fullscreen exclusivo e
> anti-cheats podem bloquear injeção de teclado de qualquer forma. O
> binário garante a chamada correta à Win32; a aceitação depende do jogo.

## Arquivos

| Arquivo | Papel |
|---|---|
| `sendinput.cpp` | O add-on N-API: expõe `sendInput(inputs, count, cbSize) -> number`. |
| `binding.gyp` | Recipe do `node-gyp` (Windows; linka `user32.lib`). |
| `sendinput.cjs` | Ponte: carrega o `.node` se existir, senão usa um no-op. |

## Compilar

Requer **Visual Studio com "Desktop development with C++"** e Python 3.

```bash
cd D:\Claude\Projetos\appdeck\agent
npx node-gyp rebuild --directory .
# Gera: agent/build/Release/sendinput.node
```

O `npm install` do workspace já tenta compilar (script `postinstall`), mas
é **tolerante a falha** — sem toolchain, cai no stub e segue.

## Como o agente encontra o binário

O `sendinput.cjs` procura, nesta ordem:

1. `agent/native/sendinput.node`
2. `agent/build/Release/sendinput.node`
3. `agent/build/Debug/sendinput.node`

Se nenhum existir, `module.exports` é um no-op que devolve `0` — o
`keyboard.ts` então reporta `{ ok: false, detail: 'SendInput inserted
0/1 event(s)' }`.

## Verificar se compilou

```bash
cd D:\Claude\Projetos\appdeck\agent
node -e "const f=require('./native/sendinput.cjs');console.log('nativo:',f.native)"
# nativo: false → usando stub · nativo: true → .node carregado
```
