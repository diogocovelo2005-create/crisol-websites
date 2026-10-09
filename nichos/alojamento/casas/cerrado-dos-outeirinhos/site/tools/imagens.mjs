#!/usr/bin/env node
// Trata as fotografias do Cerrado dos Outeirinhos.
//
// As fotos sao da casa: vieram do dossie
// (dossie/marketing/fotos/) para .imagens-bruto/<id>.jpg com o nome do
// sitio onde entram na pagina. Sao de duas origens muito diferentes: uma
// sessao profissional de ~2013 (3000px, no Booking e no site) e fotos de
// telemovel de 30/07/2026 (verticais, 1126px, no Facebook). A grade serve
// para as duas parecerem a mesma sessao.
//
// Nota tecnica que nao e opcional (vem do molde): compor DEPOIS de
// redimensionar, em duas passagens de sharp. Numa so passagem o sharp
// corre sempre o resize antes do composite, e as camadas aterram
// centradas por cima da base ampliada. Da um retangulo visivel a meio da
// foto.
//
// Correr:  node tools/imagens.mjs            (so as que faltam)
//          node tools/imagens.mjs --forcar   (todas outra vez)
//          node tools/imagens.mjs hero fecho (so estas)

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.resolve(import.meta.dirname, '..');
const BRUTO = path.join(RAIZ, '.imagens-bruto');
const DESTINO = path.join(RAIZ, 'public', 'fotos');
const FORCAR = process.argv.includes('--forcar');
const SO = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// saida: o tamanho final, ja cortado para a moldura onde a foto entra.
// foco: onde o corte deve segurar o assunto.
// recorte: {left, top, width, height} na foto de origem, aplicado ANTES
//   do resize. So para quando o assunto nao esta nem ao centro nem num
//   dos cantos que o `foco` sabe apanhar.
//
// As seis dos espacos tem tamanhos diferentes de proposito: a Revista (E3)
// alterna 4/3, 4/5, 1/1 e 16/10 pela ordem da lista em src/lib/casa.ts, e
// cada foto ja vem cortada para o seu lugar, para o object-cover nao ter
// de cortar outra vez.
const FOTOS = [
  // O hero sai a 3000x2000, a resolucao nativa da foto: o Hero amplia a
  // imagem ate 120% com o scroll e num ecra largo 2400px ja eram esticados.
  { id: 'hero', saida: [3000, 2000], foco: 'centre', qualidade: 90 },
  // A versao de noite (H4): mesma moldura do hero, para as duas camadas
  // se alinharem quando o scroll funde uma na outra.
  { id: 'hero-noite', saida: [3000, 2000], foco: 'centre', qualidade: 90 },
  { id: 'casa', saida: [2200, 1375], foco: 'centre' },
  { id: 'tabuleta', saida: [1440, 1080], foco: 'centre' }, // 4/3: a tabuleta e horizontal

  // O pico (P1) poe as fotos numa moldura larga no computador e quase
  // quadrada no telemovel: saem grandes para o corte ter resolucao nas duas.
  { id: 'momento-mesa', saida: [2300, 1725], foco: 'centre' },
  // "A serra" ja nao mostra a casa: mostra o vale, a foto da regiao que
  // a propria casa publica na pagina Envolvencia. Origem 1620x1080, por
  // isso sai a 1800x1350 e nao a 2400: o corte 4/3 da 1440x1080 e daqui
  // para cima ja e esticar.
  { id: 'momento-visita', saida: [1800, 1350], foco: 'centre' },
  // 1620x1080 de origem (3:2); sai na mesma proporçao, sem cortar.
  { id: 'momento-noite', saida: [2400, 1600], foco: 'centre' },

  // Os espacos (E2) mostram a foto em 4/5 no computador e em 4/3 no
  // telemovel. Saem a 8/9, entre as duas, para nenhum dos cortes comer
  // muito. A ordem e a de src/lib/casa.ts.
  // 'centre', nao 'attention': o smart-crop agarrava o lado direito
  // (mesa e candeeiro) e cortava fora o lagar e a mo, que sao o assunto.
  { id: 'espaco-adega', saida: [1600, 1800], foco: 'centre' },
  { id: 'espaco-quartos', saida: [1600, 1800], foco: 'centre' },
  { id: 'espaco-forno', saida: [1600, 1800], foco: 'attention' },
  { id: 'espaco-banho', saida: [1600, 1800], foco: 'centre' },
  // vertical de origem (telemovel, 1126x2000): ja nasce em retrato. E a
  // esplanada panoramica, com a vila e os montes ao fundo. O assunto
  // (luzes da latada, telhados, vale, mesas) esta na metade de cima; ao
  // centro o corte apanhava sobretudo o chao, por isso e recortada a
  // mao antes de reduzir.
  { id: 'espaco-esplanada', saida: [1600, 1800], foco: 'centre', recorte: { left: 0, top: 230, width: 1126, height: 1267 } },

  // A cortina do fecho abre para a placa de lousa gravada com o nome da
  // casa. E um grande plano: sai a 2400 de largura na mesma, porque
  // ocupa o ecra inteiro.
  { id: 'fecho', saida: [2400, 1350], foco: 'centre' },
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

// A grade. E o que faz fotos de 2013 e de 2026 parecerem a mesma sessao.
//
// Segunda versao. A primeira seguia o molde (saturacao a 0.88, pretos
// levantados, veus de cor fortes) e as fotos ficavam gastas: as
// profissionais sao de ~2013 e ja sao planas de origem, e a grade so
// acrescentava desbotado. Agora faz o contrario: devolve contraste,
// devolve saturacao, fecha os pretos e afia. Os veus de cor ficam, para
// as duas epocas de fotografia darem o mesmo tom, mas a metade da forca.
async function tratar(origem, foto) {
  const [lw, lh] = foto.saida;

  const comRecorte = sharp(origem).rotate();
  if (foto.recorte) comRecorte.extract(foto.recorte);

  const base = await comRecorte
    .resize(lw, lh, { fit: 'cover', position: foto.foco, kernel: 'lanczos3' })
    .modulate({ saturation: 1.06 })
    .linear(1.08, -10)
    .sharpen({ sigma: 0.9 })
    .toBuffer();

  const camadas = await Promise.all([
    camadaCor(lw, lh, [46, 60, 78], 18), // sombras para o azul-lousa
    camadaCor(lw, lh, [238, 200, 156], 16), // luzes para o granito ao sol
    camadaGrao(lw, lh, 4),
    camadaVinheta(lw, lh, 0.07),
  ]);

  await sharp(base)
    .composite([
      { input: camadas[0], blend: 'soft-light', top: 0, left: 0 },
      { input: camadas[1], blend: 'overlay', top: 0, left: 0 },
      { input: camadas[2], blend: 'overlay', top: 0, left: 0 },
      { input: camadas[3], blend: 'multiply', top: 0, left: 0 },
    ])
    .jpeg({ quality: foto.qualidade ?? 86, mozjpeg: true })
    .toFile(path.join(DESTINO, foto.id + '.jpg'));

  const m = await sharp(origem).metadata();
  console.log(`  ${foto.id.padEnd(18)} ${m.width}x${m.height} -> ${lw}x${lh}`);
}

// --- corrida --------------------------------------------------------------

fs.mkdirSync(DESTINO, { recursive: true });

const lista = SO.length ? FOTOS.filter((f) => SO.includes(f.id)) : FOTOS;
if (SO.length && lista.length !== SO.length) {
  console.error('Nao conheco: ' + SO.filter((s) => !FOTOS.some((f) => f.id === s)).join(', '));
  process.exit(1);
}

for (const foto of lista) {
  const origem = path.join(BRUTO, foto.id + '.jpg');
  if (!fs.existsSync(origem)) {
    console.error(`Falta .imagens-bruto/${foto.id}.jpg. As fotos vem do dossie da casa.`);
    process.exit(1);
  }
  if (!FORCAR && !SO.length && fs.existsSync(path.join(DESTINO, foto.id + '.jpg'))) continue;
  await tratar(origem, foto);
}
console.log('\n' + lista.length + ' fotografias tratadas para public/fotos/');
