// Auditoria de um concelho ANTES de gravar: prova, com números, que não ficou nenhuma casa por apanhar nem por verificar.
//   node ferramentas/auditar.js "<Concelho>"
// Passa por todos os sítios onde o funil já falhou (Régua, 22-23/10/2026) e, para cada um, diz OK ou FALHA com a lista
// do que falta. Escreve data/auditoria-<c>.json { ok, data, falhas, avisos }. O juntar.js recusa gravar sem auditoria OK
// mais recente do que o data/novos-<c>.json.
// FALHA = falta trabalho (correr uma ferramenta, rever à mão). AVISO = decisão para olhar antes de mostrar ao Diogo.
const fs = require('fs');
const path = require('path');
const { lerPoligono, dentro, distFronteira } = require('./lib/concelho.js');

const CONC = process.argv[2];
if (!CONC) { console.error('uso: node ferramentas/auditar.js "<Concelho>"'); process.exit(1); }
const D = path.join(__dirname, '..', 'data'), nf = CONC.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
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

// 0. registo e contorno do concelho
verifica(cand.length > 0, `Registo: ${cand.length} casas (0 = nome do concelho mal escrito, ou o webservice falhou: node ferramentas/rnal.js)`);
verifica(!!GEO, 'contorno oficial do concelho (data/poligono): sem ele a fronteira decide-se pelo código postal');
if (GEO) {
  // o contorno é o do concelho (e não o de uma freguesia com o mesmo nome): as casas do registo no Booking caem dentro
  const doReg = Object.values(bk).filter(a => a.registo && a.lat != null);
  const dentroReg = doReg.filter(a => dentro(GEO, a.lat, a.lng)).length;
  verifica(doReg.length < 5 || dentroReg >= doReg.length * 0.8, `Contorno: ${dentroReg} de ${doReg.length} anúncios do Booking ligados ao registo caem dentro (menos de 80% = contorno errado, talvez de uma freguesia: apagar data/poligono-${nf}.json)`);
}

// 1. Booking: lista completa e fronteira
const bkTodos = Object.values(bk);
const lista = BK.lista_sem_datas || [];
verifica(BK.total_booking && lista.length >= BK.total_booking * 0.95, `Booking: a lista sem datas carregou ${lista.length} de ${BK.total_booking || '?'} casas que o Booking diz ter (${!BK.lista_sem_datas ? 'ficheiro antigo: correr booking.mjs outra vez' : 'menos de 95% = a lista cortou'})`);
const bkPorLer = [...lista.filter(s => !bk[s]), ...(BK.pendentes || [])];
verifica(!bkPorLer.length, 'Booking: todos os anúncios encontrados foram lidos (volta a correr booking.mjs: retoma)', [...new Set(bkPorLer)]);
const bkSemCoord = Object.entries(bk).filter(([, a]) => a.lat == null).map(([s, a]) => `${a.nome} (${s})`);
verifica(!bkSemCoord.length, 'Booking: todos os anúncios com coordenadas (node ferramentas/booking.mjs "<C>" --coords)', bkSemCoord);
if (GEO) {
  const errados = Object.entries(bk).filter(([, a]) => a.lat != null && dentro(GEO, a.lat, a.lng) !== !!a.do_concelho).map(([, a]) => `${a.nome}: coordenadas dizem ${dentro(GEO, a.lat, a.lng) ? 'DENTRO' : 'fora'}, ficha diz ${a.do_concelho ? 'dentro' : 'fora'}`);
  verifica(!errados.length, 'Booking: "do concelho" bate com o contorno', errados);
  const perdidos = Object.values(bk).filter(a => a.ativa && a.lat != null && dentro(GEO, a.lat, a.lng) && !urlsEmUnidades.has(a.url) && !AJ.FORA?.['bk-' + (a.url.match(/hotel\/pt\/([^.]+)/) || [])[1]])
    .map(a => `${a.nome} | ${a.morada}`);
  verifica(!perdidos.length, 'Booking: todos os anúncios ativos dentro do concelho estão numa casa (ou em FORA com motivo)', perdidos);
}

// 2. Airbnb: todos os cartões lidos, da página, com coordenadas; nenhum quadrado cortado
verifica(!!AB.cartoes?.length, `Airbnb: pesquisa por quadrados com ${AB.cartoes?.length || 0} cartões guardados (0 ou ficheiro antigo: correr airbnb.mjs outra vez)`);
const abPorLer = (AB.cartoes || []).filter(i => !ab[i]).map(i => `${i}${AB.erros?.[i] ? ' (' + AB.erros[i] + ')' : ''}`);
verifica(!abPorLer.length, 'Airbnb: todos os cartões da pesquisa foram lidos (volta a correr airbnb.mjs: retoma)', abPorLer);
const abVelhos = Object.entries(ab).filter(([, a]) => !a.v3).map(([i, a]) => `${a.titulo} (${i})`);
verifica(!abVelhos.length, 'Airbnb: anúncios lidos da página com coordenadas e hóspedes (node ferramentas/airbnb.mjs "<C>" --reler)', abVelhos);
const abSemCoord = Object.entries(ab).filter(([, a]) => a.v3 && a.lat == null).map(([i, a]) => `${a.titulo} (${i})`);
verifica(!abSemCoord.length, 'Airbnb: todos com coordenadas (sem elas o concelho decide-se pelo texto da terra)', abSemCoord, true);
verifica(!(AB.cortados || []).length, `Airbnb: nenhum quadrado ainda cheio no último nível (${(AB.cortados || []).length}: o Airbnb pode ter escondido anúncios aí)`, (AB.cortados || []).map(q => q.map(x => x.toFixed(3)).join(',')), true);
const abSemNota = Object.entries(ab).filter(([, a]) => a.v2 && a.nota == null && a.avaliacoes > 0).map(([i, a]) => `${a.titulo} (${i})`);
verifica(!abSemNota.length, 'Airbnb: anúncios com avaliações têm nota lida', abSemNota);
if (GEO) {
  // (a menos de 600 m da fronteira decide a terra escrita no anúncio — o montar.js faz o mesmo; ficam num aviso, para ver)
  const terraDe = a => String(a.tipo || '').length < 80 ? (String(a.tipo || '').match(/ em ([^,|]+), Portugal$/) || [])[1] : null;
  const dentroAb = Object.entries(ab).filter(([i, a]) => a.ativa && a.lat != null && dentro(GEO, a.lat, a.lng) && !urlsEmUnidades.has(a.url) && !AJ.FORA?.['ab-' + i]);
  const pelaTerra = dentroAb.filter(([, a]) => terraDe(a) && distFronteira(GEO, a.lat, a.lng) < 0.6);
  const perdidosAb = dentroAb.filter(x => !pelaTerra.includes(x)).map(([i, a]) => `${a.titulo} (${i})`);
  verifica(!perdidosAb.length, 'Airbnb: todos os anúncios ativos dentro do concelho estão numa casa (ou em FORA com motivo)', perdidosAb);
  verifica(!pelaTerra.length, 'Airbnb: anúncios junto à fronteira dados como de fora pela terra do anúncio (confirmar)', pelaTerra.map(([i, a]) => `${a.titulo} (${i}): "${terraDe(a)}", a ${Math.round(distFronteira(GEO, a.lat, a.lng) * 1000)} m da fronteira`), true);
}

// 3. Registo: cada casa com 5+ pessoas está ativa ou foi pesquisada (nome + redes)
const semProva = cand.filter(c => !c.pequena && !emUnidade.has(c.id)).filter(c => {
  const p = paradas[c.id];
  return !p || (!p.ativa && p.redes_procuradas !== 2);
}).map(c => `${c.id} ${c.nome}${paradas[c.id] ? ' (falta procurar redes: paradas.mjs --redes)' : ' (falta pesquisar o nome: paradas.mjs)'}`);
verifica(!semProva.length, 'Registo: todas as casas com 5+ pessoas estão ativas ou foram pesquisadas pelo nome e pelas redes', semProva);
const falhouPesq = Object.entries(paradas).filter(([, p]) => /falhou|FALHOU/.test(p.verificacao || '') || !p.q).map(([id]) => id);
verifica(!falhouPesq.length, 'Paradas: nenhuma pesquisa falhada', falhouPesq);
// cada nome do titular pesquisado (não só o primeiro), sem o nº da unidade
const limpo = n => String(n || '').replace(/^"|"$/g, '').replace(/\s*(n\.?º\s*|nº\s*|#\s*)?\d{1,2}\s*$/i, '').replace(/\s+/g, ' ').trim();
const nomesPorPesquisar = PV.filter(v => paradas[v.id]).flatMap(v => [...new Set([v.nome, ...(v.nomes || [])].map(limpo).filter(n => n.length > 2))].slice(0, 4)
  .filter(n => !(paradas[v.id].qs || [paradas[v.id].q]).some(q => String(q).includes(`"${n}"`))).map(n => `${v.id}: "${n}"`));
verifica(!nomesPorPesquisar.length, 'Paradas: todos os nomes de cada titular pesquisados (paradas.mjs)', nomesPorPesquisar);
// anúncios do Airbnb dados como ativos pelo paradas.mjs com a leitura antiga (sem descer a página: 0 avaliações = "novo")
const achadosVelhos = Object.entries(paradas).flatMap(([id, p]) => (p.achados || []).filter(a => a.nome === 'Airbnb' && a.ativa && a.hospedes === undefined && !a.de_airbnb_mjs).map(a => `${id} ${a.url}`));
verifica(!achadosVelhos.length, 'Paradas: anúncios do Airbnb lidos com a página toda (node ferramentas/paradas.mjs "<C>" --reler)', achadosVelhos);
const expedia = Object.entries(paradas).flatMap(([id, p]) => (p.achados || []).filter(a => a.nome === 'Expedia' && a.ativa).map(a => `${id} ${a.url}`));
verifica(!expedia.length, 'Paradas: o Expedia não conta como prova de atividade (paradas.mjs --reler)', expedia);

// 4. Maps e Câmara: cada sítio do concelho foi ligado ou pesquisado
const naoPesquisados = PV.filter(v => !paradas[v.id]).map(v => `${v.id} ${v.nome} (${v.origem || 'registo'})`);
verifica(!naoPesquisados.length, 'Por verificar: todas as casas descobertas (Maps, Câmara, registo) foram pesquisadas (paradas.mjs)', naoPesquisados);
for (const fonte of ['descobrir', 'camara']) {
  const fx = J(f(fonte), null);
  verifica(!!fx, `${fonte === 'descobrir' ? 'Google Maps (descobrir.mjs)' : 'lista da Câmara (camara.mjs)'} corrido`, [], fonte === 'camara');
}
const DESC = J(f('descobrir'), null);
if (DESC) {
  const terrasFalta = (DESC.terras || []).filter(t => !(DESC.feitas || []).filter(q => sa(q).includes(sa(t))).length >= 3);
  verifica(!!DESC.terras && !terrasFalta.length, `Google Maps: as 3 pesquisas feitas em todas as terras (${(DESC.terras || []).length}) do concelho${DESC.terras ? '' : ' (ficheiro antigo: correr descobrir.mjs outra vez)'}`, terrasFalta);
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
// (com todos os nomes da casa: registo sem o nº da unidade, anúncios, Câmara e gestora; e com capacidade desconhecida também)
const boasSemProcura = novos.filter(l => /^Sem contacto/.test(l.motivo || '') && (/POR PROCURAR A FUNDO/.test(l.motivo) || ((l.gestora || pontuacao(l).escalao !== 'C' || !l.capacidade) && !contactos[l.id])))
  .map(l => `${l.id} ${l.nome}`);
verifica(!boasSemProcura.length, 'Contactos: casas A, B, de gestora e de tamanho desconhecido sem telefone tiveram a procura a fundo com todos os nomes (contactos.mjs)', boasSemProcura);
// gestora que ficou sem nenhuma casa para ligar: desaparecia do separador Gestoras
const gestorasTodas = new Map();
for (const l of novos) if (l.gestora) (gestorasTodas.get(l.gestora.nome) || gestorasTodas.set(l.gestora.nome, []).get(l.gestora.nome)).push(l);
const gestorasPerdidas = [...gestorasTodas].filter(([, ls]) => ls.every(l => l.funil === 'eliminado')).map(([g, ls]) => `${g}: ${ls.map(l => `${l.nome} (${l.motivo.split(':')[0]})`).join(', ')}`);
verifica(!gestorasPerdidas.length, 'Gestoras: todas com pelo menos uma casa para ligar (as que saem: confirmar o motivo)', gestorasPerdidas, true);
// prova de atividade fraca
const provaFraca = novos.filter(l => l.funil !== 'eliminado' && /expedia/i.test(l.atividade?.fonte || '')).map(l => `${l.id} ${l.nome}`);
verifica(!provaFraca.length, 'Atividade: nenhuma casa para ligar só com o Expedia como prova', provaFraca);
// o mesmo telefone em duas casas para ligar (fora das gestoras): é o mesmo negócio -> juntar (ou NAO_FUNDIR em ajustes)
const porTel = new Map();
for (const l of novos) if (l.funil !== 'eliminado' && !l.gestora) for (const t of l.telefones || []) (porTel.get(t.numero) || porTel.set(t.numero, []).get(t.numero)).push(l);
const naoFundir = new Set(AJ.NAO_FUNDIR || []);
const dup = [...porTel].filter(([, ls]) => ls.length > 1 && !ls.every(l => naoFundir.has(l.id))).map(([n, ls]) => `…${n.slice(-3)}: ${ls.map(l => `${l.id} ${l.nome}`).join(' / ')}`);
verifica(!dup.length, 'Duplicados: nenhum telefone em duas casas para ligar', dup);
// casas para ligar com capacidade desconhecida (sem registo, sem hóspedes no Airbnb): ver se têm 5 pessoas
const cap0 = novos.filter(l => l.funil !== 'eliminado' && !l.capacidade && !l.gestora).map(l => `${l.id} ${l.nome}`);
verifica(!cap0.length, 'Capacidade: casas para ligar com nº de pessoas desconhecido (confirmar que têm 5 ou mais)', cap0, true);
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
// a versão exata do novos-<c>.json que foi auditada (o juntar.js só grava essa)
const novos_mtime = fs.existsSync(f('novos')) ? fs.statSync(f('novos')).mtimeMs : null;
fs.writeFileSync(f('auditoria'), JSON.stringify({ ok, data: new Date().toISOString(), novos_mtime, falhas, avisos }, null, 1));
console.log(`\n${ok ? 'AUDITORIA OK' : `AUDITORIA FALHOU: ${falhas.length} ponto(s) por resolver`}${avisos.length ? ` · ${avisos.length} aviso(s) para rever` : ''} -> data/auditoria-${nf}.json`);
process.exit(ok ? 0 : 1);
