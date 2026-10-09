/*
  Todo o conteudo do molde vive aqui.

  Trocar este ficheiro (mais as fotografias em public/imagens/) transforma
  o molde no site de uma casa concreta sem abrir um unico componente.

  Nos titulos, o texto entre *asteriscos* sai em italico. E o gesto
  tipografico das referencias: uma parte do titulo em italico.

  ATENCAO ao que e inventado. Esta casa nao existe. O nome, os textos,
  as reviews, a morada e o numero de RNAL sao marcadores de posicao.
  Quando isto virar o site de um cliente:

  - `reviews` so leva citacoes reais, copiadas a letra da plataforma,
    com nota e data verdadeiras. Nunca reescritas.
  - `pico` so leva factos que aparecam no dossie, nas reviews ou na voz
    do proprio alojamento. Nao se inventa um momento para encher.
  - o registo pode ser RNAL, RNET ou outro identificador confirmado; nunca o
    assumes pelo tipo comercial da casa.
*/

export type AcaoReserva = {
  tipo: 'reserva' | 'pedido_disponibilidade' | 'telefone' | 'email' | 'whatsapp';
  rotulo: string;
  href: string;
};

export type Contacto = {
  morada?: string;
  telefone?: { valor: string; href: string };
  email?: { valor: string; href: string };
  whatsapp?: { valor: string; href: string };
  instagram?: string;
  mapa?: string;
  registo?: { tipo: 'RNAL' | 'RNET' | 'outro'; numero: string };
};

export type Casa = {
  nome: string;
  tipo: string;
  lugar: string;
  hero: { etiqueta: string; titulo: string; texto: string; imagem: string; alt: string };
  pilares: readonly { icone: string; titulo: string; texto: string }[];
  atmosfera: { etiqueta: string; titulo: string; texto: string; voz?: string; quem?: string; imagem: string; alt: string; imagemPequena?: string; altPequena?: string };
  pico: { forma: string; etiqueta: string; titulo: string; intro: string; linha: readonly string[]; sol: readonly string[]; momentos: readonly { marca: string; momento: string; titulo: string; texto: string; imagem: string; alt: string; aspeto?: number; par?: { imagem: string; alt: string } }[] };
  visita: { etiqueta: string; titulo: string; intro: string; espacos: readonly { nome: string; nota: string; imagem: string; alt: string }[] };
  reviews?: { etiqueta: string; titulo: string; avaliacao?: { media: number; escala: number; plataforma: string; total: number; data: string }; citacoes: readonly { texto: string; quem: string; onde: string; data?: string }[] };
  fecho: { etiqueta: string; titulo: string; texto: string; imagem: string; imagemTelemovel?: string; alt: string };
  acoes: readonly AcaoReserva[];
  contacto: Contacto;
};

export const casa: Casa = {
  nome: 'Casa da Nogueira',
  tipo: 'Casa de campo',
  lugar: 'Vale do Paiva',

  /* 01 Hero. A promessa que o resto da pagina tem de cumprir. */
  hero: {
    etiqueta: 'Casa de campo no Vale do Paiva',
    titulo: 'Uma casa de pedra *no meio do vale.*',
    texto:
      'Três quartos numa casa de família restaurada, para quem quer acordar devagar e sem pressa nenhuma.',
    imagem: '/fotos/hero.jpg',
    alt: 'A Casa da Nogueira ao fim da tarde, entre ciprestes, com o caminho de gravilha até à porta',
  },

  /* Faixa logo abaixo do hero: o essencial num relance. */
  pilares: [
    { icone: 'cama', titulo: 'Três quartos', texto: 'Até seis pessoas, todos com vista para o vale.' },
    { icone: 'cafe', titulo: 'Pequeno-almoço incluído', texto: 'Feito em casa, servido até tarde.' },
    { icone: 'pata', titulo: 'Animais bem-vindos', texto: 'Sem custo extra, com pátio murado.' },
    { icone: 'trilho', titulo: 'Trilhos à porta', texto: 'Os Passadiços do Paiva ficam a vinte minutos.' },
  ],

  /* 02 A atmosfera. Sente-se antes de se saber qualquer facto. */
  atmosfera: {
    etiqueta: 'A casa',
    titulo: 'Uma casa de família, *devolvida pedra a pedra.*',
    texto:
      'Foi dos avós da Inês. Levou quatro anos a recuperar, com a pedra, as vigas e as portadas de origem. Hoje recebe poucas pessoas de cada vez, que é a única maneira de continuar a ser uma casa.',
    /* A voz de quem recebe: e o segundo tempo do hero, quando o scroll
       avanca pelo caminho ate a casa. */
    voz: 'A casa era dos meus avós. Levámos quatro anos a devolvê-la, pedra a pedra. Hoje recebemos quem procura o mesmo silêncio que nos fez ficar.',
    quem: 'Inês e Rui, anfitriões',
    imagem: '/fotos/atmosfera.jpg',
    alt: 'Sala de tetos altos com vigas de madeira e sol a entrar pelas janelas',
    imagemPequena: '/fotos/casa-patio.jpg',
    altPequena: 'Pátio caiado com cadeiras de ferro e vasos',
  },

  /* 03 O pico. A espinha da pagina: o que se vive dentro da casa, em 3
     momentos, contado numa das formas de contar do catalogo
     (molde/VARIANTES.md). A mesma estrutura serve todas as variantes do
     pico; cada uma usa os campos de que precisa.

     - `linha` e `sol`: os rotulos da linha por baixo e onde o marcador
       para (Relogio e Provas). Na forma "O relogio" sao as horas.
     - `par`: a segunda foto de cada momento (so as Provas em papel pousam
       duas). `aspeto` e a proporcao da foto principal nas Provas. */
  pico: {
    forma: 'O relógio',
    etiqueta: 'A estadia',
    titulo: 'Um dia *na casa.*',
    intro: 'Do primeiro café à última lenha, é assim que passam as horas aqui.',
    linha: ['Manhã', 'Tarde', 'Noite'],
    sol: ['3%', '19%', '87%'],
    momentos: [
      {
        marca: '07:30',
        momento: 'Acordar',
        titulo: 'O vale fica à janela',
        texto:
          'Os três quartos dão para o mesmo lado. De manhã o nevoeiro assenta lá em baixo e só levanta por volta das nove.',
        imagem: '/fotos/dia-manha.jpg',
        alt: 'Quarto com cama de ferro junto a uma janela aberta sobre o verde',
        aspeto: 4 / 3,
        par: { imagem: '/fotos/casa-quarto.jpg', alt: 'Quarto com cama de casal, arca de madeira aos pés e teto de vigas escuras' },
      },
      {
        marca: '10:00',
        momento: 'Sentar à mesa',
        titulo: 'O pequeno-almoço é feito em casa',
        texto:
          'Pão cozido na véspera, doce do quintal, café de cafeteira. Serve-se até tarde, porque aqui ninguém tem hora.',
        imagem: '/fotos/dia-mesa.jpg',
        alt: 'Mesa de pequeno-almoço ao ar livre, com pão escuro e loiça de barro',
        aspeto: 4 / 3,
        par: { imagem: '/fotos/casa-cozinha.jpg', alt: 'Cozinha antiga com armário de vidro, loiça e bancada de madeira' },
      },
      {
        marca: '21:00',
        momento: 'Ficar ao lume',
        titulo: 'A lareira acende-se todas as noites',
        texto:
          'De outubro a maio está sempre a arder quando chegam. A lenha é do souto e já está partida, ao lado.',
        imagem: '/fotos/dia-lareira.jpg',
        alt: 'Lareira de pedra acesa numa sala com sofás e um livro aberto na mesa',
        aspeto: 3 / 2,
        par: { imagem: '/fotos/casa-sala.jpg', alt: 'Sala clara com poltrona, cómoda e janela de madeira' },
      },
    ],
  },

  /* 04 A Casa. Visita guiada pelos espacos, com a informacao pratica
     misturada nas legendas e nao numa ficha tecnica. */
  visita: {
    etiqueta: 'Os espaços',
    titulo: 'Por dentro *da casa.*',
    intro:
      'Dois pisos à volta de um pátio. Três quartos para até seis pessoas, e estes são os sítios onde se passa o tempo.',
    espacos: [
      {
        nome: 'O quarto grande',
        nota: 'Cama de casal, vigas à vista e a arca de madeira que já lá estava.',
        imagem: '/fotos/casa-quarto.jpg',
        alt: 'Quarto com cama de casal, arca de madeira aos pés e teto de vigas escuras',
      },
      {
        nome: 'A sala',
        nota: 'Onde toda a gente acaba por ficar. Livros, salamandra e uma escada para o piso de cima.',
        imagem: '/fotos/casa-sala.jpg',
        alt: 'Sala clara com poltrona, cómoda e janela de madeira',
      },
      {
        nome: 'A cozinha',
        nota: 'É de usar. A bancada de madeira é a mesma onde se toma o pequeno-almoço no inverno.',
        imagem: '/fotos/casa-cozinha.jpg',
        alt: 'Cozinha antiga com armário de vidro, loiça e bancada de madeira',
      },
      {
        nome: 'A casa de banho',
        nota: 'Banheira de pés debaixo da janela em arco, e água quente a lenha.',
        imagem: '/fotos/casa-banho.jpg',
        alt: 'Banheira antiga com almofadas debaixo de uma janela em arco',
      },
      {
        nome: 'O pátio',
        nota: 'Caiado e à sombra. Janta-se aqui de junho a setembro.',
        imagem: '/fotos/casa-patio.jpg',
        alt: 'Pátio de chão de pedra com mesa e cadeiras de ferro',
      },
      {
        nome: 'O tanque',
        nota: 'Era o tanque de rega. Tem dez metros e a água é fria o ano inteiro.',
        imagem: '/fotos/casa-jardim.jpg',
        alt: 'Piscina comprida num relvado com árvores à volta, ao fim do dia',
      },
    ],
  },

  /* 05 Prova social. MARCADORES DE POSICAO. Substituir por citacoes
     reais, copiadas a letra, antes de isto ir para o ar. */
  reviews: {
    etiqueta: 'Opiniões',
    titulo: 'Quem já cá *dormiu.*',
    avaliacao: { media: 4.9, escala: 5, plataforma: 'Booking', total: 87, data: 'Setembro 2025' },
    citacoes: [
      {
        texto: 'Saímos de lá a dormir melhor do que chegámos. A vista de manhã não se explica.',
        quem: 'Marta Vilaça',
        onde: 'Booking',
        data: 'Setembro 2025',
      },
      {
        texto: 'O Rui deixou a lareira acesa e pão em cima da mesa. Parecia que já contavam connosco.',
        quem: 'Tiago Almeida',
        onde: 'Airbnb',
        data: 'Março 2025',
      },
      {
        texto: 'Fomos com dois miúdos e não houve um dia em que quisessem entrar no carro.',
        quem: 'Cláudia Ferrão',
        onde: 'Booking',
        data: 'Agosto 2025',
      },
    ],
  },

  /* 07 Fecho. Nao entra informacao nova, so se converte a decisao. */
  fecho: {
    etiqueta: 'Reservas',
    titulo: 'A casa fica *à vossa espera.*',
    texto: 'Veja as datas livres e reserve em poucos minutos. Se ainda tiver uma pergunta, fale connosco antes.',
    imagem: '/fotos/fecho-casa.jpg',
    imagemTelemovel: '/fotos/fecho-casa-telemovel.jpg',
    alt: 'A casa de pedra entre ciprestes, com a piscina ao fim do dia',
  },

  /* Ações confirmadas. Basta uma; não criar WhatsApp, email ou reserva
     direta quando o dossiê não os confirma. */
  acoes: [
    { tipo: 'reserva', rotulo: 'Reservar estadia', href: 'https://www.booking.com/' },
    { tipo: 'whatsapp', rotulo: 'Falar connosco', href: 'https://wa.me/351910000000' },
  ],

  /* 08 Rodape e contactos. */
  contacto: {
    telefone: { valor: '+351 232 000 000', href: 'tel:+351232000000' },
    whatsapp: { valor: '+351 910 000 000', href: 'https://wa.me/351910000000' },
    email: { valor: 'reservas@casadanogueira.pt', href: 'mailto:reservas@casadanogueira.pt' },
    morada: 'Lugar da Nogueira, 3600-000 Castro Daire',
    registo: { tipo: 'RNAL', numero: '000000/AL' },
    mapa: 'https://www.google.com/maps?q=Castro+Daire,+Portugal&z=11&output=embed',
    instagram: 'https://instagram.com/',
  },
};
