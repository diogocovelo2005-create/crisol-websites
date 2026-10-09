# Adaptação: Cerrado dos Outeirinhos

Site feito a partir do molde (`nichos/alojamento/molde`) a 2026-09-20.
Dossiê de 2026-09-19.
Conteúdo todo tirado de `../dossie/`.

**Terceira versão.** A primeira levava P5, E3 e F2; a segunda trocou para P1,
E2 e F3; esta acrescentou o hero H4 (dia e noite), fundiu as Opiniões com o
Fecho e refez os textos do pico. O que mudou e porquê está dito em cada fase.

---

## Fase 1: Ler a casa

**A vibe, numa frase:** casa de granito e lousa do século XIX no meio da vila
de Cinfães, com quatro pisos de história da adega ao challet do fidalgo, e
um dono que recebe cada hóspede como visita.

**Tipo e registo.** É uma **Casa de Campo** (Turismo no Espaço Rural), RNET
n.º 4538. **Não é Alojamento Local.** O site nunca diz "AL" e o rodapé leva
RNET, não RNAL.

**As fotos** (115 no dossiê). Duas origens muito diferentes:

| Origem | Quantas | Formato |
|---|---|---|
| Sessão profissional de ~2013 (Booking e site) | ~60 | horizontais, 1620 a 3000 px |
| Telemóvel, 30/07/2026 (Facebook) | ~20 | verticais, 1126x2000 |

Em falta, e pedido ao dono em `dossie/dono.md`: uma foto do pequeno-almoço
com os doces e bolos (2.º ponto forte, sem nenhuma foto), uma foto horizontal
da esplanada panorâmica, uma foto do anfitrião a receber (1.º ponto forte,
sem nenhuma foto), e fotos atuais dos quartos.

**O que as opiniões dizem mais vezes** (823 lidas: Booking 548, Google 230,
TripAdvisor 45). É daqui que sai o pico:

| Ponto forte | Opiniões |
|---|---|
| O anfitrião, que recebe e conta a casa | 230 (46 só em 2026) |
| Estar no centro da vila | 113 |
| A casa de 200 anos, granito e peças da família | 46 |
| O pequeno-almoço à mesa, com doces caseiros | 42 |
| As dicas: onde jantar, que caminho fazer | 42 |
| O jardim e a esplanada | 23 |
| Paragem da N222, parque para motas | 18 |

**Concelho:** Cinfães (distrito de Viseu, NUTS III Tâmega e Sousa).

**A restrição que mandou na escrita.** O `site-pronto.md` separa o que a casa
pode afirmar do que só pode citar. **O anfitrião, os doces caseiros e a
história dos avós não são publicados pela casa em canal nenhum**: só os
hóspedes os contam. Por isso não entram na voz do site; entram só dentro de
citações, com nome, plataforma e data.

---

## Fase 2: Escolher do catálogo

| O quê | Escolha | Porquê |
|---|---|---|
| Pico | **P1, Relógio** | A cor da página segue a luz do dia. O P5 (livro antigo) foi cortado: fazia a casa parecer um museu, e ela é de 1850 mas recuperada e viva. |
| Forma de contar | **Os rituais** | O pico são os pontos fortes do dossiê, não uma cronologia. |
| Título do pico | **"Três coisas que *acontecem sempre.*"** | Nenhuma casa do registo o tem. |
| Espaços | **E2, Índice** | Pede espaços com nome, e esta casa tem-nos ("a sala do forno", "a casa de banho da Eira"). |
| Fecho | **F3, Cortina que sobe** | O F2 (portadas) foi rejeitado: a porta a abrir não combinava com a casa. |
| Hero | **H4, fora do catálogo** | A mesma casa de dia e de noite, fundidas com o scroll. O hero não tem variantes no molde; ver Fase 5, ajuste 5. |
| Ordem | **H, A, E, Pi, P, O+F** | Ver abaixo. |

**A ordem.** A do molde é H, Pi, A, P, E, O, F. Aqui a Atmosfera sobe para
logo a seguir ao hero e os Espaços passam para antes do pico. Os Pilares
descem para o meio: é a secção calma obrigatória entre o índice (que prende)
e o pico (que também prende). **As Opiniões e o Fecho são hoje uma secção
só** (Fase 5, ajuste 8).

Regras conferidas: Hero primeiro e Fecho último ✓; Opiniões na segunda
metade ✓; antes do Pico há uma secção calma (os Pilares) ✓; nunca duas que
prendem seguidas ✓.

**Contra o registo.** A única casa feita é a `casa-de-fatauncos-vouzela`,
concelho de **Vouzela**, que não faz fronteira com **Cinfães**. Difere em
tudo: variantes, forma de contar, título, ordem, fontes e paleta.

---

## Fase 3: Montar e escrever

Conteúdo todo em `src/lib/casa.ts`. Só factos que o `site-pronto.md` marca
como "pode afirmar"; opiniões reais copiadas à letra, com a ortografia
original, nome, plataforma e data; sem travessões.

**O pico são os pontos fortes.** A ordem dos três rituais é a da luz: o P1
escurece a página ao longo do scroll.

| Marca | Quando | De onde vem |
|---|---|---|
| A mesa | Todas as manhãs | pequeno-almoço à mesa, 42 opiniões; citação da Marlene, Booking, fev. 2026 |
| A visita | À chegada, a partir das 15h | os quatro pisos são [OFICIAL]; a Serra do Montemuro, a Rota do Românico e os Passadiços do Paiva (~20 min) também; que o anfitrião mostra a casa é [OPINIAO], por isso só entra citado (Patricia, Booking, out. 2025) |
| A noite | Depois de jantar | restaurantes a poucos passos é [OFICIAL]; o sossego e o céu estrelado são [OPINIAO], citados (Pinho, Booking, jul. 2024) |

O terceiro ritual era **"O conselho"** (a recomendação de restaurante) e
saiu: repetia sozinho um facto com uma citação só, e o ponto mais escuro do
relógio pedia antes o que a casa é à noite.

**Os espaços: cinco.** A lista foi-se afinando: saíram a receção, a esplanada
à noite, o jardim e a sala da lareira; entrou a esplanada de dia. A adega fica
aqui com a foto do lagar, que é a que mostra mesmo a adega. A ordem é o ritmo
das fotografias: as de pedra antiga (adega, forno) não ficam seguidas, e as
duas que não têm ar antigo (a casa de banho de ardósia e a esplanada ao sol)
fecham.

**A linguagem é uma adaptação da página "Espaço" do site antigo**, a pedido do
Diogo. Entraram os nomes próprios dos quartos ("Quarto do Fidalgo", "Suite
Eira"), a eira por baixo da suite, a casa de banho "à maneira das casas dos
fidalgos da época", as duas esplanadas e o jardim "onde se podem servir
bebidas e refeições ligeiras", e o quarto preparado para mobilidade reduzida
(que passou para a intro). Ficou de fora o que o `site-pronto.md` não deixa
afirmar: a "vigilância assegurada" do parque e a vista para a Serra do Marão.

| # | Espaço | Foto do dossiê |
|---|---|---|
| 01 | A adega e o lagar | `interior/sala-03.jpg` (corte ao centro, não `attention`: o smart-crop cortava fora o lagar e a mó) |
| 02 | Os quartos | `interior/quarto-02.jpg` |
| 03 | A sala do forno | `interior/sala-01.jpg` |
| 04 | A casa de banho da Eira | `interior/casa-de-banho-01.jpg` |
| 05 | A esplanada panorâmica | `exterior/vista-01.jpg` (Facebook da casa, 30/07/2026) |

**As outras fotografias**

| Onde | Ficheiro | Porquê |
|---|---|---|
| Hero, dia | `exterior/jardim-01.jpg` | Sai a 3000x2000, resolução nativa |
| Hero, noite | `heronoite.jpg`, dada pelo Diogo | O mesmo enquadramento exato da foto de dia. Testado: com metade de cima da de dia e metade de baixo da de noite, a emenda é invisível |
| Atmosfera, grande | `exterior/fachada-01.jpg` | mostra o granito, a lousa e a madeira ao mesmo tempo |
| Atmosfera, pequena | `exterior/detalhe-01.jpg` | a tabuleta de ferro assina a casa |
| Pico, A mesa | `interior/refeicoes-01.jpg` | a foto do pequeno-almoço |
| Pico, A serra | `regiao/regiao-07.jpg` | o vale com nevoeiro. É a única foto do momento: a foto da adega saiu |
| Pico, A noite | `exterior/fachada-06.jpg` | o portão e o caminho empedrado à noite |
| Fecho | `exterior/detalhe-02.jpg` | a placa de lousa gravada com o nome e o desenho da casa |

**Cuidado com a foto da região.** O `regiao/` do dossiê está marcado: "não se
sabe se são da casa ou de banco de imagens". Ficam porque **a casa publica-as
na sua própria página Envolvência** (é esse o critério que o Diogo pôs: ou
publicada pela casa, ou por uma plataforma de reviews da casa). O autor é que
não está indicado, e por isso esta é a foto a substituir mal o dono mande uma
sua, que é o que ficou combinado.

Quanto ao texto: o `site-pronto.md` proíbe vender a casa como base para o
Douro vinhateiro (fica a 1h a 1h30). O texto do momento diz apenas que
"Cinfães está entre a Serra do Montemuro e o Douro", que é **a frase da
própria casa** na página Envolvência, e nomeia só o que está confirmado como
perto (Covelas, Tarouquela, Passadiços do Paiva a ~20 min).

**O recorte da esplanada é à mão.** O `vista-01` é vertical, de telemóvel, e
ao centro o corte apanhava sobretudo o chão em vez da vista. O
`tools/imagens.mjs` ganhou um campo `recorte` (um `extract` antes do resize)
para estes casos em que o assunto não está nem ao centro nem num canto que o
`foco` saiba apanhar.

**A citação do hero.** É da própria casa, do Facebook de 30/07/2026.
Tirou-se o nome da casa do princípio (já está na linha de autor) e os emojis.

**Factos deixados de fora de propósito**, porque o `site-pronto.md` os proíbe:
a morada com número de porta, a vista para a Serra do Marão, o wi-fi em toda
a casa, o silêncio nos quartos, o pequeno-almoço a qualquer hora, as tertúlias
na adega, os preços do site, o Clean & Safe, o prémio do Booking de 2014, e
duche em todos os quartos.

**Os ícones dos pilares não contam como ajuste**: o campo `icone` vive em
`casa.ts`, é conteúdo. `pata` e `trilho` deram lugar a `passo` e `mota`,
porque a casa **não aceita animais**.

---

## Fase 4: Paleta e fonte

Tiradas das fotografias. O granito quente das paredes dá o fundo; a lousa
azul-cinza que reveste o piso de cima (e é o céu das fotos de noite) dá o
escuro; a telha, os vasos de barro e as colchas vermelhas dão o destaque.

| Papel | Token | Valor |
|---|---|---|
| Fundo | `linho` | `#f1ece2` |
| Fundo, mais fechado | `linho-escuro` | `#e3dcce` |
| Cartão | `cartao` | `#f9f5ee` |
| Texto | `tinta` | `#23272c` |
| Texto secundário | `tinta-medio` | `#5a6067` |
| Escuro | `floresta` | `#2e3a46` |
| Escuro, mais fundo | `floresta-fundo` | `#232c36` |
| Destaque | `ouro` | `#d3805b` |
| Destaque escuro | `ouro-escuro` | `#9a4528` |
| Claro sobre escuro | `osso` | `#f7f3ec` |
| Noite (véus) | `noite` | `#141a20` |

Contraste, com `scripts/contraste.mjs`: tinta/linho 12.76 · tinta-medio/linho
5.40 · tinta-medio/cartao 5.85 · osso/floresta 10.49 · osso/floresta-fundo
12.79 · noite/ouro (botão) 5.85 · ouro-escuro/linho (etiquetas) 5.48. Todos
passam. `text-ouro` sobre `floresta` dá 3.87, abaixo de 4.5: não é um dos
pares obrigatórios do `paleta.md`, e no molde estava pior (3.78).

Cores escritas à mão fora do tema, todas trocadas: o arco de cor do dia no
P1, os tons de fundo dos espaços no E2, o véu do hero, o `hover` do botão de
destaque e as sombras da Atmosfera e da Cortina.

**Fonte.** Títulos **Playfair Display**, texto **Figtree**. Ambas diferentes
das do molde (Cormorant Garamond, Jost) e das de Fatauncos (Bodoni Moda,
Mulish). O `<em>` sai mesmo em itálico verdadeiro; o H1 do primeiro ecrã faz
2 linhas no computador e 3 no telemóvel, e cabe com os dois botões.

---

## Fase 4b: A grade das fotografias, segunda versão

A primeira seguia a do molde e as fotos ficavam gastas: as profissionais são
de ~2013 e já são planas de origem.

| | 1.ª versão | 2.ª versão |
|---|---|---|
| Saturação | 0.88 | 1.06 |
| Contraste | `linear(0.96, 6)` | `linear(1.08, -10)` |
| Nitidez | nenhuma | `sharpen({ sigma: 0.9 })` |
| Véu de sombra | alfa 38 | alfa 18 |
| Véu de luz | alfa 34 | alfa 16 |
| Grão | 7 | 4 |
| Vinheta | 0.12 | 0.07 |

---

## Fase 5: Ajustes à casa (9, acima do limite de 6)

**O limite de 6 foi ultrapassado a pedido do Diogo.** Os ajustes 5, 6, 8 e 9
são direção dele, não necessidades que eu tenha encontrado. O 8 em particular
vai além do que a skill permite: junta duas secções numa. Ficam registados
como exceções deliberadas, para não parecer que entraram por descuido.

### Ajuste 1/9: o botão de WhatsApp passa a telefone
A casa não publica WhatsApp em canal nenhum (`dossie/canais.md`). Fica o
telemóvel das reservas. Ficheiro: `variantes/fecho/Cortina.tsx`.

### Ajuste 2/9: Opiniões, a nota diz a fonte e a data
O dossiê obriga a mostrar as notas com a data, e a casa tem três plataformas
em escalas diferentes. Fica "4,5 em 230 avaliações no Google, em setembro de
2026". Ficheiro: o painel da Cortina, campo `fonte`.

### Ajuste 3/9: Atmosfera, a moldura pequena passa de 4/5 para 4/3
A tabuleta de ferro é horizontal; em retrato perdia o "C.do" e o nome deixava
de se ler. Ficheiro: `seccoes/Atmosfera.tsx`.

### Ajuste 4/9: hero, o véu mais escuro e mais largo
A foto de dia é o jardim ao sol, com relvado e céu claros exatamente onde o
texto vive. Ficheiro: `globals.css`, `.veu-hero`.

### Ajuste 5/9: hero H4, a segunda fotografia de noite
**Pedido do Diogo.** Uma segunda camada com a mesma casa de noite funde-se
por cima da de dia com o scroll (0.18 a 0.62 do scroll preso). O texto não
muda: só a luz. Com movimento reduzido não há camada de noite.

Houve aqui um desvio meu que vale a pena registar: com fotos de noite
tiradas de outro ângulo, a fusão mostrava linhas a dobrar, e eu troquei o
crossfade por uma máscara de bordo suave. O Diogo corrigiu: a `heronoite`
que ele deu tem o enquadramento exato da foto de dia. Confirmei com um teste
de emenda (metade de cima da de dia, metade de baixo da de noite: a junta é
invisível) e repus o crossfade simples. O que eu tinha lido como
desalinhamento era só o aspeto normal de um dissolve a meio entre uma foto
de sol e uma de noite.
Ficheiro: `seccoes/Hero.tsx`, campos `hero.imagemNoite` e `hero.altNoite`.

### Ajuste retirado: o canto com a segunda foto já não existe
Este ajuste era o canto (`par`) no ritual "A visita": uma segunda foto, a da
região, ao lado da foto da adega. Saiu inteiro e o `Relogio.tsx` voltou ao
catálogo, uma foto por momento.

Saiu porque o Diogo mudou o momento: **"a visita da casa é uma coisa óbvia"**,
e o forte é a localização. O ritual passou a chamar-se **"A serra"**, tem uma
foto só (a da região), e o texto é quase todo envolvência, escrito à maneira
da página Envolvência do site antigo. Da visita à casa sobrou uma linha.
Ficheiro: `variantes/pico/Relogio.tsx` (componente `Foto`), `lib/casa.ts`.

**A contagem de ajustes desceu aqui de 8 para 7**, e voltou a 8 com o
ajuste 8/8 (o link dos quartos).

### Ajuste 6/9: F3, o véu a 0.5 em vez de 0.4
A foto do fecho é uma fachada iluminada de noite e o granito fica
amarelo-claro por trás do texto. Ficheiro: `variantes/fecho/Cortina.tsx`.

### Ajuste 7/9: Opiniões e Fecho fundidas numa secção
**Pedido do Diogo: "mete apenas uma que dê para rodar horizontalmente as
reviews e é essa mesma que faz de cortina".** A secção `Provas` deixou de
existir; o seu carrossel (setas, pontos, as mesmas citações, o mesmo
`AnimatePresence`) passou a ser o painel da cortina do F3. O campo
`fecho.citacao` saiu: a cortina lê `casa.reviews.citacoes`.

Isto **contraria o `ajustes.md`** ("Juntar duas variantes numa: deixa de ser
uma variante aprovada") e o princípio do molde de que as secções fixas só
mudam de lugar. Resolve o problema que o Diogo apontou (apareciam duas
secções de opiniões) e não repete citação nenhuma, mas deixa de ser uma
variante do catálogo. Se ficar, vale a pena entrar no molde como variante de
fecho nova, com capturas de referência.
Âncoras: `id="opinioes"` na secção inteira e `id="reservar"` no ecrã fixo.
As duas do menu levam ao mesmo sítio, que é o que faz sentido numa secção só.
Ficheiro: `variantes/fecho/Cortina.tsx`; `seccoes/Provas.tsx` apagado.

### Ajuste 8/9: E2, um espaço pode levar um link para uma página
**Pedido do Diogo.** "Os quartos" passou a dizer quantos são e a capacidade
por alto, e por baixo leva **"Veja as três maneiras de acordar"** com link
para `/quartos`. O E2 do catálogo só tem nome e nota; o campo `link` é novo e
é opcional, por isso os outros quatro espaços ficam exatamente como estavam.

A frase cresce de duas maneiras, e só com propriedades permitidas (`scale` e
cor): quando o scroll acende o espaço (no computador, `i === ativo`; no
telemóvel, `whileInView`) e quando o rato passa por cima. A origem é à
esquerda, para crescer para dentro da linha em vez de empurrar o texto para
os dois lados. Com movimento reduzido não cresce com o scroll, só com o rato.
A cor é o `ouro-escuro` e passa a `ouro` no rato, para se distinguir da nota,
que é `tinta-medio`.

**Nota técnica do Tailwind v4:** o utilitário `scale-*` escreve a propriedade
`scale`, não `transform`. Com `transition-[transform,...]` a frase saltava em
vez de crescer; é preciso `transition-[scale,...]`.
Ficheiros: `variantes/espacos/Indice.tsx` (as duas versões, Largo e
Estreito), `lib/casa.ts` (campo `link`).

### Ajuste 9/9: E2, no telemóvel os espaços são uma pilha de cartões
**Pedido do Diogo.** No telemóvel o E2 caía numa lista parada, sem animação
nenhuma. Passou a ser o `ScrollStack` do React Bits: os mesmos cinco espaços,
pela mesma ordem, cada um num cartão que se prende no topo e encolhe quando o
seguinte lhe sobe por cima. **No computador não muda nada:** continua a ser o
índice do catálogo.

O componente veio da Quinta de Canhões, já com as duas adaptações dela: quem
prende os cartões é o `position: sticky` do browser (o `translateY` calculado
em JavaScript tremia contra o dedo no telemóvel) e, em `useWindowScroll`, já
não nasce um segundo Lenis a disputar o scroll com o global do `ScrollSuave`.
Aqui levou uma terceira, igual à do `useProgresso`: não voltar a medir quando
só a altura da janela muda num ecrã de toque.

O intervalo entre cartões (`itemDistance`) é quase a altura de um cartão, 200
no telemóvel e 280 no tablet. Com o valor da Quinta de Canhões, calibrado
para cartões deitados e mais baixos, a nota era tapada antes de se ler.
Medido: os cinco cartões têm todos um momento em que estão inteiros e
destapados no ecrã.

Ficheiros: `components/reactbits/ScrollStack.tsx` (novo),
`variantes/espacos/Indice.tsx`.

### A segunda página: `/quartos`
O site deixou de ter uma página só. A `/quartos` é, por agora, o que o Diogo
pediu: "Em construção" e um botão para voltar. Leva `robots: index: false`
enquanto não tiver conteúdo, para não entrar nos motores de busca vazia.

Quando for feita, o que ela tem de contar são as três maneiras de dormir na
casa: o quarto duplo, a Suite Eira (sala na antiga cozinha, pátio e acesso ao
jardim) e a Suite do Fidalgo (último piso, lousa por fora, até quatro
pessoas). Os factos estão em `dossie/quartos.md`.
Ficheiro: `src/app/quartos/page.tsx`.

### Não é ajuste: as citações saíram todas do pico
**Pedido do Diogo: as reviews vivem todas na secção das Opiniões.** Os três
rituais tinham cada um a sua citação com nome, plataforma e data; agora não
têm nenhuma. O que os hóspedes contam está reescrito na voz da casa, **mas só
onde o facto é oficial**: o pequeno-almoço servido à mesa, a hora combinada,
os restaurantes a pé.

O que só os hóspedes dizem **não mudou de dono**: o anfitrião, os bolos e as
compotas caseiras e o céu estrelado ficaram fora do texto, não passaram a voz
do site. Continuam a aparecer só citados, com autor e data, na secção das
Opiniões. É a regra do `site-pronto.md` e não foi tocada.

Não conta como ajuste à variante: é conteúdo, o P1 não pede citações.

Nada mudou na mecânica de nenhuma variante do catálogo: nem o que prende, nem
a altura, nem as janelas do scroll, nem o número de momentos. Nenhuma
biblioteca instalada.

---

## Fase 6: Verificação

| # | Verificação | Resultado |
|---|---|---|
| 1 | Consola | passou: nenhum erro |
| 2 | Scroll horizontal | passou: não há |
| 3 | Primeiro ecrã | passou: título, parágrafo e os dois botões visíveis |
| 4 | Contraste | passou nos pares obrigatórios |
| 5 | Âncoras | passou: `#a-casa`, `#espacos`, `#opinioes`, `#reservar` |
| 6 | Travessões | passou: zero |
| 7 | Cores antigas | passou: nenhum hexadecimal do molde sobrou em `src/` |
| 8 | Build | passou: `npm run build` sem erros, TypeScript incluído |
| 9 | Fusão do hero | medida: opacidade da camada de noite 0 no topo, 0.50 a meio, 1 no fim |
| 10 | Espaços | medido: cinco, pela ordem certa |
| 11 | Enquadramento do hero | teste de emenda entre a foto de dia e a de noite: junta invisível |

**Um problema encontrado e corrigido:** a foto do canto usava `quality={82}`,
que não está na lista `images.qualities` do `next.config.ts` e caía para 75
sem aviso. Passou a 85.

**Um problema de ambiente, não do site:** correr `npm run build` com o
servidor de dev a trabalhar na mesma pasta `.next` corrompeu a cache do dev
(`SyntaxError: Unexpected end of JSON input`, HTTP 500). A página deixou de
responder ao scroll e mostrava fotos antigas, o que levou a diagnósticos
errados. Resolveu-se a apagar `.next` e a reiniciar o servidor.
**Não correr o build com o dev a correr.**

### Não verificado
- **Telemóvel real.** O Playwright simula 390x844; não é um aparelho.
- **Autorização das fotos.** O dono tem de confirmar que podem ser usadas.
- **Aumento de resolução do hero por IA.** A conta Higgsfield está a zero
  créditos. O hero sai à resolução nativa, 3000x2000.
- **Os factos `[A_VERIFICAR]` do dossiê.**

---

## Fase 6b: Varrimento de ecrãs

Doze larguras, de 320 a 2560, mais duas em paisagem (844x390, 740x360) e o
tablet a 1180x820. Em cada uma, a página é percorrida de cima a baixo de meio
ecrã em meio ecrã, a medir o `scrollWidth` e a procurar elementos que saiam da
janela ou texto mais largo do que a própria caixa. A `/quartos` foi ao mesmo
varrimento.

Resultado final: **sem scroll horizontal em nenhuma largura**, sem texto a
transbordar, zero erros de consola, e nada a falhar na rede. O mesmo
varrimento correu depois contra o site publicado, com o mesmo resultado.

Três coisas corrigidas, todas de telemóvel:

1. **`Pilares.tsx`, o hífen que não parte.** O título era escrito com o hífen
   U+2011 para "Pequeno-almoço" não partir. Só que, inteira, a palavra é mais
   larga do que a coluna em qualquer telemóvel: transbordava para o lado, e a
   320px empurrava a página inteira para o scroll horizontal. Voltou ao hífen
   normal, que só parte quando não cabe e parte no hífen, nunca a meio da
   palavra. O corpo do título desce a 1.25rem até ao `md`.
2. **`Cortina.tsx`, os pontos das opiniões.** Tinham 8px de lado, muito abaixo
   do mínimo de 24px da WCAG 2.2. O ponto continua a ser de 8px, mas é agora
   um `<span>` dentro de um botão com `p-2`, que dá 24px de área de toque. O
   `gap` passou a 0 porque o próprio `p-2` já afasta os pontos.
3. **`Cabecalho.tsx`, o botão do menu.** 26x26 passou a 42x42 com `-mr-2 p-2`,
   sem mexer no sítio onde o ícone aparece.

Os links do rodapé ficam com 19px de altura, abaixo dos 24, mas estão a 36px
uns dos outros: a excepção de espaçamento da WCAG cobre-os e não se mexeu.

**Por render:** `casa.visita.intro` está escrito mas o E2 não o mostra, porque
a variante só desenha etiqueta e título. O texto ("Seis quartos para doze
pessoas, em quatro pisos...") está a ficar de fora da página. Mostrá-lo seria
um nono ajuste ao E2, por isso fica à espera de decisão.

---

## Fase 6c: A segunda volta ao telemóvel

Quatro coisas apontadas pelo Diogo depois de ver o site no telemóvel.

**1. A barra do browser a recolher.** Ao primeiro scroll a barra esconde-se e
a janela fica mais alta. Três coisas reagiam a isso: o hero (`h-dvh`) crescia,
a foto dava um salto a meio do zoom, e o `useProgresso` voltava a medir, o que
adiantava a animação. É o mesmo problema que a Casa de Fatauncos teve, e leva
a mesma solução:

- o hero mede `lvh` (a foto tem sempre a altura maior) e o texto centra-se em
  `svh` (a altura visível), por isso nunca fica escondido pela barra;
- o pico faz o mesmo: caixa de fora em `lvh`, palco em `svh`, e só a linha do
  dia segue o fundo real, com `top: calc(100dvh - 2.5rem)`;
- o `useProgresso` e o `ScrollStack` deixam de voltar a medir quando só a
  altura muda num ecrã de toque. Só se mede outra vez quando a largura muda,
  isto é, ao rodar o ecrã.

**Isto não é verificável no Playwright** e não o marco como medido: mudar o
viewport do Playwright muda também o `vh`, coisa que a barra do browser a
recolher não faz. O que se pode dizer é que o código ficou igual ao da Casa de
Fatauncos, onde o Diogo confirmou a correção num telemóvel real. Fica para
confirmar no telemóvel dele.

**2. As opiniões sobrepunham-se.** A cortina media `h-screen` (100vh, que no
telemóvel é a altura *com* a barra escondida) e centrava o conteúdo sem
guardar espaço para o cabeçalho fixo: a etiqueta "Opiniões" ficava por baixo
do logotipo e os pontos caíam fora do ecrã. Agora mede `svh`, tem `pt-24` para
o cabeçalho, e a tipografia desce no telemóvel (título 1.9rem, citação
1.15rem, e mais um degrau abaixo dos 620 px de altura). O convite por baixo
levou o mesmo tratamento. Medido nas quatro citações, de 320x568 a 430x932:
nenhuma passa por baixo do cabeçalho nem é cortada em baixo.

**3. Os espaços não tinham animação.** Ver o ajuste 9/9.

**4. A estadia tinha demasiado texto.** O corpo dos momentos desce para
0.95rem no telemóvel (0.9 abaixo de 820 px de altura, 0.82 abaixo de 600), os
cortes de layout passam de 740 para 820 px de altura, e o texto da serra foi
encurtado de 529 para 357 caracteres. Saíram a igreja de Tarouquela e a nota
sobre o Bestança ser um dos rios menos poluídos da Europa; ficam a serra, o
rio, as aldeias, Covelas e os Passadiços.

---

## Fase 7: Limpeza

Apagados: o catálogo, `src/components/reactbits/`, todas as variantes não
usadas e `src/components/seccoes/Provas.tsx` (absorvida pela Cortina).
Ficaram, porque o P1 precisa deles: `pico/dados.tsx` e `pico/Estatico.tsx`.

Registado em `nichos/alojamento/VARIACOES.md`.

---

## Problemas do molde encontrados

1. **O `veu-hero` assume uma foto escura à esquerda.** Com uma foto clara
   obriga a um ajuste. O molde devia ter dois níveis de véu.
2. **A secção Opiniões tem cinco estrelas fixas.** Casas cujo canal principal
   é o Booking dão a nota em dez. O molde devia aceitar a escala como dado.
3. **O botão de WhatsApp está nas quatro variantes de fecho**, e muitas casas
   não o têm publicado. O molde devia ler o segundo contacto de
   `casa.contacto`.
4. **O `tools/imagens.mjs` ganhou um `recorte` manual.** Serve para fotos de
   telemóvel em que o assunto não está nem ao centro nem num canto. Se voltar
   a aparecer noutras casas, vale a pena subir para o molde.
5. **O hero não tem variantes.** O H4 desta casa foi construído à mão. Fica
   por fazer a família de variantes de hero no molde, com capturas.


---

## Fase 8: Publicação

Projeto Vercel `crisol/cerrado-dos-outeirinhos`, publicado com
`vercel --prod --yes` a partir desta pasta.

- https://cerrado-dos-outeirinhos.vercel.app
- https://cerrado-dos-outeirinhos-crisol.vercel.app

Ambos são aliases de produção do projeto, e um `vercel --prod` seguinte
move-os. Não são aliases soltos como os do Crisol, que têm de ser repostos à
mão.
