import { chromium } from 'playwright';
const out = '.shots/pagina';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const erros = [];
p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
p.on('pageerror', (e) => erros.push(String(e)));
await p.goto('http://localhost:3300', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

const d = await p.evaluate(() => {
  const h = document.querySelector('main > div').getBoundingClientRect();
  return { curso: h.height - innerHeight, total: document.body.scrollHeight };
});

async function tirar(nome, y) {
  await p.evaluate((v) => scrollTo(0, v), Math.round(y));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/${nome}.jpg`, quality: 82, type: 'jpeg' });
}

await tirar('hero-dia', 0);
await tirar('hero-fusao', d.curso * 0.38);
await tirar('hero-noite', d.curso * 0.8);

const esp = await p.evaluate(() => {
  const el = document.querySelector('#espacos');
  const r = el.getBoundingClientRect();
  return { topo: r.top + scrollY, altura: r.height, nomes: [...el.querySelectorAll('ol li span.font-display')].map((s) => s.textContent.trim()) };
});
console.log('espacos:', JSON.stringify(esp.nomes));
await tirar('espacos-adega', esp.topo + 60);
await tirar('espacos-esplanada', esp.topo + (esp.altura - 900) * 0.92);

const pico = await p.evaluate(() => {
  const el = [...document.querySelectorAll('div')].find((x) => x.className.includes('md:h-[380vh]'));
  const r = el.getBoundingClientRect();
  return { topo: r.top + scrollY, altura: r.height };
});
await tirar('pico-visita', pico.topo + (pico.altura - 900) * 0.5);

const texto = await p.evaluate(() => document.body.innerText);
console.log('travessoes:', [...texto].filter((c) => c === '\u2014' || c === '\u2013').length);
console.log('erros:', erros.length ? erros.join(' | ') : 'nenhum');
await b.close();
