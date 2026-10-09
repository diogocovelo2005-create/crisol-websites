/*
  Os dados partilhados do site: o primeiro ecrã, a navegação, as ações de
  reserva e os contactos. Passados à letra do protótipo B (prototipos/b.html),
  que o Diogo escolheu a 08/10; os contactos e o registo vêm do contrato.

  O texto das outras secções vive nos componentes delas, em
  src/components/seccoes/.

  Nos títulos, o texto entre *asteriscos* sai em itálico.

  Sem `voz`: o Diogo pediu para tirar a citação logo a seguir ao primeiro
  ecrã.
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
  logo?: { src: string; claro?: string; largura: number; altura: number };
  hero: { etiqueta: string; titulo: string; texto: string; imagem: string; alt: string; foco?: string };
  voz?: { texto: string; quem?: string };
  navegacao: readonly { href: string; texto: string }[];
  acoes: readonly AcaoReserva[];
  contacto: Contacto;
};

/* A reserva online só existe no Airbnb (AF-RESERVA-AIRBNB). Como no B, o
   botão leva primeiro ao contacto, onde se explica a condição do Airbnb e
   está a ligação para lá. */
export const RESERVA_AIRBNB = 'https://www.airbnb.pt/rooms/2768412';

export const casa: Casa = {
  nome: 'Casa Rural da Costeira',
  tipo: 'Casa de Campo',
  lugar: 'Cinfães',
  hero: {
    etiqueta: 'Casa de Campo · Cinfães',
    titulo: 'Pedra, piscina e *uma mesa para todos*',
    texto:
      'Uma Casa de Campo de granito em Cinfães, com piscina, churrasco com forno a lenha e uma sala com lareira. O centro da vila fica a cerca de 1,5 km e o Douro a cerca de 8 a 10 minutos de carro.',
    imagem: '/fotos/piscina-05.jpg',
    alt: 'A piscina com trampolim e espreguiçadeiras, com a casa de granito ao lado e a encosta ao fundo',
    foco: '50% 45%',
  },
  /* Cinco secções no B; no cabeçalho cabem quatro e o botão. A sala fica
     de fora do menu (continua a ter âncora). */
  navegacao: [
    { href: '#casa', texto: 'A casa' },
    { href: '#fora', texto: 'Cá fora' },
    { href: '#quartos', texto: 'Quartos' },
    { href: '#volta', texto: 'À volta' },
  ],
  acoes: [{ tipo: 'reserva', rotulo: 'Ver disponibilidade', href: '#contacto' }],
  contacto: {
    morada: 'Calçada de Medados, 158, 4690-055 Cinfães',
    telefone: { valor: '+351 914 797 673', href: 'tel:+351914797673' },
    email: { valor: 'casaruraldacosteira@gmail.com', href: 'mailto:casaruraldacosteira@gmail.com' },
    registo: { tipo: 'RNET', numero: '4967' },
  },
};
