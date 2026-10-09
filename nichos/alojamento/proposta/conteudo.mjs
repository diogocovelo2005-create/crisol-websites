import comum from './oferta.mjs';

// Duplicar este ficheiro para cada casa. Preencher apenas com factos verificados.
// As páginas 2 e 3 vêm de oferta.mjs; não recomendar um pacote no documento.
export default {
  ...comum,
  ficheiro: 'proposta-nome-da-casa',
  data: '[Mês e ano]',
  casa: {
    nome: '[Nome da casa]',
    frase: '[Uma frase concreta que identifique a casa]',
    meta: ['[Localização]', '[Tipo de alojamento]'],
    capa: 'assets/[fotografia-da-casa].jpg',
  },
  site: {
    situacao: '[Presença atual na internet e dificuldade observada. Duas frases, sem dramatizar.]',
    proposta: '[O site que propões: o que vai reunir e como permite contactar ou reservar.]',
    pontos: [
      ['[O alojamento]', '[O que é importante explicar sobre quartos, casas ou apartamentos.]'],
      ['[A estadia]', '[Os espaços ou características desta casa que vale a pena apresentar.]'],
      ['[Informação prática]', '[O que o hóspede precisa de saber antes de reservar.]'],
    ],
    resultados: '[Como uma apresentação cuidada transmite confiança, ajuda a escolher esta casa e facilita o contacto. Relacionar com o caso; evitar garantias de vendas ou de posições no Google.]',
    objetivo: 'O objetivo é transformar mais visitas ao site em contactos e pedidos de reserva.',
  },
};
