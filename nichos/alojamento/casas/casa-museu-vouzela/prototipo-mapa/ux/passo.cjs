// telemóvel por paragens: desce uma paragem de cada vez (como um gesto) e fotografa a passagem a meio e no fim
// uso: node passo.cjs <nome> [momentos em ms, ex. "300,800,2400"] [query]
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
const sharp = require(M + 'sharp');
const OUT = __dirname + '/shots';
require('fs').mkdirSync(OUT, { recursive: true });

const [name = 'passo', msArg = '350,900,2400', q = ''] = process.argv.slice(2);
const MS = msArg.split(',').map(Number), TW = +process.env.TW || 195;

(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('error: ' + m.text().slice(0, 200)); });
  await pg.goto('http://localhost:4321/' + q, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(3000);
  const n = await pg.evaluate(() => Math.round(document.documentElement.scrollHeight / innerHeight));
  const tiles = [];
  const shot = async (label) => {
    const buf = await pg.screenshot({ type: 'jpeg', quality: 80 });
    if (process.env.FULL) await sharp(buf).toFile(`${OUT}/${name}-${tiles.length}.jpg`);
    const lab = Buffer.from(`<svg width="${TW}" height="18"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Arial" font-size="12" fill="#ff0">${label}</text></svg>`);
    const img = await sharp(buf).resize({ width: TW }).toBuffer();
    const meta = await sharp(img).metadata();
    tiles.push(await sharp({ create: { width: TW, height: meta.height + 18, channels: 3, background: '#000' } }).composite([{ input: lab, top: 0, left: 0 }, { input: img, top: 18, left: 0 }]).jpeg().toBuffer());
  };
  await shot('0 hero');
  for (let k = 1; k < n; k++) {
    await pg.evaluate((k) => scrollTo(0, k * innerHeight), k);
    let t = 0;
    for (const ms of MS) {
      await pg.waitForTimeout(ms - t); t = ms;
      if (ms === MS[MS.length - 1]) await pg.evaluate(() => new Promise(r => { const m = __casas.map; if (m.areTilesLoaded()) return setTimeout(r, 200); const to = setTimeout(r, 4000); m.once('idle', () => { clearTimeout(to); setTimeout(r, 200); }); }));
      await shot(`${k} +${ms}ms cur ${(await pg.evaluate(() => __casas.cur)).toFixed(2)}`);
    }
  }
  const th = (await sharp(tiles[0]).metadata()).height, cols = +process.env.COLS || 8, rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * TW + (cols - 1) * 4, height: rows * th + (rows - 1) * 4, channels: 3, background: '#444' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * (TW + 4), top: Math.floor(i / cols) * (th + 4) }))).jpeg({ quality: 78 }).toFile(`${OUT}/${name}.jpg`);
  console.log('paragens', n, 'fotogramas', tiles.length);
  console.log([...new Set(errs)].slice(0, 15).join('\n'));
  await br.close();
})();
