// Auditoria de um concelho ANTES de gravar: prova, com números, que não ficou nenhuma casa por apanhar nem por verificar.
//   node ferramentas/auditar.js "<Concelho>"
// Passa por todos os sítios onde o funil já falhou (Régua, 22-23/10/2026) e, para cada um, diz OK ou FALHA com a lista
// do que falta. Escreve data/auditoria-<c>.json { ok, data, falhas, avisos }. O juntar.js recusa gravar sem auditoria OK
// mais recente do que o data/novos-<c>.json.
// FALHA = falta trabalho (correr uma ferramenta, rever à mão). AVISO = decisão para olhar antes de mostrar ao Diogo.
const fs = require('fs');
const path = require('path');
const { lerPoligono, dentro } = require('./lib/concelho.js');

const CONC = process.argv[2];
if (!CONC) { console.error('uso: node ferramentas/auditar.js "<Concelho>"'); process.exit(1); }
const D = path.join(__dirname, '..', 'data'), nf = CONC.toLowerCase().replace(/\s+/g, '-');
const f = n => path.join(D, `${n}-${nf}.json`);
const J = (file, fb) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fb; } };
const sa = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

const cand = J(f('candidatos'), { candidatos: [] }).candidatos;
const BK = J(f('booking'), { anuncios: {} }), bk = BK.anuncios;
const AB = J(f('airbnb'), { anuncios: {} }), ab = AB.anuncios;
const U = J(f('unidades'), []);
const paradas = J(f('paradas'), {});
const PV = J(f('por-verificar'), []);
const novos = J(f('novos'), { leads: [] }).leads;
const maps = J(f('maps'), {}), pesq = J(f('pesquisa'), {}), doms = J(f('dominios'), {});
const contactos = J(f('contactos'), {});
const AJ = J(f('ajustes'), {});
const GEO = lerPoligono(CONC);
const pontuacao = require('../pontuacao.js');

const falhas = [], avisos = [];
const verifica = (ok, titulo, lista = [], aviso = false) => {
  const linha = `${ok ? 'OK   ' : aviso ? 'AVISO' : 'FALHA'} ${titulo}${!ok && lista.length ? `\n        ${lista.slice(0, 25).join('\n        ')}${lista.length > 25 ? `\n        … e mais ${lista.length - 25}` : ''}` : ''}`;
  console.log(linha);
  if (!ok) (aviso ? avisos : falhas).push({ titulo, lista });
};
const emUnidade = new Set(U.flatMap(u => [u.id, ...u.membros]));
const urlsEmUnidades = new Set(U.flatMap(u => [...u.bk, ...u.ab, ...u.outras].map(a => a.url)));

// 0. contorno do concelho
verifica(!!GEO, 'contorno oficial do concelho (data/poligono): sem ele a fronteira decide-se pelo código postal');

// 1. Booking: lista completa e fronteira
const bkTodos = Object.values(bk);
verifica(BK.total_booking && bkTodos.length >= BK.total_booking * 0.95, `Booking: lidos ${bkTodos.length} de ${BK.total_booking || '?'} que o Booking diz ter no destino`);
const bkSemCoord = Object.entries(bk).filter(([, a]) => a.lat == null).map(([s, a]) => `${a.nome} (${s})`);
verifica(!bkSemCoord.length, 'Booking: todos os anúncios com coordenadas (node ferramentas/booking.mjs "<C>" --coords)', bkSemCoord);
if (GEO) {
  const errados = Object.entries(bk).filter(([, a]) => a.lat != null && dentro(GEO, a.lat, a.lng) !== !!a.do_concelho).map(([, a]) => `${a.nome}: coordenadas dizem ${dentro(GEO, a.lat, a.lng) ? 'DENTRO' : 'fora'}, ficha diz ${a.do_concelho ? 'dentro' : 'fora'}`);
  verifica(!errados.length, 'Booking: "do concelho" bate com o contorno', errados);
  const perdidos = Object.values(bk).filter(a => a.ativa && a.lat != null && dentro(GEO, a.lat, a.lng) && !urlsEmUnidades.has(a.url) && !AJ.FORA?.['bk-' + (a.url.match(/hotel\/pt\/([^.]+)/) || [])[1]])
    .map(a => `${a.nome} | ${a.morada}`);
  verifica(!perdidos.length, 'Booking: todos os anúncios ativos dentro do concelho estão numa casa (ou em FORA com motivo)', perdidos);
}

// 2. Airbnb: lido da página (nota, terra, anfitrião) e nada cortado
const abDeCa = Object.entries(ab).filter(([, a]) => a.registo || !a.al);
const abVelhos = abDeCa.filter(([, a]) => !a.v2).map(([i, a]) => `${a.titulo} (${i})`);
verifica(!abVelhos.length, 'Airbnb: anúncios do concelho lidos da página (node ferramentas/airbnb.mjs "<C>" --reler)', abVelhos);
const abSemTerra = abDeCa.filter(([, a]) => a.v2 && !a.tipo).map(([i, a]) => `${a.titulo} (${i})`);
verifica(!abSemTerra.length, 'Airbnb: todos com terra (sem ela não se sabe se é do concelho)', abSemTerra, true);
const abSemNota = abDeCa.filter(([, a]) => a.v2 && a.nota == null && a.avaliacoes > 0).map(([i, a]) => `${a.titulo} (${i})`);
verifica(!abSemNota.length, 'Airbnb: anúncios com avaliações têm nota lida', abSemNota);

// 3. Registo: cada casa com 5+ pessoas está ativa ou foi pesquisada (nome + redes)
const semProva = cand.filter(c => !c.pequena && !emUnidade.has(c.id)).filter(c => {
  const p = paradas[c.id];
  return !p || (!p.ativa && p.redes_procuradas !== 2);
}).map(c => `${c.id} ${c.nome}${paradas[c.id] ? ' (falta procurar redes: paradas.mjs --redes)' : ' (falta pesquisar o nome: paradas.mjs)'}`);
verifica(!semProva.length, 'Registo: todas as casas com 5+ pessoas estão ativas ou foram pesquisadas pelo nome e pelas redes', semProva);
const falhouPesq = Object.entries(paradas).filter(([, p]) => /falhou/.test(p.verificacao || '') || !p.q).map(([id]) => id);
verifica(!falhouPesq.length, 'Paradas: nenhuma pesquisa falhada', falhouPesq);

// 4. Maps e Câmara: cada sítio do concelho foi ligado ou pesquisado
const naoPesquisados = PV.filter(v => !paradas[v.id]).map(v => `${v.id} ${v.nome} (${v.origem || 'registo'})`);
verifica(!naoPesquisados.length, 'Por verificar: todas as casas descobertas (Maps, Câmara, registo) foram pesquisadas (paradas.mjs)', naoPesquisados);
for (const fonte of ['descobrir', 'camara']) {
  const fx = J(f(fonte), null);
  verifica(!!fx, `${fonte === 'descobrir' ? 'Google Maps (descobrir.mjs)' : 'lista da Câmara (camara.mjs)'} corrido`, [], fonte === 'camara');
}

// 5. Cada casa ativa verificada (Google, pesquisa, domínio) e cada site com veredito
const ver = U.filter(u => !u.pequena);
const semVerif = ver.filter(u => !maps[u.id] || !pesq[u.id] || pesq[u.id].erro || !doms[u.id]).map(u => `${u.id} ${u.nome}: ${[!maps[u.id] && 'Google', (!pesq[u.id] || pesq[u.id].erro) && 'pesquisa', !doms[u.id] && 'domínios'].filter(Boolean).join(', ')}`);
verifica(!semVerif.length, 'Casas ativas: Google, pesquisa e domínios feitos', semVerif);
const porRever = novos.filter(l => /por rever/.test(l.motivo || '') || (l.site == null && /site por rever/.test(l.verificacao?.maps || ''))).map(l => l.nome);
const semVeredito = J(f('sites-a-avaliar'), []).filter(s => {
  const V = Object.assign({}, ...fs.readdirSync(D).filter(x => x.startsWith(`sites-veredito-${nf}`)).map(x => J(path.join(D, x), {})));
  return !Object.entries(V).some(([k, v]) => k.split('~')[0] === s.id.split('~')[0] && host(v.url) === host(s.url)) && !AJ.SITES?.[s.id.split('~')[0]];
}).map(s => `${s.id} ${s.url}`);
verifica(!semVeredito.length && !porRever.length, 'Sites: todos os candidatos com veredito do subagente', [...semVeredito, ...porRever]);

// 6. Contactos: nenhuma casa boa saiu sem a procura a fundo
const boasSemProcura = novos.filter(l => /^Sem contacto/.test(l.motivo || '') && (l.gestora || pontuacao(l).escalao !== 'C') && !contactos[l.id]).map(l => `${l.id} ${l.nome}`);
verifica(!boasSemProcura.length, 'Contactos: casas A, B e de gestora sem telefone tiveram a procura a fundo (contactos.mjs)', boasSemProcura);
const paradasSemProva = novos.filter(l => /^Parada/.test(l.motivo || '') && !l.verificacao?.parada).map(l => l.nome);
verifica(!paradasSemProva.length, 'Paradas: todas com a pesquisa registada', paradasSemProva);

// 7. Gestoras possíveis que não foram marcadas: decidir antes de mostrar
const marcadas = new Set(novos.filter(l => l.gestora).map(l => l.id));
const sinais = [];
const porAnfitriao = new Map();
for (const [i, a] of Object.entries(ab)) if (a.anfitriao_chave) (porAnfitriao.get(a.anfitriao_chave) || porAnfitriao.set(a.anfitriao_chave, []).get(a.anfitriao_chave)).push([i, a]);
for (const [k, v] of porAnfitriao) {
  if (v.length < 3) continue;
  const casasCa = U.filter(u => u.ab.some(x => v.some(([i]) => i === x.id)));
  if (!casasCa.length || casasCa.every(u => marcadas.has(u.id))) continue;
  const titulares = new Set(v.map(([, a]) => a.registo).filter(Boolean).map(id => sa(cand.find(c => c.id === id)?.responsavel)));
  sinais.push(`Airbnb ${k.replace('|', ', ')}: ${v.length} anúncios (${[...new Set(v.map(([, a]) => a.titulo.slice(0, 22)))].slice(0, 4).join(' / ')}), ${titulares.size} titular(es) no registo -> ${titulares.size >= 2 ? 'devia ser gestora?' : 'parece dono com várias casas'}`);
}
// Booking "gerido por": um nome de pessoa numa só casa é o dono; conta um nome de empresa, ou o mesmo nome em casas de titulares diferentes
const EMPRESA = /\b(lda|ltd|unipessoal|s\.?a\.?|homes?|rentals?|gest[aã]o|management|properties|villas|hosting|stays?|hospitality)\b/i;
const gerentes = new Map();
for (const u of U) for (const a of u.bk) if (a.gerido_por && !/^uma? anfitri/i.test(a.gerido_por)) (gerentes.get(a.gerido_por) || gerentes.set(a.gerido_por, new Set()).get(a.gerido_por)).add(u);
for (const [g, us] of gerentes) {
  const casas = [...us].filter(u => !marcadas.has(u.id));
  if (!casas.length) continue;
  const titulares = new Set(casas.flatMap(u => u.membros).map(id => sa(cand.find(c => c.id === id)?.responsavel)));
  const empresaAlheia = EMPRESA.test(g) && !casas.some(u => sa(g).includes(sa(u.nome).split(' ').filter(w => w.length > 3)[0] || '§'));
  if (empresaAlheia || titulares.size >= 2) sinais.push(`Booking: gerido por "${g}" (${casas.map(u => u.nome).join(', ')})`);
}
verifica(!sinais.length, 'Gestoras: sinais de gestão não marcados (ver cada um; os que forem gestoras -> gestoras-conhecidas.json ou ajustes EXTRA)', sinais, true);

// 8. Anúncios sem registo (podem ser casas do registo com outro nome)
const semReg = U.filter(u => !u.registo).map(u => `${u.id} | ${u.nome}`);
verifica(!semReg.length, `Casas sem registo associado: ${semReg.length} (confirmar que não são casas do registo com outro nome -> MAO)`, semReg, true);
// 9. Nomes que são títulos de página
const genericos = novos.filter(l => /^(airbnb|booking|vrbo|expedia|facebook|instagram)\b|alojamentos de férias/i.test(l.nome)).map(l => `${l.id} ${l.nome}`);
verifica(!genericos.length, 'Nomes: nenhuma casa com nome de página genérico', genericos);

const ok = !falhas.length;
fs.writeFileSync(f('auditoria'), JSON.stringify({ ok, data: new Date().toISOString(), falhas, avisos }, null, 1));
console.log(`\n${ok ? 'AUDITORIA OK' : `AUDITORIA FALHOU: ${falhas.length} ponto(s) por resolver`}${avisos.length ? ` · ${avisos.length} aviso(s) para rever` : ''} -> data/auditoria-${nf}.json`);
process.exit(ok ? 0 : 1);
