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
const nomeF = concelho.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
const lista = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `por-verificar-${nomeF}.json`), 'utf8'));
const fSaida = path.join(RAIZ, 'data', `paradas-${nomeF}.json`);
const out = fs.existsSync(fSaida) ? JSON.parse(fs.readFileSync(fSaida, 'utf8')) : {};
const grava = () => fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));
// anúncios do Airbnb já lidos pelo airbnb.mjs (com a página toda): a leitura deles manda
const AB = (() => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `airbnb-${nomeF}.json`), 'utf8')).anuncios; } catch { return {}; } })();
// nome para pesquisar: sem aspas e sem o número da unidade ("Oliveira Douro Guest House 2" -> "Oliveira Douro Guest House")
const limpo = n => String(n || '').replace(/^"|"$/g, '').replace(/\s*(n\.?º\s*|nº\s*|#\s*)?\d{1,2}\s*$/i, '').replace(/\s+/g, ' ').trim();

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
    const nota = rs.match(/\b(10|\d,\d)\b/)?.[1]; // "9,1" ou "10" (sem vírgula)
    const morada = (await page.locator('[data-testid="PropertyHeaderAddressDesktop-wrapper"]').first().innerText().catch(() => '')).split('\n')[0].trim();
    const ll = ((await page.content().catch(() => '')).match(/data-atlas-latlng="(-?[\d.]+),(-?[\d.]+)"/) || []).slice(1).map(Number);
    return { nome: 'Booking', titulo, morada, lat: ll[0], lng: ll[1], url: url.split('?')[0], nota: nota ? Number(nota.replace(',', '.')) : null,
      avaliacoes: Number((rs.match(/([\d.\s ]+)\s+coment/) || [])[1]?.replace(/\D/g, '') || 0),
      ativa: !/já não aceita reservas|deixou de aceitar reservas|não está a aceitar reservas/i.test(t) };
  }
  if (/airbnb\./.test(url)) {
    // página apagada ("Oh, não! A página que procura já não existe"): não prova nada
    if (/já não existe|Oh, não!|não está disponível|não foi encontrad|page not found|no longer exists/i.test(t.slice(0, 1500))) return { nome: 'Airbnb', titulo, url: url.split('?')[0], ativa: false, apagado: true };
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 2500); await pausa(400); } // as avaliações carregam ao descer
    const t2 = await page.evaluate(() => document.body.innerText).catch(() => t);
    return lerAirbnb(url, t2, titulo);
  }
  // Vrbo e Hostelworld: conta se a página abre e fala da casa. Expedia: a página abre sempre (até de casas fechadas),
  // por isso fica registada mas NÃO prova atividade.
  const plat = /vrbo/.test(url) ? 'Vrbo' : /hostelworld/.test(url) ? 'Hostelworld' : 'Expedia';
  return { nome: plat, titulo, url: url.split('?')[0],
    ativa: plat !== 'Expedia' && !/no longer available|já não está disponível|indisponível|not found/i.test(t), fraca: plat === 'Expedia' || undefined };
}
async function lerAirbnb(url, t, titulo) {
  {
    const m = t.match(/(\d,\d{1,2})\s*·?\s*\n?\s*(\d+)\s+avalia/);
    const datas = [...t.matchAll(/(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de (20\d\d)/gi)]
      .map(x => `${x[2]}-${String(MESES[x[1].toLowerCase()]).padStart(2, '0')}`).sort();
    const avaliacoes = m ? Number(m[2]) : 0, ultima = datas.at(-1) || null;
    if (/não está disponível|não foi encontrad|page not found/i.test(t) && !m) return null;
    const h = await page.content().catch(() => '');
    const lat = Number((h.match(/"latitude":\s*(-?\d+\.\d+)/) || [])[1]) || undefined, lng = Number((h.match(/"longitude":\s*(-?\d+\.\d+)/) || [])[1]) || undefined;
    const tipo = [...t.matchAll(/^(?:Alojamento inteiro: |Quarto (?:na seguinte localização: |em )?)?[^\n]{0,40}? em [^\n]{2,60}$/gm)].map(x => x[0].trim())
      .find(x => !/avalia|estrela|destaque|anúncio|experiência|anfitri|\d,\d/i.test(x)) || '';
    const hospedes = Number((h.match(/"personCapacity":\s*(\d+)/) || [])[1]) || null;
    return { nome: 'Airbnb', titulo, tipo, lat, lng, hospedes, url: url.split('?')[0].replace(/airbnb\.[a-z.]+/, 'airbnb.pt'), nota: m ? Number(m[1].replace(',', '.')) : null,
      avaliacoes, ultima, ativa: !avaliacoes || !ultima || ultima >= limite };
  }
}
// anúncio do Airbnb que o airbnb.mjs já leu: usa essa leitura (a mesma casa não pode estar parada lá e ativa aqui)
const doAirbnbMjs = url => { const id = (url.match(/rooms\/(\d+)/) || [])[1]; const a = id && AB[id]; if (!a || !a.v2) return null;
  return { nome: 'Airbnb', titulo: a.titulo, tipo: a.tipo, lat: a.lat ?? undefined, lng: a.lng ?? undefined, hospedes: a.hospedes ?? undefined, url: a.url,
    nota: a.nota, avaliacoes: a.avaliacoes, ultima: a.ultima_avaliacao, ativa: a.ativa, de_airbnb_mjs: true }; };
const lerAnuncio = async url => doAirbnbMjs(url) || ler(url);

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
// node ferramentas/paradas.mjs "<Concelho>" --reler : relê os anúncios do Airbnb e do Expedia já encontrados com as regras novas
// (páginas apagadas, avaliações carregadas ao descer, leitura do airbnb.mjs, Expedia não prova atividade)
if (process.argv.includes('--reler')) {
  for (const [id, x] of Object.entries(out)) {
    let mudou = false;
    for (let i = 0; i < (x.achados || []).length; i++) {
      const a = x.achados[i];
      if (a.nome !== 'Airbnb' && a.nome !== 'Expedia') continue;
      if (a.nome === 'Expedia') { if (a.ativa) { a.ativa = false; a.fraca = true; mudou = true; } continue; }
      const b = await lerAnuncio(a.url);
      if (!b) continue; // não abriu (rede, anti-robô): fica como estava
      if (b.apagado) { x.achados[i] = { ...a, ativa: false, apagado: true }; mudou = true; console.log(id, a.url, 'página apagada'); }
      else if (b.ativa !== a.ativa || b.avaliacoes !== a.avaliacoes) { x.achados[i] = b; mudou = true; console.log(id, a.url, a.ativa, '->', b.ativa, `(${b.avaliacoes})`); }
      else x.achados[i] = { ...a, lat: b.lat ?? a.lat, lng: b.lng ?? a.lng, hospedes: b.hospedes ?? a.hospedes };
    }
    if (mudou) { x.ativa = x.achados.some(a => a.ativa); x.verificacao = x.verificacao.replace(/^(pesquisa [^:]+:)[^;]*/, (m0, p1) => `${p1} ${x.achados.length ? x.achados.map(a => `${a.nome} ${a.ativa ? 'ativo' : a.apagado ? 'apagado' : a.fraca ? 'sem prova' : 'parado'}${a.nota != null ? ' ' + a.nota : ''}${a.avaliacoes ? ` (${a.avaliacoes})` : ''}`).join(', ') : 'nenhum anúncio em plataforma'}`); }
    grava();
  }
}
const numero = (n, mil) => Math.round(Number(String(n).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')) * (mil ? 1000 : 1));
async function lerRede(url) {
  try { await page.goto(url, { timeout: 45000 }); await pausa(4000); } catch { return null; }
  try { await page.getByRole('button', { name: /Recusar|Permitir todos|Fechar|Decline|Allow all/i }).first().click({ timeout: 2500 }); await pausa(1200); } catch {}
  const t = await page.evaluate(() => document.body.innerText).catch(() => '');
  const meta = await page.evaluate(() => document.querySelector('meta[property="og:description"], meta[name="description"]')?.content || '').catch(() => '');
  const titulo = await page.title().catch(() => '');
  const m = `${meta} ${t}`.match(/([\d.,]+)\s*(mil\s*)?(seguidores|followers|gostos|likes)/i);
  return { seguidores: m ? numero(m[1], m[2]) : null, texto: `${titulo} ${meta} ${t.slice(0, 1500)}` };
}
async function redesDe(c) {
  const local = c.localidade && sa(c.localidade) !== sa(concelho) ? c.localidade : concelho;
  const ws = distintas(c.nome);
  if (!ws.length) return { q: '(nome sem palavras distintivas)', redes: [] };
  const sitio = [sa(concelho), sa(concelho).split(' ').at(-1), sa(c.localidade), 'douro'].map(x => x.trim()).filter(x => x.length > 4 || x === 'douro');
  const achadas = new Map();
  for (const rede of ['facebook', 'instagram']) {
    const r = await pesquisar(`"${limpo(c.nome)}" ${local} ${rede}`);
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
// cada casa: pesquisa-se CADA nome (o do registo e os das outras unidades do titular), sem o número da unidade
const resumo = achados => achados.length ? achados.map(a => `${a.nome} ${a.ativa ? 'ativo' : a.apagado ? 'apagado' : a.fraca ? 'sem prova' : 'parado'}${a.nota != null ? ' ' + a.nota : ''}${a.avaliacoes ? ` (${a.avaliacoes})` : ''}`).join(', ') : 'nenhum anúncio em plataforma';
for (const c of lista) {
  const nomes = [...new Set([c.nome, ...(c.nomes || [])].map(limpo).filter(n => n.length > 2))].slice(0, 4);
  const x = out[c.id] || { qs: [], achados: [], redes: [] };
  if (!x.qs) x.qs = x.q ? [x.q] : [];
  const falta = nomes.filter(n => !x.qs.some(q => q.includes(`"${n}"`)));
  // nada por pesquisar: todos os nomes pesquisados e, se ficou parada, as redes também
  if (!falta.length && (x.ativa || x.redes_procuradas === 2 || /^(mp|cm)-/.test(c.id))) continue;
  let falhou = false;
  for (const n of falta) {
    const q = `"${n}" ${c.localidade && sa(c.localidade) !== sa(concelho) ? c.localidade + ' ' : ''}${concelho}`;
    const r = await pesquisar(q);
    if (!r) { console.log(c.id, 'pesquisa falhou:', q); falhou = true; continue; }
    x.qs.push(q); x.motor = r.motor;
    const ws = [...new Set([c.nome, ...(c.nomes || [])].flatMap(distintas))];
    // só anúncios cujo endereço ou título tenha uma palavra distintiva da casa
    const plat = r.resultados.filter(y => /booking\.com\/hotel\/pt\/|airbnb\.[a-z.]+\/rooms\/|vrbo\.com\/\d|hostelworld\.com\/(pwa\/)?hosteldetails|expedia\.[a-z.]+\/.*\.h\d+/.test(y.url)
      && (!ws.length || ws.some(w => sa(y.url + ' ' + y.titulo).replace(/[^a-z0-9]/g, '').includes(w))));
    for (const y of plat.slice(0, 4)) {
      if (x.achados.some(a => a.url === y.url.split('?')[0] || a.url === y.url)) continue;
      const a = await lerAnuncio(y.url); if (a) x.achados.push(a);
    }
    x.redes = [...new Set([...(x.redes || []), ...r.urls.filter(u => /facebook\.com\/(?!sharer)|instagram\.com\//.test(u)).slice(0, 2)])];
  }
  if (falhou && !x.qs.length) continue;
  x.q = x.qs[0]; x.ativa = x.achados.some(a => a.ativa);
  const redesTxt = (x.verificacao || '').match(/; redes \(.*$/)?.[0] || '';
  x.verificacao = `pesquisa ${x.motor} ${x.qs.join(' / ')}: ${resumo(x.achados)}${x.redes.length ? '; redes: ' + x.redes.join(', ') : ''}${falhou ? '; UMA PESQUISA FALHOU' : ''}${redesTxt}`;
  out[c.id] = x;
  if (!x.ativa && !/^(mp|cm)-/.test(c.id) && x.redes_procuradas !== 2) {
    const rr = await redesDe(c);
    if (rr) {
      x.redes_procuradas = 2; x.redes_encontradas = rr.redes;
      x.redes_ativas = rr.redes.filter(r => !r.rejeitada && (r.seguidores || 0) >= MIN_SEGUIDORES);
      x.verificacao += `; redes (${rr.q}): ${rr.redes.length ? rr.redes.map(r => `${r.nome} ${r.seguidores ?? '?'} seguidores${r.rejeitada ? ' (' + r.rejeitada + ')' : ''}`).join(', ') : 'nenhuma'}`;
    }
  }
  grava();
  console.log(c.id, c.nome, '|', x.verificacao);
}
await browser.close();
const v = Object.values(out);
console.log(`\n${v.length} verificadas · afinal ativas ${v.filter(x => x.ativa).length} · paradas ${v.filter(x => !x.ativa).length}`);
