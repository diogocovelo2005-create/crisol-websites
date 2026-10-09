#!/usr/bin/env node
/**
 * check-redirects.js — cada URL antigo tem de ter destino vivo.
 *
 *   node scripts/check-redirects.js --inventario ./legado/inventario.json --base https://preview-url
 *
 * Falha em: 404, cadeias de redirects, 302 em vez de 301, e tudo o que
 * aterra na homepage (o Google trata isso como página inexistente).
 */
import fs from 'node:fs';
import process from 'node:process';

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i++)
    if (process.argv[i].startsWith('--')) {
      const k = process.argv[i].slice(2);
      a[k] = process.argv[i + 1]?.startsWith('--') || i + 1 >= process.argv.length ? true : process.argv[++i];
    }
  return a;
}
const A = args();
if (!A.inventario || !A.base) { console.error('Faltam --inventario e --base'); process.exit(1); }

const inv = JSON.parse(fs.readFileSync(A.inventario, 'utf8'));
const base = new URL(A.base.replace(/\/$/, ''));

async function seguir(url, max = 5) {
  const saltos = [];
  let atual = url;
  for (let i = 0; i < max; i++) {
    const r = await fetch(atual, { redirect: 'manual' });
    saltos.push({ url: atual, estado: r.status });
    const loc = r.headers.get('location');
    if (!loc) return { saltos, final: atual, estado: r.status };
    atual = new URL(loc, atual).href;
  }
  return { saltos, final: atual, estado: 'cadeia_longa' };
}

const problemas = [];
let ok = 0;

for (const p of inv.paginas) {
  // saltar as que já estavam partidas no site antigo, e as que o crawl
  // não conseguiu ler (estado null) — gerariam falsos críticos
  if (p.estado === null || p.estado === undefined || p.estado >= 400) continue;
  const caminho = new URL(p.url).pathname + new URL(p.url).search;
  const alvo = new URL(caminho, base).href;

  try {
    const r = await seguir(alvo);
    const redirs = r.saltos.filter((s) => s.estado >= 300 && s.estado < 400);
    const ehRaiz = new URL(r.final).pathname === '/' && caminho !== '/';

    if (r.estado >= 400 || r.estado === 'cadeia_longa') {
      problemas.push({ nivel: 'CRÍTICO', origem: caminho, motivo: `destino ${r.estado}`, final: r.final });
    } else if (ehRaiz) {
      problemas.push({ nivel: 'CRÍTICO', origem: caminho, motivo: 'aterra na homepage — tratado como 404', final: r.final });
    } else if (redirs.length > 1) {
      problemas.push({ nivel: 'AVISO', origem: caminho, motivo: `cadeia de ${redirs.length} saltos`, final: r.final });
    } else if (redirs.some((s) => s.estado === 302 || s.estado === 307)) {
      problemas.push({ nivel: 'AVISO', origem: caminho, motivo: 'redirect temporário — usa 301', final: r.final });
    } else {
      ok++;
    }
  } catch (e) {
    problemas.push({ nivel: 'CRÍTICO', origem: caminho, motivo: String(e.message).slice(0, 80), final: null });
  }
  process.stdout.write(`\r  ${ok + problemas.length}/${inv.paginas.length}   `);
}

console.log(`\n\n✓ ${ok} URLs resolvem bem`);

const crit = problemas.filter((p) => p.nivel === 'CRÍTICO');
const avisos = problemas.filter((p) => p.nivel === 'AVISO');

if (crit.length) {
  console.log(`\n✗ ${crit.length} CRÍTICOS — não lances assim:\n`);
  crit.forEach((p) => console.log(`   ${p.origem}\n     ${p.motivo}${p.final ? ` → ${p.final}` : ''}`));
}
if (avisos.length) {
  console.log(`\n⚠ ${avisos.length} avisos:\n`);
  avisos.forEach((p) => console.log(`   ${p.origem} — ${p.motivo}`));
}

fs.writeFileSync('redirects-report.json', JSON.stringify({ ok, problemas }, null, 2));
console.log('\n→ redirects-report.json');
process.exit(crit.length ? 1 : 0);
