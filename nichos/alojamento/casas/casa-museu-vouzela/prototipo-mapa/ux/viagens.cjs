// telemóvel: as duas viagens para fora da vila, a meio do arrasto (ecrã 5→6 e 6→7), sem o íman a puxar
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
const sharp = require(M + 'sharp');
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:4321/', { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(3000);
  const ks = (process.argv[2] || '5,5.2,5.4,5.6,5.8,6,6.2,6.4,6.6,6.8,7').split(',').map(Number);
  const tiles = [], TW = 195;
  for (const k of ks) {
    await pg.evaluate((k) => { document.documentElement.classList.remove('iman'); scrollTo(0, k * innerHeight); }, k);
    await pg.waitForTimeout(400);
    await pg.evaluate(() => new Promise(r => { const m = __casas.map; if (m.areTilesLoaded()) return setTimeout(r, 200); const to = setTimeout(r, 5000); m.once('idle', () => { clearTimeout(to); setTimeout(r, 200); }); }));
    const cur = await pg.evaluate(() => __casas.cur);
    const buf = await pg.screenshot({ type: 'jpeg', quality: 75 });
    const lab = Buffer.from(`<svg width="${TW}" height="18"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Arial" font-size="12" fill="#ff0">ecrã ${k} cur ${cur.toFixed(2)}</text></svg>`);
    const img = await sharp(buf).resize({ width: TW }).toBuffer();
    tiles.push(await sharp({ create: { width: TW, height: 440, channels: 3, background: '#000' } }).composite([{ input: lab, top: 0, left: 0 }, { input: img, top: 18, left: 0 }]).jpeg().toBuffer());
  }
  const cols = +process.env.COLS || 11;
  await sharp({ create: { width: cols * 199, height: Math.ceil(tiles.length / cols) * 444, channels: 3, background: '#444' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 199, top: Math.floor(i / cols) * 444 }))).jpeg({ quality: 78 }).toFile(__dirname + '/shots/viagens.jpg');
  await br.close();
})();
