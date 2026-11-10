# AppDeck — Resumo de Handoff

> Para continuar o trabalho em outra máquina. Leia `SPEC.md` e `docs/intent/`
> antes de tudo.

## O que é o projeto

**AppDeck** é um "Stream Deck portátil": um painel web (celular) que monitora
e controla um PC local — exibe métricas (CPU/RAM/FPS) e botões de atalho
para ações. **Web-first**.

- **Fase 1 (o atual):** apenas rede local, 1 usuário, **sem**
  login/multiusuário/anúncios. Só **Windows 10/11 64-bit**.
- Fontes de verdade: `SPEC.md` ("AppDeck — Fase 1") e
  `docs/intent/` (Statement of Intent, confirmado 2026-11-03).
- **Fora do escopo da Fase 1:** login/multiusuário/ads, app store,
  acesso remoto, combos de teclas, mac/linux, clipes de vídeo.
  Screenshot = corte 1:1 sem scale (conversão de scale + anotações ficam
  para a Fase 2).

## Arquitetura

Monorepo com **npm workspaces**: `shared`, `agent`, `web` — Node >= 20.

- `shared/src/protocol.ts` — tipos de protocolo compartilhados.
- `agent` — roda **no PC**: coleta métricas, executa ações, persiste
  config em `agent/config.json`.
- `web` — **React 18 + Vite 5 + Tailwind + TypeScript + Vitest**.
  Fala com o `agent` via WebSocket (dep `ws`).
- `web/public/mockup.html` — mockup estático solto
  (protótipo de UI, separado da tela real React).

## Como rodar (ambiente novo)

```bash
npm install        # raiz instala os workspaces
npm run dev        # sobe o agent
npm run dev:web    # sobe o web (Vite dev)
npm run build:web  # build do web
npm test           # vitest run
npm run lint
```

- Preview (via `.claude/launch.json`): `web` serve o `web/dist` em `:5173`;
  `mockup` serve `web/public` em `:5175` (ambos com `python -m http.server`).
- **Atenção:** o preview do web serve o **BUILD** (`web/dist`). Depois de
  mudar Tailwind/CSS, rode `npm run build:web` antes de testar.

## O que já foi feito (histórico)

Trabalhando no branch `fix/mockup-modal-scrollbar-and-streamtab-cleanup`,
PR #1 aberto. Últimos passos:

1. **Tela de config completa** (i18n, cores por aba, toggles
   Discord/Stream, fullscreen).
2. **Disciplinar o estado React** + sub-componentes de config +
   aliases TS + Vitest.
3. **Fix: scrollbar/size do modal de config** + duplicação dos
   controles da aba Stream.
4. **Troca de "customização de cor" por um toggle dark/light**
   (último commit `c73ddff`) — com tema light novo no CSS.

Commit do tema: `c73ddff refactor: replace color customization with
dark/light mode toggle + light theme CSS` (já no PR #1).

## Estado atual / onde estamos

- O toggle dark/light **funciona no React e no mockup**,
  incl. todas as classes utilitárias do Tailwind.
- PR #1 **mergeable/clean**, 0 CI checks, no branch
  `fix/mockup-modal-scrollbar-and-streamtab-cleanup`.
- Últimos commits da linha: `c73ddff` (tema), `e491eec`
  (fix modal + stream), `f4af3ae` (refactor estado/config).
- `main` local já contém `f4af3ae`, mas **ainda não contém
  `c73ddff` nem `e491eec`** — as duas commits do PR. Ou seja,
  o `main` está 2 commits atrás da branch do PR.

## O que está pendente / próximo

- **Revisar e fechar o PR #1** (ou seguir com mais features
  da Fase 1).
- Decidir o que é a próxima slice vertical da Fase 1
  (métricas ao vivo via WebSocket → botão de atalho
  executando ação real no agent).

## Decisões firmes / objetivos

- Manter **web-first** e **só Fase 1** (rede local, 1 usuário,
  Windows 10/11 64-bit). Não empurrar login/ads/multiusuário agora.
- Tema: **dark/light binário** (toggle), **não** customização livre
  de cor — decisão do commit `c73ddff`, manter assim.
- Mockup (`web/public/mockup.html`) é protótipo de UI separado;
  a tela real é a React em `web/src`.
- Seguir o processo incremental (implementa → testa → verifica
  → commit).

## Atenções na nova máquina

- `web/src/context/SettingsContext.tsx` tem **paths de
  placeholder de teste** (ex.: `C:\Users\Admin\AppData\Local\Temp\claude\shots|clips`)
  e `agentIp: '192.168.1.42:5555'` em `DEFAULT_SETTINGS`.
  Isso **não é bug** — sete seus caminhos reais na sua máquina.
- Pegadinha do Tailwind já resolvida: os `colors`
  no `web/tailwind.config.js` **devem** apontar para `var(--...)`
  (não hex), senão o tema light não afeta as classes utilitárias.
  Não re-hardcode hex.
