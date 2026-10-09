#!/usr/bin/env node
// Trata as fotografias da Casa da Calcada.
//
// As fotos sao todas da propria casa (galeria do Booking e do site), vindas
// do dossie em dossie/marketing/fotos/. Entram em .imagens-bruto/<id>.jpg e
// correm todas pela mesma grade, para parecerem uma sessao so e nao
// dezasseis fotos tiradas ao longo de quinze anos com maquinas diferentes.
//
// Limite real desta casa: o Booking nao serve acima de 1620 px e o site
// proprio serve a 691 px. Nao ha material de alta resolucao publico. Por
// isso as saidas aqui sao contidas: ampliar 1620 para 2400 dava uma foto
// mole no ecra grande. O hero e o unico com ampliacao (1.23x).
//
// A grade e mais fria e menos dourada do que a do molde: a casa e granito
// cinzento e telha, fotografada quase toda com sol alto de verao, e uma
// grade dourada por cima disso ficava alaranjada.
//
// Nota tecnica que nao e opcional: compor DEPOIS de redimensionar, em
// duas passagens de sharp. Numa so passagem o sharp corre sempre o
// resize antes do composite, e as camadas aterram centradas por cima da
// base ampliada. Da um retangulo visivel a meio da foto.
//
// Correr:  node tools/imagens.mjs --local    (trata o que esta em bruto)
//          node tools/imagens.mjs --forcar --local

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const BRUTO = path.join(RAIZ, '.imagens-bruto');
const DESTINO = path.join(RAIZ, 'public', 'fotos');
const FORCAR = process.argv.includes('--forcar');

const FOTOS = [
  // hero: a piscina com a torre da capela. A unica com ampliacao (1620 -> 2000).
  { id: 'hero-piscina-torre-01', saida: [2000, 1334], foco: 'centre' },

  // o pico e meio ecra em altura no computador e 4/5 no telemovel: saida em retrato.
  // A experiencia: tres coisas que se fazem sempre, uma fotografia cada.
  // Todas exteriores e claras: as melhores que o material tem.
  { id: 'experiencia-1-quarto', saida: [1800, 1200], foco: 'centre' },
  { id: 'experiencia-2', saida: [1800, 1200], foco: 'centre' },
  { id: 'experiencia-4-redor', saida: [1800, 1200], foco: 'centre' },
  { id: 'experiencia-refeicoes', saida: [1800, 1200], foco: 'attention' },

  { id: 'espaco-capela', saida: [1500, 1125], foco: 'centre' },
  { id: 'espaco-jardim', saida: [1440, 960], foco: 'centre' },
  { id: 'espaco-bilhar', saida: [1250, 1250], foco: 'centre' },
  { id: 'espaco-tanque', saida: [1440, 960], foco: 'centre' },
  { id: 'espaco-glicinias', saida: [1500, 1125], foco: 'centre' },
  { id: 'espaco-anexo', saida: [1080, 1350], foco: 'centre' },

  // fecho: a foto fica por tras das portadas e abre para ecra inteiro
  { id: 'fecho-aerea', saida: [1900, 1069], foco: 'centre' },
  { id: 'fecho-aerea-telemovel', saida: [1080, 1440], foco: 'east' },

  // a casa hoje: um quarto, ao lado do texto
  { id: 'a-casa-telhado-ameias', saida: [1500, 1125], foco: 'centre' },
  // os dois quartos por baixo, em mosaico. O segundo e vertical e so tem
  // 720x1080 na origem: fica em retrato, sem ampliacao.
  { id: 'a-casa-quarto-1', saida: [1100, 825], foco: 'centre' },
  { id: 'a-casa-quarto-2', saida: [720, 1080], foco: 'centre' },
];

function bruto(foto) {
  const caminho = path.join(BRUTO, foto.id + '.jpg');
  if (!fs.existsSync(caminho)) throw new Error('falta .imagens-bruto/' + foto.id + '.jpg');
  return caminho;
}

// --- camadas do tratamento ------------------------------------------------

function camadaCor(w, h, rgb, alfa) {
  const px = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    px[i * 4] = rgb[0];
    px[i * 4 + 1] = rgb[1];
    px[i * 4 + 2] = rgb[2];
    px[i * 4 + 3] = alfa;
  }
  return sharp(px, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// Grao: ruido centrado em 128. Em 'overlay' o 128 e neutro, portanto e o
// desvio que define a forca.
function camadaGrao(w, h, desvio) {
  const px = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    const n = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    px[i] = Math.max(0, Math.min(255, Math.round(128 + n * desvio * 2)));
  }
  return sharp(px, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
}

function camadaVinheta(w, h, forca) {
  const px = Buffer.alloc(w * h);
  const cx = w / 2;
  const cy = h / 2;
  const max = Math.hypot(cx, cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - cx, y - cy) / max;
      const q = Math.pow(Math.max(0, d - 0.5) / 0.5, 1.8);
      px[y * w + x] = Math.round(255 * (1 - q * forca));
    }
  }
  return sharp(px, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
}

// A grade. E o que faz dezasseis fotos de quinze anos parecerem uma so
// sessao: saturacao contida (o verde do relvado e o azul da piscina vinham
// agressivos), pretos ligeiramente levantados, sombras a puxar para o
// cinza-azulado do granito e luzes a puxar para a telha. Leve: a pagina e
// clara, e uma grade pesada sobre fundo claro fica suja.
async function tratar(origem, foto) {
  const [lw, lh] = foto.saida;

  const base = await sharp(origem)
    .rotate()
    .resize(lw, lh, { fit: 'cover', position: foto.foco, kernel: 'lanczos3' })
    .modulate({ saturation: 0.82, brightness: 1.03 })
    .linear(0.96, 6)
    .toBuffer();

  const camadas = await Promise.all([
    camadaCor(lw, lh, [52, 62, 66], 34),    // sombras para o granito cinza-azulado
    camadaCor(lw, lh, [232, 190, 158], 30), // luzes para a telha, contidas
    camadaGrao(lw, lh, 5),      // pouco: as fontes ja sao moles
    camadaVinheta(lw, lh, 0.10),
  ]);

  await sharp(base)
    .composite([
      { input: camadas[0], blend: 'soft-light', top: 0, left: 0 },
      { input: camadas[1], blend: 'overlay', top: 0, left: 0 },
      { input: camadas[2], blend: 'overlay', top: 0, left: 0 },
      { input: camadas[3], blend: 'multiply', top: 0, left: 0 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(DESTINO, foto.id + '.jpg'));

  console.log('  tratada      ' + foto.id + '  -> ' + lw + 'x' + lh);
}

// --- corrida --------------------------------------------------------------

fs.mkdirSync(DESTINO, { recursive: true });

for (const foto of FOTOS) {
  const saida = path.join(DESTINO, foto.id + '.jpg');
  if (fs.existsSync(saida) && !FORCAR) { console.log('  ja existe    ' + foto.id); continue; }
  await tratar(bruto(foto), foto);
}
console.log('\n' + FOTOS.length + ' fotografias em public/fotos/');
