// Pesquisa web de cada casa (passo 5, "pesquisa"): Booking, Airbnb, redes e domínios próprios nos 10 primeiros resultados.
// Os domínios próprios ainda têm de ser abertos para confirmar que são desta casa.
//   node ferramentas/pesquisa.mjs <lista.json> "<Concelho>" <saida.json>
// Lista: [{ "id", "nome", "localidade" }]. Retoma se parar; as que falharam repetem-se na volta seguinte.
// Motor: Serper (Google) se houver SERPER_API_KEY no .env; senão o Brave (lento: ~4 por minuto). Ver lib/pesquisar.mjs.
import fs from 'node:fs';
import { pesquisar, motor, IGNORAR } from './lib/pesquisar.mjs';

const [, , entrada, concelho, saida] = process.argv;
if (!saida) { console.error('uso: node ferramentas/pesquisa.mjs <lista.json> "<Concelho>" <saida.json>'); process.exit(1); }
const lista = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const feito = fs.existsSync(saida) ? JSON.parse(fs.readFileSync(saida, 'utf8')) : {};
console.log('motor:', motor);

const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const limpa = s => s.replace(/["“”]/g, '').replace(/\s+/g, ' ').trim();
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
for (const c of lista) {
  if (feito[c.id]?.urls) continue;
  const local = sa(c.localidade) === sa(concelho) || !c.localidade ? concelho : `${c.localidade} ${concelho}`;
  const q = `${limpa(c.nome)} ${local}`;
  const r = await pesquisar(q);
  const urls = r?.urls;
  feito[c.id] = urls ? {
    q, motor: r.motor, urls,
    booking: urls.find(u => /booking\.com\/hotel\/pt\//.test(u))?.split('?')[0] || null,
    airbnb: urls.find(u => /airbnb\.[a-z.]+\/rooms\//.test(u))?.split('?')[0] || null,
    facebook: urls.find(u => /facebook\.com\//.test(u)) || null,
    instagram: urls.find(u => /instagram\.com\//.test(u)) || null,
    proprios: [...new Set(urls.filter(u => !IGNORAR.test(u)).map(host))],
  } : { q, erro: 'pesquisa falhou' };
  fs.writeFileSync(saida, JSON.stringify(feito, null, 1));
  console.log(c.id, c.nome, '|', urls ? `${urls.length} res · próprios: ${feito[c.id].proprios.slice(0, 4).join(', ')}` : 'FALHOU');
}
