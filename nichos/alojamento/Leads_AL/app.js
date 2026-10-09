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
const DURACAO = [['<1', '< 1 min'], ['1-3', '1–3 min'], ['>3', '> 3 min']];
const FALHAS = [['tinha_site', 'Tinha site'], ['site_moderno', 'Site é moderno'], ['nota_errada', 'Nota errada'],
  ['nao_e_al', 'Não é AL'], ['fechou', 'Fechou'], ['outro', 'Outro']];

const VISTAS = [
  ['ligar', 'Ligar', 'Quem está por ligar, com as estreladas primeiro'],
  ['estrela', 'Estrela', 'As leads que marcaste como melhores'],
  ['duvida', 'Dúvida', 'Sites que não consegui classificar e alojamentos sem presença online. Tu decides.'],
  ['proposta', 'Proposta', 'Querem ver a proposta antes da versão base. Quando aceitarem a base, muda para "Aceitou base".'],
  ['curso', 'Em curso', 'Versões base pedidas, enviadas e fechadas'],
  ['fora', 'Descartadas', 'O que ficou de fora e porquê. Se discordares, abre a lead e recupera-a.'],
  ['metricas', 'Métricas', 'Taxa de sucesso das chamadas e das versões base'],
];

let D = { leads: [], estado: {} };
let pastas = [];
let vista = VISTAS.some(v => v[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'ligar';
let aberto = null;
const filtro = { q: '', concelho: '', funil: '' };

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const st = id => D.estado[id] || (D.estado[id] = { estado: 'por_contactar', notas: [] });
const funil = l => st(l.id).decisao || l.funil;
const hoje = () => new Date().toISOString().slice(0, 10);
const dataPT = d => d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) : '';
const virgula = n => n.toFixed(1).replace('.', ',');
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
// Todos os números da lead (formato novo) ou o antigo campo único
const tels = l => l.telefones || (l.telefone ? [{ numero: l.telefone, fontes: [] }] : []);
const googleURL = l => 'https://www.google.com/search?q=' + encodeURIComponent(`${l.nome} ${l.localidade}`);

async function carregar() {
  const [data, p] = await Promise.all([fetch('/api/data').then(r => r.json()), fetch('/api/pastas').then(r => r.json())]);
  D = data; pastas = p;
  render();
  heroesAuto();
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
    <div class="chips">${pequeno(l) ? `<span class="chip nota" title="${l.capacidade} pessoas, ${l.tipos_quarto || 1} tipo(s) de quarto">Pequeno</span>` : ''}${chipNota(l)}${chipSite(l)}${chipEstado(l)}</div>
    <div class="tel">${esc(tels(l)[0]?.numero || '—')}${tels(l).length > 1 ? ` <span class="mais">+${tels(l).length - 1}</span>` : ''}</div>
  </div>`;
}

// Casa pequena (menos de 10 pessoas e até 2 tipos de quarto): não sai, só desce para o fim de cada lista
const pequeno = l => typeof l.capacidade === 'number' && l.capacidade < 10 && !(l.tipos_quarto > 2);
const grupo = (titulo, ls) => {
  ls = ls.slice().sort((a, b) => pequeno(a) - pequeno(b)); // estável: dentro de cada metade, a ordem fica
  return ls.length ? `<div class="grupo-titulo">${titulo} · ${ls.length}</div><div class="lista">${ls.map((l, i) => linha(l, i)).join('')}</div>` : '';
};
const vazio = txt => `<div class="vazio">${txt}</div>`;

function filtrar(ls) {
  const q = filtro.q.trim().toLowerCase();
  return ls.filter(l => (!filtro.concelho || l.concelho === filtro.concelho)
    && (!q || `${l.nome} ${st(l.id).proprietario || ''} ${l.localidade} ${tels(l).map(t => t.numero).join(' ')}`.toLowerCase().includes(q)));
}

// ---------- vistas ----------
const porLigar = () => D.leads.filter(l => funil(l) === 'contactar' && POR_LIGAR.includes(st(l.id).estado));

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
      + grupo('Por contactar', resto.filter(l => !e(l).estrela && e(l).estado === 'por_contactar'))
      + grupo('Não atenderam', resto.filter(l => !e(l).estrela && e(l).estado === 'nao_atendeu'))
      + grupo('Agendadas', resto.filter(l => !e(l).estrela && e(l).estado === 'ligar_depois')
        .sort((a, b) => (e(a).ligar_em || '').localeCompare(e(b).ligar_em || '')));
    return html || vazio('Ninguém por ligar. Pede ao Claude um concelho novo.');
  },
  estrela() {
    return grupo('Estreladas', filtrar(D.leads.filter(l => st(l.id).estrela))) || vazio('Marca ★ numa lead para ela aparecer aqui.');
  },
  duvida() {
    const ls = filtrar(D.leads.filter(l => funil(l) === 'duvida')).sort((a, b) => (!!b.site - !!a.site) || (pequeno(a) - pequeno(b))); // sites primeiro, pequenos no fim
    if (!ls.length) return vazio('Sem dúvidas por decidir.');
    return `<div class="duvidas">${ls.map((l, i) => `
      <div class="cartao" style="--i:${i}">
        ${l.site ? `<div class="captura ${l.site.captura ? '' : 'vazia'}" ${l.site.captura ? `style="background-image:url('${esc(l.site.captura)}')"` : ''}>${l.site.captura ? '' : 'sem captura'}</div>` : ''}
        <div class="corpo" data-abrir="${esc(l.id)}" style="cursor:pointer">
          <div class="nome">${esc(l.nome)}</div>
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
          ${c && link ? `<a class="btn" style="align-self:flex-start" href="${esc(link)}" target="_blank" rel="noopener">${c.deploy && !s.link ? 'Site publicado ↗' : 'Abrir site ↗'}</a>` : ''}
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
          <div class="legenda"><span style="--c:var(--serie-1)">Aceitou base <b>${aceites.length}</b></span><span style="--c:var(--s-rosa-ink)">Pediu proposta <b>${com(['proposta']).length}</b></span><span style="--c:var(--cinza-1)">Recusou <b>${com(['recusou']).length}</b></span></div>
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

function render() {
  const contagem = {
    ligar: porLigar().length,
    estrela: D.leads.filter(l => st(l.id).estrela).length,
    duvida: D.leads.filter(l => funil(l) === 'duvida').length,
    proposta: D.leads.filter(l => st(l.id).estado === 'proposta').length,
    curso: D.leads.filter(l => ACEITOU.includes(st(l.id).estado)).length,
    fora: D.leads.filter(l => funil(l) === 'eliminado').length,
    metricas: '',
  };
  $('#tabs').innerHTML = VISTAS.map(([id, nome]) =>
    `<button class="tab" data-vista="${id}" ${id === vista ? 'aria-current="page"' : ''}>${nome}<span class="n">${contagem[id]}</span></button>`).join('');

  const [, nome, sub] = VISTAS.find(v => v[0] === vista);
  $('#titulo').textContent = nome;
  $('#subtitulo').textContent = sub;

  const concelhos = [...new Set(D.leads.map(l => l.concelho))].sort();
  $('#filtros').innerHTML = vista === 'metricas' ? '' : `
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
    <label class="campo-dono"><span class="rotulo">Proprietário</span>
      <input id="proprietario" value="${esc(s.proprietario || '')}" placeholder="Ex.: Sr. Tiago (Enter para gravar)" autocomplete="off"></label>
    <div class="links">
      ${tels(l).map((t, i) => `<a class="btn ${i ? '' : 'prim'}" href="tel:${esc(t.numero.replace(/\s/g, ''))}" title="Fonte: ${esc(t.fontes.join(', '))}">☎ ${esc(t.numero)}${t.fontes.length ? ` <small>${esc(t.fontes.join(' · '))}</small>` : ''}</a>`).join('') || '<span class="chip e-ligar_depois">sem telefone</span>'}
      ${l.email ? `<a class="btn" href="mailto:${esc(l.email)}">✉ ${esc(l.email)}</a>` : ''}
      ${l.booking ? `<a class="btn" href="${esc(l.booking.url)}" target="_blank" rel="noopener">Booking ${virgula(l.booking.nota)} · ${l.booking.avaliacoes} ↗</a>` : ''}
      ${(l.plataformas || []).map(p => `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.nome)}${p.nota != null ? ' ' + virgula(p.nota) : ''}${p.avaliacoes != null ? ' · ' + p.avaliacoes : ''} ↗</a>`).join('')}
      ${!l.booking && !l.plataformas?.length ? '<span class="chip nota">sem plataformas</span>' : ''}
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
  if (e.target.closest('a')) return; // links (Booking, site, Google, telefone) seguem o seu caminho
  const t = e.target.closest('button, [data-abrir]');
  if (!t) return;
  const d = t.dataset;
  if (d.vista) { vista = d.vista; history.replaceState(null, '', '#' + vista); fechar(); return render(); }
  if (d.estrela) { e.stopPropagation(); return mudar(d.estrela, s => (s.estrela = !s.estrela)); }
  if (d.decidir) { e.stopPropagation(); return mudar(d.decidir, s => (s.decisao = d.v)); }
  if (d.fechar !== undefined) return fechar();
  if (d.estado) return mudar(aberto, s => (s.estado = d.estado));
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
  if (e.target.id === 'ligar_em')mudar(aberto, s => (s.ligar_em = e.target.value));
  if (e.target.id === 'pasta') { mudar(aberto, s => { s.pasta = e.target.value || undefined; delete s.link; }); heroesAuto(); }
  if (e.target.id === 'link') { mudar(aberto, s => (s.link = e.target.value.trim() || undefined)); heroesAuto(); }
  if (e.target.id === 'fc') { filtro.concelho = e.target.value; render(); }
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
  if (e.key === 'Enter' && e.target.id === 'proprietario') e.target.blur(); // Enter grava (dispara o change)
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
