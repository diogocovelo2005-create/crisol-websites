// visitante apressado: 4G, começa a descer aos 3 s e desce o hero em ~4 s
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright'); const sharp = require(M + 'sharp');
const [dev = 'mob', name = 'early', q = ''] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await br.newContext(dev === 'mob' ? { ...devices['iPhone 13'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 860 } });
  const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 });
  const t0 = Date.now(); await pg.goto('http://localhost:4321/' + q);
  await pg.waitForFunction(() => window.__casas && __casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(Math.max(0, 3000 - (Date.now() - t0)));
  const tiles = []; const TW = dev === 'mob' ? 150 : 300;
  for (const f of [.1, .3, .45, .55, .65, .8, 1.05, 1.3]) {
    await pg.evaluate(f => { const u = f * __casas.HERO_U; scrollTo(0, u / __casas.TOTAL * __casas.maxScroll); }, f);
    await pg.waitForTimeout(500);
    const st = await pg.evaluate(() => ({ v: document.querySelector('#hvoo').readyState, a: document.querySelector('#aerial img')?.complete && document.querySelector('#aerial img').naturalWidth > 0 }));
    const b = await sharp(await pg.screenshot({ type: 'jpeg' })).resize({ width: TW }).toBuffer();
    const h = (await sharp(b).metadata()).height;
    const lab = Buffer.from(`<svg width="${TW}" height="16"><rect width="100%" height="100%"/><text x="3" y="12" font-size="11" font-family="Arial" fill="#ff0">${((Date.now() - t0) / 1000).toFixed(1)}s hp${f} v${st.v} a${st.a ? 1 : 0}</text></svg>`);
    tiles.push({ b, h, lab });
  }
  const H = tiles[0].h + 16;
  await sharp({ create: { width: tiles.length * (TW + 3), height: H, channels: 3, background: '#444' } }).composite(tiles.flatMap((t, i) => [{ input: t.lab, left: i * (TW + 3), top: 0 }, { input: t.b, left: i * (TW + 3), top: 16 }])).jpeg({ quality: 75 }).toFile(__dirname + '/shots/' + name + '.jpg');
  await br.close();
})();
