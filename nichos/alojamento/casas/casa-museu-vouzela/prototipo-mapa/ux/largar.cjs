// telemóvel: arrasto curto numa viagem e depois larga; mede quanto tempo o ecrã leva a acabar a passagem
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:4321/', { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(3000);
  const cdp = await ctx.newCDPSession(pg);
  const tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 200, y }] });
  const drag = async (dist) => { await tp('touchStart', 700); for (let y = 700; y >= 700 - dist; y -= 20) { await tp('touchMove', y); await pg.waitForTimeout(8); } await tp('touchEnd', 0); };
  const st = () => pg.evaluate(() => ({ k: +(scrollY / innerHeight).toFixed(2), cur: +__casas.cur.toFixed(2) }));
  // vai até à BIKEINN (5 passagens de um ecrã)
  for (let i = 0; i < 5; i++) { await drag(560); await pg.waitForTimeout(1200); }
  console.log('BIKEINN?', JSON.stringify(await st()));
  for (const [nome, dist] of [['campo', 740], ['mar', 820]]) {
    await drag(dist);
    const t0 = Date.now(), log = [];
    for (;;) { const s = await st(); log.push(`${Date.now() - t0}ms k${s.k} cur${s.cur}`); if (Date.now() - t0 > 2600) break; await pg.waitForTimeout(200); }
    console.log(nome + ':\n  ' + log.join('\n  '));
  }
  await br.close();
})();
