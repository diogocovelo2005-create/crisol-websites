# Adaptação: Casa de Fataunços (Fataunços, Vouzela)

Projeto copiado de `clientes/alojamento-molde` a 2026-09-17. Servidor local:
http://localhost:3101 (`npm run dev -- -p 3101`).

Conteúdo e fotografias vêm do dossiê
`alojamento/clientes/casa-de-fatauncos-vouzela/dossie/`. A casa é um
**Empreendimento de Turismo de Habitação (RNET 5352)**, não um alojamento
local, e fica no concelho de **Vouzela** (não São Pedro do Sul).

## Mapa

- Secções e ordem: Hero, Pilares, Atmosfera, UmDia, ACasa, Provas, Fecho
  (definida em `src/app/page.tsx`); cabeçalho e rodapé fora do `main`.
- Cores: `src/app/globals.css` (`@theme`). Cores fora do tema:
  `src/components/seccoes/UmDia.tsx` (a luz do dia e a sombra das fotos),
  `src/components/Botao.tsx` (o `hover` do botão de ouro),
  `src/components/seccoes/Atmosfera.tsx` (sombra da foto pequena),
  `src/components/seccoes/ACasa.tsx` (`tint` do DepthCarousel),
  `src/app/globals.css` (o véu do hero, em `rgba`).
- Fontes: `src/lib/fontes.ts` (variáveis `--fonte-display` e `--fonte-corpo`,
  lidas no `@theme`).
- Conteúdo: `src/lib/casa.ts` (tudo; cada campo com a fonte no comentário).
- Animação: `motion` 13 + `lenis` (scroll suave, `src/components/ScrollSuave.tsx`);
  progresso por hook próprio `src/lib/useProgresso.ts` (modos `preso`,
  `entrada`, `passagem`) — **não** `useScroll({target, offset})`, que sai
  errado com secções `sticky`.
- Fotos: `tools/imagens.mjs` (grade própria, lê de `.imagens-bruto/<id>.jpg`).

## Secções

### Hero (`seccoes/Hero.tsx`)
- Conceito: o convite. A página fica presa, a câmara avança pela casa e a
  promessa dá lugar à voz de quem recebe.
- Trabalho: curiosidade; chegar à porta e ser recebido antes de ver factos.
- Máquina: wrapper `h-[150vh] md:h-[190vh]` + `sticky top-0 h-dvh`;
  `useProgresso(alvo,'preso')`; dois tempos de texto (promessa, voz) e um véu;
  ramo estático para movimento reduzido; `#sentinela-topo` controla o fundo do
  cabeçalho.
- Gesto (base do molde): escala da foto 1.02 -> 1.2; a promessa sai para cima
  (`opacity 1->0`, `y 0->-50`) e a voz entra de baixo (`0->1`, `y 40->0`).
  **Mudado nesta adaptação:** ver "Gestos aplicados".
- Observado (1440x900, wrapper 1710px, curso 810px): promessa 1 / 0.56 / 0 em
  p=0 / 0.1 / 0.2; voz 0 até p=0.3, 0.2 em 0.4, 0.7 em 0.5, 1 de 0.6 a 1;
  foto 1.02 -> 1.2 linear.
- Invariantes:
  1. Em nenhuma posição os dois textos têm opacidade acumulada > 0.1 ao mesmo
     tempo (medido: promessa chega a 0 em p=0.2; a voz só passa de 0 em p=0.4).
  2. Em p=0, o `h1` e os dois botões estão dentro da janela, com opacidade 1.
  3. Em p=1 a voz tem opacidade 1 e fica parada.
  4. A altura presa não aumenta (150vh / 190vh).

### Pilares (`seccoes/Pilares.tsx`)
- Conceito: o essencial num relance, sem prender nada.
- Máquina: grelha 2/4 colunas, `Revelar` com atraso `i*0.07`; ícones Phosphor.
- Gesto: entrada única (do `Revelar`): `y 22 -> 0`, 0.75s.
- Invariante: nada fica preso ao scroll; tudo assenta em menos de 1s.

### Atmosfera (`seccoes/Atmosfera.tsx`)
- Conceito: a história da casa, com duas fotos a velocidades diferentes.
- Máquina: `useProgresso(colagem,'passagem')`; foto grande + foto pequena
  sobreposta; texto à esquerda.
- Gesto: `y` de 30 a -30 (grande) e de 110 a -110 (pequena).
- Invariante: o texto fica parado e legível; as fotos nunca o cobrem.

### UmDia (`seccoes/UmDia.tsx`) — o pico
- Conceito: um dia inteiro na casa só com o scroll. Três partes (Manhã,
  Tarde, Noite), duas fotografias por parte a cair como provas em papel, a
  cor da página a seguir a luz e a linha do dia com o sol.
- Máquina: wrapper `h-[300vh] md:h-[380vh]` + `sticky top-0 h-dvh`;
  janelas 0.05-0.38, 0.38-0.69, 0.69-1.01; silêncio inicial com o título;
  ramo estático para movimento reduzido.
  Medido: 3420px de altura no computador (840px de scroll por parte do dia)
  e 2532px no telemóvel (563px por parte). A altura foi aumentada a pedido
  do Diogo (estava em 240/300vh, ~390/594px por parte, e as partes trocavam
  depressa demais); as frações das durações foram encurtadas na proporção
  inversa (1.26x) para a queda das fotografias manter o mesmo ritmo em
  pixeis: `cai` +0.025, `assenta` +0.115, `visivel` +0.04, `some` +0.108,
  e o `t` do Momento 0.11 (telemóvel) / 0.095 (computador).
  A **segunda** fotografia de cada parte é mais lenta do que a primeira, a
  pedido do Diogo: espera 0.038 em vez de 0.025, assenta em 0.145 em vez de
  0.115 e a opacidade fecha em 0.058 em vez de 0.04. Medido na Manhã: a
  primeira chega a 1 em p=0.09 e a segunda só em p=0.15, ou seja cerca de
  150px de scroll depois.
- **Esta secção já foi decidida e afinada com o Diogo antes desta adaptação**
  (protótipo "pilha", três rondas de afinação). Não se muda aqui o gesto.
- Invariantes:
  1. Nunca há duas partes do dia com opacidade > 0.1.
     Medido depois de alongar a secção, nas 11 posições: o máximo de
     sobreposição é 0.09 (computador) e 0.07 (telemóvel).
  2. A última parte fica parada no fim da secção (opacidade 1 de p=0.8 a 1).
  3. O nome da parte do dia (Manhã/Tarde/Noite) está sempre legível.
  4. A fotografia panorâmica da noite ocupa a largura toda da mesa e não é
     cortada: o `aspeto` no conteúdo é o do original (2172/724) e o ficheiro
     em `public/fotos/` tem exactamente esse tamanho, por isso o
     `object-cover` não corta nada. Medido: 707x236 no computador.
     Nota: sem corte, a altura máxima possível é esta. Para ficar mais alta
     teria de ser cortada outra vez, ou de sair da coluna e ser cortada pela
     borda do ecrã.

### ACasa (`seccoes/ACasa.tsx`)
- Conceito: a visita aos espaços, pela ordem por que se andam.
- Trabalho: calma depois do pico; "escolher por onde ir".
- Máquina: no computador secção presa com altura `100vh + distancia` medida
  da pista; no telemóvel/tablet `DepthCarousel` arrastável; ramo estático
  para movimento reduzido. 8 espaços (a ordem é a que o Diogo pediu:
  piscina, quartos, salas de jogos, salões, campo de ténis, sala de
  refeições, parque infantil, parque).
- Gesto: a pista anda em `x` de 0 a `-distancia` entre p=0.08 e p=0.92;
  `hover:scale-[1.04]` nas fotos.
- Observado (1440x900): com 8 cartões, o último acaba em x=1400, dentro da
  janela (com 7 era o mesmo valor: a pista mede-se sozinha).
- Invariantes:
  1. Em p=1 o último dos 8 cartões está dentro da janela (medido: 1400 < 1440).
  2. Nome e nota de cada cartão sempre legíveis.
  3. Nada avança sozinho.

### Provas (`seccoes/Provas.tsx`)
- Conceito: confiança calma perto da decisão; uma citação de cada vez.
- Máquina: estado `i`, setas, pontos, `aria-live`; não roda sozinho.
- Gesto: troca com `opacity` + `y` 8px, 0.35s.
- Invariante: a nota média está sempre visível; a troca é sempre por clique.

### Fecho (`seccoes/Fecho.tsx`)
- Conceito: a fotografia cresce até ao ecrã inteiro e fica; o fim resolve.
- Máquina: `useProgresso(alvo,'entrada')` (a página não prende); o texto
  existe **duas vezes** (cópia escura por baixo, cópia clara por cima
  recortada com o mesmo `clip-path` da foto); a cópia escura é `aria-hidden`
  e fora da ordem do teclado; no telemóvel a moldura inicial é medida a
  partir do bloco de texto (`ResizeObserver`); ramo estático para movimento
  reduzido.
- Gesto (base do molde): `clip-path` de `inset(22% 24% 22% 22% round 10px)` a
  `inset(0 round 0)` e escala da foto de 1.25 (1.1 no telemóvel) a 1.
  **Mudado nesta adaptação:** ver "Gestos aplicados".
- Observado (1440x900): no início 21.99%/escala 1.25; no fim 0.006%/1.00007.
- Invariantes:
  1. Em p=1 a foto cobre os quatro cantos (`inset` <= 0.1%) e fica parada.
  2. As duas cópias do texto têm a mesma geometria (mesma caixa do `h2`).
  3. O botão Reservar está clicável no estado final.

## Bugs do template encontrados

- Nenhum no comportamento das animações. Duas notas, não corrigidas aqui:
  - a medição do Fecho muda de posição enquanto a página cresce (a visita aos
    espaços mede a pista depois de montar), o que torna a leitura das 11
    posições instável se a zona for calculada uma só vez; medindo a zona a
    cada posição, o comportamento é o esperado;
  - `casa.contacto.whatsapp` era obrigatório para o segundo botão do Fecho.
    Esta casa não tem WhatsApp publicado, por isso o botão passou a ser uma
    chamada telefónica. É conteúdo, não bug.

## Decisões (Fase 2)

Registo lido: `clientes/VARIACOES.md` (não existia; criado com o template
original como primeira linha).

**Vibe:** solar setecentista que é uma casa-museu viva, de família, com um
parque à inglesa onde o tempo para.

| O quê | Escolha | Porquê |
|---|---|---|
| Paleta | fundo cal fria `#ecebe4`, escuro verde-portada `#24352c` / `#1b281f`, destaque castanho da placa `#6b4c3b` / `#533a2c` / `#c9a184`, tinta `#1d2220` / `#575d56` | Vem das fotografias: paredes de cal, cantaria de granito cinza-azulada, portas e janelas em verde escuro. O destaque é o castanho da placa de madeira que está à porta da casa (escolha do Diogo, depois de ver a versão em terracota da telha): muda de família face ao dourado do molde, e o fundo passa de linho quente a cal fria. |
| Fonte | títulos **Bodoni Moda**, texto **Mulish** | A casa é senhorial e o argumento é a arte: pede a serifa de contraste alto e ar de gravura, com itálico verdadeiro para a palavra em destaque. Diferente de Cormorant Garamond (única linha do registo). O Mulish sussurra por baixo e faz bons versaletes. |
| Ordem | **igual ao template** | A casa vende-se pelos espaços, o que pediria a visita antes do pico, mas a visita está presa ao scroll e ficaria imediatamente antes do pico (também preso): quebrava duas regras de `ordem.md` (nunca duas secções presas seguidas; há sempre uma secção calma antes do pico). |
| Personalidade de movimento | **Cortina** (máscaras que revelam: faixas, arcos, janelas a abrir) | A casa é feita de janelas e portas de cantaria, e o ar é editorial, de museu. O molde é "Câmara", por isso não se repete a personalidade da última linha do registo. |
| Gestos mudados | 2 secções: Hero e Fecho (e a máscara em arco das fotos da visita, que é a mesma linguagem) | Ver abaixo. |

### Calibração da cor dos botões (com o Playwright)

O Diogo pediu que os botões Reservar ficassem com a cor **e os frisos** da
placa de madeira que está à porta da casa. Foi medido, não escolhido a olho:

1. Amostra da madeira na fotografia que o site serve (`public/fotos/hero.jpg`,
   duas faixas de tábua sem letras): **#4f3831**.
2. O botão já desenhado, com os frisos por cima, medido em duas faixas
   (topo e base, fora do texto): **#523c35** de média, com o veio a variar
   +-3 a 5 níveis (topo #59433b, base #4b352e, como uma tábua com luz de
   cima).
3. **Distância RGB entre os dois: 6** (abaixo de 12 não se distingue).

O veio foi refeito depois de o Diogo mandar uma fotografia de uma tábua de
acácia: as primeiras linhas eram regulares, de 4px e 7px, e liam-se como
plástico. Agora o desenho é um `feTurbulence` (ruído fractal) num SVG
embutido no CSS, com frequência muito baixa em X e alta em Y — dá fibras
compridas, irregulares e todas diferentes, como numa tábua. Chegou a haver
uma segunda camada de fibras claras, mas lavava a cor (o castanho ficava
cinzento) e saiu.

Valores finais: token `ouro` **#5f4239** (o ruído escurece a média ao
desenhar, por isso o token é mais claro do que o alvo), veio a variar +-6
níveis. Medido: **placa #4f3831, botão #4b362e, distância 5**; contra a placa
como se vê no ecrã, debaixo do véu do hero (#463932), distância 7.

Nota: no hero, a placa **na página** parece mais escura do que o botão, porque
está debaixo do véu do hero (o gradiente que escurece a faixa do texto). A cor
da madeira em si é a mesma.

### Gestos aplicados (2 secções, personalidade Cortina)

**Hero — os textos trocam por cortina, não por deslize.**
A promessa fecha-se de baixo para cima (`clip-path` de `inset(0%)` a
`inset(0% 0% 100%)`, entre p=0.02 e p=0.20) e a voz de quem recebe abre-se
de cima para baixo (`inset(0% 0% 100%)` a `inset(0%)`, entre p=0.36 e p=0.60),
como a portada de uma janela. As translações em `y` saíram. As rampas de
opacidade ficaram (é o que garante, e permite medir, que nunca há dois textos
visíveis). A escala da fotografia não mudou: é a máquina da secção a fazer o
mesmo trabalho.
Também se reforçou o véu do hero (o gradiente da esquerda, de 0.58 para 0.72),
porque a fachada desta casa é de cal branca ao sol e o título claro passa-lhe
por cima.

**Fecho — a moldura passa a ser um arco de porta.**
O `clip-path` começa em `inset(22% 24% 22% 22% round 50% 50% 8px 8px)`: os
cantos de cima abertos a 50% desenham um arco, como as portas de cantaria da
casa. O arco endireita-se enquanto a fotografia cresce e acaba em
`inset(0% round 0)`, ecrã inteiro. No telemóvel a mesma coisa, com 40% de
arco sobre a moldura medida ao bloco de texto. A escala (1.25 -> 1) não mudou,
e as duas cópias do texto continuam a usar a MESMA máscara, que é o truque
estrutural da secção.

**A visita aos espaços ficou com o gesto do molde.** Pensou-se em pôr as
fotografias em arco, para repetir o motivo, mas no telemóvel a secção usa o
`DepthCarousel` (biblioteca externa) e o arco só apareceria no computador: a
mesma secção com duas formas diferentes. Duas secções mudadas cumprem o
limite da skill (2 ou 3).

Correspondência dos nomes de cor (os nomes do tema não mudam, mesmo quando
deixam de descrever a cor):

| Token | Molde | Fataunços | O que é agora |
|---|---|---|---|
| `linho` | #f5f0e7 | #ecebe4 | cal fria das paredes |
| `linho-escuro` | #ebe3d5 | #e1dfd5 | a mesma cal, um tom abaixo |
| `cartao` | #fbf8f2 | #f6f5f0 | cal quase branca |
| `tinta` | #22261f | #1d2220 | quase-preto com verde do granito |
| `tinta-medio` | #5d5f55 | #575d56 | cinza esverdeado |
| `floresta` | #2e3a2b | #24352c | verde das portadas |
| `floresta-fundo` | #24301f | #1b281f | o mesmo verde, mais fundo |
| `ouro` | #b28a4f | #6b4c3b | castanho da placa de madeira (o CTA) |
| `ouro-escuro` | #8c6a36 | #533a2c | o mesmo castanho, mais fundo (etiquetas) |
| `ouro-claro` (novo) | (nao existia) | #c9a184 | a madeira clareada, so sobre fundo escuro |
| `osso` | #f7f2e9 | #f7f4ec | branco de cal |
| `noite` | #151a13 | #111a14 | o verde no escuro |

## Verificação (Fase 4)

Medida ao vivo com o Playwright em http://localhost:3101, a 1440x900 e a
390x844, depois de cada passo (paleta, fonte, gesto do hero, gesto do fecho).

### Invariantes

| Secção | Invariante | Medido | Resultado |
|---|---|---|---|
| Hero | nunca dois textos com opacidade > 0.1 | promessa 1 / 0.56 / 0 em p=0 / 0.1 / 0.2; voz 0 até p=0.3, 0.5 em 0.4, 1 de 0.5 a 1 | passou |
| Hero | em p=0 o título e o botão dentro da janela, opacidade 1 | h1 em 266-368 e botão em 572-621 (telemóvel, janela 844); botão em 651-702 (computador, janela 900) | passou |
| Hero | em p=1 a voz fica a 1 e parada | opacidade 1 e `inset(0%)` de p=0.6 a p=1 | passou |
| Hero | a altura presa não aumenta | `h-[150vh] md:h-[190vh]`, wrapper 1710px a 1440x900 (igual à base) | passou |
| Fecho | em p=1 a foto cobre os quatro cantos e fica parada | `inset(0.003% ... round 0.007%)` em p=1 | passou |
| Fecho | as duas cópias do texto têm a mesma geometria | caixa do `h2` igual nas duas em todas as 11 posições (ex.: [92, 731, 706]) | passou |
| Fecho | o botão Reservar clicável no estado final | 51px de altura, dentro da janela, em todas as posições | passou |
| ACasa | em p=1 o último dos 8 cartões está dentro da janela | cartão acaba em x=1400 (janela 1440) | passou |
| UmDia | nunca duas partes do dia com opacidade > 0.1; a última fica parada | já medido nas três rondas de afinação do protótipo; secção não alterada nesta adaptação | passou (antes) |

### Gerais

| # | Verificação | Resultado |
|---|---|---|
| 1 | Consola (percorrer a página inteira, 1440 e 390) | passou: 0 erros |
| 2 | Sem scroll horizontal | passou: `false` a 1440 e a 390 |
| 3 | Botões numa só linha | passou: 51px nas secções, 41px no cabeçalho (o tipo pequeno), nenhum mais alto do que os irmãos |
| 4 | Primeiro ecrã completo | passou nos dois tamanhos (ver invariantes do hero) |
| 5 | Contraste (`scripts/contraste.mjs`) | passou: tinta/cal 13.5 · tinta-medio/cal 5.66 · osso/verde 11.8 · osso/castanho 7.02 · castanho/cal 6.45 · ouro-escuro/cal 8.74 · ouro-claro/verde-fundo 6.51 · ouro-claro/verde 5.50 · osso/hover 5.58 |
| 6 | Telemóvel (390x844) | passou: secções presas prendem e soltam, nada cortado; a linha do dia não toca o texto |
| 7 | Movimento reduzido | passou: 8.2 ecrãs de altura (sem prisões), 0 títulos invisíveis, 0 erros |
| 8 | Links e âncoras | passou: `#a-casa`, `#espacos`, `#opinioes`, `#reservar` existem e são únicos |
| 9 | Build de produção | passou: `npm run build` sem erros (Next 16.3.5) |
| 10 | Travessões no texto visível | passou: 0 ocorrências de `—` e `–` |
| 11 | Cores antigas do molde no código | passou: nenhum dos 16 hexadecimais do molde sobrou (fora do `DepthCarousel`, biblioteca externa com os seus próprios valores por defeito, não usados aqui) |

### Recuos

- Nenhum. As duas alterações de gesto passaram à primeira medição.
- A paleta foi ajustada uma vez depois de o Diogo ver o site: o destaque
  passou de terracota (#cf7a4f) para o castanho da placa de madeira da casa
  (#6b4c3b), a pedido dele. Com o castanho, o texto do botão teve de passar
  de escuro para claro e nasceu um token novo, `ouro-claro` (#c9a184), para
  os rótulos que ficam sobre fundo escuro, onde o castanho não passa
  contraste. O nome dos tokens antigos não mudou.
- A frase de abertura do hero foi reescrita a pedido dele: era descritiva
  ("Um solar do século XVIII onde o tempo para") e passou a um facto concreto
  que desperta curiosidade ("Há três pianos nesta casa", do Booking).
- O segundo tempo do hero (a `voz`) mudou duas vezes, a pedido dele. Era a
  frase do proprietário no iNature ("Aquela casa só tinha dois futuros
  possíveis..."), que explicava a decisão da família e não dava vontade de
  visitar. Passou pela frase da casa sobre o parque "ao melhor que os jardins
  ingleses nos oferecem" e, porque essa afirmação é forte demais para se
  assumir como nossa (é a casa que a escreve no Booking, não um facto), está
  agora em **"A Casa respira música."** — também da casa, no Booking, curta e
  sustentada (três pianos em salões diferentes e uma coleção de vinis).
- O título e o texto do hero foram reescritos para serem poéticos e não
  vendedores, também a pedido dele: saíram "Há três pianos nesta casa" e a
  enumeração de salões/arte/hóspedes que ficam mais uma noite.
- Ronda seguinte, ainda a pedido dele: "A Casa respira música" saiu do segundo
  tempo e o seu lugar passou a ser da frase **"Uma casa de setecentos, e o
  parque que lhe cresceu à volta."**, que estava no título. O título ficou com
  uma frase curta que diz a casa em poucas palavras: **"Um solar de família,
  feito para se usar."** (solar, de família, e tudo aberto a quem fica — a
  casa diz no Airbnb "Toda a casa está disponível para os meus hóspedes").
  Como a frase do segundo tempo passou a ser nossa e não citada, o `Hero`
  deixa de pôr aspas e de mostrar a assinatura quando `quem` está vazio.
- Ronda final: o título é **"Uma casa feita de histórias."** (dado pelo
  Diogo) e o segundo tempo passou a uma frase mais longa, que descreve a casa
  em vez de a resumir: **"Está na mesma família desde 1896. Ficaram os
  retratos, os livros de seiscentos, os três pianos e as árvores que alguém
  plantou pequenas. Tudo continua a usar-se."** Cada coisa nomeada está no
  dossiê (compra em 1896 pelo bisavô; retratos de família nos salões; livros
  do séc. XVII; três pianos em salões diferentes; cedros antigos no parque; a
  casa toda disponível para os hóspedes). Medido: 5 linhas, dentro da janela
  a 1440x900 (320 a 580) e a 390x844 (310 a 534).
- E última troca, também a pedido dele: o segundo tempo tem de ser uma frase
  **já dita pela casa**, e não uma nossa nem uma repetição da secção da
  história. Ficou a primeira parte da frase com que a casa se apresenta no
  Booking, seguida à letra, com os acentos repostos e "sec XIX" por extenso
  (o original tem gralhas de teclado):
  **"Hospedar-se na Casa de Fataunços é recriar por si o ambiente romântico
  do século XIX, na vivência dos seus salões."** Volta a ter aspas e
  assinatura, porque é citação. Medido: 3 linhas a 1440x900 (349 a 505) e 5 a
  390x844 (319 a 479), com a assinatura dentro da janela nos dois.
- A pedido dele, a frase passou a estar **inteira**: "…, na vivência dos seus
  salões e no requinte na decoração dos seus quartos, mas com todas as
  comodidades do presente." Autoria confirmada ao vivo no Booking a
  2026-09-18 (bloco "Gerido por Pedro Meneses", perfil do anfitrião; prova no
  dossiê). Medido: 6 linhas a 1440x900, 8 a 390x844 e 9 a 375x667; em todos
  começa abaixo do cabeçalho e a assinatura acaba dentro da janela (629/900,
  573/844, 500/667).
- A palavra "jardim inglês" saiu também da introdução dos espaços (era
  atribuída aos hóspedes, mas é a própria casa que usa a expressão no
  Booking): passou a "um parque de árvores antigas com recantos de sombra".

### Não verificado

- Telemóvel real: o Playwright simula o tamanho, não o aparelho (nem o toque,
  nem o scroll do dedo, nem o Safari do iPhone).
- Leitores de ecrã: nenhum foi corrido.
- Velocidade de carregamento em rede lenta.
- A qualidade das fotografias fracas impressas em ecrãs grandes (>1600px):
  as do site antigo só existem a 829 px de largura.

## Fotografias (estado a 2026-09-17, segunda volta)

O Diogo ampliou entretanto oito originais, e as fotos da página foram
refeitas a partir deles. O tratamento mudou em consequência: as que vêm em
boa resolução **não** levam nitidez artificial nem grão reforçado (estragava
o detalhe que têm) e nenhuma foto é ampliada além do que o original dá. A
qualidade do JPEG subiu de 86 para 92.

| Secção | Foto | Original | Estado |
|---|---|---|---|
| Hero | `exterior_01.png` 1608x978 | ampliado | bom |
| A casa (grande) | `exterior-04.jpg` 2528x1684 | ampliado | bom |
| A casa (pequena) | `livro.png` 1537x1023 | novo, ampliado | bom |
| Um dia / Manhã | `quarto-04.png` 1445x1088 + `jardim_01.png` 1448x1086 | ampliados | bom |
| Um dia / Tarde | `piscina-02.jpg` 829x622 + `sala-01.jpg` 4032x3024 | site / do dono | a piscina do alpendre continua fraca |
| Um dia / Noite | `exterior-03.png` 2172x724 (inteira, sem corte, a ocupar a mesa toda) + `sala-07.jpg` 829x551 | ampliado / site | o alpendre continua fraco |
| Os espaços | `piscina-01` e `sala-03` e `jardim-04` (829 px); `quarto-01`, `bilhar`, `campotenis`, `refeicoes-01`, `jardim-06` (bons) | | 3 de 8 fracas |
| Reservas | `exterior-05.png` 1528x1029 | ampliado | resolvido |

Ainda só existem a 829 px: `piscina-01` (piscina, nos espaços), `piscina-02`
(piscina do alpendre, na Tarde), `sala-03` (salões), `sala-07` (alpendre, na
Noite) e `jardim-04` (parque). São as próximas a ampliar.

## A pedir ao dono

1. **Fotografias em alta resolução do que falta:** a piscina vista do
   alpendre, os salões e o parque (alameda/cedros). São os últimos 829 px
   que ficaram na página.
2. **Fotografias da villa de madeira, da casa de pedra e da cozinha** (não
   existe nenhuma) e dos quartos Margarida e Violeta.
3. **Confirmar** o número de quartos (o site diz 10, as keywords 9, o Airbnb 8),
   se as 5 fotos antigas de quartos eram todas para retirar (todas tinham
   colcha), e se o concelho a usar é Vouzela (é o oficial).
4. **As 10 masterpieces** ficaram de fora desta página. Dão uma página
   dedicada ("Ten Master Pieces"), que é material que nenhuma casa da
   concorrência tem.

## Alma musical e retoques clássicos (2026-09-18)

A pedido do Diogo, depois de concordarmos que a casa é artística e musical:

- **A casa:** o tema continua a ser a história, mas o texto acaba na música
  ("…a casa não voltou a ficar em silêncio: há três pianos em salões
  diferentes, uma coleção de vinis de música clássica, e há dias em que o
  próprio dono se senta ao piano."). O parágrafo abre com uma **capitular**
  em Bodoni (utilidade `.capitular` em `globals.css`: 4.1em, três linhas, cor
  `ouro-escuro`). Fotografias iguais; se o dono mandar uma foto de um piano,
  entra no lugar da dos livros.
- **Um dia na casa:** a Manhã passa a "Os pássaros acordam primeiro" (os
  hóspedes contam que se acorda com os pássaros). As etiquetas da linha do
  dia (Manhã, Tarde, Noite) passam de versaletes a itálico Bodoni.
- **Bug encontrado e corrigido na secção (vinha de antes):** em telemóveis
  de altura média, que não apanham a versão compacta (<=740px), o texto da
  Noite passava por cima da linha do dia (-39px a 360x780). No telemóvel, o
  número do período passou de 3.4rem a 3rem, o título de 2.1rem a 1.85rem,
  as margens de 16/20px a 12px, e a fila das fotografias de 46vh a 43vh. O
  computador não mudou. Medido em 8 tamanhos (1440x900, 1280x720, 430x932,
  414x896, 390x844, 375x667, 360x780, 360x740): o texto fica sempre entre 6
  e 222px acima da linha do dia e nunca toca nas fotografias.
- **Jardins ingleses:** a introdução dos espaços diz "um parque à inglesa" e
  o cartão do parque adapta a frase da casa no Booking ("Ao jeito dos jardins
  ingleses: … recantos onde se esquece o presente e o tempo para.").

## As dez peças e o piano (2026-09-18)

- **Cartão "As dez peças"** (as "Ten Master Pieces" do site da casa) nos
  Espaços, em **4.º lugar**, antes dos salões. O Diogo pediu 5.º ou 6.º mas
  sempre visível sem andar; medido no primeiro ecrã da visita, só os quatro
  primeiros cartões cabem inteiros a 1280, 1366 e 1440 de largura (o 5.º fica
  cortado a meio). No 4.º lugar fica inteiro nos quatro tamanhos testados
  (1280x720, 1366x768, 1440x900, 1920x1080). Foto: o retábulo flamengo do
  séc. XVII (`masterpiece-01.png`), recortado ao alto nas figuras do centro,
  a 600x750 para não esticar o original de 829x551. No telemóvel entra no
  carrossel como os outros (9 cartões). Quando existir a página dedicada,
  o cartão passa a levar para lá.
- **O piano, confirmado e dito com discrição.** O dossiê só sustenta que o
  dono toca com uma review do Google (~2019) e com a frase da casa de que "o
  proprietário dá concertos didácticos" num dos pianos; as outras reviews
  falam de "um piano para quem queira tocar". "O dono senta-se ao piano"
  saiu das duas secções. Ficou: "…e, de vez em quando, ouve-se um deles"
  (A casa) e "Às vezes, ouve-se um piano." (Noite).
- **Ronda seguinte:** nem "ouve-se um piano". Decisão do Diogo: dizer só que
  os pianos existem, nunca que alguém os toca, para não criar a expectativa
  de um concerto. A casa: "Hoje, entre os retratos e os livros antigos, há três
  pianos em salões diferentes e uma coleção de vinis de música clássica."
  Noite: "Dentro, arte de quatro séculos, três pianos e uma coleção de vinis
  de música clássica."

## Os tipos de alojamento (2026-09-18)

Em vez de uma secção nova, uma ligação no texto da Manhã do "Um dia na casa"
(ideia do Diogo): "…Depois, o sumo das laranjas da quinta. *Veja as 7 maneiras
de acordar.*" O 7 são os tipos que a casa vende no Booking (duplo,
individual, twin superior, twin standard, triplo, familiar, villa com 2
quartos). **Ainda leva ao Booking**, porque não há página dos quartos; quando
houver, troca-se `ligacao.href` em `casa.ts` por `/quartos`.

- Para caber, o texto da Manhã perdeu "e a alameda antes do calor".
- A ligação fica numa linha só (`whitespace-nowrap`), em itálico Bodoni
  sublinhado.
- **Correção necessária no `Momento`:** os três momentos estão empilhados e os
  transparentes tapavam a ligação. Agora cada momento fica `visibility:
  hidden` quando a opacidade está abaixo de 0.05, o que também o tira da
  ordem do teclado. Medido: a ligação é clicável na Manhã e está escondida
  e fora de alcance na Tarde e na Noite.
- Medido em 8 tamanhos (1440x900, 1280x720, 430x932, 414x896, 390x844,
  375x667, 360x780, 360x740): uma linha, dentro do ecrã, clicável, e o texto
  sempre acima da linha do dia (folga mínima 5px, a 360x780).
- Na versão com movimento reduzido a ligação também aparece.
- **Ronda seguinte:** a ligação passou a parágrafo próprio, maior (1.4rem no
  telemóvel, 1.75rem no computador) e no castanho da placa (`ouro-escuro`, a
  cor dos botões Reservar), em itálico Bodoni sublinhado. Para caber, o texto
  da Manhã ficou só com "Há quartos que abrem para o jardim, e são os pássaros
  que dão as horas." (o sumo das laranjas continua na faixa dos pilares).
  Medido nos 8 tamanhos: folga mínima de 15px à linha do dia e de 13px às
  fotografias (360x780), clicável em todos.

## Marca (2026-09-18)

- O simbolo do cabecalho e do rodape deixou de ser a arvore do Phosphor: passa a ser a flor do favicon da casa (`dossie/marketing/fotos/marca/marca-favicon.ico`). O .ico so tem imagens de 32x32 e 16x16; tirou-se a de 32 px (32 bits, com alfa) e ampliou-se a 128 px com lanczos3 em `public/marca-flor-transparente.png` (o fundo branco tirado: o rosa fica opaco, so a passagem do rosa claro ao branco ganha transparencia). Nao ha detalhe para recuperar: e mostrada a 26 px dentro do circulo, onde a falta nao se nota. Pedir ao dono o logotipo em vetor ou em alta resolucao.
- `src/app/favicon.ico` passou a ser o favicon da casa, tal como esta.
- O cartao "As dez pecas" foi dado como sem imagem; verificado em Playwright: `casa-pecas.jpg` carrega (200 em todos os tamanhos do otimizador). Provavelmente cache do navegador de quando o cartao ainda nao tinha foto.

## "Veja as 7 maneiras de acordar": brilho e zoom (2026-09-18)

- Texto com o ShinyText do React Bits (`src/components/reactbits/ShinyText.tsx`), adaptado a fundo claro: castanho da placa (#533a2c) com uma faixa de ouro-claro (#c9a184) a passar a cada 3,2 s.
- Com rato: `.ligacao-zoom` aproxima a frase a 1,08 ao passar por cima (origem a esquerda, para nao sair da coluna).
- Sem rato (`hover: none`, telemovel): nao ha hover, por isso a frase aproxima-se sozinha a 1,06 uma vez por ciclo, no mesmo ritmo do brilho; ao tocar encolhe a 0,97, como resposta ao dedo. Medido a 360x780 com toque: no maximo da aproximacao a frase acaba a 336 px, dentro do ecra.
- O sublinhado passou para o texto: com `inline-block` o sublinhado do `<a>` nao atravessa para dentro.
- Com prefers-reduced-motion as animacoes param (regra global) e a versao estatica da seccao nao leva nada disto.

## Verificacao de responsividade antes do deploy (2026-09-18)

Medido em Playwright, com toque e `isMobile`, em 320x568, 360x640, 360x740, 360x780, 375x667, 375x812, 390x844, 393x873, 412x915, 414x896, 430x932, 768x1024, 820x1180 e deitado em 844x390 e 932x430; e no computador em 1920x970, 1600x780, 1536x730, 1440x790, 1366x657, 1280x720, 1280x610 e 1024x650.

- **Os espacos (computador).** A pista chegava ao fim so nos ultimos 8% da secao presa e soltava-se logo: os ultimos cartoes passavam sem se lerem as notas. Agora a pista anda mais devagar do que o scroll (1 px por 1,4 px) e fica parada meio ecra no fim, com o ultimo cartao inteiro. A distancia mede-se com `clientWidth` (o `innerWidth` contava a barra de scroll) e com ResizeObserver; margem a direita igual a da esquerda. Em ecras ate 640 px de altura o espaco entre titulo e cartoes encolhe (a nota ficava 6 px abaixo do ecra em 1280x610).
- **Pagina a deslizar de lado em telemoveis ate ~400 px.** "Pequeno-almoco incluido" (hifen que nao parte) nao cabia na coluna dos pilares e alargava a pagina 9 a 35 px. O titulo dos pilares passa a `clamp(0.95rem, 6.2vw - 0.3rem, 1.45rem)`.
- **Telemovel deitado.** "Um dia na casa" nao cabia (as fotos tapavam o texto): com `(orientation: landscape) and (max-height: 500px)` mostra a versao corrida. O hero tem tamanhos proprios nessa situacao (variante `deitado` em globals.css).
- **Telemoveis baixos de pe (ate 700 px de altura).** O hero passava por baixo do cabecalho e o segundo botao saia do ecra em 320x568. Variante `baixo`: titulo 2,5rem e margens menores.
- Resultado: sem deslize lateral em nenhum tamanho; hero inteiro entre o cabecalho e o fundo do ecra; em "Um dia na casa" folga minima de 6 px entre o texto e a linha do dia (360x780, Tarde).

## Correcoes depois do primeiro deploy (2026-09-18)

- **Hero no telemovel.** Sem o paragrafo "A cal, o granito..." (fica so no computador): o hero estava cheio. O bloco sobe (`max-md:pb-44`) para os botoes ficarem acima da placa de madeira "Casa Fatauncos" da fotografia; o Reservar, da mesma madeira, perdia contraste em cima dela. Medido: os botoes acabam entre 63% e 74% da altura do ecra, a placa comeca por volta dos 74%.
- **Salto no hero ao fazer scroll no telemovel.** Ao primeiro scroll a barra do browser esconde-se e a janela fica mais alta. Tres coisas reagiam a isso: o hero (h-dvh) crescia, a foto dava um salto a meio do zoom, e o progresso de scroll era medido outra vez, o que adiantava o zoom. Agora o hero usa `lvh` (foto) e `svh` (texto), "Um dia na casa" e o fecho usam `svh`, e `useProgresso` ignora mudancas so de altura em ecras de toque (so volta a medir quando a largura muda).
- **"Um dia na casa": fotos mais abaixo** no telemovel (pt 6rem para 7,5rem; em ecras ate 740 px de altura 5,5rem para 6,5rem). A altura das fotos passa a ter limite (`min(largura cqw, 75/70% cqh x aspeto)`, com a mesa como container): em 320x568 as fotos, medidas so pela largura, saiam da mesa e tapavam o texto. Linha das fotos a 38vh em telemoveis ate 380 px de largura com mais de 740 px de altura (360x780 ficava com 2 px) e a 28vh ate 600 px de altura. Folga minima medida: 2 px (320x568, Noite); 14 px a partir de 360x640.
- **"Veja as 7 maneiras de acordar"** sem sublinhado, em todos os ecras.
- **Os espacos:** "O parque" passa para antes de "O parque infantil".

## Botao Reservar do hero e titulo no telemovel (2026-09-18)

- **Cor do Reservar sobre a fotografia do hero.** A madeira ficava igual a placa "Casa Fatauncos" da propria fotografia. Testadas no Playwright, em 390x844 e 1440x900: cal (#f7f4ec, texto #1d2220), verde das portadas (#24352c), madeira clara (#c9a184) e linho (#ecebe4). Escolhida a cal: e a que mais se destaca sobre o veu escuro, faz par claro com o "Conhecer a casa" em contorno branco (cheio = principal, contorno = secundario) e e o branco das paredes da casa, ja na paleta. O verde perdia-se no veu; a madeira clara trazia uma cor nova ao hero. Novo tom `cal` em Botao.tsx, usado no hero e no Reservar do cabecalho enquanto esta por cima do hero. O fecho continua com a madeira (`ouro`). Contraste do texto: 16:1.
- **Titulo do hero no telemovel maior:** `clamp(2.9rem, 14.5vw, 4rem)` (56,6 px em 390 de largura; antes 49,6 px). Em telemoveis baixos `clamp(2.6rem, 13vw, 3.3rem)` e o bloco sobe (`baixo:pb-36`). Medido de 320x568 a 430x932: os botoes acabam entre 68% e 73% da altura do ecra, acima da placa; nada passa por baixo do cabecalho.

## Fotografias do Booking (2026-09-18)

O Diogo descarregou do anuncio da casa no Booking as fotos que faltavam. Estao no dossie em `marketing/fotos/booking/` (nomes descritivos) e entram pela mesma grade. O Booking so as da a 1024 px de largura: saem com o maior corte que o original permite, sem ampliar (cartoes 614x768; quarto 572x715; "Um dia" a 1024x768; piano inteiro, 1024x715).

- A casa (foto pequena): livros -> xadrez, livros e brasao num salao (corte a esquerda, para apanhar o tabuleiro).
- Manha: alameda -> pequeno-almoco. Texto: "... Depois, pequeno-almoco com compotas da casa." (a versao com o sumo de laranja nao cabia no telemovel; o sumo continua na faixa dos pilares).
- Tarde: piscina -> piscina ao por do sol; beiral -> beiral com vista para a serra. Texto: "... um cadeirao no beiral, um livro e a serra ao fundo."
- Noite (de baixo): alpendre -> piano de cauda.
- Os espacos: piscina, quartos, salas de jogos, saloes, tenis, sala de refeicoes e parque infantil com as fotos novas. Ordem nova: o parque, os quartos, o campo de tenis, a piscina; depois as dez pecas (5.o, o mais cedo possivel), salas de jogos, saloes, sala de refeicoes, parque infantil.
- `parque-outono.jpg` (o parque no outono, 1024x472) ficou no dossie mas nao entrou: nao foi pedida para nenhum lugar.
- Com o texto da Manha mais comprido: em telemoveis ate 380 px de largura o texto do "Um dia" fica com entrelinha 1,6, e em ecras ate 600 px de altura (iPhone SE) o titulo encolhe e o rotulo (Acordar/Lazer/Ao serao) sai. Hifens que nao partem no texto. Folga minima: 13 px (360x640, 360x780); 5 px no 320x568.

## Tarde com tres fotos, trocas e a ligacao em pastilha (2026-09-18)

- Piscinas trocadas: a do alpendre passa para a Tarde, a do por do sol para o cartao "A piscina".
- Tarde com tres fotos: piscina, beiral e a sala de bilhar (que saiu do cartao das salas de jogos). POSE passa a ter `alto` (topo/meio/base) e `cap` por foto; as tres ficam em escada (direita em cima, esquerda a meio, direita em baixo), mais pequenas (68/54/50% da mesa), cada uma a tapar so um canto da anterior. Atrasos de queda por foto em ATRASO/QUEDA/APARECE; a terceira cai 0,038 depois da segunda.
- Cartao "As salas de jogos": foto da sala de ping-pong com o piano de cauda ao fundo (`booking/sala-pingpong.jpg`).
- Pequeno-almoco: versao ampliada pelo Diogo (`booking/pequeno-almoco-ampliada.png`, 1448x1086).
- Os espacos: a piscina passa para antes do campo de tenis.
- "Veja as 7 maneiras de acordar" nao parecia clicavel. Passa a pastilha discreta: contorno fino castanho a 35%, cantos redondos, seta de "abre fora" que sobe ao passar o rato; o brilho e o zoom ficam. No telemovel mais pequena (1,1rem, 31 px de altura) para caber. Medido: clicavel em todos os tamanhos; folga minima na Manha 11 px (360x780), 4 px no 320x568.

## Os espacos: presa so da primeira vez (2026-09-18)

Pedido do Diogo: a secao presa demorava muito a atravessar de cada vez que se subia ou descia a pagina. A animacao fica igual, mas so da primeira vez que se desce. Quando a secao sai toda por cima do ecra, passa a "livre": deixa de prender (a secao fica com um ecra de altura) e os cartoes andam com:
- setas redondas ao lado do titulo (uma seta = um cartao; desligadas nas pontas; aparecem so na fase livre);
- o gesto de lado do trackpad (a faixa apanha a roda quando e sobretudo horizontal e nao a deixa chegar ao Lenis; a roda vertical continua a mover a pagina);
- arrastar com o rato (com encaixe no cartao ao largar);
- teclado (a faixa e focavel; setas do teclado).
A troca faz-se fora do ecra e o scroll e corrigido no mesmo frame pelo tamanho que a secao perdeu, por isso nada salta (medido: o mesmo conteudo no mesmo sitio antes e depois). A faixa comeca onde a pista tinha ficado, no fim. So no computador; no telemovel continua o carrossel de arrastar com o dedo. Dura enquanto a pagina estiver aberta: ao recarregar, volta a animacao.

## Cartoes maiores, ligacao sublinhada, Reservar em madeira (2026-09-18)

- Os espacos (computador): cartoes maiores (largura min(21,5vw,305px); em ecras ate 820 px de altura min(24,5vw,330px)) e margem de cima mais curta (clamp(6,5rem,13dvh,8,5rem)). As fotografias deixam de ter formato fixo: a pista e uma grelha com tres linhas partilhadas (foto, nome, nota, com subgrid) e a foto fica com a altura que sobra, ate 4/5; todas a mesma altura. O texto nunca e cortado. Medido em 13 tamanhos, de 1280x600 a 2560x1440: folga em baixo 48 px (24 px ate 640 de altura), etiqueta nunca por baixo do menu. Exemplos: 1440x900 passa de 270x337 a 305x379; 1366x768 de 300x225 a 330x268; 1280x720 de 282x211 a 314x220. Antes, entre 821 e 900 de altura e a 640, a nota do fundo saia do ecra.
- A secao deixa de ter scroll-mt: na fase livre, ao chegar pelo menu, ficava 80 px abaixo do topo e a nota cortava-se.
- "Veja as 7 maneiras de acordar": sem pastilha, so uma linha fina por baixo (borda castanha a 40%) e a seta; brilho e zoom ficam. Tambem na versao estatica (telemoveis deitados), que ainda tinha a pastilha.
- Reservar no computador (a partir de lg) todos em madeira: cabecalho (antes cal/floresta), hero (novo tom `cal-madeira`: cal no telemovel) e a copia escura do fecho (`floresta-madeira`). A madeira responsiva e a classe `.madeira-lg`. No telemovel o do hero continua branco.


## Um dia no telemovel: linha do dia mais abaixo, ligacao maior (2026-09-19)

- Linha do dia (Manha/Tarde/Noite) no telemovel e tablet: de 28 px para 12 px do fundo (ou a margem de seguranca do iPhone, se maior). No computador fica igual.
- A margem de baixo do palco passa de pb-20 para pb-[4.5rem] no telemovel: o texto desce 4 px, para ganhar folga as fotografias sem voltar a encostar a linha.
- "Veja as 7 maneiras de acordar" maior no telemovel: 1,4rem (1,25rem em ecras ate 740 px de altura), limitado a (100vw-72px)/14,2 para caber numa linha mesmo com o zoom de 6% (medido: largura = 13,3 x letra + 21 px). Seta de 16 para 18 px.
- Medido de 320x568 a 820x1180 (Manha, Tarde e Noite): texto da Manha a linha do dia passou de 8-38 px para 18-48 px; ligacao sempre dentro do ecra (folga minima 7 px, 390x844, no pico do zoom); fotos ao texto >= 0 px (320x568, antes -2).

## Um dia no telemovel: a linha do dia no fundo real do ecra (2026-09-19)

- Queixa do Diogo no telemovel: a linha do dia continuava alta e colada a "Veja as 7 maneiras de acordar". Duas causas:
  1. O palco media svh (a altura com a barra do browser a mostra). Quando a barra se esconde, o ecra cresce e a linha ficava a meio, com espaco vazio por baixo. Agora a caixa de fora mede lvh, o palco (fotos e texto) continua svh (nada salta) e so a linha segue o fundo real: `top: calc(100dvh - 2.5rem)`, 12 px do fundo. No computador fica `bottom-7`.
  2. Os testes anteriores usavam a altura do ecra inteiro (390x844), mas num browser a altura util e menor: 390x745 (Safari com a barra em baixo), 412x780 (Chrome Android). Entre 741 e ~800 px o layout era o alto e a Manha sobrepunha-se as fotos e a linha (ate -14 px). O corte do layout compacto passa de 740 para 820 px de altura (e o `min-height:741px` para 821px).
- Medido em 19 tamanhos (alturas reais de browser e de ecra inteiro, 320x568 a 820x1180): nada sobreposto; Manha texto a linha >= 18 px (390x745: 62 px, 412x780: 87 px, antes -7 e 3); fotos ao texto >= 0 px. Computador sem mudancas (linha a 28 px do fundo).
