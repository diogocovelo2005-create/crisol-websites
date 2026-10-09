---
name: criar-base
description: >
  Cria o site de uma casa de alojamento, do dossiê ao site, numa só sessão e
  só com o Claude; se a casa ainda não tem dossiê, começa por lançar os dois
  subagentes da al-dossier. Um subagente escreve a história e o texto; outro
  constrói três protótipos estáticos, diferentes entre si; o Diogo escolhe;
  um subagente passa o escolhido para Next.js, fiel, com as direções dele e o
  movimento que serve a história; outro adapta ao telemóvel; no fim, só se o
  Diogo disser que sim, o último torna-o mais rápido sem mudar nada do que
  se vê. Usa para
  criar uma base, fazer o site de uma casa, transformar um dossiê num site
  ou gerar novos protótipos.
---

# Criar o site de uma casa

Entrega um site convincente para o Diogo mostrar ao potencial cliente:
próprio desta casa, com fotografias que a valorizem, texto verdadeiro e
contacto funcional.

| Passo | Quem | Modelo |
|---|---|---|
| Dossiê | subagentes `dossie-recolha` e `dossie-juizo` | Sonnet, Opus |
| Descrever as fotos | subagente `descritor-fotos` | Haiku |
| A história e o texto | subagente `estrutura-alojamento` | Opus |
| Padrão e três protótipos | subagente `prototipos-alojamento` (um só, os três) | Opus |
| Escolha e direções | o Diogo | — |
| Site: passagem fiel, direções e movimento | subagente `site-alojamento` | Opus |
| Mobile e responsividade | subagente `mobile-alojamento` | Sonnet |
| Rapidez (só se o Diogo disser que sim) | subagente `rapidez-site` | Opus |

Os subagentes separam-se por tipo de trabalho: investigação, conteúdo,
forma. A forma tem um corte só, na escolha do Diogo: quem faz os
protótipos não faz o site, porque os dois recusados seriam peso morto.

## Como se lança

**Uma sessão por casa, do princípio ao fim**, aberta em `nichos/alojamento`.
O Diogo escreve, numa só mensagem:

> /criar-base Casa X, concelho Y, os links que tiver + as inspirações

A sessão corre sozinha e só para **nos protótipos** e **antes da rapidez**
(passo 7). Para antes só se a
identidade da casa não se confirmar, se o dossiê não passar na validação,
se houver poucas fotografias, ou se faltarem as inspirações (pede-as e
continua o dossiê e a estrutura entretanto).

**A sessão principal coordena e mais nada**: lança os subagentes e fala com
o Diogo. Não lê o dossiê, os protótipos nem o site. Os subagentes passam o
trabalho por ficheiros na pasta da casa e devolvem relatórios curtos. As
frases do Diogo sobre o que quer passam à letra para os agentes de forma
(protótipos e site).

`<skill>` abaixo é `nichos/alojamento/.claude/skills/criar-base`.

## Limites

- Só factos, contactos, citações e imagens do contrato do dossiê, com as
  condições. Nunca inventes experiências.
- O conteúdo nasce do dossiê. A estética nasce das inspirações do Diogo.
- Legível, acessível, responsive. Não publiques: a entrega é da
  `site-delivery`.

## 0 · Dossiê

Se `casas/<slug>/dossie/` não existe ou não está aprovado
(`python .claude/skills/al-dossier/scripts/validar-dossie.py casas/<slug>/dossie`),
lança o `dossie-recolha` com o nome, o concelho e os links, e a seguir o
`dossie-juizo`. Se a casa já tem dossiê aprovado, salta este passo.

## 1 · Descrever as fotos

Se `node <skill>/scripts/fotos-por-descrever.mjs casas/<slug>` diz que faltam
fotos, lança o `descritor-fotos`. Se avisar de poucas fotografias, diz ao
Diogo e espera. Depois, as cores reais:

```bash
python <skill>/scripts/cores-fotos.py casas/<slug>
```

## 2 · Inspirações

São as que o Diogo mandar: os sites dele, capturas de outros, o que for.
Copia-as:

```bash
python <skill>/scripts/preparar-fotos.py inspiracao casas/<slug> <imagem> ...
```

Se não mandou nenhuma, pede-lhas. Podes fazer o passo 3 entretanto.

## 3 · Estrutura

Lança o `estrutura-alojamento` com a casa. Escreve `prototipos/BRIEF.md`,
prepara o pacote de fotos e corre o validador até sair limpo.

## 4 · Três protótipos

Se já houver protótipos, move a ronda para `prototipos/anteriores/ronda-N/`
(com os caminhos das fotos passados a `../../fotos/`). Lança o
`prototipos-alojamento` com a casa e as frases do Diogo. Faz o padrão, as
variações e os três, um a um. Regras em
[regras-prototipo.md](references/regras-prototipo.md) e
[padrao.md](references/padrao.md).

Quando acabar:

```bash
node <skill>/scripts/fechar-prototipos.mjs casas/<slug>
node <skill>/scripts/servir.mjs casas/<slug>/prototipos 3400      # em segundo plano
```

## 5 · A escolha do Diogo

Dá-lhe `http://localhost:3400/` e **para**. A página mostra os três
protótipos, o guião e o plano de fotos. Ele pode:
- escolher um, ou misturar ("B com as opiniões do C"), com direções;
- mudar o guião ou trocar fotos: retoma o `estrutura-alojamento` e muda o
  BRIEF **antes** de construir; o guião mexido volta a ele;
- pedir para refazer um: retoma o `prototipos-alojamento` (SendMessage) com
  o pedido dele, nas palavras dele;
- recusar os três: nova ronda do passo 4, com o que ele disse.

Regista a escolha e as palavras dele em `prototipos/ESCOLHA.md`.

## 6 · Site

Lança o `site-alojamento` com a casa, a letra e as frases do Diogo. Depois
o `mobile-alojamento`. Liga o servidor (`npm run start -- -p 3500` em
`casas/<slug>/site`, em segundo plano) e entrega ao Diogo o endereço
`http://localhost:3500`, o protótipo escolhido e o que os agentes deixaram
por resolver.

## 7 · Rapidez: só com o sim do Diogo

Na mesma mensagem da entrega, pergunta-lhe se quer **já** passar o site
pelo `rapidez-site` e **para**. Nunca o lances sem ele dizer que sim: ele
pode preferir ver o site primeiro, ou corrigir antes.

Se disser que sim (agora, ou depois das correções do passo 8), para a
porta 3500 e lança o `rapidez-site` com a casa. Ele não muda nada do que se
vê: aplica o que é invisível e devolve como propostas o que mexeria no
visual ou no comportamento. Quando acabar, volta a ligar o servidor e
entrega ao Diogo o relatório (antes → depois) e as propostas, para ele
escolher. Uma proposta aceite volta ao `rapidez-site` (SendMessage) com as
palavras dele.

Se houver correções de forma depois da rapidez, o `rapidez-site` volta a
correr no fim delas, outra vez só com o sim dele.

## 8 · Correções depois da entrega

- **Pede tudo de uma vez**, secção a secção.
- De forma ou de movimento: o `site-alojamento` em **modo de correção**
  (retomado com SendMessage enquanto o contexto dele estiver abaixo de ~250
  mil tokens; acima disso, um novo, que lê o `NOTAS.md`). Pequenas (uma
  foto, uma cor, uma frase): um novo em Sonnet (`model: sonnet`).
- De texto ou de secções: `estrutura-alojamento` primeiro, depois o
  `site-alojamento`.
- Quando uma correção do Diogo for uma regra de factos ou técnica que vale
  para todas as casas, acrescenta-a a
  [correcoes.md](references/correcoes.md).
- **O servidor é da sessão principal.** Os subagentes param a porta 3500
  antes do build e deixam-na parada.
