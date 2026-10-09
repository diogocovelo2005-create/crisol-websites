#!/usr/bin/env node
/*
  Tira as capturas de uma página de cima a baixo, um ecrã de cada vez, para
  quem a construiu a ver como o Diogo a vai ver.

  Uso:
    node capturas.mjs <ficheiro.html | http://localhost:PORTA> --saida <pasta> [--larguras 1440,390] [--max 14]

  Desce a página um ecrã de cada vez (com uma pausa, para o que depende do
  scroll acontecer) e grava <saida>/<largura>-NN.jpg, em JPEG leve. Para no
  fim da página ou ao fim de --max ecrãs por largura. Escreve na saída a
  lista dos ficheiros.

  Sempre localhost e nunca 127.0.0.1 (o Next.js não hidrata), e o build de
  produção num site Next.js.
*/

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opcao = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
const alvo = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const saida = opcao('--saida') && path.resolve(opcao('--saida'));
const larguras = (opcao('--larguras') ?? '1440,390').split(',').map(Number);
const max = Number(opcao('--max') ?? 14);
if (!alvo || !saida) {
  console.error('Uso: node capturas.mjs <ficheiro.html | http://localhost:PORTA> --saida <pasta> [--larguras 1440,390] [--max 14]');
  process.exit(1);
}
if (/127\.0\.0\.1/.test(alvo)) console.error('Aviso: usa localhost; em 127.0.0.1 o Next.js não hidrata.');
const url = /^https?:\/\//.test(alvo) ? alvo : pathToFileURL(path.resolve(alvo)).href;

async function carregarPlaywright() {
  const bases = [path.join(process.cwd(), 'package.json'), path.join(AQUI, '..', 'package.json'), path.join(AQUI, 'package.json')];
  try {
    bases.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'x.js'));
  } catch {}
  for (const b of bases) {
    try {
      const resolvido = createRequire(b).resolve('playwright');
      return await import(pathToFileURL(resolvido).href);
    } catch {}
  }
  console.error('Não encontrei o Playwright. Instala com: npm i -D playwright');
  process.exit(1);
}
const pw = await carregarPlaywright();
const { chromium } = pw.default ?? pw;

fs.mkdirSync(saida, { recursive: true });
const browser = await chromium.launch();
const feitos = [];
for (const largura of larguras) {
  const telemovel = largura < 768;
  const altura = telemovel ? 844 : 900;
  const pagina = await browser.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1, hasTouch: telemovel, isMobile: telemovel });
  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(800);
  for (let n = 0; n < max; n++) {
    const y = n * altura;
    await pagina.evaluate((y) => window.scrollTo(0, y), y);
    await pagina.waitForTimeout(700);
    const ficheiro = path.join(saida, `${largura}-${String(n + 1).padStart(2, '0')}.jpg`);
    await pagina.screenshot({ path: ficheiro, type: 'jpeg', quality: 60 });
    feitos.push(path.relative(process.cwd(), ficheiro));
    const fim = await pagina.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2);
    if (fim) break;
  }
  await pagina.close();
}
await browser.close();
console.log(feitos.join('\n'));
