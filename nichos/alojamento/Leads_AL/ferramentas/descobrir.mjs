// Descoberta pelo Google Maps: alojamentos do concelho que não estão no registo nem apareceram no Booking/Airbnb.
//   node ferramentas/descobrir.mjs "<Concelho>"
// Pesquisa "alojamento", "turismo rural quinta" e "hostel guest house" no concelho e em cada terra do registo,
// desce a lista até ao fim e guarda nome, categoria, nota e link de cada sítio.
// Escreve data/descobrir-<concelho>.json. O montar.js cruza com o que já se conhece; o que for novo vai ao paradas.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/descobrir.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.toLowerCase().replace(/\s+/g, '-');
const { candidatos } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `candidatos-${nomeF}.json`), 'utf8'));
const fSaida = path.join(RAIZ, 'data', `descobrir-${nomeF}.json`);
const out = fs.existsSync(fSaida) ? JSON.parse(fs.readFileSync(fSaida, 'utf8')) : { concelho, feitas: [], sitios: {} };
const grava = () => fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));
const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const terras = [...new Set([concelho, ...candidatos.map(c => (c.localidade || '').trim())].filter(t => t.length > 2).map(t => t.replace(/\b\w/g, l => l.toUpperCase())))].slice(0, 20);
const TERMOS = ['alojamento', 'turismo rural quinta', 'hostel guest house'];
// categorias do Maps que não são alojamento
const NAO = /restaurante|caf[eé]|bar\b|supermercado|igreja|escola|farm[aá]cia|loja|oficina|cl[ií]nica|imobili|c[aâ]mara|junta|museu|miradouro|parque\b(?! de campismo)|adega(?!.*aloj)/i;

const { chromium } = createRequire(path.join(RAIZ, 'package.json'))('playwright-core');
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: true });
const page = await browser.newPage({ locale: 'pt-PT', viewport: { width: 1280, height: 900 } });
await page.goto('https://www.google.com/maps?hl=pt-PT');
try { await page.getByRole('button', { name: /Rejeitar tudo|Aceitar tudo/ }).first().click({ timeout: 6000 }); await page.waitForTimeout(2000); } catch {}

for (const terra of terras) for (const termo of TERMOS) {
  const q = `${termo} ${sa(terra) === sa(concelho) ? concelho : `${terra}, ${concelho}`}`;
  if (out.feitas.includes(q)) continue;
  try {
    await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=pt-PT', { timeout: 25000 });
    await page.waitForSelector('div[role="feed"], h1.DUwDvf', { timeout: 10000 }).catch(() => {});
    // desce a lista até ao fim ("Chegou ao fim da lista") ou até parar de crescer
    let ant = 0, parado = 0;
    for (let i = 0; i < 25 && parado < 3; i++) {
      await page.evaluate(() => { const f = document.querySelector('div[role="feed"]'); if (f) f.scrollTop = f.scrollHeight; });
      await page.waitForTimeout(1300);
      const n = await page.locator('a.hfpxzc').count();
      if (await page.getByText(/Chegou ao fim da lista|You've reached the end/).count()) break;
      parado = n === ant ? parado + 1 : 0; ant = n;
    }
    const itens = await page.$$eval('a.hfpxzc', as => as.map(a => {
      const card = a.closest('div[role="article"]') || a.parentElement;
      return { nome: a.getAttribute('aria-label'), href: a.href.split('?')[0], texto: (card?.innerText || '').replace(/\n/g, ' | ').slice(0, 300) };
    }));
    let novos = 0;
    for (const it of itens) {
      if (!it.nome || out.sitios[it.href]) continue;
      const categoria = (it.texto.split(' | ').find(x => /aloj|hotel|hostel|guest|turismo|quinta|casa|pousada|apartamento|villa|campismo|glamping|b&b|pens[aã]o|residencial/i.test(x)) || '').slice(0, 80);
      if (NAO.test(categoria) && !/aloj|hotel|hostel|turismo/i.test(categoria)) continue;
      out.sitios[it.href] = { nome: it.nome, categoria, texto: it.texto, pesquisa: q };
      novos++;
    }
    out.feitas.push(q); grava();
    console.log(`${q}: ${itens.length} sítios, ${novos} novos (${Object.keys(out.sitios).length} no total)`);
  } catch (e) { console.log(q, 'ERRO', e.message.slice(0, 60)); }
}
await browser.close();
console.log(`-> ${path.relative(process.cwd(), fSaida)} · ${Object.keys(out.sitios).length} sítios`);
