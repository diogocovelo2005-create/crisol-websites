/*
  As galerias que abrem por cima da pagina (componente Galeria). Cada uma
  abre com uma ligacao #galeria-<id>. As fotos estao em
  public/fotos/galeria/<id>/. Este ficheiro e gerado por um script, mas
  pode editar-se a mao.

  Legendas: rascunho do Haiku (2026-10-01), revistas e corrigidas a mao
  contra as fotos. Nada inventado: so o que se ve ou o que esta no dossie.
  As das dez pecas sao as legendas do site antigo da casa, em portugues.
  As do Booking podem usar-se (Diogo, 2026-10-01).

  Ficaram de fora: a piscina-02 (tem matraquilhos a frente), o quarto twin
  do Booking (repete o Girassol), o segundo campo de tenis e a segunda sala
  de ping-pong (repetidos).

  largura/altura: as do ficheiro. A galeria nunca mostra uma foto maior do
  que ela e (as do site antigo tem 829 px).
*/

export type FotoGaleria = {
  src: string;
  legenda: string;
  alt: string;
  largura: number;
  altura: number;
  // so nas fotos de fora (licenca livre): autor e licenca, com ligacao
  credito?: { texto: string; href: string };
};

export const galerias = {
  quartos: {
    titulo: 'Os quartos',
    fotos: [
      { src: '/fotos/galeria/quartos/quarto-01.jpg', legenda: 'Quarto Amor Perfeito', alt: 'Quarto Amor Perfeito: cama de casal de madeira escura, peseira florida e lustre no teto', largura: 4032, altura: 3024 },
      { src: '/fotos/galeria/quartos/quarto-03.jpg', legenda: 'Quarto Mimosa', alt: 'Quarto Mimosa: cama de casal com manta às riscas e a casa de banho ao lado', largura: 4080, altura: 3072 },
      { src: '/fotos/galeria/quartos/quarto-04.png', legenda: 'Mimosa, com a porta aberta para o jardim', alt: 'Quarto Mimosa com a porta aberta para o jardim, quadros bordados e um cadeirão', largura: 1445, altura: 1088 },
      { src: '/fotos/galeria/quartos/quarto-02.jpg', legenda: 'Quarto Girassol', alt: 'Quarto Girassol: duas camas com peseiras floridas, candeeiros e um cadeirão', largura: 4032, altura: 2816 },
      { src: '/fotos/galeria/quartos/casa-de-banho-01.jpg', legenda: 'Casas de banho privativas', alt: 'Três casas de banho da casa, com azulejos e flores', largura: 829, altura: 207 },
    ] as FotoGaleria[],
  },
  pecas: {
    titulo: 'As dez peças',
    fotos: [
      { src: '/fotos/galeria/pecas/masterpiece-01.png', legenda: 'A Circuncisão. Retábulo em madeira, arte flamenga, século XVII', alt: 'Retábulo de madeira esculpida com a cena da Circuncisão', largura: 829, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-02.png', legenda: 'Pietà. Escultura em madeira, Suábia, século XVI', alt: 'Pietà em madeira escura: a Virgem com Cristo no colo', largura: 366, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-03.png', legenda: 'Pequeno contador em teca e marfim. Índia, Império Mogol, século XVII', alt: 'Pequeno contador de teca com embutidos de marfim', largura: 381, altura: 435 },
      { src: '/fotos/galeria/pecas/masterpiece-04.png', legenda: 'Domingos Sequeira. Carvão sobre papel, século XIX', alt: 'Desenho a carvão de um velho de barbas com uma criança ao colo', largura: 367, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-05.png', legenda: 'A Sagrada Família na oficina do carpinteiro. Azulejo português, século XVIII', alt: 'Painel de azulejo azul e branco com a Sagrada Família numa oficina de carpinteiro', largura: 383, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-06.png', legenda: 'Prato de faiança de Lisboa, dito Monte Sinai. Séculos XVII–XVIII', alt: 'Prato de faiança azul e branca pousado sobre granito', largura: 366, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-07.png', legenda: 'Três conchas de porcelana da China. Família Rosa, dinastia Qianlong, século XVIII', alt: 'Três pratos de porcelana em forma de concha, pintados com flores', largura: 735, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-08.png', legenda: 'Philippe Pavy. Óleo sobre tela, França, século XIX', alt: 'Pintura de figuras à porta de uma casa de pedra', largura: 350, altura: 551 },
      { src: '/fotos/galeria/pecas/masterpiece-09.png', legenda: 'Sousa Pinto. Óleo sobre madeira, século XIX', alt: 'Pintura de uma costa com rochas e mar', largura: 829, altura: 514 },
      { src: '/fotos/galeria/pecas/masterpiece-10.png', legenda: 'Eduardo Malta, Nazaré. Óleo sobre tela, século XX', alt: 'Retrato de uma mulher da Nazaré com capa negra', largura: 448, altura: 551 },
      { src: '/fotos/galeria/pecas/livro.png', legenda: 'Livros dos séculos XVII e XVIII', alt: 'Livros antigos encadernados em pele, numa estante envidraçada', largura: 1537, altura: 1023 },
    ] as FotoGaleria[],
  },
  lazer: {
    titulo: 'Jogos e lazer',
    fotos: [
      { src: '/fotos/galeria/lazer/piscina-alpendre.jpg', legenda: 'A piscina e o alpendre', alt: 'A piscina junto ao alpendre, com o jardim e a serra ao fundo', largura: 1024, altura: 768 },
      { src: '/fotos/galeria/lazer/sala-bilhar.jpg', legenda: 'A sala de bilhar', alt: 'Sala de bilhar com paredes de granito, teto de madeira e um candeeiro sobre a mesa', largura: 1024, altura: 768 },
      { src: '/fotos/galeria/lazer/dia-lazer-bicicletas.jpg', legenda: 'As bicicletas da casa', alt: 'Duas bicicletas debaixo do alpendre de granito, junto à lenha', largura: 1020, altura: 768 },
      { src: '/fotos/galeria/lazer/alameda.jpg', legenda: 'Um passeio pela alameda', alt: 'Caminho de saibro entre as árvores do parque, com um banco à sombra', largura: 1448, altura: 1086 },
      { src: '/fotos/galeria/lazer/sala-pingpong.jpg', legenda: 'O ping-pong, com o piano de cauda ao fundo', alt: 'Sala de ping-pong com paredes de pedra, cadeiras vermelhas e um piano de cauda ao fundo', largura: 1024, altura: 768 },
      { src: '/fotos/galeria/lazer/campotenis.png', legenda: 'O campo de ténis', alt: 'O campo de ténis rodeado de árvores, com o solar ao longe', largura: 1447, altura: 1087 },
      { src: '/fotos/galeria/lazer/jardim-05.jpg', legenda: 'Uma rede entre as árvores', alt: 'Rede pendurada entre as árvores do parque, com o parque infantil ao fundo', largura: 829, altura: 622 },
      { src: '/fotos/galeria/lazer/beiral-vista-montanha.jpg', legenda: 'O beiral, com a serra ao fundo', alt: 'Mesa e candeeiro no beiral envidraçado, com vista para a serra', largura: 1020, altura: 768 },
      { src: '/fotos/galeria/lazer/salao-biblioteca.jpg', legenda: 'A biblioteca', alt: 'Salão com estantes de livros, mesa redonda e cadeirões verdes', largura: 1024, altura: 768 },
      { src: '/fotos/galeria/lazer/jardim-06.jpg', legenda: 'Baloiços e escorrega no parque', alt: 'Parque infantil no relvado, entre canteiros de azáleas', largura: 2388, altura: 1792 },
    ] as FotoGaleria[],
  },
  saloes: {
    titulo: 'Os salões',
    fotos: [
      { src: '/fotos/galeria/saloes/sala-02.jpg', legenda: 'O salão da lareira', alt: 'Salão com lareira de granito, retratos de família e um sofá cor de vinho', largura: 829, altura: 553 },
      { src: '/fotos/galeria/saloes/sala-03.jpg', legenda: 'Cadeirões vermelhos e a porta para a sala de refeições', alt: 'Salão com cadeirões vermelhos, uma escrivaninha e a porta aberta para a sala de refeições', largura: 829, altura: 553 },
      { src: '/fotos/galeria/saloes/salao-biblioteca.jpg', legenda: 'A biblioteca', alt: 'Salão com estantes de livros, mesa redonda e cadeirões verdes', largura: 1024, altura: 768 },
      { src: '/fotos/galeria/saloes/sala-04.jpg', legenda: 'O estandarte da família', alt: 'Salão com um estandarte heráldico, tabuleiro de xadrez e louça antiga numa vitrina', largura: 829, altura: 553 },
      { src: '/fotos/galeria/saloes/salao-xadrez-brasao.jpg', legenda: 'Xadrez e livros, junto ao brasão', alt: 'Tabuleiro de xadrez e livros sobre uma mesa redonda, com o estandarte do brasão ao fundo', largura: 1024, altura: 768 },
      { src: '/fotos/galeria/saloes/piano.jpg', legenda: 'Um dos três pianos', alt: 'Piano de cauda num salão de paredes de granito', largura: 1024, altura: 715 },
      { src: '/fotos/galeria/saloes/sala-01.jpg', legenda: 'O beiral', alt: 'Beiral envidraçado com cadeirões de verga e vista para os telhados e a serra', largura: 4032, altura: 3024 },
      { src: '/fotos/galeria/saloes/beiral-vista-montanha.jpg', legenda: 'O beiral, com a serra ao fundo', alt: 'Mesa e candeeiro no beiral envidraçado, com vista para a serra', largura: 1020, altura: 768 },
      { src: '/fotos/galeria/saloes/sala-07.jpg', legenda: 'O alpendre', alt: 'Alpendre de granito com cadeiras de verga e plantas', largura: 829, altura: 551 },
      { src: '/fotos/galeria/saloes/refeicoes-01.jpg', legenda: 'A sala de refeições', alt: 'Sala de refeições com teto trabalhado, lustre e mesas postas', largura: 1086, altura: 1448 },
      { src: '/fotos/galeria/saloes/sala-refeicoes.jpg', legenda: 'O pequeno-almoço serve-se aqui', alt: 'Sala de refeições com teto de estuque trabalhado, lustre e janelas para o jardim', largura: 1024, altura: 768 },
      // a mesma fotografia ampliada (1448 px), que o "Um dia na casa" ja usa
      { src: '/fotos/dia-manha-2.jpg', legenda: 'O pequeno-almoço', alt: 'Pequeno-almoço: compotas, queijos, bolos, fruta e sumo de laranja', largura: 1448, altura: 1086 },
    ] as FotoGaleria[],
  },
  jardim: {
    titulo: 'O parque',
    fotos: [
      { src: '/fotos/galeria/jardim/jardim_01.png', legenda: 'A alameda', alt: 'Alameda de árvores com um banco de pedra e um caminho de saibro', largura: 1448, altura: 1086 },
      { src: '/fotos/galeria/jardim/jardim-02.jpg', legenda: 'A alameda numa tarde de nevoeiro', alt: 'A alameda de árvores envolta em nevoeiro, com um banco', largura: 829, altura: 549 },
      { src: '/fotos/galeria/jardim/jardim-04.jpg', legenda: 'À sombra dos cedros', alt: 'Cedros antigos e um banco à sombra, com a casa ao fundo', largura: 829, altura: 619 },
      { src: '/fotos/galeria/jardim/jardim-03.jpg', legenda: 'O relvado na primavera', alt: 'Relvado com uma sebe aparada em arco e canteiros em flor', largura: 829, altura: 622 },
      { src: '/fotos/galeria/jardim/parque-outono.jpg', legenda: 'O parque no outono', alt: 'Árvores de folhas amarelas no relvado do parque, no outono', largura: 1024, altura: 472 },
      { src: '/fotos/galeria/jardim/jardim-07.jpg', legenda: 'A pia batismal de pedra', alt: 'Uma pia batismal de pedra no meio de um terreiro, entre as árvores', largura: 829, altura: 466 },
      { src: '/fotos/galeria/jardim/exterior-06.jpg', legenda: 'Hortênsias junto ao granito', alt: 'Fachada lateral de granito com portas brancas, hera e hortênsias', largura: 829, altura: 622 },
    ] as FotoGaleria[],
  },
  casa: {
    titulo: 'A casa',
    fotos: [
      { src: '/fotos/galeria/casa/exterior_01.png', legenda: 'A fachada', alt: 'Fachada branca do solar com cantaria de granito e portas verdes, num dia de sol', largura: 1608, altura: 978 },
      { src: '/fotos/galeria/casa/exterior-02.jpg', legenda: 'A porta principal, entre as rosas', alt: 'A porta principal do solar, com rosas cor-de-rosa em primeiro plano', largura: 4032, altura: 2918 },
      { src: '/fotos/galeria/casa/exterior-04.jpg', legenda: 'O solar e a aldeia de Fataunços', alt: 'Vista aérea da frente do solar e das casas da aldeia', largura: 2528, altura: 1684 },
      { src: '/fotos/galeria/casa/exterior-05.png', legenda: 'O parque e a piscina, vistos de cima', alt: 'Vista aérea das traseiras: o parque, a piscina e as árvores', largura: 1528, altura: 1029 },
      { src: '/fotos/galeria/casa/exterior-03.png', legenda: 'Ao anoitecer', alt: 'A fachada do solar ao anoitecer, com as janelas iluminadas', largura: 2172, altura: 724 },
    ] as FotoGaleria[],
  },
  /* A volta: fotos do Wikimedia Commons (2026-10-01), escolhidas a mao, com
     licenca livre (CC BY ou CC BY-SA). A licenca obriga a creditar o autor e
     a licenca: `credito` aparece por baixo da legenda, com ligacao para a
     pagina da foto. As do Vitor Oliveira trazem a assinatura dele num canto,
     que fica. */
  avolta: {
    titulo: 'À volta',
    fotos: [
      { src: '/fotos/galeria/avolta/vouzela-1.jpg', legenda: 'Vouzela e a ponte da antiga linha do Vouga', alt: 'A ponte de arcos da antiga linha do comboio sobre o rio, em Vouzela, refletida na água', largura: 1920, altura: 1272, credito: { texto: 'Pedro, CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:Vouzela_DSC_0151_(52666334636).jpg' } },
      { src: '/fotos/galeria/avolta/vouzela-2.jpg', legenda: 'Uma ponte de pedra no centro de Vouzela', alt: 'Ponte de pedra de um arco entre casas antigas de Vouzela', largura: 1920, altura: 1272, credito: { texto: 'Pedro, CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:Vouzela_DSC_0153_(52666626474).jpg' } },
      { src: '/fotos/galeria/avolta/termas-1.jpg', legenda: 'As Termas de S. Pedro do Sul, à beira do Vouga', alt: 'O rio Vouga nas Termas de S. Pedro do Sul, com um repuxo, salgueiros e hotéis na margem', largura: 1920, altura: 1270, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Termas_de_S%C3%A3o_Pedro_do_Sul_-_Portugal_(6128234769).jpg' } },
      { src: '/fotos/galeria/avolta/termas-2.jpg', legenda: 'O rio nas Termas', alt: 'O rio Vouga largo e calmo nas Termas, com um repuxo ao fundo', largura: 1920, altura: 2595, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Termas_de_S%C3%A3o_Pedro_do_Sul_-_Portugal_(5092628755).jpg' } },
      { src: '/fotos/galeria/avolta/termas-rio-vouga.jpg', legenda: 'O rio Vouga nas Termas', alt: 'O rio Vouga nas Termas de S. Pedro do Sul, ladeado por árvores e jardins', largura: 2048, altura: 1536, credito: { texto: 'Lusitana, CC BY 2.5', href: 'https://commons.wikimedia.org/wiki/File:S%C3%A3o-Pedro-do-Sul_Rio-Vouga2_PT.jpg' } },
      { src: '/fotos/galeria/avolta/ecopista-1.jpg', legenda: 'A Ecopista do Vouga na ponte de Forno Ferreiro', alt: 'A ciclovia vermelha da Ecopista a atravessar uma ponte de arcos de pedra, com uma vila ao fundo', largura: 1920, altura: 1242, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Antiga_Ponte_Ferrovi%C3%A1ria_de_Forno_Ferreiro_-_Portugal_(50591558321).jpg' } },
      { src: '/fotos/galeria/avolta/ecopista-2.jpg', legenda: 'De bicicleta pela antiga linha do comboio', alt: 'Uma pessoa de bicicleta na Ecopista, junto a uma antiga estação, com a serra ao fundo', largura: 1920, altura: 1272, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Ecopista_do_Vouga_-_Portugal_(50247402943).jpg' } },
      { src: '/fotos/galeria/avolta/macario-1.jpg', legenda: 'A serra de S. Macário', alt: 'Montanhas e vales da serra de S. Macário, com aldeias pequenas nas encostas', largura: 1920, altura: 1280, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Serra_de_S%C3%A3o_Mac%C3%A1rio_-_Portugal_(51187181060).jpg' } },
      { src: '/fotos/galeria/avolta/macario-2.jpg', legenda: 'Lafões visto de S. Macário', alt: 'Vista larga de S. Macário sobre vales e serras a perder de vista', largura: 1920, altura: 1280, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Serra_de_S%C3%A3o_Mac%C3%A1rio_-_Portugal_(51144377957).jpg' } },
      { src: '/fotos/galeria/avolta/caramulo-1.jpg', legenda: 'A serra do Caramulo', alt: 'O cimo da serra do Caramulo, com rochas de granito e mato', largura: 1280, altura: 857, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Serra_do_Caramulo_-_Portugal_(122537364).jpg' } },
      { src: '/fotos/galeria/avolta/caramulo-2.jpg', legenda: 'No Museu do Caramulo', alt: 'Um automóvel antigo vermelho com faróis de latão, exposto no Museu do Caramulo', largura: 1920, altura: 1440, credito: { texto: 'Vitor Oliveira, CC BY-SA 2.0', href: 'https://commons.wikimedia.org/wiki/File:Museu_do_Caramulo_-_Portugal_(49641599366).jpg' } },
      { src: '/fotos/galeria/avolta/viseu-1.jpg', legenda: 'Viseu ao anoitecer, com a Sé ao fundo', alt: 'Rua do centro histórico de Viseu ao anoitecer, com a Sé ao fundo', largura: 1920, altura: 1306, credito: { texto: 'Michael Gaylard, CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:S%C3%A9_Catedral_de_Viseu_(32461422517).jpg' } },
      { src: '/fotos/galeria/avolta/viseu-2.jpg', legenda: 'O claustro da Sé de Viseu', alt: 'Arcos do claustro da Sé de Viseu, com painéis de azulejo azul', largura: 1920, altura: 1263, credito: { texto: 'FJavier GómezL, CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Claustro_de_la_catedral_de_Viseu_(Portugal).jpg' } },
    ] as FotoGaleria[],
  },
};

export type IdGaleria = keyof typeof galerias;
