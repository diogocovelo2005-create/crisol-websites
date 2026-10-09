// sensibilidade: parado numa casa, arrasta o dedo poucos px (sem largar) e mede o que muda no ecrã
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
const sharp = require(M + 'sharp');
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await br.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:4321/' + (process.argv[3] || ''), { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__casas && window.__casas.TOTAL > 0, null, { timeout: 60000 });
  await pg.waitForTimeout(3000);
  const at = +(process.argv[2] || 4.8);
  await pg.evaluate((k) => scrollTo(0, k * innerHeight), at);
  await pg.waitForTimeout(6000);
  const cdp = await ctx.newCDPSession(pg);
  const tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 200, y }] });
  const st = () => pg.evaluate(() => {
    const act = Object.entries(__casas.markers).filter(([, m]) => m.el.classList.contains('active')).map(([id]) => id).join(',') || '-';
    const w = document.getElementById('world').style.transform.match(/matrix\(([^)]*)\)/);
    const p = w ? w[1].split(',').map(Number) : [];
    return `y ${Math.round(scrollY)} cur ${__casas.cur.toFixed(3)} cartão ${act} drone x${(p[4] || 0).toFixed(0)} y${(p[5] || 0).toFixed(0)} k${Math.hypot(p[0] || 0, p[1] || 0).toFixed(3)}`;
  });
  console.log('parado:', await st());
  await tp('touchStart', 600);
  // o Chrome só começa a rolar depois de uns px (limiar do toque): arranca já com 15 px
  let y = 600; const tiles = [];
  for (const d of [15, 20, 25, 35, 55, 95, 175]) {
    while (y > 600 - d) { y -= 5; await tp('touchMove', y); await pg.waitForTimeout(10); }
    await pg.waitForTimeout(250);
    console.log(`dedo ${d}px:`, await st());
    const buf = await pg.screenshot({ type: 'jpeg', quality: 70 });
    const lab = Buffer.from(`<svg width="195" height="18"><rect width="100%" height="100%" fill="#000"/><text x="4" y="13" font-family="Arial" font-size="12" fill="#ff0">dedo ${d}px</text></svg>`);
    tiles.push(await sharp({ create: { width: 195, height: 440, channels: 3, background: '#000' } }).composite([{ input: lab, top: 0, left: 0 }, { input: await sharp(buf).resize({ width: 195 }).toBuffer(), top: 18, left: 0 }]).jpeg().toBuffer());
  }
  await tp('touchEnd', 0);
  await sharp({ create: { width: tiles.length * 199, height: 440, channels: 3, background: '#444' } }).composite(tiles.map((t, i) => ({ input: t, left: i * 199, top: 0 }))).jpeg({ quality: 78 }).toFile(__dirname + '/shots/sens.jpg');
  await br.close();
})();
