// Servidor local do dashboard. Só a biblioteca padrão do Node, sem npm install.
// data/leads.json  -> escrito pelo Claude (pesquisa)
// data/estado.json -> escrito pelo dashboard (o que o Gonçalo muda: estado, estrela, notas)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const PORT = 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return fallback; throw e; } // JSON estragado: falha alto, não sobrescreve
}

function writeJSON(file, obj) {
  const p = path.join(DATA, file);
  if (fs.existsSync(p)) fs.copyFileSync(p, p.replace(/\.json$/, '.bak.json')); // versão anterior sempre guardada
  fs.writeFileSync(p + '.tmp', JSON.stringify(obj, null, 2));
  fs.renameSync(p + '.tmp', p);
}

// As casas (versões base) vivem em nichos/alojamento/casas/<slug>, com o site Next.js em site/.
// Link: o deploy da Vercel se a pasta site/.vercel existir, senão o servidor local.
const CASAS = path.join(ROOT, '..', 'casas');
const LOCAL = 'http://localhost:3000';
const IGNORAR = /^(node_modules|\.next|\.git|\.vercel)$/;

// ficheiro mais recente do site (para saber quando o hero ficou desatualizado)
function ultimaAlteracao(dir, fundo = 0) {
  let max = 0;
  let itens;
  try { itens = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const d of itens) {
    if (IGNORAR.test(d.name)) continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) { if (fundo < 6) max = Math.max(max, ultimaAlteracao(p, fundo + 1)); }
    else try { max = Math.max(max, fs.statSync(p).mtimeMs); } catch {}
  }
  return max;
}

function casas() {
  let dirs;
  try { dirs = fs.readdirSync(CASAS, { withFileTypes: true }); } catch { return []; }
  return dirs.filter(d => d.isDirectory() && !/^[._]/.test(d.name)).map(d => {
    const site = path.join(CASAS, d.name, 'site');
    let deploy = null;
    try { deploy = `https://${JSON.parse(fs.readFileSync(path.join(site, '.vercel', 'project.json'), 'utf8')).projectName}.vercel.app`; } catch {}
    let hero = 0;
    try { hero = fs.statSync(path.join(ROOT, 'heros', d.name + '.png')).mtimeMs; } catch {}
    return { slug: d.name, temSite: fs.existsSync(site), deploy, local: LOCAL, alterado: ultimaAlteracao(site), hero };
  });
}
const pastasSites = () => casas().map(c => c.slug);

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  try {
    if (req.method === 'GET' && url === '/api/data') {
      return send(res, 200, { ...readJSON('leads.json', { leads: [] }), estado: readJSON('estado.json', {}) });
    }
    const m = url.match(/^\/api\/estado\/([\w.-]+)$/);
    if (req.method === 'PUT' && m) {
      let body = '';
      req.on('data', c => (body += c));
      req.on('end', () => {
        try {
          const estado = readJSON('estado.json', {});
          estado[m[1]] = { ...JSON.parse(body), atualizado: new Date().toISOString() };
          writeJSON('estado.json', estado);
          send(res, 200, estado[m[1]]);
        } catch (e) { send(res, 500, { erro: e.message }); }
      });
      return;
    }
    if (req.method === 'GET' && url === '/api/pastas') return send(res, 200, casas());
    // Versões para a janela aberta se atualizar sozinha: dados = leads.json (escrito pelo Claude),
    // casas = última alteração em casas/*/site e nos heros, codigo = ficheiros da app
    if (req.method === 'GET' && url === '/api/versao') {
      const mt = f => { try { return fs.statSync(path.join(ROOT, f)).mtimeMs; } catch { return 0; } };
      const cs = casas();
      return send(res, 200, {
        dados: mt('data/leads.json'), codigo: Math.max(mt('index.html'), mt('app.js'), mt('style.css')),
        casas: cs.map(c => `${c.slug}:${c.deploy}:${c.alterado}:${c.hero}`).join('|'),
      });
    }
    // Hero de uma casa: captura o primeiro ecrã do link (deploy ou localhost) para heros/<slug>.png
    if (req.method === 'POST' && url === '/api/hero') {
      let body = '';
      req.on('data', c => (body += c));
      req.on('end', () => {
        const { pasta, link } = JSON.parse(body || '{}');
        if (!pastasSites().includes(pasta)) return send(res, 400, { erro: 'casa desconhecida' });
        if (!/^https?:\/\//.test(link || '')) return send(res, 400, { erro: 'link inválido' });
        execFile(process.execPath, [path.join(ROOT, 'hero.js'), '--casa', pasta, link], (err, out) =>
          err || !/^ok/.test(out) ? send(res, 500, { erro: String(err?.message || out) }) : send(res, 200, { ok: true, out }));
      });
      return;
    }
    if (req.method !== 'GET') return send(res, 405, { erro: 'método' });

    const file = path.normalize(path.join(ROOT, url === '/' ? 'index.html' : url));
    if (!file.startsWith(ROOT + path.sep) || file.startsWith(DATA)) return send(res, 403, 'proibido', 'text/plain');
    fs.readFile(file, (err, buf) => err
      ? send(res, 404, 'não encontrado', 'text/plain; charset=utf-8')
      : send(res, 200, buf, TYPES[path.extname(file)] || 'application/octet-stream'));
  } catch (e) { send(res, 500, { erro: e.message }); }
});

// Abre o dashboard numa janela própria do Edge ou do Chrome (sem barra de endereço, com ícone na barra de tarefas)
const NAVEGADOR = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean)
  .flatMap(d => [path.join(d, 'Microsoft\\Edge\\Application\\msedge.exe'), path.join(d, 'Google\\Chrome\\Application\\chrome.exe')])
  .find(p => fs.existsSync(p));
const abrir = () => process.argv.includes('--abrir')
  && (NAVEGADOR ? execFile(NAVEGADOR, [`--app=http://localhost:${PORT}`], () => {})
    : require('child_process').exec(`start "" http://localhost:${PORT}`));

server.on('error', e => {
  if (e.code !== 'EADDRINUSE') throw e;
  abrir(); // já está a correr: só abre a janela
  setTimeout(() => process.exit(0), 1500);
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Dashboard em http://localhost:${PORT}`);
  abrir();
});
