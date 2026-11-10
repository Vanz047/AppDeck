# Spec: AppDeck — Fase 1 (rede local, web-first, agente no PC)

## Objetivo

Construir a **fase 1** do AppDeck — um "Stream Deck portátil" que roda na
rede local. O usuário final (o jogador/streamer) abre a interface web no
celular e:

- vê **CPU / RAM / FPS do PC em tempo real** (atualização ~1s), e
- dispara **ações rápidas** (ex.: abrir um app ou tirar screenshot) sem
  sair do jogo.

### História de usuário (aceitação)

> Como jogador, estou jogando no meu PC, abro o AppDeck no celular na mesma
> rede Wi-Fi, vejo a saúde da máquina (CPU/RAM/FPS) atualizando sozinha, e
> toco em "abrir Discord" — o Discord abre no PC sem eu ter que levantar da
> cadeira.

### Sucesso (concreto e testável)

- [ ] O celular, abrindo `http://<ip-do-pc>:<porta>`, exibe CPU/RAM/FPS
      atualizando a cada ~1s.
- [ ] Tocar em um botão dispara a ação correspondente no PC (abrir app ou
      screenshot).
- [ ] Tudo funciona na rede local sem login, sem multi-usuário, sem anúncio.

### Fora de escopo (fase 1 — não entra no código)

- Login / conta / multi-usuário.
- Anúncio e plano pago.
- Instalação em loja (Play / App Store).
- Acesso remoto fora da rede local (Tailscale / túnel).
- Atalho de combo de teclas (só "abrir app" e "screenshot").
- Mac / Linux (só Windows 10/11, 64-bit).
- Captura de **clipe de vídeo** (só screenshot nesta fase).

### Decisão fechada (fase 1)

- **Configurações (web):** um menu de configurações onde o usuário define os
  caminhos de saída (screenshots, e depois clipes). Os valores vivem no
  **agente** (persistidos em `agent/config.json`), e a web fala com o agente
  pra ler/gravar — não há state local no celular.
- O menu de configurações é parte da fase 1 (não é adiado).
- **Apps habilitáveis/desabilitáveis:** `config.enabledApps` no agente, com
  UI na web (Discord, OBS) pra ligar/desligar.
- **Modo de screenshot (fase 1):** `screenshot-full` (instantâneo, de
  verdade). `screenshot-crop` recorta 1:1 sem escala na fase 1; a
  conversão de escala canvas→PC fica pra **fase 2** (junto com as
  ferramentas de anotação: lápis/retângulo/círculo/cores).

---

## Mapa de capacidades

```markdown
| Módulo | Responsabilidade            | Depende de            |
|--------|-----------------------------|-----------------------|
| agent  | Coleta métricas + executa ações no PC, expõe WS | —                 |
| web    | Exibe métricas + botões no celular        | agent (contrato WS)   |
```

Ordem de build: `agent` → `web`. `web` não compila sem o contrato do `agent`
sendo estável, então o contrato abaixo é a fronteira.

## Contrato de mensagem (fronteira `agent` ⇄ `web`)

Protocolo: **WebSocket**, mensagem JSON. Porta padrão: `5555` (ajustável).
Autenticação: **nenhuma** (rede local, fase 1).

### Cliente (web) → Servidor (agent)

```json
{ "type": "action",  "payload": { "name": "open-app" | "screenshot-full" | "screenshot-crop", "args": { ... } } }
{ "type": "config",  "payload": { "scope": "get" | "set", "key": "screenshotDir" | "clipDir" | "enabledApps", "value": "..." } }
```

- `open-app` → `args: { "app": "discord" }` (enum: `discord`, `obs`). Só roda se o
  app estiver ligado em `config.enabledApps`; senão `ack.ok: false`.
- `screenshot-full` → `args: {}`. Captura instantânea da tela inteira; salva em
  `config.screenshotDir`; `agent` responde o caminho no `ack`.
- `screenshot-crop` → `args: { "x": 0, "y": 0, "width": 640, "height": 480 }`.
  A web mostra a tela inteira num canvas, o usuário arrasta pra selecionar a
  área e envia as coordenadas; `agent` recorta a região e salva em
  `config.screenshotDir`.
  - **Nota de fase:** a conversão de escala canvas→tela do PC (necessária
    pra `screenshot-crop` funcionar quando o celular e o PC têm resoluções
    diferentes) fica pra **fase 2**. Na fase 1, `screenshot-crop` recorta
    1:1 (coordenadas em pixels da tela do PC, sem escala).
- `config.get` → `agent` responde um `config` com os valores atuais.
- `config.set` → `agent` grava em `config.json`, responde `ack` com os novos valores.

### Servidor (agent) → Cliente (web)

- O `agent` emite `metrics` a cada **1s** pra todos os clientes conectados.
- Emite `config` após `config.get` / `config.set`, e `ack` / `error` por
  `action`.

```json
{ "type": "metrics", "payload": {
  "cpu": 37.2,        // % 0-100
  "ram": 61.4,        // % 0-100
  "ramUsedGB": 9.8,
  "fps": 142,         // do processo focado; -1 se não detectado
  "timestamp": "2026-11-03T20:00:00Z"
} }
{ "type": "config",  "payload": { "screenshotDir": "C:\\Users\\user\\AppDeck\\shots", "clipDir": "C:\\Users\\user\\AppDeck\\clips" } }
{ "type": "ack",     "payload": { "for": "action", "ok": true,  "detail": "discord opened" } }
{ "type": "error",   "payload": { "for": "action", "ok": false, "detail": "app not found" } }
```

```json
{ "type": "metrics", "payload": {
  "cpu": 37.2,        // % 0-100
  "ram": 61.4,        // % 0-100
  "ramUsedGB": 9.8,
  "fps": 142,         // do processo focado; -1 se não detectado
  "timestamp": "2026-11-03T20:00:00Z"
} }
```

- O `agent` emite `metrics` a cada **1s** pra todos os clientes conectados.
- `agent` também emite um `ack` / `error` por `action` recebida:

```json
{ "type": "ack",  "payload": { "for": "action", "ok": true,  "detail": "discord opened" } }
{ "type": "error","payload": { "for": "action", "ok": false, "detail": "app not found" } }
```

---

## Stack

| Camada  | Escolha                                             |
|---------|-----------------------------------------------------|
| Agente  | Node.js 20+ / TypeScript, `ws` (WebSocket Server)  |
| Métricas| `os` (CPU/RAM), API nativa do SO pra FPS           |
| Ações   | abrir app via `child_process`/shellexecute; screenshot via lib nativa |
| Config  | `agent/config.json` (per-machine) + UI de configurações na web |
| Web     | React 18 + Vite, `ws` client, Tailwind             |
| Testes  | `vitest` (agent e web), `playwright` (e2e, opcional) |

## Comandos

```
# Agente (PC)
npm run dev:agent    # sobe o WebSocket Server em modo watch
npm run build:agent  # compila TS → dist
npm test:agent       # roda testes do agente

# Web (celular)
npm run dev:web      # sobe o dev server do Vite
npm run build:web    # build de produção
npm test:web         # roda testes da web

# Raiz
npm run dev          # sobe agent + web juntos (workspaces)
npm test             # sobe todos os testes
npm run lint         # eslint em tudo
```

## Estrutura de projeto

```
agent/          → código do agente (Node/TS)
  src/
    index.ts      # boot: WS server + loop de métricas
    metrics.ts    # coleta CPU/RAM/FPS
    actions.ts    # abre app / screenshot
    config.ts     # lê/grava config.json
  config.json     # config por máquina (screenshotDir, clipDir)
  test/

web/            → interface web (React/Vite)
  src/
    App.tsx
    ws.ts         # cliente WebSocket
    components/   # Cards de métrica, Botões, Configurações
  test/

shared/         → tipos do contrato (importados pelos dois lados)
  protocol.ts     # Message, Action, Metrics, Config
```

## Estilo de código

```typescript
// shared/protocol.ts — exemplo de tipo
export interface Metrics {
  cpu: number
  ram: number
  ramUsedGB: number
  fps: number
  timestamp: string
}

// Regras:
// - TS estrito (noImplicitAny, strictNullChecks).
// - Nomes camelCase, tipos em PascalCase, módulos em kebab-case.
// - Nenhuma dependência de runtime além das já nomeadas acima.
// - Funções puras onde possível (fácil testar); I/O isolado em wrappers.
```

## Estratégia de testes

- **Unidade** (vitest): `metrics.ts`, `actions.ts` e `config.ts` com I/O mockado;
  `ws.ts` da web mockando o socket.
- **Contrato**: um teste que valida cada mensagem do contrato acima contra o
  `shared/protocol.ts` — protege a fronteira `agent`⇄`web`.
- **Manual / e2e**: checklist na seção de sucesso (abrir no celular, ver
  métricas, tocar botão, configurar pasta de screenshot). `playwright` opcional.
- **Cobertura-alvo**: > 80% nos módulos `metrics`, `actions` e `config`.

## Fronteiras (Boundaries)

- **Sempre:** roda teste antes de commit; valida entrada (mensagem WS vinda do
  cliente é untrusted — valida `payload.name` contra o enum).
- **Pergunta primeiro:** troca de porta, nova métrica, novo tipo de `action`,
  qualquer nova dependência de runtime.
- **Nunca:** commit de segredo / token; log de informação sensível; remover
  teste que falha sem aprovação.

## Critérios de sucesso (reprise)

- [ ] Agente sobe e mantém WebSocket no `:5555` (ou configurada).
- [ ] Emite `metrics` a cada 1s com CPU, RAM, FPS corretos.
- [ ] Responde a `action` `open-app` abrindo o app pedido; `screenshot`
      salva em `config.screenshotDir` e retorna o caminho no `ack`.
- [ ] A web abre `http://<ip>:<porta>`, mostra os três cards atualizando, e
      os botões disparam as ações.
- [ ] A web expõe um menu de configurações onde o usuário lê/altera
      `screenshotDir` (e `clipDir`, fase 2); os valores persistem no
      `agent/config.json`.
- [ ] Testes do contrato passam do lado `agent` e do lado `web`.

## Decisões fechadas

1. Porta padrão do agente: **`5555`** (ajustável via `PORT`).
2. FPS sem janela de jogo focada: **`-1`** (o card mostra "—").
3. Pasta de saída: **configurável** pela UI de configurações na web; valores
   persistidos em `agent/config.json`. Padrão inicial:
   `C:\Users\<user>\AppDeck\shots` (screenshot) e
   `C:\Users\<user>\AppDeck\clips` (clipe, fase 2).
4. Nome do campo no `ack`/`error`: a spec usa `for` (a palavra que diz de
   qual tipo de mensagem o `ack` se originou), mas `for` é reservada em
   TypeScript. O código usa **`for_`**; os dois lados importam o tipo de
   `shared/protocol.ts`, então a fronteira fica explícita.
4. Apps de `open-app` (fase 1): **Discord e OBS**. Browser removido — sem
   necessidade por enquanto.
