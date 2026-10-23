// Domínios óbvios de cada casa: nomejunto e nome-com-hifens, .pt e .com. Passo 5 do SKILL.md.
// Para cada um: registado (DNS), responde (HTTP), título e se a página fala da localidade ou do concelho.
//   node ferramentas/dominios.mjs <lista.json> "<Concelho>" <saida.json>
// Lista: [{ "id", "nome", "localidade", "nomes"?: [outros nomes, ex. o do anúncio] }]. Retoma se parar.
import fs from 'node:fs';
import dns from 'node:dns/promises';

const [, , entrada, concelho, saida] = process.argv;
if (!saida) { console.error('uso: node ferramentas/dominios.mjs <lista.json> "<Concelho>" <saida.json>'); process.exit(1); }
const lista = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const res = fs.existsSync(saida) ? JSON.parse(fs.readFileSync(saida, 'utf8')) : {};
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function variantes(nome) {
  const p = sa(nome).replace(/["“”'’´`]/g, '').replace(/&/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  const out = new Set();
  for (const tld of ['pt', 'com']) { out.add(p.join('') + '.' + tld); out.add(p.join('-') + '.' + tld); }
  return [...out].filter(d => d.length < 60 && d.length > 6);
}
async function registado(d) {
  for (const f of [dns.resolveNs, dns.resolve4]) { try { const r = await f.call(dns, d); if (r.length) return true; } catch {} }
  return false;
}
async function abrir(d, sitio) {
  for (const u of ['https://' + d, 'http://' + d]) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(12000) });
      const html = (await r.text()).slice(0, 300000);
      const titulo = (html.match(/<title[^>]*>([^<]*)/i)?.[1] || '').trim().slice(0, 90);
      const t = sa(html);
      return { url: r.url, estado: r.status, titulo, fala_do_sitio: sitio.some(s => t.includes(s)) };
    } catch {}
  }
  return { estado: 'sem resposta' };
}

for (const c of lista) {
  if (res[c.id]) continue;
  const sitio = [sa(concelho), sa(c.localidade).trim(), 'douro'].filter(s => s.length > 3);
  const ds = [...new Set([c.nome, ...(c.nomes || [])].flatMap(variantes))];
  res[c.id] = [];
  for (const d of ds) {
    if (!(await registado(d))) { res[c.id].push({ d, registado: false }); continue; }
    res[c.id].push({ d, registado: true, ...(await abrir(d, sitio)) });
  }
  const reg = res[c.id].filter(x => x.registado);
  console.log(c.id, c.nome, '|', reg.length ? reg.map(x => `${x.d} ${x.estado} ${x.fala_do_sitio ? 'FALA DO SÍTIO' : ''} "${x.titulo || ''}"`).join(' ; ') : 'todos livres');
  fs.writeFileSync(saida, JSON.stringify(res, null, 1));
}
