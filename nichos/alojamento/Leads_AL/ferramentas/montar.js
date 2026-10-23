// Monta as leads de um concelho a partir de tudo o que as outras ferramentas recolheram. Duas fases:
//
//   node ferramentas/montar.js "<Concelho>" unidades
//     Junta Booking + Airbnb + registo em UNIDADES (uma por dono do registo, ou por anúncio sem registo) e escreve:
//       data/unidades-<c>.json           as casas ativas (e o que se sabe delas)
//       data/por-verificar-<c>.json      casas do registo sem anúncio + casas do Maps/Câmara que não se conhecem
//                                        -> node ferramentas/paradas.mjs (pesquisa pelo nome antes de dar como parada)
//       data/lista-verificar-<c>.json    as ativas com 5+ pessoas, para maps.mjs, pesquisa.mjs e dominios.mjs
//     Volta a correr depois do paradas.mjs: as que afinal estão ativas entram como unidades.
//
//   node ferramentas/montar.js "<Concelho>" sites
//     Sites candidatos de cada unidade (Google, Câmara, domínios, pesquisa) -> data/sites-a-avaliar-<c>.json
//
//   node ferramentas/montar.js "<Concelho>" final
//     Monta data/novos-<c>.json (para o juntar.js) e data/sem-contacto-<c>.json (casas A, B e gestoras sem telefone,
//     para o contactos.mjs). Depois do contactos.mjs, volta a correr "final".
//
// Decisões à mão do concelho: data/ajustes-<c>.json (todas opcionais):
//   { "MAO": { "<id do anúncio>": "<id do registo ou de outro anúncio>" },   anúncio que a ferramenta não ligou
//     "JUNTA": { "<id do registo>": "<id do registo>" },                      dois registos do mesmo dono
//     "FORA": { "<id>": "motivo" },                                           anúncio de outro concelho
//     "NOMES": { "<id>": "nome a mostrar" },
//     "GOK": [ids], "GNAO": [ids], "GOK2": [ids],     perfil Google aceite/recusado à mão (GOK2 = o da 2.ª volta)
//     "CAMARA": { "<nome na ficha da Câmara>": "<id>" },
//     "AB_EXTRA": { "<id Airbnb>": { anúncio lido à mão } },
//     "EXTRA": { "<id>": { "etiquetas": [], "sem": ["912 345 678"], "tel": [{ "numero", "fonte" }], "subnicho": "...",
//                          "gestora": { "nome", "prova" } } },
//     "SITES": { "<id>": { "url", "veredito", "prova", "nota" } } }        veredito do site à mão
// Vereditos dos sites (subagente, a olhar para as capturas): data/sites-veredito-<c>-*.json { id: { url, dono, veredito, prova, nota } }
const fs = require('fs');
const path = require('path');
const pontuacao = require('../pontuacao.js');
const { lerPoligono, dentro: dentroDe } = require('./lib/concelho.js');

const [, , CONC, FASE] = process.argv;
if (!CONC || !['unidades', 'sites', 'final'].includes(FASE)) { console.error('uso: node ferramentas/montar.js "<Concelho>" unidades|sites|final'); process.exit(1); }
const R = path.join(__dirname, '..'), D = path.join(R, 'data');
const nf = CONC.toLowerCase().replace(/\s+/g, '-');
const f = n => path.join(D, `${n}-${nf}.json`);
const J = (file, fb) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { if (fb !== undefined) return fb; throw e; } };
const escreve = (file, x) => fs.writeFileSync(file, JSON.stringify(x, null, 1));
const HOJE = new Date().toISOString().slice(0, 10);

const sa = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set('casa casas quinta douro valley vale house home piscina com para the regua peso suite suites guest guesthouse refugio privado privada familiar campo apartamento apartamentos apartment vila villa no do da de dos das em um uma hotel lda alojamento local residencial rio region regiao norte portugal'.split(' '));
const palavras = s => sa(s).split(/[^a-z0-9]+/).filter(x => x.length > 2 && !STOP.has(x));
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const virg = n => String(n).replace('.', ',');

const cand = J(f('candidatos')).candidatos;
const bk = J(f('booking'), { anuncios: {} }).anuncios;
const ab = J(f('airbnb'), { anuncios: {} }).anuncios;
const AJ = J(f('ajustes'), {});
const MAO = AJ.MAO || {}, JUNTA = AJ.JUNTA || {}, FORA = AJ.FORA || {}, NOMES = AJ.NOMES || {}, EXTRA = AJ.EXTRA || {};
Object.assign(ab, AJ.AB_EXTRA || {});
const paradas = J(f('paradas'), {});
const PV = J(f('por-verificar'), []);
// títulos de página que não são nome de casa
const GENERICO = n => /^(airbnb|booking|vrbo|expedia|hostelworld|facebook|instagram)\b|alojamentos de férias|aluguéis por temporada/i.test(n);

// terras do concelho: o próprio, localidades e freguesias do registo
const TERRAS = [...new Set([CONC, ...cand.flatMap(c => [c.localidade, ...(String(c.freguesia || '').split(/ e /))])].map(sa).map(t => t.trim()).filter(t => t.length > 3))];
// anúncio sem registo -> casa do registo com outro nome, quando as palavras distintivas batem com UMA só casa
// ("Feel Discovery Casa DAlice" = "Casa D'Alice"; "Casa do Trovão - Douro" = "Casa do Trovão")
const RUIDO = /^(feel|discovery|douro|valley|regua|peso|by|your|in|t0|t1|t2|t3|apartments?|apartamentos?|luxury|private|suites?|peso-da-regua)$/;
const dist = s => palavras(s).filter(w => w.length > 2 && !RUIDO.test(w));
const AUTO = {};

const ligaveis = [...Object.entries(bk).filter(([, a]) => !a.registo && a.ativa && (a.lat != null ? a.do_concelho === true : a.do_concelho !== false && !!a.cp)).map(([sl, a]) => ['bk-' + sl, a.nome]),
  ...Object.entries(ab).filter(([, a]) => !a.registo && !a.al && a.ativa).map(([i, a]) => ['ab-' + i, a.titulo])];
for (const [id, nome] of ligaveis) {
  if (MAO[id] !== undefined || FORA[id]) continue;
  const w = dist(nome); if (!w.length) continue;
  const hits = cand.filter(c => { const cw = new Set([c.nome, ...(c.unidades || [])].flatMap(dist)); return w.every(x => cw.has(x)) || ([c.nome, ...(c.unidades || [])].some(n => { const nw = dist(n); return (nw.length >= 2 || nw[0]?.length >= 6) && nw.every(x => w.includes(x)); })); });
  // desempates: o nome sem espaços igual ("Pombinhos Douro" = "POMBINHOSDOURO"); ou todos do mesmo titular (fica o maior)
  const junto = x => sa(x).replace(/[^a-z0-9]/g, '');
  const iguais = (hits.length ? hits : cand).filter(c => [c.nome, ...(c.unidades || [])].some(n => junto(n) === junto(nome) || junto(n) === junto(nome).replace(/douro$/, '') || (junto(n).length >= 6 && junto(nome).startsWith(junto(n)))));
  if (hits.length === 1) AUTO[id] = hits[0].id;
  else if (iguais.length === 1) AUTO[id] = iguais[0].id;
  else if (hits.length > 1 && new Set(hits.map(c => sa(c.responsavel))).size === 1) AUTO[id] = hits.slice().sort((a, b) => b.capacidade - a.capacidade)[0].id;
}
// "X by Casa Y": a casa Y do registo (mesmo dono)
for (const [id, nome] of ligaveis) {
  if (MAO[id] !== undefined || AUTO[id] || FORA[id]) continue;
  const by = String(nome).match(/\bby (.+)$/i); if (!by) continue;
  const w = dist(by[1]); const hits = w.length ? cand.filter(c => { const cw = dist(c.nome); return cw.length && cw.every(x => w.includes(x)); }) : [];
  if (hits.length === 1) AUTO[id] = hits[0].id;
}
// anúncios sem registo com o mesmo nome no Booking e no Airbnb ("CASA DAS PEDREIRAS", "Shades of Green") = uma casa
const chaveNome = n => dist(n).sort().join(' ');
const porNome = new Map();
for (const [id, nome] of ligaveis) {
  if (MAO[id] !== undefined || AUTO[id] || FORA[id]) continue;
  const k = chaveNome(nome); if (!k) continue;
  if (porNome.has(k)) AUTO[id] = porNome.get(k); else porNome.set(k, id);
}
const raiz = k => { for (let i = 0; i < 5; i++) k = MAO[k] || AUTO[k] || JUNTA[k] || k; return k; };
// anúncio do Airbnb sem registo cuja terra ("Casa em Cidadelhe") não é deste concelho: o mapa mistura vizinhos
const abForaDaTerra = a => { const G = lerPoligono(CONC); if (G && a.lat != null) return !dentroDe(G, a.lat, a.lng); const t = (String(a.tipo || '').match(/ em ([^,|]+)/) || [])[1]; return t && !TERRAS.some(x => sa(t).includes(x) || x.includes(sa(t).trim())); };

// ---------- unidades ----------
const un = new Map();
const add = (k, t, a) => { if (FORA[k]) return; k = raiz(k); if (FORA[k]) return; (un.get(k) || un.set(k, { bk: [], ab: [], outras: [] }).get(k))[t].push(a); };
// com coordenadas decide o contorno (a morada pode vir sem código postal); sem coordenadas, o código postal
const doCaBk = a => a.ativa && (a.lat != null ? a.do_concelho === true : a.do_concelho !== false && !!a.cp);
// anúncio ligado a uma casa do registo mas fora do concelho (homónima: a "Casa dos Avós" de Aljezur) não conta para ela
for (const [s, a] of Object.entries(bk)) if (doCaBk(a)) add(a.registo || 'bk-' + s, 'bk', { ...a, slug: s });
for (const [i, a] of Object.entries(ab)) if (a.ativa && !(a.al && !a.registo) && !(!a.registo && abForaDaTerra(a))) add(a.registo || 'ab-' + i, 'ab', { ...a, id: i });
// casas que o paradas.mjs encontrou ativas (anúncio com outro nome, Vrbo, Hostelworld…)
// (casas novas do Maps/Câmara — ids mp-/cm-: só com morada do concelho no Booking, ou terra do concelho no Airbnb,
//  e sem repetir um anúncio que já se conhece)
const CPS4 = new Set(cand.map(c => (String(c.morada).match(/\b(\d{4})-\d{3}\b/) || [])[1]).filter(Boolean));
const terraCP = m => sa((String(m).match(/\b\d{4}-\d{3}\s+([^,]+)/) || [])[1] || '').trim();
const GEO = lerPoligono(CONC);
const doConcelho = a => GEO && a.lat != null ? dentroDe(GEO, a.lat, a.lng) : a.nome === 'Booking' ? !!a.morada && CPS4.has((a.morada.match(/\b(\d{4})-\d{3}\b/) || [])[1]) && TERRAS.includes(terraCP(a.morada))
  : a.nome === 'Airbnb' ? !abForaDaTerra(a) && !!a.tipo : false;
const urlsConhecidos = new Set([...Object.values(bk).map(b => b.url), ...Object.values(ab).map(b => b.url)]);
const urlsNovos = new Set();
for (const [id, p] of Object.entries(paradas)) if (p.ativa) {
  const novaCasa = /^(mp|cm)-/.test(id);
  // de uma casa nova só contam os anúncios dentro do concelho (a Quinta da Salada tem um em Lamego e outro na Régua)
  const ativos = p.achados.filter(x => x.ativa && !x.robo && (!novaCasa || doConcelho(x)));
  if (novaCasa && (!ativos.length || ativos.some(a => urlsConhecidos.has(a.url) || urlsNovos.has(a.url)))) continue;
  for (const a of ativos) {
  urlsNovos.add(a.url);
  if (a.nome === 'Booking' && urlsConhecidos.has(a.url)) continue;
  // nos achados, "nome" é a plataforma; o nome da casa é o título do anúncio (ou o nome que o Maps/Câmara deu)
  const nomeCasa = a.titulo && !GENERICO(a.titulo) && !/^(Booking|Airbnb|Vrbo|Expedia|Hostelworld)$/.test(a.titulo) ? a.titulo : (PV.find(v => v.id === id)?.nome || a.titulo);
  add(id, a.nome === 'Booking' ? 'bk' : a.nome === 'Airbnb' ? 'ab' : 'outras', { ...a, plataforma: a.nome, nome: nomeCasa, titulo: nomeCasa, url: a.url, ultima_avaliacao: a.ultima, de_paradas: true });
  }
}
// casas do registo sem plataforma mas com Facebook/Instagram com seguidores (paradas.mjs): contam como ativas
for (const [id, p] of Object.entries(paradas)) if (!p.ativa && !/^(mp|cm)-/.test(id) && p.redes_ativas?.length && !FORA[id])
  for (const r of p.redes_ativas) add(id, 'outras', { plataforma: r.nome, nome: r.nome, titulo: r.nome, url: r.url, seguidores: r.seguidores, redes: true });
const camara = J(f('camara'), { casas: [] }).casas;
const unidades = [...un].map(([id, u]) => {
  const c = cand.find(x => x.id === id);
  const membros = c ? [c, ...Object.entries(JUNTA).filter(([, r]) => r === id).map(([k]) => cand.find(x => x.id === k)).filter(Boolean)] : [];
  const b0 = u.bk.slice().sort((x, y) => (y.avaliacoes || 0) - (x.avaliacoes || 0))[0];
  const nome = NOMES[id] || (c ? c.nome.replace(/^"|"$/g, '').replace(/\s+/g, ' ').trim() : b0?.nome || [...u.ab, ...u.outras].map(a => a.titulo).find(t => t && !GENERICO(t)) || u.ab[0]?.titulo);
  return { id, nome, localidade: c?.localidade || '', nomes: [...new Set([...u.bk.map(a => a.nome), ...u.ab.map(a => a.titulo), ...u.outras.map(a => a.titulo), ...membros.flatMap(m => m.unidades || [])])].filter(n => n && sa(n) !== sa(nome) && !GENERICO(n)).slice(0, 4),
    pequena: membros.length ? membros.every(m => m.pequena) : false, registo: !!c, membros: membros.map(m => m.id), bk: u.bk, ab: u.ab, outras: u.outras };
});

if (FASE === 'unidades') {
  escreve(f('unidades'), unidades);
  const ativos = new Set(unidades.flatMap(u => u.membros));
  // registo sem anúncio (não pequenas) + Maps + Câmara desconhecidas: pesquisar o nome antes de dar como parada
  const conhecidos = [...cand.map(c => [c.nome, ...(c.unidades || [])].join(' ')), ...unidades.map(u => [u.nome, ...u.nomes].join(' '))].map(palavras);
  const conhece = n => { const w = palavras(n); return w.length && conhecidos.some(k => w.every(x => k.includes(x))); };
  const pv = cand.filter(c => !c.pequena && !ativos.has(c.id) && !FORA[c.id]).map(c => ({ id: c.id, nome: c.nome.replace(/^"|"$/g, '').trim(), localidade: c.localidade, nomes: c.unidades }));
  const desc = J(f('descobrir'), { sitios: {} }).sitios;
  // só os sítios dentro da caixa do concelho (coordenadas no link do Maps: !3d<lat>!4d<lng>); o Maps mistura vizinhos
  const cx = J(f('airbnb'), {}).caixa; // [sul, norte, oeste, este], do OpenStreetMap
  const dentro = href => { const m = href.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/); if (!m) return !cx && !GEO; const [la, lo] = [Number(m[1]), Number(m[2])];
    return GEO ? dentroDe(GEO, la, lo) : !cx || (la >= cx[0] && la <= cx[1] && lo >= cx[2] && lo <= cx[3]); };
  for (const [href, s] of Object.entries(desc)) if (dentro(href) && !conhece(s.nome)) pv.push({ id: 'mp-' + sa(s.nome).replace(/[^a-z0-9]+/g, '-').slice(0, 50), nome: s.nome, localidade: '', origem: 'Google Maps', maps: href });
  for (const s of camara) if (!conhece(s.nome) && !pv.some(x => sa(x.nome) === sa(s.nome))) pv.push({ id: 'cm-' + sa(s.nome).replace(/[^a-z0-9]+/g, '-').slice(0, 50), nome: s.nome, localidade: '', origem: 'Câmara' });
  escreve(f('por-verificar'), pv);
  const ver = unidades.filter(u => !u.pequena);
  escreve(f('lista-verificar'), ver.map(({ id, nome, localidade, nomes }) => ({ id, nome, localidade, nomes })));
  console.log(`${unidades.length} casas ativas (${unidades.filter(u => u.pequena).length} pequenas, fora) · sem registo ${unidades.filter(u => !u.registo).length} · a verificar ${ver.length}`);
  console.log(`por verificar antes de dar como paradas: ${pv.length} (registo ${pv.filter(x => !x.origem).length}, Maps ${pv.filter(x => x.origem === 'Google Maps').length}, Câmara ${pv.filter(x => x.origem === 'Câmara').length}) -> node ferramentas/paradas.mjs "${CONC}"`);
  if (Object.keys(AUTO).length) console.log('ligados ao registo pelo nome (confirmar; se algum estiver errado, pô-lo em MAO com null ou com o id certo):\n  ' + Object.entries(AUTO).map(([a, c]) => `${a} -> ${c} ${cand.find(x => x.id === c)?.nome || "(o mesmo nome noutro anúncio)"}`).join('\n  '));
  const semReg = unidades.filter(u => !u.registo);
  if (semReg.length) console.log('anúncios sem registo (ver se são casas do registo com outro nome -> MAO em ajustes):\n  ' + semReg.map(u => `${u.id} | ${u.nome}`).join('\n  '));
  process.exit(0);
}

// ---------- perfil Google aceite ----------
const maps = J(f('maps'), {}), maps2 = J(f('maps2'), {});
const TERRA = /\b\d{4}\b/;
const CPS = new Set(cand.map(c => (String(c.morada).match(/\b(\d{4})-\d{3}\b/) || [])[1]).filter(Boolean));
const gok = (g, nomes) => !!g && !g.erro && !!g.nome && ([...CPS].some(cp => (g.morada || '').includes(cp)) || sa(g.morada).includes(sa(CONC)))
  && palavras(g.nome).some(x => nomes.flatMap(palavras).includes(x));
const perfil = u => {
  const nomes = [u.nome, ...u.nomes];
  if ((AJ.GOK || []).includes(u.id)) return maps[u.id];
  if (!(AJ.GNAO || []).includes(u.id) && gok(maps[u.id], nomes)) return maps[u.id];
  if ((AJ.GOK2 || []).includes(u.id) || gok(maps2[u.id], nomes)) return maps2[u.id];
  return null;
};
const camCruz = (() => { // fichas da Câmara de cada unidade: mesmo telefone, nome igual, ou todas as palavras do nome
  const tel = n => String(n).replace(/\D/g, '').slice(-9);
  const res = {};
  for (const c of camara) {
    const man = (AJ.CAMARA || {})[c.nome];
    if (man) { (res[man] = res[man] || []).push({ ...c, porTel: false }); continue; }
    let best = null;
    for (const u of unidades) {
      const mem = u.membros.map(id => cand.find(x => x.id === id));
      const tu = mem.flatMap(m => m.telefones.map(t => tel(t.numero)));
      const wu = [u.nome, ...u.nomes, ...mem.flatMap(m => [m.nome, ...(m.unidades || [])])].flatMap(palavras);
      const wc = palavras(c.nome);
      const porTel = c.telefones.some(t => tu.includes(tel(t)));
      const igual = [u.nome, ...u.nomes].some(n => sa(n).trim() === sa(c.nome).trim());
      const todas = wc.length > 0 && wc.every(x => wu.includes(x));
      const sc = (porTel ? 10 : 0) + (igual ? 8 : 0) + (todas ? 3 + wc.length : 0);
      if (sc >= 3 && (!best || sc > best.sc)) best = { id: u.id, sc, porTel };
    }
    if (best) (res[best.id] = res[best.id] || []).push({ ...c, porTel: best.porTel });
  }
  return res;
})();

// ---------- sites ----------
const doms = J(f('dominios'), {}), pesq = J(f('pesquisa'), {});
// páginas de gestoras, diretórios e agregadores: não são o site próprio da casa
const NAO_SITE = /dourovinhateiro|feeldiscovery|feelporto|quantique|freecancellations|bluepillow|blogspot|\.com\.es|portugalexplorer|stayforlong|tiket\.com|booking\.com|airbnb|facebook|instagram|vrbo|hostelworld|sites\.google\.com|carrd\.co|wixsite\.com\/?$|cloudbeds|gohotelly|accoportugal|wisepilgrim|123reserve|guestreservations|reserving|lodgify\.com\/?$|hostaway|smoobu|tripadvisor|google\./i;
function sitesCand(u) {
  const ws = [...new Set([u.nome, ...u.nomes].flatMap(palavras))].filter(x => x.length > 3);
  const c = new Map();
  const put = (url, fonte) => { if (!url || NAO_SITE.test(url)) return; url = url.split('?')[0]; const k = [...c.keys()].find(k => host(k) === host(url)) || url; (c.get(k) || c.set(k, new Set()).get(k)).add(fonte); };
  const g = perfil(u);
  if (g?.site) put(g.site, 'Google');
  for (const x of camCruz[u.id] || []) if (x.site) put(x.site, 'Câmara');
  for (const d of doms[u.id] || []) if (d.registado && d.estado === 200 && d.fala_do_sitio) put(d.url || 'https://' + d.d, 'domínio');
  for (const h of pesq[u.id]?.proprios || []) if (ws.some(t => h.replace(/[^a-z0-9]/g, '').includes(t))) put('https://' + h, 'pesquisa');
  return [...c].map(([url, fs_]) => ({ url, fontes: [...fs_] }));
}
const ver = unidades.filter(u => !u.pequena);
if (FASE === 'sites') {
  // 2.ª volta do Google para as casas sem perfil aceite: com o nome do anúncio (o do registo é muitas vezes outro)
  const l2 = ver.filter(u => !perfil(u) && !maps2[u.id]).map(u => ({ id: u.id, nome: [...u.bk.map(a => a.nome), ...u.ab.map(a => a.titulo), ...u.nomes].find(n => n && sa(n) !== sa(u.nome)) || u.nome, localidade: u.localidade }))
    .filter(x => x.nome);
  escreve(f('lista-maps2'), l2);
  if (l2.length) console.log(`${l2.length} casas sem perfil Google certo -> node ferramentas/maps.mjs data/lista-maps2-${nf}.json "${CONC}" data/maps2-${nf}.json e volta a correr "sites"`);
  const lista = [];
  for (const u of ver) sitesCand(u).forEach((s, i) => lista.push({ id: i ? `${u.id}~${host(s.url)}` : u.id, url: s.url }));
  escreve(f('sites-a-avaliar'), lista);
  console.log(`${ver.filter(u => sitesCand(u).length).length} de ${ver.length} casas com site candidato · ${lista.length} sites -> node ferramentas/avaliar-sites.mjs data/sites-a-avaliar-${nf}.json e prova-moderno.mjs; depois o subagente escreve data/sites-veredito-${nf}-1.json`);
  process.exit(0);
}

// ---------- final ----------
const VER = Object.assign({}, ...fs.readdirSync(D).filter(x => x.startsWith(`sites-veredito-${nf}`) && x.endsWith('.json')).map(x => J(path.join(D, x))));
const VH = {}; for (const [k, v] of Object.entries(VER)) if (v.url) VH[k.split('~')[0] + '|' + host(v.url)] = { ...v, cid: k };
function site(u) {
  if ((AJ.SITES || {})[u.id]) return AJ.SITES[u.id];
  const vs = sitesCand(u).map(c => ({ ...(VH[u.id + '|' + host(c.url)] || { veredito: 'por_rever' }), url: c.url, fontes: c.fontes }));
  const seus = vs.filter(v => ['moderno', 'antigo', 'duvida'].includes(v.veredito));
  const ordem = { moderno: 0, antigo: 1, duvida: 2 };
  seus.sort((a, b) => ordem[a.veredito] - ordem[b.veredito] || b.fontes.includes('Google') - a.fontes.includes('Google'));
  if (seus[0]) { const v = seus[0]; const cap = `capturas/${v.cid || u.id}.png`; return { url: v.url, veredito: v.veredito, prova: v.prova, nota: v.nota, captura: fs.existsSync(path.join(R, cap)) ? cap : undefined }; }
  if (vs.some(v => v.veredito === 'por_rever')) return { veredito: 'por_rever', nota: 'site por rever: ' + vs.filter(v => v.veredito === 'por_rever').map(v => host(v.url)).join(', ') };
  const perd = vs.filter(v => v.veredito === 'perdido');
  if (perd.length) return { veredito: 'perdido', nota: `${perd.map(v => host(v.url)).join(', ')} registado mas sem site (${perd.map(v => v.nota).join('; ')})` };
  const fora = vs.filter(v => v.veredito === 'nao_e_desta_casa').map(v => `${host(v.url)} é de ${String(v.dono || 'outra casa').replace(/^outra casa: ?/, '')}`);
  return { veredito: 'nenhum', nota: `nenhum site próprio${fora.length ? ' (' + fora.join('; ') + ')' : ''}` };
}

// gestoras: quem gere anúncios de casas de outros (Booking "gerido por", anfitrião do Airbnb com 3+ anúncios, nomes "by X")
const conhecidas = J(path.join(__dirname, 'gestoras-conhecidas.json'), []);
const porGerente = new Map(), porAnfitriao = new Map();
const gerente = a => a.gerido_por && !/^uma? anfitri|^um particular|^uma empresa/i.test(a.gerido_por) ? a.gerido_por : null;
for (const u of unidades) for (const a of u.bk) a.gerido_por = gerente(a);
for (const u of unidades) {
  for (const a of u.bk) if (a.gerido_por) (porGerente.get(sa(a.gerido_por)) || porGerente.set(sa(a.gerido_por), new Set()).get(sa(a.gerido_por))).add(u.id);
  for (const a of u.ab) if (a.anfitriao_chave) (porAnfitriao.get(a.anfitriao_chave) || porAnfitriao.set(a.anfitriao_chave, new Set()).get(a.anfitriao_chave)).add(u.id);
}
// nome de empresa de gestão (no "gerido por" do Booking ou no titular do registo)
const EMPRESA_GESTAO = /\b(homes?|rentals?|gest[aã]o|management|properties|villas|hosting|stays?|hospitality|alojamentos)\b/i;
// nomes distintos de casa num conjunto de anúncios ("Casa da Glorinha", "Casa da Rosalina"… = casas diferentes;
// "Suite Arinto", "Suite Touriga", "Quarto Twin" = quartos da mesma casa)
const casasDistintas = titulos => new Set(titulos.filter(t => !/^(su[ií]te|quarto|room|apartamento \d|apartment|t\d)\b/i.test(t.trim()))
  .map(t => palavras(t).filter(w => !/^\d+$/.test(w)).slice(0, 2).join(' ')).filter(Boolean)).size;
// anfitrião do Airbnb -> todos os anúncios lidos dele (de cá e dos vizinhos)
const anunciosDoAnfitriao = new Map();
for (const a of Object.values(ab)) if (a.anfitriao_chave) (anunciosDoAnfitriao.get(a.anfitriao_chave) || anunciosDoAnfitriao.set(a.anfitriao_chave, []).get(a.anfitriao_chave)).push(a);
function gestora(u) {
  if (EXTRA[u.id]?.gestora) return EXTRA[u.id].gestora;
  // o subagente, ao ver o site, diz que é de uma gestora ("gestora Alcmena")
  for (const [k, v] of Object.entries(VER)) if (k.split('~')[0] === u.id && /^gestora\b/i.test(v.dono || '') && !/plataforma/i.test(v.dono))
    return { nome: v.dono.replace(/^gestora:?\s*/i, '').replace(/\s*\(.*$/, '').trim(), prova: `o site da casa (${host(v.url)}) é da ${v.dono}` };
  const titulares = u.membros.map(id => cand.find(c => c.id === id)?.responsavel || '');
  // inclui o endereço do anúncio ("casa-da-lameira-by-feel-discovery"): a gestora às vezes só aparece aí
  const txt = [u.nome, ...u.nomes, ...u.bk.map(a => `${a.gerido_por || ''} ${(a.url || '').replace(/[-_/]/g, ' ')}`), ...u.ab.map(a => a.anfitriao_nome || ''), ...titulares].join(' | ');
  for (const g of conhecidas) if (new RegExp(g.padrao || g.nome, 'i').test(txt)) return { nome: g.nome, prova: `"${g.nome}" no anúncio, na gestão ou no titular (gestora conhecida)` };
  // "… by X": gestora, a não ser que X seja outra casa do registo (é o mesmo dono: "Casa das Vinhas Velhas by Casa do Poço")
  const by = [u.nome, ...u.nomes].join(' ').match(/\bby (\p{Lu}[\p{L}\w'’ ]{2,30})/u);
  if (by && !cand.some(c => palavras(c.nome).length && palavras(c.nome).every(w => palavras(by[1]).includes(w))))
    return { nome: by[1].trim(), prova: `anúncio "… by ${by[1].trim()}"` };
  for (const a of u.bk) if (a.gerido_por && !palavras(a.gerido_por).some(x => palavras(u.nome).includes(x))) {
    const n = porGerente.get(sa(a.gerido_por))?.size || 1;
    if (EMPRESA_GESTAO.test(a.gerido_por) || n >= 2) return { nome: a.gerido_por, prova: `Booking: gerido por ${a.gerido_por}${n >= 2 ? ` (${n} casas no concelho)` : ''}` };
  }
  for (const a of u.ab) if (a.anfitriao_chave) {
    const todos = anunciosDoAnfitriao.get(a.anfitriao_chave) || [];
    const n = casasDistintas(todos.map(x => x.titulo));
    // gestora = gere casas de TITULARES diferentes; o mesmo titular com várias casas é um dono, não uma gestora
    const titularesDele = new Set(todos.map(x => x.registo).filter(Boolean).map(id => sa(cand.find(c => c.id === id)?.responsavel)).filter(Boolean));
    if (todos.length >= 3 && n >= 3 && titularesDele.size >= 2)
      return { nome: a.anfitriao_nome, prova: `Airbnb: o anfitrião ${a.anfitriao_chave.replace('|', ', ')} tem ${todos.length} anúncios de ${n} casas, de ${titularesDele.size} titulares diferentes no registo` };
  }
  for (const t of titulares) if (EMPRESA_GESTAO.test(t) && !palavras(t).some(x => palavras(u.nome).includes(x))) return { nome: t, prova: `titular do registo: ${t}` };
  return null;
}

const contactos = J(f('contactos'), {});
const partir = t => { const r = []; let d = String(t).replace(/\D/g, ''); while (d.length >= 9) { for (let k = 0; k < 3; k++) d = d.replace(/^(00351|351)(?=00351|351|[29]\d{8})/, ''); if (/^00/.test(d)) { r.push('+' + d.slice(2)); break; } r.push(d.slice(0, 9)); d = d.slice(9); } return r; };
const fmtEstr = d => { const cc = d.slice(0, 2), r = d.slice(2), g = [r.slice(0, r.length % 2 ? 1 : 2)]; for (let i = g[0].length; i < r.length; i += 2) g.push(r.slice(i, i + 2)); return `+${cc} ${g.join(' ')}`; };
const fmt = n => { const s = String(n).replace(/[\s-]/g, ''); const m = s.match(/^(?:\+|00)(?!351)(\d{9,13})$/); if (m) return fmtEstr(m[1]); const x = s.replace(/\D/g, '').slice(-9); return `${x.slice(0, 3)} ${x.slice(3, 6)} ${x.slice(6)}`; };
const dominioTxt = id => {
  const reg = (doms[id] || []).filter(x => x.registado), livres = (doms[id] || []).filter(x => !x.registado).map(x => x.d);
  return [reg.length && reg.map(x => `${x.d} registado (${x.estado}${x.fala_do_sitio ? ', fala do sítio' : ''})`).join('; '), livres.length && `${livres.join(', ')} livres`].filter(Boolean).join('; ') || 'sem variantes testáveis';
};
const pesqTxt = (id, nome) => { const p = pesq[id]; if (!p) return null; if (p.manual) return `pesquisa web "${nome}": ${p.manual}`; if (p.erro) return null;
  const h = p.proprios.slice(0, 5); return `pesquisa ${p.motor || 'web'} "${p.q}" (10 primeiros): ${h.length ? 'domínios fora das plataformas: ' + h.join(', ') : 'só plataformas e agregadores'}`; };

const leads = [], semContacto = [];
const E = J(path.join(D, 'estado.json'), {});
const mexida = id => { const s = E[id]; return s && (s.decisao || (s.estado && s.estado !== 'por_contactar')); };
const porRever = [];
// casas pequenas (menos de 5 pessoas) só entram se forem de uma gestora: a lead é a gestora, não a casa
const pequenasDeGestora = unidades.filter(u => u.pequena && gestora(u));
for (const u of [...ver, ...pequenasDeGestora]) {
  if (mexida(u.id)) continue;
  const c = cand.find(x => x.id === u.id), membros = u.membros.map(m => cand.find(x => x.id === m));
  const ex = EXTRA[u.id] || {};
  const g = perfil(u);
  const tels = new Map(); const put = (n, fo) => { n = fmt(n); if ((ex.sem || []).includes(n)) return; (tels.get(n) || tels.set(n, new Set()).get(n)).add(fo); };
  for (const m of membros) for (const t of m.telefones) put(t.numero, 'registo');
  if (g?.tel) put(g.tel, 'Google');
  // telefones da Câmara: só de fichas ligadas pelo telefone, ou com a morada no mesmo sítio que a casa
  for (const x of camCruz[u.id] || []) for (const t of x.telefones) for (const n of partir(t)) put(n, 'Câmara');
  for (const t of contactos[u.id]?.telefones || []) put(t.numero, t.fontes.join('+'));
  for (const t of ex.tel || []) put(t.numero, t.fonte);
  const telefones = [...tels].map(([numero, fo]) => ({ numero, fontes: [...fo] }));
  const email = (camCruz[u.id] || []).map(x => x.email).find(Boolean);

  const b0 = u.bk.slice().sort((x, y) => (y.avaliacoes || 0) - (x.avaliacoes || 0))[0];
  const booking = b0 ? { url: b0.url, nota: b0.nota ?? 0, avaliacoes: b0.avaliacoes || 0 } : undefined;
  const plataformas = [...u.ab.map(a => ({ nome: 'Airbnb', url: a.url, nota: a.nota ?? undefined, avaliacoes: a.avaliacoes, ultima: a.ultima_avaliacao || undefined })),
    ...u.outras.filter(a => !a.redes).map(a => ({ nome: a.plataforma || a.nome, url: a.url, nota: a.nota ?? undefined, avaliacoes: a.avaliacoes }))];
  const redes = u.outras.filter(a => a.redes).map(a => ({ nome: a.plataforma, url: a.url, seguidores: a.seguidores }));
  const a0 = b0 || u.ab[0] || u.outras[0];
  const atividade = { fonte: b0 ? 'Booking' : u.ab[0] ? 'Airbnb' : a0.plataforma || a0.nome, url: a0.url, novo: !a0.avaliacoes, ultima: (b0 ? undefined : a0.ultima_avaliacao) || undefined };
  const preco = Math.max(0, ...u.bk.map(a => a.preco || 0)) || undefined;
  const etiquetas = [...(ex.etiquetas || [])];
  if (!u.bk.length && !u.ab.length && redes.length) etiquetas.push(`só redes sociais (${redes.map(r => `${r.nome} ${r.seguidores} seguidores`).join(', ')})`);
  const ge = gestora(u);
  const s = site(u);
  if (s.veredito === 'por_rever') porRever.push(u.id);
  const siteL = ['antigo', 'duvida', 'moderno'].includes(s.veredito) ? { url: s.url, veredito: s.veredito, prova: s.prova, captura: s.captura } : null;

  const lead = {
    id: u.id, nome: u.nome, concelho: CONC, localidade: c?.localidade || (b0?.morada || '').split(',').slice(-2, -1)[0]?.replace(/\d{4}-\d{3}/, '').trim() || CONC,
    morada: c?.morada || b0?.morada || '', tipo: c?.tipo || 'AL', responsavel: c?.responsavel,
    capacidade: membros.reduce((n, m) => n + (m?.capacidade || 0), 0), registo: c?.registo || '2026-01-01',
    quartos: c?.quartos, piscina: c?.piscina, preco, descricao: b0?.descricao?.slice(0, 400) || undefined,
    quartos_privados: u.bk.some(a => a.dormitorio) ? u.bk.some(a => a.quartos_privados) : undefined,
    unidades: membros.length > 1 ? membros.map(m => m.nome) : c?.unidades,
    telefones, email, atividade, booking, plataformas: plataformas.length ? plataformas : undefined, redes: redes.length ? redes : undefined,
    etiquetas: etiquetas.length ? etiquetas : undefined, gestora: ge || undefined, subnicho: ex.subnicho,
    site: siteL,
    verificacao: { maps: g ? `perfil Google "${g.nome}" (${g.morada}), website: ${g.site || 'sem website'}` : 'sem perfil Google próprio (pelo nome do registo e do anúncio o Maps devolve outra casa ou nada)',
      pesquisa: pesqTxt(u.id, u.nome) || 'pesquisa não corrida', dominio: dominioTxt(u.id), data: HOJE },
  };
  if ((camCruz[u.id] || []).length) lead.verificacao.maps += `; ficha da Câmara (${camCruz[u.id].map(x => x.nome).join(', ')})`;
  if (u.pequena) Object.assign(lead.verificacao, { pesquisa: lead.verificacao.pesquisa === 'pesquisa não corrida' ? 'casa com menos de 5 pessoas: entra só pela gestora; o site da casa não foi verificado' : lead.verificacao.pesquisa, dominio: dominioTxt(u.id) || 'não verificado (casa pequena de gestora)' });
  const pt = pontuacao(lead);
  lead.subnicho = pt.subnicho;

  // nota mínima (22/10/2026): Booking < 7,5 sai; 7,5–8 só fica com mais de 50; Airbnb < 4,2 sai; sempre com 10+ avaliações
  const abMau = u.ab.find(a => a.nota != null && a.nota < 4.2 && a.avaliacoes >= 10);
  const bkMau = booking && booking.nota > 0 && booking.avaliacoes >= 10 && (booking.nota < 7.5 || (booking.nota < 8 && booking.avaliacoes <= 50)); // nota 0 = sem nota
  const notaMa = bkMau ? `Booking ${virg(booking.nota)} com ${booking.avaliacoes} avaliações (mínimo 7,5; entre 7,5 e 8 só com mais de 50)` : abMau ? `Airbnb ${virg(abMau.nota)} com ${abMau.avaliacoes} avaliações (mínimo 4,2)` : null;
  const provaTxt = [...redes.map(r => `${r.nome} ${r.seguidores} seguidores`), b0 && `Booking ${b0.nota != null ? virg(b0.nota) : 'sem nota'} (${b0.avaliacoes})`, ...plataformas.map(p => `${p.nome} ${p.nota != null ? virg(p.nota) : 'novo'} (${p.avaliacoes || 0}${p.ultima ? ', última ' + p.ultima : ''})`)].filter(Boolean).join(' · ');
  if (notaMa) { lead.funil = 'eliminado'; lead.motivo = `Nota baixa: ${notaMa}`; }
  else if (siteL?.veredito === 'moderno' && !ge) { lead.funil = 'eliminado'; lead.motivo = `Site moderno (${siteL.prova})`; }
  else if (!telefones.length) {
    const boa = ge || pt.escalao !== 'C';
    lead.verificacao.contacto = `registo, Google e lista da Câmara sem telefone${contactos[u.id] ? '; procura a fundo: ' + contactos[u.id].procurado.join(', ') : ''}`;
    // casa de gestora: procura-se o contacto da gestora (quem se liga), se ela tiver nome de empresa e não só um primeiro nome
    const alvo = ge && ge.nome.split(' ').length > 1 ? ge.nome : u.nome;
    if (boa && !contactos[u.id]) semContacto.push({ id: u.id, nome: alvo, localidade: lead.localidade, site: siteL?.url, email });
    lead.funil = 'eliminado'; lead.motivo = `Sem contacto: ${boa ? (contactos[u.id] ? 'procura a fundo sem telefone' : 'POR PROCURAR A FUNDO') : 'escalão C, sem telefone no registo, no Google nem na Câmara'} · ${provaTxt}`;
  }
  // casa de gestora: quem compra é a gestora; o site da casa não decide (vai para o separador Gestoras)
  else if (ge && telefones.length) { lead.funil = 'contactar'; lead.motivo = `Gestora ${ge.nome} · site da casa: ${siteL ? siteL.veredito + (s.nota ? ' (' + s.nota + ')' : '') : s.nota} · ${provaTxt}`; }
  else if (siteL?.veredito === 'duvida') { lead.funil = 'duvida'; lead.motivo = `Site em dúvida: ${s.nota || ''} · ${provaTxt}`; }
  else { lead.funil = 'contactar'; lead.motivo = `${siteL ? 'Site antigo: ' + (s.nota || '') : 'Sem site: ' + s.nota} · ${provaTxt}`; }
  leads.push(lead);
}

// casas do registo (não pequenas) sem anúncio ativo: paradas, com a pesquisa que o prova
const ativos = new Set(unidades.flatMap(u => u.membros));
// registo sem anúncio mas do mesmo dono (telefone ou titular) que uma casa ativa: é o mesmo negócio, não uma parada
const telsDe = c => c.telefones.map(t => t.numero.replace(/\D/g, ''));
const titular = c => sa(c.responsavel).replace(/[^a-z0-9]+/g, ' ').replace(/\b(lda|unipessoal|sociedade|s a)\b/g, '').trim();
const membrosAtivos = cand.filter(c => ativos.has(c.id));
const mesmoDono = c => membrosAtivos.find(m => (telsDe(c).length && telsDe(c).some(t => telsDe(m).includes(t))) || (titular(c).length > 8 && titular(c) === titular(m)));
for (const c of cand) {
  if (c.pequena || ativos.has(c.id) || mexida(c.id)) continue;
  if (mesmoDono(c)) continue;
  const p = paradas[c.id];
  leads.push({ id: c.id, nome: c.nome.replace(/^"|"$/g, '').trim(), concelho: CONC, localidade: c.localidade, morada: c.morada, tipo: c.tipo, responsavel: c.responsavel,
    capacidade: c.capacidade, registo: c.registo, telefones: c.telefones, funil: 'eliminado',
    motivo: `Parada: nenhum anúncio ativo no Booking nem no Airbnb (lidos a ${HOJE})${p ? '; ' + p.verificacao : '; PESQUISA PELO NOME POR FAZER'}`,
    verificacao: p ? { parada: p.verificacao, data: HOJE } : undefined });
}

escreve(f('novos'), { concelho: CONC, leads });
escreve(f('sem-contacto'), semContacto);
const vivas = leads.filter(l => l.funil !== 'eliminado');
const n = fn => leads.filter(fn).length;
const esc = k => vivas.filter(l => pontuacao(l).escalao === k).length;
console.log(`ativas ${ver.length} · LIGAR ${n(l => l.funil === 'contactar')} (gestoras ${esc('G')}, A ${esc('A')}, B ${esc('B')}, C ${esc('C')}) · DÚVIDA ${n(l => l.funil === 'duvida')}`);
console.log(`FORA ${n(l => l.funil === 'eliminado')}: paradas ${n(l => /^Parada/.test(l.motivo))} · nota ${n(l => /^Nota/.test(l.motivo))} · site moderno ${n(l => /^Site moderno/.test(l.motivo))} · sem contacto ${n(l => /^Sem contacto/.test(l.motivo))}`);
if (semContacto.length) console.log(`${semContacto.length} casas boas sem telefone -> node ferramentas/contactos.mjs "${CONC}" e volta a correr "final"`);
if (porRever.length) console.log(`${porRever.length} casas com site por rever (falta o veredito): ${porRever.join(', ')}`);
const semP = leads.filter(l => /PESQUISA PELO NOME POR FAZER/.test(l.motivo)).length;
if (semP) console.log(`${semP} paradas sem a pesquisa pelo nome -> node ferramentas/paradas.mjs "${CONC}" (o juntar.js recusa-as)`);
console.log('->', path.relative(process.cwd(), f('novos')));
