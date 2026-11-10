# AppDeck — Plano de Implementação (Fase 1)

> Insumo: `SPEC.md` (aprovada). Este plano organiza o que precisa ser
> construído, em que ordem, e com quais riscos. Não é um task list — é o
> mapa que ele vai alimentar.

## Ordem de implementação (dependência)

```
1. Setup do repo (workspaces, TS, testes)
   ↓
2. shared/protocol.ts  (tipos do contrato)
   ↓
3. agent/ (métricas + ações + config + WS server)
   ↓
4. web/ (cliente WS + cards + botões + configurações)
   ↓
5. e2e: validar no celular real
```

**Por que essa ordem:** `shared` é o contrato — sem ele, os dois lados
não falam a mesma língua. `agent` vem antes de `web` porque `web` precisa
de um `agent` rodando pra testar de verdade.

## Fase 1 — Setup do repositório

**O que:**
- `package.json` raiz com `workspaces: ["shared", "agent", "web"]`.
- `tsconfig.json` base + `tsconfig.json` em cada workspace.
- Instalar `vitest`, `@vitest/coverage-v8`, `eslint`.
- Scripts: `npm run dev`, `npm test`, `npm run lint`.

**Média de esforço:** ~1h. 3–5 arquivos tocados.

**Risco:** baixo. Padrão de mercado, nenhum ponto controverso.

---

## Fase 2 — `shared/protocol.ts`

**O que:**
- Tipos `Metrics`, `Action`, `Config`, `Message` (union de `metrics`,
  `action`, `config`, `ack`, `error`).
- `validateMessage(raw: unknown): Message` — função pura que valida a
  mensagem contra o schema (pré-condição pra web e agent usarem o mesmo
  contrato).

**Média de esforço:** ~1h. 1 arquivo tocado.

**Risco:** **baixo**, mas **crítico** — qualquer bug aqui propaga pros
dois lados. Teste de contrato (fase 4 e 5) é o que protege essa fronteira.

---

## Fase 3 — `agent/`

**Módulos (cada um uma sub-fase):**

### 3a. `metrics.ts`
- `getCpuUsage()`, `getRamUsage()`, `getFpsForFocusedWindow()`.
- Wrapper pra API nativa do SO (Windows: `perfCounter`/`win32` ou
  polling via `os.cpus()` + `os.totalmem()`; FPS exige `node` nativo
  ou `child_process` pra ler o process focado).
- Loop `setInterval(1s)` que emite `metrics` pro WS.

### 3b. `actions.ts`
- `openApp(name)` — `child_process` + `shellexecute` ou `start`
  (Windows).
- `screenshot(dir)` — usa lib nativa (`napi`/`screenshot-desktop` ou
  similar) pra salvar em `dir`.

### 3c. `config.ts`
- `loadConfig()`, `saveConfig()` — lê/grava `config.json`.
- Chaves: `screenshotDir`, `clipDir` (fase 2).

### 3d. `index.ts` (bootstrap)
- Sobe `WebSocketServer` em `:5555`.
- Encaminha `action` → `actions.ts`; `config.get/set` → `config.ts`.
- Responde `ack` / `error`.

**Média de esforço:** ~4h total. ~8 arquivos tocados.

**Risco:** **médio-alto**. Duas coisas podem dar dor de cabeça:
1. **FPS do processo focado** — ler a janela focada em Node exige
   `win32` (chamada nativa). Alternativa: usar `child_process` pra
   `tasklist` e estimar; menos preciso, mais simples.
2. **Screenshot** — a lib ideal depende de qual o Windows expõe. Se não
   houver, fallback pra `node-screenshots` ou até capturar via API do
   OBS.

**Mitigação:** isolarmos `metrics.ts` e `actions.ts` atrás de uma
interface pura (`IMetrics`, `IActions`) — o teste do contrato e do loop
não dependem do SO de verdade.

---

## Fase 4 — `web/`

**Módulos:**

### 4a. Setup do Vite + React + Tailwind
- `package.json` do workspace `web`, `index.html`, `main.tsx`,
  `App.tsx`.
- Vite dev server em `:5173` (não é a porta do agente).

### 4b. `ws.ts` (cliente)
- Conecta em `ws://<host>:5555`.
- Subscrição a `metrics` / `ack` / `error` / `config`.
- Auto-reconnect simples (retentativa em 3s).

### 4c. Components
- `CpuCard`, `RamCard`, `FpsCard` — mostram o valor, atualizam a cada
  `metrics`.
- `ActionButton` — um por app (`discord`, `obs`) e um de
  `screenshot`.
- `ConfigPanel` — lê/altera `screenshotDir` (e `clipDir` quando
  existindo).
- `ErrorToast` — exibe `error` do contrato.

### 4d. Teste manual
- Abre no celular: `http://<ip-do-pc>:5173` (Vite expõe na rede local).
- Agente em `:5555` na mesma máquina.

**Média de esforço:** ~4h. ~12 arquivos tocados.

**Risco:** **baixo-médio**. UI é a parte mais previsível; o ponto que
costuma dar trabalho é o **reconnect** e a validação de input do
`ConfigPanel` (path de Windows pode ter espaços, aspas, etc.).

---

## Fase 5 — E2E no celular

**O que:**
- Subir o agente num PC.
- Abrir a web num celular na mesma rede Wi-Fi.
- Verificar: CPU/RAM/FPS atualizando, botões funcionando,
  `ConfigPanel` salvando.

**Média de esforço:** ~30 min (se o Wi-Fi colaborar; se tiver NAT
ou firewall, pode levar mais).

**Risco:** **alto** (é a etapa mais "manual" do sistema). Mitigação:
ter um **checklist escrito** e **o agente logando** a cada mensagem
recebida/enviada (só em dev).

---

## Riscos transversais

| Risco | Mitigação |
|---|---|
| FPS "do processo focado" é preciso demais pro Node | Fallback pra `tasklist` + heurística (a menor memória = jogo) |
| `screenshot` falha em alguma GPU/driver | Testar primeiro numa máquina simples; fallback pra captura da janela focada |
| Celular e PC em rede Wi-Fi diferente (VLAN) | Checklist do e2e já detecta; documentar "mesma rede" no `README` |
| Contrato mudar no meio da implementação | `shared/protocol.ts` é único ponto; cada mudança passa por teste de contrato |

## O que fica pra fase 2+

- `clipDir` (o `config` já está preparado).
- Combo de teclas (novo tipo de `action`).
- `steam`, navegador específico (novos `open-app`).
- PWA / manifest pra "installable".
- Anúncio e login.
- Mac / Linux.

## O que **não** entra na fase 1

- Nenhum. Se você quiser mexer no escopo, edita a `SPEC.md` antes e
  atualiza este plano.
