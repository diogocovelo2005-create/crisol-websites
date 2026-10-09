// telemóvel: gestos rápidos e curtos (com impulso), como um dedo real. Cada um deve levar exatamente à paragem seguinte
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
  const [dist, speed] = (process.argv[2] || '250,1800').split(',').map(Number);
  const st = () => pg.evaluate(() => ({ y: Math.round(scrollY), cur: +__casas.cur.toFixed(2) }));
  for (let g = 0; g < 3; g++) {
    await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -dist, speed, gestureSourceType: 'touch', preventFling: false });
    await pg.waitForTimeout(2200);
    console.log('gesto', g + 1, JSON.stringify(await st()));
  }
  await br.close();
})();
