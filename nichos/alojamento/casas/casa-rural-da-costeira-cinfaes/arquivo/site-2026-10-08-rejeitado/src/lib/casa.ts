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
  nome: 'Casa Rural da Costeira',
  tipo: 'Casa de Campo',
  lugar: 'Cinfães',
  hero: {
    etiqueta: 'Casa de Campo · Cinfães',
    titulo: 'Devagar, *na Costeira*',
    texto:
      'Uma Casa de Campo de granito em Cinfães, com piscina, churrasco e lareira, a cerca de 8 a 10 minutos de carro do Douro.',
    imagem: '/fotos/piscina-05.jpg',
    alt: 'A piscina com trampolim e espreguiçadeiras, a casa de granito ao lado e a torre ao fundo',
    foco: '50% 45%',
  },
  navegacao: [
    { href: '#chegar', texto: 'A casa' },
    { href: '#dia', texto: 'O dia' },
    { href: '#noite', texto: 'Quartos' },
    { href: '#volta', texto: 'À volta' },
  ],
  acoes: [
    { tipo: 'reserva', rotulo: 'Ver disponibilidade', href: 'https://www.airbnb.pt/rooms/2768412' },
    { tipo: 'telefone', rotulo: 'Telefonar', href: 'tel:+351914797673' },
  ],
  contacto: {
    morada: 'Calçada de Medados, 158, 4690-055 Cinfães',
    telefone: { valor: '+351 914 797 673', href: 'tel:+351914797673' },
    email: { valor: 'casaruraldacosteira@gmail.com', href: 'mailto:casaruraldacosteira@gmail.com' },
    registo: { tipo: 'RNET', numero: '4967' },
  },
};
