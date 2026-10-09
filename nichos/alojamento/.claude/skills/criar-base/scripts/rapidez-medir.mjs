#!/usr/bin/env node
/*
  Lighthouse a sério: várias corridas, a mediana, e o tempo OBSERVADO ao
  lado do SIMULADO. Uma corrida só não diz nada (na Costeira, o mesmo
  código deu de 48 a 80 só com a carga da máquina).

  Uso:
    node rapidez-medir.mjs <url> [--corridas 5] [--saida <pasta>] [--rotulo antes]
                                 [--so telemovel|computador]

  Para cada perfil (telemóvel e computador) corre o Lighthouse N vezes, só
  a categoria de desempenho, e escreve:
    - a mediana da nota, do LCP, FCP, TBT, CLS e Speed Index (simulados);
    - a mediana do FCP e LCP observados (o que aconteceu de facto no trace);
    - qual é o elemento do LCP e as partes do tempo dele;
    - as auditorias que falham e os 12 pedidos mais pesados.
  Com --saida grava os JSON de cada corrida e <rotulo>.json com o resumo.

  LCP simulado muito acima do observado = o simulador está a juntar ao LCP
  tudo o que começou antes (a foto do hero numa 4G lenta, o JavaScript).
  LCP observado muito acima do FCP = o elemento do LCP está à espera de
  alguma coisa (opacidade 0 até à hidratação, uma fonte, uma imagem).

  Usa o Chromium do Playwright e o Lighthouse do npx (fica em cache depois
  da primeira vez). Fecha as outras janelas pesadas antes de medir.
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opcao = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const url = args.find((a) => /^https?:\/\//.test(a));
const corridas = Number(opcao('--corridas') ?? 5);
const saida = opcao('--saida') && path.resolve(opcao('--saida'));
const rotulo = opcao('--rotulo') ?? 'medida';
const so = opcao('--so');
if (!url) {
  console.error('Uso: node rapidez-medir.mjs <url> [--corridas 5] [--saida <pasta>] [--rotulo antes] [--so telemovel|computador]');
  process.exit(1);
}
if (/127\.0\.0\.1/.test(url)) console.error('Aviso: usa localhost; em 127.0.0.1 o Next.js não hidrata.');

async function chromePath() {
  const bases = [path.join(process.cwd(), 'package.json'), path.join(AQUI, '..', 'package.json')];
  try {
    bases.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'x.js'));
  } catch {}
  for (const b of bases) {
    try {
      const pw = await import(pathToFileURL(createRequire(b).resolve('playwright')).href);
      const p = (pw.default ?? pw).chromium.executablePath();
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  console.error('Não encontrei o Chromium do Playwright. No site: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const mediana = (v) => {
  const s = v.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const CHROME = await chromePath();
const tmp = saida ?? fs.mkdtempSync(path.join(os.tmpdir(), 'rapidez-'));
fs.mkdirSync(tmp, { recursive: true });
const perfis = [
  ['telemovel', []],
  ['computador', ['--preset=desktop']],
].filter(([n]) => !so || so === n);

const resumo = { url, corridas, quando: new Date().toISOString(), perfis: {} };

for (const [nome, extra] of perfis) {
  const rel = [];
  for (let i = 1; i <= corridas; i++) {
    const f = path.join(tmp, `${rotulo}-${nome}-${i}.json`);
    try {
      execFileSync(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['--yes', 'lighthouse@13', url, '--only-categories=performance', '--output=json', `--output-path=${f}`, '--chrome-flags=--headless=new', '--quiet', ...extra],
        { stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, CHROME_PATH: CHROME }, shell: process.platform === 'win32' },
      );
      rel.push(JSON.parse(fs.readFileSync(f, 'utf8')));
    } catch (e) {
      console.error(`corrida ${nome} ${i} falhou: ${String(e.stderr ?? e.message).slice(0, 200)}`);
    }
  }
  if (!rel.length) continue;
  const num = (k) => rel.map((r) => r.audits[k]?.numericValue);
  const obs = (k) => rel.map((r) => r.audits.metrics?.details?.items?.[0]?.[k]);
  // a corrida mais perto da mediana da nota serve para os pormenores
  const notas = rel.map((r) => Math.round(r.categories.performance.score * 100));
  const mn = mediana(notas);
  const tipo = rel[notas.findIndex((n) => Math.abs(n - mn) === Math.min(...notas.map((x) => Math.abs(x - mn))))];
  const a = tipo.audits;
  const lcp = a['lcp-breakdown-insight']?.details?.items;
  const p = {
    notas,
    nota: mn,
    simulado: {
      LCP: mediana(num('largest-contentful-paint')),
      FCP: mediana(num('first-contentful-paint')),
      TBT: mediana(num('total-blocking-time')),
      CLS: mediana(num('cumulative-layout-shift')),
      SI: mediana(num('speed-index')),
    },
    observado: { FCP: mediana(obs('observedFirstContentfulPaint')), LCP: mediana(obs('observedLargestContentfulPaint')) },
    elementoLCP: lcp?.[1]?.nodeLabel ?? lcp?.[1]?.snippet ?? null,
    partesLCP: lcp?.[0]?.items?.map((x) => `${x.label}: ${Math.round(x.duration)} ms`) ?? [],
    falhas: Object.entries(a)
      .filter(([, v]) => v.score !== null && v.score < 0.9 && !['informative', 'notApplicable', 'manual'].includes(v.scoreDisplayMode))
      .map(([k, v]) => `${k}${v.displayValue ? ` (${v.displayValue})` : ''}`),
    pesados: (a['network-requests']?.details?.items ?? [])
      .sort((x, y) => y.transferSize - x.transferSize)
      .slice(0, 12)
      .map((i) => `${Math.round(i.transferSize / 1024)} KB  ${i.resourceType}  ${i.priority}  ${i.url.replace(/^https?:\/\/[^/]+/, '').slice(0, 110)}`),
  };
  resumo.perfis[nome] = p;

  const ms = (v) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
  console.log(`\n== ${nome}  nota ${p.nota} (corridas: ${notas.join(', ')})`);
  console.log(`   simulado  LCP ${ms(p.simulado.LCP)}  FCP ${ms(p.simulado.FCP)}  TBT ${ms(p.simulado.TBT)}  SI ${ms(p.simulado.SI)}  CLS ${p.simulado.CLS?.toFixed(3)}`);
  console.log(`   observado FCP ${ms(p.observado.FCP)}  LCP ${ms(p.observado.LCP)}`);
  console.log(`   elemento do LCP: ${String(p.elementoLCP).slice(0, 80)}  [${p.partesLCP.join(' · ')}]`);
  console.log(`   falham: ${p.falhas.join('; ') || 'nada'}`);
  console.log('   mais pesados:');
  for (const l of p.pesados) console.log(`     ${l}`);
}

if (saida) {
  fs.writeFileSync(path.join(saida, `${rotulo}.json`), JSON.stringify(resumo, null, 2));
  console.log(`\nResumo em ${path.join(saida, `${rotulo}.json`)}`);
}
