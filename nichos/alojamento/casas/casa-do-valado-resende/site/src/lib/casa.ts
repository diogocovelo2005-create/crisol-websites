/*
  Os dados partilhados do site: o primeiro ecrã, a navegação, as ações de
  reserva e os contactos. Preenchidos a partir do BRIEF.md (secção 1 e
  secção de contacto) e do contrato do dossiê.

  O texto das outras secções vive nos componentes delas, em
  src/components/seccoes/, passado à letra do protótipo escolhido (C).

  Nos títulos, o texto entre *asteriscos* sai em itálico.

  Por confirmar com o dono antes de publicar (contrato): o telefone, o email
  para pedidos e qual o canal de reserva a mostrar primeiro.
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
  voz?: { texto: string; quem?: string };
  navegacao: readonly { href: string; texto: string }[];
  acoes: readonly AcaoReserva[];
  contacto: Contacto;
};

export const BOOKING = 'https://www.booking.com/hotel/pt/casa-do-valado-resende.pt-pt.html';
export const AIRBNB = 'https://www.airbnb.com/rooms/1303722712710569422';

export const casa: Casa = {
  nome: 'Casa do Valado',
  tipo: 'Alojamento Local',
  lugar: 'Resende',
  hero: {
    etiqueta: 'Alojamento Local · Resende',
    titulo: 'Uma casa de granito *toda vossa*, de frente para o vale.',
    texto:
      'A casa, a piscina e o jardim são só para quem lá fica. Lá fora, um deck virado ao vale; cá dentro, pedra e lareira.',
    imagem: '/fotos/piscina-03.jpg',
    alt: 'A piscina rodeada de relva, com a casa de granito à direita e a churrasqueira coberta ao fundo, entre sebes e árvores',
  },
  voz: {
    texto: 'A vista da casa e do jardim é soberba.',
    quem: 'Clara · Booking',
  },
  navegacao: [
    { href: '#fora', texto: 'Lá fora' },
    { href: '#casa', texto: 'A casa' },
    { href: '#quartos', texto: 'Quartos' },
    { href: '#volta', texto: 'À volta' },
  ],
  acoes: [
    { tipo: 'reserva', rotulo: 'Ver disponibilidade', href: BOOKING },
    { tipo: 'reserva', rotulo: 'Airbnb', href: AIRBNB },
  ],
  contacto: {
    morada: 'Rua Valado 321, Resende',
    telefone: { valor: '911 505 394', href: 'tel:+351911505394' },
    email: { valor: 'wearecasadovalado@gmail.com', href: 'mailto:wearecasadovalado@gmail.com' },
    mapa: 'https://maps.google.com/maps?q=Rua%20Valado%20321%2C%20Resende&z=14&output=embed',
    registo: { tipo: 'RNAL', numero: '88302/AL' },
  },
};
