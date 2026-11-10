---
name: ctx-sync
description: Mantém o contexto do projeto atualizado entre as duas máquinas do usuário via GitHub. Use quando o usuário digitar ctx-sync com "enviar" ou "baixar". Emite dois comandos distintos: enviar (gera um arquivo de contexto e empurra o projeto inteiro) e baixar (puxa o repositório, lê o último arquivo de contexto e resume o que continua).
---

# ctx-sync

## Overview

O usuário trabalha no AppDeck em duas máquinas (local + PC do escritório) e precisa manter o projeto sincronizado por GitHub. A skill gera um briefing de contexto novo a cada `enviar` (um arquivo novo por vez, nunca sobrescreve), e lê o briefing mais recente no `baixar` para saber exatamente de onde retomar.

Repositório padrão: **https://github.com/Vanz047/AppDeck**. A branch de troca entre as duas máquinas é sempre **`main`**: o fluxo `enviar` termina empurrando o trabalho para `main`; o fluxo `baixar` puxa de `main`. Nunca mude o `origin` sem perguntar.

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

### 3. Commit e push para `main`

```bash
git add "Atualização de Contexto/"
git commit -m "chore: contexto de sync <data-curta>

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

A skill **sempre empurra para `main`**, não para a branch de trabalho. Determine onde você está:

- **Em `main`** → `git push origin main`.
- **Em outra branch** (ex.: `fix/...`) → **não troque de branch**. Empurre a branch atual para o remote `main`:
  ```bash
  git push origin <branch-atual>:main
  ```
  Se o push for rejeitado como *non-fast-forward* (`main` já tem commits que a branch atual não tem), alinhe antes:
  1. `git fetch origin main`
  2. `git merge origin/main` (se houver conflito, **pare** e avise — não force, não faça `--abort` sem dizer)
  3. `git push origin <branch-atual>:main`

Se o push falhar por outro motivo (remote ausente, branch protegida, sem permissão), **pare** e diga exatamente o que faltou — **não** invente remote nem mude `.git/config`.

Ao final, informe ao usuário o sha que subiu e lembre: "Na outra máquina, rode `/ctx-sync baixar`."

## Fluxo Baixar

Objetivo: puxar o trabalho que a outra máquina empurrou para `main`, ler o último arquivo de contexto, e dizer para o usuário exatamente o que continua.

### 1. Puxe de `main`

A outra máquina empurrou para **`main`**. Aqui:

- **Se estiver em `main`** → `git pull origin main`.
- **Se estiver em outra branch** → não troque de branch; puxe `main` para a branch atual:
  ```bash
  git fetch origin main
  git merge origin/main
  ```

Se o merge trouxer conflito, **pare** e liste os arquivos conflitantes — **não** force nem escolha lado sozinho; deixe o usuário decidir.

Sempre que houver conflito, informe claramente e aguarde.

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
- [ ] O push foi para **`main`** (via `git push origin main` ou `git push origin <branch>:main`), deu `ok` (ou o usuário foi avisado do problema).

### Antes de encerrar o fluxo Baixar
- [ ] O merge de `origin/main` deu `ok` (ou o usuário foi avisado do conflito).
- [ ] O arquivo mais recente foi lido inteiro.
- [ ] A resposta final tem os 3 blocos: "Onde estávamos / O que continua / Atenção".
