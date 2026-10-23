// Procura a fundo o telefone das casas BOAS (escalão A, B ou gestora) que ainda não têm nenhum.
// Uma casa boa não se perde por uma pesquisa fraca; uma casa fraca sem telefone sai sem esta procura.
//   node ferramentas/contactos.mjs "<Concelho>"
// Lê data/sem-contacto-<concelho>.json (o montar.js escreve-o): [{ id, nome, localidade, site?, email? }].
// Onde procura, por ordem:
//   1. o site próprio: página inicial e as páginas de contactos/sobre (links tel: e números no texto);
//   2. duas pesquisas web ("<nome> <terra> telefone", "<nome> <concelho> contactos"): números nos resumos
//      dos resultados que falam da casa (o Google mostra muitas vezes o telefone do Facebook ou de diretórios);
//   3. as páginas desses resultados fora das plataformas (diretórios, páginas da casa), se falarem da casa.
// Escreve data/contactos-<concelho>.json { id: { telefones: [{ numero, fontes }], procurado: [...] } }. Retoma se parar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pesquisar, telefonesEm } from './lib/pesquisar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/contactos.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.toLowerCase().replace(/\s+/g, '-');
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

for (const c of lista) {
  if (out[c.id]) continue;
  const ws = distintas(c.nome);
  // tem de falar da casa E do sítio (concelho, terra ou Douro): há casas com o mesmo nome noutras terras
  // (só o nome do concelho: terras como Sergude existem noutros concelhos, e "Douro" aparece em todo o lado)
  const sitio = [sa(concelho), sa(concelho).replace(/^peso da /, '')].filter(x => x.length > 3);
  const fala = t => (!ws.length || ws.some(w => sa(t).includes(w))) && sitio.some(x => sa(t).includes(x));
  const achados = new Map(); const add = (n, f) => { if (daZona(n)) (achados.get(n) || achados.set(n, new Set()).get(n)).add(f); };
  const procurado = [];

  // 1. site próprio
  if (c.site) {
    const h = await abrir(c.site);
    for (const n of telsDe(h)) add(n, 'site');
    const links = [...h.matchAll(/href="([^"#]+)"/g)].map(m => { try { return new URL(m[1], c.site).href; } catch { return null; } })
      .filter(u => u && new URL(u).host === new URL(c.site).host && /contact|contato|sobre|about|reserv/i.test(u));
    for (const u of [...new Set(links)].slice(0, 3)) for (const n of telsDe(await abrir(u))) add(n, 'site');
    procurado.push(`site ${new URL(c.site).host}`);
  }
  // 2 e 3. pesquisa web
  const local = c.localidade && sa(c.localidade) !== sa(concelho) ? c.localidade : concelho;
  for (const q of [`"${c.nome}" ${local} telefone`, `"${c.nome}" ${concelho} contactos`]) {
    const r = await pesquisar(q);
    if (!r) { procurado.push(`pesquisa "${q}" falhou`); continue; }
    procurado.push(`pesquisa ${r.motor} "${q}"`);
    for (const x of r.resultados) if (!SEM_TEL.test(x.url) && fala(x.titulo + ' ' + x.texto + ' ' + x.url)) for (const n of telefonesEm(x.texto)) add(n, `pesquisa (${(x.url.match(/\/\/(?:www\.)?([^/]+)/) || [])[1]})`);
    for (const x of r.resultados.filter(x => x.url && !SEM_TEL.test(x.url) && fala(x.titulo + ' ' + x.url)).slice(0, 2)) {
      const h = await abrir(x.url);
      if (!fala(textoDe(h).slice(0, 20000))) continue;
      const host = (x.url.match(/\/\/(?:www\.)?([^/]+)/) || [])[1];
      for (const n of telsDe(h)) add(n, host);
    }
  }
  const telefones = [...achados].map(([numero, f]) => ({ numero, fontes: [...f] }))
    // um número que só aparece num diretório genérico, sem estar no site nem na pesquisa, fica marcado para confirmar
    .sort((a, b) => b.fontes.length - a.fontes.length);
  out[c.id] = { telefones, procurado };
  grava();
  console.log(c.id, c.nome, '|', telefones.length ? telefones.map(t => `${t.numero} (${t.fontes.join('+')})`).join(', ') : 'NENHUM', '|', procurado.length, 'sítios');
}
// o mesmo número em casas diferentes é de um portal ou diretório, não da casa
const contagem = new Map();
for (const x of Object.values(out)) for (const t of x.telefones) contagem.set(t.numero, (contagem.get(t.numero) || 0) + 1);
for (const x of Object.values(out)) {
  const rep = x.telefones.filter(t => contagem.get(t.numero) > 1 && !t.fontes.includes('site'));
  if (rep.length) { x.telefones = x.telefones.filter(t => !rep.includes(t)); x.procurado.push(`ignorados por aparecerem noutras casas: ${rep.map(t => t.numero).join(', ')}`); }
}
grava();
const v = Object.values(out);
console.log(`\n${v.length} procuradas · com telefone ${v.filter(x => x.telefones.length).length} · sem nenhum ${v.filter(x => !x.telefones.length).length}`);
