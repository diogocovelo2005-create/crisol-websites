/*
  Todo o conteudo do site vive aqui.

  Cerrado dos Outeirinhos, Cinfaes. O conteudo sai todo do dossie em
  nichos/alojamento/casas/cerrado-dos-outeirinhos/dossie/. O que a casa
  pode afirmar como facto e o que so pode citar esta separado em
  dossie/site-pronto.md, e essa separacao foi respeitada:

  - a voz do site so afirma o que esta em "Pode afirmar como facto";
  - o anfitriao, os doces caseiros e a historia dos avos NAO sao
    publicados pela casa, so contados por hospedes: aparecem apenas
    dentro de citacoes, com nome, plataforma e data;
  - `reviews` leva citacoes reais, copiadas a letra da plataforma, com
    a ortografia original.

  ATENCAO: isto e uma Casa de Campo (Turismo no Espaco Rural), nao e
  Alojamento Local. O registo e RNET n.o 4538. O site nunca diz "AL".

  Nos titulos, o texto entre *asteriscos* sai em italico.
*/

export const casa = {
  nome: 'Cerrado dos Outeirinhos',
  tipo: 'Casa de Campo',
  lugar: 'Cinfães',

  /* 01 Hero. A promessa que o resto da pagina tem de cumprir.

     H4: a mesma casa, de dia e de noite. A foto de dia e o jardim ao
     sol (a mesma de sempre); a de noite e a fachada iluminada, com o
     mesmo jardim em primeiro plano. O scroll funde uma na outra, devagar
     e sem pressa: e so a luz que muda, o texto fica. */
  hero: {
    etiqueta: 'Casa de Campo em Cinfães',
    titulo: 'Uma casa de granito *no meio da vila.*',
    texto:
      'Quatro quartos e duas suites numa casa do século XIX, recuperada com a traça original em granito, madeira e lousa.',
    imagem: '/fotos/hero.jpg',
    alt: 'O jardim do Cerrado dos Outeirinhos, com relvado, vasos e a casa de granito e lousa ao fundo',
    imagemNoite: '/fotos/hero-noite.jpg',
    altNoite: 'A casa e o jardim iluminados ao anoitecer, com a latada em primeiro plano',
  },

  /* Faixa logo abaixo do hero: o essencial num relance. Factos praticos,
     todos oficiais (RNT, Booking, site da casa). */
  pilares: [
    { icone: 'cama', titulo: 'Seis quartos', texto: 'Quatro duplos e duas suites, para até doze pessoas.' },
    { icone: 'cafe', titulo: 'Pequeno-almoço incluído', texto: 'Em todas as tarifas, servido à mesa na sala de refeições.' },
    { icone: 'passo', titulo: 'No centro da vila', texto: 'Restaurantes, cafés e supermercado a poucos passos.' },
    { icone: 'mota', titulo: 'Parque privado', texto: 'Gratuito, dentro da propriedade, e com lugar para motas.' },
  ],

  /* 02 A atmosfera. A historia da casa, que e o que ela propria conta:
     o fidalgo, os quatro pisos, os materiais. A casa nunca publicou o
     nome de quem recebe, por isso a voz aqui e a da propria casa, tirada
     a letra do Facebook de 30/07/2026. */
  atmosfera: {
    etiqueta: 'A casa',
    titulo: 'Da adega *ao challet do fidalgo.*',
    texto:
      'A casa é da segunda metade do século XIX. Mandou-a construir Nicolau Osório Negrão, descendente do fidalgo de Baião, que foi recebedor de Finanças do Reino em Cinfães. Recuperou-se quase toda a traça original, em que a madeira, o granito e a lousa são as matérias-primas presentes. A recuperação do edifício e da zona à volta procurou conjugar o passado com o presente. São quatro pisos, e sobem-se por esta ordem: a antiga adega e o lagar, a receção e a sala de refeições, os quartos e a sala de estar, e lá em cima o antigo challet do fidalgo.',
    /* A voz da casa: e o segundo tempo do hero, quando o scroll avanca
       pelo jardim ate a fachada. Citacao [OFICIAL], Facebook 30/07/2026. */
    voz: 'Dentro de casa encontra aconchego. No exterior da casa, encontra o ar puro e a tranquilidade do nosso jardim e da nossa esplanada panorâmica.',
    quem: 'Cerrado dos Outeirinhos, julho de 2026',
    imagem: '/fotos/casa.jpg',
    alt: 'A fachada de granito com o piso de cima revestido a lousa, vista do jardim, com um limoeiro em primeiro plano',
    imagemPequena: '/fotos/tabuleta.jpg',
    altPequena: 'Tabuleta de ferro forjado com o nome da casa e a palavra Turismo Rural, presa à parede de granito',
  },

  /* 03 O pico. Forma de contar: "Os rituais" (tres habitos da casa que se
     repetem), na variante P1, o relogio. A cor da pagina segue a luz do
     dia, por isso os tres rituais estao pela ordem em que acontecem ao
     longo de um dia: a mesa de manha, a visita a casa a tarde (o check
     in e a partir das 15h) e a noite, quando a pagina ja escureceu.

     O segundo ritual era "A visita" (a volta pela casa) e passou a ser
     "A serra": a visita a casa e obvia, a localizacao e que e o ponto
     forte. Ficou uma linha sobre a casa e o resto e a envolvencia,
     escrita a maneira da pagina Envolvencia do site antigo. Por isso
     tambem saiu o canto com a segunda foto (`par`): o momento mostra
     uma foto so, a da regiao, como manda a variante.

     A envolvencia entra aqui, e nao numa secçao propria, porque e um
     ritual a serio e nao um folheto: o dossie tem 42 opinioes sobre o
     anfitriao a dizer onde jantar e que caminhos fazer. Sair de casa
     depois do check in e a mesma conversa.

     O terceiro ritual era "O conselho" (a recomendacao de restaurante):
     saiu, porque repetia sozinho um facto com uma citacao so, e porque
     o ponto mais escuro do relogio - o fim do dia - pede antes o que a
     casa e a noite: o caminho a pe ate a vila, e o ceu estrelado que uma
     hospede descreveu.

     Nao ha citacoes nesta secçao, a pedido do Diogo: as opinioes de
     hospedes vivem todas na secçao das Opinioes. O que os hospedes
     contam esta reescrito na voz da casa, mas so onde o facto e
     oficial. O que so eles dizem (o anfitriao, os bolos e compotas
     caseiros, o ceu estrelado) ficou de fora do texto, nao mudou de
     dono: continua a aparecer so citado, na secçao das Opinioes. */
  pico: {
    forma: 'Os rituais',
    etiqueta: 'A estadia',
    titulo: 'Três coisas que *acontecem sempre.*',
    intro: 'Não são serviços, são hábitos da casa. Acontecem a quem fica uma noite e a quem fica uma semana.',
    linha: ['A mesa', 'A serra', 'A noite'],
    sol: ['8%', '50%', '92%'],
    momentos: [
      {
        marca: 'A mesa',
        momento: 'Todas as manhãs',
        titulo: 'O pequeno-almoço é servido à mesa',
        texto:
          'Está incluído em todas as tarifas e não é buffet: serve-se na sala de refeições, à mesa, à hora que se combina na véspera. Vem tudo posto, com toalha e guardanapos bordados, e fica-se ali sentado mais tempo do que se tinha pensado.',
        imagem: '/fotos/momento-mesa.jpg',
        alt: 'Mesa de pequeno-almoço posta, com toalha de linho, sumo de laranja, bule e um ramo de urze',
      },
      {
        marca: 'A serra',
        momento: 'Depois do check-in, a partir das 15h',
        titulo: 'A vila fica entre a serra e o rio',
        texto:
          'A casa vê-se toda numa volta, e o resto do dia é cá fora. Cinfães está entre a Serra do Montemuro e o Douro, e o que há para ver fica quase todo a poucos quilómetros de estrada estreita: aldeias encostadas à serra, a ponte românica de Covelas no vale do Bestança, os Passadiços do Paiva a vinte minutos. Vai-se e volta-se no mesmo dia, sem pressa nenhuma.',
        imagem: '/fotos/momento-visita.jpg',
        alt: 'O vale com nevoeiro entre os montes, na região à volta de Cinfães',
      },
      {
        marca: 'A noite',
        momento: 'Depois de jantar',
        titulo: 'A casa fica a pé da vila',
        texto:
          'Restaurantes, cafés e dois supermercados ficam a poucos passos, e jantar fora é descer a rua sem pegar no carro. Volta-se a pé, e a esta hora a vila já está quieta.',
        imagem: '/fotos/momento-noite.jpg',
        alt: 'O portão de entrada da casa à noite, com o caminho empedrado iluminado',
      },
    ],
  },

  /* 04 Os espacos, na variante E2 (Indice). Cinco. A lista foi-se
     afinando com o Diogo: sairam a rececao, a esplanada a noite, o
     jardim e a sala da lareira; entrou a esplanada de dia. A adega fica
     aqui com a foto do lagar (sala-03), que e a que mostra mesmo a
     adega; o pico leva a outra vista dela (sala-04).

     Primeiro entra o que mais se fala: a adega e a casa antiga (46
     opinioes). Depois o ritmo das fotografias: as de pedra antiga
     (adega, forno) nao ficam seguidas, com os quartos pelo meio, e a
     casa de banho de ardosia e a esplanada ao sol a fechar, que sao as
     duas que nao tem ar antigo.

     As notas abrem pelo que e estranho, nao pela descricao: e o que faz
     querer ver a foto. A linguagem e uma adaptacao da pagina "Espaço" do
     site antigo, a pedido do Diogo: os nomes proprios dos quartos
     ("Quarto do Fidalgo", "Suite Eira"), a eira por baixo, a replica das
     casas dos fidalgos, as duas esplanadas e o jardim onde se servem
     bebidas e refeicoes ligeiras, o quarto para mobilidade reduzida.
     Ficou de fora o que o site-pronto.md nao deixa afirmar: a vigilancia
     do parque e a vista para o Marao. */
  visita: {
    etiqueta: 'Os espaços',
    titulo: 'Por dentro *da casa.*',
    intro:
      'Seis quartos para doze pessoas, em quatro pisos, um deles preparado para mobilidade reduzida. Dá para uma família, para um grupo, ou para quem vem só passar um fim de semana.',
    espacos: [
      {
        nome: 'A adega e o lagar',
        nota: 'É o primeiro piso da casa. A mó de pedra e o lagar de granito ficaram onde estavam, e o que era adega é hoje a zona de convívio e de lazer.',
        imagem: '/fotos/espaco-adega.jpg',
        alt: 'A antiga adega, com o lagar de granito, a mó de pedra e bancos corridos encostados à parede',
      },
      {
        nome: 'Os quartos',
        nota: 'São seis, para doze pessoas: quatro quartos duplos, a Suite Eira, com a sala na antiga cozinha, e a Suite do Fidalgo, no último piso, revestida a lousa por fora, que com o sofá-cama da sala chega a receber quatro. Em vários, a parede de granito ficou à vista por trás da cama.',
        /* A pagina dos quartos ainda nao existe: por agora e um "em
           construçao" com um botao para voltar. O link fica ja aqui
           porque e ele que da a promessa das tres maneiras de dormir
           (duplo, Suite Eira, Suite do Fidalgo). */
        link: { texto: 'Veja as três maneiras de acordar', href: '/quartos' },
        imagem: '/fotos/espaco-quartos.jpg',
        alt: 'Quarto com a parede de granito à vista, cama de madeira e colcha vermelha',
      },
      {
        nome: 'A sala do forno',
        nota: 'A Suite Eira foi construída sobre uma antiga eira, e a sala dela é a antiga cozinha da casa. O forno a lenha ainda lá está, de pedra, com a louça antiga em cima.',
        imagem: '/fotos/espaco-forno.jpg',
        alt: 'A antiga cozinha, com o forno a lenha de pedra, louça antiga e um banco de madeira',
      },
      {
        nome: 'A casa de banho da Eira',
        nota: 'Foi feita à maneira das casas dos fidalgos da época: ardósia preta, banheira de pés com chuveiro de mão, e um lavatório escavado num tronco. Na parede, um quadro com torneiras antigas.',
        imagem: '/fotos/espaco-banho.jpg',
        alt: 'Casa de banho com parede de ardósia preta, banheira de pés branca e lavatório escavado num tronco de madeira',
      },
      {
        nome: 'A esplanada panorâmica',
        nota: 'São duas esplanadas, e há ainda o jardim: servem-se ali bebidas e refeições ligeiras. Esta é a de cima, por baixo da latada com luzes, virada para a vila e para os montes.',
        imagem: '/fotos/espaco-esplanada.jpg',
        alt: 'A esplanada panorâmica, com mesas e cadeiras por baixo de uma latada com luzes, e a vila e os montes ao fundo',
      },
    ],
  },

  /* 05 Prova social. Citacoes reais, copiadas a letra do Booking, com a
     ortografia original. A nota e a do Google, que e a unica na mesma
     escala de cinco, e vem sempre com a fonte e a data: as notas mudam.

     Ajuste desta casa: estes dados ja nao alimentam so uma secçao. O
     carrossel (setas, pontos, as mesmas citacoes) e agora tambem a
     cortina do Fecho (F3): Opinioes e Fecho fundiram-se numa secçao so,
     a pedido do Diogo. */
  reviews: {
    etiqueta: 'Opiniões',
    titulo: 'O que escrevem *depois de sair.*',
    media: '4,5',
    total: 230,
    fonte: 'no Google, em setembro de 2026',
    citacoes: [
      {
        texto:
          'Gostei muito do proprietário, o professor Zezé, da sua simpatia, o seu profissionalismo e dos seus conhecimentos.',
        quem: 'Alice',
        onde: 'Booking',
        data: 'Setembro 2026',
      },
      {
        texto: 'A casa revela história e identidade em cada canto.',
        quem: 'Maria',
        onde: 'Booking',
        data: 'Agosto 2026',
      },
      {
        texto:
          'Anfitriões muito simpáticos, prestaveis, disponíveis. Serviço 5*. Serviço personalizado. Pequeno almoço muito bom, servido à mesa. Já não se encontra serviços assim.',
        quem: 'Nave',
        onde: 'Booking',
        data: 'Junho 2026',
      },
      {
        texto: 'Da atenção do proprietário do local e do sossego e acordar a ouvir os passarinhos.',
        quem: 'Paulo',
        onde: 'Booking',
        data: 'Julho 2026',
      },
    ],
  },

  /* 07 Fecho, na variante F3 (a cortina que sobe). Nao entra informacao
     nova.

     Ajuste desta casa: a cortina ja nao mostra uma citacao fixa. As
     Opinioes e o Fecho eram duas secçoes; agora sao uma so, a pedido do
     Diogo: o carrossel de opinioes (o mesmo, com setas e pontos) e a
     propria cortina que sobe. O campo `citacao` que aqui esteve saiu:
     a cortina le `casa.reviews.citacoes` diretamente. */
  fecho: {
    etiqueta: 'Reservas',
    titulo: 'A casa está *aberta todo o ano.*',
    texto:
      'Veja as datas no Booking, ou fale connosco por telefone ou por email. O pequeno-almoço está incluído em todas as tarifas.',
    imagem: '/fotos/fecho.jpg',
    alt: 'Placa de lousa gravada com o nome da casa e um desenho do edifício, presa à parede de granito',
  },

  /* Reservas. A casa nao tem motor de reservas proprio: os botoes
     Reservar levam para o Booking, que e o canal principal (548
     comentarios). O formulario do site antigo era "meramente
     informativo" e nao vinculava a reserva. */
  reservas: 'https://www.booking.com/hotel/pt/cerrado-dos-outeirinhos.pt-pt.html',

  /* 08 Rodape e contactos.

     Morada sem numero de porta: o dossie tem tres numeros em conflito
     na mesma rua (67 no site e no Google, 62 no Booking e no Instagram,
     64/66 no RNT). Confirmar com o dono antes de o publicar.

     Nao ha WhatsApp publicado pela casa: o segundo botao do fecho e o
     telemovel das reservas, o que a casa divulga no Facebook e no
     Instagram. */
  contacto: {
    telefone: '+351 255 561 574',
    telefoneLimpo: '+351255561574',
    telemovel: '966 896 987',
    telemovelLimpo: '+351966896987',
    email: 'reservas@cerradodosouteirinhos.pt',
    morada: 'Rua Major Monteiro Leite, 4690-031 Cinfães',
    rnal: 'Casa de Campo · RNET n.º 4538',
    instagram: 'https://www.instagram.com/cerradoouteirinhosturismorural/',
  },
} as const;

export type Casa = typeof casa;
