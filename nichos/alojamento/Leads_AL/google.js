// Sincronização dos follow-ups com o Google Calendar. Só a biblioteca padrão do Node (fetch).
// data/google-credentials.json -> descarregado da Google Cloud Console (cliente OAuth "App para computador")
// data/google.json             -> escrito aqui: refresh token, calendário "Leads AL" e o evento de cada lead
// Os eventos vivem num calendário próprio; a app só pode mexer nos calendários que ela criou.
const fs = require('fs');
const tarefas = require('./tarefas');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const CREDS = path.join(DATA, 'google-credentials.json');
const ESTADO = path.join(DATA, 'google.json');
const SCOPE = 'https://www.googleapis.com/auth/calendar.app.created';
const API = 'https://www.googleapis.com/calendar/v3';
const NOME_CALENDARIO = 'Leads AL';
const FUSO = 'Europe/Lisbon';
// Cada dia é uma fila de blocos: o primeiro às 9:00, os seguintes de 15 em 15 minutos, pela ordem do dashboard.
// 15 e não menos: o Google Calendar desenha qualquer evento com pelo menos ~15 min e põe lado a lado os que se tocam.
const INICIO = 9 * 60; // minutos desde a meia-noite
const BLOCO = 15;
// Iguais aos do app.js
const DIAS_FOLLOW_UP = 3;
const PRIORIDADE = { aceitou_base: 0, base_enviada: 1, proposta: 2 };
const TIPO = {
  aceitou_base: { titulo: 'Enviar base', cor: '10' }, // verde
  base_enviada: { titulo: 'Ligar · base enviada', cor: '5' }, // amarelo
  proposta: { titulo: 'Ligar · proposta', cor: '6' }, // laranja
};
// Tarefas: um evento por tarefa, à hora escolhida (ou às 22:00) do dia do prazo, com aviso à hora. Os follow-ups já não vão para o calendário.
const TAREFA = { cor: '11', hora: '22:00' }; // vermelho; sem hora escolhida, a tarefa fica às 22:00 do dia do prazo
const EMOJI = { alta: '🔴', media: '🟠', baixa: '🟢' };
const CATEGORIAS = { construcao: 'Construção', legal: 'Legal', vendas: 'Vendas', financeiro: 'Financeiro', outro: 'Outro' };
const CANAIS = { whatsapp: 'WhatsApp', email: 'Email', sms: 'SMS' };

const ler = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fb; } };
const g = () => ler(ESTADO, { eventos: {} });
function gravar(obj) {
  fs.writeFileSync(ESTADO + '.tmp', JSON.stringify(obj, null, 2));
  fs.renameSync(ESTADO + '.tmp', ESTADO);
}
function credenciais() {
  const c = ler(CREDS, null);
  return c && (c.installed || c.web);
}

let ultimoErro = null;
let ultimaSync = null;
let porta = 4321;
const redirect = () => `http://127.0.0.1:${porta}/google/callback`;

function estado() {
  const s = g();
  return { configurado: !!credenciais(), ligado: !!s.refresh_token, conta: s.conta || null,
    eventos: Object.keys(s.eventos || {}).length, erro: ultimoErro, ultima: ultimaSync };
}

// ---------- OAuth ----------
const iniciar = p => { porta = p; };

function urlLigar() {
  const c = credenciais();
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: c.client_id, redirect_uri: redirect(), response_type: 'code', scope: `openid email ${SCOPE}`,
    access_type: 'offline', prompt: 'consent',
  });
}

async function token(params) {
  const c = credenciais();
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: c.client_id, client_secret: c.client_secret, ...params }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error_description || j.error || 'token ' + r.status);
  return j;
}

async function callback(code) {
  const j = await token({ code, grant_type: 'authorization_code', redirect_uri: redirect() });
  if (!j.refresh_token) throw new Error('O Google não devolveu o refresh token. Tenta ligar outra vez.');
  let conta = null;
  try { conta = JSON.parse(Buffer.from(j.id_token.split('.')[1], 'base64url')).email; } catch {}
  const antes = g(); // a mesma conta reaproveita o calendário e os eventos; outra conta começa do zero
  gravar(antes.conta === conta ? { ...antes, refresh_token: j.refresh_token } : { refresh_token: j.refresh_token, conta, eventos: {} });
  acesso = { token: j.access_token, ate: Date.now() + (j.expires_in - 60) * 1000 };
  ultimoErro = null;
}

let acesso = null;
async function accessToken() {
  if (acesso && Date.now() < acesso.ate) return acesso.token;
  const s = g();
  try {
    const j = await token({ refresh_token: s.refresh_token, grant_type: 'refresh_token' });
    acesso = { token: j.access_token, ate: Date.now() + (j.expires_in - 60) * 1000 };
    return acesso.token;
  } catch (e) {
    if (/invalid_grant|expired|revoked/i.test(e.message)) { // autorização retirada ou expirada: pede para voltar a ligar
      const { refresh_token, ...resto } = s; gravar(resto);
      throw new Error('A ligação ao Google expirou. Volta a ligar o Google Calendar.');
    }
    throw e;
  }
}

async function api(metodo, caminho, corpo) {
  const r = await fetch(API + caminho, {
    method: metodo, headers: { Authorization: 'Bearer ' + await accessToken(), 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (r.status === 204) return null;
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error?.message || 'Google ' + r.status); e.status = r.status; throw e; }
  return j;
}

async function calendario() {
  const s = g();
  if (s.calendario) return s.calendario;
  const c = await api('POST', '/calendars', { summary: NOME_CALENDARIO, timeZone: FUSO, description: 'Follow-ups e tarefas do dashboard Leads AL. É o dashboard que mexe aqui.' });
  gravar({ ...g(), calendario: c.id, eventos: {} });
  return c.id;
}

// ---------- eventos ----------
const hoje = () => new Date().toLocaleDateString('sv-SE', { timeZone: FUSO });
function maisDias(n, de) { const d = new Date(de + 'T12:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
const hora = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const dataOriginal = s => s.follow_up || (s.enviado_em ? maisDias(DIAS_FOLLOW_UP, s.enviado_em) : hoje());
// Atrasadas passam para hoje, para não ficarem esquecidas num dia que já passou
const diaDe = s => { const d = dataOriginal(s); return d < hoje() ? hoje() : d; };

// O evento de cada lead no follow-up, já com o bloco do dia, pela mesma ordem da página Follow-up
// (enviar base, bases enviadas, propostas; dentro de cada, a data mais antiga e a mais quente primeiro)
function eventos(leads, est) {
  const ls = leads.filter(l => est[l.id] && TIPO[est[l.id].estado] && (est[l.id].decisao || l.funil) === 'contactar')
    .map(l => ({ l, s: est[l.id], dia: diaDe(est[l.id]), orig: dataOriginal(est[l.id]) }))
    .sort((a, b) => PRIORIDADE[a.s.estado] - PRIORIDADE[b.s.estado] || a.orig.localeCompare(b.orig)
      || (b.s.temperatura ?? -1) - (a.s.temperatura ?? -1) || a.l.id.localeCompare(b.l.id));
  const fila = {}; // quantos blocos já há em cada dia
  const res = {};
  for (const { l, s, dia } of ls) {
    const n = fila[dia] = (fila[dia] || 0) + 1;
    const ini = INICIO + (n - 1) * BLOCO;
    const tels = (l.telefones || (l.telefone ? [{ numero: l.telefone }] : [])).map(t => t.numero);
    const nota = s.fu_nota || ''; // a nota do follow-up, não as notas normais
    const linhas = [
      s.proprietario && `Proprietário: ${s.proprietario}`,
      tels.length && `Telefone: ${tels.join(' / ')}`,
      s.enviado_por && `Enviada por ${CANAIS[s.enviado_por]}${s.enviado_para ? ' para ' + s.enviado_para : ''}${s.enviado_em ? ' a ' + s.enviado_em.split('-').reverse().slice(0, 2).join('/') : ''}`,
      s.sem_resposta && `${s.sem_resposta}× sem resposta`,
      s.temperatura != null && `Temperatura: ${s.temperatura}/10`,
      `${l.localidade}, ${l.concelho}`,
      nota && `\nÚltima nota: ${nota}`,
      `\nDashboard: http://localhost:${porta}/#followup`,
    ].filter(Boolean);
    res[l.id] = {
      summary: `${TIPO[s.estado].titulo}: ${l.nome}${s.proprietario ? ` (${s.proprietario})` : ''}`,
      description: linhas.join('\n'),
      start: { dateTime: `${dia}T${hora(ini)}:00`, timeZone: FUSO },
      end: { dateTime: `${dia}T${hora(ini + BLOCO)}:00`, timeZone: FUSO },
      colorId: TIPO[s.estado].cor,
      // Todos avisam à hora; o primeiro do dia também avisa uma hora antes
      reminders: { useDefault: false, overrides: [...(n === 1 ? [{ method: 'popup', minutes: 60 }] : []), { method: 'popup', minutes: 0 }] },
      extendedProperties: { private: { lead: l.id } },
    };
  }
  return res;
}

function eventosTarefas(lista, leads) {
  const res = {};
  const nome = id => leads.find(l => l.id === id)?.nome;
  for (const t of lista) {
    if (t.feita || !t.prazo) continue;
    const dia = t.prazo < hoje() ? hoje() : t.prazo; // atrasadas passam para hoje, como os follow-ups
    const ini = /^([01]\d|2[0-3]):[0-5]\d$/.test(t.hora || '') ? t.hora : TAREFA.hora;
    const [h, m] = ini.split(':').map(Number);
    const fim = hora(Math.min(h * 60 + m + BLOCO, 24 * 60 - 1)); // não passa da meia-noite
    res['tarefa:' + t.id] = {
      summary: `${EMOJI[t.prioridade] || EMOJI.media} ${t.titulo}${t.casa || nome(t.lead) ? ` · ${t.casa || nome(t.lead)}` : ''}`,
      description: [`Tarefa · ${CATEGORIAS[t.categoria] || 'Outro'} · prioridade ${t.prioridade || 'media'}`, t.casa && `Casa: ${t.casa}`,
        t.descricao && `\n${t.descricao}`, `\nApagar este evento marca a tarefa como feita.`, `Dashboard: http://localhost:${porta}/#tarefas`].filter(Boolean).join('\n'),
      start: { dateTime: `${dia}T${ini}:00`, timeZone: FUSO },
      end: { dateTime: `${dia}T${fim}:00`, timeZone: FUSO },
      colorId: TAREFA.cor,
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
      extendedProperties: { private: { tarefa: t.id } },
    };
  }
  return res;
}

// Eventos de tarefas apagados no Google (no telemóvel, por exemplo): a tarefa fica feita.
// Pergunta só o que mudou desde a última vez; o Google devolve os apagados com status "cancelled".
async function apagadasNoGoogle(cal) {
  const s = g();
  const agora = new Date().toISOString();
  const desde = s.verificado || new Date(Date.now() - 864e5).toISOString();
  const apagados = new Set();
  let pagina;
  do {
    const r = await api('GET', `/calendars/${encodeURIComponent(cal)}/events?` + new URLSearchParams({
      showDeleted: 'true', updatedMin: desde, maxResults: '2500', ...(pagina ? { pageToken: pagina } : {}) }));
    for (const e of r.items || []) if (e.status === 'cancelled') apagados.add(e.id);
    pagina = r.nextPageToken;
  } while (pagina);
  const x = g();
  const ids = Object.entries(x.eventos || {}).filter(([k, v]) => k.startsWith('tarefa:') && apagados.has(v.id)).map(([k]) => k.slice(7));
  for (const id of ids) delete x.eventos['tarefa:' + id]; // já não existe no Google; não é para recriar
  gravar({ ...x, verificado: agora });
  if (ids.length) tarefas.fecharApagadas(ids);
}

// Põe o calendário igual ao dashboard. Calcula sempre todos (uma lead que muda pode mexer nos blocos
// das outras do mesmo dia), mas só chama o Google para os eventos que mudaram.
async function sincronizar() {
  const s = g();
  if (!credenciais() || !s.refresh_token) return;
  const leads = ler(path.join(DATA, 'leads.json'), { leads: [] }).leads;
  const est = ler(path.join(DATA, 'estado.json'), {});
  const cal = await calendario();
  await apagadasNoGoogle(cal).catch(e => { if (e.status !== 404) throw e; }); // 404: calendário apagado, recriado mais abaixo
  const quer = eventosTarefas(tarefas.ler().tarefas, leads); // os eventos de follow-up que já existam ficam fora e são apagados abaixo
  const url = id => `/calendars/${encodeURIComponent(cal)}/events${id ? '/' + id : ''}`;
  for (const id of new Set([...Object.keys(quer), ...Object.keys(g().eventos || {})])) {
    const ev = quer[id];
    const atual = g().eventos?.[id];
    const marca = ev && JSON.stringify(ev);
    if (atual && marca === atual.marca) continue;
    try {
      if (!ev) {
        await api('DELETE', url(atual.id)).catch(e => { if (![404, 410].includes(e.status)) throw e; });
        const x = g(); delete x.eventos[id]; gravar(x);
        continue;
      }
      let feito;
      if (atual) feito = await api('PUT', url(atual.id), ev)
        .catch(e => { if ([404, 410].includes(e.status)) return null; throw e; }); // apagado no Google: cria outra vez
      if (!feito) feito = await api('POST', url(), ev);
      const x = g(); (x.eventos ||= {})[id] = { id: feito.id, marca }; gravar(x);
    } catch (e) {
      if (e.status === 404 && !atual) { // o calendário foi apagado no Google: cria outro e recomeça
        const x = g(); delete x.calendario; x.eventos = {}; gravar(x);
        return sincronizar();
      }
      throw e;
    }
  }
  ultimaSync = new Date().toISOString();
  ultimoErro = null;
}

// Uma sincronização de cada vez; pedidos que chegam entretanto juntam-se numa só
let fila = Promise.resolve();
let pendente = false;
function agendar() {
  if (!credenciais() || !g().refresh_token || pendente) return;
  pendente = true;
  fila = fila.then(async () => {
    pendente = false;
    try { await sincronizar(); } catch (e) { ultimoErro = e.message; console.error('Google Calendar:', e.message); }
  });
}

module.exports = { iniciar, estado, urlLigar, callback, agendar, credenciais };
