// Prova de que um site é recente, para a regra estrita de "site moderno" (decisão do Diogo, 21/10/2026).
//   node ferramentas/prova-moderno.mjs data/sites-a-provar.json      (lista [{ "id", "url" }])
// Escreve data/prova-<nome da entrada>.json com, por lead, { recente: true|false|null, prova, sinais }.
// Só conta o que um site antigo não pode ter:
//   1. o design de hoje não existia há 3 anos: no Wayback de há 3 anos o domínio não existia, ou tinha
//      outra plataforma, outro tema ou outro construtor de páginas;
//   2. plataforma recente: Framer, Wix Studio, Squarespace 7.1.
// https, telemóvel, WordPress, cookies, © do ano e afins não contam: também existem em sites antigos.
import fs from 'node:fs';
import path from 'node:path';

const entrada = process.argv[2];
if (!entrada) { console.error('uso: node ferramentas/prova-moderno.mjs <lista.json>'); process.exit(1); }
const lista = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const saida = path.join(path.dirname(entrada), 'prova-' + path.basename(entrada).replace(/^sites-a-provar-?/, ''));
const res = fs.existsSync(saida) ? JSON.parse(fs.readFileSync(saida, 'utf8')) : {};
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

async function texto(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    return r.ok ? (await r.text()).slice(0, 400000) : null;
  } catch { return null; }
}
// impressão digital do design: plataforma, tema, construtor de páginas
function digital(html) {
  if (!html) return null;
  const h = html.toLowerCase();
  const plataforma = h.includes('framerusercontent.com') ? 'Framer'
    : h.includes('static.wixstatic') || h.includes('parastorage.com') ? (/"siteRevision"[\s\S]{0,4000}"editorType"\s*:\s*"(studio|wix_studio)"/.test(html) ? 'Wix Studio' : 'Wix')
    : h.includes('squarespace') ? (/squarespace[^"]*7\.1|"templateVersion"\s*:\s*"7\.1"/.test(h) ? 'Squarespace 7.1' : 'Squarespace')
    : h.includes('webflow') ? 'Webflow'
    : h.includes('wp-content') ? 'WordPress'
    : h.includes('joomla') ? 'Joomla'
    : h.includes('mobirise') ? 'Mobirise'
    : h.includes('webnode') ? 'Webnode'
    : 'outra';
  const tema = (h.match(/wp-content\/themes\/([a-z0-9_-]+)/) || [])[1] || null;
  // só classes e pastas inconfundíveis (palavras soltas como "divi" aparecem dentro de outras)
  const construtor = [['elementor', /class="[^"]*\belementor-/], ['divi', /\bet_pb_/], ['wpbakery', /\bvc_row\b/], ['beaver', /\bfl-builder\b/],
    ['oxygen', /\bct-section\b/], ['bricks', /\bbrxe-/], ['blocos wordpress', /\bwp-block-/]].find(([, re]) => re.test(h))?.[0] || null;
  return { plataforma, tema, construtor };
}

const tresAnos = new Date(); tresAnos.setFullYear(tresAnos.getFullYear() - 3);
const ts = tresAnos.toISOString().slice(0, 10).replace(/-/g, '');
for (const { id, url } of lista) {
  if (res[id]) continue;
  const dominio = new URL(url).hostname.replace(/^www\./, '');
  const hoje = digital(await texto(url));
  const sinais = [];
  let recente = null, prova = null;
  if (!hoje) { sinais.push('não abriu hoje'); }
  else {
    sinais.push(`hoje: ${hoje.plataforma}${hoje.tema ? ' · tema ' + hoje.tema : ''}${hoje.construtor ? ' · ' + hoje.construtor : ''}`);
    if (['Framer', 'Wix Studio', 'Squarespace 7.1'].includes(hoje.plataforma)) { recente = true; prova = `plataforma recente (${hoje.plataforma})`; }
    // captura do Wayback mais próxima de há 3 anos
    const cdx = await texto(`https://web.archive.org/cdx/search/cdx?url=${dominio}&output=json&fl=timestamp&filter=statuscode:200&limit=1&from=${ts.slice(0, 6)}&to=${ts.slice(0, 4)}1231`);
    let antes = null;
    try { antes = JSON.parse(cdx || '[]')[1]?.[0] || null; } catch {}
    const primeira = (() => { try { return null; } catch { return null; } })();
    if (!antes) {
      const prim = await texto(`https://web.archive.org/cdx/search/cdx?url=${dominio}&output=json&fl=timestamp&filter=statuscode:200&limit=1`);
      let p0 = null; try { p0 = JSON.parse(prim || '[]')[1]?.[0] || null; } catch {}
      if (p0 && p0 > ts) { recente = recente ?? true; prova = prova || `o domínio só aparece no Wayback em ${p0.slice(0, 4)}-${p0.slice(4, 6)} (menos de 3 anos)`; }
      else sinais.push(p0 ? `Wayback desde ${p0.slice(0, 4)}, sem captura de há 3 anos` : 'sem Wayback');
    } else {
      const velho = digital(await texto(`https://web.archive.org/web/${antes}id_/${url}`));
      if (!velho) sinais.push(`captura de ${antes.slice(0, 4)} não abriu`);
      else {
        sinais.push(`${antes.slice(0, 4)}-${antes.slice(4, 6)}: ${velho.plataforma}${velho.tema ? ' · tema ' + velho.tema : ''}${velho.construtor ? ' · ' + velho.construtor : ''}`);
        const mudou = velho.plataforma !== hoje.plataforma || (hoje.tema && velho.tema !== hoje.tema) || velho.construtor !== hoje.construtor;
        if (mudou) { recente = recente ?? true; prova = prova || `design refeito: em ${antes.slice(0, 4)}-${antes.slice(4, 6)} era ${velho.plataforma}${velho.tema ? '/' + velho.tema : ''}, hoje ${hoje.plataforma}${hoje.tema ? '/' + hoje.tema : ''}`; }
        else { recente = recente ?? false; sinais.push('o mesmo design há 3 anos ou mais'); }
      }
    }
  }
  res[id] = { url, recente, prova, sinais };
  fs.writeFileSync(saida, JSON.stringify(res, null, 1));
  console.log(id, '|', dominio, '|', recente === true ? 'RECENTE: ' + prova : recente === false ? 'não é recente' : 'sem prova', '|', sinais.join(' · '));
  await new Promise(r => setTimeout(r, 1500)); // o Wayback corta quem pede depressa
}
console.log('->', saida);
