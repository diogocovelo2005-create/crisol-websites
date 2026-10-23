// Facebook de cada lead "Mensagem" (ativa, sem telefone) de um concelho: o contacto passa a ser por mensagem na página.
//   node ferramentas/redes.mjs "São Pedro do Sul"
// Os motores de pesquisa automáticos não servem (o Bing devolve lixo ao robô, o DuckDuckGo bloqueia), por isso tenta-se
// o endereço provável da página (facebook.com/casadosoito, casa.do.soito, ...). Só se aceita uma página cujo título
// tenha uma palavra distintiva da casa e fale do concelho ou da localidade.
// O Instagram não mostra perfis sem sessão iniciada: fica por ver à mão (o dashboard mostra "sem redes sociais encontradas").
// Escreve data/redes-<concelho>.json; o montar das leads grava-as no campo "redes".
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/redes.mjs "<Concelho>"'); process.exit(1); }
const nomeF = concelho.toLowerCase().replace(/\s+/g, '-');
const lerJ = f => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
const leads = lerJ(path.join(RAIZ, 'data', 'leads.json')).leads.filter(l => l.concelho === concelho && l.canal === 'mensagem');
const bk = lerJ(path.join(RAIZ, 'data', `booking-${nomeF}.json`)).anuncios || {};
const ab = lerJ(path.join(RAIZ, 'data', `airbnb-${nomeF}.json`)).anuncios || {};
const fSaida = path.join(RAIZ, 'data', `redes-${nomeF}.json`);
const out = lerJ(fSaida);

const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const GEN = /^(casa|casas|quinta|home|house|apartamento|termas|pedro|loft|guest|alojamento|local|villa|vila|campo|turismo|rural|portugal|ferias)$/;
const distintas = s => sa(s).split(/[^a-z0-9]+/).filter(w => w.length > 3 && !GEN.test(w));
function enderecos(nome, localidade) {
  const p = sa(nome).replace(/[^a-z0-9 ]+/g, ' ').trim().split(/\s+/);
  const sem = p.filter(w => !/^(d[aeo]s?|e)$/.test(w));
  const c = sa(concelho).replace(/\s+/g, ''), loc = sa(localidade).replace(/\s+/g, '');
  return [...new Set([p.join(''), p.join('.'), sem.join(''), p.join('') + c, p.join('') + loc, p.join('') + 'al', sem.join('') + 'sps', p.join('_')])].filter(h => h.length >= 5 && h.length <= 50);
}

const { chromium } = createRequire(path.join(RAIZ, 'package.json'))('playwright-core');
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: false, args: ['--headless=new', '--disable-blink-features=AutomationControlled'] });
const page = await browser.newPage({ locale: 'pt-PT', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' });

async function paginaFB(handle) {
  try {
    await page.goto(`https://www.facebook.com/${handle}/`, { timeout: 30000 });
    await page.waitForTimeout(2500);
    return await page.evaluate(() => ({
      titulo: document.querySelector('meta[property="og:title"]')?.content || '',
      descricao: document.querySelector('meta[name="description"]')?.content || '',
    }));
  } catch { return null; }
}

for (const l of leads) {
  if (out[l.id]?.redes?.length) continue;
  const nomes = [...new Set([
    l.booking && Object.values(bk).find(a => a.url === l.booking.url)?.nome,
    ...(l.plataformas || []).map(p => Object.values(ab).find(a => a.url === p.url)?.titulo),
    l.nome,
  ].filter(Boolean).map(n => n.split(/ [-–|:,] | com /)[0].trim()))].slice(0, 3);
  const chaves = new Set(nomes.flatMap(distintas));
  const sitio = [sa(concelho), sa(l.localidade)].filter(s => s.length > 3);
  const redes = [];
  for (const n of nomes) {
    for (const h of enderecos(n, l.localidade)) {
      const r = await paginaFB(h);
      if (!r?.titulo) continue;
      const txt = sa(r.titulo + ' ' + r.descricao);
      if (distintas(r.titulo).some(w => chaves.has(w)) && sitio.some(s => txt.includes(s))) {
        const seguidores = (r.descricao.match(/([\d.\s]+) seguidores/) || [])[1]?.replace(/\D/g, '');
        redes.push({ nome: 'Facebook', url: `https://www.facebook.com/${h}/`, titulo: r.titulo.trim(), seguidores: seguidores ? Number(seguidores) : undefined });
        break;
      }
    }
    if (redes.length) break;
  }
  out[l.id] = { nomes, redes };
  fs.writeFileSync(fSaida, JSON.stringify(out, null, 1));
  console.log(l.nome, '|', nomes.join(' / '), '=>', redes.length ? `${redes[0].titulo} (${redes[0].seguidores ?? '?'} seguidores) ${redes[0].url}` : 'nada');
}
await browser.close();

// gravar no dashboard (só os campos redes e verificacao.redes; o estado do Diogo não se toca)
const fLeads = path.join(RAIZ, 'data', 'leads.json');
const d = JSON.parse(fs.readFileSync(fLeads, 'utf8'));
fs.copyFileSync(fLeads, path.join(RAIZ, 'data', 'leads.bak.json'));
let n = 0;
for (const l of d.leads) {
  const x = out[l.id]; if (!x) continue;
  l.verificacao = l.verificacao || {};
  l.verificacao.redes = x.redes.length ? 'Facebook encontrado pelo endereço provável' : `Facebook: nenhuma página com os endereços prováveis (${x.nomes.join(' / ')}); Instagram por ver à mão`;
  if (x.redes.length) { l.redes = x.redes.map(({ nome, url, seguidores }) => ({ nome, url, seguidores })); n++; }
}
fs.writeFileSync(fLeads, JSON.stringify(d, null, 2));
console.log(`${leads.length} leads Mensagem · com Facebook ${n} ->`, path.relative(process.cwd(), fSaida));
