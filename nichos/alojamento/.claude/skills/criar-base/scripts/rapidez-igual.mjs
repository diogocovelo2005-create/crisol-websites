#!/usr/bin/env node
/*
  O site ficou igual? Compara duas versões (antes e depois de uma
  otimização) ecrã a ecrã, de cima a baixo.

  Uso:
    node rapidez-igual.mjs <url-antes> <url-depois> [--saida <pasta>] [--ignorar "<seletor css>"]
                           [--css "<regra>"] [--so 390|1440]

  Em 390×844 (toque) e 1440×900, com movimento normal e reduzido, desce de
  meio em meio ecrã até ao fim. Em cada paragem espera que as imagens à
  vista acabem de carregar e que o movimento assente, e compara:
    - geometria: cada elemento à vista com texto, imagem ou SVG (posição,
      tamanho, opacidade, cor, letra) — diferença acima de 1 px ou 2% de
      opacidade conta;
    - píxeis: percentagem de píxeis diferentes (com tolerância de cor);
      acima de 0,5% conta.
  Também compara a altura total da página e a consola (erros novos).

  Com --saida grava as capturas das paragens que diferem (antes e depois
  lado a lado em ficheiros separados). --ignorar tira da comparação o que
  muda sozinho com o tempo (um carrossel automático, um vídeo).
  --css aplica uma regra só ao «depois»: com o mesmo URL dos dois lados,
  mostra o que uma hipótese muda no que se vê antes de a escrever no código
  (ex.: --css "*{backdrop-filter:none!important}"). --so limita a um tamanho.

  Sai com 0 se tudo igual e 2 se houver diferenças. Uma diferença não é
  automaticamente um erro, mas tem de ser explicada; se mudar o que se vê,
  a otimização não entra.
*/

import fs from 'node:fs';
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
const [antes, depois] = args.filter((a) => /^https?:\/\//.test(a));
const saida = opcao('--saida') && path.resolve(opcao('--saida'));
const ignorar = opcao('--ignorar');
const cssDepois = opcao('--css');
const so = opcao('--so');
if (!antes || !depois) {
  console.error('Uso: node rapidez-igual.mjs <url-antes> <url-depois> [--saida <pasta>] [--ignorar "<seletor>"]');
  process.exit(1);
}
if (saida) fs.mkdirSync(saida, { recursive: true });

const bases = [path.join(process.cwd(), 'package.json'), path.join(AQUI, '..', 'package.json')];
try {
  bases.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'x.js'));
} catch {}
async function carregar(nome) {
  for (const b of bases) {
    try {
      const m = await import(pathToFileURL(createRequire(b).resolve(nome)).href);
      return m.default ?? m;
    } catch {}
  }
  return null;
}
const pw = await carregar('playwright');
if (!pw) {
  console.error('Não encontrei o Playwright. No site: npm i -D playwright');
  process.exit(1);
}
const sharp = await carregar('sharp');
if (!sharp) console.error('Aviso: sem o sharp não comparo píxeis, só a geometria. Corre a partir da pasta do site.');

// ------------------------------------------------------------ na página
function retrato(ignorar) {
  const fora = ignorar ? Array.from(document.querySelectorAll(ignorar)) : [];
  const out = [];
  const vh = innerHeight;
  for (const el of document.body.querySelectorAll('*')) {
    if (fora.some((f) => f.contains(el))) continue;
    const tag = el.tagName.toLowerCase();
    const media = ['img', 'svg', 'video', 'canvas', 'iframe', 'picture'].includes(tag);
    const texto = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!media && !texto) continue;
    if (el.closest('svg') && tag !== 'svg') continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh || r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    // opacidade efetiva: a do elemento vezes a dos pais
    let op = 1;
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) op *= Number(getComputedStyle(p).opacity);
    if (op < 0.01 || s.visibility === 'hidden') continue; // o que não se vê não conta
    out.push({
      id: `${tag}${texto ? `:${el.textContent.trim().slice(0, 30)}` : media ? `:${(el.getAttribute('alt') ?? el.getAttribute('src') ?? '').slice(0, 40)}` : ''}`,
      x: r.x, y: r.y, w: r.width, h: r.height, op,
      cor: s.color, letra: `${s.fontFamily.split(',')[0]} ${s.fontSize} ${s.fontWeight} ${s.fontStyle}`,
      visivel: s.visibility,
    });
  }
  return out;
}

async function assentar(page) {
  await page
    .waitForFunction(
      () =>
        Array.from(document.images)
          .filter((i) => {
            const r = i.getBoundingClientRect();
            return r.bottom > 0 && r.top < innerHeight && r.width > 0;
          })
          .every((i) => i.complete),
      null,
      { timeout: 8000 },
    )
    .catch(() => {});
  await page.waitForTimeout(1300);
}

async function abrir(browser, url, disp, reduzido, css) {
  const ctx = await browser.newContext({ ...disp.ctx, reducedMotion: reduzido ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text().slice(0, 160)));
  page.on('pageerror', (e) => erros.push(e.message.slice(0, 160)));
  await page.goto(url, { waitUntil: 'networkidle' });
  if (css) await page.addStyleTag({ content: css });
  await assentar(page);
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  return { ctx, page, erros, altura };
}

async function difPixeis(a, b) {
  if (!sharp) return null;
  const [ra, rb] = await Promise.all([a, b].map((buf) => sharp(buf).raw().toBuffer({ resolveWithObject: true })));
  if (ra.info.width !== rb.info.width || ra.info.height !== rb.info.height) return 100;
  const c = ra.info.channels;
  let n = 0;
  for (let i = 0; i < ra.data.length; i += c) {
    const d = Math.abs(ra.data[i] - rb.data[i]) + Math.abs(ra.data[i + 1] - rb.data[i + 1]) + Math.abs(ra.data[i + 2] - rb.data[i + 2]);
    if (d > 24) n++;
  }
  return (100 * n) / (ra.data.length / c);
}

function difGeometria(ga, gb) {
  const out = [];
  const usados = new Set();
  for (const a of ga) {
    const j = gb.findIndex((b, k) => !usados.has(k) && b.id === a.id);
    if (j < 0) {
      out.push(`falta depois: ${a.id}`);
      continue;
    }
    usados.add(j);
    const b = gb[j];
    const m = [];
    for (const k of ['x', 'y', 'w', 'h']) if (Math.abs(a[k] - b[k]) > 1) m.push(`${k} ${a[k].toFixed(0)}→${b[k].toFixed(0)}`);
    if (Math.abs(a.op - b.op) > 0.02) m.push(`opacidade ${a.op.toFixed(2)}→${b.op.toFixed(2)}`);
    for (const k of ['cor', 'letra', 'visivel']) if (a[k] !== b[k]) m.push(`${k} ${a[k]}→${b[k]}`);
    if (m.length) out.push(`${a.id}: ${m.join(', ')}`);
  }
  gb.forEach((b, k) => !usados.has(k) && out.push(`novo depois: ${b.id}`));
  return out;
}

const DISPOSITIVOS = [
  { nome: '390', ctx: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } },
  { nome: '1440', ctx: { viewport: { width: 1440, height: 900 } } },
];

const browser = await pw.chromium.launch();
let diferencas = 0;
for (const disp of DISPOSITIVOS.filter((d) => !so || d.nome === so)) {
  for (const reduzido of [false, true]) {
    const etiqueta = `${disp.nome}${reduzido ? ' reduzido' : ''}`;
    const A = await abrir(browser, antes, disp, reduzido);
    const B = await abrir(browser, depois, disp, reduzido, cssDepois);
    const linhas = [];
    if (Math.abs(A.altura - B.altura) > 2) linhas.push(`altura da página ${A.altura}→${B.altura}`);
    const vh = disp.ctx.viewport.height;
    let piorPix = 0;
    let paragens = 0;
    for (let y = 0; y < A.altura; y += Math.round(vh / 2)) {
      paragens++;
      for (const P of [A, B]) {
        await P.page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
        await assentar(P.page);
      }
      const [ga, gb] = await Promise.all([A, B].map((P) => P.page.evaluate(retrato, ignorar)));
      const geo = difGeometria(ga, gb);
      const [sa, sb] = await Promise.all([A, B].map((P) => P.page.screenshot()));
      const pix = await difPixeis(sa, sb);
      if (pix != null) piorPix = Math.max(piorPix, pix);
      if (geo.length || (pix != null && pix > 0.5)) {
        linhas.push(`y=${y}: ${pix != null ? `${pix.toFixed(2)}% píxeis` : ''}${geo.length ? ` | ${geo.slice(0, 4).join(' | ')}${geo.length > 4 ? ` (+${geo.length - 4})` : ''}` : ''}`);
        if (saida) {
          const base = path.join(saida, `${disp.nome}${reduzido ? '-reduzido' : ''}-y${y}`);
          fs.writeFileSync(`${base}-antes.png`, sa);
          fs.writeFileSync(`${base}-depois.png`, sb);
        }
      }
    }
    const novos = B.erros.filter((e) => !A.erros.includes(e));
    if (novos.length) linhas.push(`erros de consola novos: ${novos.slice(0, 3).join(' ; ')}`);
    console.log(`\n== ${etiqueta}: ${paragens} paragens, pior diferença de píxeis ${piorPix.toFixed(2)}%  ${linhas.length ? 'DIFERENTE' : 'igual'}`);
    for (const l of linhas.slice(0, 15)) console.log(`   ${l}`);
    diferencas += linhas.length;
    await A.ctx.close();
    await B.ctx.close();
  }
}
await browser.close();
console.log(diferencas ? `\n${diferencas} diferenças: explica cada uma, ou reverte.` : '\nTudo igual.');
process.exit(diferencas ? 2 : 0);
