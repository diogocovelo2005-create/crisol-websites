#!/usr/bin/env node
/*
  Fluidez do scroll, medida: desce a página toda e volta a subir, e conta
  quanto tempo leva cada frame.

  Uso:
    node rapidez-fluidez.mjs <url> [--css "<regra>"] [--repetir 3] [--so telemovel|computador] [--cpu 4]

  Telemóvel (390×844, toque): arrastos de dedo (toques um a um pelo
  protocolo do Chrome), não a roda: o Lenis só alisa a roda, e o dedo é
  nativo. Computador (1440×900): roda do rato, como uma
  pessoa a descer depressa.

  --css injeta uma regra antes de medir, para testar uma hipótese sem
  mexer no código. Ex.: --css "*{backdrop-filter:none!important}" diz
  quanto custa o blur; corre sem e com e compara.
  --repetir N faz N percursos e dá a mediana de cada número.
  --cpu N abranda o processador N vezes (4 ≈ telemóvel médio, como no
  Lighthouse). Numa máquina rápida, sem isto, quase tudo dá 16,7 ms e os
  problemas ficam escondidos: mede sempre também com --cpu 4.

  Escreve, por perfil: frames (n), p50, p95 e p99 em ms, % acima de 25 ms
  (frames que se sentem), o pior frame e as tarefas longas (> 50 ms) do
  processo principal durante o scroll. A 60 Hz o frame bom é 16,7 ms.

  Os números absolutos dependem da máquina; o que conta é antes vs depois
  na mesma máquina e à mesma hora. Build de produção, localhost.
*/

import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opcao = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const url = args.find((a) => /^https?:\/\//.test(a));
const css = opcao('--css');
const repetir = Number(opcao('--repetir') ?? 1);
const so = opcao('--so');
const cpu = Number(opcao('--cpu') ?? 1);
if (!url) {
  console.error('Uso: node rapidez-fluidez.mjs <url> [--css "<regra>"] [--repetir 3] [--so telemovel|computador] [--cpu 4]');
  process.exit(1);
}

async function carregarPlaywright() {
  const bases = [path.join(process.cwd(), 'package.json'), path.join(AQUI, '..', 'package.json')];
  try {
    bases.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'x.js'));
  } catch {}
  for (const b of bases) {
    try {
      return await import(pathToFileURL(createRequire(b).resolve('playwright')).href);
    } catch {}
  }
  console.error('Não encontrei o Playwright. No site: npm i -D playwright');
  process.exit(1);
}
const pw = await carregarPlaywright();
const { chromium } = pw.default ?? pw;

const quantil = (s, q) => s[Math.min(s.length - 1, Math.floor(q * s.length))];
const mediana = (v) => {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

function gravador() {
  window.__f = [];
  window.__lt = [];
  let ult = performance.now();
  const passo = (t) => {
    window.__f.push(t - ult);
    ult = t;
    if (window.__gravar) requestAnimationFrame(passo);
  };
  window.__gravar = true;
  requestAnimationFrame(passo);
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(e.duration))).observe({ type: 'longtask' });
  } catch {}
}

async function percurso(browser, perfil) {
  const tel = perfil === 'telemovel';
  const ctx = await browser.newContext(
    tel ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 } },
  );
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(1500);
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await page.evaluate(gravador);
  const noFim = () => page.evaluate(() => window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4);
  const noTopo = () => page.evaluate(() => window.scrollY <= 2);

  // Desce e sobe até ao fim; se o scroll não andar 3 vezes seguidas, para
  // (página presa ou gesto que não pega) em vez de rodar sem fim.
  let presa = false;
  const ate = async (chegou, passo) => {
    let parado = 0;
    for (let i = 0; i < 600 && !(await chegou()); i++) {
      const y = await page.evaluate(() => scrollY);
      await passo();
      parado = (await page.evaluate(() => scrollY)) === y ? parado + 1 : 0;
      if (parado >= 3) {
        presa = true;
        return;
      }
    }
  };
  if (tel) {
    // Arrasto de dedo com toques um a um: o Input.synthesizeScrollGesture
    // não faz scroll no Chromium sem janela.
    const arrasto = async (dy) => {
      const y0 = dy < 0 ? 700 : 150;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: y0 }] });
      for (let i = 1; i <= 12; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: y0 + (dy * i) / 12 }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(120);
    };
    await ate(noFim, () => arrasto(-500));
    await ate(noTopo, () => arrasto(500));
  } else {
    await page.mouse.move(720, 450);
    const roda = async (dy) => {
      for (let k = 0; k < 5; k++) {
        await page.mouse.wheel(0, dy);
        await page.waitForTimeout(40);
      }
    };
    await ate(noFim, () => roda(120));
    await ate(noTopo, () => roda(-120));
  }
  if (presa) console.error(`  aviso (${perfil}): o scroll deixou de andar a meio; os números só cobrem até aí`);
  await page.waitForTimeout(600);
  const { f, lt } = await page.evaluate(() => {
    window.__gravar = false;
    return { f: window.__f.slice(1), lt: window.__lt };
  });
  await ctx.close();
  const s = f.sort((a, b) => a - b);
  return {
    altura: alto,
    frames: s.length,
    p50: quantil(s, 0.5),
    p95: quantil(s, 0.95),
    p99: quantil(s, 0.99),
    acima25: (100 * s.filter((x) => x > 25).length) / s.length,
    pior: s[s.length - 1],
    longas: lt.length,
    longasMs: lt.reduce((a, b) => a + b, 0),
  };
}

const browser = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
console.log(`Fluidez de ${url}${cpu > 1 ? `  [cpu ÷${cpu}]` : ''}${css ? `  [css: ${css}]` : ''}${repetir > 1 ? `  (mediana de ${repetir})` : ''}`);
for (const perfil of ['telemovel', 'computador'].filter((p) => !so || so === p)) {
  const rs = [];
  for (let i = 0; i < repetir; i++) rs.push(await percurso(browser, perfil));
  const m = (k) => mediana(rs.map((r) => r[k]));
  console.log(
    `  ${perfil.padEnd(10)} frames ${m('frames')}  p50 ${m('p50').toFixed(1)}  p95 ${m('p95').toFixed(1)}  p99 ${m('p99').toFixed(1)} ms  ` +
      `>25ms ${m('acima25').toFixed(1)}%  pior ${Math.round(m('pior'))} ms  tarefas longas ${m('longas')} (${Math.round(m('longasMs'))} ms)`,
  );
}
await browser.close();
