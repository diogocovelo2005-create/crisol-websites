// Avalia os sites das leads de uma vez, com os mesmos sinais para todos, e tira a captura de cada um.
//   node ferramentas/avaliar-sites.mjs <entrada.json> [--conc 4]
// Entrada: uma lista [{ "id": "rnal-123", "url": "https://..." }] ou um novos-<concelho>.json (lê as leads com site.url).
// Saída: data/sites-<nome da entrada>.json com, por lead, o veredito sugerido, os sinais e a captura (capturas/<id>.png).
//
// Não decide sozinho: sugere. Quem grava confirma o "antigo" a olhar para a captura (passo 2e do SKILL.md).
// Os sinais vêm da lead-scraper (lib/site.js e prospeccao-alojamento/scripts/estetica.js), copiados para aqui
// porque o Leads AL também se instala sozinho, num zip, sem o resto do repositório.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const entrada = args.find(a => !a.startsWith('--'));
const conc = Number(args[args.indexOf('--conc') + 1]) || 4;
if (!entrada) { console.error('uso: node ferramentas/avaliar-sites.mjs <entrada.json> [--conc 4]'); process.exit(1); }

// Playwright: o do Leads AL (npm install nesta pasta) ou, no repositório, o da lead-scraper
function carregarPlaywright() {
  const sitios = [path.join(RAIZ, 'package.json'), path.resolve(RAIZ, '../../../.claude/skills/lead-scraper/package.json')];
  for (const s of sitios) {
    for (const nome of ['playwright-core', 'playwright']) {
      try { return createRequire(s)(nome); } catch {}
    }
  }
  console.error('Falta o Playwright. Nesta pasta corre: npm install');
  process.exit(1);
}
const { chromium } = carregarPlaywright();

// O browser é o Edge ou o Chrome que já está instalado (como o hero.js): não é preciso descarregar nenhum
const PF = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
const MAC = ['/Applications', path.join(process.env.HOME || '', 'Applications')];
const BROWSER = [
  ...PF.flatMap(d => [path.join(d, 'Microsoft\\Edge\\Application\\msedge.exe'), path.join(d, 'Google\\Chrome\\Application\\chrome.exe')]),
  ...MAC.flatMap(d => [path.join(d, 'Google Chrome.app/Contents/MacOS/Google Chrome'), path.join(d, 'Microsoft Edge.app/Contents/MacOS/Microsoft Edge')]),
].find(p => fs.existsSync(p));

// ---------- leads a avaliar ----------
const bruto = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const lista = (Array.isArray(bruto) ? bruto : bruto.leads.filter(l => l.site?.url).map(l => ({ id: l.id, url: l.site.url })))
  .filter(x => x.id && /^https?:\/\//.test(x.url || ''));
const saida = path.join(RAIZ, 'data', 'sites-' + path.basename(entrada).replace(/^(novos-|sites-a-avaliar-)/, '').replace(/\.json$/, '') + '.json');
const feitos = fs.existsSync(saida) ? JSON.parse(fs.readFileSync(saida, 'utf8')) : {};
const fila = lista.filter(x => !feitos[x.id] || feitos[x.id].url !== x.url || feitos[x.id].erro);
console.log(`${lista.length} sites, ${lista.length - fila.length} já avaliados, ${fila.length} por avaliar`);

// ---------- sinais ----------
const ANO = new Date().getFullYear();
const GERADOR_VELHO = /frontpage|dreamweaver|microsoft word|publisher|iweb|joomla!?\s*[123]\.|drupal\s*[67]|wordpress\s*[1-5]\.|namo|netobjects|golive|mobirise/i;
const PARQUEADO = /domain\s+(is\s+)?for\s+sale|buy\s+this\s+domain|dom[ií]nio\s+(à|a|para)\s+venda|em\s+constru[cç][aã]o|under\s+construction|coming\s+soon|brevemente|site\s+em\s+manuten[cç][aã]o|parked|default\s+web\s+site\s+page|welcome\s+to\s+nginx|index\s+of\s+\//i;
const IPHONE = {
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

// No telemóvel: os defeitos que o hóspede vê e os sinais de site feio
async function medirTelemovel(contexto, url) {
  const p = await contexto.newPage();
  let bytes = 0;
  p.on('requestfinished', async r => { try { const s = await r.sizes(); bytes += s.responseBodySize + s.responseHeadersSize; } catch {} });
  const t0 = Date.now();
  try {
    // Sites lentos do interior: 30 s e, se não chegar, segunda tentativa só à espera da resposta
    const resp = await p.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' })
      .catch(() => p.goto(url, { timeout: 30000, waitUntil: 'commit' }));
    let lento = false;
    await p.waitForLoadState('load', { timeout: 10000 }).catch(() => { lento = true; });
    const segundos = lento ? 10 : (Date.now() - t0) / 1000;
    // descer devagar para as imagens "lazy" carregarem
    await p.evaluate(async () => {
      for (let y = 0; y < Math.min(document.body.scrollHeight, 12 * innerHeight); y += innerHeight) { scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
      scrollTo(0, 0);
    }).catch(() => {});
    await p.waitForTimeout(800);
    const m = await p.evaluate(() => {
      const visivel = el => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const texto = document.body?.innerText ?? '';
      const html = document.documentElement.outerHTML;
      const anos = [...texto.matchAll(/(?:©|copyright)[^0-9]{0,25}((?:19|20)\d{2})/gi)].map(x => +x[1]).filter(a => a >= 1990 && a <= new Date().getFullYear() + 1);
      const imgs = [...document.images].filter(i => visivel(i) && i.clientWidth >= 150);
      const carregadas = imgs.filter(i => i.complete && i.naturalWidth > 0);
      let fundos = 0;
      for (const el of [...document.querySelectorAll('body *')].slice(0, 3000)) if (el.clientWidth >= 150 && getComputedStyle(el).backgroundImage.includes('url(')) fundos++;
      const gen = document.querySelector('meta[name="generator"]')?.content ?? '';
      const og = document.querySelector('meta[property="og:site_name"]')?.content ?? '';
      const template = [];
      if (/\/wp-content\/themes\/twenty[a-z-]*\//i.test(html)) template.push('tema por defeito do WordPress');
      if (/^\s*my site\s*$/i.test(og) || /\|\s*my site\s*$/i.test(document.title)) template.push('Wix por configurar');
      if (/lorem ipsum|just another wordpress site|hello world!/i.test(texto)) template.push('texto de exemplo');
      if (/email@domain\.com|example@example\.com/i.test(texto)) template.push('contactos de exemplo');
      const jq = window.jQuery?.fn?.jquery;
      if (jq && /^1\.[0-8]\./.test(jq)) template.push(`jQuery ${jq}`);
      if (/\.aspx(\?|"|'|#)/i.test(html) && !/wix\.com|wixstatic/i.test(html)) template.push('.aspx'); // o Wix também usa .aspx
      if (/index\.php\?option=com_/i.test(html)) template.push('Joomla antigo');
      if (/\.swf["'?]/i.test(html)) template.push('Flash');
      if (document.querySelector('font, marquee, center, frameset')) template.push('HTML dos anos 2000');
      const plataforma = /wix\.com|wixstatic/i.test(html) ? 'Wix' : /webnode/i.test(html) ? 'Webnode' : /site123/i.test(html) ? 'Site123'
        : /framer/i.test(gen) || /framerusercontent/i.test(html) ? 'Framer' : /webflow/i.test(html) ? 'Webflow'
        : /squarespace/i.test(html) ? 'Squarespace' : /wp-content/i.test(html) ? 'WordPress' : null;
      return {
        viewport: !!document.querySelector('meta[name="viewport"]'),
        arrastar: document.documentElement.scrollWidth > innerWidth + 2,
        rodape: anos.length ? Math.max(...anos) : null,
        gerador: gen || null, plataforma, template,
        pixelizadas: carregadas.filter(i => i.naturalWidth < i.clientWidth).length, carregadas: carregadas.length,
        imagens: imgs.length + fundos, chars: texto.trim().length, links: document.querySelectorAll('a[href]').length,
        parqueado: texto.slice(0, 20000),
      };
    });
    const final = p.url();
    m.parqueado = PARQUEADO.test(m.parqueado) || (m.chars < 500 && m.links < 3);
    return { http: resp?.status() ?? null, final, https: final.startsWith('https://'), segundos, mb: bytes / 1e6, ...m };
  } catch (e) {
    return { erro: String(e.message).split('\n')[0].slice(0, 160) };
  } finally {
    await Promise.race([p.close().catch(() => {}), new Promise(r => setTimeout(r, 5000))]);
  }
}

// Primeira captura no Wayback Machine: há quanto tempo o domínio tem site
async function wayback(url) {
  try {
    const dom = new URL(url).hostname.replace(/^www\./, '');
    const r = await fetch(`https://web.archive.org/cdx/search/cdx?url=${dom}&limit=1&output=json&fl=timestamp`, { signal: AbortSignal.timeout(20000) });
    const j = await r.json();
    return j[1]?.[0] ? +j[1][0].slice(0, 4) : null;
  } catch { return null; }
}

// A captura que o dashboard mostra, no computador (a mesma janela do hero.js)
async function capturar(contextoPC, url, id) {
  const p = await contextoPC.newPage();
  try {
    await p.goto(url, { timeout: 25000, waitUntil: 'domcontentloaded' });
    await p.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(1500);
    const f = path.join(RAIZ, 'capturas', id + '.png');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    await p.screenshot({ path: f, timeout: 10000 });
    return 'capturas/' + id + '.png';
  } catch { return null; }
  finally { await Promise.race([p.close().catch(() => {}), new Promise(r => setTimeout(r, 5000))]); }
}

// Os sinais em português e o veredito sugerido (as regras do passo 2e)
function julgar(m, desde) {
  if (m.erro || m.http == null || m.http >= 400) return { veredito: 'duvida', sinais: [`não abriu (${m.erro || 'http ' + m.http})`], vistos: [] };
  if (m.parqueado) return { veredito: 'duvida', sinais: ['parece parqueado ou "em construção"'], vistos: [] };
  const vistos = []; // o que o hóspede vê
  if (!m.https) vistos.push('sem https');
  if (!m.viewport) vistos.push('não adaptado a telemóvel');
  if (m.arrastar) vistos.push('obriga a arrastar para o lado');
  if (m.rodape && m.rodape <= ANO - 4) vistos.push(`© ${m.rodape}`);
  if (m.gerador && GERADOR_VELHO.test(m.gerador)) vistos.push(m.gerador);
  if (m.template.length) vistos.push(m.template.join(', '));
  if (/Webnode|Site123/.test(m.plataforma)) vistos.push(`feito em ${m.plataforma}`);
  if (m.carregadas >= 2 && m.pixelizadas / m.carregadas >= 0.4) vistos.push(`fotos pixelizadas (${m.pixelizadas} de ${m.carregadas})`);
  if (m.chars >= 4000 && m.imagens <= 1) vistos.push('parede de texto');
  const outros = [];
  if (m.mb >= 6) outros.push(`pesado (${m.mb.toFixed(1)} MB)`);
  if (m.segundos >= 10) outros.push('lento (10 s ou mais)');
  if (m.plataforma) outros.push(m.plataforma);
  if (desde) outros.push(`Wayback desde ${desde}`);
  const veredito = vistos.length >= 2 ? 'antigo' : vistos.length || outros.some(o => /pesado|lento/.test(o)) ? 'duvida' : 'moderno';
  return { veredito, sinais: [...vistos, ...outros], vistos };
}

// ---------- correr ----------
const browser = await chromium.launch(BROWSER ? { executablePath: BROWSER } : {});
const gravar = () => { fs.writeFileSync(saida + '.tmp', JSON.stringify(feitos, null, 2)); fs.renameSync(saida + '.tmp', saida); };
let n = 0;
const total = fila.length;
async function trabalhador() {
  const tel = await browser.newContext({ ...IPHONE, ignoreHTTPSErrors: true, locale: 'pt-PT' });
  const pc = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true, locale: 'pt-PT' });
  for (let x; (x = fila.shift());) {
    const [m, desde] = await Promise.all([
      Promise.race([medirTelemovel(tel, x.url), new Promise(r => setTimeout(() => r({ erro: 'o site prendeu o browser mais de 90 s' }), 90000))]),
      wayback(x.url),
    ]);
    const j = julgar(m, desde);
    const captura = m.erro ? null : await capturar(pc, m.final || x.url, x.id);
    feitos[x.id] = { url: x.url, final: m.final ?? null, ...j, captura, erro: m.erro ?? null, data: new Date().toISOString().slice(0, 10) };
    gravar(); // casa a casa: se parar, o mesmo comando retoma
    process.stdout.write(`\r${++n}/${total} `);
  }
  await tel.close().catch(() => {}); await pc.close().catch(() => {});
}
await Promise.all(Array.from({ length: Math.min(conc, fila.length) }, trabalhador));
await browser.close().catch(() => {});

const v = Object.values(feitos);
console.log(`\n-> ${path.relative(RAIZ, saida)}`);
console.log(`antigo ${v.filter(x => x.veredito === 'antigo').length} · dúvida ${v.filter(x => x.veredito === 'duvida').length} · moderno ${v.filter(x => x.veredito === 'moderno').length} · não abriram ${v.filter(x => x.erro).length}`);
process.exit(0);
