import comum from './oferta.mjs';

// Só esta página muda por casa. Factos: ../casas/casa-de-fatauncos-vouzela/dossie/resumo.md.
export default {
  ...comum,
  ficheiro: 'proposta-casa-de-fatauncos',
  data: 'Setembro de 2026',
  casa: {
    nome: 'Casa de Fataunços',
    frase: 'Um solar do século XVIII, entre jardins e salões cheios de história.',
    meta: ['Fataunços, Vouzela', 'Turismo de Habitação'],
    capa: 'assets/casa-fatauncos.jpg',
  },
  site: {
    situacao: 'A Casa de Fataunços já tem um site próprio, mas a informação está pouco organizada: há muitas fotografias, sem um fio que explique a história da casa, os seus espaços ou a experiência de ficar aqui. Quem chega ao site vê a casa, mas não chega a perceber aquilo que a torna especial.',
    proposta: 'Proponho criar um site atual, em português e inglês, que conte essa história de forma simples. O visitante deverá conseguir conhecer a casa, sentir o ambiente antes de chegar e perceber facilmente como pedir informações ou reservar.',
    pontos: [
      ['A casa e a sua história', 'O solar, os salões, a arte e a música apresentados de forma simples, para dar a conhecer a identidade da casa.'],
      ['Jardins e espaços para aproveitar', 'Fotografias e informação organizada sobre os jardins, a piscina e as zonas de lazer.'],
      ['Quartos e informação prática', 'Os tipos de alojamento, contactos, localização e perguntas frequentes reunidos num só lugar.'],
    ],
    resultados: 'Uma apresentação mais cuidada ajuda quem encontra a casa na internet a perceber a experiência antes de reservar. Com as fotografias, a história e a informação prática bem organizadas, é mais fácil transmitir confiança e dar ao visitante uma razão para entrar em contacto.',
    objetivo: 'O objetivo é que mais pessoas conheçam a Casa de Fataunços e avancem para um contacto ou pedido de reserva.',
  },
};
