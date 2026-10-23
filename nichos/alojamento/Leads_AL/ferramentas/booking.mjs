// Casas ativas no Booking num concelho, cruzadas com o registo oficial.
//   node ferramentas/booking.mjs "São Pedro do Sul"        (precisa de data/candidatos-<concelho>.json, do rnal.js)
// Escreve data/booking-<concelho>.json:
//   anuncios: cada página do Booking lida (nota, avaliações, morada, código postal, ativa, id do registo associado)
//   candidatos: por id do registo, o anúncio associado (ou null)
// Três fontes de anúncios, porque nenhuma chega sozinha:
//   1. a lista do concelho SEM datas, carregada até ao fim (mostra todas as casas, com ou sem vaga: é a conta de controlo,
//      "Peso da Régua: 116 alojamentos encontrados"), e a mesma pesquisa em 12 datas ao longo do ano, que dá o PREÇO de 1 noite;
//   2. as páginas fixas por localidade (booking.com/city/pt/<terra>.html);
//   3. o endereço deduzido do nome de cada casa do registo (casa-archie, alojamento-romano...).
// "Ativa" = a página existe e não diz que já não aceita reservas. Um anúncio novo, sem avaliações, também é ativo.
// De cada página guarda também: preço típico de 1 noite (mediana das datas), "gerido por"/anfitrião profissional (gestoras),
// um pedaço da descrição (para o sub-nicho: vinho, eventos, piscina...) e se tem dormitórios e quartos privados (hostels).
// Fronteira: um anúncio é do concelho se o código postal é de cá E a morada fala do concelho ou de uma terra dele.
// Retoma se parar: o que já foi lido fica no ficheiro.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/booking.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.toLowerCase().replace(/\s+/g, '-');
const fCand = path.join(RAIZ, 'data', `candidatos-${nomeF}.json`);
const fSaida = path.join(RAIZ, 'data', `booking-${nomeF}.json`);
const { candidatos } = JSON.parse(fs.readFileSync(fCand, 'utf8'));
const out = fs.existsSync(fSaida) ? JSON.parse(fs.readFileSync(fSaida, 'utf8')) : { concelho, anuncios: {}, slugs_testados: {} };
const grava = () => fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));

const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugDe = s => sa(s).replace(/["“”'’´`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const cpDe = s => (String(s).match(/\b(\d{4})-\d{3}\b/) || [])[1];
// prefixos de código postal do concelho (dos candidatos), para saber se um anúncio é de cá
const CPS = new Set(candidatos.map(c => cpDe(c.morada)).filter(Boolean));
// terras do concelho (o próprio e as localidades do registo), para os códigos postais partilhados com concelhos vizinhos
const TERRAS = [...new Set([concelho, ...candidatos.map(c => c.localidade)].map(sa).map(t => t.trim()).filter(t => t.length > 3))];
// códigos postais completos do registo (um 4 dígitos pode servir dois concelhos: o 5040 é da Régua e de Mesão Frio)
const CP7 = new Set(candidatos.map(c => (String(c.morada).match(/\b\d{4}-\d{3}\b/) || [])[0]).filter(Boolean));

const { chromium } = createRequire(path.join(RAIZ, 'package.json'))('playwright-core');
// contorno oficial do concelho: um anúncio é de cá se as coordenadas caírem dentro (ver lib/concelho.js)
const CONC_LIB = createRequire(import.meta.url)('./lib/concelho.js');
const GEO = await CONC_LIB.poligono(concelho).catch(() => null);
// Chrome invisível no modo novo: o modo antigo é detetado e o Booking devolve as pesquisas vazias
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: false, args: ['--headless=new', '--disable-blink-features=AutomationControlled'] });
const page = await browser.newPage({ locale: 'pt-PT', viewport: { width: 1366, height: 900 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' });
const pausa = ms => page.waitForTimeout(ms);
async function ir(url) {
  for (let t = 0; t < 2; t++) {
    try { await page.goto(url, { timeout: 45000 }); await page.waitForLoadState('load').catch(() => {}); await pausa(2200); return true; }
    catch { await pausa(4000); }
  }
  return false;
}
const slugDoUrl = u => (u.match(/\/hotel\/pt\/([^.?#/]+)/) || [])[1];

// ---------- 1. pesquisa em 12 datas ----------
async function destId() {
  if (process.argv[3]) { out.dest_id = process.argv[3]; out.dest_type = 'city'; } // código do destino, se a caixa de pesquisa falhar
  if (out.dest_id) return out.dest_id;
  const li = page.locator('[data-testid="autocomplete-results-options"] li');
  for (let t = 0; t < 3 && !out.dest_id; t++) {
    try {
      await ir('https://www.booking.com/index.pt-pt.html');
      for (let i = 0; i < 2; i++) { try { await page.keyboard.press('Escape'); await pausa(400); } catch {} }
      const box = page.locator('input[name="ss"]');
      await box.click({ timeout: 8000 }); await box.fill('');
      await box.pressSequentially(concelho, { delay: 60 });
      await li.first().waitFor({ timeout: 10000 }); await pausa(1200);
      const textos = await li.evaluateAll(ls => ls.map(l => l.innerText));
      const k = Math.max(0, textos.findIndex(t => /portugal/i.test(t)));
      await li.nth(k).click(); await pausa(800);
      try { await page.keyboard.press('Escape'); } catch {}
      await page.locator('button[type="submit"]').first().click(); await pausa(4000);
      const u = new URL(page.url());
      out.dest_id = u.searchParams.get('dest_id'); out.dest_type = u.searchParams.get('dest_type');
    } catch { await pausa(3000); }
  }
  if (!out.dest_id) throw new Error('Não consegui o código do destino no Booking: passa-o à mão (node ferramentas/booking.mjs "<Concelho>" <dest_id>)');
  grava();
  return out.dest_id;
}
const novos = new Set();
let cookies = false;
// Carrega a lista toda: o Booking só mostra 25 de cada vez e vai acrescentando à medida que se desce a página
async function carregarTudo(url) {
  if (!(await ir(url))) return { h1: '', cartoes: [] };
  if (!cookies) { try { await page.locator('#onetrust-reject-all-handler, button:has-text("Recusar")').first().click({ timeout: 5000 }); cookies = true; } catch {} await pausa(800); }
  try { await page.keyboard.press('Escape'); } catch {}
  let ant = 0, parado = 0;
  for (let i = 0; i < 60 && parado < 4; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pausa(1800);
    await page.mouse.wheel(0, -800); await pausa(400); await page.mouse.wheel(0, 1600); await pausa(1200);
    const mais = page.locator('button:has-text("Carregar mais"), button:has-text("Load more"), button:has-text("Mostrar mais")');
    if (await mais.count()) { try { await mais.first().click({ timeout: 4000 }); } catch {} await pausa(2000); }
    const n = await page.locator('[data-testid="property-card"]').count();
    parado = n === ant ? parado + 1 : 0; ant = n;
  }
  return page.evaluate(() => ({
    h1: document.querySelector('h1')?.innerText || '',
    cartoes: [...document.querySelectorAll('[data-testid="property-card"]')].map(c => ({
      href: c.querySelector('a[data-testid="title-link"]')?.href || '',
      preco: (c.querySelector('[data-testid="price-and-discounted-price"]')?.innerText || '').replace(/[^\d]/g, ''),
    })),
  })).catch(() => ({ h1: '', cartoes: [] }));
}
async function pesquisas() {
  if (out.pesquisa_feita) return;
  const id = await destId();
  out.precos = out.precos || {};
  // sem datas: todas as casas do destino (conta de controlo)
  const base = `https://www.booking.com/searchresults.pt-pt.html?dest_id=${id}&dest_type=${out.dest_type}&lang=pt-pt`;
  const r0 = await carregarTudo(base);
  out.total_booking = Number((r0.h1.match(/([\d.\s]+)\s+alojamentos?/) || [])[1]?.replace(/\D/g, '')) || null;
  for (const c of r0.cartoes) { const s = slugDoUrl(c.href); if (s && !out.anuncios[s]) novos.add(s); }
  console.log(`sem datas: "${r0.h1}" · ${r0.cartoes.length} cartões`);
  // 12 datas: casas a mais (raro) e o preço de 1 noite para 2 pessoas
  const f = d => d.toISOString().slice(0, 10);
  for (let m = 0; m < 12; m++) {
    const d = new Date(); d.setMonth(d.getMonth() + m + 1); d.setDate(m % 2 ? 6 : 16);
    const e = new Date(d); e.setDate(e.getDate() + 1);
    const r = await carregarTudo(`${base}&checkin=${f(d)}&checkout=${f(e)}&group_adults=2&no_rooms=1`);
    let n = 0;
    for (const c of r.cartoes) {
      const s = slugDoUrl(c.href); if (!s) continue;
      if (!out.anuncios[s] && !novos.has(s)) { novos.add(s); n++; }
      if (c.preco) (out.precos[s] = out.precos[s] || []).push(Number(c.preco));
    }
    console.log(`pesquisa ${f(d)}: ${r.cartoes.length} cartões, ${n} novos`);
  }
}
const mediana = a => { if (!a?.length) return null; const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };

// ---------- 2. páginas por localidade ----------
async function paginasLocalidade() {
  if (out.localidades_feitas) return;
  const terras = [...new Set([concelho, ...candidatos.map(c => c.localidade)].map(slugDe).filter(Boolean))];
  for (const t of terras) {
    if (!(await ir(`https://www.booking.com/city/pt/${t}.pt-pt.html`))) continue;
    if (!/\/city\/pt\//.test(page.url())) continue;
    // terras com nomes comuns (Pinho, Sul, Souto…) têm páginas noutros concelhos: só conta a que fala deste
    const doConcelho = await page.evaluate(c => document.body.innerText.slice(0, 4000).toLowerCase().includes(c.toLowerCase()), concelho).catch(() => false);
    if (!doConcelho) continue;
    for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 4000); await pausa(500); }
    const hrefs = await page.$$eval('a[href*="/hotel/pt/"]', as => as.map(a => a.href)).catch(() => []);
    let n = 0;
    for (const h of hrefs) { const s = slugDoUrl(h); if (s && !out.anuncios[s] && !novos.has(s)) { novos.add(s); n++; } }
    if (n) console.log(`localidade ${t}: ${n} novos`);
  }
}

// ---------- ler um anúncio ----------
async function ler(slug) {
  if (out.anuncios[slug]) return out.anuncios[slug];
  if (!(await ir(`https://www.booking.com/hotel/pt/${slug}.pt-pt.html`))) return null;
  if (slugDoUrl(page.url()) !== slug && !/\/hotel\/pt\//.test(page.url())) return null;
  const r = await page.evaluate(() => {
    const t = s => document.querySelector(s)?.innerText || '';
    const titulo = document.querySelector('h2.pp-header__title, [data-testid="property-header"] h2')?.innerText || document.title.split(',')[0];
    if (/^Booking\.com/.test(titulo)) return null; // endereço que não existe: o Booking manda para a página inicial
    const rs = t('[data-testid="review-score-component"]');
    const nota = rs.match(/(\d{1,2},\d)/)?.[1];
    const aval = rs.match(/([\d.\s ]+)\s+coment/)?.[1];
    const corpo = document.body.innerText;
    return {
      nome: titulo.trim(),
      nota: nota ? Number(nota.replace(',', '.')) : null,
      avaliacoes: aval ? Number(aval.replace(/\D/g, '')) : 0,
      morada: t('[data-testid="PropertyHeaderAddressDesktop-wrapper"]').split('\n')[0].trim(),
      ativa: !/já não aceita reservas|deixou de aceitar reservas|não está a aceitar reservas|no longer accepting/i.test(corpo),
      novo: /Novo no Booking|Novo alojamento/i.test(corpo),
      // gestoras: o Booking diz quem gere (empresa) e se o anfitrião é profissional (obrigatório na UE desde 2024)
      // "Gerido por <empresa>"; "gerido por um anfitrião profissional/particular" não é nome (vai para "profissional")
      gerido_por: [...corpo.matchAll(/(?:Gerido|Gerida|Operado|Operada) por:?\s*([^\n]{2,60})/gi)].map(m => m[1].trim()).find(n => !/^uma? anfitri|^um particular|^uma empresa/i.test(n)) || null,
      profissional: /anfitri[ãa][oa] profissional|professional host/i.test(corpo) ? true : /anfitri[ãa][oa] particular|private host/i.test(corpo) ? false : null,
      descricao: (document.querySelector('[data-testid="property-description"]')?.innerText || '').slice(0, 800),
      dormitorio: /dormit[óo]rio|dormitory|cama em quarto partilhado/i.test(corpo),
      quartos_privados: /Quarto (Duplo|Twin|Individual|Familiar|Triplo|Standard|Superior)|Suite|Suíte|Double Room|Private room/i.test(corpo),
    };
  }).catch(() => null);
  if (!r) return null;
  r.url = `https://www.booking.com/hotel/pt/${slug}.pt-pt.html`;
  const ll = ((await page.content().catch(() => '')).match(/data-atlas-latlng="(-?[\d.]+),(-?[\d.]+)"/) || []).slice(1).map(Number);
  if (ll.length === 2) [r.lat, r.lng] = ll;
  r.cp = cpDe(r.morada);
  // código postal de cá e a morada fala do concelho ou de uma terra dele (o 5040 é da Régua e de Mesão Frio)
  // a terra que vem logo a seguir ao código postal ("5040-444 Mesão Frio") tem de ser deste concelho
  const terraCP = sa((r.morada.match(/\b\d{4}-\d{3}\s+([^,]+)/) || [])[1] || '').trim();
  r.do_concelho = GEO && r.lat != null ? CONC_LIB.dentro(GEO, r.lat, r.lng)
    : r.cp ? CPS.has(r.cp) && (terraCP ? TERRAS.includes(terraCP) : CP7.has((r.morada.match(/\b\d{4}-\d{3}\b/) || [])[0])) : null;
  r.preco = mediana(out.precos?.[slug]);
  out.anuncios[slug] = r; grava();
  return r;
}

// ---------- 3. endereço deduzido do nome ----------
function variantes(nome) {
  const b = slugDe(nome);
  const sem = b.replace(/^(casa|quinta|hotel|alojamento-local|alojamento|casa-de-hospedes|hospedaria|residencial|pensao)-(d[aeo]s?-)?/, '');
  return [...new Set([b, `${b}-${slugDe(concelho)}`, sem, b.replace(/-d[aeo]s?-/g, '-'), `${sem}-${slugDe(concelho)}`])].filter(v => v.length > 3);
}

// ---------- cruzar anúncio com registo ----------
// Palavras que não distinguem uma casa de outra: com elas, "Casa do Rio" ligava-se à "Casa Rio Contença"
// e "The Fox House - Private Villa" à "Villa do Banho".
const GENERICAS = /^(casa|casas|quinta|quintinha|hotel|rural|alojamento|local|the|das|dos|del|guest|house|houses|home|villa|vila|nature|natureza|spa|termas|thermas|sao|pedro|sul|rio|serra|montanha|turismo|apartamento|apartamentos|suites|rooms|private|stay|lodge|hostel|residencial|hospedaria|pensao|aldeia|portugal)$/;
const palavras = s => sa(s).replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 2 && !GENERICAS.test(w));
const cpCompleto = s => (String(s).match(/\b\d{4}-\d{3}\b/) || [])[0];
function associar(an) {
  const pa = palavras(an.nome);
  if (!pa.length) return null; // nome só com palavras genéricas: não se adivinha
  let melhor = null, pmax = 0, empate = false;
  for (const c of candidatos) {
    const pc = new Set([...palavras(c.nome), ...(c.unidades || []).flatMap(palavras)]);
    const comuns = pa.filter(w => pc.has(w)).length;
    if (!comuns) continue;
    const p = comuns * 2 + (cpCompleto(an.morada) && cpCompleto(an.morada) === cpCompleto(c.morada) ? 1 : 0);
    if (p > pmax) { pmax = p; melhor = c; empate = false; } else if (p === pmax) empate = true;
  }
  // tem de bater todas as palavras distintivas do anúncio (ou 2 + código postal), e sem empate
  const ok = melhor && !empate && (pmax >= pa.length * 2 || pmax >= 5);
  return ok ? melhor.id : null;
}

// node ferramentas/booking.mjs "<Concelho>" [dest_id] --coords : completa as coordenadas dos anúncios já lidos e refaz o "do concelho"
if (process.argv.includes('--coords')) {
  for (const [slug, a] of Object.entries(out.anuncios)) {
    if (a.lat != null) continue;
    delete out.anuncios[slug];
    const r = await ler(slug);
    if (r) { r.registo = a.registo; r.preco = a.preco ?? r.preco; out.anuncios[slug] = { ...a, ...r }; grava(); console.log(r.nome, '|', r.lat, r.lng, r.do_concelho ? 'cá' : 'FORA'); }
    else out.anuncios[slug] = a;
  }
  grava();
}
await pesquisas(); out.pesquisa_feita = true; grava();
await paginasLocalidade(); out.localidades_feitas = true; grava();
for (const s of novos) { const r = await ler(s); console.log('anúncio', s, '=>', r ? `${r.nome} | ${r.nota ?? '-'} (${r.avaliacoes}) | ${r.cp || '?'} ${r.do_concelho ? '' : '(fora)'}` : 'não abriu'); }

// para cada casa do registo ainda sem anúncio, tentar o endereço pelo nome
const jaAssociados = () => new Set(Object.values(out.anuncios).map(a => a.registo).filter(Boolean));
for (const a of Object.values(out.anuncios)) if (a.registo === undefined) a.registo = associar(a);
for (const c of candidatos.filter(c => !c.pequena)) {
  if (jaAssociados().has(c.id)) continue;
  for (const v of variantes(c.nome)) {
    if (out.slugs_testados[v] !== undefined) continue;
    const r = await ler(v);
    out.slugs_testados[v] = !!r; grava();
    if (r && r.do_concelho !== false) { r.registo = associar(r) || c.id; console.log('pelo nome', c.nome, '=>', r.nome, r.nota, `(${r.avaliacoes})`); break; }
  }
}
for (const a of Object.values(out.anuncios)) if (a.registo === undefined) a.registo = associar(a);
for (const [s, a] of Object.entries(out.anuncios)) if (a.preco == null && out.precos?.[s]) a.preco = mediana(out.precos[s]);
out.candidatos = Object.fromEntries(candidatos.map(c => [c.id, Object.entries(out.anuncios).find(([, a]) => a.registo === c.id)?.[0] || null]));
grava();
await browser.close();

const an = Object.values(out.anuncios).filter(a => a.do_concelho !== false);
console.log(`\n${concelho}: ${an.length} anúncios do concelho · ativos ${an.filter(a => a.ativa).length} · associados ao registo ${an.filter(a => a.registo).length} · sem registo associado ${an.filter(a => !a.registo).length}`);
// conta de controlo: o Booking diz quantas casas tem o destino (o destino pode incluir vizinhos: por isso é um teto, não o alvo)
if (out.total_booking) console.log(`controlo: o Booking diz ${out.total_booking} alojamentos no destino; lidos ${Object.keys(out.anuncios).length} (${an.length} do concelho)${Object.keys(out.anuncios).length < out.total_booking * 0.9 ? ' · FALTAM CASAS: ver se a lista carregou até ao fim' : ''}`);
console.log('->', path.relative(process.cwd(), fSaida));
