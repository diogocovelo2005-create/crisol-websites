// Grava o scroll de um site fotograma a fotograma, com o relógio da página controlado.
// Uso: node gravar60.mjs <url> <nome> <pasta-com-playwright> [px/s=450] [largura-saida=1920] [altura-saida=1080] [fps=60] [escala=1.25]
// largura/altura são os pixels do vídeo; o viewport do site é essa medida a dividir pela escala (1536x864 a 125%, como num portátil Windows) [--teste N]
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const a = process.argv.slice(2);
const teste = a.includes('--teste') ? +a[a.indexOf('--teste') + 1] : 0;
const [url, nome, site, vel = '450', larg = '1920', alt = '1080', fpsA = '60', dsfA = '1.25'] = a;
const { chromium } = createRequire(path.join(site, 'package.json'))('playwright');
const DSF = +dsfA, W = Math.round(+larg / DSF), H = Math.round(+alt / DSF), FPS = +fpsA, V = +vel;
const out = path.resolve('videos'); fs.mkdirSync(out, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ args: ['--hide-scrollbars'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF });
const page = await ctx.newPage();
await page.clock.install({ time: Date.now() });
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
await page.mouse.move(W / 2, H / 2);
// iframes (mapas) e imagens lazy: carregam já, com o relógio ainda a correr, sem mexer nas animações de scroll
await page.evaluate(() => document.querySelectorAll('iframe[loading="lazy"], img[loading="lazy"]').forEach((e) => { e.loading = 'eager'; }));
await espera(9000);
await espera(4000); // o relógio ainda corre à velocidade real: deixa carregar tudo (vídeo do hero incluído)
await page.evaluate(() => { window.__adv = (dt) => {
  for (const an of document.getAnimations()) {
    if (!an.__k) { an.__k = 1; an.pause(); if (an.currentTime < 150) an.currentTime = 0; continue; }
    const end = an.effect?.getComputedTiming().endTime ?? Infinity;
    if (end !== Infinity && an.currentTime + dt >= end) { try { an.finish(); } catch {} } else an.currentTime += dt;
  }
}; });
await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 1500));

// trajetória: parado 2 s, desce a velocidade constante com arranque e travagem suaves, parado 2,5 s
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const rampa = 1.6, D0 = total / V + rampa;
const ys = [];
for (let i = 0; i < 2 * FPS; i++) ys.push(0);
{ let y = 0, i = 0; const n = Math.round(D0 * FPS); const v = [];
  for (; i < n; i++) { const t = i / FPS; v.push(Math.min(1, t / rampa, (D0 - t) / rampa)); }
  const soma = v.reduce((s, x) => s + x, 0); let acc = 0;
  for (const x of v) { acc += x; ys.push(total * acc / soma); } }
for (let i = 0; i < 2.5 * FPS; i++) ys.push(total);
const N = teste || ys.length;
console.log(nome, 'altura', total, 'fotogramas', N, '≈', (N / FPS).toFixed(1), 's');

const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-r', String(FPS), '-movflags', '+faststart', path.join(out, nome + (teste ? '-teste' : '') + '.mp4')],
  { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now(); let relogio = 0;
for (let i = 0; i < N; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), ys[i]);
  await espera(22); // o scroll dispara os eventos no próximo fotograma real do browser
  const alvo = Math.round(((i + 1) * 1000) / FPS), dt = alvo - relogio; relogio = alvo;
  await page.clock.runFor(dt);
  await page.evaluate((d) => window.__adv(d), dt);
  for (let k = 0; k < 200; k++) { // espera que qualquer vídeo acabe de saltar para o fotograma pedido
    const busy = await page.evaluate(() => [...document.querySelectorAll('video')].some((v) => v.seeking || v.readyState < 2));
    if (!busy) { await espera(8); if (!(await page.evaluate(() => [...document.querySelectorAll('video')].some((v) => v.seeking)))) break; } else await espera(8);
  }
  const png = await page.screenshot({ type: 'png', animations: 'allow', caret: 'initial' });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 120 === 0) console.log(`  ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('ok', nome, ((Date.now() - t0) / 1000).toFixed(0), 's de render');
