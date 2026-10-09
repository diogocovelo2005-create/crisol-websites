/*
  Os dados partilhados do site: o primeiro ecrã, a navegação, as ações de
  reserva e os contactos. Preenchidos pelo Claude a partir do BRIEF.md
  (secção 1 e secção de contacto) e do contrato do dossiê.

  O texto das outras secções vive nos componentes delas, em
  src/components/seccoes/, passado à letra do protótipo escolhido.

  Nos títulos, o texto entre *asteriscos* sai em itálico.

  Só factos, contactos e citações do contrato, com as condições dele. O
  registo pode ser RNAL, RNET ou outro identificador confirmado; nunca o
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
  /* O logótipo da casa, se tiver um confirmado no dossiê (em public/).
     `claro` é a versão para pôr por cima da foto do primeiro ecrã. Sem
     logótipo, o cabeçalho mostra o nome e o tipo. */
  logo?: { src: string; claro?: string; largura: number; altura: number };
  /* O primeiro ecrã: formato fixo, igual em todas as casas. Uma foto
     panorâmica a ecrã inteiro; `foco` é o ponto focal (object-position,
     ex. '50% 60%', de prototipos/fotos.md), para o recorte do telemóvel. */
  hero: { etiqueta: string; titulo: string; texto: string; imagem: string; alt: string; foco?: string };
  /* O segundo tempo do primeiro ecrã: a voz de quem recebe (ou uma citação,
     com `quem`). Sem voz, o primeiro ecrã fica só com o primeiro tempo. */
  voz?: { texto: string; quem?: string };
  /* As âncoras das secções, para o cabeçalho e o rodapé. */
  navegacao: readonly { href: string; texto: string }[];
  /* Ações confirmadas. Basta uma; não criar WhatsApp, email ou reserva
     direta quando o dossiê não os confirma. */
  acoes: readonly AcaoReserva[];
  contacto: Contacto;
};

export const casa: Casa = {
  nome: 'Casa da Alufinha',
  tipo: 'Alojamento Local',
  lugar: 'Douro',
  hero: {
    etiqueta: 'Alojamento Local · Resende, Douro',
    titulo: 'A casa inteira, a piscina e o Douro, *só para vocês*.',
    texto: 'Uma casa antiga de granito em São João de Fontoura, remodelada, com três quartos e uma piscina privada virada para os socalcos.',
    // a versão tratada da aérea (2026-10-09), no tamanho original, sem recompressão
    imagem: '/fotos/vista-02-hero.jpg',
    alt: 'Vista aérea da Casa da Alufinha, de telhado vermelho, com a piscina e as vinhas em socalco à volta',
    foco: '60% 50%',
  },
  // CIT-11, à letra (o espaço antes da vírgula é do Rui)
  voz: { texto: 'A casa era um sonho , ideal para famílias que queiram descansar', quem: 'Rui, Airbnb' },
  navegacao: [
    { href: '#casa', texto: 'Cá fora' },
    { href: '#dentro', texto: 'Por dentro' },
    { href: '#quartos', texto: 'Quartos' },
    { href: '#volta', texto: 'À volta' },
  ],
  // O primeiro botão leva à secção Reservar, onde está o "Ligar".
  acoes: [{ tipo: 'reserva', rotulo: 'Reservar', href: '#contacto' }],
  contacto: {
    morada: 'Calçada da Ponte da Alufinha, 142, 4660-339 São João de Fontoura, Resende',
    telefone: { valor: '912 331 756', href: 'tel:+351912331756' },
    email: { valor: 'mariajoaopaulapinto@gmail.com', href: 'mailto:mariajoaopaulapinto@gmail.com' },
    registo: { tipo: 'RNAL', numero: '157740/AL' },
  },
};

export const canais = [
  { nome: 'Booking', href: 'https://www.booking.com/hotel/pt/casa-da-alufinha.pt-pt.html' },
  { nome: 'Airbnb', href: 'https://www.airbnb.pt/rooms/1709247571486500891' },
  { nome: 'Vrbo', href: 'https://www.vrbo.com/en-gb/p5796211' },
] as const;
