// Lista oficial "onde ficar" da Câmara: descoberta de casas e telefones.
//   node ferramentas/camara.mjs "<Concelho>" <url da página de alojamento da Câmara> [<outro url> ...]
// Ex.: node ferramentas/camara.mjs "Peso da Régua" https://www.cm-pesoregua.pt/visitar/dormir
// Encontrar o url: no site da Câmara, "Visitar", "Turismo", "Onde ficar", "Dormir", "Alojamento".
// Percorre as páginas dentro desse caminho (listas, paginação, fichas) e guarda de cada ficha: nome, morada,
// telefones, email e site. Os contactos que aparecem em quase todas as páginas são da Câmara e saem.
// Escreve data/camara-<concelho>.json { fonte, data, casas: [{ nome, categoria, morada, telefones, email, site, ficha }] }.
// A lista da Câmara NÃO prova que uma casa está ativa: serve para descobrir casas e telefones.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , concelho, ...inicios] = process.argv;
if (!inicios.length) { console.error('uso: node ferramentas/camara.mjs "<Concelho>" <url> [<url> ...]'); process.exit(1); }
const nomeF = concelho.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const pausa = ms => new Promise(r => setTimeout(r, ms));
const get = async u => { for (let t = 0; t < 3; t++) { try { const r = await fetch(u, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) }); if (r.ok) return await r.text(); } catch {} await pausa(1500); } return ''; };
const ent = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&ordm;/g, 'º').replace(/&ordf;/g, 'ª')
  .replace(/&([a-zA-Z])(acute|grave|tilde|circ|cedil|uml);/g, (_, l, a) => (l + { acute: '́', grave: '̀', tilde: '̃', circ: '̂', cedil: '̧', uml: '̈' }[a]).normalize('NFC'));
const texto = h => ent(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n')).split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
// um href tel: às vezes traz vários números colados ("00351919282035 00351918713643"): parte-se em números de 9
function partir(d) {
  const r = []; d = d.replace(/\D/g, '');
  while (d.length >= 9) {
    // tira prefixos de país (351, 00351), mesmo repetidos ("351 00351 919…")
    for (let k = 0; k < 3; k++) d = d.replace(/^(00351|351)(?=00351|351|[29]\d{8})/, '');
    if (/^00/.test(d)) { r.push('+' + d.slice(2)); break; } // estrangeiro: fica inteiro
    r.push(d.slice(0, 9)); d = d.slice(9);
  }
  return r.filter(n => /^[29]\d{8}$|^\+/.test(n));
}
const tels = h => [...new Set([...h.matchAll(/href="tel:([^"]+)"/g)].flatMap(m => partir(m[1])))];
const emails = h => [...new Set([...h.matchAll(/mailto:([^"?&<>\s\\]+@[^"?&<>\s\\]+)/g)].map(m => m[1]))];
const sites = h => [...new Set([...h.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1]))];

// percorre: só páginas do mesmo site cujo caminho começa por um dos caminhos de início (listas, ?page=, fichas)
const bases = inicios.map(u => new URL(u));
const dentro = u => bases.some(b => u.host === b.host && u.pathname.startsWith(b.pathname));
const fila = [...inicios], vistas = new Set(), paginas = [];
while (fila.length && vistas.size < 800) {
  const u = fila.shift(); if (vistas.has(u)) continue; vistas.add(u);
  const h = await get(u); if (!h) continue;
  paginas.push({ url: u, h });
  for (const m of h.matchAll(/href="([^"#]+)"/g)) {
    let v; try { v = new URL(m[1].replace(/&amp;/g, '&'), u); } catch { continue; }
    if (!/^https?:/.test(v.protocol) || /\.(pdf|jpe?g|png|docx?)$/i.test(v.pathname)) continue;
    if (dentro(v) && !vistas.has(v.href)) fila.push(v.href);
  }
  if (vistas.size % 25 === 0) console.log(`${vistas.size} páginas lidas…`);
}
// contactos da própria Câmara: aparecem em mais de 30% das páginas
const freq = new Map();
for (const p of paginas) for (const t of new Set([...tels(p.h), ...emails(p.h), ...sites(p.h)])) freq.set(t, (freq.get(t) || 0) + 1);
const daCamara = new Set([...freq].filter(([, n]) => n > paginas.length * 0.3).map(([t]) => t));

const casas = [];
for (const p of paginas) {
  const t = tels(p.h).filter(n => !daCamara.has(n));
  const email = emails(p.h).find(e => !daCamara.has(e)) || null;
  if (!t.length && !email) continue; // uma ficha tem contacto próprio; listas e páginas gerais não
  const titulo = ent((p.h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || p.h.match(/<title>([^<|]*)/) || [])[1] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const linhas = texto(p.h);
  const i = linhas.findIndex(l => l === titulo);
  const morada = linhas.slice(i + 1, i + 6).filter(l => /\d{4}-\d{3}|rua|lugar|largo|av\.|avenida|estrada|travessa|cal[cç]ada/i.test(l)).join(', ');
  const site = sites(p.h).filter(x => !daCamara.has(x)).find(x => { try { const v = new URL(x); return !bases.some(b => v.host === b.host) && !/google|facebook\.com\/sharer|twitter|youtube|instagram\.com\/?$|linkedin|cm-|gov\.pt|cartaojovem|fnaj|cpisantiago/i.test(v.host + v.pathname); } catch { return false; } }) || null;
  const categoria = linhas.find(l => /Dormir|Alojamento|Hotel|Turismo/i.test(l) && l.length < 80 && l !== titulo) || '';
  casas.push({ nome: titulo, categoria, morada, telefones: t, email, site, ficha: p.url });
}
// a mesma ficha pode ter vários endereços (página e ?poi_id=): fica uma por nome + telefone
const unicas = [...new Map(casas.map(c => [`${c.nome}|${c.telefones.join()}|${c.email}`, c])).values()];
const f = path.join(RAIZ, 'data', `camara-${nomeF}.json`);
fs.writeFileSync(f, JSON.stringify({ fonte: inicios.join(' '), data: new Date().toISOString().slice(0, 10), casas: unicas }, null, 1));
console.log(`${paginas.length} páginas · ${unicas.length} fichas com contacto (${unicas.filter(c => c.telefones.length).length} com telefone) · contactos da Câmara ignorados: ${[...daCamara].filter(x => !/^http/.test(x)).join(', ') || '-'}`);
console.log('->', path.relative(process.cwd(), f));
