# A Família na Quinta · notas do site

Site em `site/` (Next.js), porta 4260. Base: protótipo **C, "O álbum"**
(`prototipos/c.html`). Estrutura e texto: o `BRIEF.md` refeito depois da
escolha (8 secções desde a correção 2, casa e quinta à vez).

## Correção 2 (palavras do Diogo)

"nao precisamos da secçao "A casa · cá fora". quero que a secçao A quinta ·
os da quinta e a secçao "Quem quiser, pode fazer parte da família" sejam
seguidas. [...] a segunda secçao é como se fosse uma conclusao da primeira.
a secçao "Na quinta, a família acolhe quem precisa de casa" nao me
surpreendeu. [...] a transiçao da secçao anterior para esta tem de ser
melhor pensada."

- Cá fora saiu (`CaFora.tsx` guardado em `arquivo/componentes-retirados/`).
  A varanda, o duche, o vale (airbnb-04, a abrir do meio para os lados,
  o gesto que era do postal) e a frase da Joana passaram para "De fora"
  (título, ficha de 8 linhas e textos à letra do BRIEF novo). airbnb-10,
  27 e 30 ficam sem uso.
- **De fora → A família (a revelação, presa 1,2 ecrãs).** No papel:
  "Chama-se A Família na Quinta. / Falta conhecer a" e, enorme, "família.".
  As letras são uma janela (clipPath SVG com a fonte da página) para a foto
  do borrego velada: parecem tinta escura, com o olho do borrego lá dentro.
  O resto da frase sai, o scroll entra pela palavra (escala exponencial até
  80×, pelo "l"), a cena cresce menos do que as letras (profundidade), o
  véu levanta e, aberta a janela, a foto inteira fica e o título responde
  por cima, dito palavra a palavra: "Uma família com cascos, penas e
  orelhas compridas", com a legenda do BRIEF numa etiqueta. Depois, na
  madeira: a frase de abertura em grande, o segundo parágrafo, o cabrito e
  a Lígia ("agradável surpresa à chegada"). Foto nova e8ec6b (original
  6000 px, reduzida a 2400, sem ampliação; acrescentada ao
  fotos-finais.json à mão, porque o melhorar-fotos só conhece as fotos do
  c.html e reescreveria a lista).
- **Os da quinta → Fazer parte (um só gesto; a mesa presa passou de 1,35
  para 2,1 ecrãs).** Com a frase do post-it inteira, as seis fotografias
  levantam-se outra vez (o mesmo arco e sombra da arrumação) e juntam-se
  numa roda com um lugar vazio em baixo; o post-it vai para o meio da
  roda e por baixo escreve-se a passagem ("Para a vida inteira é muito
  tempo. / Há quem queira ajudar a cumpri-lo."). O post-it e a passagem
  saem para cima, o título da 6 é dito no meio da roda e o lugar vazio
  ganha contorno tracejado: a família fecha-se num círculo onde cabe mais
  um. A mesa solta-se e o resto da 6 (santuário, envelopes, Lígia) segue
  na mesma madeira, sem etiqueta nem título novos. Na roda as fotografias
  já não se arrastam (o que se arrastou volta ao sítio), mas viram-se.
  Nada fala de estadia: a etiqueta "depois da estadia" saiu.
- Com movimento reduzido ou ecrã estreito: sem roda; a passagem por baixo
  da mesa e a 6 com o seu título (`useRoda` decide, um só h2).

Conferência (1440): percurso com movimento reduzido 0 problemas. O
verificador acusa "ecrã quase vazio" na mesa a 75% (é a roda a formar-se,
aberta de propósito: na captura estão o post-it e as seis fotos) e os
"números 0" das licenças, já aceites. Scroll preso: 8,3 ecrãs no total
(3,8 são o índice preso do álbum, com a página a correr ao lado; presos de
facto: 1,2 primeiro ecrã + 1,2 revelação + 2,1 mesa).

## Correção 4 (palavras do Diogo)

"aquela frase a vermelho está por detras do cartao. tira a foto [...] que
está por de baixo da foto com a legenda "Pedra por fora, madeira por
dentro." e tira a foto com a legenda "À chegada, o portão.". encurta um
pouco o texto [da varanda] e dá-lhe mais personalidade. [...] na secçao "a
familia que dá nome á casa é maior..." tambem acho que tem demasiado texto
e sóbrio. faz os cartoes "Apadrinhar um animal." e "Acompanhar a quinta."
mais interativos. nao se destacam."

- Primeiro ecrã: "Primeiro, a casa." ficava por baixo da margem da
  fotografia pousada (a 1440, a margem, a rotação e a sombra entram uns
  40 px na coluna). A frase afastou-se 96 px da fotografia e ficou por cima.
- Por fora: saíram o portão (airbnb-31) e o terraço (airbnb-03). Fica a
  fachada com a fita e a etiqueta.
- Varanda: título "Cá fora, *também é tudo vosso.*"; "Spa de
  hidromassagem, espreguiçadeiras, guarda-sol e um duche de água quente ao
  ar livre. À frente, o vale e as montanhas."; a Joana à letra; passagem
  "E Lamego? A poucos minutos de carro." (AF-05, AF-07, AF-08, AF-16, AF-15).
- A família (texto na madeira): "A família é *maior* do que se pensa." em
  grande; "Animais que outros exploravam, maltratavam ou iam matar ganham
  na quinta um lar para a vida inteira."; "O projeto chama-se «A Família
  na Quinta». *A casa também.*" (AF-P01, AF-P02, AF-P03). A Lígia e a
  passagem dourada ficam.
- Fazer parte: cada envelope é agora uma ligação inteira (email e
  Facebook), com um cartão claro dentro do envelope escuro, título em
  telha e uma ação ("Pedir um afilhado →", "Seguir no Facebook →"). Ao
  passar o rato ou com foco, o cartão sai 14 px do envelope e inclina-se
  1,5° (um para cada lado), a seta avança e a borda acende; ao carregar,
  encolhe um nada. A aba continua a abrir-se com o scroll. Texto do
  Facebook: "Cerca de 10 mil pessoas (outubro de 2026) seguem no Facebook
  o dia a dia da quinta."
- A legenda "À chegada, o portão." já não existe (sai da lista a confirmar).

## Correção 3: reserva direta (antes do deploy)

Diogo: os call to action eram "marcar no Airbnb", o que tira o propósito
ao site; passam a telefone, WhatsApp e Facebook, com um botãozinho de
WhatsApp "só para impressionar". Sem formulário: é para os donos verem
como podia ficar.

- `lib/casa.ts`: `TELEFONE`, `WHATSAPP` (wa.me/351965741870 com a
  mensagem "Olá! Gostaria de saber se a casa A Família na Quinta está
  disponível para estas datas: ") e `FACEBOOK`
  (facebook.com/afamilianaquinta, do contrato, CANAL-FB). Ações:
  "Reservar · 965 741 870" e "Reservar por WhatsApp".
- Cabeçalho (e menu do telemóvel) e primeiro ecrã: o botão principal era
  "Ver disponibilidade" (Airbnb) e passou a "Reservar · 965 741 870".
- 8 · o bilhete: o título passou a "Para ficar, falem diretamente com a
  família"; o canhoto tem "Reservar diretamente" e três canais (Ligar
  965 741 870, o principal, a telha; WhatsApp; Facebook), cada um com
  ícone e uma linha. O Airbnb ficou só como ligação discreta na nota
  ("A casa também está no Airbnb").
- Rodapé: WhatsApp e Facebook junto do telefone e do email. Fazer parte:
  "Facebook" passou a ligação. JSON-LD: sameAs com o Airbnb e o Facebook.
- `WhatsappFlutuante.tsx`: um selo de papel com picotado e o ícone em
  telha, no canto de baixo à direita, inclinado como uma fotografia
  colada. Escondido no primeiro ecrã e com o bilhete à vista; ao passar
  o rato sai "Reservar por WhatsApp". A legenda do borrego (palco da
  revelação) afastou-se do canto para não lhe tocar.
- Por confirmar com o dono: que o 965 741 870 serve para reservas da casa
  (AF-24 é "afirmar com condição") e que esse número tem WhatsApp (o
  contrato não o diz). O Facebook é a página do projeto (AF-P15, CANAL-FB).
- Conferência: percurso 0 problemas; o verificador acusa o mesmo que antes
  (roda da mesa e os "0" das licenças).

## O que veio da primeira montagem

## As direções do Diogo (ESCOLHA.md)

- "gosto muito do C mas precisa de mais fotos da casa. nao dá para conhecer
  o interior" → três secções da casa (por fora, por dentro, cá fora), nunca
  seguidas; "Por dentro" é um álbum de 16 fotos com índice e ampliação.
- "quero que conceito e a casa se liguem" → a pele separa-as sem as cortar:
  as secções da casa são o papel do álbum (claro), as da quinta são a mesa
  de madeira (escuro); a fotografia do primeiro ecrã passa a ser a primeira
  fotografia do álbum, colada ao lado da voz do projeto.
- "animações bastante criativas para a secção dos animais" → a mesa
  interativa (abaixo).

## O que mudou em relação ao C

- Ordem e texto do BRIEF novo: 1 primeiro ecrã · 2 Por fora · 3 A família
  na quinta · 4 Por dentro · 5 Os da quinta · 6 Cá fora · 7 Fazer parte ·
  8 À volta · 9 Reservar. Passagens e títulos à letra do BRIEF.
- A voz do projeto (a primeira página do álbum no C) passou para dentro da
  saída do primeiro ecrã.
- Por fora: juntaram-se o portão (airbnb-31) e o terraço (airbnb-03) à
  fachada e à etiqueta do C. Legenda nova do portão: "À chegada, o portão."
- Por dentro: em vez da tira de 4 fotos, o álbum em 7 tempos (a entrada, o
  espaço aberto, a sala, o quarto, a cozinha, a casa de banho, os
  pormenores), fotos com cantos de álbum, índice preso à esquerda com
  marcador, e cada foto abre-se em grande (setas, teclado, Esc).
- Os da quinta: a secção passou para a madeira (era papel no C); o post-it
  de nota ao Diogo virou o post-it da frase do projeto + instrução
  ("Peguem nas fotografias e arrumem-nas à vontade; com um clique,
  viram-se.").
- Cá fora: o postal do C passou para o papel; juntaram-se airbnb-10 (duche
  exterior) e airbnb-27 (corrimão e vale); carimbo "LAMEGO" sobre o selo.
- Fazer parte: os dois blocos são envelopes com aba.
- À volta: créditos com a versão da licença em texto normal (CC BY-SA 4.0
  etc.), fotos sem recorte (proporção original).
- Reservar: o bilhete do C; o rodapé é o do esqueleto (com mapa do concelho).
- Fontes Young Serif + Figtree; cores do C no `@theme` (telha #9A4A22 para
  o destaque dos títulos no papel, acento #E2A86A sobre madeira e foto).

## O movimento, e a passagem que cada um serve

- **Primeiro ecrã → álbum** (preso, 220vh): a promessa sai; a foto da casa
  encolhe, roda 2°, ganha a margem de papel e a fita, e pousa à direita; o
  cartão da voz do projeto chega por baixo e "Primeiro, a casa." entra.
  Serve: a casa e a família que acolhe ficam na mesma página; o resto é o
  álbum a folhear-se.
- **Por fora**: o portão escorrega da esquerda para o álbum, a fachada é
  pousada de cima com a fita a colar-se no fim, o terraço sobe por baixo
  dela; a ficha é uma etiqueta pendurada pelo ilhó que chega a baloiçar e
  assenta (pêndulo amortecido preso ao scroll). Serve a chegada, pela ordem
  em que se chega.
- **A família na quinta**: ver "Correção 2" (a revelação pela palavra).
- **Por dentro**: as fotos escorregam para os cantos, de lado, e os cantos
  fecham-se por cima; o marcador do índice desce com mola para o tempo em
  que se está. Serve: conhecer a casa divisão a divisão sem se perder.
- **Os da quinta** (a mesa, presa 135vh): as fotografias caem na mesa
  despejadas, espalhadas à toa; cada passo do scroll pega numa, levanta-a
  (cresce, ganha sombra, faz um arco) e pousa-a no seu canto; ao pousar, a
  palavra dela escreve-se no post-it até a frase ficar inteira ("Abrigo,
  amor, uma família, um lar, para a vida inteira."). Depois, cada fotografia
  arrasta-se pela mesa (inclina com a velocidade do gesto, assenta com
  mola) e vira-se com um clique ou Enter: no verso, a frase da família com a
  palavra daquele animal sublinhada. Serve "acolher": da desordem a cada um
  ter o seu lugar.
- **Fazer parte**: o título dito; a foto das fotografias pousa da esquerda;
  os envelopes abrem a aba e o cartão sobe de dentro (como chega a foto do
  afilhado).
- **À volta**: os postais são dados como cartas, da esquerda para a
  direita, do mais perto ao mais longe; o texto de cada um aparece depois.
- **Reservar**: o bilhete chega e o canhoto com os botões destaca-se um
  pouco pelo picotado.

Parado de propósito: os textos corridos (só sobem e aparecem), o índice do
álbum, os títulos das secções da casa (chegam em bloco), o rodapé.

Movimento reduzido: sem prisão nenhuma; o primeiro ecrã estático e a voz
por baixo; a mesa já arrumada, com o post-it completo (arrastar e virar
continuam); tudo visível.

Telemóvel (não conferido no pipeline): a mesa passa a lista de fotografias
que se viram com um toque, sem arrastar; o resto empilha.

## Conferência (1440)

- Verificador: única falha "números que não estão no brief: 0", que é a
  versão das licenças em texto (CC BY-SA 4.0, 3.0, 2.0, CC BY 2.0), pedida
  assim. Aviso de 6,5 ecrãs de scroll preso: 3,9 são o índice preso do
  álbum (a página continua a correr ao lado dele), 1,2 o primeiro ecrã, 1,35
  a mesa.
- Percurso com movimento reduzido: 0 problemas.
- Testado: virar, arrastar (com inércia), ampliar no álbum, setas e Esc.

## Por confirmar com o dono (Mário)

- Tudo o que o BRIEF já lista: capacidade, registo (169288/AL vs. o do
  Airbnb), valor e processo do apadrinhamento, se os hóspedes veem os
  animais, se a estadia ajuda o santuário, animais de hoje, nomes de quem
  recebe, se o telefone e o email servem para a casa, horários, e a
  autorização para usar as fotos do projeto (2021).
- Uma foto que junte a casa e os animais (não existe).
- O domínio (metadados com afamilianaquinta.pt provisório).
- A legenda "À chegada, o portão." e o carimbo "LAMEGO" são nossos.
