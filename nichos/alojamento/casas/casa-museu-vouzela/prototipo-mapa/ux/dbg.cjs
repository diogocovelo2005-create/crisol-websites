const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:4321/', { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(3000);
  for (const [how, k] of [['passo', 1], ['passo', 2], ['salto', 5.4]]) {
    await pg.evaluate(([how, k]) => { if (how === 'salto') document.documentElement.classList.remove('iman'); scrollTo(0, k * innerHeight); }, [how, k]);
    await pg.waitForTimeout(1500);
    console.log(how, k, await pg.evaluate(() => { const h = document.getElementById('hero'), f = document.getElementById('hfade'), c = document.getElementById('contactos');
      const el = document.elementFromPoint(100, 520);
      return { cur: __casas.cur.toFixed(2), heroVis: h.style.visibility, fadeOp: f.style.opacity, fadeVis: f.style.visibility, contactos: c.className, contT: c.style.transform, stage: document.querySelector('.stage').style.transform, at: el && (el.className || el.tagName) }; }));
  }
  await br.close();
})();
