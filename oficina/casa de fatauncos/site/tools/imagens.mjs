#!/usr/bin/env node
// Trata as fotografias da Casa de Fataunços.
//
// As originais nao se descarregam de lado nenhum: vem do dossie
// (nichos/alojamento/casas/casa-de-fatauncos-vouzela/dossie/marketing/fotos) e
// estao copiadas em .imagens-bruto/<id>.jpg, que nao vai para o repositorio.
// A lista `FOTOS` diz de onde veio cada uma, para se poder voltar atras.
//
// Porque existe: as fotos vem de sitios diferentes (7 do dono, em alta
// resolucao, e o resto do site antigo, a 829 px) e nao tem a mesma
// tonalidade. Passam todas pela mesma grade, com os tons da paleta do site,
// para parecerem uma unica sessao na mesma casa.
//
// Nota tecnica que nao e opcional: compor DEPOIS de redimensionar, em duas
// passagens de sharp. Numa so passagem o sharp corre sempre o resize antes
// do composite, e as camadas aterram centradas por cima da base ampliada.
// Da um retangulo visivel a meio da foto.
//
// Correr:  node tools/imagens.mjs            (so as que faltam)
//          node tools/imagens.mjs --forcar   (todas outra vez)

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const BRUTO = path.join(RAIZ, '.imagens-bruto');
const DESTINO = path.join(RAIZ, 'public', 'fotos');
const FORCAR = process.argv.includes('--forcar');

// saida: tamanho final. Nenhuma foto e ampliada para alem do que o original
// da: o tamanho de saida vem sempre do corte disponivel no original.
// foco: onde o corte deve segurar o assunto.
// fraca: original do site antigo, com 829 px de largura (ja sao poucas: o
// Diogo ampliou as outras). Leva um pouco mais de nitidez e de grao, para a
// falta de detalhe ler como fotografia antiga e nao como imagem esticada. As
// que vem em boa resolucao NAO levam nada disto: a nitidez artificial estraga
// o detalhe que elas tem.
// saturacao: por defeito 0.9. Baixa-se onde a foto tem uma cor que salta fora
// da paleta da casa (o magenta das roseiras, o azul da piscina).
const FOTOS = [
  { id: 'hero', de: 'exterior/exterior_01.png', saida: [2000, 1250], foco: 'centre' },
  // vista aerea da frente, ampliada pelo Diogo: da o corte em retrato sem esticar
  { id: 'atmosfera', de: 'exterior/exterior-04.jpg', saida: [1300, 1560], foco: 'centre' },
  // As fotos de `booking/` foram descarregadas pelo Diogo do anuncio da casa
  // no Booking (2026-09-18). O Booking so as da a 1024 px de largura: saem
  // com o maior corte que o original permite, sem ampliar.
  { id: 'atmosfera-livros', de: 'booking/salao-xadrez-brasao.jpg', saida: [614, 768], foco: 'left' },
  { id: 'dia-manha-1', de: 'interior/quarto-04.png', saida: [1400, 1050], foco: 'centre' },
  // ampliada pelo Diogo a partir da do Booking
  { id: 'dia-manha-2', de: 'booking/pequeno-almoco-ampliada.png', saida: [1448, 1086], foco: 'centre' },
  { id: 'dia-lazer-1', de: 'booking/piscina-alpendre.jpg', saida: [1024, 768], foco: 'centre' },
  { id: 'dia-lazer-2', de: 'booking/beiral-vista-montanha.jpg', saida: [1020, 765], foco: 'centre' },
  { id: 'dia-lazer-3', de: 'booking/sala-bilhar.jpg', saida: [1024, 768], foco: 'centre' },
  // a fachada ao anoitecer sai INTEIRA: o tamanho de saida e o do original
  // (2172x724), por isso nao ha corte nem redimensionamento
  { id: 'dia-noite-1', de: 'exterior/exterior-03.png', saida: [2172, 724], foco: 'centre' },
  // o piano sai inteiro, no formato do original
  { id: 'dia-noite-2', de: 'booking/piano.jpg', saida: [1024, 715], foco: 'centre' },
  { id: 'casa-piscina', de: 'booking/piscina-por-do-sol.jpg', saida: [614, 768], foco: 'centre' },
  { id: 'casa-quartos', de: 'booking/quarto-twin.jpg', saida: [572, 715], foco: 'centre' },
  { id: 'casa-jogos', de: 'booking/sala-pingpong.jpg', saida: [614, 768], foco: 'centre' },
  { id: 'casa-saloes', de: 'booking/salao-biblioteca.jpg', saida: [614, 768], foco: 'centre' },
  // a primeira das "Ten Master Pieces": o retabulo flamengo, recortado ao alto
  // nas figuras do centro. O original tem 829x551, por isso sai pequeno
  // (600x750) para nao ser esticado; o cartao mostra-o a ~300px.
  { id: 'casa-pecas', de: 'masterpieces/masterpiece-01.png', saida: [600, 750], foco: 'centre', fraca: true },
  { id: 'casa-tenis', de: 'booking/campo-tenis.jpg', saida: [614, 768], foco: 'centre' },
  { id: 'casa-refeicoes', de: 'booking/sala-refeicoes.jpg', saida: [614, 768], foco: 'centre' },
  { id: 'casa-infantil', de: 'booking/parque-infantil.jpg', saida: [614, 768], foco: 'left' },
  { id: 'casa-jardim', de: 'exterior/jardim-04.jpg', saida: [900, 1125], foco: 'centre', fraca: true },
  { id: 'fecho', de: 'exterior/exterior-05.png', saida: [1600, 900], foco: 'centre' },
  // o mesmo fecho em retrato, para o telemovel: a horizontal esticada a um
  // ecra alto perdia detalhe
  { id: 'fecho-telemovel', de: 'exterior/exterior-05.png', saida: [1000, 1333], foco: 'centre' },
];

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

// A grade. E o que faz dezessete fotos de fontes diferentes parecerem a mesma
// sessao: saturacao contida, pretos levantados (ar de pelicula mate), sombras
// a puxar para o granito cinza-azulado da cantaria e luzes para a cal quente
// da fachada. Sao os tons da paleta do site, por isso as fotos e a pagina
// ficam do mesmo lado. Leve: a pagina e clara, e uma grade pesada sobre fundo
// claro fica suja.
async function tratar(origem, foto) {
  const [lw, lh] = foto.saida;

  let base = sharp(origem)
    .rotate()
    .resize(lw, lh, { fit: 'cover', position: foto.foco, kernel: 'lanczos3' })
    .modulate({ saturation: foto.saturacao ?? 0.9, brightness: 1.03 })
    .linear(0.94, 8);
  // as do site antigo sao ampliadas: sem isto ficam moles
  if (foto.fraca) base = base.sharpen({ sigma: 0.8, m1: 0.6, m2: 0.35 });

  const camadas = await Promise.all([
    camadaCor(lw, lh, [52, 66, 82], 40),    // sombras para o granito cinza-azulado
    camadaCor(lw, lh, [240, 226, 198], 30), // luzes para a cal quente
    camadaGrao(lw, lh, foto.fraca ? 9 : 4),
    camadaVinheta(lw, lh, 0.14),
  ]);

  await sharp(await base.toBuffer())
    .composite([
      { input: camadas[0], blend: 'soft-light', top: 0, left: 0 },
      { input: camadas[1], blend: 'overlay', top: 0, left: 0 },
      { input: camadas[2], blend: 'overlay', top: 0, left: 0 },
      { input: camadas[3], blend: 'multiply', top: 0, left: 0 },
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(DESTINO, foto.id + '.jpg'));

  console.log('  tratada  ' + foto.id.padEnd(18) + '-> ' + lw + 'x' + lh + '  (' + foto.de + ')');
}

// --- corrida --------------------------------------------------------------

fs.mkdirSync(DESTINO, { recursive: true });

for (const foto of FOTOS) {
  const origem = path.join(BRUTO, foto.id + '.jpg');
  if (!fs.existsSync(origem)) {
    console.log('  FALTA    ' + foto.id + ': copiar ' + foto.de + ' do dossie para ' + origem);
    continue;
  }
  if (!FORCAR && fs.existsSync(path.join(DESTINO, foto.id + '.jpg'))) continue;
  await tratar(origem, foto);
}
console.log('\n' + FOTOS.length + ' fotografias em public/fotos/');
