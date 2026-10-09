# Casa do Valado (Resende): notas do site

## Base e pedido do Diogo (2026-10-02)

- **Base C** (Vale ao longe), escolhida sobretudo pela paleta: osso,
  verde-sombra, ardósia. Ver `prototipos/ESCOLHA.md`.
- O que pediu: gostou dos três, preferiu C; achou os protótipos muito
  estáticos e espera um site final bem mais vivo; não gostou de nenhum
  primeiro ecrã e quer uma foto panorâmica a ecrã inteiro, com o logótipo
  no canto superior esquerdo e uma frase grande (referência Aiskew Villa).

## O que o site leva

- **Primeiro ecrã:** `piscina-01` a ecrã inteiro, com o formato fixo das
  casas (logótipo à esquerda, título grande em serifa com itálico, duas
  ações). O movimento é o fixo de todas as casas e não foi mexido.
- **De A:** as colunas editoriais desencontradas (as fotos de "Lá fora",
  a grelha da casa de pedra, os quartos).
- **De B:** a linha do dia com ícones (piscina, deck, churrasqueira),
  só de coisas que a casa tem.
- **Fotos:** nenhuma foto ampliada. Os originais (~3000 px) aguentam.

## Polimento

Passou C para Next.js por secções e aplicou a pele de C ao primeiro ecrã,
ao cabeçalho e ao rodapé. Depois do segundo pedido do Diogo, o texto foi
reescrito (BRIEF.md com 7 secções e uma passagem no fim de cada uma). O
polimento mudou a fonte para Fraunces e deu cor às secções (verde-salva,
pedra, verde-sebe, azul-petróleo, acento barro). Tirou também a foto que
expandia a seguir ao primeiro ecrã e a foto solta do deck: nenhuma foto
fica sem texto.

## Interatividade

**Ronda 1 (substituída).** O efeito era "abre-se o vale" (`Janela`): cada
foto a toda a largura abria como uma janela. O Diogo não gostou da foto
que expandia a seguir ao primeiro ecrã ("existe muitas dessas") nem de
fotos sem texto, e pediu: "dar scroll no site tem de ser uma
experiência... tem de se perceber perfeitamente o seguimento". O
`Janela` saiu.
Depois o Diogo pediu o `Janela` de volta, mas só na foto larga da piscina
com a casa (`piscina-02`): a janela abre com o scroll e a legenda aparece
dentro da imagem, no canto inferior esquerdo, com véu só atrás dela, depois
de a abertura acabar; ao voltar atrás recua (verificado a 1440 e 390, com e
sem movimento reduzido).
A seguir, o Diogo pediu que esse `Janela` passasse a fundo de "Escolher
as datas": abre como janela até encher o ecrã, fica como fundo preso, e
o conteúdo assenta por cima com véu de 0,74 só atrás do texto, sem
mask-image. A legenda fica no canto, só no computador. Saiu de "Lá fora".

**Ronda 2: o fio do scroll.**

**Efeito marcante: os capítulos pousam uns sobre os outros**
(`src/components/Folha.tsx`). No fim de cada secção, a passagem fica
parada a 45% do ecrã. A folha seguinte, com a sua cor, sobe por cima, e a
de baixo recua um pouco (escala 0.955) e escurece. Vê-se ao mesmo tempo o
que sai e o que entra, de capítulo em capítulo: Lá fora (salva e
azul-petróleo), Por dentro (pedra), Para o fim do dia (osso), Quem
recebe (sebe), A poucos minutos (osso) e Escolher as datas (verde-sombra).
É feito com `position: sticky` e um `top` negativo calculado, sem scroll
a mais: não prende a página, e no telemóvel anda com o dedo e para com
ele. Só usa transform e opacity, e a folha tapada por inteiro deixa de
ser pintada. As posições medem-se no fluxo natural da página
(`src/lib/posicao.ts`), porque as secções presas mudam de sítio no ecrã.
As âncoras do menu também vão para a posição natural.

**Apoio:**
1. **As passagens são as dobradiças** (`Passagem.tsx`). O filete desce da
   secção que acaba e a frase assenta na ponta dele, ao ritmo do scroll.
2. **As vozes chegam como ditas** (`Voz.tsx`, com o ScrollReveal do React
   Bits em `reactbits/ScrollReveal.tsx`). As palavras acendem pela ordem
   em que foram ditas e só depois aparecem a tradução e o nome. Trocou-se
   o motor do original (o ScrollTrigger media mal as secções presas): só
   opacidade, sem blur.
3. **Um dia no jardim** (`DiaNoJardim.tsx`, ronda 3, refeita depois de
   "o espaço ficou demasiado vazio"): substitui a linha do dia. As fotos
   enchem o ecrã de ponta a ponta, presas ao scroll (100svh + 800 px):
   piscina, deck, pérgola e churrasqueira, com a seguinte a espreitar
   numa faixa à direita até cobrir a anterior. Sobre a foto, com véu só
   atrás, ficam o texto do momento e a legenda, e por baixo uma régua
   com os três ícones e um sol pequeno a correr. Com movimento reduzido,
   fica a linha do dia estática.

**Cortina das fotos de "À volta"** (`Cortina.tsx`, pedido do Diogo): cada
foto de atração abre com o scroll num clip-path inset da esquerda para a
direita, dentro da moldura, coluna a coluna, da mais perto para a mais
longe. No fim fica inteira, sem escala nem cor mudada, e o crédito nunca é
tapado. A primeira versão, com transform, dava frames longos na página
toda (medido em A/B), por isso ficou o clip-path.

**Ronda de 03/10 (pedidos do Diogo):** em "À volta", a Cortina deu lugar a uma pilha de cartões (`reactbits/ScrollStack.tsx`, motor próprio com sticky). Os quatro cartões ficam presos um a um, por ordem de distância; os de baixo só encolhem, e cada foto fica inteira com o crédito. Em "Escolher as datas" saiu o véu escuro: o conteúdo está num painel verde-sombra opaco, com a foto à volta. O DiaNoJardim passou a 900 px de percurso, com trocas mais longas, smootherstep e uma mola curta. A página fica em 12,91 ecrãs. Os frames de "Escolher as datas" no computador ficaram por confirmar: a máquina estava carregada.

**Ronda seguinte (03/10):** o Diogo achou o DiaNoJardim rápido. O percurso passou a 1595 px, com pausas explícitas: 140 px na primeira e na última foto, 290 px nas do meio, e trocas de 245 px. A altura saiu dos respiros entre secções e do respiro da janela de "Escolher as datas", que passou a 10svh. O conteúdo de "Escolher as datas" já não desvanece: o painel opaco sobe por cima da foto. A página fica em 12,89 ecrãs.

**Entradas de "Por dentro" e quartos (03/10):** em "Por dentro", cada foto ergue-se do fundo ao entrar (Foto com `ergue`: clip-path de baixo para cima e a moldura a subir), presa ao scroll e desencontrada na mesma linha. Nos quartos, os Bounce Cards do React Bits (`reactbits/BounceCards.tsx`, sem GSAP): polaroids em leque, com a legenda na margem. A entrada com mola está desenhada na curva do scroll e não corre sozinha. O rato ou o toque endireita o cartão e afasta os vizinhos. Com movimento reduzido ficam em grelha. A página fica em 12,94 ecrãs.

**Tempo da entrada em "Por dentro" (03/10):** o Diogo viu as fotos já abertas antes de lá chegar. A conta usava só o topo da foto, por isso uma foto alta abria toda com metade ainda fora do ecrã. Agora abre desde que o topo entra pelo fundo do ecrã até o centro chegar ao meio, e a borda fica sempre à vista. Só "Por dentro" usa esta entrada (`ergue`).

**Revelações (não contam para o orçamento):** `Revelar` passou a estar
preso ao scroll, igual em toda a página e sem nada a correr sozinho
depois do gesto. Cada foto chega com o seu texto e assenta na moldura,
com a escala a passar de 1.07 para 1 (`Foto.tsx`). Os botões respondem
ao toque com `scale(0.97)`.

**Orientação:** um fio cor de barro no fundo do cabeçalho mostra quanto
da página já se leu. No computador, o capítulo que está a meio do ecrã
fica sublinhado no menu.

Não animado de propósito: as notas das plataformas (contá-las a subir
mostraria notas erradas a meio), as fotos ao passar o rato (não são
clicáveis) e o menu do telemóvel. O primeiro ecrã não foi mexido.

Com movimento reduzido, as secções ficam umas a seguir às outras, sem
nada preso, e todo o texto está inteiro. Não há Lenis.

Ficou de fora: um respiro por baixo da última passagem de cada secção,
para ela se ver mais tempo enquanto a folha seguinte sobe. Fazia a
página passar o limite de 13 ecrãs do verificador.

## Verificação (2026-10-02, ronda 2)

- `npm run build` sem erros; verificador `ok`, sem falhas nem avisos.
- Percurso em produção a 1440 e 390, de cima a baixo e de volta, com e
  sem movimento reduzido: sem erros na consola e sem scroll horizontal.
  Frames a 16,7 ms (mediana e p95), sem nenhum acima de 50 ms. As âncoras
  caem no topo da secção (a 80 px) mesmo a partir do fundo da página. Com
  movimento reduzido fica todo o conteúdo visível.
- Corrigido no caminho: a Folha sem `ref` (nunca prendia), as âncoras a
  cair na posição presa e o menu sem capítulo marcado com movimento
  reduzido.

## Por confirmar com o dono antes de publicar

- Telefone (911 505 394) e email (wearecasadovalado@gmail.com).
- Que canal mostrar primeiro (Booking ou Airbnb).
- Check-in a partir das 15:00.
- A composição dos quartos (dois de casal e um com duas individuais).
- As regras de animais e de fumar fora do Booking e do Airbnb.
- O código postal (o site mostra só "Rua Valado 321, Resende").
- A capacidade (não aparece no site).
- Quem recebe hoje e com que nome (Manuel? o "jovem proprietário"?).
- A época em que a piscina está aberta.
- A permissão para usar as fotografias.
- 04/10/2026: telemóvel: email do fecho parte antes do @ (wbr), áreas de toque de 44 px no cabeçalho, rodapé e contactos, corpo a 16 px e notas legais a 14 px.
