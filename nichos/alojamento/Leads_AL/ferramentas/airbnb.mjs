// Casas ativas no Airbnb num concelho, ligadas ao registo oficial pelo nº AL que cada anúncio mostra.
//   node ferramentas/airbnb.mjs "São Pedro do Sul"        (precisa de data/candidatos-<concelho>.json, do rnal.js)
// Escreve data/airbnb-<concelho>.json:
//   anuncios: por id do Airbnb — título, tipo, nota, avaliações, novo, anfitrião (particular/profissional),
//             nº AL, última avaliação (mês), id do registo associado, url
// A pesquisa é feita por quadrados do mapa (caixa do concelho no OpenStreetMap, 3x3, e cada quadrado cheio parte-se em 4):
// uma pesquisa só ao concelho pára nas 15 páginas (~270 anúncios) e deixava casas de fora (a Casa das Marucas, na Régua).
// "Ativa": o anúncio aparece na pesquisa (o Airbnb esconde os que estão parados) e, se tiver avaliações,
// a mais recente é dos últimos 12 meses. Um anúncio "Novo" também é ativo.
// Retoma se parar.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/airbnb.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.toLowerCase().replace(/\s+/g, '-');
const { candidatos } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `candidatos-${nomeF}.json`), 'utf8'));
const fSaida = path.join(RAIZ, 'data', `airbnb-${nomeF}.json`);
const out = fs.existsSync(fSaida) ? JSON.parse(fs.readFileSync(fSaida, 'utf8')) : { concelho, anuncios: {} };
const grava = () => fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));

const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// nº AL -> id do candidato (cada titular pode ter várias unidades)
const porAL = new Map(), porRNET = new Map();
for (const c of candidatos) for (const r of c.registos || [String(c.id).replace(/\D/g, '')]) (c.id.startsWith('rnet-') ? porRNET : porAL).set(r, c.id);
// terras do concelho, para filtrar os cartões da pesquisa (que mistura concelhos vizinhos)
const TERRAS = new Set([sa(concelho), ...candidatos.map(c => sa(c.localidade).trim())].filter(t => t.length > 2));
// "Anfitriã/o: Tiago" + "Superhost · 11 anos de experiência": nome + experiência identificam o anfitrião
// (o mesmo anfitrião em 3+ anúncios do concelho = gestora; só o primeiro nome não chega, há muitas Marias)
const anfitriaoDe = t => {
  const m = t.match(/Anfitri(?:ã\/o|ão|ã)\s*:\s*([^\n]{2,50})\n?([^\n]{0,60})/);
  if (!m) return { anfitriao_nome: null };
  const exp = (m[2].match(/(\d+)\s+(anos?|mês|meses) de experiência/) || [])[0] || '';
  return { anfitriao_nome: m[1].trim(), anfitriao_chave: `${m[1].trim()}|${exp}`, superhost: /Superhost/.test(m[2]) || undefined };
};
const MESES = { janeiro: 1, fevereiro: 2, 'março': 3, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };

const { chromium } = createRequire(path.join(RAIZ, 'package.json'))('playwright-core');
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: false, args: ['--headless=new', '--disable-blink-features=AutomationControlled'] });
const page = await browser.newPage({ locale: 'pt-PT', viewport: { width: 1366, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' });
const pausa = ms => page.waitForTimeout(ms);

// ---------- 1. pesquisa: todas as páginas ----------
const cartoes = new Map();
async function lerCartoes() {
  return page.$$eval('[itemprop="itemListElement"], [data-testid="card-container"]', cs => cs.map(c => {
    const id = c.querySelector('a[href*="/rooms/"]')?.href.match(/rooms\/(\d+)/)?.[1];
    return id && { id, texto: c.innerText.replace(/\n/g, ' | ') };
  }).filter(Boolean)).catch(() => []);
}
// caixa do concelho (OpenStreetMap), guardada no ficheiro para não voltar a pedir
async function caixa() {
  if (out.caixa) return out.caixa;
  const u = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(concelho)}&countrycodes=pt&format=json&limit=5`;
  const r = await (await fetch(u, { headers: { 'User-Agent': 'LeadsAL-prospecao/1.0' } })).json();
  const b = r.find(x => x.class === 'boundary' && x.type === 'administrative') || r[0];
  if (!b) throw new Error('OpenStreetMap não encontrou o concelho: passa a caixa à mão em out.caixa [s, n, w, e]');
  out.caixa = b.boundingbox.map(Number); grava(); // [sul, norte, oeste, este]
  return out.caixa;
}
async function pesquisarQuadrado([s, n, w, e], nivel = 0) {
  let url = `https://www.airbnb.pt/s/homes?ne_lat=${n}&ne_lng=${e}&sw_lat=${s}&sw_lng=${w}&search_by_map=true&search_type=user_map_move&zoom_level=${13 + nivel}`;
  let pag = 0;
  for (; pag < 15 && url; pag++) {
    try { await page.goto(url, { timeout: 45000 }); await pausa(4500); } catch { break; }
    for (const c of await lerCartoes()) cartoes.set(c.id, c.texto);
    // o botão "Próximo" é um link com o cursor da página seguinte (clicar não muda a página no modo invisível)
    const href = await page.locator('a[aria-label="Próximo"], a[aria-label="Seguinte"]').first().getAttribute('href').catch(() => null);
    url = href ? new URL(href, 'https://www.airbnb.pt').href : null;
  }
  console.log(`${'  '.repeat(nivel)}quadrado ${[s, n, w, e].map(x => x.toFixed(3)).join(',')}: ${pag} páginas (${cartoes.size} no total)`);
  // quadrado cheio (15 páginas): o Airbnb cortou; parte-se em 4
  if (url && nivel < 2) {
    const ms = (s + n) / 2, mw = (w + e) / 2;
    for (const q of [[s, ms, w, mw], [s, ms, mw, e], [ms, n, w, mw], [ms, n, mw, e]]) await pesquisarQuadrado(q, nivel + 1);
  }
}
if (!out.pesquisa_feita) {
  const [s, n, w, e] = await caixa();
  const ds = (n - s) / 3, dw = (e - w) / 3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    await pesquisarQuadrado([s + i * ds, s + (i + 1) * ds, w + j * dw, w + (j + 1) * dw]);
}

// ---------- 2. ler cada anúncio da zona ----------
const daZona = t => { const m = sa(t).match(/ em ([a-z ]+?) \|/); return m ? TERRAS.has(m[1].trim()) : true; };
// lê um anúncio: tudo da PÁGINA (o texto dos cartões muda com o tipo de pesquisa; o do mapa não traz nota nem terra)
async function ler(id, texto = '') {
  await page.goto(`https://www.airbnb.pt/rooms/${id}`, { timeout: 45000 }); await pausa(4500);
  try { await page.keyboard.press('Escape'); } catch {}
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 2500); await pausa(400); } // a secção do anfitrião e as avaliações carregam ao descer
  const t = await page.evaluate(() => document.body.innerText);
  const al = (t.match(/\b(\d{2,7})\s?\/\s?AL\b/i) || [])[1];
  // turismo rural e de habitação: o Airbnb mostra o nº do RNET em "Dados do registo"
  const rnet = !al ? (t.match(/\b(\d{2,6})\s?\/\s?RNET\b/i) || t.match(/Dados do registo\s*\n?\s*(\d{2,6})\b/i) || [])[1] : null;
  const datas = [...t.matchAll(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de (20\d\d)/gi)]
    .map(m => `${m[2]}-${String(MESES[m[1].toLowerCase()]).padStart(2, '0')}`).sort();
  const nota = t.match(/(\d,\d{1,2})\s*·?\s*\n?\s*(\d+)\s+avalia/) || texto.match(/(\d,\d{1,2}) \((\d+)\)/);
  const a = {
    url: `https://www.airbnb.pt/rooms/${id}`,
    titulo: (await page.title()).split(' - ')[0],
    // "Alojamento inteiro: casa em Vilarinho dos Freires, Portugal" / "Quarto em hotel boutique em Canelas"
    tipo: (t.match(/^(?:Alojamento inteiro: |Quarto (?:na seguinte localização: |em )?)?[^\n]{0,40}? em [^\n]{2,60}$/m) || [''])[0].trim(),
    nota: nota ? Number(nota[1].replace(',', '.')) : null,
    avaliacoes: nota ? Number(nota[2]) : 0,
    novo: /\bNovo\b/.test(texto) || /^Novo$/m.test(t),
    anfitriao: /Anfitrião profissional/i.test(t + texto) ? 'profissional' : /Anfitrião particular/i.test(t + texto) ? 'particular' : null,
    ...anfitriaoDe(t),
    al: al || null,
    ultima_avaliacao: datas.at(-1) || null,
    v2: true,
  };
  if (!a.anfitriao_chave) a.anfitriao_chave = null;
  const limite = new Date(); limite.setMonth(limite.getMonth() - 12);
  a.ativa = a.novo || !a.avaliacoes || (a.ultima_avaliacao ? a.ultima_avaliacao >= limite.toISOString().slice(0, 7) : true);
  a.registo = al ? porAL.get(al) || null : rnet ? porRNET.get(rnet) || null : null;
  if (rnet) a.rnet = rnet;
  out.anuncios[id] = a; grava();
  console.log(id, '|', a.titulo.slice(0, 40), '|', a.nota ?? '-', `(${a.avaliacoes})`, '|', a.tipo.slice(0, 40), '| AL', a.al || '?', a.registo ? '→ ' + a.registo : '', '|', a.anfitriao_chave || '-', a.ativa ? '' : 'PARADA');
}
for (const [id, texto] of cartoes) {
  if (out.anuncios[id] || !daZona(texto)) continue;
  try { await ler(id, texto); } catch (e) { console.log(id, 'ERRO', e.message.slice(0, 60)); }
}
// node ferramentas/airbnb.mjs "<Concelho>" --reler : relê os anúncios do concelho (ligados ao registo ou sem nº AL) lidos com a versão antiga
if (process.argv.includes('--reler'))
  for (const [id, a] of Object.entries(out.anuncios)) {
    if (a.v2 || (a.al && !a.registo)) continue;
    try { await ler(id); } catch (e) { console.log(id, 'ERRO', e.message.slice(0, 60)); }
  }
out.pesquisa_feita = true; grava();
await browser.close();

const an = Object.values(out.anuncios);
console.log(`\n${concelho}: ${an.length} anúncios lidos · ativos ${an.filter(a => a.ativa).length} · com nº AL ${an.filter(a => a.al).length} · ligados ao registo ${an.filter(a => a.registo).length}`);
console.log('->', path.relative(process.cwd(), fSaida));
