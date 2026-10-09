/*
  Todo o conteudo do site vive aqui.

  Nos titulos, o texto entre *asteriscos* sai em italico. E o gesto
  tipografico do molde: uma parte do titulo em italico.

  FONTE DE TUDO O QUE ESTA AQUI: o dossie em
  nichos/alojamento/casas/casa-de-fatauncos-vouzela/dossie/ (factos.md,
  pontos-fortes.md, reviews.md, marketing/textos.md, marketing/fotos.md),
  recolhido a 2026-09-17. Nada nesta pagina foi inventado:

  - `reviews` sao citacoes reais do Booking, copiadas a letra, com o nome
    proprio, a nota e a data que a plataforma mostra.
  - `voz` e uma frase do proprietario na entrevista ao iNature.
  - A casa e um Empreendimento de Turismo de Habitacao (RNET 5352), nao um
    alojamento local: nao tem nem pode ter numero de RNAL.

  O que NAO se escreve aqui, por nao estar confirmado (ver `Por confirmar`
  no dossie): o numero de quartos (o site diz 10, as keywords 9, o Airbnb 8),
  ar condicionado em todos os quartos (so ha no 1o piso), silencio absoluto
  (ha queixas de ruido da estrada em alguns quartos) e animais (nao sao
  admitidos, por isso nao se fala deles).
*/

export const casa = {
  nome: 'Casa de Fataunços',
  tipo: 'Turismo de Habitação',
  lugar: 'Vale de Lafões',

  /* 01 Hero. Nao vende nem enumera: diz a casa devagar. Tudo o que esta
     aqui e verificavel (o solar e de setecentos, as portadas sao verdes, o
     parque tem cedros antigos), mas dito sem numeros nem argumentos. Os
     factos estao na faixa seguinte. */
  hero: {
    etiqueta: 'Turismo de Habitação em Fataunços, Vouzela',
    titulo: 'Uma casa feita *de histórias.*',
    texto:
      'A cal, o granito e as portadas verdes são os de sempre. Por dentro, salões com o que a família foi juntando. Por fora, sombra a toda a hora e o canto dos pássaros.',
    imagem: '/fotos/hero.jpg',
    alt: 'A fachada branca do solar de Fataunços, com cantaria de granito e portas verdes, num dia de sol',
  },

  /* Faixa logo abaixo do hero: o essencial num relance. Factos, nao
     pontos fortes. Todos do site, do Booking ou do Airbnb. */
  pilares: [
    { icone: 'cama', titulo: 'Quartos com nomes de flores', texto: 'Mimosa, Margarida, Violeta, Amor Perfeito. Todos com casa de banho privativa.' },
    { icone: 'piano', titulo: 'Quatro salões, duas salas de jogos', texto: 'Bilhar, ping-pong, biblioteca e três pianos, à disposição de quem fica.' },
    { icone: 'piscina', titulo: 'Piscina e campo de ténis', texto: 'No parque, com a serra ao fundo. A piscina abre de junho a setembro.' },
    { icone: 'cafe', titulo: 'Pequeno-almoço incluído', texto: 'Compotas e bolos feitos em casa, e o sumo das laranjas da quinta.' },
  ],

  /* 02 A atmosfera. Sente-se antes de se saber qualquer facto.
     Historia: entrevista do proprietario ao iNature. */
  atmosfera: {
    etiqueta: 'A casa',
    titulo: 'Na família desde 1896, *aberta desde 1998.*',
    /* A historia (iNature) e, no fim, a alma musical da casa. Tudo do
       dossie: tres pianos em saloes diferentes e a colecao de vinis de
       musica classica (a casa, no Booking). So se diz que os pianos existem:
       nunca que alguem os toca, para nao criar a expectativa de um concerto
       (decisao do Diogo, 2026-09-18). O paragrafo abre com uma capitular. */
    texto:
      'O solar é do século XVIII e está na família desde 1896, quando o comprou o bisavô do dono, Aires Menezes e Castro. Esteve trinta anos fechado. Em 1996 a família decidiu abri-lo, voltou a enchê-lo de peças dos séculos XVIII e XIX e, em 1998, recebeu os primeiros hóspedes. Hoje, entre os retratos e os livros antigos, há três pianos em salões diferentes e uma coleção de vinis de música clássica.',
    /* O segundo tempo do hero, quando o scroll ja avancou pelo caminho ate
       a casa. E uma frase da propria casa, do texto com que ela se apresenta
       no Booking ("Informacao do alojamento", recolhido a 2026-09-17):

         "Hospedar-se na casa de Fataunços é recriar por si o ambiente
          romantico do sec XIX, na vivencia dos seus salões e no requinte na
          decoração dos seus quartos, mas com todas as comodidades do
          presente."

       Aqui esta a frase inteira, a letra, so com os acentos repostos e
       "sec XIX" escrito por extenso (o original tem gralhas de teclado).
       Confirmada ao vivo a 2026-09-18 no bloco "Gerido por Pedro Meneses"
       (perfil do anfitriao): prova em
       dossie/marketing/provas/booking-perfil-do-anfitriao-2026-09-18.png.

       Esta e a promessa central da casa e nao repete a seccao da historia,
       que conta datas; esta diz o que se sente la dentro. */
    voz: 'Hospedar-se na casa de Fataunços é recriar por si o ambiente romântico do século XIX, na vivência dos seus salões e no requinte na decoração dos seus quartos, mas com todas as comodidades do presente.',
    galeria: { texto: 'Da porta ao anoitecer', href: '#galeria-casa' },
    quem: 'Casa de Fataunços',
    imagem: '/fotos/atmosfera.jpg',
    alt: 'Vista de cima da frente do solar e da aldeia de Fataunços',
    imagemPequena: '/fotos/atmosfera-livros.jpg',
    altPequena: 'Tabuleiro de xadrez e livros antigos num salão, com um brasão ao fundo',
  },

  /* 03 Um dia na casa. O pico da pagina: tres partes do dia contadas pelo
     scroll, duas fotografias por parte. Sem horas: quem esta aqui nao tem
     hora, e e isso que a casa vende (varios hospedes prolongaram a estadia). */
  fortes: {
    etiqueta: 'A estadia',
    titulo: 'Um dia *na casa.*',
    partes: [
      {
        periodo: 'Manhã',
        momento: 'Acordar',
        titulo: 'Os pássaros acordam primeiro',
        texto:
          'Há quartos que abrem para o jardim, e são os pássaros que dão as horas. Depois, pequeno-almoço com compotas da casa.',
        /* Ligacao no fim do texto. Abre a galeria dos quartos. */
        ligacao: { texto: 'Quartos com nomes de flores', href: '#galeria-quartos' },
        fotos: [
          { src: '/fotos/dia-manha-1.jpg', alt: 'Quarto com cama de casal e a porta aberta para o jardim', aspeto: 4 / 3 },
          { src: '/fotos/dia-manha-2.jpg', alt: 'Pequeno-almoço na mesa: compotas, queijos, fruta e sumo de laranja', aspeto: 4 / 3 },
        ],
      },
      {
        periodo: 'Tarde',
        momento: 'Lazer',
        titulo: 'Fazer tudo, ou não fazer nada',
        texto:
          'Piscina, ténis, bilhar, ping-pong, um passeio de bicicleta, três pianos e uma biblioteca, tudo incluído. Ou só um cadeirão no beiral, um livro e a serra ao fundo.',
        // texto curto para caber numa linha no telemovel
        ligacao: { texto: 'Entre jogos e sossego', href: '#galeria-lazer' },
        fotos: [
          { src: '/fotos/dia-lazer-1.jpg', alt: 'A piscina no relvado, com o alpendre e a serra ao fundo', aspeto: 4 / 3 },
          // foto do dono (2026-10-01): as bicicletas da casa, no lugar do beiral
          { src: '/fotos/dia-lazer-bicicletas.jpg', alt: 'Duas bicicletas da casa debaixo do alpendre de granito, junto à lenha', aspeto: 1020 / 768 },
          { src: '/fotos/dia-lazer-3.jpg', alt: 'Sala de bilhar com paredes de granito', aspeto: 4 / 3 },
        ],
      },
      {
        periodo: 'Noite',
        momento: 'Ao serão',
        titulo: 'Dorme-se dentro de uma casa-museu',
        texto:
          'As janelas acendem-se uma a uma. Dentro, arte de quatro séculos, três pianos e uma coleção de vinis de música clássica.',
        fotos: [
          // faixa panoramica: a fachada ao anoitecer, com as janelas acesas
          // panoramica inteira, sem corte: o aspeto e o do original (2172x724)
          { src: '/fotos/dia-noite-1.jpg', alt: 'A fachada do solar ao anoitecer, com as janelas iluminadas', aspeto: 2172 / 724 },
          { src: '/fotos/dia-noite-2.jpg', alt: 'Piano de cauda num salão de paredes de granito', aspeto: 1024 / 715 },
        ],
      },
    ],
  },

  /* 04 A Casa. Visita guiada pelos espacos, com a informacao pratica
     misturada nas legendas e nao numa ficha tecnica.

     A ordem e a que o Diogo pediu (2026-09-18): o parque, os quartos, a
     piscina e o tenis a frente; depois as pecas, as salas de jogos, os
     saloes, a mesa e as criancas. O beiral saiu daqui
     porque a sua fotografia passou para a Tarde, no "Um dia na casa": duas
     seccoes com a mesma foto ficava pobre.

     Nenhum cartao abre galeria (o dono, 2026-10-07: so alguns terem
     galeria desequilibrava a seccao). As fotografias estao todas na
     pagina /galeria, ligada no fim da introducao. */
  visita: {
    etiqueta: 'Os espaços',
    titulo: 'Por dentro *da casa.*',
    intro:
      'Quatro salões, duas salas de jogos, piscina, ténis e um parque à inglesa. Tudo está aberto a quem fica: a casa é para se usar.',
    espacos: [
      {
        nome: 'O parque',
        // adaptado do texto da propria casa no Booking (perfil do anfitriao):
        // "um parque que o transporta ao melhor que os jardins ingleses nos
        // oferecem com recantos onde se esquece o presente e o tempo para!"
        nota: 'Ao jeito dos jardins ingleses: alameda, bosque, cedros antigos e recantos onde se esquece o presente e o tempo para.',
        imagem: '/fotos/casa-jardim.jpg',
        alt: 'Cedros antigos e um banco à sombra no parque',
      },
      {
        nome: 'Os quartos',
        nota: 'Têm nomes de flores e casa de banho privativa. Os do primeiro piso têm ar condicionado; a casa toda tem aquecimento central.',
        imagem: '/fotos/casa-quartos.jpg',
        alt: 'Quarto com duas camas e colchas floridas',
      },
      {
        nome: 'A piscina',
        nota: 'No relvado, de junho a setembro, com a serra ao fundo e espreguiçadeiras à volta.',
        imagem: '/fotos/casa-piscina.jpg',
        alt: 'A piscina ao pôr do sol, com a serra ao fundo',
      },
      {
        nome: 'O campo de ténis',
        nota: 'No fundo do parque. As raquetes são da casa, como as bicicletas.',
        imagem: '/fotos/casa-tenis.jpg',
        alt: 'O campo de ténis, rodeado de árvores',
      },
      {
        /* As "Ten Master Pieces" do site da casa. Logo a seguir aos quatro
           que o Diogo pos a frente (2026-09-18): e o mais perto do primeiro
           ecra da visita que fica, para as pecas se verem cedo. Legendas do
           proprio site. */
        nome: 'As dez peças',
        nota: 'Um retábulo flamengo do século XVII, uma Pietà do século XVI, um desenho de Domingos Sequeira. São dez as peças que a casa destaca da sua coleção.',
        imagem: '/fotos/casa-pecas.jpg',
        alt: 'Retábulo flamengo do século XVII, em madeira dourada, com a cena da Circuncisão',
      },
      {
        nome: 'As salas de jogos',
        // o dono corrigiu (2026-10-01): sao duas salas, nao tres
        nota: 'Duas, abertas a quem fica. O bilhar tem paredes de granito; o ping-pong joga-se ao lado do piano de cauda.',
        imagem: '/fotos/casa-jogos.jpg',
        alt: 'Sala de ping-pong com paredes de granito e o piano de cauda ao fundo',
      },
      {
        nome: 'Os salões',
        nota: 'Quatro, cada um com o seu ar: cadeirões, lareira, retratos de família e as peças que o dono escolheu.',
        imagem: '/fotos/casa-saloes.jpg',
        alt: 'Salão com estantes de livros, retratos e cadeirões',
      },
      {
        nome: 'A sala de refeições',
        // o dono corrigiu (2026-10-01): a sala so serve pequenos-almocos
        nota: 'É aqui que se serve o pequeno-almoço, debaixo do teto trabalhado e do lustre.',
        imagem: '/fotos/casa-refeicoes.jpg',
        alt: 'Sala de refeições com teto trabalhado, lustre e mesas postas',
      },
      {
        nome: 'O parque infantil',
        nota: 'Entre as azáleas, com balanços e escorrega. Ao lado há uma rede pendurada entre as árvores.',
        imagem: '/fotos/casa-infantil.jpg',
        alt: 'Baloiço do parque infantil, entre azáleas em flor',
      },
    ],
  },

  /* 04b A volta. Pequena, entre a visita e as opinioes: o que ha perto e a
     que distancia, num mapa desenhado (pedido do Diogo, 2026-10-01).

     Os sitios e as distancias sao os que a propria casa da no Booking
     ("Informacao da area circundante", dossie/factos.md): Termas 3 km,
     S. Macario e as aldeias de xisto ~20 km, Caramulo e Viseu 22 km.
     Vouzela: 2,9 km de carro (OSRM). Ecopista: 0,9 km em linha reta ate ao
     traco (OpenStreetMap); as reviews dizem "a 3 minutos de bicicleta".
     As fotos sao do Wikimedia Commons, com licenca livre e o autor
     creditado no cartao de cada sitio (sem galeria: o dono achou que bastam). */
  aVolta: {
    etiqueta: 'À volta',
    titulo: 'Lafões, *à volta da casa.*',
    texto:
      'A casa fica entre a serra e o rio Vouga. Perto há termas, uma vila de granito e uma ecopista; um pouco mais longe, a serra e a cidade.',
    lugares: [
      { id: 'vouzela', nome: 'Vouzela', distancia: '3 km', nota: 'Vila de solares e granito, com a ponte da antiga linha do Vouga.', foto: '/fotos/galeria/avolta/vouzela-1.jpg' },
      { id: 'termas', nome: 'Termas de S. Pedro do Sul', distancia: '3 km', nota: 'Termas desde o tempo dos romanos e um spa à beira do Vouga.', foto: '/fotos/galeria/avolta/termas-rio-vouga.jpg' },
      { id: 'ecopista', nome: 'Ecopista do Vouga', distancia: '1 km', nota: 'A antiga linha de comboio, feita caminho de bicicleta, com pontes e túneis.', foto: '/fotos/galeria/avolta/ecopista-1.jpg' },
      { id: 'macario', nome: 'Serra de S. Macário', distancia: '20 km', nota: 'Vistas largas e aldeias de xisto, como a Pena e o Fujaco.', foto: '/fotos/galeria/avolta/macario-1.jpg' },
      { id: 'caramulo', nome: 'Serra do Caramulo', distancia: '22 km', nota: 'Desportos na serra e o Museu do Caramulo, de arte e automóveis.', foto: '/fotos/galeria/avolta/caramulo-1.jpg' },
      { id: 'viseu', nome: 'Viseu', distancia: '22 km', nota: 'A cidade, com a Sé e o centro histórico.', foto: '/fotos/galeria/avolta/viseu-1.jpg' },
    ],
  },

  /* 05 Prova social. Citacoes REAIS do Booking, copiadas a letra do
     dossie (reviews.md), com o nome proprio que a plataforma mostra.
     A nota e o total sao os do Google Maps (4,8 em 128), porque a fila
     de estrelas e sobre cinco. Booking: 9,3 em 236. */
  reviews: {
    etiqueta: 'Opiniões',
    titulo: 'Quem já cá *dormiu.*',
    media: '4,8',
    total: 128,
    citacoes: [
      {
        texto: 'Da calma. Da simpatia do anfitrião e da Dona Maria do Carmo. Dos jardins. E da sensação de viver numa casa museu.',
        quem: 'Jorge',
        onde: 'Booking',
        data: 'Agosto 2026',
      },
      {
        texto: 'O jardim parece retirado de um romance do sec. XIX.',
        quem: 'Paulo',
        onde: 'Booking',
        data: 'Setembro 2023',
      },
      {
        texto: 'A simpatia da D. Maria do Carmo na receção e durante a estadia foi inexcedível.',
        quem: 'Rosa',
        onde: 'Booking',
        data: 'Junho 2025',
      },
      {
        texto: 'O lugar é tão aprazível que é difícil ter de vir embora. Por isso, prolongámos a nossa estadia por mais um dia.',
        quem: 'Isabel',
        onde: 'Booking',
        data: 'Junho 2026',
      },
    ],
  },

  /* 07 Fecho. Nao entra informacao nova, so se converte a decisao. */
  fecho: {
    etiqueta: 'Reservas',
    titulo: 'A casa fica *à vossa espera.*',
    texto: 'Veja as datas livres no Booking, ou trate de tudo com a casa por telefone. Quem responde é quem recebe.',
    imagem: '/fotos/fecho.jpg',
    imagemTelemovel: '/fotos/fecho-telemovel.jpg',
    alt: 'Vista de cima do parque da Casa de Fataunços, com a piscina, o parque infantil e o solar ao fundo',
  },

  /* Reservas. O site da casa nao tem motor de reservas: os botoes
     Reservar levam para o Booking, onde a casa vende online. */
  reservas: 'https://www.booking.com/hotel/pt/casa-de-fatauncos.pt-pt.html',

  /* 08 Rodape e contactos. Do site e do Booking. */
  contacto: {
    telefone: '+351 232 77 26 97',
    telefoneLimpo: '+351232772697',
    telemovel: '+351 91 698 60 85',
    telemovelLimpo: '+351916986085',
    email: 'info@casadefatauncos.pt',
    morada: 'Fataunços, 3670-091 Vouzela',
    /* Obrigatorio no site de um empreendimento turistico. */
    rnet: 'RNET n.º 5352',
    facebook: 'https://www.facebook.com/casadefatauncos/',
    mapa: 'https://www.google.com/maps?q=40.727278,-8.082007&z=14&output=embed',
  },
} as const;

export type Casa = typeof casa;
