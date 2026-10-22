# A Família na Quinta · notas do site

Site em `site/` (Next.js), porta 4260. Base: protótipo **C, "O álbum"**
(`prototipos/c.html`). Estrutura e texto: o `BRIEF.md` refeito depois da
escolha (9 secções, casa e quinta à vez, 37 fotos).

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
- **A família na quinta**: o título chega dito, palavra a palavra (só nas
  secções da quinta: é a voz da família); o cabrito sobe para o
  enquadramento, como quem o pega ao colo; a legenda escreve-se.
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
- **Cá fora**: o postal chega e endireita-se; o vale abre-se do meio para os
  lados; o selo é carimbado e o carimbo de Lamego aparece por cima. As duas
  fotos de baixo pousam cada uma do seu lado.
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
