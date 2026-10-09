#!/usr/bin/env node
/*
  Capturas das variantes, sempre nos mesmos pontos do scroll.

  Serve duas coisas:
  1. Gerar as referencias aprovadas do molde, a partir do /catalogo:
       node tools/capturas.mjs http://localhost:3200/catalogo catalogo/capturas
  2. Verificar o site de um cliente depois dos ajustes, para comparar com
     as referencias (mesmos pontos, mesmo tamanho):
       node tools/capturas.mjs http://localhost:3000 .shots/verificar P4,E2,F3

  Encontra cada secao pelo atributo data-variante (componente <Variante>),
  tira capturas a 1440x900 e a 390x844 e junta-as numa folha por variante
  (<codigo>.jpg): a linha de cima e o computador, a de baixo o telemovel.
  Uma folha por variante poupa leitura: o agente compara uma imagem so.

  No fim diz os erros da consola e se ha scroll horizontal.
*/

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [url, saida = '.shots/capturas', filtro] = process.argv.slice(2);
if (!url) {
  console.error('Uso: node tools/capturas.mjs <url> [pasta-de-saida] [P1,E2,...]');
  process.exit(1);
}
const so = filtro ? filtro.split(',').map((c) => c.trim()) : null;

// Pontos do scroll de cada variante, em fracao da secao (0 = a entrar, 1 = no fim).
// Escolhidos para apanhar os estados que importam: o inicio, as trocas e o fim.
const PONTOS = {
  P1: [0.02, 0.3, 0.6, 0.95],
  P2: [0.02, 0.3, 0.6, 0.95],
  P4: [0.1, 0.5, 0.95],
  P5: [0.02, 0.18, 0.3, 0.49, 0.95],
  E1: [0.1, 0.5, 0.95],
  E2: [0.1, 0.5, 0.95],
  E3: [0.1, 0.45, 0.85],
  E4: [0, 0.4, 0.9],
  E5: [0.1, 0.5, 0.95],
  F1: [0, 0.5, 0.95],
  F2: [0, 0.45, 0.95],
  F3: [0, 0.6, 0.95],
  F4: [0, 0.6],
};
const ECRAS = [
  { nome: 'computador', width: 1440, height: 900 },
  { nome: 'telemovel', width: 390, height: 844 },
];

fs.mkdirSync(saida, { recursive: true });
const tmp = fs.mkdtempSync(path.join(saida, '.tmp-'));
const browser = await chromium.launch();
const erros = new Set();
const fotos = {}; // codigo -> { computador: [ficheiros], telemovel: [ficheiros] }
let horizontal = false;

for (const ecra of ECRAS) {
  const pagina = await browser.newPage({ viewport: { width: ecra.width, height: ecra.height } });
  pagina.on('pageerror', (e) => erros.add(e.message.slice(0, 200)));
  pagina.on('console', (m) => m.type() === 'error' && erros.add(m.text().slice(0, 200)));
  await pagina.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await pagina.waitForTimeout(1500);

  const codigos = await pagina.$$eval('[data-variante]', (els) => els.map((e) => e.getAttribute('data-variante')));
  for (const codigo of codigos) {
    if (so && !so.includes(codigo)) continue;
    const caixa = await pagina.$eval(`[data-variante="${codigo}"]`, (el) => {
      const r = el.getBoundingClientRect();
      return { topo: r.top + window.scrollY, altura: r.height };
    });
    const pontos = PONTOS[codigo] ?? [0.1, 0.5, 0.9];
    for (const [i, f] of pontos.entries()) {
      const y = Math.round(caixa.topo + Math.max(0, caixa.altura - ecra.height) * f);
      await pagina.evaluate((y) => window.scrollTo(0, y), y);
      await pagina.waitForTimeout(1300);
      const ficheiro = path.join(tmp, `${codigo}-${ecra.width}-${i}.jpg`);
      await pagina.screenshot({ path: ficheiro, type: 'jpeg', quality: 60 });
      ((fotos[codigo] ??= {})[ecra.nome] ??= []).push(ficheiro);
    }
  }
  horizontal ||= await pagina.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  await pagina.close();
}

// uma folha por variante: computador em cima, telemovel em baixo
const folha = await browser.newPage({ viewport: { width: 1800, height: 400 } });
const src = (f) => 'file:///' + path.resolve(f).split(path.sep).join('/');
for (const [codigo, porEcra] of Object.entries(fotos)) {
  const html = `<body style="margin:0;background:#111;font:600 16px sans-serif;color:#fff">
    <p style="margin:6px 10px">${codigo} · computador 1440x900</p>
    <div style="display:flex;gap:4px">${(porEcra.computador ?? []).map((f) => `<img src="${src(f)}" style="width:${100 / Math.max(3, (porEcra.computador ?? []).length)}%">`).join('')}</div>
    <p style="margin:6px 10px">${codigo} · telemovel 390x844</p>
    <div style="display:flex;gap:4px">${(porEcra.telemovel ?? []).map((f) => `<img src="${src(f)}" style="width:12%">`).join('')}</div>
  </body>`;
  const ficheiroHtml = path.join(tmp, `${codigo}.html`);
  fs.writeFileSync(ficheiroHtml, html);
  await folha.goto(src(ficheiroHtml));
  await folha.waitForTimeout(300);
  await folha.screenshot({ path: path.join(saida, `${codigo}.jpg`), fullPage: true, type: 'jpeg', quality: 70 });
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`Folhas em ${saida}: ${Object.keys(fotos).join(', ') || 'nenhuma variante encontrada'}`);
console.log(`Scroll horizontal: ${horizontal ? 'SIM (corrigir)' : 'nao'}`);
console.log(erros.size ? `Erros na consola:\n- ${[...erros].join('\n- ')}` : 'Erros na consola: nenhum');
