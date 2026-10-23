// Tarefas: data/tarefas.json, escrito pelo dashboard (server.js) e pelo Google Calendar (google.js).
// Algumas tarefas fecham-se sozinhas quando a prova aparece (regras em AUTO), e apagar o evento
// no Google Calendar também a marca como feita.
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const FICHEIRO = path.join(DATA, 'tarefas.json');
const CASAS = path.join(__dirname, '..', 'casas');
const ENVIADA = ['base_enviada', 'recusou_base', 'base_fechada', 'completa_fechada']; // igual ao app.js

function ler() {
  try { return JSON.parse(fs.readFileSync(FICHEIRO, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return { tarefas: [] }; throw e; } // JSON estragado: falha alto, não sobrescreve
}
function gravar(dados) {
  if (fs.existsSync(FICHEIRO)) fs.copyFileSync(FICHEIRO, FICHEIRO.replace(/\.json$/, '.bak.json'));
  fs.writeFileSync(FICHEIRO + '.tmp', JSON.stringify(dados, null, 2));
  fs.renameSync(FICHEIRO + '.tmp', FICHEIRO);
}

const mtime = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };
const naCasa = (t, ...p) => t.casa ? mtime(path.join(CASAS, t.casa, ...p)) : 0;

// Pelo título, que prova fecha a tarefa. A prova tem de ser mais recente do que a tarefa.
// A ordem conta: "enviar a base" antes de "fazer a base".
const AUTO = {
  enviar_base: { re: /\benviar\s+(a\s+)?(vers[ãa]o\s+)?base\b/i, precisa: 'lead', texto: 'quando marcares "Base enviada"',
    feita: (t, est) => { const s = est[t.lead]; return !!s && ENVIADA.includes(s.estado) && (s.enviado_em || '') >= t.criada.slice(0, 10); } },
  publicar: { re: /\b(publicar|deploy|p[ôo]r\s+(no\s+ar|online)|meter\s+online)\b/i, precisa: 'casa', texto: 'quando o site for ligado à Vercel',
    feita: t => naCasa(t, 'site', '.vercel', 'project.json') > Date.parse(t.criada) },
  dossie: { re: /\b(fazer|criar|acabar|terminar|preparar)\b.*\bdossi[eê]/i, precisa: 'casa', texto: 'quando o dossiê tiver o contrato',
    feita: t => naCasa(t, 'dossie', 'contrato.json') > Date.parse(t.criada) },
  site: { re: /\b(fazer|criar|montar|acabar|terminar)\b.*\b(base|site)\b/i, precisa: 'casa', texto: 'quando aparecer o site da casa',
    feita: t => naCasa(t, 'site', 'package.json') > Date.parse(t.criada) },
};
function regra(t) {
  for (const [k, r] of Object.entries(AUTO)) if (r.re.test(t.titulo) && t[r.precisa]) return k;
  return null;
}

// Fecha as que já têm prova. Devolve quantas fechou.
function fecharSozinhas() {
  const dados = ler();
  let est = {};
  try { est = JSON.parse(fs.readFileSync(path.join(DATA, 'estado.json'), 'utf8')); } catch {}
  let n = 0;
  for (const t of dados.tarefas) {
    if (t.feita || !t.auto || !AUTO[t.auto] || !t.criada) continue;
    if (AUTO[t.auto].feita(t, est)) { Object.assign(t, { feita: true, feita_em: new Date().toISOString(), fechada: 'auto' }); n++; }
  }
  if (n) gravar(dados);
  return n;
}

// Eventos apagados no Google Calendar: as tarefas ficam feitas
function fecharApagadas(ids) {
  const dados = ler();
  let n = 0;
  for (const t of dados.tarefas) if (!t.feita && ids.includes(t.id)) { Object.assign(t, { feita: true, feita_em: new Date().toISOString(), fechada: 'google' }); n++; }
  if (n) gravar(dados);
  return n;
}

const textoAuto = Object.fromEntries(Object.entries(AUTO).map(([k, r]) => [k, r.texto]));
module.exports = { ler, gravar, regra, fecharSozinhas, fecharApagadas, textoAuto };
