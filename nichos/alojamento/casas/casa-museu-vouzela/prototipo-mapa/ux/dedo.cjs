// telemóvel: arrastos de dedo reais (CDP) de várias distâncias; vê se o ecrã segue o dedo e onde assenta ao largar
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
  const cdp = await ctx.newCDPSession(pg);
  const st = () => pg.evaluate(() => ({ k: +(scrollY / innerHeight).toFixed(2), cur: +__casas.cur.toFixed(2) }));
  // arrasto a meio: toca, move devagar, fotografa ainda com o dedo em baixo, larga
  const tiles = [], TW = 195;
  const shot = async (label) => {
    const buf = await pg.screenshot({ type: 'jpeg', quality: 70 });
    const lab = Buffer.from(`<svg width="${TW}" height="18"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Arial" font-size="11" fill="#ff0">${label}</text></svg>`);
    const img = await sharp(buf).resize({ width: TW }).toBuffer();
    tiles.push(await sharp({ create: { width: TW, height: 440, channels: 3, background: '#000' } }).composite([{ input: lab, top: 0, left: 0 }, { input: img, top: 18, left: 0 }]).jpeg().toBuffer());
  };
  const tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 200, y }] });
  for (const dist of [250, 500, 250, 600]) {
    await tp('touchStart', 700);
    for (let y = 700; y >= 700 - dist; y -= 10) { await tp('touchMove', y); await pg.waitForTimeout(8); }
    await pg.waitForTimeout(150);
    const a = await st();
    await shot(`dedo ${dist}px k${a.k} cur${a.cur}`);
    await tp('touchEnd', 0);
    await pg.waitForTimeout(1500);
    const b = await st();
    await shot(`largou k${b.k} cur${b.cur}`);
    console.log('arrasto', dist, 'com o dedo', JSON.stringify(a), 'depois', JSON.stringify(b));
  }
  await sharp({ create: { width: tiles.length * 199, height: 440, channels: 3, background: '#444' } })
    .composite(tiles.map((t, i) => ({ input: t, left: i * 199, top: 0 }))).jpeg({ quality: 78 }).toFile(__dirname + '/shots/dedo.jpg');
  await br.close();
})();
