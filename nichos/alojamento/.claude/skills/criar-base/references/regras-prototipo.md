# Regras dos protótipos

Para o `prototipos-alojamento`, que constrói os três.

## O que estás a fazer

Três protótipos da landing page de uma casa de turismo em Portugal. Servem
para o Diogo escolher a maneira de apresentar, o ritmo, a composição e a
tipografia. Depois de ele escolher, outro agente passa o escolhido para
Next.js, faz o acabamento e dá-lhe movimento.

Por isso os protótipos são **estáticos**: HTML e CSS, **sem JavaScript
nenhum**, sem animações nem transições. Um `:hover` simples pode ficar.

O **cabeçalho e o primeiro ecrã têm SEMPRE o mesmo formato**, em todas as
casas: o nome da casa no canto superior esquerdo e as páginas no canto
direito; por baixo, uma fotografia que representa a casa a ocupar o ecrã
inteiro, com o título em grande, o texto curto e as duas ações. Copia
`references/primeiro-ecra.html`, preenche-o com a secção 1 do `BRIEF.md` e
a navegação, e dá-lhe a pele do protótipo pelas variáveis CSS do fragmento.
**Não mudas o formato.** Da secção 2 para baixo, a página é tua.

## O que recebes

- `prototipos/BRIEF.md`: o conteúdo e a ordem das secções, a partir da
  secção 2. As frases de passagem entre secções aparecem.
- `prototipos/inspiracao/`: as inspirações do Diogo.
- `prototipos/fotos.md`: cada foto com a largura máxima, o ponto focal, a
  qualidade e as cores dominantes.
- `prototipos/folha-de-contacto.jpg` e as fotos em `prototipos/fotos/`.
- A skill `ui-ux-pro-max`, só nos domínios `typography` e `color`.

## Os três

Segue [padrao.md](padrao.md). Constrói-os **um a um**, e antes de cada um
olha para o que já fizeste nos anteriores: o seguinte tem de apresentar,
ritmar e compor de outra maneira, e ter outra tipografia. Se dois ficarem
parecidos, os dois perdem.

## Cor

- A paleta sai das cores das fotos. As cores da página combinam com as
  fotografias que estão nela.
- Entre os três, a paleta varia pouco.
- Contraste de pelo menos 4.5:1 no texto.

## Fontes

- Duas famílias no máximo por protótipo, do Google Fonts, por `<link>`.
- O padrão manda sobre as sugestões da `ui-ux-pro-max`.

## Composição

- Cada secção encontra a sua própria composição. Não uses o mesmo arranjo
  em duas secções seguidas nem repitas o mesmo bloco ao longo da página.
- Proibido: título centrado, parágrafos centrados por baixo, grelha de
  fotografias a seguir, repetido secção após secção.
- Desce-se a página sem perder o fio: uma ideia por ecrã, nada compete com a
  foto principal da secção.

## Texto

- O texto do `BRIEF.md` à letra: títulos, parágrafos, listas, citações,
  contactos. Podes encurtar escolhendo o que mostrar, nunca reescrever.
- Os códigos entre parênteses retos (`[AFIR-…]`, `[CIT-…]`) nunca aparecem.
- Numa citação com "Tradução:", a original e, se quiseres, a tradução.
- Nada de texto teu com factos: números, preços, serviços, prémios, datas.
- Citações inteiras, com o nome e a plataforma.
- Sem travessões longos (—) no texto visível.

## Fotografias

- Só as do pacote, por `fotos/<ficheiro>`. Sem imagens de fora nem
  placeholders.
- Abre as fotos que vais usar em grande, não só a folha de contacto.
- Respeita a largura máxima e o ponto focal (`object-position`).
- As fotos que o `BRIEF.md` dá a uma secção são as que **podes** usar ali,
  não uma lista a cumprir. Uma foto fraca em grande estraga mais do que a
  ausência dela.
- Nada de filtros que mudem a luz.

## Funcionar

- 1440 × 900 e 390 × 844, sem scroll horizontal.
- Texto de corpo com pelo menos 16 px.
- No computador, a página não passa de 13 ecrãs de altura.
- Contactos clicáveis (`tel:` e `mailto:`).

## Entrega

- `prototipos/a.html`, `b.html` e `c.html`, cada um com o CSS num `<style>`,
  até cerca de 700 linhas.
- Em cada um, verificação e capturas:
  ```
  node .claude/skills/criar-base/scripts/verificar-prototipo.mjs casas/<slug>/prototipos/<letra>.html casas/<slug>/prototipos/BRIEF.md casas/<slug>/prototipos/fotos --prototipo
  node .claude/skills/criar-base/scripts/capturas.mjs casas/<slug>/prototipos/<letra>.html --saida casas/<slug>/arquivo/capturas/<letra>
  ```
  Olha para as capturas como o Diogo vai olhar: perde-se o fio? Alguma
  secção está cheia ou confusa? Afasta-se das inspirações? Corrige numa só
  passagem.
- Poupa passos: lê os ficheiros no mesmo passo, em paralelo; escreve cada
  protótipo inteiro de uma vez.
