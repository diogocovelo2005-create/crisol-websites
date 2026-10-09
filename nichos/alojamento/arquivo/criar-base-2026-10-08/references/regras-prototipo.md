# Regras do protótipo

Para o subagente que constrói **um** dos três protótipos. Os outros dois
correm ao mesmo tempo, com variações diferentes da tua.

## O que estás a fazer

Um protótipo da landing page de uma casa de turismo em Portugal. Serve para o
Diogo escolher a **estética**: cores, fontes, layout, ritmo e a maneira de
apresentar o conteúdo. Depois de ele escolher, outro agente passa-o para
Next.js e faz o acabamento, e outro dá-lhe movimento.

Por isso o protótipo é **estático**: HTML e CSS, **sem JavaScript nenhum**,
sem animações nem transições de scroll. Um `:hover` simples pode ficar.

O **cabeçalho e o primeiro ecrã têm SEMPRE o mesmo formato**, em todas as
casas: o logótipo ou o nome da casa no canto superior esquerdo e as páginas
(a navegação) no canto direito; por baixo, uma fotografia bonita que
representa a casa a ocupar o ecrã inteiro, com o título em grande, o texto
curto e as duas ações. Copia `references/primeiro-ecra.html`, preenche-o
com a secção 1 da estrutura (a foto, a etiqueta, o título, o texto e as
ações) e a navegação das secções, e dá-lhe a **tua pele**: as tuas fontes
e as tuas cores, pelas variáveis CSS do fragmento. **Não mudas o formato**:
nem a posição do nome e das páginas, nem a foto a ecrã inteiro, nem o
título grande. A seguir vem a secção 2 da estrutura, e daí para baixo a
página é tua.

## O que recebes

- `prototipos/BRIEF.md`: a estrutura. O conteúdo e a ordem das secções vêm
  daqui, **a partir da secção 2**. Cada secção diz porque existe e que parte
  da história conta. O guião diz o tipo de cada momento (plano largo,
  sequência, pausa, pormenor, fecho): a composição serve-o, mesmo estática.
  As frases de passagem entre secções aparecem.
- `prototipos/PADRAO.md`: o padrão estético comum às inspirações do Diogo.
  É a referência de gosto. É um padrão, não uma página a copiar.
- **A tua variação** (no pedido): a família de cor, o formato, o ritmo e a
  maneira de apresentar o conteúdo que te distinguem dos outros dois.
- `prototipos/fotos.md`: cada foto com a largura máxima, o ponto focal, a
  qualidade e as cores dominantes em hex.
- `prototipos/folha-de-contacto.jpg`: todas as fotos numa só imagem, para
  veres a cor e o ambiente. **Não abras as fotos uma a uma.**
- A skill `ui-ux-pro-max`, **só nos domínios `typography` e `color`**, para
  escolher o par de fontes e confirmar a paleta.

## Cor

- A paleta sai das cores das fotos (`fotos.md`), ancorada na família de cor
  da tua variação. As cores da página têm de combinar com as fotografias que
  estão nela.
- Contraste de pelo menos 4.5:1 no texto.

## Fontes

- Duas famílias no máximo, do Google Fonts, por `<link>`.
- Escolhe o par de acordo com o `PADRAO.md` e confirma com a `ui-ux-pro-max`
  (`--domain typography`). O padrão manda sobre as sugestões da skill.

## Composição

**Cada secção encontra a sua própria composição.** Não uses o mesmo arranjo
em duas secções seguidas nem repitas o mesmo bloco ao longo da página.

Está proibido em concreto: título centrado, parágrafos centrados por baixo,
grelha de fotografias a seguir, e isto repetido secção após secção. Lê-se como
uma galeria com texto pelo meio, não como um site.

O formato, o ritmo e a maneira de apresentar o conteúdo seguem a tua variação.

## Texto

- **Usa o texto da estrutura, à letra**: títulos, parágrafos, listas,
  citações, contactos. Podes encurtar escolhendo o que mostrar, nunca
  reescrever.
- Os códigos entre parênteses retos (`[AFIR-…]`, `[CIT-…]`) são referências
  internas: **nunca os mostres**.
- Numa citação com linha "Tradução:", mostra a original e, se quiseres, a
  tradução por baixo.
- Não acrescentes texto teu com factos: nada de números, preços, serviços,
  prémios, experiências, legendas numeradas ou datas que não estejam na
  estrutura.
- Citações inteiras, exatamente como estão, com o nome e a plataforma.
- Sem travessões longos (—) no texto visível.

## Fotografias

- Só as fotos do pacote, pelo caminho `fotos/<ficheiro>`. Sem imagens de
  fora, placeholders ou desenhos.
- Respeita a **largura máxima** de cada foto, usa o **ponto focal** em
  `object-position` e não cortes a zona indicada.
- As fotos que a estrutura atribui a uma secção são as que **podes** usar ali,
  não uma lista a cumprir. Usa menos, ou nenhuma, se a secção ficar melhor.
  Uma foto fraca em grande estraga mais do que a ausência dela.
- Não alteres o que a foto mostra: nada de filtros que mudem a luz.

## Funcionar

- 1440 × 900 e 390 × 844, sem scroll horizontal.
- Texto de corpo com pelo menos 16 px.
- A página, com o primeiro ecrã, não passa de 13 ecrãs de altura em
  computador (o verificador falha acima disso).
- Os contactos são clicáveis (`tel:` e `mailto:`).

## Entrega e orçamento

- Um só ficheiro, `prototipos/<letra>.html`, com o CSS num `<style>`. Até
  cerca de 700 linhas.
- **Poucos passos.** Cada passo relê tudo o que já leste, por isso: lê os
  ficheiros todos no mesmo passo, em paralelo; no máximo duas pesquisas na
  `ui-ux-pro-max`, também juntas; escreve o ficheiro inteiro de uma vez.
- Depois corre a verificação uma vez:
  `node .claude/skills/criar-base/scripts/verificar-prototipo.mjs casas/<slug>/prototipos/<letra>.html casas/<slug>/prototipos/BRIEF.md casas/<slug>/prototipos/fotos --prototipo`
  Corrige as falhas numa só passagem e para. Não tires capturas de ecrã: a
  verificação faz a conferência e o Diogo faz o juízo.
- Responde com até 80 palavras: as fontes, a paleta em hex, o que fizeste de
  diferente em cada secção e o resultado da verificação.
