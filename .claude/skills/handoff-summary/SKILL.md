# Handoff Summary

## Overview

Gera um resumo de handoff em texto solto para continuar o trabalho em outra máquina (outro checkout + Claude Code). O objetivo é que a outra Claude Code retome **de onde paramos, com os mesmos objetivos** — sem ter que re-descobrir o projeto.

## When to Use

- O usuário está trocando de máquina / vai parar de trabalhar aqui e quer levar o contexto junto.
- Pedido na forma de "me faça um resumo de tudo que fizemos, onde estamos e o que falta".
- Não é um PR review nem um diff — é um briefing de retoma.

## What the summary MUST include

Estrutura fixa (8 blocos, nesta ordem). Cada um é uma seção de Markdown:

1. **O que é o projeto** — uma linha sobre o produto + fase/escopo atual + as fontes de verdade (`SPEC.md`, `docs/intent/`, ou similar).
2. **Arquitetura** — monorepo/workspaces, pacotes, dependências-chave, como as partes se falam (protocolo, sockets, etc.).
3. **Como rodar** — comandos concretos (`npm install`, dev/build/test/lint), servidores de preview, pegadinhas (ex.: preview serve o build, então rode build antes).
4. **O que fizemos até agora** — histórico do branch/PR: os últimos commits lógicos (não todos), o que cada um trouxe.
5. **Estado atual / onde estamos** — o que está funcionando AGORA (testes passando, feature completa, PR mergeable, etc.).
6. **O que está pendente / próximo** — as próximas slices ou decisões que bloqueiam o passo seguinte.
7. **Decisões firmes / objetivos** — o que é FIXO (não reabrir sem motivo) e o que é fora de escopo.
8. **Atenções na nova máquina** — placeholders de teste que não são bug, caminhos locais a reconfigurar, pegadinhas de config (ex.: Tailwind com `var(--…)`), skills/conectores que **não** vêm no `git pull`.

## What the summary MUST NOT include

- Não inventar coisas que não estão no código nem no git.
- Não copiar o `SPEC.md` inteiro — só apontar pra ele.
- Não mencionar skills do Claude Code que não estão em `.claude/skills/` do projeto (aquelas são internas). O usuário só quer o que já existe no repo + o que falta.
- Não colocar segredos, tokens ou caminhos pessoais além do já versionado.

## Data sources

Leia estas fontes **antes** de escrever:

- `SPEC.md` (ou a spec mais recente na raiz)
- `docs/intent/` (statements de intenção confirmados)
- `package.json` na raiz (workspaces, scripts) + os `package.json` dos pacotes
- `git log --oneline <branch> -15` para histórico recente
- `git status` + diff resumido para o que está em andamento
- `.claude/skills/` e `.claude/launch.json` para listar skills/conectores
- `.gitignore` para saber o que **não** vem no `git pull`

## Output

Escreva o resumo em um arquivo na raiz do repo (padrão: `HANDOFF.md`) **ou** em texto solto no chat — pergunte se não tiver certeza. Idioma: o idioma do usuário (pt-BR por padrão neste projeto).

Quando for um arquivo: commitar com mensagem `docs: …` e linha de co-author (`Co-Authored-By: Claude Code <noreply@anthropic.com>`).

## Checklist antes de entregar

- [ ] As 8 seções presentes, na ordem
- [ ] Comandos testados ou citados do `package.json` real
- [ ] Histórico alinhado com o `git log` real (sem commits inventados)
- [ ] Decisões firmes trazidas do `SPEC.md` / `docs/intent/` (não inventadas)
- [ ] Pegadinhas conhecidas do projeto incluídas (ex.: Tailwind var(--…))
- [ ] Skills e conectores listados corretamente (skills do repo vêm no `git pull`; conectores MCP não vêm)
