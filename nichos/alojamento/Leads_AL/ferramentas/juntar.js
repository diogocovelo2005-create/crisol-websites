// Junta leads verificadas ao dashboard, com validação. Nunca toca em data/estado.json (é do utilizador).
//   node ferramentas/juntar.js data/novos-<concelho>.json
// O ficheiro de entrada: { "concelho": "...", "leads": [ ... ] }  (formato no SKILL.md)
// Se alguma lead falhar a validação, NADA é gravado e os erros são listados.
const fs = require('fs');
const path = require('path');

const entrada = process.argv[2];
if (!entrada) { console.error('uso: node ferramentas/juntar.js <ficheiro.json>'); process.exit(1); }

const DATA = path.join(__dirname, '..', 'data');
const lerJSON = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return fb; throw e; } };
const { concelho, leads: novas } = lerJSON(entrada);
const atual = lerJSON(path.join(DATA, 'leads.json'), { leads: [] });
const estado = lerJSON(path.join(DATA, 'estado.json'), {});

function validar(l) {
  const e = [];
  for (const c of ['id', 'nome', 'concelho', 'localidade', 'funil', 'motivo']) if (!l[c]) e.push(`falta "${c}"`);
  if (!['contactar', 'duvida', 'eliminado'].includes(l.funil)) e.push(`funil inválido "${l.funil}"`);
  const b = l.booking;
  if (b && (typeof b.nota !== 'number' || typeof b.avaliacoes !== 'number' || !b.url)) e.push('booking precisa de url, nota e avaliacoes (números)');
  // Outras plataformas (Airbnb, Vrbo, ...): o Booking não é obrigatório
  if (l.plataformas && (!Array.isArray(l.plataformas) || l.plataformas.some(p => !p.nome || !p.url)))
    e.push('plataformas tem de ser uma lista de { nome, url, nota?, avaliacoes? }');
  if (typeof l.capacidade !== 'number') e.push('falta "capacidade" (nº de pessoas do registo)');
  if (!/^\d{4}-\d{2}-\d{2}/.test(l.registo || '')) e.push('falta "registo" (data do registo, copiada do candidato): conta para a pontuação');
  if (!Array.isArray(l.telefones) || l.telefones.some(t => !/^([29]\d{2} \d{3} \d{3}|\+(?!351)\d{2,3}( \d{1,4}){2,5})$/.test(t.numero) || !t.fontes?.length))
    e.push('telefones tem de ser uma lista de { numero: "912 345 678" (ou estrangeiro "+33 7 67 79 75 13"), fontes: [...] }');
  const v = l.verificacao || {};
  // Regras de 22/10/2026 (decisão do Diogo). Só chega a ele uma casa ATIVA, com NOTA ACEITÁVEL, SEM SITE MODERNO e COM CONTACTO.
  // Ativa = uma página de plataforma aberta e lida (Booking, Airbnb, Vrbo, Hostelworld), ou redes sociais com publicações recentes.
  // Nota (24/10/2026): Booking abaixo de 7,5 sai; entre 7,5 e 8 só fica com mais de 20 avaliações. Airbnb abaixo de 4,2 sai (10+ avaliações).
  // Contacto: ou tem telefone, ou sai (já não há lista "Mensagem"); antes de sair, uma casa boa tem de ter tido a procura a fundo.
  const a = l.atividade;
  // no Airbnb conta o anúncio com mais avaliações (como no Booking)
  const abP = (l.plataformas || []).filter(p => /airbnb/i.test(p.nome) && p.nota != null).sort((x, y) => (y.avaliacoes || 0) - (x.avaliacoes || 0))[0];
  const airbnb = abP && abP.avaliacoes >= 10 && abP.nota < 4.2 ? abP : null;
  const notaBk = b && b.nota > 0 && (b.nota < 7.5 || (b.nota < 8 && b.avaliacoes <= 20)); // nota 0 = sem nota
  const semTel = !l.telefones?.length;
  const regra = !a ? 'sem prova de atividade (nenhuma plataforma lida nem redes ativas)'
    : notaBk ? `Booking ${b.nota} com ${b.avaliacoes} avaliações (mínimo 7,5; entre 7,5 e 8 só com mais de 20)`
    : airbnb ? `Airbnb ${airbnb.nota} com ${airbnb.avaliacoes} avaliações (mínimo 4,2)`
    : l.site?.veredito === 'moderno' && !l.gestora ? 'site moderno' // casa de gestora: quem compra é a gestora
    : semTel ? 'sem contacto'
    : null;
  if (regra && l.funil !== 'eliminado') e.push(`${regra}: tem de ser eliminado`);
  if (!regra && l.funil === 'eliminado') e.push('eliminada sem regra: só saem as paradas, as de nota baixa, as de site moderno e as sem contacto');
  if (!a && !v.parada) e.push('parada sem prova: falta verificacao.parada (a pesquisa pelo nome que se fez antes de a dar como parada; ferramentas/paradas.mjs)');
  if (regra === 'sem contacto' && !v.contacto) e.push('sem telefone: falta verificacao.contacto (onde se procurou; nas casas A, B e gestoras, a procura a fundo de ferramentas/contactos.mjs)');
  if (l.canal === 'mensagem') e.push('a lista "Mensagem" acabou (22/10/2026): ou tem telefone, ou sai');
  if (typeof l.capacidade === 'number' && l.capacidade > 0 && l.capacidade < 5 && !l.gestora) e.push('menos de 5 pessoas: não entra');
  if (l.gestora && (!l.gestora.nome || !l.gestora.prova)) e.push('gestora precisa de { nome, prova } (ex.: "Booking: gerido por X; 6 anúncios no concelho")');
  if (a && (!a.fonte || !a.url)) e.push('atividade precisa de fonte (Booking, Airbnb, Vrbo, Hostelworld, Facebook, Instagram) e url');
  // Site moderno só com prova de que é recente: design novo no Wayback (3 anos ou menos) ou plataforma recente.
  // Sinais que também existem em sites antigos (https, telemóvel, WordPress, foto grande, cookies, ©) não contam.
  if (l.site?.veredito === 'moderno' && !l.site.prova && !l.gestora) e.push('site moderno precisa de "prova" (Wayback ou plataforma recente); sem prova é "duvida"');
  if (!regra || regra === 'sem contacto') {
    // Regra de ouro: só se afirma "sem site" com as 3 verificações feitas e registadas
    for (const c of ['maps', 'pesquisa', 'dominio']) if (!v[c]) e.push(`verificacao.${c} em falta`);
    if (l.site) {
      if (!l.site.url || !['antigo', 'moderno', 'duvida'].includes(l.site.veredito)) e.push('site precisa de url e veredito antigo/moderno/duvida');
      const esperado = { antigo: 'contactar', duvida: 'duvida' }[l.site.veredito];
      if (!regra && esperado && l.funil !== esperado && !l.gestora) e.push(`site ${l.site.veredito} -> funil devia ser "${esperado}"`);
    } else if (!regra && l.funil !== 'contactar') e.push('sem site -> funil devia ser "contactar"');
  }
  return e;
}

// Auditoria (ferramentas/auditar.js): tem de ter passado DEPOIS da última montagem. Prova, com números, que não ficou
// nenhuma casa por apanhar nem por verificar; sem ela não se grava.
{
  const nf = String(concelho).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');
  const fa = path.join(DATA, `auditoria-${nf}.json`), fn = path.resolve(entrada);
  // só se grava a corrida COMPLETA do concelho (data/novos-<c>.json), e exatamente a versão que a auditoria viu:
  // um ficheiro parcial (só umas casas) retirava do dashboard todas as outras leads do concelho
  if (fn !== path.join(DATA, `novos-${nf}.json`)) { console.error(`NADA GRAVADO. Só se grava data/novos-${nf}.json (a corrida completa do concelho, auditada).`); process.exit(1); }
  const aud = lerJSON(fa, null);
  if (!aud || !aud.ok || aud.novos_mtime !== fs.statSync(fn).mtimeMs) {
    console.error(`NADA GRAVADO. Falta a auditoria OK desta montagem (o novos-${nf}.json mudou depois da auditoria, ou ela falhou):\n  node ferramentas/auditar.js "${concelho}"`);
    process.exit(1);
  }
}
const erros = novas.flatMap(l => validar(l).map(m => `${l.id || '?'} ${l.nome || ''}: ${m}`));
if (erros.length) { console.error(`NADA GRAVADO. ${erros.length} erro(s):\n- ` + erros.join('\n- ')); process.exit(1); }

// Dados de demonstração saem quando entram os primeiros dados reais
let leads = atual.demo ? atual.leads.filter(l => !l.id.startsWith('demo-')) : atual.leads;
const porId = new Map(leads.map(l => [l.id, l]));
let novasN = 0, atualizadas = 0, protegidas = 0;
for (const l of novas) {
  const antiga = porId.get(l.id);
  const s = estado[l.id];
  const mexida = s && (s.estado !== 'por_contactar' || s.decisao || s.estrela || s.notas?.length);
  if (!antiga) { porId.set(l.id, l); novasN++; }
  else if (mexida) { // o utilizador já trabalhou esta lead (estado, decisão, estrela ou notas): não lhe mudar a classificação
    // os factos atualizam-se; o funil fica como estava
    Object.assign(antiga, {
      booking: l.booking || antiga.booking, plataformas: l.plataformas || antiga.plataformas,
      atividade: l.atividade || antiga.atividade, redes: l.redes || antiga.redes, etiquetas: l.etiquetas || antiga.etiquetas,
      canal: undefined, gestora: l.gestora ?? antiga.gestora, preco: l.preco ?? antiga.preco, subnicho: l.subnicho ?? antiga.subnicho,
      descricao: l.descricao ?? antiga.descricao, quartos: l.quartos ?? antiga.quartos, casas_do_dono: l.casas_do_dono ?? antiga.casas_do_dono,
      telefones: l.telefones, email: l.email ?? antiga.email,
      motivo: l.motivo, site: l.site, verificacao: l.verificacao,
      capacidade: l.capacidade, tipos_quarto: l.tipos_quarto ?? antiga.tipos_quarto, registo: l.registo, tipo: l.tipo,
    });
    delete antiga.telefone;
    protegidas++;
  } else { porId.set(l.id, l); atualizadas++; }
}
// leads deste concelho que já não aparecem na corrida (juntaram-se a outra casa, ou saíram do concelho) e que o
// utilizador não trabalhou: retiram-se, para não ficarem repetidas. As trabalhadas ficam sempre.
const idsNovos = new Set(novas.map(l => l.id));
let retiradas = 0;
for (const [id, l] of porId) {
  if (l.concelho !== concelho || idsNovos.has(id)) continue;
  const s = estado[id];
  if (s && (s.estado !== 'por_contactar' || s.decisao || s.estrela || s.notas?.length)) continue;
  porId.delete(id); retiradas++;
}
leads = [...porId.values()];

const concelhos = (atual.demo ? [] : atual.concelhos || []).filter(c => c.nome !== concelho);
concelhos.push({ nome: concelho, data: new Date().toISOString().slice(0, 10), total: leads.filter(l => l.concelho === concelho).length });

const saida = { atualizado: new Date().toISOString().slice(0, 10), concelhos, leads };
const f = path.join(DATA, 'leads.json');
if (fs.existsSync(f)) fs.copyFileSync(f, path.join(DATA, 'leads.bak.json'));
fs.writeFileSync(f + '.tmp', JSON.stringify(saida, null, 2));
JSON.parse(fs.readFileSync(f + '.tmp', 'utf8'));
fs.renameSync(f + '.tmp', f);

const conta = fn => novas.filter(fn).length;
console.log(`${concelho}: ${novasN} novas, ${atualizadas} atualizadas, ${protegidas} protegidas (já trabalhadas por ti), ${retiradas} retiradas (já não estão na corrida)`);
console.log(`para contactar ${conta(l => l.funil === 'contactar')} · dúvida ${conta(l => l.funil === 'duvida')} · eliminadas ${conta(l => l.funil === 'eliminado')}`);
