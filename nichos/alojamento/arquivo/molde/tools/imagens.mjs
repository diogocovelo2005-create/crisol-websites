#!/usr/bin/env node
// Descarrega e trata as fotografias do molde.
//
// Porque existe: o molde nao tem cliente, logo nao tem fotos. Estas vem
// do Unsplash (licenca gratuita, sem atribuicao obrigatoria, so fotos
// que NAO sao Unsplash+) e passam todas pela mesma grade, para parecerem
// uma unica sessao feita para esta casa e nao stock em bruto.
//
// Historia curta, para ninguem repetir: a primeira versao gerava as
// fotos por IA gratuita (Pollinations). O teto gratuito e ~0.6 MP com
// marca de agua gravada, e ampliar isso para um hero de 2000px nao tem
// qualidade. Foi abandonado.
//
// Nota tecnica que nao e opcional: compor DEPOIS de redimensionar, em
// duas passagens de sharp. Numa so passagem o sharp corre sempre o
// resize antes do composite, e as camadas aterram centradas por cima da
// base ampliada. Da um retangulo visivel a meio da foto.
//
// Num site real estas fotos saem todas: as do cliente entram em
// public/fotos/ com os mesmos nomes, e correm pela mesma grade com
// `--local` (le de .imagens-bruto/<id>.jpg em vez de descarregar).
//
// Correr:  node tools/imagens.mjs            (so as que faltam)
//          node tools/imagens.mjs --forcar   (todas outra vez)
//          node tools/imagens.mjs --local    (so tratar o que ja esta em bruto)

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const BRUTO = path.join(RAIZ, '.imagens-bruto');
const DESTINO = path.join(RAIZ, 'public', 'fotos');
const FORCAR = process.argv.includes('--forcar');
const LOCAL = process.argv.includes('--local');

const U = 'https://images.unsplash.com/';

// saida: tamanho final. foco: onde o corte deve segurar o assunto.
const FOTOS = [
  { id: 'hero', src: 'photo-1782067171258-892162bd682b', saida: [2400, 1600], foco: 'centre' },
  { id: 'atmosfera', src: 'photo-1675190711033-f7375c7df6b2', saida: [2200, 1375], foco: 'centre' },
  // As tres do 'Um dia na casa' sao grandes de proposito: a moldura e
  // horizontal no computador e quase quadrada no telemovel, e o corte tem
  // de ter resolucao nos dois. A 1600x1000 a lareira ficava desfocada.
  { id: 'dia-manha', src: 'photo-1775744244614-beb197cfac53', saida: [2400, 1800], foco: 'attention' },
  { id: 'dia-mesa', src: 'photo-1766766788517-4bc7b9aff43a', saida: [2400, 1800], foco: 'attention' },
  { id: 'dia-lareira', src: 'photo-1696860740767-f4211c9209f4', saida: [2400, 1600], foco: 'centre' },
  { id: 'casa-quarto', src: 'photo-1658595149209-c935e9a01b4e', saida: [1200, 1500], foco: 'west' },
  { id: 'casa-sala', src: 'photo-1783388744197-a15aba3334cc', saida: [1200, 1500], foco: 'attention' },
  { id: 'casa-cozinha', src: 'photo-1754415266974-404a215e6c62', saida: [1200, 1500], foco: 'attention' },
  { id: 'casa-banho', src: 'photo-1616735566043-4d0dee145b66', saida: [1200, 1500], foco: 'centre' },
  { id: 'casa-patio', src: 'photo-1636026093316-ae12fc4ebe64', saida: [1200, 1500], foco: 'attention' },
  { id: 'casa-jardim', src: 'photo-1787237849351-5dcba5f478c4', saida: [1200, 1500], foco: 'centre' },
  { id: 'fecho-casa', src: 'photo-1678902177251-7ec8fea483a3', saida: [2400, 1350], foco: 'centre' },
  // o mesmo fecho em retrato, para o telemovel: a horizontal esticada a um
  // ecra alto perdia resolucao
  { id: 'fecho-casa-telemovel', src: 'photo-1678902177251-7ec8fea483a3', saida: [1440, 1920], foco: 'centre' },
];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function obter(foto) {
  const destino = path.join(BRUTO, foto.id + '.jpg');
  if (LOCAL || (fs.existsSync(destino) && !FORCAR)) return destino;

  // largo de sobra: os cortes em retrato comem a maior parte da largura
  const largura = 3600;
  const url = U + foto.src + '?w=' + largura + '&q=90&fm=jpg';
  for (let tent = 1; tent <= 4; tent++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        fs.writeFileSync(destino, Buffer.from(await res.arrayBuffer()));
        const m = await sharp(destino).metadata();
        console.log('  descarregada ' + foto.id + '  ' + m.width + 'x' + m.height);
        return destino;
      }
      console.log('  ' + foto.id + ': tentativa ' + tent + ' devolveu ' + res.status);
    } catch (e) {
      console.log('  ' + foto.id + ': tentativa ' + tent + ' falhou (' + e.message + ')');
    }
    await espera(2000 * tent);
  }
  throw new Error('nao consegui obter ' + foto.id);
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

// A grade. E o que faz doze fotos de doze fotografos parecerem uma so
// sessao: saturacao contida, pretos ligeiramente levantados (o ar de
// pelicula mate), sombras a puxar para o verde-oliva e luzes a puxar
// para o dourado de fim de tarde, que e a luz das referencias. Leve: a
// pagina e clara, e uma grade pesada sobre fundo claro fica suja.
async function tratar(origem, foto) {
  const [lw, lh] = foto.saida;

  const base = await sharp(origem)
    .rotate()
    .resize(lw, lh, { fit: 'cover', position: foto.foco, kernel: 'lanczos3' })
    .modulate({ saturation: 0.88, brightness: 1.02 })
    .linear(0.96, 6)
    .toBuffer();

  const camadas = await Promise.all([
    camadaCor(lw, lh, [58, 68, 44], 38),    // sombras para o verde-oliva
    camadaCor(lw, lh, [236, 186, 116], 36), // luzes para o dourado
    camadaGrao(lw, lh, 7),
    camadaVinheta(lw, lh, 0.12),
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

fs.mkdirSync(BRUTO, { recursive: true });
fs.mkdirSync(DESTINO, { recursive: true });

for (const foto of FOTOS) {
  await tratar(await obter(foto), foto);
}
console.log('\n' + FOTOS.length + ' fotografias em public/fotos/');
