// Antes de dar uma casa como PARADA: pesquisar o nome na web e abrir qualquer anúncio que apareça.
// Casas do REGISTO sem plataforma mas com Facebook/Instagram com seguidores (50+) também contam como ativas
// (decisão do Diogo, 23/10/2026: não é preciso publicar com frequência, basta ter redes com seguidores).
// Apanha as casas que o Booking e o Airbnb não mostraram na pesquisa do concelho (anúncio com outro nome, cheias,
// noutra plataforma: Vrbo, Hostelworld) — na Régua, 52 casas foram dadas como paradas sem esta pesquisa.
//   node ferramentas/paradas.mjs "<Concelho>"
// Lê data/por-verificar-<concelho>.json (o montar.js escreve-o: casas do registo sem anúncio ativo, e casas
// descobertas no Google Maps ou na lista da Câmara). Escreve data/paradas-<concelho>.json. Retoma se parar.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { pesquisar } from './lib/pesquisar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/paradas.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.toLowerCase().replace(/\s+/g, '-');
const lista = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `por-verificar-${nomeF}.json`), 'utf8'));
const fSaida = path.join(RAIZ, 'data', `paradas-${nomeF}.json`);
const out = fs.existsSync(fSaida) ? JSON.parse(fs.readFileSync(fSaida, 'utf8')) : {};
const grava = () => fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));

const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const GENERICAS = /^(casa|casas|quinta|hotel|rural|alojamento|local|the|das|dos|guest|house|home|villa|vila|douro|valley|apartamento|apartamentos|suites|rooms|stay|portugal|regua|peso)$/;
const distintas = s => sa(s).replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 2 && !GENERICAS.test(w));
const MESES = { janeiro: 1, fevereiro: 2, 'março': 3, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };
const limite = (() => { const d = new Date(); d.setMonth(d.getMonth() - 12); return d.toISOString().slice(0, 7); })();

const { chromium } = createRequire(path.join(RAIZ, 'package.json'))('playwright-core');
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: false, args: ['--headless=new', '--disable-blink-features=AutomationControlled'] });
const page = await browser.newPage({ locale: 'pt-PT', viewport: { width: 1366, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' });
const pausa = ms => page.waitForTimeout(ms);

// abre um anúncio e lê o que prova atividade
async function ler(url) {
  try { await page.goto(url, { timeout: 45000 }); await pausa(4500); try { await page.keyboard.press('Escape'); } catch {} } catch { return null; }
  const t = await page.evaluate(() => document.body.innerText).catch(() => '');
  if (/Bot or Not|captcha|are you a robot|não é um robô/i.test(t.slice(0, 3000) + (await page.title()))) return null; // página anti-robô: não prova nada
  // o h1 é o nome do anúncio; o título da página às vezes é genérico ("Airbnb: alojamentos de férias…")
  const titulo = ((await page.locator('h1').first().innerText().catch(() => '')) || (await page.title()).split(/ - | \| |, /)[0]).trim();
  if (/booking\.com/.test(url)) {
    if (/^Booking\.com/.test(titulo) || !/\/hotel\//.test(page.url())) return null;
    const rs = await page.locator('[data-testid="review-score-component"]').first().innerText().catch(() => '');
    const nota = rs.match(/(\d{1,2},\d)/)?.[1];
    const morada = (await page.locator('[data-testid="PropertyHeaderAddressDesktop-wrapper"]').first().innerText().catch(() => '')).split('\n')[0].trim();
    const ll = ((await page.content().catch(() => '')).match(/data-atlas-latlng="(-?[\d.]+),(-?[\d.]+)"/) || []).slice(1).map(Number);
    return { nome: 'Booking', titulo, morada, lat: ll[0], lng: ll[1], url: url.split('?')[0], nota: nota ? Number(nota.replace(',', '.')) : null,
      avaliacoes: Number((rs.match(/([\d.\s ]+)\s+coment/) || [])[1]?.replace(/\D/g, '') || 0),
      ativa: !/já não aceita reservas|deixou de aceitar reservas|não está a aceitar reservas/i.test(t) };
  }
  if (/airbnb\./.test(url)) {
    const m = t.match(/(\d,\d{1,2})\s*·?\s*\n?\s*(\d+)\s+avalia/);
    const datas = [...t.matchAll(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de (20\d\d)/gi)]
      .map(x => `${x[2]}-${String(MESES[x[1].toLowerCase()]).padStart(2, '0')}`).sort();
    const avaliacoes = m ? Number(m[2]) : 0, ultima = datas.at(-1) || null;
    if (/não está disponível|não foi encontrad|page not found/i.test(t) && !m) return null;
    const h = await page.content().catch(() => '');
    const lat = Number((h.match(/"latitude":\s*(-?\d+\.\d+)/) || [])[1]) || undefined, lng = Number((h.match(/"longitude":\s*(-?\d+\.\d+)/) || [])[1]) || undefined;
    const tipo = (t.match(/^(?:Alojamento inteiro: |Quarto (?:na seguinte localização: |em )?)?[^\n]{0,40}? em [^\n]{2,60}$/m) || [''])[0].trim();
    return { nome: 'Airbnb', titulo, tipo, lat, lng, url: url.split('?')[0].replace(/airbnb\.[a-z.]+/, 'airbnb.pt'), nota: m ? Number(m[1].replace(',', '.')) : null,
      avaliacoes, ultima, ativa: !avaliacoes || !ultima || ultima >= limite };
  }
  // Vrbo, Hostelworld, Expedia: conta se a página abre e fala da casa
  return { nome: /vrbo/.test(url) ? 'Vrbo' : /hostelworld/.test(url) ? 'Hostelworld' : 'Expedia', titulo, url: url.split('?')[0],
    ativa: !/no longer available|já não está disponível|indisponível|not found/i.test(t) };
}

if (process.argv.includes('--moradas')) {
  for (const x of Object.values(out)) for (const a of x.achados || []) {
    if ((a.nome === 'Booking' || a.nome === 'Airbnb') && a.ativa && a.lat == null) { const b = await ler(a.url); if (b) { Object.assign(a, { morada: b.morada ?? a.morada, lat: b.lat, lng: b.lng, tipo: b.tipo ?? a.tipo }); if (!/^(Airbnb|Booking)/.test(b.titulo)) a.titulo = b.titulo; } grava(); console.log(a.titulo, '|', a.lat, a.lng); }
    if (a.nome === 'Expedia' && /Bot or Not/i.test(a.titulo)) { a.ativa = false; a.robo = true; }
  }
  for (const x of Object.values(out)) { x.ativa = (x.achados || []).some(a => a.ativa); }
  grava();
}
// Facebook/Instagram da casa: uma pesquisa para cada; a página tem de ter TODAS as palavras distintivas do nome
// (a "Colina do Sol" apanhava uma clínica por causa de "sol"); abre-se a página e lêem-se os seguidores e a
// descrição ("Casa do Coelhal, Régua, 564 seguidores"), que tem de falar do sítio.
const MIN_SEGUIDORES = 50;
const numero = (n, mil) => Math.round(Number(String(n).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')) * (mil ? 1000 : 1));
async function lerRede(url) {
  try { await page.goto(url, { timeout: 45000 }); await pausa(4000); } catch { return null; }
  try { await page.getByRole('button', { name: /Recusar|Permitir todos|Fechar|Decline|Allow all/i }).first().click({ timeout: 2500 }); await pausa(1200); } catch {}
  const t = await page.evaluate(() => document.body.innerText).catch(() => '');
  const meta = await page.evaluate(() => document.querySelector('meta[property="og:description"], meta[name="description"]')?.content || '').catch(() => '');
  const titulo = await page.title().catch(() => '');
  const m = `${meta} ${t}`.match(/([\d.,]+)\s*(mil\s*)?(seguidores|followers|gostos|likes)/i);
  return { seguidores: m ? numero(m[1], m[2]) : null, texto: `${titulo} ${meta}`.slice(0, 400) };
}
async function redesDe(c) {
  const local = c.localidade && sa(c.localidade) !== sa(concelho) ? c.localidade : concelho;
  const ws = distintas(c.nome);
  if (!ws.length) return { q: '(nome sem palavras distintivas)', redes: [] };
  const sitio = [sa(concelho), sa(concelho).replace(/^peso da /, ''), sa(c.localidade), 'douro'].map(x => x.trim()).filter(x => x.length > 3);
  const achadas = new Map();
  for (const rede of ['facebook', 'instagram']) {
    const r = await pesquisar(`"${c.nome}" ${local} ${rede}`);
    for (const x of r?.resultados || []) {
      if (!new RegExp(`${rede}\\.com/`).test(x.url) || /\/(posts|photos|videos|events|groups|reel|reels|p|mentions|share)\b/.test(x.url)) continue;
      const t = sa(`${x.titulo} ${x.url}`).replace(/[^a-z0-9]/g, '');
      if (!ws.every(w => t.includes(w))) continue;
      const base = x.url.split('?')[0].replace(/\/(about|reels|mentions|photos)\/?$/, '/');
      if (!achadas.has(base)) achadas.set(base, rede === 'facebook' ? 'Facebook' : 'Instagram');
    }
  }
  const out = [];
  for (const [url, nome] of [...achadas].slice(0, 3)) {
    const l = await lerRede(url);
    if (!l) continue;
    if (!sitio.some(z => sa(l.texto).includes(z))) { out.push({ nome, url, seguidores: l.seguidores, rejeitada: 'não fala do sítio' }); continue; }
    out.push({ nome, url, seguidores: l.seguidores });
  }
  return { q: `"${c.nome}" ${local} facebook / instagram`, redes: out };
}
// node ferramentas/paradas.mjs "<Concelho>" --redes : procura as redes das casas do registo já dadas como paradas
if (process.argv.includes('--redes')) {
  for (const [id, x] of Object.entries(out)) {
    if (x.ativa || /^(mp|cm)-/.test(id) || (x.redes_procuradas === 2)) continue;
    const c = lista.find(v => v.id === id); if (!c) continue;
    const rr = await redesDe(c);
    if (!rr) continue;
    x.redes_procuradas = 2; x.redes_encontradas = rr.redes; x.verificacao = x.verificacao.replace(/; redes \(.*$/, '');
    x.redes_ativas = rr.redes.filter(r => !r.rejeitada && (r.seguidores || 0) >= MIN_SEGUIDORES);
    x.verificacao += `; redes (${rr.q}): ${rr.redes.length ? rr.redes.map(r => `${r.nome} ${r.seguidores ?? '?'} seguidores${r.rejeitada ? ' (' + r.rejeitada + ')' : ''}`).join(', ') : 'nenhuma'}`;
    grava(); console.log(id, c.nome, '|', rr.redes.map(r => `${r.nome} ${r.seguidores ?? '?'} ${r.url}${r.rejeitada ? ' (' + r.rejeitada + ')' : ''}`).join(' ; ') || 'sem redes');
  }
}
for (const c of lista) {
  if (out[c.id]) continue;
  const q = `"${c.nome}" ${c.localidade && sa(c.localidade) !== sa(concelho) ? c.localidade + ' ' : ''}${concelho}`;
  const r = await pesquisar(q);
  if (!r) { console.log(c.id, 'pesquisa falhou'); continue; }
  const ws = [...new Set([c.nome, ...(c.nomes || [])].flatMap(distintas))];
  // só anúncios cujo endereço ou título tenha uma palavra distintiva da casa
  const plat = r.resultados.filter(x => /booking\.com\/hotel\/pt\/|airbnb\.[a-z.]+\/rooms\/|vrbo\.com\/\d|hostelworld\.com\/(pwa\/)?hosteldetails|expedia\.[a-z.]+\/.*\.h\d+/.test(x.url)
    && (!ws.length || ws.some(w => sa(x.url + ' ' + x.titulo).replace(/[^a-z0-9]/g, '').includes(w))));
  const achados = [];
  for (const x of plat.slice(0, 4)) { const a = await ler(x.url); if (a) achados.push(a); }
  const redes = r.urls.filter(u => /facebook\.com\/(?!sharer)|instagram\.com\//.test(u)).slice(0, 2);
  const ativa = achados.find(a => a.ativa);
  out[c.id] = { q, motor: r.motor, achados, redes, ativa: !!ativa,
    verificacao: `pesquisa ${r.motor} ${q}: ${achados.length ? achados.map(a => `${a.nome} ${a.ativa ? 'ativo' : 'parado'}${a.nota != null ? ' ' + a.nota : ''}${a.avaliacoes ? ` (${a.avaliacoes})` : ''}`).join(', ') : 'nenhum anúncio em plataforma'}${redes.length ? '; redes: ' + redes.join(', ') : ''}` };
  if (!out[c.id].ativa && !/^(mp|cm)-/.test(c.id)) {
    const rr = await redesDe(c);
    if (rr) {
      out[c.id].redes_procuradas = 2; out[c.id].redes_encontradas = rr.redes;
      out[c.id].redes_ativas = rr.redes.filter(r => !r.rejeitada && (r.seguidores || 0) >= MIN_SEGUIDORES);
      out[c.id].verificacao += `; redes (${rr.q}): ${rr.redes.length ? rr.redes.map(r => `${r.nome} ${r.seguidores ?? '?'} seguidores${r.rejeitada ? ' (' + r.rejeitada + ')' : ''}`).join(', ') : 'nenhuma'}`;
    }
  }
  grava();
  console.log(c.id, c.nome, '|', out[c.id].verificacao);
}
await browser.close();
const v = Object.values(out);
console.log(`\n${v.length} verificadas · afinal ativas ${v.filter(x => x.ativa).length} · paradas ${v.filter(x => !x.ativa).length}`);
