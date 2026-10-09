# Pesquisa v2 — catálogo de protótipos

Pesquisa revista em 2026-09-20 depois da primeira avaliação visual. Este
documento regista padrões e decisões; não é uma lista de páginas a copiar.

## Fontes observadas

- **Pinterest** — pesquisa ampla por `boutique hotel website`, `hospitality
  website oversized typography`, `villa website scroll animation` e layouts
  editoriais. Foi usado para perceber recorrências visuais: fotografia total,
  serifas grandes, informação curta nas margens, colagens controladas e
  transições que prolongam a imagem. Um pin isolado nunca é prova de
  usabilidade.
- **Refero Styles** — vocabulário de composição, escala tipográfica,
  sobreposição e ritmo.
- **Dribbble** — direções visuais de hotelaria, incluindo StayGo, Hota Grand e
  Le Mont & Miel. Serve para abrir hipóteses, não para validar interação.
- **React Bits** — mecanismos possíveis: máscaras, profundidade, carrosséis e
  movimento ligado ao scroll. O efeito deve servir a hierarquia.
- **Sites e estudos de hotelaria** — Piaule, The Standard, Post Ranch Inn,
  Zero George, The Newt, The LINE, The Roundhouse, The Claremont, Merrill
  House, Press Hotel, The Killarney Park, Visit Lake Tahoe e Veyranta.
- **Lumière no próprio repositório** — referência técnica principal para o
  nome que nasce grande, acompanha o scroll e assenta no cabeçalho.

## O que a pesquisa mostrou sobre heros

Os heros modernos fortes de alojamento não variam tanto na estrutura como a
primeira ronda sugeria. A família dominante é estável:

1. uma fotografia real, larga e específica do lugar;
2. pouco texto, com uma promessa legível e um único caminho de reserva;
3. navegação leve sobre a imagem;
4. variação através da escala e posição do nome, do recorte inicial da imagem
   ou da passagem para a secção seguinte;
5. no telemóvel, a mesma intenção sem depender de uma coreografia longa.

A primeira ronda falhou porque H2, H3 e H4 eram gramáticas demasiado
diferentes do H1. Pareciam secções ou conceitos independentes, não variações
seguras do mesmo hero. A v2 mantém quatro opções dentro da mesma família:

- **H1 — Cinema silencioso:** base aprovada, estática e segura.
- **H2 — Nome que assenta:** comportamento inspirado na Lumière; o nome é a
  primeira imagem tipográfica e termina como marca no cabeçalho.
- **H3 — Imagem que respira:** recorte editorial que expande até full bleed.
- **H4 — Abertura para a casa:** uma única fotografia abre e revela a secção
  seguinte; não usa duas fotografias concorrentes.

### Posição de título e subtítulo

- O título deve ocupar uma zona com contraste natural da fotografia, não uma
  coordenada fixa para todas as casas.
- Título e subtítulo não devem competir: quando o título está centrado, a
  descrição fica curta; quando o título está em baixo à esquerda, a descrição
  pode equilibrar o lado oposto.
- O CTA fica separado da mancha de texto para continuar encontrável.
- Cada hero declara o tipo de fotografia que aceita. Se o enquadramento não
  tiver espaço negativo suficiente, a skill deve escolher outro hero.

## O que mudou nas restantes secções

- **PI2, A2 e O2** foram retirados da seleção: foram rejeitados e não traziam
  valor suficiente para justificar manutenção.
- **PI3** ficou mais baixo e os cartões mais pequenos.
- **A1** passou a reservar texto para casa, história e região, em vez de uma
  descrição curta genérica.
- **P5** ganhou fundo claro, livro quase à altura total do ecrã e estampas
  maiores nas páginas.
- **E2 e E5** passam a ficar livres depois da primeira travessia: ao regressar
  para cima não obrigam a rever cada espaço e mostram setas, como E1.
- **O3 e F3** rodam várias avaliações a cada quatro segundos e mantêm controlo
  manual por setas.
- **F2** deixou de simular duas placas verdes e passou a representar um portão
  de madeira sóbrio, plausível tanto numa casa antiga como contemporânea.

## Regras que reduzem erro na futura skill

- Escolher primeiro a fotografia e só depois o hero compatível com o seu
  assunto e espaço negativo.
- Nunca usar stock quando existem imagens reais do alojamento.
- Não criar uma nova mecânica se uma variante aprovada resolver a intenção.
- A liberdade do agente fica na direção de arte: corte, alinhamento, escala,
  duração e transição. Estrutura, CTA, acessibilidade e comportamento mobile
  continuam limitados pelo protótipo.
- Autoplay de avaliações: 4 s, setas sempre disponíveis e sem movimento quando
  o utilizador pede movimento reduzido.
- Uma secção presa pelo scroll só prende na primeira descida.

## Critérios para aprovar

- A ideia percebe-se em cinco segundos.
- A foto e o texto falam exatamente do mesmo assunto.
- O hero continua reconhecível como parte da mesma biblioteca.
- A secção é legível sem animação e não cria scroll horizontal.
- O telemóvel é composto de propósito, não apenas encolhido.
- O protótipo pede conteúdo que normalmente existe num primeiro contacto com
  o cliente; se exigir material raro, deve ter fallback explícito.
