import comum from './oferta.mjs';

// Só esta página muda por casa. Factos: ../casas/quinta-de-canhoes/pesquisa/PESQUISA.md.
export default {
  ...comum,
  ficheiro: 'proposta-quinta-de-canhoes',
  data: 'Setembro de 2026',
  casa: {
    nome: 'Quinta de Canhões',
    frase: 'Uma casa centenária, com jardim e vista sobre o vale de Lafões.',
    meta: ['Várzea, São Pedro do Sul', 'Turismo de Habitação'],
    capa: 'assets/casa-canhoes.jpg',
  },
  site: {
    situacao: 'Na pesquisa que fiz para esta proposta, o antigo site da quinta já não estava disponível. A informação sobre a casa fica dispersa pelas plataformas de alojamento, sem um site próprio que a reúna.',
    proposta: 'Proponho criar um novo site para a Quinta de Canhões, onde seja fácil conhecer a casa, perceber as opções de alojamento e saber como entrar em contacto ou reservar.',
    pontos: [
      ['Os quartos', 'Fotografias e informação sobre cada tipo de quarto, para ajudar o visitante a escolher.'],
      ['A estadia', 'O jardim, a piscina, a vista e o pequeno-almoço, apresentados como parte da experiência na quinta.'],
      ['Informação prática', 'Localização, proximidade das Termas, dúvidas frequentes e contactos acessíveis.'],
    ],
    resultados: 'Uma apresentação cuidada ajuda a transmitir confiança a quem encontra a quinta na internet. Com fotografias claras e informação organizada, o visitante consegue perceber melhor o que a casa oferece. Os contactos e a forma de reservar bem visíveis facilitam o passo seguinte.',
    objetivo: 'O objetivo é transformar mais visitas ao site em contactos e pedidos de reserva para a quinta.',
  },
};
