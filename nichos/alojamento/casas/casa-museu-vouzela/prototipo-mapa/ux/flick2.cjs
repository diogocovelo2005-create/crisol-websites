// telemóvel: gestos rápidos e curtos com toques CDP (poucos movimentos seguidos e larga logo = impulso)
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:4321/' + (process.argv[3] || ''), { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(3000);
  const cdp = await ctx.newCDPSession(pg);
  const tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 200, y }] });
  const [dist, n] = (process.argv[2] || '250,5').split(',').map(Number);
  const st = () => pg.evaluate(() => ({ y: Math.round(scrollY), cur: +__casas.cur.toFixed(2) }));
  for (let g = 0; g < +(process.env.G || 9); g++) {
    await tp('touchStart', 650);
    for (let k = 1; k <= n; k++) { await tp('touchMove', 650 - dist * k / n); await pg.waitForTimeout(6); }
    await tp('touchEnd', 0);
    await pg.waitForTimeout(2300);
    console.log('gesto', g + 1, JSON.stringify(await st()));
  }
  await br.close();
})();
