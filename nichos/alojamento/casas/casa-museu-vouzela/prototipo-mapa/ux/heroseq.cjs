// hero do telemóvel: um gesto e fotogramas seguidos da fachada a pousar no cartão da receção
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
  const k = +(process.argv[2] || 1);
  await pg.evaluate((k) => scrollTo(0, k * innerHeight), k);
  const tiles = [], TW = 195, t0 = Date.now();
  while (Date.now() - t0 < 2600) {
    const buf = await pg.screenshot({ type: 'jpeg', quality: 70 });
    const cur = await pg.evaluate(() => __casas.cur);
    const lab = Buffer.from(`<svg width="${TW}" height="18"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Arial" font-size="12" fill="#ff0">+${Date.now() - t0}ms cur ${cur.toFixed(2)}</text></svg>`);
    const img = await sharp(buf).resize({ width: TW }).toBuffer();
    tiles.push(await sharp({ create: { width: TW, height: 440, channels: 3, background: '#000' } }).composite([{ input: lab, top: 0, left: 0 }, { input: img, top: 18, left: 0 }]).jpeg().toBuffer());
  }
  const cols = 8, rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * 199, height: rows * 444, channels: 3, background: '#444' } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * 199, top: Math.floor(i / cols) * 444 }))).jpeg({ quality: 78 }).toFile(__dirname + '/shots/heroseq-' + k + '.jpg');
  console.log(tiles.length);
  await br.close();
})();
