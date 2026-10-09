import { galerias, type FotoGaleria } from '@/lib/galerias';

export type Capitulo = {
  id: string;
  titulo: string;
  introducao: string;
  fotos: FotoGaleria[];
};

// Uma fotografia por momento: os ficheiros usados em cartões e no hero
// têm, muitas vezes, outros recortes das mesmas fotografias das galerias.
const exterior: FotoGaleria[] = [
  { src: '/fotos/hero.jpg', legenda: 'A fachada da Casa de Fataunços', alt: 'Fachada branca da Casa de Fataunços, com cantaria de granito e portas verdes', largura: 2000, altura: 1250 },
  ...galerias.casa.fotos,
  ...galerias.jardim.fotos,
  galerias.lazer.fotos[0],
  { src: '/fotos/galeria/lazer/piscina-por-do-sol.jpg', legenda: 'A piscina ao pôr do sol', alt: 'A piscina ao pôr do sol, com espreguiçadeiras e a serra ao fundo', largura: 1024, altura: 768 },
  ...[2, 3, 5, 6, 9].map((i) => galerias.lazer.fotos[i]),
  { src: '/fotos/fecho.jpg', legenda: 'O parque e a piscina, vistos de cima', alt: 'Vista aérea do parque, da piscina e das árvores da casa', largura: 1600, altura: 900 },
];

const interior: FotoGaleria[] = [
  ...galerias.quartos.fotos,
  ...galerias.saloes.fotos,
  // a sala de bilhar e o ping-pong. O bilhar vai duas vezes, de lados
  // diferentes: a segunda e a ampliacao da foto do site antigo (sala-06).
  // Saiu daqui o atmosfera-livros.jpg: era um recorte da mesma fotografia
  // do "Xadrez e livros, junto ao brasao", que ja esta nos saloes.
  galerias.lazer.fotos[1],
  { src: '/fotos/galeria/lazer/bilhar.png', legenda: 'O bilhar, do outro lado da sala', alt: 'Sala de bilhar com paredes de granito, candeeiros de latão sobre a mesa e uma porta envidraçada', largura: 1447, altura: 1087 },
  galerias.lazer.fotos[4],
];

// A serra do Caramulo sai da galeria (o Diogo, 2026-10-08); do Caramulo fica
// so o museu. Continua nos dados porque e a foto do Caramulo no mapa da
// seccao A volta.
const aVolta = galerias.avolta.fotos.filter((f) => f.src !== '/fotos/galeria/avolta/caramulo-1.jpg');

export const capitulos: Capitulo[] = [
  { id: 'exterior', titulo: 'Exterior', introducao: 'A casa, o parque e os dias passados ao ar livre.', fotos: exterior },
  { id: 'interior', titulo: 'Interior', introducao: 'Quartos, salões e recantos onde apetece ficar.', fotos: interior },
  { id: 'pecas', titulo: 'As dez peças', introducao: 'Uma pequena coleção de arte, objetos e livros antigos.', fotos: galerias.pecas.fotos },
  { id: 'a-volta', titulo: 'À volta', introducao: 'Termas, serras e caminhos para descobrir a partir da casa.', fotos: aVolta },
];
