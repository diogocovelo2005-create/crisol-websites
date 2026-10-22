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

export const AIRBNB = 'https://www.airbnb.pt/rooms/1452014258760429542';

export const casa: Casa = {
  nome: 'A Família na Quinta',
  tipo: 'Casa na quinta',
  lugar: 'Lamego',
  hero: {
    etiqueta: 'Casa na quinta · Lamego',
    titulo: 'Uma casa de pedra numa *quinta que acolhe*',
    texto:
      'Uma moradia de 60 m² só para vocês, com varanda e spa virados ao vale, numa quinta familiar em Lamego. Na mesma quinta, a família acolhe animais de quinta resgatados, para a vida inteira.',
    imagem: '/fotos/airbnb-29.jpg',
    alt: 'A casa de pedra à esquerda, a varanda com o spa, o guarda-sol e as espreguiçadeiras, e o vale a perder de vista',
    foco: '60% 50%',
  },
  // A voz do projeto não entra no primeiro ecrã: é a primeira página do
  // álbum, na saída dele (Hero.tsx).
  navegacao: [
    { href: '#fora', texto: 'A casa' },
    { href: '#quinta', texto: 'A quinta' },
    { href: '#dentro', texto: 'Por dentro' },
    { href: '#volta', texto: 'À volta' },
  ],
  acoes: [
    { tipo: 'reserva', rotulo: 'Ver disponibilidade', href: AIRBNB },
    { tipo: 'telefone', rotulo: 'Ligar 965 741 870', href: 'tel:+351965741870' },
  ],
  contacto: {
    morada: 'Lamego, Portugal',
    telefone: { valor: '965 741 870', href: 'tel:+351965741870' },
    email: { valor: 'lusitanoquinta@gmail.com', href: 'mailto:lusitanoquinta@gmail.com' },
    mapa: 'https://www.google.com/maps?q=Lamego,Portugal&z=12&output=embed',
  },
};
