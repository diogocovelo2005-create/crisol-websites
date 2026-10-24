// Procura a fundo o telefone das casas BOAS (escalão A, B ou gestora) que ainda não têm nenhum.
// Uma casa boa não se perde por uma pesquisa fraca; uma casa fraca sem telefone sai sem esta procura.
//   node ferramentas/contactos.mjs "<Concelho>"
// Lê data/sem-contacto-<concelho>.json (o montar.js escreve-o): [{ id, nome, nomes, gestora?, localidade, site?, email? }].
// Onde procura, por ordem, com CADA nome da casa (registo sem o nº da unidade, anúncios, ficha da Câmara, gestora):
//   1. o site próprio: página inicial e as páginas de contactos/sobre (links tel: e números no texto);
//   2. três pesquisas web por nome ("<nome> <terra> telefone", "<nome> <concelho> contactos", "<nome> facebook"):
//      números nos resumos dos resultados que falam da casa (o Google mostra muitas vezes o telefone do Facebook);
//   3. as páginas desses resultados fora das plataformas (diretórios, páginas da casa), se falarem da casa.
// Volta a procurar quando a casa ganhou um nome novo (outro anúncio, a gestora).
// Escreve data/contactos-<concelho>.json { id: { telefones: [{ numero, fontes }], procurado: [...] } }. Retoma se parar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pesquisar, telefonesEm } from './lib/pesquisar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/contactos.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
const lista = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `sem-contacto-${nomeF}.json`), 'utf8'));
const fSaida = path.join(RAIZ, 'data', `contactos-${nomeF}.json`);
const out = fs.existsSync(fSaida) ? JSON.parse(fs.readFileSync(fSaida, 'utf8')) : {};
const grava = () => fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));
// indicativos fixos da zona (os dos telefones fixos do registo): um fixo de outro indicativo é de outra terra
const { candidatos } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', `candidatos-${nomeF}.json`), 'utf8'));
const INDICATIVOS = new Set(candidatos.flatMap(c => c.telefones.map(t => t.numero.replace(/\D/g, ''))).filter(n => /^2/.test(n)).map(n => n.slice(0, 3)));
const daZona = n => !/^2/.test(n) || !INDICATIVOS.size || INDICATIVOS.has(n.replace(/\D/g, '').slice(0, 3));

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const GENERICAS = /^(casa|casas|quinta|hotel|rural|alojamento|local|the|das|dos|guest|house|home|villa|vila|douro|valley|apartamento|apartamentos|suites|rooms|stay|portugal)$/;
const distintas = s => sa(s).replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 3 && !GENERICAS.test(w));
// páginas onde não vale a pena procurar números (plataformas sem telefone, redes que pedem sessão)
// câmaras e juntas: a lista da Câmara já foi cruzada à parte (camara.mjs), e as páginas delas têm o telefone da própria Câmara
const SEM_TEL = /booking\.|airbnb|vrbo|expedia|hotels?\.com|trivago|kayak|agoda|tripadvisor|instagram|tiktok|youtube|google\.|cm-[a-z-]+\.pt|\.gov\.pt|jf-|freguesia|municipio/i;
async function abrir(u) {
  try { const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-PT' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    return r.ok ? (await r.text()).slice(0, 400000) : ''; } catch { return ''; }
}
const textoDe = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
const telsDe = h => [...new Set([...[...h.matchAll(/href="tel:([^"]+)"/g)].flatMap(m => telefonesEm(m[1])), ...telefonesEm(textoDe(h))])];

// (sem a parte do anúncio depois de " | ": "Oliveira Douro House | Apartamento de um quarto")
const limpo = n => String(n || '').split(' | ')[0].replace(/^"|"$/g, '').replace(/\s*(n\.?º\s*|#\s*)?\d{1,2}\s*$/i, '').replace(/\s+/g, ' ').trim();
for (const c of lista) {
  const nomes = [...new Set([c.nome, ...(c.nomes || [])].map(limpo).filter(n => n.length > 2 && !/^(airbnb|booking)\b/i.test(n)))].slice(0, 5);
  const feitos = out[c.id]?.nomes || (out[c.id] ? [limpo(c.nome)] : []);
  const falta = nomes.filter(n => !feitos.includes(n));
  if (!falta.length && !(c.site && !out[c.id]?.procurado?.some(p => p.startsWith('site'))) && !(c.email && !out[c.id]?.procurado?.some(p => p.includes(c.email)))) continue;
  const ws = [...new Set(nomes.flatMap(distintas))];
  // tem de falar da casa E do sítio (concelho, terra ou Douro): há casas com o mesmo nome noutras terras
  // (só o nome do concelho: terras como Sergude existem noutros concelhos, e "Douro" aparece em todo o lado)
  const sitio = [sa(concelho), sa(concelho).replace(/^peso da /, '')].filter(x => x.length > 3);
  // e de ALOJAMENTO (a "Janela d'Ouro" apanhava o telefone de uma farmácia com o mesmo nome)
  // (e um restaurante ou uma farmácia só conta se a página falar também de dormir)
  const ALOJ = /alojamento|aloj\.|guest ?house|hostel|hotel|apartament|quarto|rooms?\b|suite|turismo rural|tourism|accommodation|booking|airbnb|ferias|holiday|check-in|hosped|dormir|noites|nights/;
  const OUTRO = /farmacia|pharmacy|clinica|saude|restaurante|restaurant|cafe\b|pastelaria|oficina|imobiliaria/;
  const fala = t => { const x = sa(t); return (!ws.length || ws.some(w => x.includes(w))) && sitio.some(z => x.includes(z)) && ALOJ.test(x) && !(OUTRO.test(x) && !/alojamento|guest ?house|accommodation|hosped/.test(x)); };
  const achados = new Map(); const add = (n, f) => { if (daZona(n)) (achados.get(n) || achados.set(n, new Set()).get(n)).add(f); };
  for (const t of out[c.id]?.telefones || []) for (const f of t.fontes) add(t.numero, f);
  const procurado = [...(out[c.id]?.procurado || [])].filter(p => !/^ignorados/.test(p));

  // 1. site próprio
  if (c.site && !procurado.some(p => p.startsWith('site'))) {
    const h = await abrir(c.site);
    for (const n of telsDe(h)) add(n, 'site');
    const links = [...h.matchAll(/href="([^"#]+)"/g)].map(m => { try { return new URL(m[1], c.site).href; } catch { return null; } })
      .filter(u => u && new URL(u).host === new URL(c.site).host && /contact|contato|sobre|about|reserv/i.test(u));
    for (const u of [...new Set(links)].slice(0, 3)) for (const n of telsDe(await abrir(u))) add(n, 'site');
    procurado.push(`site ${new URL(c.site).host}`);
  }
  // 2 e 3. pesquisa web
  const local = c.localidade && sa(c.localidade) !== sa(concelho) ? c.localidade : concelho;
  // e o email da casa (da ficha da Câmara): nas páginas onde aparece, o telefone costuma estar ao lado
  const comEmail = c.email && !procurado.some(p => p.includes(c.email)) ? [`"${c.email}"`] : [];
  for (const q of [...falta.flatMap(n => [`"${n}" ${local} telefone`, `"${n}" ${concelho} contactos`, `"${n}" ${concelho} facebook`]), ...comEmail]) {
    const r = await pesquisar(q);
    if (!r) { procurado.push(`pesquisa "${q}" falhou`); continue; }
    procurado.push(`pesquisa ${r.motor} "${q}"`);
    for (const x of r.resultados) {
      if (SEM_TEL.test(x.url) || telefonesEm(x.texto).length > 3) continue;
      const h = (x.url.match(/\/\/(?:www\.)?([^/]+)/) || [])[1];
      // o mesmo email da casa noutro negócio (o dono tem também uma farmácia, um restaurante…): o telefone chega ao dono
      // (nunca listas de pessoas — sorteios, passatempos, participantes, atas: são dados pessoais publicados, não o contacto da casa)
      const lista = /sorteio|passatempo|giveaway|particip|vencedor|premiad|\bata\b|inscri|lista de/i.test(x.url + ' ' + x.titulo + ' ' + x.texto);
      const fonte = fala(x.titulo + ' ' + x.texto + ' ' + x.url) ? `pesquisa (${h})` : c.email && x.texto.includes(c.email) && !lista && /lda|unipessoal|empresa|loja|farm|restaurante|servi[cç]os|com[eé]rcio|nif|contribuinte/i.test(x.titulo + ' ' + x.texto) ? `outro negócio com o mesmo email da casa (${h})` : null;
      if (fonte) for (const n of telefonesEm(x.texto)) add(n, fonte);
    }
    for (const x of r.resultados.filter(x => x.url && !SEM_TEL.test(x.url) && fala(x.titulo + ' ' + x.url)).slice(0, 2)) {
      const h = await abrir(x.url);
      if (!fala(textoDe(h).slice(0, 20000))) continue;
      const host = (x.url.match(/\/\/(?:www\.)?([^/]+)/) || [])[1];
      // página com 4+ telefones é uma lista de várias casas (ViaMichelin, diretórios): os números não são desta
      const ns = telsDe(h); if (ns.length > 3) { procurado.push(`${host}: lista com ${ns.length} telefones, ignorada`); continue; }
      for (const n of ns) add(n, host);
    }
  }
  const telefones = [...achados].map(([numero, f]) => ({ numero, fontes: [...f] }))
    // um número que só aparece num diretório genérico, sem estar no site nem na pesquisa, fica marcado para confirmar
    .sort((a, b) => b.fontes.length - a.fontes.length);
  out[c.id] = { telefones, procurado, nomes: [...new Set([...feitos, ...falta])], gestora: c.gestora || undefined };
  grava();
  console.log(c.id, c.nome, '|', telefones.length ? telefones.map(t => `${t.numero} (${t.fontes.join('+')})`).join(', ') : 'NENHUM', '|', procurado.length, 'sítios');
}
// o mesmo número em casas diferentes é de um portal ou diretório, não da casa
// (exceto entre casas da MESMA gestora: aí é o telefone dela)
const quem = new Map();
for (const x of Object.values(out)) for (const t of x.telefones) (quem.get(t.numero) || quem.set(t.numero, []).get(t.numero)).push(x.gestora || null);
const repetido = n => { const g = quem.get(n) || []; return g.length > 1 && !(g[0] && g.every(y => y === g[0])); };
for (const x of Object.values(out)) {
  const rep = x.telefones.filter(t => repetido(t.numero) && !t.fontes.includes('site'));
  if (rep.length) { x.telefones = x.telefones.filter(t => !rep.includes(t)); x.procurado.push(`ignorados por aparecerem noutras casas: ${rep.map(t => t.numero).join(', ')}`); }
}
grava();
const v = Object.values(out);
console.log(`\n${v.length} procuradas · com telefone ${v.filter(x => x.telefones.length).length} · sem nenhum ${v.filter(x => !x.telefones.length).length}`);
