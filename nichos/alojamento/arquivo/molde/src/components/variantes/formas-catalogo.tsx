import { casa } from '@/lib/casa';
import type { Pico } from './pico/dados';

/*
  CATALOGO. Exemplos das formas de contar o pico, escritos para a casa do
  molde. So o catalogo (/catalogo) os usa, para mostrar cada variante do
  pico com cada forma. No site de um cliente, a forma escolhida e escrita
  em casa.pico pelo agente (ver a skill adaptar-molde).

  O conceito do pico e sempre o mesmo: mostrar o que se vive dentro da
  casa, o que a pessoa pode esperar quando la estiver. Cada forma de
  contar muda a maneira de o apresentar: o titulo, a frase de entrada, o
  nome de cada momento, os textos e ate a ordem das fotografias.

  As fotos sao as tres de casa.pico.momentos (0 manha no quarto, 1 a mesa,
  2 a lareira). Os factos vem todos de casa.ts; so muda a maneira de os
  dizer. A forma "O que se leva" usa as opinioes: num cliente real tem de
  usar opinioes reais, copiadas a letra.
*/

type MomentoForma = {
  foto: 0 | 1 | 2;
  marca: string; // o que aparece em grande (a hora, o ritual, o verbo...)
  momento: string; // o rotulo pequeno por cima do titulo
  titulo: string;
  texto: string;
};

type Forma = {
  nome: string;
  ideia: string; // uma frase para o Diogo perceber a forma
  etiqueta: string;
  titulo: string;
  intro: string;
  momentos: [MomentoForma, MomentoForma, MomentoForma];
  linha: [string, string, string]; // os rotulos da linha por baixo, no P1
  sol: [string, string, string]; // onde o marcador para, no P1
};

const r = casa.reviews?.citacoes ?? [];

const FORMAS: Forma[] = [
  {
    nome: 'O relógio',
    ideia: 'Um dia contado pelas horas. É a versão atual.',
    etiqueta: 'A estadia',
    titulo: 'Um dia *na casa.*',
    intro: 'Do primeiro café à última lenha, é assim que passam as horas aqui.',
    momentos: [
      { foto: 0, marca: '07:30', momento: 'Acordar', titulo: 'O vale fica à janela', texto: 'Os três quartos dão para o mesmo lado. De manhã o nevoeiro assenta lá em baixo e só levanta por volta das nove.' },
      { foto: 1, marca: '10:00', momento: 'Sentar à mesa', titulo: 'O pequeno-almoço é feito em casa', texto: 'Pão cozido na véspera, doce do quintal, café de cafeteira. Serve-se até tarde, porque aqui ninguém tem hora.' },
      { foto: 2, marca: '21:00', momento: 'Ficar ao lume', titulo: 'A lareira acende-se todas as noites', texto: 'De outubro a maio está sempre a arder quando chegam. A lenha é do souto e já está partida, ao lado.' },
    ],
    linha: ['Manhã', 'Tarde', 'Noite'],
    sol: ['3%', '19%', '87%'],
  },
  {
    nome: 'Os rituais',
    ideia: 'Não há horas: há três hábitos da casa que se repetem todos os dias.',
    etiqueta: 'Os rituais',
    titulo: 'Três coisas que *se repetem todos os dias.*',
    intro: 'Não há programa. Há hábitos da casa que quem cá fica acaba por copiar.',
    momentos: [
      { foto: 0, marca: 'O nevoeiro', momento: 'Todas as manhãs', titulo: 'Ver o vale acordar', texto: 'O nevoeiro assenta lá em baixo e só levanta por volta das nove. Os três quartos dão para esse lado, por isso ninguém o perde.' },
      { foto: 1, marca: 'O pão', momento: 'Todos os dias', titulo: 'A mesa posta até tarde', texto: 'O pão coze na véspera e o doce é do quintal. O café faz-se na cafeteira, e ninguém tem hora para descer.' },
      { foto: 2, marca: 'O lume', momento: 'Todas as noites', titulo: 'A lareira acesa à chegada', texto: 'De outubro a maio está sempre a arder quando chegam. A lenha é do souto e fica partida, ao lado.' },
    ],
    linha: ['O nevoeiro', 'O pão', 'O lume'],
    sol: ['8%', '50%', '92%'],
  },
  {
    nome: 'O convite',
    ideia: 'A casa fala diretamente com o hóspede e sugere o que fazer.',
    etiqueta: 'Sem pressa',
    titulo: 'Aqui, o tempo *é vosso.*',
    intro: 'Três sugestões para a estadia. Nenhuma é obrigatória.',
    momentos: [
      { foto: 0, marca: 'Acordem', momento: 'Sem despertador', titulo: 'Deixem o vale acordar primeiro', texto: 'Abram a janela e esperem pelo nevoeiro a levantar. Por volta das nove, o vale aparece todo.' },
      { foto: 1, marca: 'Sentem-se', momento: 'À mesa', titulo: 'Tomem o pequeno-almoço devagar', texto: 'Pão da véspera, doce do quintal, café de cafeteira. Serve-se até tarde, por isso não há razão para pressa.' },
      { foto: 2, marca: 'Fiquem', momento: 'Ao lume', titulo: 'Deixem a noite chegar à lareira', texto: 'A lenha já está partida, ao lado. Tragam um livro, ou peguem num dos da sala.' },
    ],
    linha: ['Acordem', 'Sentem-se', 'Fiquem'],
    sol: ['8%', '50%', '92%'],
  },
  {
    nome: 'Chegar e partir',
    ideia: 'A estadia do princípio ao fim: a chegada, os dias, a última manhã.',
    etiqueta: 'A estadia',
    titulo: 'Da chegada *à última manhã.*',
    intro: 'Quem cá fica costuma lembrar-se de três momentos: o primeiro, os do meio e o último.',
    momentos: [
      { foto: 2, marca: 'Chegar', momento: 'A primeira noite', titulo: 'A lareira já está acesa', texto: 'De outubro a maio, quem chega encontra o lume a arder e a lenha partida ao lado. Não é preciso fazer nada.' },
      { foto: 1, marca: 'Ficar', momento: 'Os dias', titulo: 'A mesa volta a pôr-se', texto: 'Todas as manhãs há pão cozido na véspera e doce do quintal. Os dias organizam-se à volta dela.' },
      { foto: 0, marca: 'Partir', momento: 'A última manhã', titulo: 'Uma última vista do vale', texto: 'Antes das malas, o nevoeiro a levantar lá em baixo. É a imagem com que quase toda a gente vai embora.' },
    ],
    linha: ['Chegar', 'Ficar', 'Partir'],
    sol: ['8%', '50%', '92%'],
  },
  {
    nome: 'O que se leva',
    ideia: 'Contado pelas opiniões: as três coisas de que os hóspedes mais falam.',
    etiqueta: 'O que fica',
    titulo: 'Do que se lembra *quem já cá dormiu.*',
    intro: 'Lemos as opiniões dos hóspedes. Estas são as três coisas que aparecem mais vezes.',
    momentos: [
      { foto: 0, marca: 'A vista', momento: `${r[0].quem}, ${r[0].onde}`, titulo: 'A vista de manhã', texto: `“${r[0].texto}”` },
      { foto: 1, marca: 'Os dias', momento: `${r[2].quem}, ${r[2].onde}`, titulo: 'Ninguém quer sair', texto: `“${r[2].texto}”` },
      { foto: 2, marca: 'O lume', momento: `${r[1].quem}, ${r[1].onde}`, titulo: 'A casa à espera', texto: `“${r[1].texto}”` },
    ],
    linha: ['A vista', 'Os dias', 'O lume'],
    sol: ['8%', '50%', '92%'],
  },
  {
    nome: 'Os sentidos',
    ideia: 'O que se vê, o que se prova e o que aquece.',
    etiqueta: 'A estadia',
    titulo: 'A casa *pelos sentidos.*',
    intro: 'O que se vê, o que se prova e o que aquece, numa casa de pedra no meio do vale.',
    momentos: [
      { foto: 0, marca: 'Ver', momento: 'O vale', titulo: 'O nevoeiro a levantar', texto: 'Dos três quartos vê-se o mesmo vale. Até às nove está coberto; depois aparece todo, de uma vez.' },
      { foto: 1, marca: 'Provar', momento: 'A mesa', titulo: 'Pão da véspera e doce do quintal', texto: 'Tudo feito em casa, com café de cafeteira. Serve-se até tarde.' },
      { foto: 2, marca: 'Aquecer', momento: 'O lume', titulo: 'Uma lareira de pedra', texto: 'Acesa todas as noites de outubro a maio, com lenha do souto já partida ao lado.' },
    ],
    linha: ['Ver', 'Provar', 'Aquecer'],
    sol: ['8%', '50%', '92%'],
  },
];

/* Uma forma de contar ja montada como pico, com as fotos do molde. */
export type FormaCatalogo = Pico & { ideia: string };

export const FORMAS_PICO: FormaCatalogo[] = FORMAS
  // Esta forma cita tres hospedes concretos. Sem essas tres fontes, nao se
  // apresenta uma versao incompleta nem se inventam testemunhos.
  .filter((f) => f.nome !== 'O que se leva' || r.length >= 3)
  .map((f) => ({
  forma: f.nome,
  ideia: f.ideia,
  etiqueta: f.etiqueta,
  titulo: f.titulo,
  intro: f.intro,
  linha: f.linha,
  sol: f.sol,
  momentos: f.momentos.map((m) => {
    const foto = casa.pico.momentos[m.foto];
    return {
      marca: m.marca,
      momento: m.momento,
      titulo: m.titulo,
      texto: m.texto,
      imagem: foto.imagem,
      alt: foto.alt,
      aspeto: foto.aspeto,
      par: foto.par,
    };
  }),
  }));
