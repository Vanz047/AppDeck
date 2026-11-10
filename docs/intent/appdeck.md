# AppDeck — Statement of Intent

> Confirmada pelo usuário em 2026-11-03, via `/interview-me`.

## O que é

Um "Stream Deck portátil": um painel web no celular que mostra e controla o PC
(métricas + botões de atalho). Web-first; empacotamento pra lojas é visão de
futuro, não fase 1.

## Linhas confirmadas

- **Produto:** AppDeck — painel web (celular) que monitora e controla o PC
  (CPU/RAM/FPS + atalhos).
- **Quem se beneficia:** gamers/streamers com PC gamer — querem ver a saúde da
  máquina durante o jogo e disparar atalho sem sair do jogo.
- **Por que agora:** o Stream Deck físico é caro e fixo; o celular já na mão
  assume esse papel.
- **Modelo de negócio:** grátis com anúncios agora; plano pago depois
  (remove anúncios + funções especiais).
- **Arquitetura confirmada:** web no celular + um **agente/servidor no PC**
  (coleta métricas e executa os atalhos). O agente é parte do produto.

## O que é "pronto" (fase 1)

O celular abre o AppDeck, vê CPU/RAM/FPS do PC em tempo real, e um botão
dispara uma ação real (ex.: abrir Discord ou screenshot) — funcionando na
rede local, sem quebrar.

## Restrições da fase 1

- Só rede local; só o usuário como alvo de teste.
- Sem login, sem multi-usuário, sem anúncio nesta fase.

## Fora de escopo (fase 1)

- Plano pago, remoção de anúncio, instalação em loja (Play/App Store),
  acesso remoto fora de casa. Tudo isso existe na visão de futuro, mas não
  entra no código desta fase.
