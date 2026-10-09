const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const dev of ['desk', 'mob']) {
    const ctx = await br.newContext(dev === 'mob' ? { ...devices['iPhone 13'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 860 } });
    const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('http://localhost:4321/'); await pg.waitForFunction(() => window.__casas && __casas.TOTAL > 0); await pg.waitForTimeout(2000);
    const log = await pg.evaluate(() => new Promise(r => { const t0 = performance.now(), out = []; document.querySelector('#hcta').click();
      const iv = setInterval(() => { out.push([Math.round(performance.now() - t0), +(scrollY / __casas.maxScroll * __casas.TOTAL).toFixed(2)]); if (performance.now() - t0 > 3600) { clearInterval(iv); r(out); } }, 300); }));
    console.log(dev, 'CTA', log.map(x => x.join(':')).join(' '));
    await pg.waitForTimeout(800);
    // tocar na foto da polaroid da Casa das Ameias
    const box = await pg.locator('#polaroids .polaroid').nth(2).locator('.gal').boundingBox();
    if (dev === 'mob') await pg.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); else await pg.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await pg.waitForTimeout(2800);
    const at = await pg.evaluate(() => { const u = scrollY / __casas.maxScroll * __casas.TOTAL; const e = __casas.timeline.find(x => u >= x.from && u <= x.to); return u.toFixed(2) + ' ' + e.kind + ' ' + __casas.SCENES[e.i].id; });
    // e a interrupção: roda a meio de uma passagem
    await pg.evaluate(() => document.querySelector('#next button').click()); await pg.waitForTimeout(300);
    const a = await pg.evaluate(() => scrollY); await pg.mouse.wheel(0, 100); await pg.waitForTimeout(500); const b = await pg.evaluate(() => scrollY); await pg.waitForTimeout(500); const c = await pg.evaluate(() => scrollY);
    console.log(dev, 'tap polaroid ameias →', at, '| interrupção', a, b, c, errs.join(';'));
    await ctx.close();
  }
  await br.close();
})();
