// peso e ordem de carregamento, com rede de telemóvel (4G) simulada
const M = 'c:/Users/Diogo Covelo/Desktop/crisol-websites/nichos/alojamento/arquivo/molde/node_modules/';
const { chromium, devices } = require(M + 'playwright');
const [dev = 'mob', q = ''] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await br.newContext(dev === 'mob' ? { ...devices['iPhone 13'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 860 } });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable');
  // 4G razoável: 9 Mbit/s, 60 ms
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 });
  const reqs = new Map(); const t0 = Date.now();
  cdp.on('Network.requestWillBeSent', e => reqs.set(e.requestId, { url: e.request.url, t: Date.now() - t0 }));
  cdp.on('Network.loadingFinished', e => { const r = reqs.get(e.requestId); if (r) { r.end = Date.now() - t0; r.kb = Math.round(e.encodedDataLength / 1024); } });
  await pg.goto('http://localhost:4321/' + q);
  const marks = {};
  const poll = setInterval(async () => {
    try {
      const s = await pg.evaluate(() => ({ hero: !!document.querySelector('#hphoto img')?.complete && document.querySelector('#hphoto img').naturalWidth > 0, fonts: document.fonts.status, ready: !!window.__casas, voo: document.querySelector('#hvoo').readyState }));
      const t = Date.now() - t0;
      if (s.hero && !marks.hero) marks.hero = t;
      if (s.fonts === 'loaded' && !marks.fonts) marks.fonts = t;
      if (s.ready && !marks.script) marks.script = t;
      if (s.voo >= 2 && !marks.voo) marks.voo = t;
    } catch {}
  }, 100);
  await pg.waitForTimeout(40000);
  clearInterval(poll);
  const rows = [...reqs.values()].filter(r => r.kb != null).sort((a, b) => a.t - b.t);
  const tot = rows.reduce((s, r) => s + r.kb, 0);
  console.log('marks', JSON.stringify(marks), 'total KB', tot, 'n', rows.length);
  const agg = {};
  for (const r of rows) { const k = r.url.includes('openfreemap') ? 'tiles-ofm' : r.url.replace(/\?.*/, '').split('/').slice(-1)[0]; agg[k] = agg[k] || { kb: 0, n: 0, t: r.t, end: 0 }; agg[k].kb += r.kb; agg[k].n++; agg[k].end = Math.max(agg[k].end, r.end); }
  Object.entries(agg).sort((a, b) => b[1].kb - a[1].kb).slice(0, 22).forEach(([k, v]) => console.log(String(v.kb).padStart(6), 'KB', String(v.n).padStart(3), 'x', String(v.t).padStart(6), '→', String(v.end).padStart(6), 'ms', k));
  await br.close();
})();
