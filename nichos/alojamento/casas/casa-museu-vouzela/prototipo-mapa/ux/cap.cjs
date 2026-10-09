// captura do site da Casa Museu em momentos do guião → folha de contacto (uma imagem por dispositivo)
// uso: node cap.cjs <desk|mob> <nome> [lista de pontos "u" separados por vírgula | "auto"] [query]
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
const sharp = require(M + 'sharp');
const path = require('path');
const OUT = __dirname + '/shots';
require('fs').mkdirSync(OUT, { recursive: true });

const [dev = 'desk', name = 'run', pts = 'auto', q = ''] = process.argv.slice(2);
const CFG = dev === 'mob'
  ? { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }
  : { viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1 };
const TW = +process.env.TW || (dev === 'mob' ? 195 : 360);  // largura de cada fotograma na folha

(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext(CFG);
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200)); });
  await pg.goto('http://localhost:4321/' + q, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(2500);
  const info = await pg.evaluate(() => ({ TOTAL: __casas.TOTAL, HERO_U: __casas.HERO_U, tl: __casas.timeline.map(e => [e.kind, __casas.SCENES[e.i].id, +e.from.toFixed(2), +e.to.toFixed(2)]), maxScroll: __casas.maxScroll }));
  let us;
  if (pts === 'auto') {
    us = [0, info.HERO_U * .15, info.HERO_U * .35, info.HERO_U * .55, info.HERO_U * .8];
    for (const [k, id, a, b] of info.tl) us.push(k === 'hold' ? (id === 'vila' ? [a + .1, a + .6, b - .05] : [(a + b) / 2]) : [a + (b - a) * .5]);
    us = us.flat();
  } else us = pts.split(',').map(Number);
  const tiles = [];
  for (const u of us) {
    // o site usa scroll real: salta para o scroll equivalente e espera a câmara assentar
    await pg.evaluate((u) => { if (u < 0) { scrollTo(0, document.documentElement.scrollHeight); return; } scrollTo(0, u / __casas.TOTAL * __casas.maxScroll); __casas.target = u; }, u);
    if (u < 0) { await pg.waitForTimeout(1500); }
    if (u >= 0) await pg.waitForFunction((u) => Math.abs(__casas.cur - u) < 1e-3, u, { timeout: 15000 }).catch(() => {});
    await pg.evaluate(() => new Promise(r => { const m = __casas.map; if (m.areTilesLoaded()) return setTimeout(r, 250); const t = setTimeout(r, 5000); m.once('idle', () => { clearTimeout(t); setTimeout(r, 250); }); }));
    await pg.waitForTimeout(700);
    const buf = await pg.screenshot({ type: 'jpeg', quality: 80 });
    const lab = Buffer.from(`<svg width="${TW}" height="18"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Arial" font-size="12" fill="#ff0">${u.toFixed(2)} ${info.tl.find(e => u >= e[2] && u <= e[3])?.slice(0, 2).join(' ') || 'hero'}</text></svg>`);
    const img = await sharp(buf).resize({ width: TW }).toBuffer();
    const meta = await sharp(img).metadata();
    tiles.push(await sharp({ create: { width: TW, height: meta.height + 18, channels: 3, background: '#000' } }).composite([{ input: lab, top: 0, left: 0 }, { input: img, top: 18, left: 0 }]).jpeg().toBuffer());
    if (process.env.FULL) await sharp(buf).toFile(`${OUT}/${name}-${u.toFixed(2)}.jpg`);
  }
  const th = (await sharp(tiles[0]).metadata()).height, cols = +process.env.COLS || (dev === 'mob' ? 8 : 4), rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * TW + (cols - 1) * 4, height: rows * th + (rows - 1) * 4, channels: 3, background: '#444' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * (TW + 4), top: Math.floor(i / cols) * (th + 4) }))).jpeg({ quality: 78 }).toFile(`${OUT}/${name}.jpg`);
  console.log(JSON.stringify({ TOTAL: info.TOTAL, maxScroll: info.maxScroll, n: us.length, tl: info.tl.map(e => e.join(' ')).join(' | ') }));
  console.log([...new Set(errs)].slice(0, 15).join('\n'));
  await br.close();
})();
