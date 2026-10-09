#!/usr/bin/env node
// Mede o contraste entre duas cores (WCAG 2.1).
//
// Uso:
//   node contraste.mjs "#22261f" "#f5f0e7"
//   node contraste.mjs "texto=#22261f/fundo=#f5f0e7" "claro=#f7f2e9/escuro=#2e3a2b"
//
// Na segunda forma, cada argumento e um par "nome=cor/nome=cor". Sai com
// codigo 1 se algum par ficar abaixo de 4.5, para se poder usar em scripts.

const MINIMO = 4.5;

function luminancia(hex) {
  const limpo = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) throw new Error(`cor invalida: ${hex} (usa #rrggbb)`);
  const canais = [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canais.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function razao(a, b) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Uso: node contraste.mjs "#texto" "#fundo"  ou  node contraste.mjs "nome=#cor/nome=#cor" ...');
  process.exit(2);
}

const pares = [];
if (args.length === 2 && args.every((a) => a.trim().startsWith('#'))) {
  pares.push({ a: ['cor 1', args[0]], b: ['cor 2', args[1]] });
} else {
  for (const arg of args) {
    const [x, y] = arg.split('/');
    if (!x || !y) throw new Error(`par invalido: ${arg} (usa nome=#cor/nome=#cor)`);
    pares.push({ a: x.split('='), b: y.split('=') });
  }
}

let falhou = false;
for (const { a, b } of pares) {
  const r = razao(a[1], b[1]);
  const ok = r >= MINIMO;
  if (!ok) falhou = true;
  console.log(`${ok ? 'passa ' : 'FALHA '} ${r.toFixed(2).padStart(5)}  ${a[0]} ${a[1]} sobre ${b[0]} ${b[1]}`);
}
process.exit(falhou ? 1 : 0);
