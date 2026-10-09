---
name: criar-base
description: >
  Cria o site de uma casa de alojamento, do dossiê ao site, numa só sessão e
  só com o Claude; se a casa ainda não tem dossiê, começa por lançar os dois
  subagentes da al-dossier. Um subagente define o storytelling (a linha de
  raciocínio em guião, as secções e o texto real); a sessão principal tira o
  padrão estético das inspirações do Diogo; três subagentes constroem três
  protótipos estáticos; o Diogo escolhe o protótipo, o guião e as fotos; um
  subagente monta o site em Next.js e faz o acabamento, outro dá o movimento
  que acompanha o guião, e o último adapta ao telemóvel. Usa para criar uma base, fazer o
  site de uma casa, transformar um dossiê num site ou gerar novos protótipos.
---

# Criar o site de uma casa

Entrega um site convincente para o Diogo mostrar ao potencial cliente:
próprio desta casa, com fotografias que a valorizem, texto verdadeiro e
contacto funcional.

**Quem faz o quê.**

| Passo | Quem | Modelo |
|---|---|---|
| Descrever as fotos | subagente `descritor-fotos` | Haiku |
| O storytelling: a linha de raciocínio (guião), as secções e o texto | subagente `estrutura-alojamento` | Opus |
| Padrão das inspirações e três variações | a sessão principal | Opus |
| Três protótipos | 3 × subagente `prototipo-alojamento` | Opus, com `ui-ux-pro-max` |
| Escolha e direções | o Diogo | — |
| Montagem, Next.js e polimento | subagente `polimento-alojamento` | Opus, com `impeccable` |
| Movimento que conta o guião (parecer um vídeo, sem exagero) | subagente `interatividade-alojamento` | Opus, com `emil-design-eng` |
| Mobile e responsividade (o último a entrar) | subagente `mobile-alojamento` | Sonnet; Opus só para trocar animações |
| Revisão (só a pedido) | subagente `revisor-alojamento` | Sonnet |

## Como se lança

**Uma sessão por casa, do princípio ao fim**, aberta em `nichos/alojamento` e
em Opus. O Diogo escreve, numa só mensagem:

> /criar-base Casa X, concelho Y, os links que tiver + as capturas de inspiração

A sessão corre tudo sozinha e só para **nos protótipos**, para a escolha e as
direções dele. Depois disso volta a correr sozinha até ao site. Para antes
só se algo o exigir: a identidade da casa não se confirma, o dossiê não
passa na validação, há poucas fotografias, ou faltam as inspirações (nesse
caso pede-as e continua o dossiê e a estrutura entretanto).

Os passos passam o trabalho uns aos outros por ficheiros, na pasta da casa.

**A sessão principal coordena e mais nada**: lança os subagentes, faz o
padrão (as inspirações já estão no chat, não as releias noutro lado) e fala
com o Diogo. Tem de estar em Opus, por causa do padrão. Não lê o dossiê, os
protótipos nem o site: os subagentes devolvem relatórios curtos e passam o
trabalho por ficheiros. Os subagentes não podem lançar outros subagentes, por
isso toda a coordenação fica aqui.

**Poupar tokens.** Uma sessão nova por casa: numa conversa longa, cada
mensagem relê tudo. Correções depois de um passo: retoma o subagente que o
fez (SendMessage), que já tem tudo no contexto, enquanto esse contexto for
pequeno (ver passo 8).

`<skill>` abaixo é `nichos/alojamento/.claude/skills/criar-base`.

## Limites

- Só factos, contactos, citações e imagens do contrato do dossiê, com as
  condições. Nunca inventes experiências.
- A estrutura e o texto nascem do dossiê. A estética nasce das inspirações do
  Diogo: o Claude descreve o padrão delas, não acrescenta gosto seu.
- Legível, acessível, responsive. Não publiques: a entrega é da
  `site-delivery`.

## 0 · Dossiê

Se `casas/<slug>/dossie/` não existe ou não está aprovado
(`python .claude/skills/al-dossier/scripts/validar-dossie.py casas/<slug>/dossie`),
lança o `dossie-recolha` com o nome, o concelho e os links, e a seguir o
`dossie-juizo`. A recolha traz sempre a região (recolhe 5 a 6 atrações com foto de
licença livre; o site usa 4 a 5, na secção "À volta"). As regras do dossiê são da `al-dossier`; esta skill só lança
os dois. Se a casa já tem dossiê aprovado, salta este passo.

## 1 · Descrever as fotos

Se `dossie/fotos-descricao.json` não cobre todas as fotos utilizáveis
(`node <skill>/scripts/fotos-por-descrever.mjs casas/<slug>` diz quais
faltam), lança o subagente `descritor-fotos` com a casa. Se avisar que o
contrato tem poucas fotografias, diz ao Diogo e espera. Depois, as cores
reais (o descritor só estima):

```bash
python <skill>/scripts/cores-fotos.py casas/<slug>
```

## 2 · Inspirações do Diogo

São obrigatórias e são **puramente estéticas**. Copia as capturas que ele
mandou no chat:

```bash
python <skill>/scripts/preparar-fotos.py inspiracao casas/<slug> <imagem> ...
```

Se não mandou nenhuma, pede-lhas e espera. Podes fazer o passo 3 entretanto.

## 3 · Estrutura

Lança o subagente `estrutura-alojamento` com a casa. Segue
[brief.md](references/brief.md), escreve `prototipos/BRIEF.md`, prepara o
pacote de fotos (e a folha de contacto) e corre o validador até sair limpo.
Devolve a história e as secções em poucas linhas.

## 4 · Padrão e variações

Segue [padrao.md](references/padrao.md): lê as inspirações juntas uma vez,
escreve `prototipos/PADRAO.md` e `prototipos/variacoes.json` com três
variações que diferem na cor (famílias das fotos), no formato, no ritmo e na
maneira de apresentar. O Diogo não precisa de os ver antes.

## 5 · Três protótipos

Se já houver protótipos, move a ronda para `prototipos/anteriores/ronda-N/`
(com os caminhos das fotos passados a `../../fotos/`). Lança **os três
subagentes `prototipo-alojamento` numa só mensagem**, em paralelo. Cada
pedido leva a casa, a letra, a variação inteira e uma linha sobre as outras
duas. As regras estão em [regras-prototipo.md](references/regras-prototipo.md):
estáticos, só HTML e CSS, com o cabeçalho e o primeiro ecrã no formato fixo
de todas as casas (nome à esquerda, páginas à direita, foto a ecrã inteiro,
título grande), vestidos com a pele de cada protótipo.

Quando os três acabarem:

```bash
node <skill>/scripts/fechar-prototipos.mjs casas/<slug>
node <skill>/scripts/servir.mjs casas/<slug>/prototipos 3400      # em segundo plano
```

## 6 · A escolha do Diogo

Dá-lhe `http://localhost:3400/` e o que a verificação deixou por resolver, e
**para**. É a paragem onde ele decide **tudo o que é caro mudar depois**: a
página mostra os três protótipos, o guião (o percurso, momento a momento) e
o plano de fotos (que foto vai em cada secção, incluindo o primeiro ecrã).
Pede-lhe as três coisas na mesma resposta. Ele pode:
- escolher um ("B"), ou misturar ("B com as opiniões do C");
- mudar o guião (momentos, ordem, o que sobra ou falta) ou trocar fotos:
  retoma o `estrutura-alojamento` com o pedido dele e muda o BRIEF **antes**
  de construir;
- pedir para refazer um: relança só esse subagente, com o pedido dele,
  nas palavras dele, junto da variação;
- recusar os três: nova ronda do passo 4, com o que ele disse. Se o que ele
  disse é sobre o texto ou as secções, muda no BRIEF.

Regista a escolha, o pedido dele e o porquê das recusadas em
`prototipos/ESCOLHA.md`.

## 7 · Site final

Segue [construir.md](references/construir.md): fotos finais, esqueleto
Next.js com o primeiro ecrã constante, polimento, interatividade e mobile,
por esta ordem. O `mobile-alojamento` é o último: corre em Sonnet, em modo
de verificação, com o `percorrer.mjs`. Se relatar animações que não
funcionam no toque, relança-o em Opus (`model: opus`) em modo de troca, só
com essas animações e a proposta dele. A revisão só se o Diogo a pedir.

Entrega o endereço local, o protótipo escolhido e o estado da verificação.
Quando o Diogo corrigir algo depois, acrescenta a correção a
[correcoes.md](references/correcoes.md).

## 8 · Correções depois da entrega

Cada ronda custa um build e uma verificação, por isso:

- **Pede tudo de uma vez.** Na entrega, pede-lhe as correções numa só
  mensagem, secção a secção.
- **Separa pelo tamanho.**
  - Pequenas (trocar uma foto, uma cor, tirar um bloco, mudar uma
    frase que o BRIEF já tem): um subagente **novo** em Sonnet
    (`polimento-alojamento` com `model: sonnet`), e o pedido começa por
    "**Modo de correção**: não montes nada". Lê o `NOTAS.md` e só aquele
    componente.
  - De texto ou de secções: `estrutura-alojamento` primeiro, depois quem passa
    para o site.
  - De movimento: `interatividade-alojamento`.
  Junta numa só ronda o que for do mesmo agente.
- **Contexto.** Retoma um subagente só enquanto o contexto dele for pequeno
  (abaixo de ~250 mil tokens, que o relatório mostra). Acima disso, lança um
  novo, que lê o `NOTAS.md`: retomar um contexto grande relê-o a cada passo
  e esgota o limite de uso.
- **O servidor é da sessão principal.** Os servidores que os subagentes
  ligam morrem quando eles acabam: eles param a porta 3500 antes do build e
  deixam-na parada, e a sessão principal liga
  `npm run start -- -p 3500` em segundo plano (com o tempo máximo) quando
  houver algo para o Diogo ver.
