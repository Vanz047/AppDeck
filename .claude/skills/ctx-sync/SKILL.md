---
name: ctx-sync
description: Mantém o contexto do projeto atualizado entre as duas máquinas do usuário via GitHub. Use quando o usuário digitar ctx-sync com "enviar" ou "baixar". Emite dois comandos distintos: enviar (gera um arquivo de contexto e empurra o projeto inteiro) e baixar (puxa o repositório, lê o último arquivo de contexto e resume o que continua).
---

# ctx-sync

## Overview

O usuário trabalha no AppDeck em duas máquinas (local + PC do escritório) e precisa manter o projeto sincronizado por GitHub. A skill gera um briefing de contexto novo a cada `enviar` (um arquivo novo por vez, nunca sobrescreve), e lê o briefing mais recente no `baixar` para saber exatamente de onde retomar.

Repositório padrão: **https://github.com/Vanz047/AppDeck** (branch: a que estiver ativa na máquina). Nunca mude o `origin` sem perguntar.

## Dois comandos

O usuário chama a skill com a palavra-chave entre aspas ou em claro:
- `/ctx-sync enviar` — executa o fluxo **Enviar**.
- `/ctx-sync baixar` — executa o fluxo **Baixar**.
- `/ctx-sync` sem argumento → pergunte qual dos dois ele quer.

Se a pasta `Atualização de Contexto` ainda não existe na raiz do projeto, crie-a na **primeira execução de qualquer dos fluxos** (`mkdir -p`).

## Fluxo Enviar

Objetivo: gerar um arquivo novo de contexto com o estado atual + empurrar o projeto inteiro para o GitHub.

### 1. Verifique o git

Antes de gerar o arquivo, confirme o estado:

- `git status` — há algo sujo que não está commitado?
- `git log --oneline -5` — quais são as últimas mudanças?

Se houver trabalho **não commitado** que pertence a esta atualização, faça commit antes de prosseguir (mensagem curta no estilo `chore: sync context <data>`). O conteúdo do arquivo de contexto vai ser **adicionado ao mesmo commit** que fecha a atualização — um único commit limpo.

### 2. Monte o arquivo

Nome do arquivo: `Atualização de Contexto/YYYY-MM-DD-HH-MM.md` (uso de horário local, ex. `2026-11-10-09-42.md`). Sempre um **novo** arquivo, nunca sobrescreva.

Conteúdo (mesma estrutura de 8 blocos da skill `handoff-summary`, mas adaptado para este uso específico):

```markdown
# Atualização de Contexto — YYYY-MM-DD HH:MM (local)

Máquina de origem: (o nome do computador, ex.: "PC do escritório" ou "notebook local")
Branch: <branch ativa>
Commit de referência: <sha curto atual>

## 1. O que é o projeto
<resumo de 1–2 linhas + fase/escopo + fontes de verdade (SPEC.md, docs/intent/)>

## 2. Arquitetura
<monorepo/workspaces, pacotes, protocolos (WebSocket, etc.), dependências-chave>

## 3. Como rodar
<comandos concretos de dev/build/test/lint + servidores de preview + pegadinhas>

## 4. O que fizemos até agora
<últimas 5 mudanças do projeto — NÃO use `git log` literalmente: resuma cada commit em 1 linha explicando o porquê, não o quê>

## 5. Estado atual
<o que funciona AGORA neste commit: o que está testado, o que ainda é rascunho>

## 6. Onde estamos na hora
<a conversa em curso, decisões pendentes, em que ponto parou>

## 7. O que está pendente / próximo
<próxima slice ou bloqueio que impede o próximo passo>

## 8. Decisões firmes + atenções na outra máquina
<o que é FIXO + placeholders/caminhos/pegadinhas que a outra máquina precisa saber>
```

### 3. Commit e push

```bash
git add "Atualização de Contexto/"
git commit -m "chore: contexto de sync para <data-curta>

Co-Authored-By: Claude Code <noreply@anthropic.com>"
git push
```

Se `git push` falhar (sem upstream, ou repositório não configurado), pare e diga o que faltou — **não** invente remote nem mude `.git/config`.

Se a branch atual não for `main`/`master`, o push vai para a branch atual; avise o usuário que ele precisa fazer merge para levar a outra máquina.

## Fluxo Baixar

Objetivo: puxar o projeto atualizado, ler o último arquivo de contexto, e dizer para o usuário exatamente o que continua.

### 1. Puxe o repositório

```bash
git pull
```

Se o pull falhar por conflito, pare e informe — **não** force.

### 2. Leia o último arquivo

Identifique o **mais recente** (por data no nome, ou por `ls -t`) em `Atualização de Contexto/*.md`. É esse o briefing a ser lido em seguida.

Se a pasta não existir ou estiver vazia, avise: "Nenhum arquivo de contexto recebido ainda — a outra máquina nunca rodou `enviar`?"

### 3. Leia o arquivo inteiro

Leia **todo** o arquivo mais recente. Não resuma por conta própria antes de ler — o conteúdo foi escrito pela outra máquina justamente para ser lido aqui.

### 4. Responda ao usuário

Depois de ler, entregue em 3 blocos curtos:

```
Onde estávamos:
  <1–2 linhas do §6>

O que continua:
  • <item 1>
  • <item 2>
  • <item 3>   (do §7, em ordem)

Atenção antes de continuar:
  <o que §8 aponta que a máquina atual precisa saber (ex.: caminhos locais, branch, placeholders)>
```

Não retome o trabalho sozinho — a skill é só o briefing. O próximo passo é do usuário.

## Regras anti-alucinação

- §4 usa as últimas **5** mudanças (não "todos os commits"). Se houver menos de 5, use o que existe.
- Não invente nomes de features nem commits que não aparecem no `git log`.
- §6 ("onde estamos na hora") vem da **conversa atual** com o usuário — não invente se ele não disse.
- Nenhuma operação de git além de `add` / `commit` / `push` / `pull` / `status` / `log`. Nada de `rebase`, `reset --hard`, `branch -d`, `config set`.
- O arquivo de contexto **não** vai para a raiz do repositório, fica na pasta `Atualização de Contexto/`.

## Checklists

### Antes de encerrar o fluxo Enviar
- [ ] A pasta `Atualização de Contexto/` foi criada se não existia.
- [ ] O novo arquivo foi escrito com as 8 seções na ordem.
- [ ] O §4 cobre as últimas 5 mudanças reais (não inventadas).
- [ ] `git add` cobre a pasta e `git commit` fechou com a linha de co-author.
- [ ] `git push` deu `ok` (ou o usuário foi avisado do problema).

### Antes de encerrar o fluxo Baixar
- [ ] `git pull` deu `ok` (ou o usuário foi avisado do conflito).
- [ ] O arquivo mais recente foi lido inteiro.
- [ ] A resposta final tem os 3 blocos: "Onde estávamos / O que continua / Atenção".
