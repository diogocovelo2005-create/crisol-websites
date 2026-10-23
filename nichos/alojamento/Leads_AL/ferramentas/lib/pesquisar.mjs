// Pesquisa web partilhada pelas ferramentas (pesquisa.mjs, paradas.mjs, contactos.mjs).
// 1. Serper.dev (Google por API) se houver SERPER_API_KEY no .env da pasta Leads_AL: sem bloqueios, 2.500 grátis.
// 2. Sem chave: Brave pelo curl (o Brave responde 429 ao fetch do Node, não ao curl; limita a ~4 por minuto).
// Devolve { motor, urls: [...], resultados: [{ url, titulo, texto }] } ou null se falhou.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// .env: linhas CHAVE=valor (nunca vai para o Git)
const env = {};
try { for (const l of fs.readFileSync(path.join(RAIZ, '.env'), 'utf8').split(/\r?\n/)) { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/); if (m) env[m[1]] = m[2]; } } catch {}
const SERPER = process.env.SERPER_API_KEY || env.SERPER_API_KEY;
// plataformas, agregadores, diretórios e afins: não são o site próprio de uma casa
export const IGNORAR = /booking\.|airbnb|tripadvisor|facebook|instagram|visitportugal|expedia|kayak|hotels?\.com|momondo|trivago|agoda|lifecooler|travelocity|hotel\.de|quierohotel|youtube|wikipedia|vrbo|hostelworld|olx|idealista|custojusto|imovirtual|gites\.fr|chambres-hotes|preiswert|skyscanner|logitravel|infopedia|einforma|racius|linkedin|pinterest|tiktok|zenhotels|hotelscombined|trip\.com|priceline|holidu|hometogo|ebookers|hoteis\.com|bluepillow|stayo|mapcarta|reserving|booked\.|planetofhotels|mapquest|-hotels?\.|holidify|wanderlog|getyourguide|viator|cm-[a-z-]+\.pt|turismodocentro|portoenorte|guestreservations|cozycozy|only-apartments|travelmyth|clubrural|iberimo|trovit|supercasa|yelp|waze|cylex|infoempresas|pai\.pt|nif\.pt|codigopostal|google\./i;
export const motor = SERPER ? 'Google (Serper)' : 'Brave';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const pausa = ms => new Promise(r => setTimeout(r, ms));
let ultima = 0;

async function serper(q) {
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch('https://google.serper.dev/search', { method: 'POST', headers: { 'X-API-KEY': SERPER, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, gl: 'pt', hl: 'pt-pt', num: 10 }), signal: AbortSignal.timeout(20000) });
      if (r.status === 429) { await pausa(5000 * (t + 1)); continue; }
      // o plano grátis recusa alguns padrões ("atendinha.guesthouse" parece um domínio): tenta com a pesquisa limpa
      if (r.status === 400 && /[."]/.test(q)) { q = q.replace(/\./g, ' ').replace(/_/g, ' ').replace(/\s+/g, ' '); continue; }
      if (!r.ok) return null;
      const j = await r.json();
      const resultados = (j.organic || []).map(o => ({ url: o.link, titulo: o.title || '', texto: o.snippet || '' }));
      // o painel do Google (knowledge graph) às vezes traz o telefone e o site
      if (j.knowledgeGraph) resultados.unshift({ url: j.knowledgeGraph.website || '', titulo: j.knowledgeGraph.title || '', texto: Object.values(j.knowledgeGraph.attributes || {}).join(' · ') });
      return resultados;
    } catch { await pausa(3000); }
  }
  return null;
}

async function brave(q) {
  // ~4 pesquisas por minuto, senão o Brave corta
  const espera = 15000 - (Date.now() - ultima); if (espera > 0) await pausa(espera);
  for (let t = 0; t < 4; t++) {
    ultima = Date.now();
    try {
      const out = execFileSync('curl', ['-sL', '-A', UA, '-H', 'Accept-Language: pt-PT', '-w', '\n%{http_code}', '--max-time', '20',
        'https://search.brave.com/search?q=' + encodeURIComponent(q)], { encoding: 'utf8', maxBuffer: 20e6 });
      const i = out.lastIndexOf('\n'), estado = out.slice(i + 1).trim(), html = out.slice(0, i);
      if (estado === '429') { await pausa(30000 * (t + 1)); continue; }
      if (estado !== '200') return null;
      // cada resultado começa em data-type="web": o 1.º link é o resultado, o title="…" o título, a div "content" o resumo
      return html.split('data-type="web"').slice(1).map(seg => {
        seg = seg.slice(0, 6000);
        const url = (seg.match(/href="(https?:\/\/[^"]+)"/) || [])[1];
        const titulo = (seg.match(/search-snippet-title[^>]*title="([^"]*)"/) || [])[1] || '';
        const texto = ((seg.match(/class="content[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return url && { url: url.replace(/&amp;/g, '&'), titulo, texto };
      }).filter(Boolean).slice(0, 10);
    } catch { await pausa(5000); }
  }
  return null;
}

export async function pesquisar(q) {
  const resultados = SERPER ? await serper(q) : await brave(q);
  return resultados && { motor, urls: resultados.map(r => r.url).filter(Boolean), resultados };
}

// Telefones portugueses num texto: fixos (2…) e telemóveis (9…), com ou sem +351
export function telefonesEm(texto) {
  const out = new Set();
  for (const m of String(texto).matchAll(/(?:\+|00)?(?:351)?[\s.-]?([29]\d{2})[\s.-]?(\d{3})[\s.-]?(\d{3})(?!\d)/g)) out.add(`${m[1]} ${m[2]} ${m[3]}`);
  return [...out];
}
