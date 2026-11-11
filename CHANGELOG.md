# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-11-11 — Fase 1 concluída

### ✅ Adicionado

#### Fase 1 — Projeto base & Contrato
- **Monorepo npm workspaces** (`shared`, `agent`, `web`) com TypeScript estrito
- **Contrato de protocolo** único em `shared/src/protocol.ts`: `Message`, `Action`, `Metrics`, `Config`, `validateMessage`
- **Agente Node/TS** (`agent/`): WebSocket server na porta 5555 (`ws`), coleta métricas (CPU/RAM via `os`, FPS nativo), executa ações (`open-app`, `screenshot-full`, `screenshot-crop`), persiste config em `agent/config.json`
- **Web React/Vite** (`web/`): Vite 5 + React 18 + Tailwind + Vitest, cliente WS (`useAppDeckWS`), 6 tabs (Perf, Audio, Jogos, Discord, Stream, Config)

#### Fase 2 — WebSocket Cliente (T4.2)
- `AppDeckWS` class (framework-agnostic): connect/disconnect, auto-reconnect 3s fixo gated por `autoReconnect`, fila de saída, event emitter tipado (`on/off` com `InboundPayloadMap`)
- `useAppDeckWS` hook React: singleton, estado reativo (`status`, `metrics`, `config`, `lastAck`, `lastError`), helpers `sendAction`, `sendConfigGet`, `sendConfigSet`
- Integração em 5 componentes: `PerfTab`, `GamesTab`, `DiscordTab`, `StreamTab`, `ConnectionSection`
- 20 testes unitários (`web/test/ws.test.ts`)

#### Fase 3 — Componentes de Métrica (T4.3)
- `CpuCard`, `RamCard`, `FpsCard`: cards reativos com sparkline (`Spark` SVG)
- `PerfTab` refatorado para consumir `useAppDeckWS().metrics`
- 9 testes de render (`web/test/components.test.tsx`)

#### Fase 4 — Botões de Ação (T4.4)
- `ActionButton` componente reutilizável (Discord, OBS, Screenshot) emite `action` no WS
- `DiscordTab` refatorado para usar `ActionButton`
- 5 testes (`web/test/ActionButton.test.tsx`)

#### Fase 5 — Painel de Configuração (T4.5)
- `ConfigPanel` lê/escreve config do agente via WS: `config.get` no mount, `config.set` no save
- `ConnectionSection` mostra status de conexão + botão "Testar conexão"
- i18n completo (pt-BR, en-US, de-DE, es-ES) com chaves `testConnection`, `status`, `disconnected`, `connecting`, `connected`
- 4 testes (`web/test/ConfigPanel.test.tsx`)

#### Fase 6 — Finalização Web (T4.6)
- `App.tsx` com layout mobile-first + 6 tabs integradas
- Build limpo (`npm run build -w web`), 84 testes passando

### ✅ Testado
- Contrato `shared/protocol.ts` validado dos dois lados (23 testes)
- 84 testes unitários vitest (web + shared)
- Build de produção `web/dist/` gera sem erros
- Preview servido em porta 5173 (`web/dist`), mockup em 5175

### 📦 Infra
- Skill `ctx-sync` para sincronização entre duas máquinas via GitHub (branch `main`)
- `.claude/launch.json` com servidores de preview configurados

---

### [0.0.0] - 2026-11-10 — Inicialização

- Setup inicial do monorepo
- Configuração de ESLint, Prettier, Vitest
- Criação da skill `ctx-sync`