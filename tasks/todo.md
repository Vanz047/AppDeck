# AppDeck — Task List (Fase 1)

> Ordenada por dependência. Cada task deve caber em ~1 sessão e ter um
> critério de aceite claro.

## Fase 1 — Setup do repo

- [x] **T1.1** Criar `package.json` raiz com `workspaces: ["shared","agent","web"]` e scripts `dev`, `test`, `lint`.
  - Aceite: `npm run dev` e `npm test` rodam sem erro (mesmo sem nada pra fazer ainda).
  - Verificação: rodar os dois comandos.
  - Arquivos: `package.json`, `tsconfig.base.json`.

- [x] **T1.2** Criar os 3 workspaces (`shared/`, `agent/`, `web/`) com `tsconfig.json`, `package.json` e `src/` mínimo.
  - Aceite: `npx tsc -b` passa em cada workspace.
  - Verificação: `npx tsc -b` na raiz.
  - Arquivos: `shared/package.json`, `shared/tsconfig.json`, `shared/src/index.ts`; `agent/*`; `web/*`.

- [x] **T1.3** Instalar dev-deps raiz: `typescript`, `vitest`, `@vitest/coverage-v8`, `eslint`.
  - Aceite: `npm test` no raiz executa vitest e passa (smoke test de `shared`).
  - Verificação: rodar `npm test`.
  - Arquivos: `package.json`, `vitest.config.ts`, `shared/test/index.test.ts`.

## Fase 2 — Contrato (`shared/protocol.ts`)

- [x] **T2.1** Escrever `shared/protocol.ts` com tipos `Metrics`, `Action`, `Config`, `Message`.
  - Aceite: `npx tsc` passa; os tipos refletem a seção de "Contrato de mensagem" da `SPEC.md` sem divergência.
  - Verificação: comparar campo a campo com `SPEC.md`.
  - Arquivos: `shared/src/protocol.ts`.

- [x] **T2.2** Escrever `validateMessage(raw: unknown): Message | null` (valida contra o schema).
  - Aceite: teste unitário com 3 casos (métrica válida, action válida, string aleatória → null).
  - Verificação: `npm test -- --coverage` → `shared` 100%.
  - Arquivos: `shared/src/protocol.ts`, `shared/test/protocol.test.ts`.

## Fase 3 — Agente

- [x] **T3.1** `agent/src/metrics.ts`: `getCpuUsage()`, `getRamUsage()` (via `os`), `getFpsForFocusedWindow()` (wrapper puro de `IMetrics`).
  - Aceite: teste unitário mocka `IMetrics`; cada função retorna o formato do `Metrics`.
  - Verificação: `npm test:agent` → `metrics.ts` ≥80%.
  - Arquivos: `agent/src/metrics.ts`, `agent/test/metrics.test.ts`.

- [x] **T3.2** `agent/src/actions.ts`: `openApp(name)` (respeitando `enabledApps`),
  `screenshotFull(dir)`, `screenshotCrop(dir, {x,y,w,h})` — com `IActions`
  (wrapper puro). Lib de captura: `node-screenshots`.
  - Aceite: `openApp('discord')` só abre se `enabledApps` contém `discord`;
    `screenshotFull` salva a tela inteira em `dir` e retorna o caminho;
    `screenshotCrop` recorta 1:1 (sem escala) e salva.
  - Nota: a conversão de escala canvas→PC fica pra fase 2 (junto com as
    ferramentas de anotação).
  - Verificação: teste unitário mocka `IActions` (não abre/tira print de verdade).
  - Arquivos: `agent/src/actions.ts`, `agent/test/actions.test.ts`.

- [x] **T3.3** `agent/src/config.ts`: `loadConfig()`, `saveConfig(patch)` — lê/grava
  `agent/config.json`. `config.json` tem `screenshotDir`, `clipDir` e
  `enabledApps`.
  - Aceite: `loadConfig()` retorna o tipo `Config` completo; `saveConfig` aceita
    patch parcial (ex. só `enabledApps`) e mantém o resto.
  - Verificação: teste unitário com `config.json` fake; depois de `saveConfig`,
    re-read igual ao esperado.
  - Arquivos: `agent/src/config.ts`, `agent/test/config.test.ts`.

- [x] **T3.4** `agent/src/index.ts`: sobe `WebSocketServer` em `:5555`, encaminha `action`/`config.get`/`config.set`, emite `metrics` a cada 1s.
  - Aceite: abre `ws://localhost:5555`, recebe `metrics` a cada ~1s; envia `config.get`, recebe `config`; envia `action` `open-app` com app válido, recebe `ack`.
  - Verificação: teste de integração com um cliente WS fake; e testar a mão abrindo no `wscat`.
  - Arquivos: `agent/src/index.ts`, `agent/test/index.test.ts`.

- [x] **T3.5** `agent/config.json` (template) + `README` do agente (como sobe, como para).
  - Aceite: `npm run dev:agent` sobe e loga a porta.
  - Verificação: rodar e ver o log.
  - Arquivos: `agent/config.json`, `agent/README.md`.

## Fase 4 — Web

- [ ] **T4.1** Setup Vite + React + Tailwind no `web/`.
  - Aceite: `npm run dev:web` sobe em `:5173`; `http://<ip>:5173` abre.
  - Verificação: rodar `npm run dev:web` e abrir no navegador.
  - Arquivos: `web/package.json`, `web/index.html`, `web/src/main.tsx`, `web/src/App.tsx`, `web/vite.config.ts`, `web/tailwind.config.ts`.

- [ ] **T4.2** `web/src/ws.ts`: cliente WebSocket com auto-reconnect (3s) e parse do contrato via `validateMessage`.
  - Aceite: conecta em `ws://localhost:5555` e expõe `on('metrics')`, `on('ack')`, `on('error')`, `on('config')`; emite `action` e `config` corretamente.
  - Verificação: teste unitário mocka o socket; verifica que cada evento chega na callback certa.
  - Arquivos: `web/src/ws.ts`, `web/test/ws.test.ts`.

- [ ] **T4.3** `web/src/components/CpuCard.tsx`, `RamCard.tsx`, `FpsCard.tsx` — exibem o valor, "—" quando `fps === -1`.
  - Aceite: dado um `Metrics`, os cards mostram os números; `FpsCard` mostra "—" se `-1`.
  - Verificação: teste de render (RTL) + screenshot manual.
  - Arquivos: `web/src/components/*.tsx`, `web/test/components.test.tsx`.

- [ ] **T4.4** `web/src/components/ActionButton.tsx` (Discord, OBS, Screenshot) — dispara `action` no `ws`.
  - Aceite: clicar em "Discord" emite `action` `open-app` `discord`.
  - Verificação: teste unitário mocka `ws`; clica; verifica a mensagem.
  - Arquivos: `web/src/components/ActionButton.tsx`, `web/test/ActionButton.test.tsx`.

- [ ] **T4.5** `web/src/components/ConfigPanel.tsx` — lê `config`, deixa alterar `screenshotDir`, grava via `config.set`.
  - Aceite: `screenshotDir` aparece; edita e salva; o `config` vindo do agente reflete.
  - Verificação: teste unitário mocka `ws` (envia `config.get` no mount, `config.set` no save).
  - Arquivos: `web/src/components/ConfigPanel.tsx`, `web/test/ConfigPanel.test.tsx`.

- [ ] **T4.6** `web/src/App.tsx` — monta tudo, conecta ao WS, layout de celular.
  - Aceite: abre no celular e mostra os 3 cards + 3 botões + ConfigPanel.
  - Verificação: teste manual (celular → `http://ip:5173`), agent em `:5555`.
  - Arquivos: `web/src/App.tsx`.

## Fase 5 — E2E

- [ ] **T5.1** Subir o agente num PC, abrir a web num celular na mesma rede, e validar o checklist da `SPEC.md` (sucesso + critérios de reprise).
  - Aceite: todos os itens de `SPEC.md` "Critérios de sucesso" marcados como ✅.
  - Verificação: checklist escrito (não code review).
  - Arquivos: `tasks/e2e-checklist.md` (novo).

- [ ] **T5.2** Atualizar `SPEC.md` marcando os critérios de sucesso como completos, e registrar a conclusão em `CHANGELOG.md`.
  - Aceite: `CHANGELOG.md` tem uma entry "fase 1 concluída".
  - Verificação: abrir `CHANGELOG.md` e conferir.
  - Arquivos: `CHANGELOG.md`, `SPEC.md`.

---

## Riscos (resumo)

| Risco | Onde aparece |
|---|---|
| FPS via API nativa do Windows (não tem "API de FPS" em Node) | T3.1 |
| Screenshot: qual lib? | T3.2 |
| `openApp` precisa de `shellexecute` (Windows) | T3.2 |
| `ConfigPanel` com path Windows (espaços, aspas) | T4.5 |
| Rede Wi-Fi diferente | T5.1 |

## O que **não** entra (fase 1)

- Anúncio, login, multi-usuário, loja, acesso remoto, combo de teclas, Mac/Linux.
- Se qualquer um desses entrar, primeiro edita a `SPEC.md`.
