# Quinta de Canhões — decisões de design

Pesquisa e citações de origem em `../../quinta de canhoes/PESQUISA.md`.

## A lógica

A entrada é um resumo que converte. Diz o mínimo, deixa uma frase no ar e manda para a página que aprofunda. O detalhe vive nas páginas interiores.

### Entrada `/`

| Secção | Diz | Deixa no ar | Leva a |
|---|---|---|---|
| Hero | «Acorde com o vale à janela» | Que casa é esta? | — |
| Maneiras de ficar | Três quartos, salões de pedra | «Escolher qual é a parte difícil.» | `/os-quartos` |
| Desde há cem anos | Casa centenária, granito à vista, o vermelho de sempre | Quem a recebe? | `/a-casa` |
| À volta | Quatro cartões em pilha: Termas, Vouga, serra, Viseu | Já me imagino lá | — |
| Fecho | Cartão branco sobre a piscina, CTA e reviews a passar | — | `/reservar` |

Cinco secções. A região deixou de ter página própria: uma pilha de quatro cartões chega.

### Páginas interiores

`/a-casa`, `/os-quartos`, `/reservar`. Cada uma fecha a empurrar para a seguinte.

## Tipografia

**Young Serif** para títulos. Serifa antiga de traço grosso e cunhas largas, um só peso, lê-se pesada e talhada. Substituiu a Fraunces, que era demasiado quirky e pouco rústica. **Karla** para texto.

As classes `.rustico` e `.rustico-medio` em `globals.css` só afinam o espacejamento conforme o tamanho.

## Hero

A fotografia é `hero.png`, servida em PNG sem perdas e convertida pelo `next/image` a qualidade 96. A versão anterior perdia saturação porque eu a tinha reencodado para JPEG e porque tinha dois véus escuros por cima. Agora há um só véu, leve, e as cores da fotografia vêem-se.

O título não é o nome da casa, é o que se sente lá. O nome fica na etiqueta por cima e no cabeçalho.

## Paleta

| Token | Valor | Papel |
|---|---|---|
| `cal` | `#f8f4ed` | Fundo principal e cartões |
| `cal-fundo` | `#f2ece1` | Maneiras de ficar e história |
| `granito-linha` | `#d2c8b5` | Filetes |
| `xisto` | `#221f1b` | Texto |
| `xisto-suave` | `#5e584e` | Texto corrido |
| `caixilho` | `#7a2b2b` | Acento, do vermelho dos caixilhos da casa |
| `vale` | `#2c3729` | À volta e rodapé |

## React Bits

**`ScrollStack`** na secção da região, vendorizado em `components/reactbits/`. Duas adaptações necessárias:

1. Em modo `useWindowScroll` criava um segundo Lenis sobre a window, que disputava o scroll com o global de `ScrollSuave`. Passou a ouvir o evento de scroll, que o Lenis global também dispara.
2. O `ScrollStackItem` impunha altura, padding e cantos. Ficou só com o que a animação precisa.

**Não há MCP do React Bits configurado** neste repositório, só o Playwright. Os componentes vieram do repositório deles, da variante TypeScript com Tailwind.

**As reviews não usam React Bits.** Nenhum componente deles serve: o `Carousel` tem largura fixa em pixéis, roda os cartões em 3D e depende do `react-icons`, o que briga com um painel responsivo e com o tom calmo do site. O `Stack` e o `CardSwap` são ainda mais exibicionistas. `components/Rotativo.tsx` faz o que era preciso em cinquenta linhas com o Motion que já está instalado: passa um a um, pára ao passar o rato e com o separador escondido, mede o mais comprido para a caixa não saltar, e fica estático se o sistema pedir menos movimento.

## Fotografias da região

Quatro lugares reais, do Wikimedia Commons, sem marca de água, com crédito no fim da secção. As primeiras que encontrei eram todas do mesmo fotógrafo e tinham a assinatura dele gravada na imagem, o que não serve.

| Cartão | Autor | Licença |
|---|---|---|
| Termas | Vitor Oliveira | CC BY-SA 2.0 |
| Linha do Vouga | Pedro | CC BY 2.0 |
| Serra | LuisMAfonso | CC BY-SA 4.0 |
| Viseu | Balticman | CC BY-SA 3.0 |

Os originais estão em `../pesquisa/regiao/originais/`; as cópias reduzidas e o `creditos.json` em `../pesquisa/regiao/`.

## Ainda por confirmar com os donos

1. A história da casa. Não existe documentada, só a palavra centenária.
2. Se alugam a casa inteira além de quarto a quarto.
3. Se querem preços no site.
