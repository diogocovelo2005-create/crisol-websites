/*
  Todo o conteudo do site vive aqui.

  Casa da Calcada, Turismo de Habitacao, Oliveira do Douro, Cinfaes.

  Cada campo factual, editorial ou citacao esta mapeado para o contrato do
  dossie em conteudo-fontes.json. Regras que nao se negoceiam, e que estao
  todas escritas em dossie/site-pronto.md:

  - as citacoes sao copiadas a letra das plataformas, com autor, canal e
    data verdadeiros, e nunca reescritas nem traduzidas aqui;
  - nao ha precos: os do site do cliente nao tem data e o site dele esta
    parado desde 2010;
  - nao se promete recepcao a chegada, piscina impecavel, bar aberto,
    cozinha equipada no apartamento nem nada sobre o pequeno-almoco alem
    de estar incluido. Sao os seis conflitos activos do dossie;
  - nao se usa a palavra hotel nem estrelas: o Google rotula a casa assim,
    o registo diz Turismo de Habitacao.

  Nos titulos, o texto entre *asteriscos* sai em italico.
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
  atmosfera: { etiqueta: string; titulo: string; texto: string; imagem: string; alt: string; quartos: readonly { imagem: string; alt: string }[]; voz?: string; quem?: string };
  pico: { forma: string; etiqueta: string; titulo: string; intro: string; linha: readonly string[]; sol: readonly string[]; momentos: readonly { marca: string; momento: string; titulo: string; texto: string; imagem: string; alt: string; aspeto?: number; par?: { imagem: string; alt: string } }[] };
  visita: { etiqueta: string; titulo: string; intro: string; espacos: readonly { nome: string; nota: string; imagem: string; alt: string }[] };
  reviews?: { etiqueta: string; titulo: string; avaliacao?: { media: number; escala: number; plataforma: string; total: number; data: string }; citacoes: readonly { texto: string; quem: string; onde: string; data?: string }[] };
  fecho: { etiqueta: string; titulo: string; texto: string; imagem: string; imagemTelemovel?: string; alt: string };
  acoes: readonly AcaoReserva[];
  contacto: Contacto;
};

export const casa: Casa = {
  nome: 'Casa da Calçada',
  tipo: 'Turismo de Habitação',
  lugar: 'Douro',

  /* 01 Hero. A promessa que o resto da pagina tem de cumprir.
     A capela dentro da propriedade e o argumento mais repetido do dossie:
     sete reviews em cinco linguas, de 2021 a setembro de 2026. */
  hero: {
    etiqueta: 'Turismo de Habitação · Oliveira do Douro, Cinfães',
    titulo: 'Uma casa senhorial *com capela dentro.*',
    texto:
      'Dez quartos, piscina e court de ténis numa quinta virada para o rio Douro, a seis quilómetros de Cinfães.',
    imagem: '/fotos/hero-piscina-torre-01.jpg',
    alt: 'A piscina e o relvado da Casa da Calçada, com a torre sineira da capela e as montanhas ao fundo',
  },

  /* Faixa logo abaixo do hero: o essencial num relance. Quatro factos que
     o site pode afirmar sem condicao nenhuma. */
  pilares: [
    { icone: 'cama', titulo: 'Dez quartos', texto: 'Duas suites e seis duplos na casa principal, mais dois na casa de pedra.' },
    { icone: 'cafe', titulo: 'Pequeno-almoço incluído', texto: 'Em todas as estadias, em todos os quartos.' },
    { icone: 'piscina', titulo: 'Piscina e court de ténis', texto: 'Com balneários de apoio, jardins e patamares sobre o rio.' },
    { icone: 'capela', titulo: 'Capela própria', texto: 'Com torre sineira e vitrais, dentro dos muros da quinta.' },
  ],

  /* 02 A casa hoje.

     Uma divisao simples: o texto a esquerda, uma fotografia a direita.
     O arquivo de quatro entradas saiu. A historia da casa (construcao
     rural em granito, colonia de ferias de um colegio de Lisboa, a capela
     acrescentada) cabe em duas linhas aqui dentro, e nenhuma fotografia
     desta casa e de arquivo: sao todas de hoje, e por isso nao ha nada
     para ilustrar quatro entradas cronologicas. */
  atmosfera: {
    etiqueta: 'A casa',
    titulo: 'Dez quartos dentro *dos mesmos muros.*',
    texto:
      'Começou por ser uma construção rural em granito e cresceu no século XVIII até à forma que tem hoje. Mais tarde foi colónia de férias de um colégio de Lisboa, e foi daí que lhe veio a capela. Hoje recebe como Turismo de Habitação: oito quartos na casa principal, entre duas suites e seis duplos, e mais dois na casa de pedra junto à piscina. À volta deles ficam as salas com lareira, o salão de jogos, o salão para jantares e uma cozinha com forno a lenha.',
    imagem: '/fotos/a-casa-telhado-ameias.jpg',
    alt: 'O telhado da casa com as claraboias dos quartos do sótão e as ameias da muralha',
    quartos: [
      { imagem: '/fotos/a-casa-quarto-1.jpg', alt: 'Quarto twin com o candeeiro aceso e as cortinas' },
      { imagem: '/fotos/a-casa-quarto-2.jpg', alt: 'Quarto twin com o armário e as toalhas sobre a cama' },
    ],
    voz: 'Essa localização particular enfatiza o efeito surpreendente da sua arquitectura.',
    quem: 'Casa da Calçada, nas suas palavras',
  },

  /* 03 O pico. Sentimento: desejo.

     Nao sao horas do dia. Sao quatro coisas que se fazem sempre nesta quinta,
     tiradas por ordem de forca de pontos-fortes.md: percorrer a propriedade
     inteira com a capela dentro (7 reviews, 5 linguas, o tema mais repetido
     do dossie), nadar debaixo da torre (8 reviews) e descer os patamares
     ate o rio aparecer.

     Nao ha pequeno-almoco aqui: o dossie diz que o pequeno-almoco divide
     (9 reviews, 5 a favor e 4 contra) e o contrato so deixa dizer que esta
     incluido, que e o que a faixa dos pilares ja diz.

     Uma fotografia por coisa, todas exteriores e claras: as unicas do
     material que aguentam area grande. */
  pico: {
    forma: 'O que se faz aqui',
    etiqueta: 'A experiência',
    titulo: 'Três coisas *que acontecem sempre.*',
    intro:
      'Não é um programa nem um horário. É o que qualquer pessoa acaba por fazer, porque a quinta está feita assim.',
    linha: ['Percorrer', 'Nadar', 'Comer', 'Descer'],
    sol: ['3%', '35%', '68%', '97%'],
    momentos: [
      {
        marca: 'Um',
        momento: 'A casa acorda devagar',
        titulo: 'Acorda-se entre paredes de granito',
        texto:
          'São duas suites com cama de casal e seis quartos duplos na casa principal, todos com casa de banho privativa. Quatro deles ficam no segundo andar, com ar condicionado, tectos panorâmicos e claraboias viradas ao vale.',
        imagem: '/fotos/experiencia-1-quarto.jpg',
        alt: 'Quarto de casal com a parede de granito à vista, a cómoda e as toalhas dobradas',
        aspeto: 3 / 2,
      },
      {
        marca: 'Dois',
        momento: 'A piscina fica no patamar mais alto',
        titulo: 'Nada-se debaixo da torre sineira',
        texto:
          'A piscina exterior tem balneários de apoio e fica no ponto mais alto da quinta, com a capela de um lado e a serra do outro. Ao lado há court de ténis, que serve também de campo de futebol.',
        imagem: '/fotos/experiencia-2.jpg',
        alt: 'A piscina da quinta ao meio-dia, com a torre da capela e a serra ao fundo',
        aspeto: 3 / 2,
      },
      {
        marca: 'Três',
        momento: 'A mesa põe-se dentro de portas',
        titulo: 'Come-se nas salas de pedra',
        texto:
          'O pequeno-almoço está incluído em todas as estadias e em todos os quartos. Para o resto do dia há salão para jantares e uma cozinha com forno a lenha ao dispor de quem fica.',
        imagem: '/fotos/experiencia-refeicoes.jpg',
        alt: 'Mesa posta com terrina, copos de vinho e uma taça de cerejas, contra a parede de granito',
        aspeto: 3 / 2,
      },
      {
        marca: 'Quatro',
        momento: 'Os arredores começam fora dos muros',
        titulo: 'Há um Douro inteiro à volta',
        texto:
          'Nos arredores da casa, Cinfães abre-se entre o Douro e a serra de Montemuro: miradouros sobre o rio, cascatas no vale do Bestança e trilhos por calçadas antigas e aldeias de pedra.',
        imagem: '/fotos/arredores-foz-bestanca-douro.jpg',
        alt: 'Foz do rio Bestança e rio Douro vistos do Miradouro de Teixeirô, em Cinfães',
        aspeto: 3 / 2,
      },
    ],
  },

  /* 04 Os espacos, em mosaico: a casa toda num ecra. Cada um existe porque
     ha uma fotografia que o sustenta e um facto que o contrato deixa
     afirmar. A nota fica fechada e abre a pedido, para a seccao se ler
     num relance em vez de se percorrer. */
  visita: {
    etiqueta: 'Os espaços',
    titulo: 'O que se usa *além do quarto.*',
    intro:
      'A casa principal tem oito quartos e, à volta deles, salas de estar e de jantar com lareira, salão de jogos, salão para jantares e uma cozinha industrial com forno a lenha.',
    espacos: [
      {
        nome: 'A capela',
        nota: 'Reconstruída com a casa, com torre sineira, rosáceas e vitrais. Fica dentro dos muros, encostada à casa onde se dorme.',
        imagem: '/fotos/patio-escadas-01.jpg',
        alt: 'Pátio em vários níveis, com escadas de pedra entre os edifícios da quinta',
      },
      {
        nome: 'O jardim',
        nota: 'Relvado grande com árvores de grande porte, encostado à capela. É por onde se anda entre a casa e a piscina.',
        imagem: '/fotos/espaco-jardim.jpg',
        alt: 'Relvado grande com a capela e as árvores altas',
      },
      {
        nome: 'O salão de jogos',
        nota: 'Mesa de bilhar e paredes de granito à vista. É um dos espaços comuns que ficam ao dispor de quem fica.',
        imagem: '/fotos/espaco-bilhar.jpg',
        alt: 'A mesa de bilhar do salão de jogos, com a parede de granito',
      },
      {
        nome: 'O tanque da nascente',
        nota: 'Tanque de pedra com o repuxo a correr, à sombra de uma árvore, no meio dos jardins.',
        imagem: '/fotos/tanque-nascente-01.jpg',
        alt: 'Tanque de pedra alimentado pela nascente, com o repuxo a correr junto ao jardim',
      },
      {
        nome: 'O caminho de calçada',
        nota: 'Corre ao longo do muro de granito, debaixo das glicínias, e liga os patamares da quinta uns aos outros.',
        imagem: '/fotos/espaco-glicinias.jpg',
        alt: 'Caminho de calçada ao longo do muro de granito, com as glicínias por cima',
      },
      {
        nome: 'A casa de pedra',
        nota: 'Dois quartos duplos com ar condicionado, casa de banho, sala com kitchenette e varanda, independentes da casa principal.',
        imagem: '/fotos/capela-interior-01.jpg',
        alt: 'Interior da capela, com bancos de madeira, altares de pedra e vitrais',
      },
    ],
  },

  /* 05 Prova social. Citacoes copiadas a letra do Booking e do Google
     Maps, com o autor e a data que a plataforma mostra. A do Ramiro esta
     em espanhol e fica em espanhol: traduzir uma review e reescreve-la. */
  reviews: {
    etiqueta: 'Opiniões',
    titulo: 'Quem já cá *ficou.*',
    avaliacao: { media: 8.8, escala: 10, plataforma: 'Booking', total: 46, data: 'Setembro de 2026' },
    citacoes: [
      {
        texto: 'Alojamiento situado en el interior de un castillo, en el que estuvimos completamente solos.',
        quem: 'Ramiro',
        onde: 'Booking',
        data: 'Novembro de 2023',
      },
      {
        texto: 'É um local calmo e muito sossegado, ideal para descansar e desligar do mundo.',
        quem: 'Johnny Lino',
        onde: 'Google Maps',
        data: 'Outubro de 2024',
      },
      {
        texto: 'Fiquei encantada com tudo. Desde a piscina, as condições do alojamento, o jardim, tudo!',
        quem: 'Margarida',
        onde: 'Booking',
        data: 'Julho de 2024',
      },
      {
        texto: 'O que mais gostei foi a envolvencia em que o alojamento se encontra, com espaços verdes e generosos, ideal para momentos de descanso.',
        quem: 'Maria',
        onde: 'Booking',
        data: 'Agosto de 2024',
      },
      {
        texto: 'Sentimo-nos em casa',
        quem: 'Carlos',
        onde: 'Booking',
        data: 'Outubro de 2023',
      },
    ],
  },

  /* 07 Fecho. Nao entra informacao nova, so se converte a decisao.
     A casa nao tem reserva imediata nem recepcao permanente: o fecho diz
     exactamente o que ela propria diz que acontece a seguir. */
  fecho: {
    etiqueta: 'Reservas',
    titulo: 'Diga as datas *e a casa responde.*',
    texto:
      'A reserva faz-se por contacto direto, por telefone ou por email. A casa confirma a disponibilidade e combina consigo a chegada.',
    imagem: '/fotos/fecho-aerea.jpg',
    imagemTelemovel: '/fotos/fecho-aerea-telemovel.jpg',
    alt: 'Vista aérea da quinta inteira: o court de ténis, a piscina, a capela e os jardins em patamares',
  },

  /* Accoes confirmadas: so as duas que a propria casa publica como forma
     de reservar. Sem WhatsApp e sem reserva directa, que ela nao tem. */
  acoes: [
    { tipo: 'telefone', rotulo: 'Ligar para a casa', href: 'tel:+351936345815' },
    { tipo: 'email', rotulo: 'Pedir disponibilidade', href: 'mailto:geral@casacalcada.com' },
  ],

  /* 08 Rodape e contactos.
     O codigo postal vai sem os quatro digitos finais: o Booking diz
     4690-376 e o Turismo de Portugal diz 4690-387, e o dossie nao decidiu.
     O registo vai sem prefixo pela mesma razao: o numero esta confirmado
     por duas fontes, a forma exacta nao. */
  contacto: {
    telefone: { valor: '+351 936 345 815', href: 'tel:+351936345815' },
    email: { valor: 'geral@casacalcada.com', href: 'mailto:geral@casacalcada.com' },
    morada: 'Lugar da Calçada, Oliveira do Douro, 4690 Cinfães',
    registo: { tipo: 'outro', numero: '1375' },
    mapa: 'https://www.google.com/maps?q=41.0880587,-8.0406848&z=13&output=embed',
  },
};
