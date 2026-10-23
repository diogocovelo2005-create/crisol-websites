/*
  Ícone do site (separador do browser, ecrã de início).
  Gera 3 variantes em ../arquivo/favicon/<v>/ (icon.png 512, apple-icon.png 180,
  favicon.ico 16+32) e uma pré-visualização por variante (16/32/180, fundo claro e escuro).
    node scripts/favicon.mjs http://localhost:4160          -> gera
    node scripts/favicon.mjs instalar a|b|c                 -> copia a escolhida para app/
  Precisa do site a correr (fonte Young Serif) e do Playwright.
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const OUT = path.resolve('../arquivo/favicon');
if (process.argv[2] === 'instalar') {
  const v = process.argv[3];
  const d = path.join(OUT, v);
  if (!fs.existsSync(d)) throw new Error('variante inexistente: ' + v);
  fs.copyFileSync(path.join(d, 'icon.png'), 'app/icon.png');
  fs.copyFileSync(path.join(d, 'apple-icon.png'), 'app/apple-icon.png');
  fs.copyFileSync(path.join(d, 'favicon.ico'), 'app/favicon.ico');
  console.log('instalada a variante', v);
  process.exit(0);
}

const base = process.argv[2] ?? 'http://localhost:4160';
const req = createRequire(path.resolve('../../../.claude/skills/criar-base/package.json'));
const { chromium } = req('playwright');
const CAL = '#f3e9d8', CAIX = '#7a2b2b', XISTO = '#221f1b';

// «C» sozinho, sobre transparente; depois medimos a caixa real dos píxeis (trim) e centramo-la no quadrado
const glifo = (fg) => `<span class="rustico-encorpado" style="font-size:600px;line-height:1.4;padding:60px;display:inline-block;color:${fg}">C</span>`;
const letra = (fg, bg, alt = 0.8) => ({ glifo: glifo(fg), bg, alt });
// janela de caixilho: moldura vermelha, quatro vidraças de cal (2 x 2) com travessa e montante
const janela = `<svg width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="${CAL}"/>
  <rect x="72" y="56" width="368" height="400" rx="20" fill="${CAIX}"/>
  <rect x="128" y="112" width="116" height="136" rx="4" fill="${CAL}"/><rect x="268" y="112" width="116" height="136" rx="4" fill="${CAL}"/>
  <rect x="128" y="280" width="116" height="120" rx="4" fill="${CAL}"/><rect x="268" y="280" width="116" height="120" rx="4" fill="${CAL}"/></svg>`;
const VAR = {
  a: { nome: 'C vermelho caixilho sobre cal', ...letra(CAIX, CAL) },
  b: { nome: 'C cal sobre vermelho caixilho', ...letra(CAL, CAIX) },
  c: { nome: 'janela de caixilho', html: janela },
};

const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 1, viewport: { width: 600, height: 600 } });
await p.goto(`${base}/em-construcao`, { waitUntil: 'networkidle' });

function ico(p16, p32) {
  const imgs = [[16, p16], [32, p32]];
  const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let off = 6 + 16 * imgs.length; const dirs = [];
  for (const [s, buf] of imgs) {
    const e = Buffer.alloc(16); e[0] = s; e[1] = s; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(off, 12); off += buf.length; dirs.push(e);
  }
  return Buffer.concat([head, ...dirs, ...imgs.map((i) => i[1])]);
}

const SO = process.argv[3];
for (const [k, v] of Object.entries(VAR)) {
  if (SO && SO !== k) continue;
  await p.evaluate((html) => {
    document.documentElement.style.background = 'transparent';
    document.body.innerHTML = `<div id="i" style="display:inline-block">${html}</div>`;
    document.body.style.cssText = 'margin:0;background:transparent';
  }, v.glifo ?? v.html);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  let big = await p.locator('#i').screenshot({ omitBackground: true });
  if (v.glifo) {
    const t = await sharp(big).trim({ threshold: 10 }).png().toBuffer();
    const h = Math.round(512 * v.alt);
    const g = await sharp(t).resize({ height: h }).png().toBuffer();
    const gw = (await sharp(g).metadata()).width;
    const fundo = Buffer.from(`<svg width="512" height="512"><rect width="512" height="512" rx="112" fill="${v.bg}"/></svg>`);
    big = await sharp(fundo).composite([{ input: g, left: Math.round((512 - gw) / 2), top: Math.round((512 - h) / 2) }]).png().toBuffer();
  }
  const sz = (n) => sharp(big).resize(n, n, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();
  const [p16, p32, p180, p512] = [await sz(16), await sz(32), await sz(180), await sz(512)];
  const d = path.join(OUT, k); fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'icon.png'), p512);
  fs.writeFileSync(path.join(d, 'apple-icon.png'), p180); // o iOS arredonda sozinho; sem transparência
  fs.writeFileSync(path.join(d, 'favicon.ico'), ico(p16, p32));

  // pré-visualização: duas faixas (claro / escuro): 16, 32, 180 reais e 16 e 32 ampliados 8x/4x
  const W = 760, H = 2 * 260;
  const comp = [];
  const faixas = [['#ffffff', '#202124'], ['#dee1e6', '#35363a']].map((x) => x);
  const fundos = ['#f1f3f4', '#202124'];
  const base = sharp({ create: { width: W, height: H, channels: 4, background: '#fff' } });
  const itens = [[p16, 16, 30], [p32, 32, 80], [p180, 180, 150], [await sharp(p16).resize(128, 128, { kernel: 'nearest' }).png().toBuffer(), 128, 360], [await sharp(p32).resize(128, 128, { kernel: 'nearest' }).png().toBuffer(), 128, 520]];
  fundos.forEach((f, r) => {
    comp.push({ input: { create: { width: W, height: 260, channels: 4, background: f } }, left: 0, top: r * 260 });
    for (const [buf, s, x] of itens) comp.push({ input: buf, left: x, top: r * 260 + Math.round((260 - s) / 2) });
  });
  await base.composite(comp).png().toFile(path.join(OUT, `${k}-previsao.png`));
  console.log(k, v.nome);
}
await b.close();
