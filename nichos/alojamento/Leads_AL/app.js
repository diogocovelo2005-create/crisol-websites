// Dashboard de leads AL. Lê /api/data (leads.json + estado.json) e grava cada alteração em estado.json.

const ESTADOS = [
  ['por_contactar', 'Por contactar'], ['nao_atendeu', 'Não atendeu'], ['ligar_depois', 'Ligar depois'],
  ['recusou', 'Recusou'], ['proposta', 'Proposta'], ['aceitou_base', 'Aceitou base'],
  ['base_enviada', 'Base enviada'], ['recusou_base', 'Recusou base'], ['base_fechada', 'Base fechada'],
  ['completa_fechada', 'Completa fechada'], ['nao_contactar', 'Não contactar'], ['falha_claude', 'Falha Claude'],
];
const ROTULO = Object.fromEntries(ESTADOS);
const POR_LIGAR = ['por_contactar', 'nao_atendeu', 'ligar_depois'];
// Funil: o estado atual implica que passou pelas fases anteriores
// "proposta": atendeu e quer ver a proposta antes da versão base (ainda não aceitou a base)
const ACEITOU = ['aceitou_base', 'base_enviada', 'recusou_base', 'base_fechada', 'completa_fechada'];
const ATENDEU = ['recusou', 'proposta', ...ACEITOU];
const ENVIADA = ['base_enviada', 'recusou_base', 'base_fechada', 'completa_fechada'];
const FECHOU = ['base_fechada', 'completa_fechada'];
const COM_TEMPERATURA = ['proposta', 'aceitou_base', 'base_enviada', 'base_fechada', 'completa_fechada', 'recusou_base'];
// Follow-up: depois de enviar a proposta ou a base, ligar passados uns dias se não responderem
const FOLLOW_UP = ['proposta', 'base_enviada'];
const DIAS_FOLLOW_UP = 3; // dias entre enviar e ligar
const DIAS_ENVIAR_BASE = 3; // prazo para fazer e enviar a base depois de a aceitarem (aparece primeiro no follow-up)
const DIAS_SEM_RESPOSTA = 2; // depois de "Sem resposta", volta a aparecer daqui a estes dias
const CANAIS = [['whatsapp', 'WhatsApp'], ['email', 'Email'], ['sms', 'SMS']];
const DURACAO = [['<1', '< 1 min'], ['1-3', '1–3 min'], ['>3', '> 3 min']];
const FALHAS = [['tinha_site', 'Tinha site'], ['site_moderno', 'Site é moderno'], ['nota_errada', 'Nota errada'],
  ['nao_e_al', 'Não é AL'], ['fechou', 'Fechou'], ['outro', 'Outro']];

const VISTAS = [
  ['ligar', 'Ligar', 'Quem está por ligar: estreladas, depois A, B e C (sub-nicho, preço, avaliações e site)'],
  ['gestoras', 'Gestoras', 'Empresas que gerem casas de outros donos: as melhores leads. Uma chamada vale por todas as casas que gerem.'],
  ['followup', 'Follow-up', 'Bases por enviar primeiro, depois bases e propostas à espera de resposta, a mais próxima da data primeiro'],
  ['tarefas', 'Tarefas', 'Por prioridade e depois por prazo. No Google Calendar ficam à hora que escolheres (sem hora, às 22:00), com aviso à hora'],
  ['estrela', 'Estrela', 'As leads que marcaste como melhores'],
  ['duvida', 'Dúvida', 'Só sites que não consegui classificar com prova (casas ativas, com boa nota). Tu decides.'],
  ['proposta', 'Proposta', 'Querem ver a proposta antes da versão base. Quando aceitarem a base, muda para "Aceitou base".'],
  ['curso', 'Em curso', 'Versões base pedidas, enviadas e fechadas'],
  ['fora', 'Descartadas', 'O que ficou de fora e porquê. Se discordares, abre a lead e recupera-a.'],
  ['metricas', 'Métricas', 'Taxa de sucesso das chamadas e das versões base'],
];

let D = { leads: [], estado: {} };
let T = []; // tarefas (data/tarefas.json)
let editando = null; // tarefa aberta para editar
const rapida = { casa: '', categoria: 'outro' }; // o que a caixa de captura rápida mantém entre renders
let pastas = [];
let gcal = null; // estado da ligação ao Google Calendar (/api/google)
let vista = VISTAS.some(v => v[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'ligar';
let aberto = null;
const filtro = { q: '', concelho: '', funil: '', dia: '', casa: '', categoria: '' };

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const st = id => D.estado[id] || (D.estado[id] = { estado: 'por_contactar', notas: [] });
const funil = l => st(l.id).decisao || l.funil;
const diaISO = d => d.toLocaleDateString('sv-SE'); // AAAA-MM-DD na hora local
const hoje = () => diaISO(new Date());
const maisDias = (n, de = hoje()) => { const d = new Date(de + 'T12:00'); d.setDate(d.getDate() + n); return diaISO(d); };
const diasAte = d => Math.round((new Date(d + 'T12:00') - new Date(hoje() + 'T12:00')) / 864e5);
const dataPT = d => d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) : '';
const virgula = n => n.toFixed(1).replace('.', ',');
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
// Todos os números da lead (formato novo) ou o antigo campo único
const tels = l => l.telefones || (l.telefone ? [{ numero: l.telefone, fontes: [] }] : []);
const googleURL = l => 'https://www.google.com/search?q=' + encodeURIComponent(`${l.nome} ${l.localidade}`);

async function carregar() {
  const [data, p, t] = await Promise.all([fetch('/api/data').then(r => r.json()), fetch('/api/pastas').then(r => r.json()), fetch('/api/tarefas').then(r => r.json())]);
  D = data; pastas = p; T = t.tarefas; AUTO_TEXTO = t.auto || {};
  render();
  verGoogle();
  heroesAuto();
}

// Google Calendar: o servidor sincroniza sozinho; aqui só se mostra o estado e o botão para ligar
async function verGoogle() {
  try {
    const n = await fetch('/api/google').then(r => r.json());
    const mudou = JSON.stringify(n) !== JSON.stringify(gcal);
    gcal = n;
    if (mudou && (vista === 'followup' || vista === 'tarefas')) render();
  } catch {}
}
setInterval(verGoogle, 15000);
function barraGoogle() {
  if (!gcal) return '';
  if (!gcal.ligado) return `<div class="gcal"><span>As tarefas (à hora que escolheres, ou às 22h) podem aparecer no teu Google Calendar, com aviso no telemóvel.</span>
    <a class="btn" href="/google/ligar" target="_blank" rel="noopener">Ligar Google Calendar</a></div>`;
  if (gcal.erro) return `<div class="gcal erro"><span>Google Calendar: ${esc(gcal.erro)}</span>
    <a class="btn" href="/google/ligar" target="_blank" rel="noopener">Voltar a ligar</a></div>`;
  return `<div class="gcal ok"><span>✓ Sincronizado com o Google Calendar${gcal.conta ? ` (${esc(gcal.conta)})` : ''}, calendário <b>Leads AL</b> · ${gcal.eventos} ${gcal.eventos === 1 ? 'evento' : 'eventos'}</span></div>`;
}

// ---------- casas (versão base) ----------
const casaDe = s => pastas.find(c => c.slug === s.pasta);
const linkDe = s => { const c = casaDe(s); return s.link || (c && (c.deploy || c.local)) || ''; };
const DIA = 24 * 3600 * 1000;

// Atualiza sozinho o hero de cada casa em curso quando o site mudou, quando ainda não há hero,
// ou quando o hero tem mais de um dia (apanha deploys). Uma tentativa por alteração.
const tentados = new Set();
let aCapturar = false;
async function heroesAuto() {
  if (aCapturar) return;
  aCapturar = true;
  try {
    const vistas = new Set();
    for (const l of D.leads.filter(l => ACEITOU.includes(st(l.id).estado) && st(l.id).pasta)) {
      const s = st(l.id), c = casaDe(s), link = linkDe(s);
      if (!c || !c.temSite || !link || vistas.has(c.slug)) continue;
      vistas.add(c.slug);
      const velho = !c.hero || c.hero < c.alterado || Date.now() - c.hero > DIA;
      const chave = `${c.slug}|${link}|${c.alterado}|${c.hero}`;
      if (!velho || tentados.has(chave)) continue;
      tentados.add(chave);
      const r = await fetch('/api/hero', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pasta: c.slug, link }) });
      if (r.ok) { pastas = await fetch('/api/pastas').then(r => r.json()); render(); }
    }
  } catch { /* tenta outra vez na próxima alteração */ }
  aCapturar = false;
}

// Alterações que o servidor ainda não recebeu: voltam a ser enviadas sozinhas e impedem a janela
// de recarregar ou de trocar os dados pelos do servidor (senão perdiam-se, como já aconteceu).
const porGravar = new Set();
async function guardar(id, silencioso) {
  try {
    const r = await fetch('/api/estado/' + encodeURIComponent(id), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(D.estado[id]),
    });
    if (!r.ok) throw new Error((await r.json()).erro);
    porGravar.delete(id);
    if (!silencioso) toast(porGravar.size ? `Guardado (${porGravar.size} por gravar)` : 'Guardado');
  } catch (e) {
    porGravar.add(id);
    if (!silencioso) toast('Não gravou: o dashboard tenta outra vez sozinho. Não feches esta janela.', true);
  }
}

function toast(msg, erro) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast on' + (erro ? ' erro' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = 'toast'), erro ? 5000 : 1400);
}

// ---------- pedaços ----------
// Pontuação 0-10 (pontuacao.js): ordena as listas; passar o rato mostra de onde vem
function chipPontos(l) {
  const { pontos, porque, escalao, subnicho, cor } = pontuacao(l);
  const [nomeSn] = pontuacao.SUBNICHOS[subnicho];
  return `<span class="chip pontos ${escalao === 'A' || escalao === 'G' ? 'alta' : escalao === 'C' ? 'baixa' : ''}" title="${esc(porque)}">${escalao === 'G' ? 'Gestora' : escalao + ' · ' + pontos + '/10'}</span>`
    + `<span class="chip nota sn-${cor}" title="Sub-nicho">${esc(nomeSn)}</span>`;
}
const porPontos = (a, b) => pontuacao(b).pontos - pontuacao(a).pontos;
function chipNota(l) {
  if (!l.booking) {
    const p = (l.plataformas || [])[0];
    return p ? `<span class="chip nota" title="${p.avaliacoes ?? '?'} avaliações">${esc(p.nome)}${p.nota != null ? ' ' + virgula(p.nota) : ''}</span>`
      : '<span class="chip nota">sem plataformas</span>';
  }
  const { nota, avaliacoes } = l.booking;
  return `<span class="chip nota ${nota < 7 ? 'baixa' : nota >= 9 ? 'boa' : ''}" title="${avaliacoes} avaliações">Booking ${virgula(nota)}</span>`;
}
const classeEstado = l => funil(l) === 'contactar' ? 'e-' + st(l.id).estado : 'e-' + funil(l);
const iniciais = nome => nome.split(/\s+/).filter(p => !/^(d[aoe]s?|e|the)$/i.test(p)).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const avatar = l => `<div class="avatar ${classeEstado(l)}" aria-hidden="true">${esc(iniciais(l.nome))}</div>`;
function chipSite(l) {
  if (!l.site) return '<span class="chip site-nenhum">Sem site</span>';
  const r = { antigo: 'Site antigo', duvida: 'Site: dúvida', moderno: 'Site moderno' }[l.site.veredito];
  return `<span class="chip site-${l.site.veredito}">${r}</span>`;
}
function chipEstado(l) {
  if (funil(l) === 'eliminado') return '<span class="chip e-eliminado">Eliminado</span>';
  if (funil(l) === 'duvida') return '<span class="chip e-duvida">Por decidir</span>';
  const s = st(l.id);
  let extra = '';
  if (s.estado === 'nao_atendeu' && s.tentativas) extra = ` ×${s.tentativas}`;
  if (s.estado === 'ligar_depois' && s.ligar_em) extra = ` · ${dataPT(s.ligar_em)}`;
  if (s.estado === 'recusou' && s.duracao) extra = ` · ${DURACAO.find(d => d[0] === s.duracao)[1]}`;
  if (COM_TEMPERATURA.includes(s.estado) && s.temperatura != null) extra = ` · ${s.temperatura}/10`;
  if (s.estado === 'falha_claude' && s.falha) extra = ` · ${FALHAS.find(f => f[0] === s.falha)[1]}`;
  return `<span class="chip e-${s.estado}">${ROTULO[s.estado]}${esc(extra)}</span>`;
}

function linha(l, i = 0) {
  const s = st(l.id);
  return `<div class="lead ${funil(l) === 'eliminado' ? 'fora' : ''}" data-abrir="${esc(l.id)}" style="--i:${i}">
    <button class="estrela ${s.estrela ? 'on' : ''}" data-estrela="${esc(l.id)}" aria-pressed="${!!s.estrela}" aria-label="Estrela">★</button>
    ${avatar(l)}
    <div style="min-width:0"><div class="nome">${esc(l.nome)}${s.proprietario ? ` <span class="dono">· ${esc(s.proprietario)}</span>` : ''}</div>
      <div class="onde">${esc(l.localidade)} · ${esc(l.concelho)} · ${esc(l.tipo)}${l.capacidade ? ` · ${l.capacidade} pessoas` : ""}</div></div>
    <div class="chips">${chipPontos(l)}${(l.etiquetas || []).map(t => `<span class="chip nota">${esc(t)}</span>`).join('')}${l.gestora ? `<span class="chip nota" title="${esc(l.gestora.prova || '')}">gerida por ${esc(l.gestora.nome)}</span>` : ''}${pequeno(l) ? `<span class="chip nota" title="${l.capacidade} pessoas, ${l.tipos_quarto || 1} tipo(s) de quarto">Pequeno</span>` : ''}${chipNota(l)}${chipSite(l)}${chipEstado(l)}</div>
    <div class="tel">${esc(tels(l)[0]?.numero || '—')}${tels(l).length > 1 ? ` <span class="mais">+${tels(l).length - 1}</span>` : ''}</div>
  </div>`;
}

// Casa pequena (menos de 5 pessoas e até 2 tipos de quarto): só turismo rural ou de habitação chega cá assim; leva a etiqueta
// (capacidade 0 = desconhecida, casa sem registo: não é "pequena")
const pequeno = l => typeof l.capacidade === 'number' && l.capacidade > 0 && l.capacidade < 5 && !(l.tipos_quarto > 2);
const grupo = (titulo, ls) => {
  ls = ls.slice().sort(porPontos); // mais pontos primeiro; estável: entre iguais, a ordem fica
  return ls.length ? `<div class="grupo-titulo">${titulo} · ${ls.length}</div><div class="lista">${ls.map((l, i) => linha(l, i)).join('')}</div>` : '';
};
const vazio = txt => `<div class="vazio">${txt}</div>`;

// ---------- tarefas ----------
const PRIO = { alta: 0, media: 1, baixa: 2 };
const PRIO_NOME = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const CATEGORIAS = [['construcao', 'Construção'], ['legal', 'Legal'], ['vendas', 'Vendas'], ['financeiro', 'Financeiro'], ['outro', 'Outro']];
const CAT_NOME = Object.fromEntries(CATEGORIAS);
const porPrioridade = (a, b) => PRIO[a.prioridade] - PRIO[b.prioridade] || a.prazo.localeCompare(b.prazo) || a.criada?.localeCompare(b.criada || '') || 0;
let AUTO_TEXTO = {}; // regra -> quando a tarefa se fecha sozinha (vem do servidor, tarefas.js)

// Criar: escreve-se só o título; prazo e prioridade são botões, já no caso mais comum (amanhã, média).
// O texto também serve ("… sexta alta") e ganha aos botões.
const PRAZOS = [[0, 'Hoje'], [1, 'Amanhã'], [3, '+3 dias'], [7, '+1 semana']];
const ESCOLHA_BASE = { prazo: 1, prioridade: 'media', hora: '' };
const escolha = { tq: { ...ESCOLHA_BASE }, 'tq-painel': { ...ESCOLHA_BASE } }; // um por caixa (aba Tarefas, ficha da casa)
const prazoDe = p => typeof p === 'number' ? maisDias(p) : p;
function escolhas(id) {
  const e = escolha[id];
  return `<div class="escolhas" data-escolhas="${id}">
    <div class="seg">${PRAZOS.map(([n, nome]) => `<button data-eprazo="${n}" aria-pressed="${e.prazo === n}">${nome}</button>`).join('')}
      <input type="date" class="e-data ${typeof e.prazo === 'string' ? 'on' : ''}" data-edata="${id}" value="${typeof e.prazo === 'string' ? e.prazo : ''}" min="${hoje()}" title="Outro dia">
      <input type="time" class="e-hora ${e.hora ? 'on' : ''}" data-ehora="${id}" value="${e.hora || ''}" title="Hora (sem hora, às 22:00)"></div>
    <div class="seg">${Object.entries(PRIO_NOME).map(([v, nome]) => `<button class="p-${v}" data-eprio="${v}" aria-pressed="${e.prioridade === v}">${nome}</button>`).join('')}</div>
  </div>`;
}
// Clicar numa escolha não volta a desenhar a página: o título que já está escrito fica onde está
function escolher(botao) {
  const caixa = botao.closest('[data-escolhas]'), e = escolha[caixa.dataset.escolhas];
  if (botao.dataset.eprazo !== undefined) {
    e.prazo = Number(botao.dataset.eprazo);
    caixa.querySelector('.e-data').classList.remove('on'); caixa.querySelector('.e-data').value = '';
  } else e.prioridade = botao.dataset.eprio;
  botao.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === botao)));
  document.getElementById(caixa.dataset.escolhas)?.focus();
}

const DIAS_SEMANA = { domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6, sábado: 6 };
function lerRapida(txt) {
  let t = ` ${txt.trim()} `, prioridade = null, prazo = null;
  const tira = (re, fn) => { const m = re.exec(t); if (!m) return false; fn(m); t = t.slice(0, m.index) + ' ' + t.slice(m.index + m[0].length); return true; };
  tira(/(?<=\s)(alta|urgente|média|media|baixa)(?=\s*$)/i, m => { const p = m[1].toLowerCase(); prioridade = p === 'urgente' ? 'alta' : p === 'média' ? 'media' : p; });
  tira(/(?<=\s)(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s)/, m => {
    const ano = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : +hoje().slice(0, 4);
    prazo = `${ano}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    if (!m[3] && prazo < hoje()) prazo = `${ano + 1}${prazo.slice(4)}`;
  })
    || tira(/(?<=\s)depois de amanh[ãa](?=\s)/i, () => (prazo = maisDias(2)))
    || tira(/(?<=\s)amanh[ãa](?=\s)/i, () => (prazo = maisDias(1)))
    || tira(/(?<=\s)hoje(?=\s)/i, () => (prazo = hoje()))
    || tira(/(?<=\s)(domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado)(?:-feira)?(?=\s)/i, m => {
      const alvo = DIAS_SEMANA[m[1].toLowerCase()], agora = new Date(hoje() + 'T12:00').getDay();
      prazo = maisDias((alvo - agora + 7) % 7 || 7);
    });
  return { titulo: t.replace(/\s+/g, ' ').trim(), prazo, prioridade };
}

async function gravarTarefa(t, msg = 'Tarefa guardada') {
  const i = T.findIndex(x => x.id === t.id);
  if (i < 0) T.push(t); else T[i] = t;
  render();
  try {
    const r = await fetch('/api/tarefas/' + encodeURIComponent(t.id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) });
    if (!r.ok) throw new Error((await r.json()).erro);
    const gravada = await r.json(); // o servidor junta a regra para se fechar sozinha
    const j = T.findIndex(x => x.id === t.id);
    if (j >= 0 && gravada.auto !== T[j].auto) { T[j] = gravada; render(); }
    toast(msg); setTimeout(verGoogle, 1500);
  } catch (e) { toast('A tarefa não gravou: ' + e.message, true); }
}
async function apagarTarefa(id) {
  T = T.filter(t => t.id !== id); editando = null; render();
  try { await fetch('/api/tarefas/' + encodeURIComponent(id), { method: 'DELETE' }); toast('Tarefa apagada'); setTimeout(verGoogle, 1500); }
  catch { toast('Não apagou: o servidor está desligado?', true); }
}
// Da aba Tarefas (#tq, com a casa e a categoria ao lado) ou da ficha de uma casa (#tq-painel, já ligada a ela)
function criarRapida(idCampo) {
  const inp = $('#' + idCampo); if (!inp || !inp.value.trim()) return;
  const lido = lerRapida(inp.value);
  if (!lido.titulo) return toast('Escreve o que há para fazer', true);
  const e = escolha[idCampo];
  const prazo = lido.prazo || prazoDe(e.prazo), prioridade = lido.prioridade || e.prioridade, hora = e.hora || undefined;
  let casa, lead, categoria = 'outro';
  if (idCampo === 'tq') {
    rapida.casa = $('#tq-casa').value; rapida.categoria = categoria = $('#tq-cat').value;
    casa = rapida.casa; lead = casa ? D.leads.find(l => st(l.id).pasta === casa)?.id || '' : '';
  } else { lead = aberto; casa = st(aberto).pasta || ''; }
  escolha[idCampo] = { ...ESCOLHA_BASE }; // a seguinte volta ao caso mais comum
  inp.value = '';
  gravarTarefa({ id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), titulo: lido.titulo, descricao: '', casa, lead,
    categoria, prioridade, prazo, hora, feita: false, criada: new Date().toISOString() }, `Tarefa para ${quando(prazo).toLowerCase()}`);
  $('#' + idCampo)?.focus({ preventScroll: true });
}
// As tarefas de uma lead: as ligadas a ela e as da pasta da casa dela
const tarefasDe = l => { const p = st(l.id).pasta; return T.filter(t => !t.feita && (t.lead === l.id || (p && t.casa === p))).sort(porPrioridade); };
const ondeTarefa = t => t.casa || D.leads.find(l => l.id === t.lead)?.nome || '';
const adiar = (t, n) => ({ ...t, prazo: maisDias(n, t.prazo > hoje() ? t.prazo : hoje()) });
function lerEdicao() {
  const g = id => $('#' + id)?.value;
  const titulo = g('te-titulo').trim();
  if (titulo !== editando.titulo && editando.auto !== null) delete editando.auto; // título novo: o servidor volta a ver a regra
  Object.assign(editando, { titulo, descricao: g('te-desc').trim(), casa: g('te-casa'), categoria: g('te-cat'), prazo: g('te-prazo'), hora: g('te-hora') || undefined });
}
const opcoesCasa = sel => `<option value="">Sem casa</option>${pastas.map(c => `<option value="${esc(c.slug)}" ${c.slug === sel ? 'selected' : ''}>${esc(c.slug)}</option>`).join('')}`;
const opcoesCat = sel => CATEGORIAS.map(([v, n]) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${n}</option>`).join('');
const chipAuto = t => t.feita ? (t.fechada === 'auto' ? '<span class="chip nota">🤖 fechou sozinha</span>' : t.fechada === 'google' ? '<span class="chip nota">📱 apagada no Calendar</span>' : '')
  : t.auto && AUTO_TEXTO[t.auto] ? `<button class="chip auto" data-tauto="${esc(t.id)}" title="Fecha-se sozinha ${esc(AUTO_TEXTO[t.auto])}. Clica para desligar.">🤖 sozinha</button>` : '';
const botoesAdiar = t => t.feita ? '' : `<span class="adiar"><button data-tadiar="${esc(t.id)}" data-n="1" title="Adiar 1 dia">+1d</button><button data-tadiar="${esc(t.id)}" data-n="3" title="Adiar 3 dias">+3d</button></span>`;

function linhaTarefa(t) {
  const n = diasAte(t.prazo);
  if (editando && editando.id === t.id) return `<div class="tarefa edita">
    <input id="te-titulo" value="${esc(editando.titulo)}" placeholder="O que há para fazer">
    <textarea id="te-desc" placeholder="Descrição (opcional)">${esc(editando.descricao || '')}</textarea>
    <div class="tarefa-campos">
      <select id="te-casa">${opcoesCasa(editando.casa)}</select>
      <select id="te-cat">${opcoesCat(editando.categoria)}</select>
      <input type="date" id="te-prazo" value="${esc(editando.prazo)}">
      <input type="time" id="te-hora" value="${esc(editando.hora || '')}" title="Hora (sem hora, às 22:00)">
      <div class="seg">${Object.entries(PRIO_NOME).map(([v, nome]) => `<button data-tpri="${v}" aria-pressed="${editando.prioridade === v}">${nome}</button>`).join('')}</div>
    </div>
    <div class="tarefa-botoes"><button class="btn prim" data-tguardar>Guardar</button><button class="btn" data-tcancelar>Cancelar</button>
      <button class="btn apagar" data-tapagar="${esc(t.id)}">Apagar</button></div></div>`;
  return `<div class="tarefa ${t.feita ? 'feita' : ''}">
    <button class="visto" data-tfeita="${esc(t.id)}" aria-pressed="${!!t.feita}" aria-label="${t.feita ? 'Reabrir' : 'Marcar como feita'}">${t.feita ? '✓' : ''}</button>
    <div class="tarefa-corpo" data-teditar="${esc(t.id)}" role="button" tabindex="0" title="Editar">
      <div class="tarefa-titulo">${esc(t.titulo)}</div>
      ${t.descricao ? `<div class="tarefa-desc">${esc(t.descricao)}</div>` : ''}
    </div>
    <div class="chips"><span class="chip p-${t.prioridade}">${PRIO_NOME[t.prioridade]}</span>
      ${ondeTarefa(t) ? `<span class="chip e-base_enviada">${esc(ondeTarefa(t))}</span>` : ''}
      <span class="chip nota">${CAT_NOME[t.categoria] || 'Outro'}</span>${chipAuto(t)}
      <span class="chip nota ${!t.feita && n < 0 ? 'baixa' : ''}">${quando(t.prazo)}${t.hora ? ' · ' + t.hora : ''}</span></div>${botoesAdiar(t)}</div>`;
}

// ---------- follow-up ----------
// Leads de antes do follow-up não têm data de envio (o "atualizado" muda a cada clique, não serve): ficam para hoje
const followUp = s => s.follow_up || (s.enviado_em ? maisDias(DIAS_FOLLOW_UP, s.enviado_em) : hoje());
const PRIORIDADE = { aceitou_base: 0, base_enviada: 1, proposta: 2 }; // enviar base, depois bases enviadas, depois propostas
const emFollowUp = () => D.leads.filter(l => funil(l) === 'contactar' && st(l.id).estado in PRIORIDADE)
  .sort((a, b) => PRIORIDADE[st(a.id).estado] - PRIORIDADE[st(b.id).estado]
    || followUp(st(a.id)).localeCompare(followUp(st(b.id))) || (st(b.id).temperatura ?? -1) - (st(a.id).temperatura ?? -1));
const quando = d => {
  const n = diasAte(d);
  return n < 0 ? `Atrasada ${-n} ${-n === 1 ? 'dia' : 'dias'}` : n === 0 ? 'Hoje' : n === 1 ? 'Amanhã'
    : new Date(d + 'T12:00').toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit' });
};
// Reunião e nota em destaque nos cartões em curso: aparecem a vermelho no topo do cartão;
// a reunião que já passou fica cinzenta
const reuniaoTexto = s => diasAte(s.reuniao) < 0 ? `Reunião foi a ${dataPT(s.reuniao + 'T12:00')}`
  : `Reunião · ${quando(s.reuniao)}${s.reuniao_hora ? ` às ${s.reuniao_hora}` : ''}`;
const destaque = (l, s) => `<div class="destaque">
    ${s.reuniao ? `<div class="destaque-reuniao ${diasAte(s.reuniao) < 0 ? 'passou' : ''}">${reuniaoTexto(s)}</div>` : ''}
    ${s.aviso ? `<div class="destaque-aviso"><span>${esc(s.aviso)}</span><button class="destaque-tirar" data-tirar-aviso="${esc(l.id)}" aria-label="Tirar a nota">×</button></div>` : ''}
    <div class="destaque-campos">
      <label>Reunião <input type="date" data-reuniao="${esc(l.id)}" value="${esc(s.reuniao || '')}"></label>
      <input type="time" data-reuniao-hora="${esc(l.id)}" value="${esc(s.reuniao_hora || '')}" aria-label="Hora da reunião">
    </div>
    <input type="text" class="destaque-input" data-aviso="${esc(l.id)}" placeholder="${s.aviso ? 'Nova nota (substitui a de cima)' : 'Nota em destaque (Enter grava)'}">
  </div>`;
// Mudar de estado: entrar em proposta/base enviada põe o relógio do follow-up a contar;
// aceitar a base põe o prazo para a enviar
function mudarEstado(s, novo) {
  if (novo === 'aceitou_base' && s.estado !== novo) {
    s.aceitou_em = hoje(); s.follow_up = maisDias(DIAS_ENVIAR_BASE);
    delete s.enviado_em; delete s.enviado_por; delete s.enviado_para; s.sem_resposta = 0;
  }
  if (FOLLOW_UP.includes(novo) && s.estado !== novo) {
    s.enviado_em = hoje(); s.follow_up = maisDias(DIAS_FOLLOW_UP); s.sem_resposta = 0;
    delete s.enviado_por; delete s.enviado_para; // envio novo: volta a perguntar por onde
  }
  s.estado = novo;
}

// Contacto sugerido para o canal: telemóvel (9…) para WhatsApp/SMS, o email da lead para email
const sugestaoPara = (l, canal) => canal === 'email' ? l.email || ''
  : (tels(l).find(t => /^(\+351\s?)?9/.test(t.numero)) || tels(l)[0])?.numero || '';
// Link para abrir a conversa: wa.me precisa do indicativo (só dígitos)
function linkEnvio(s) {
  const para = s.enviado_para || '';
  if (!para) return '';
  if (s.enviado_por === 'email') return 'mailto:' + para;
  const dig = para.replace(/\D/g, '');
  if (s.enviado_por === 'whatsapp') return 'https://wa.me/' + (dig.length === 9 ? '351' + dig : dig);
  return 'sms:' + para.replace(/\s/g, '');
}
function viaEnvio(s) {
  if (!s.enviado_por) return '<span class="fu-falta">por onde enviaste?</span>';
  const canal = Object.fromEntries(CANAIS)[s.enviado_por], link = linkEnvio(s);
  const para = s.enviado_para ? ` ${esc(s.enviado_para)}` : '';
  return `via ${link ? `<a class="fu-via" href="${esc(link)}" ${s.enviado_por === 'whatsapp' ? 'target="_blank" rel="noopener"' : ''}>${canal}${para}</a>` : `<b>${canal}</b>`}`;
}

function linhaFU(l, i) {
  const s = st(l.id), d = followUp(s), n = diasAte(d), id = esc(l.id);
  const desde = s.enviado_em ? -diasAte(s.enviado_em) : null;
  const nota = s.fu_nota || ''; // só a nota do follow-up; as notas normais ficam na ficha
  const enviar = s.estado === 'aceitou_base';
  const aceitou = s.aceitou_em ? -diasAte(s.aceitou_em) : null;
  const sub = enviar
    ? `${aceitou == null ? '' : aceitou ? `aceitou há ${aceitou} ${aceitou === 1 ? 'dia' : 'dias'} · ` : 'aceitou hoje · '}<b class="fu-enviar">enviar a base</b>`
    : `${desde == null ? '' : desde ? `enviada há ${desde} ${desde === 1 ? 'dia' : 'dias'} · ` : 'enviada hoje · '}${viaEnvio(s)}${s.sem_resposta ? ` · ${s.sem_resposta}× sem resposta` : ''}`;
  return `<div class="lead fu" data-abrir="${id}" style="--i:${i}">
    ${avatar(l)}
    <div style="min-width:0">
      <div class="nome">${esc(l.nome)}${s.proprietario ? ` <span class="dono">· ${esc(s.proprietario)}</span>` : ''}</div>
      <div class="onde">${chipEstado(l)} ${sub}</div>
      ${nota ? `<div class="fu-nota">“${esc(nota)}”</div>` : ''}
    </div>
    <div class="fu-quando">
      <span class="fu-data ${n < 0 ? 'atraso' : n === 0 ? 'hoje' : ''}">${quando(d)}</span>
      <div class="tel">${esc(tels(l)[0]?.numero || '—')}</div>
    </div>
    <div class="fu-acoes">
      ${enviar ? '' : `<button class="btn" data-fu-sem="${id}" title="Ligaste e não atendeu: volta daqui a ${DIAS_SEM_RESPOSTA} dias">Sem resposta</button>`}
      <label class="fu-dia">${enviar ? 'Enviar até' : 'Ligar a'} <input type="date" data-fu-dia="${id}" value="${d}" min="${hoje()}"></label>
      ${enviar ? `<button class="btn prim" data-fu-enviada="${id}" title="Passa para Base enviada e pergunta por onde">Base enviada ✓</button>`
        : `<button class="btn prim" data-fu-respondeu="${id}">Respondeu →</button>`}
    </div>
  </div>`;
}

function filtrar(ls) {
  const q = filtro.q.trim().toLowerCase();
  return ls.filter(l => (!filtro.concelho || l.concelho === filtro.concelho)
    && (!q || `${l.nome} ${st(l.id).proprietario || ''} ${l.localidade} ${tels(l).map(t => t.numero).join(' ')}`.toLowerCase().includes(q)));
}

// ---------- vistas ----------
const porLigar = () => D.leads.filter(l => funil(l) === 'contactar' && POR_LIGAR.includes(st(l.id).estado) && !l.gestora);
const dasGestoras = () => D.leads.filter(l => funil(l) === 'contactar' && l.gestora);
const escalao = l => pontuacao(l).escalao;

const VISTA = {
  ligar() {
    const ls = filtrar(porLigar());
    const e = l => st(l.id);
    const hojeISO = hoje();
    const agendadoHoje = l => e(l).estado === 'ligar_depois' && (e(l).ligar_em || '') <= hojeISO;
    const hojeL = ls.filter(agendadoHoje);
    const resto = ls.filter(l => !agendadoHoje(l));
    const html = grupo('Combinado para hoje', hojeL)
      + grupo('Com estrela', resto.filter(l => e(l).estrela))
      + grupo('A · ligar primeiro', resto.filter(l => !e(l).estrela && e(l).estado === 'por_contactar' && escalao(l) === 'A'))
      + grupo('B', resto.filter(l => !e(l).estrela && e(l).estado === 'por_contactar' && escalao(l) === 'B'))
      + grupo('C · quando acabares A e B', resto.filter(l => !e(l).estrela && e(l).estado === 'por_contactar' && escalao(l) === 'C'))
      + grupo('Não atenderam', resto.filter(l => !e(l).estrela && e(l).estado === 'nao_atendeu'))
      + grupo('Agendadas', resto.filter(l => !e(l).estrela && e(l).estado === 'ligar_depois')
        .sort((a, b) => (e(a).ligar_em || '').localeCompare(e(b).ligar_em || '')));
    return html || vazio('Ninguém por ligar. Pede ao Claude um concelho novo.');
  },
  gestoras() {
    const ls = filtrar(dasGestoras());
    if (!ls.length) return vazio('Nenhuma gestora encontrada ainda. O montar.js marca-as pelo "gerido por" do Booking, pelo anfitrião do Airbnb com 3 ou mais casas e pelos nomes "by X".');
    const por = new Map(); for (const l of ls) (por.get(l.gestora.nome) || por.set(l.gestora.nome, []).get(l.gestora.nome)).push(l);
    return [...por].sort((a, b) => b[1].length - a[1].length).map(([nome, casas]) => grupo(`${esc(nome)} · gere ${casas.length} casa${casas.length > 1 ? 's' : ''} aqui`, casas)).join('');
  },
  followup() {
    const todas = filtrar(emFollowUp());
    if (!todas.length) return vazio('Nada por enviar nem à espera de resposta. Quando marcares "Aceitou base", "Base enviada" ou "Proposta", a lead aparece aqui.');
    const hojeISO = hoje();
    const dia = l => followUp(st(l.id)) < hojeISO ? 'atraso' : followUp(st(l.id));
    const conta = k => todas.filter(l => dia(l) === k).length;
    const dias = ['atraso', ...Array.from({ length: 7 }, (_, i) => maisDias(i))];
    const faixa = `<div class="fu-dias">${dias.map(k => {
      const n = conta(k);
      if (k === 'atraso' && !n) return '';
      const nome = k === 'atraso' ? 'Atrasadas' : k === hojeISO ? 'Hoje'
        : new Date(k + 'T12:00').toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
      return `<button class="fu-dia-btn ${k === 'atraso' ? 'atraso' : ''} ${n ? '' : 'zero'}" data-fu-filtro="${k}" aria-pressed="${filtro.dia === k}">
        <span>${nome}</span><small>${k === 'atraso' ? '&nbsp;' : dataPT(k + 'T12:00')}</small><b>${n || '–'}</b></button>`;
    }).join('')}</div>`;
    const ls = filtro.dia ? todas.filter(l => dia(l) === filtro.dia) : todas;
    setTimeout(verGoogle, 1500); // depois de um clique, o número de eventos atualiza-se
    const sec = (t, arr) => arr.length ? `<div class="grupo-titulo">${t} · ${arr.length}</div><div class="lista">${arr.map((l, i) => linhaFU(l, i)).join('')}</div>` : '';
    const resp = ls.filter(l => st(l.id).estado !== 'aceitou_base');
    return barraGoogle() + faixa + ((sec('Enviar base', ls.filter(l => st(l.id).estado === 'aceitou_base'))
      + sec('Atrasadas', resp.filter(l => dia(l) === 'atraso'))
      + sec('Hoje', resp.filter(l => dia(l) === hojeISO))
      + sec('Próximos dias', resp.filter(l => dia(l) > hojeISO)))
      || vazio('Nada marcado para este dia.'));
  },
  tarefas() {
    const filtradas = T.filter(t => (!filtro.casa || t.casa === filtro.casa) && (!filtro.categoria || t.categoria === filtro.categoria)
      && (!filtro.q || `${t.titulo} ${t.descricao} ${ondeTarefa(t)}`.toLowerCase().includes(filtro.q.toLowerCase())));
    const pend = filtradas.filter(t => !t.feita).sort(porPrioridade);
    const h = hoje(), semana = maisDias(7);
    const sec = (titulo, arr) => arr.length ? `<div class="grupo-titulo">${titulo} · ${arr.length}</div><div class="lista">${arr.map(linhaTarefa).join('')}</div>` : '';
    const feitas = filtradas.filter(t => t.feita).sort((a, b) => (b.feita_em || '').localeCompare(a.feita_em || '')).slice(0, 10);
    const form = `<div class="tarefa-nova">
      <input id="tq" placeholder="O que há para fazer?  (Enter cria)" autocomplete="off">
      <select id="tq-casa" aria-label="Casa">${opcoesCasa(rapida.casa)}</select>
      <select id="tq-cat" aria-label="Categoria">${opcoesCat(rapida.categoria)}</select></div>
      ${escolhas('tq')}`;
    return barraGoogle() + form + ((sec('Atrasadas', pend.filter(t => t.prazo < h)) + sec('Hoje', pend.filter(t => t.prazo === h))
      + sec('Esta semana', pend.filter(t => t.prazo > h && t.prazo <= semana)) + sec('Mais tarde', pend.filter(t => t.prazo > semana)))
      || vazio('Nada por fazer. Escreve uma tarefa na caixa de cima.')) + sec('Feitas recentemente', feitas);
  },
  estrela() {
    return grupo('Estreladas', filtrar(D.leads.filter(l => st(l.id).estrela))) || vazio('Marca ★ numa lead para ela aparecer aqui.');
  },
  duvida() {
    const ls = filtrar(D.leads.filter(l => funil(l) === 'duvida')).sort((a, b) => (!!b.site - !!a.site) || porPontos(a, b)); // sites primeiro, depois mais pontos
    if (!ls.length) return vazio('Sem dúvidas por decidir.');
    return `<div class="duvidas">${ls.map((l, i) => `
      <div class="cartao" style="--i:${i}">
        ${l.site ? `<div class="captura ${l.site.captura ? '' : 'vazia'}" ${l.site.captura ? `style="background-image:url('${esc(l.site.captura)}')"` : ''}>${l.site.captura ? '' : 'sem captura'}</div>` : ''}
        <div class="corpo" data-abrir="${esc(l.id)}" style="cursor:pointer">
          <div class="nome">${esc(l.nome)} ${chipPontos(l)}</div>
          <div class="onde" style="color:var(--muted);font-size:13px">${esc(l.localidade)} · ${esc(l.concelho)}</div>
          <div class="motivo">${esc(l.motivo)}</div>
          ${l.site ? `<a class="btn" style="align-self:flex-start" href="${esc(l.site.url)}" target="_blank" rel="noopener">Abrir site ↗</a>` : ''}
        </div>
        <div class="acoes">
          <button class="btn prim flex" data-decidir="${esc(l.id)}" data-v="contactar">${l.site ? 'Antigo → ligar' : 'Ligar na mesma'}</button>
          <button class="btn flex" data-decidir="${esc(l.id)}" data-v="eliminado">${l.site ? 'Moderno → fora' : 'Fora'}</button>
        </div>
      </div>`).join('')}</div>`;
  },
  curso() {
    const ls = filtrar(D.leads.filter(l => ACEITOU.includes(st(l.id).estado)));
    const cartoes = arr => `<div class="heros">${arr.map((l, i) => {
      const s = st(l.id);
      const c = casaDe(s), link = linkDe(s);
      return `<div class="cartao" data-abrir="${esc(l.id)}" style="--i:${i}">
        <div class="captura ${c?.hero ? '' : 'vazia'}" ${c?.hero ? `style="background-image:url('heros/${encodeURIComponent(c.slug)}.png?v=${c.hero}')"` : ''}>${chipEstado(l)}${c ? (c.hero ? '' : 'hero por capturar') : 'versão base por fazer'}</div>
        <div class="corpo">
          <div class="nome">${esc(l.nome)}</div>
          ${s.proprietario ? `<div class="dono-grande">${esc(s.proprietario)}</div>` : ''}
          ${destaque(l, s)}
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${c && link ? `<a class="btn" href="${esc(link)}" target="_blank" rel="noopener">${c.deploy && !s.link ? 'Site publicado ↗' : 'Abrir site ↗'}</a>` : ''}
            <button class="btn" data-tnova="${esc(l.id)}">+ Tarefa</button>
          </div>
          ${proximaTarefa(l)}
          <div class="termo"><span>Temperatura</span><span class="barra"><i style="width:${(s.temperatura ?? 0) * 10}%"></i></span><b>${s.temperatura ?? '–'}</b></div>
          ${s.notas?.length ? `<div class="motivo">“${esc(s.notas[s.notas.length - 1].texto)}”</div>` : ''}
        </div>
      </div>`;
    }).join('')}</div>`;
    const sec = (t, arr) => arr.length ? `<div class="grupo-titulo">${t} · ${arr.length}</div>${cartoes(arr)}` : '';
    const de = estados => ls.filter(l => estados.includes(st(l.id).estado));
    return (sec('À espera da versão base', de(['aceitou_base'])) + sec('Base enviada', de(['base_enviada']))
      + sec('Fechados', de(FECHOU)) + sec('Recusaram a base', de(['recusou_base'])))
      || vazio('Ainda ninguém aceitou a versão base.');
  },
  proposta() {
    const ls = filtrar(D.leads.filter(l => st(l.id).estado === 'proposta'))
      .sort((a, b) => (st(b.id).temperatura ?? -1) - (st(a.id).temperatura ?? -1)); // as mais quentes primeiro
    return ls.length ? `<div class="grupo-titulo">Mais quentes primeiro · ${ls.length}</div><div class="lista">${ls.map((l, i) => linha(l, i)).join('')}</div>`
      : vazio('Ninguém pediu proposta. Marca "Proposta" no estado de uma lead.');
  },
  fora() {
    const ls = filtrar(D.leads.filter(l => funil(l) === 'eliminado'));
    const motivo = l => st(l.id).decisao === 'eliminado' ? 'Tiraste tu'
      : /^Capacidade/.test(l.motivo) ? 'Pequenos (menos de 10 pessoas e até 2 tipos de quarto)'
      : /^Não está no Booking/.test(l.motivo) ? 'Não estão no Booking'
      : /^Booking/.test(l.motivo) ? 'Nota baixa no Booking' : 'Outros motivos';
    const grupos = {};
    for (const l of ls) (grupos[motivo(l)] ||= []).push(l);
    return Object.entries(grupos).map(([t, g]) => grupo(t, g)).join('') || vazio('Nada descartado.');
  },
  metricas() {
    const com = estados => D.leads.filter(l => estados.includes(st(l.id).estado));
    const atendidas = com(ATENDEU), aceites = com(ACEITOU), enviadas = com(ENVIADA), fechadas = com(FECHOU);
    const semResposta = D.leads.reduce((s, l) => s + (st(l.id).tentativas || 0), 0);
    const num = (v, i = 0) => `<span data-conta="${v}" style="--i:${i}">${v}</span>`;
    const tip = l => esc(`${l.nome} · ${ROTULO[st(l.id).estado]}`);

    // barra empilhada: segmentos [rótulo, nº, cor]; largura proporcional, 2px de intervalo
    const empilhada = segs => {
      const total = segs.reduce((s, x) => s + x[1], 0) || 1;
      return `<div class="empilhada">${segs.filter(x => x[1]).map(([r, v, c]) =>
        `<i style="flex:${v} 1 0;background:${c}" data-tip="${esc(`${r}: ${v} (${pct(v, total)}%)`)}"></i>`).join('')}</div>
        <div class="legenda">${segs.map(([r, v, c]) => `<span style="--c:${c}">${r} <b>${v}</b></span>`).join('')}</div>`;
    };
    const recusas = DURACAO.map(([d, r], i) => [r, D.leads.filter(l => st(l.id).estado === 'recusou' && st(l.id).duracao === d).length, `var(--cinza-${i + 1})`]);

    return `
    <div class="kpis">
      <div class="kpi" style="--i:0"><span>Chamadas atendidas</span><b>${num(atendidas.length)}</b></div>
      <div class="kpi" style="--i:1"><span>Aceitaram versão base</span><b>${num(aceites.length)}</b></div>
      <div class="kpi" style="--i:2"><span>Sites fechados</span><b>${num(fechadas.length)}</b></div>
      <div class="kpi" style="--i:3"><span>Chamadas sem resposta</span><b>${num(semResposta)}</b></div>
    </div>
    <div class="metricas">
      <div class="metrica">
        <h2><span class="passo">1</span>Chamadas → versão base</h2>
        <div class="destaque">
          <div class="grande">${num(pct(aceites.length, atendidas.length))}<small>%</small></div>
          <p>Em <b>${atendidas.length} chamadas</b> atendidas, <b>${aceites.length}</b> aceitaram a versão base.</p>
        </div>
        <div class="seccao">
          <div class="rot"><span>Cada quadrado é uma chamada atendida</span></div>
          <div class="waffle">${atendidas.map((l, i) => `<i class="${ACEITOU.includes(st(l.id).estado) ? 'sim' : st(l.id).estado === 'proposta' ? 'prop' : ''}" style="--i:${i}" data-tip="${tip(l)}"></i>`).join('')}</div>
          <div class="legenda"><span style="--c:var(--serie-1)">Aceitou base <b>${aceites.length}</b></span><span style="--c:var(--s-laranja-ink)">Pediu proposta <b>${com(['proposta']).length}</b></span><span style="--c:var(--cinza-1)">Recusou <b>${com(['recusou']).length}</b></span></div>
        </div>
        <div class="seccao">
          <div class="rot"><span>Quanto tempo duraram as recusas</span></div>
          ${empilhada(recusas)}
        </div>
        <div class="seccao">
          <div class="progresso"><span>Versões base já enviadas</span><span class="pista"><i style="width:${pct(enviadas.length, aceites.length)}%"></i></span><b>${enviadas.length} de ${aceites.length}</b></div>
        </div>
      </div>
      <div class="metrica">
        <h2><span class="passo">2</span>Versão base → site fechado</h2>
        <div class="destaque">
          <div class="grande">${num(pct(fechadas.length, enviadas.length))}<small>%</small></div>
          <p>Das <b>${enviadas.length} versões base</b> enviadas, <b>${fechadas.length}</b> fecharam site.</p>
        </div>
        <div class="seccao">
          <div class="rot"><span>O que aconteceu às versões base enviadas</span></div>
          ${empilhada([
            ['Completa fechada', com(['completa_fechada']).length, 'var(--serie-1)'],
            ['Base fechada', com(['base_fechada']).length, 'var(--serie-3)'],
            ['À espera', com(['base_enviada']).length, 'var(--cinza-1)'],
            ['Recusou', com(['recusou_base']).length, 'var(--cinza-3)'],
          ])}
        </div>
        <div class="duo">
          <div style="--c:var(--serie-1)"><b>${num(com(['completa_fechada']).length)}</b>Versão completa fechada</div>
          <div style="--c:var(--serie-3)"><b>${num(com(['base_fechada']).length)}</b>Versão base fechada</div>
        </div>
      </div>
    </div>`;
  },
};

// Números sobem de 0 até ao valor quando a vista abre
function contar() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-conta]').forEach(el => {
    const fim = Number(el.dataset.conta), t0 = performance.now(), dur = 700;
    const passo = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(fim * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

let ultimaVista = null;

// Voltar a desenhar não pode tirar o cursor de uma caixa de tarefa nova (nem o que lá está escrito)
function render() {
  const ativo = document.activeElement;
  const manter = ativo && /^(tq|tq-painel)$/.test(ativo.id) ? { id: ativo.id, valor: ativo.value, pos: ativo.selectionStart } : null;
  desenhar();
  if (!manter) return;
  const novo = document.getElementById(manter.id);
  if (!novo) return;
  novo.value = manter.valor; novo.focus({ preventScroll: true }); novo.setSelectionRange(manter.pos, manter.pos);
}
function desenhar() {
  const contagem = {
    ligar: porLigar().length,
    gestoras: dasGestoras().length,
    followup: emFollowUp().filter(l => followUp(st(l.id)) <= hoje()).length, // só as que são para ligar já
    tarefas: T.filter(t => !t.feita && t.prazo <= hoje()).length, // as que já são para fazer
    estrela: D.leads.filter(l => st(l.id).estrela).length,
    duvida: D.leads.filter(l => funil(l) === 'duvida').length,
    proposta: D.leads.filter(l => st(l.id).estado === 'proposta').length,
    curso: D.leads.filter(l => ACEITOU.includes(st(l.id).estado)).length,
    fora: D.leads.filter(l => funil(l) === 'eliminado').length,
    metricas: '',
  };
  $('#tabs').innerHTML = VISTAS.map(([id, nome]) =>
    `<button class="tab" data-vista="${id}" ${id === vista ? 'aria-current="page"' : ''}>${nome}<span class="n ${(id === 'followup' || id === 'tarefas') && contagem[id] ? 'alerta' : ''}">${contagem[id]}</span></button>`).join('');

  const [, nome, sub] = VISTAS.find(v => v[0] === vista);
  $('#titulo').textContent = nome;
  $('#subtitulo').textContent = sub;

  const concelhos = [...new Set(D.leads.map(l => l.concelho))].sort();
  $('#filtros').innerHTML = vista === 'metricas' ? '' : vista === 'tarefas' ? `
    <input type="search" id="q" placeholder="Procurar…" value="${esc(filtro.q)}">
    <select id="fcasa"><option value="">Todas as casas</option>${pastas.map(c => `<option ${c.slug === filtro.casa ? 'selected' : ''}>${esc(c.slug)}</option>`).join('')}</select>
    <select id="fcat"><option value="">Todas as categorias</option>${CATEGORIAS.map(([v, n]) => `<option value="${v}" ${v === filtro.categoria ? 'selected' : ''}>${n}</option>`).join('')}</select>` : `
    <input type="search" id="q" placeholder="Procurar…" value="${esc(filtro.q)}">
    <select id="fc"><option value="">Todos os concelhos</option>${concelhos.map(c => `<option ${c === filtro.concelho ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>`;

  $('#vista').innerHTML = VISTA[vista]();
  // animações de entrada só quando se muda de vista, não a cada clique
  const nova = vista !== ultimaVista;
  $('#vista').classList.toggle('anim', nova);
  if (nova && vista === 'metricas') contar();
  ultimaVista = vista;
  $('#foot').innerHTML = (D.demo ? '<span class="demo">Dados fictícios</span><br>' : '')
    + (D.concelhos || []).map(c => `<b>${esc(c.nome)}</b> · ${dataPT(c.data)}`).join('<br>');
  if (aberto) renderPainel();
}

// ---------- painel ----------
function renderPainel() {
  const l = D.leads.find(x => x.id === aberto);
  const s = st(l.id);
  const seg = (campo, opcoes) => `<div class="seg">${opcoes.map(([v, t]) =>
    `<button data-campo="${campo}" data-v="${esc(v)}" aria-pressed="${String(s[campo]) === String(v)}">${t}</button>`).join('')}</div>`;

  let extra = '';
  if (s.estado === 'nao_atendeu') extra = `<div class="campo"><span class="rotulo">Tentativas</span>
    <div class="stepper"><button data-tent="-1" aria-label="Menos">−</button><b>${s.tentativas || 0}</b><button data-tent="1" aria-label="Mais">+</button></div></div>`;
  if (s.estado === 'ligar_depois') extra = `<div class="campo"><span class="rotulo">Ligar em</span><input type="date" id="ligar_em" value="${esc(s.ligar_em || '')}"></div>`;
  if (s.estado === 'recusou') extra = `<div class="campo"><span class="rotulo">Duração da chamada</span>${seg('duracao', DURACAO)}</div>`;
  if (s.estado === 'falha_claude') extra = `<div class="campo"><span class="rotulo">O que o Claude falhou</span>${seg('falha', FALHAS)}</div>`;
  if (FOLLOW_UP.includes(s.estado)) {
    const outros = s.enviado_por === 'email' ? (l.email ? [l.email] : []) : tels(l).map(t => t.numero);
    extra += `<div class="campo envio ${s.enviado_por && s.enviado_para ? '' : 'falta'}"><span class="rotulo">Por onde enviaste${s.estado === 'proposta' ? ' a proposta' : ' a base'}?</span>
    <div class="seg">${CANAIS.map(([v, t]) => `<button data-canal="${v}" aria-pressed="${s.enviado_por === v}">${t}</button>`).join('')}</div>
    ${s.enviado_por ? `<input id="enviado_para" type="${s.enviado_por === 'email' ? 'email' : 'tel'}" value="${esc(s.enviado_para || '')}"
      placeholder="${s.enviado_por === 'email' ? 'Email para onde enviaste' : 'Número para onde enviaste'} (Enter para gravar)" autocomplete="off">
    ${outros.filter(o => o !== s.enviado_para).length ? `<div class="seg">${outros.filter(o => o !== s.enviado_para).map(o =>
      `<button data-para="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}` : ''}</div>`;
  }
  if (s.estado in PRIORIDADE) extra += `<div class="campo"><span class="rotulo">${s.estado === 'aceitou_base' ? 'Enviar a base até' : 'Ligar de volta em'} · ${quando(followUp(s))}</span>
    <div class="fu-painel"><input type="date" id="follow_up" value="${followUp(s)}" min="${hoje()}"></div>
    ${s.enviado_em || s.sem_resposta ? `<span style="font-size:12px;color:var(--muted)">${[s.enviado_em && `Enviada a ${dataPT(s.enviado_em + 'T12:00')}`, s.sem_resposta && `${s.sem_resposta}× sem resposta`].filter(Boolean).join(' · ')}</span>` : ''}</div>
    <div class="campo"><span class="rotulo">Nota do follow-up · aparece na página de follow-up</span>
    <textarea id="fu_nota" placeholder="Ex.: o genro vê no fim de semana e ele liga na terça; se não ligar, ligo na quarta">${esc(s.fu_nota || '')}</textarea></div>`;
  if (COM_TEMPERATURA.includes(s.estado)) extra += `<div class="campo"><span class="rotulo">Temperatura: quão propensa a fechar o site (0–10)</span>
    ${seg('temperatura', Array.from({ length: 11 }, (_, i) => [i, i]))}</div>`;

  const caixa = 'height:36px;border:1px solid var(--line);border-radius:10px;padding:0 10px;font:inherit;background:var(--surface)';
  const casa = casaDe(s), link = linkDe(s);
  const hero = ACEITOU.includes(s.estado) ? `<div class="bloco"><span class="rotulo">Versão base</span>
    <div style="display:flex;gap:8px">
      <select id="pasta" style="flex:1;${caixa}">
        <option value="">Escolher a casa…</option>${pastas.map(c => `<option value="${esc(c.slug)}" ${c.slug === s.pasta ? 'selected' : ''}>${esc(c.slug)}</option>`).join('')}
      </select>
      <button class="btn" id="capturar" ${casa && link ? '' : 'disabled'}>Atualizar hero</button>
    </div>
    ${casa ? `<div style="display:flex;gap:8px;margin-top:8px">
      <input id="link" style="flex:1;min-width:0;${caixa}" value="${esc(s.link || '')}" placeholder="${esc(casa.deploy || casa.local)}" title="Vazio = ${casa.deploy ? 'o deploy da Vercel' : 'o servidor local'}">
      ${link ? `<a class="btn prim" href="${esc(link)}" target="_blank" rel="noopener">${casa.deploy && !s.link ? 'Site publicado ↗' : 'Abrir site ↗'}</a>` : ''}
    </div>
    <div style="font-size:12px;color:var(--muted);margin-top:6px">${casa.deploy ? 'Publicado na Vercel.' : 'Ainda não publicado: o link é o servidor local (corre o npm run dev na pasta site).'}${casa.hero ? ` Hero de ${new Date(casa.hero).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}.` : ''}</div>
    ${casa.hero ? `<img class="hero-img" src="heros/${encodeURIComponent(casa.slug)}.png?v=${casa.hero}" alt="Hero da versão base" onerror="this.hidden=true">` : ''}` : ''}
  </div>` : '';

  const decidir = funil(l) === 'eliminado' ? `<div class="links"><button class="btn prim flex" data-decidir="${esc(l.id)}" data-v="contactar">Recuperar → ligar</button></div>`
    : funil(l) === 'duvida' ? `<div class="links">
    <button class="btn prim flex" data-decidir="${esc(l.id)}" data-v="contactar">${l.site ? 'Antigo → ligar' : 'Ligar na mesma'}</button>
    <button class="btn flex" data-decidir="${esc(l.id)}" data-v="eliminado">${l.site ? 'Moderno → fora' : 'Fora'}</button></div>` : '';

  $('#painel').innerHTML = `
    <button class="fechar" data-fechar aria-label="Fechar">×</button>
    <div class="cabeca">${avatar(l)}<div>
      <h2>${esc(l.nome)}</h2>
      ${s.proprietario ? `<div class="dono-painel">${esc(s.proprietario)}</div>` : ''}
      <div class="onde">${esc(l.tipo)} · ${esc(l.localidade)}, ${esc(l.concelho)}${l.capacidade ? ` · ${l.capacidade} pessoas` : ""}</div></div></div>
    ${ACEITOU.includes(s.estado) ? blocoTarefas(l) : ''}
    <label class="campo-dono"><span class="rotulo">Proprietário</span>
      <input id="proprietario" value="${esc(s.proprietario || '')}" placeholder="Ex.: Sr. Tiago (Enter para gravar)" autocomplete="off"></label>
    <div class="links">
      ${tels(l).map((t, i) => `<a class="btn ${i ? '' : 'prim'}" href="tel:${esc(t.numero.replace(/\s/g, ''))}" title="Fonte: ${esc(t.fontes.join(', '))}">☎ ${esc(t.numero)}${t.fontes.length ? ` <small>${esc(t.fontes.join(' · '))}</small>` : ''}</a>`).join('') || '<span class="chip e-ligar_depois">sem telefone</span>'}
      ${l.email ? `<a class="btn" href="mailto:${esc(l.email)}">✉ ${esc(l.email)}</a>` : ''}
      ${l.booking ? `<a class="btn" href="${esc(l.booking.url)}" target="_blank" rel="noopener">Booking ${virgula(l.booking.nota)} · ${l.booking.avaliacoes} ↗</a>` : ''}
      ${(l.plataformas || []).map(p => `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.nome)}${p.nota != null ? ' ' + virgula(p.nota) : ''}${p.avaliacoes != null ? ' · ' + p.avaliacoes : ''} ↗</a>`).join('')}
      ${!l.booking && !l.plataformas?.length ? '<span class="chip nota">sem plataformas</span>' : ''}
      ${(l.redes || []).map(r => `<a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.nome)}${r.ultima ? ' · ' + esc(r.ultima) : ''} ↗</a>`).join('')}
      ${l.canal === 'mensagem' && !(l.redes || []).length ? '<span class="chip nota">sem redes sociais encontradas</span>' : ''}
      ${l.site ? `<a class="btn" href="${esc(l.site.url)}" target="_blank" rel="noopener">Site ↗</a>` : ''}
      <a class="btn" href="${googleURL(l)}" target="_blank" rel="noopener">${l.site ? 'Google ↗' : 'Confirmar no Google ↗'}</a>
    </div>
    <div class="porque"><b>Claude:</b> ${esc(l.motivo)}
      ${l.responsavel ? `<br><b>Responsável:</b> ${esc(l.responsavel)}` : ''}
      ${l.unidades ? `<br><b>${l.unidades.length} unidades:</b> ${esc(l.unidades.join(', '))}` : ''}
      ${l.morada ? `<br><b>Morada:</b> ${esc(l.morada)}` : ''}
      ${l.verificacao ? `<br><b>Como verifiquei (${dataPT(l.verificacao.data)}):</b><br>· Perfil Google: ${esc(l.verificacao.maps)}<br>· Pesquisa: ${esc(l.verificacao.pesquisa)}<br>· Domínio: ${esc(l.verificacao.dominio)}` : ''}
    </div>
    ${decidir}
    ${ACEITOU.includes(s.estado) ? '' : blocoTarefas(l)}
    <div class="bloco"><span class="rotulo">Estado</span>
      <div class="estados">${ESTADOS.map(([v, t]) =>
        `<button data-estado="${v}" class="${s.estado === v ? 'e-' + v : ''}" aria-pressed="${s.estado === v}">${t}</button>`).join('')}</div>
      ${extra}
    </div>
    ${hero}
    <div class="bloco"><span class="rotulo">Notas</span>
      <div class="notas">${(s.notas || []).slice().reverse().map(n =>
        `<div class="nota-item"><time>${new Date(n.data).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</time><p>${esc(n.texto)}</p></div>`).join('')}</div>
      <div class="nota-nova"><textarea id="nota" placeholder="Escreve uma nota… (Ctrl+Enter guarda)"></textarea>
        <button class="btn prim" id="addNota">Guardar nota</button></div>
    </div>`;
}

// No cartão: a próxima tarefa da casa, que se fecha ali mesmo
function proximaTarefa(l) {
  const ts = tarefasDe(l);
  if (!ts.length) return '';
  const t = ts[0];
  return `<div class="prox-tarefa ${t.prazo < hoje() ? 'atrasada' : ''}">
    <button class="visto" data-tfeita="${esc(t.id)}" aria-label="Marcar como feita"></button>
    <span class="prox-titulo">${esc(t.titulo)}</span><small>${quando(t.prazo)}${ts.length > 1 ? ` · +${ts.length - 1}` : ''}</small></div>`;
}

function blocoTarefas(l) {
  const ts = tarefasDe(l);
  return `<div class="bloco bloco-tarefas"><span class="rotulo">Tarefas${ts.length ? ` · ${ts.length} por fazer` : ''}</span>
    <input id="tq-painel" class="tarefa-painel-novo" placeholder="O que há para fazer?  (Enter cria)" autocomplete="off">
    ${escolhas('tq-painel')}
    ${ts.map(t => `<div class="tarefa mini">
      <button class="visto" data-tfeita="${esc(t.id)}" aria-pressed="false" aria-label="Marcar como feita"></button>
      <div class="tarefa-corpo"><div class="tarefa-titulo">${esc(t.titulo)}</div>
        <div class="tarefa-meta"><span class="chip p-${t.prioridade}">${PRIO_NOME[t.prioridade]}</span>
          <span class="chip nota ${t.prazo < hoje() ? 'baixa' : ''}">${quando(t.prazo)}${t.hora ? ' · ' + t.hora : ''}</span>${chipAuto(t)}${botoesAdiar(t)}</div></div></div>`).join('')}
  </div>`;
}

function abrir(id) {
  aberto = id; renderPainel();
  $('#painel').classList.add('aberto'); $('#painel').setAttribute('aria-hidden', 'false'); $('#veu').hidden = false;
}
function fechar() {
  aberto = null;
  $('#painel').classList.remove('aberto'); $('#painel').setAttribute('aria-hidden', 'true'); $('#veu').hidden = true;
}

function mudar(id, fn) { fn(st(id)); guardar(id); render(); }

function addNota() {
  const txt = $('#nota').value.trim();
  if (!txt) return;
  mudar(aberto, s => (s.notas ||= []).push({ data: new Date().toISOString(), texto: txt }));
}

// ---------- eventos ----------
document.addEventListener('click', async e => {
  if (e.target.closest('a, input, label')) return; // links e campos (datas) seguem o seu caminho, não abrem o painel
  const t = e.target.closest('button, [data-abrir], [data-teditar]');
  if (!t) return;
  const d = t.dataset;
  if (d.vista) { vista = d.vista; history.replaceState(null, '', '#' + vista); fechar(); return render(); }
  if (d.tfeita) { const t = T.find(x => x.id === d.tfeita);
    return gravarTarefa({ ...t, feita: !t.feita, feita_em: t.feita ? undefined : new Date().toISOString() }, t.feita ? 'Tarefa reaberta' : 'Feita ✓'); }
  if (d.teditar) { editando = { ...T.find(x => x.id === d.teditar) }; render(); return $('#te-titulo')?.focus(); }
  if (d.tpri) { lerEdicao(); editando.prioridade = d.tpri; return render(); }
  if (d.tguardar !== undefined) { lerEdicao(); if (!editando.titulo || !editando.prazo) return toast('Falta o título ou o prazo', true);
    const t = editando; editando = null; return gravarTarefa(t); }
  if (d.tcancelar !== undefined) { editando = null; return render(); }
  if (d.tapagar) return apagarTarefa(d.tapagar);
  if (d.tnova) { e.stopPropagation(); abrir(d.tnova); return setTimeout(() => $('#tq-painel')?.focus(), 50); }
  if (d.eprazo !== undefined || d.eprio) return escolher(t);
  if (d.tadiar) { const x = T.find(y => y.id === d.tadiar), n = Number(d.n); return gravarTarefa(adiar(x, n), `Adiada para ${quando(adiar(x, n).prazo).toLowerCase()}`); }
  if (d.tauto) { const x = T.find(y => y.id === d.tauto); return gravarTarefa({ ...x, auto: null }, 'Já não se fecha sozinha'); }
  if (d.tirarAviso) { e.stopPropagation(); return mudar(d.tirarAviso, s => delete s.aviso); }
  if (d.estrela) { e.stopPropagation(); return mudar(d.estrela, s => (s.estrela = !s.estrela)); }
  if (d.decidir) { e.stopPropagation(); return mudar(d.decidir, s => (s.decisao = d.v)); }
  if (d.fechar !== undefined) return fechar();
  if (d.fuFiltro) { filtro.dia = filtro.dia === d.fuFiltro ? '' : d.fuFiltro; return render(); }
  if (d.fuSem) { e.stopPropagation();
    return mudar(d.fuSem, s => { s.sem_resposta = (s.sem_resposta || 0) + 1; s.follow_up = maisDias(DIAS_SEM_RESPOSTA); }); }
  if (d.fuRespondeu) return abrir(d.fuRespondeu);
  if (d.fuEnviada) { mudar(d.fuEnviada, s => mudarEstado(s, 'base_enviada')); return abrir(d.fuEnviada); } // abre para dizer por onde
  if (d.canal) {
    const l = D.leads.find(x => x.id === aberto);
    mudar(aberto, s => {
      const tipo = c => c === 'email' ? 'email' : 'tel';
      if (!s.enviado_para || tipo(s.enviado_por) !== tipo(d.canal)) s.enviado_para = sugestaoPara(l, d.canal) || undefined;
      s.enviado_por = d.canal;
    });
    const inp = $('#enviado_para'); // pronto a escrever ou a corrigir
    if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (d.para) return mudar(aberto, s => (s.enviado_para = d.para));
  if (d.estado) return mudar(aberto, s => mudarEstado(s, d.estado));
  if (d.campo) return mudar(aberto, s => (s[d.campo] = d.campo === 'temperatura' ? Number(d.v) : d.v));
  if (d.tent) return mudar(aberto, s => (s.tentativas = Math.max(0, (s.tentativas || 0) + Number(d.tent))));
  if (t.id === 'addNota') return addNota();
  if (t.id === 'capturar') {
    t.disabled = true; t.textContent = 'A capturar…';
    const s = st(aberto);
    const r = await fetch('/api/hero', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pasta: s.pasta, link: linkDe(s) }) });
    toast(r.ok ? 'Hero atualizado' : 'O site não abriu: está publicado ou com o npm run dev a correr?', !r.ok);
    pastas = await fetch('/api/pastas').then(r => r.json());
    return render();
  }
  if (d.abrir && !t.matches('button')) return abrir(d.abrir);
});
document.addEventListener('change', e => {
  if (e.target.id === 'proprietario') mudar(aberto, s => (s.proprietario = e.target.value.trim() || undefined));
  if (e.target.id === 'enviado_para') mudar(aberto, s => (s.enviado_para = e.target.value.trim() || undefined));
  if (e.target.id === 'follow_up' && e.target.value) mudar(aberto, s => (s.follow_up = e.target.value));
  if (e.target.id === 'fu_nota') mudar(aberto, s => (s.fu_nota = e.target.value.trim() || undefined));
  if (e.target.dataset.fuDia && e.target.value) mudar(e.target.dataset.fuDia, s => (s.follow_up = e.target.value));
  if (e.target.dataset.reuniao) mudar(e.target.dataset.reuniao, s => (s.reuniao = e.target.value || undefined));
  if (e.target.dataset.reuniaoHora) mudar(e.target.dataset.reuniaoHora, s => (s.reuniao_hora = e.target.value || undefined));
  if (e.target.id === 'ligar_em')mudar(aberto, s => (s.ligar_em = e.target.value));
  if (e.target.id === 'pasta') { mudar(aberto, s => { s.pasta = e.target.value || undefined; delete s.link; }); heroesAuto(); }
  if (e.target.id === 'link') { mudar(aberto, s => (s.link = e.target.value.trim() || undefined)); heroesAuto(); }
  if (e.target.id === 'fc') { filtro.concelho = e.target.value; render(); }
  if (e.target.id === 'fcasa') { filtro.casa = e.target.value; render(); }
  if (e.target.id === 'fcat') { filtro.categoria = e.target.value; render(); }
  if (e.target.id === 'tq-casa') rapida.casa = e.target.value;
  if (e.target.id === 'tq-cat') rapida.categoria = e.target.value;
  if (e.target.dataset.ehora !== undefined) { // hora opcional; vazia = 22:00
    escolha[e.target.dataset.ehora].hora = e.target.value; e.target.classList.toggle('on', !!e.target.value);
    document.getElementById(e.target.dataset.ehora)?.focus();
  }
  if (e.target.dataset.edata && e.target.value) { // outro dia: o calendário substitui os botões de prazo
    escolha[e.target.dataset.edata].prazo = e.target.value; e.target.classList.add('on');
    e.target.closest('.seg').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    document.getElementById(e.target.dataset.edata)?.focus();
  }
  if (e.target.id === 'ff') { filtro.funil = e.target.value; render(); }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  filtro.q = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && /^(proprietario|enviado_para)$/.test(e.target.id)) e.target.blur(); // Enter grava (dispara o change)
  if (e.key === 'Enter' && e.target.dataset.aviso) { // grava, a nota passa para a caixa vermelha e o campo fica vazio
    const txt = e.target.value.trim(), id = e.target.dataset.aviso;
    e.target.value = ''; e.target.blur();
    if (txt) mudar(id, s => (s.aviso = txt));
  } // Enter grava (dispara o change)
  if (e.key === 'Enter' && (e.target.id === 'tq' || e.target.id === 'tq-painel')) criarRapida(e.target.id);
  if (e.key === 'Enter' && e.target.id === 'te-titulo') document.querySelector('[data-tguardar]')?.click();
  if (e.key === 'Escape' && editando) { editando = null; render(); }
  if (e.key === 'Escape' && e.target.id === 'fu_nota') e.target.blur(); // grava a nota do follow-up antes de fechar
  if (e.key === 'Escape' && aberto) fechar();
  if (e.key === 'Enter' && e.ctrlKey && e.target.id === 'nota') addNota();
});
$('#veu').addEventListener('click', fechar);

// tooltip dos gráficos (quadrados e segmentos com data-tip)
document.addEventListener('mousemove', e => {
  const alvo = e.target.closest('[data-tip]'), tip = $('#tip');
  if (!alvo) return tip.classList.remove('on');
  tip.textContent = alvo.dataset.tip;
  tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px';
  tip.classList.add('on');
});

// Fechar ou recarregar a janela com alterações por gravar pede confirmação
window.addEventListener('beforeunload', e => { if (porGravar.size) { e.preventDefault(); e.returnValue = ''; } });

carregar().catch(e => { $('#vista').innerHTML = vazio('Não consegui ler os dados: ' + esc(e.message)); });

// Atualização automática: quando o Claude grava leads novas ou o dashboard muda, a janela aberta acompanha
let versao = null;
setInterval(async () => {
  try {
    const v = await fetch('/api/versao').then(r => r.json());
    avisoOffline(false);
    if (porGravar.size) { // o servidor voltou: grava primeiro o que ficou pendente
      for (const id of [...porGravar]) await guardar(id, true);
      if (porGravar.size) return;
      toast('Alterações pendentes gravadas');
      return; // na volta seguinte já compara versões com tudo gravado
    }
    if (!versao) { versao = v; return; }
    if (v.codigo !== versao.codigo) return location.reload();
    if (v.casas !== versao.casas) { // um site mudou, foi publicado ou ganhou hero novo
      versao.casas = v.casas;
      pastas = await fetch('/api/pastas').then(r => r.json());
      render();
      heroesAuto();
    }
    const escrever = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.value;
    if (v.tarefas !== versao.tarefas && !editando && !escrever) { versao.tarefas = v.tarefas; const t = await fetch('/api/tarefas').then(r => r.json()); T = t.tarefas; AUTO_TEXTO = t.auto || {}; render(); }
    if (v.dados === versao.dados) return;
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.value) return; // não interromper quem está a escrever
    versao = v;
    D = await fetch('/api/data').then(r => r.json());
    render();
    toast('Leads atualizadas');
  } catch { avisoOffline(true); /* servidor em baixo: tenta outra vez daqui a pouco */ }
}, 4000);

// Faixa fixa enquanto o servidor não responde: nada do que se mude fica gravado até ele voltar
function avisoOffline(on) {
  let el = document.getElementById('offline');
  if (!on) return el?.remove();
  if (el) return;
  el = document.createElement('div');
  el.id = 'offline';
  el.setAttribute('role', 'alert');
  el.textContent = 'O servidor do dashboard está desligado: nada está a ser gravado. Abre o atalho "Leads AL" para o ligar; o que mudaste entretanto grava-se sozinho quando ele voltar.';
  document.body.appendChild(el);
}
