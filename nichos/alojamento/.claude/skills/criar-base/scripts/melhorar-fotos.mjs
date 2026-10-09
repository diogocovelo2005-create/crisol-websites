#!/usr/bin/env node
/*
  Fotos finais do site, a partir do protótipo escolhido.

  Uso:
    node melhorar-fotos.mjs <pasta-da-casa> --base <letra> --primeiro <ficheiro> [--extra c] [--simular]

  --primeiro: a foto do primeiro ecrã (secção 1 do BRIEF.md, ex.:
  piscina-torre-01.jpg). Vai a ecrã inteiro, por isso conta como 1440 px.
  --extra c: numa mistura ("B com as opiniões do C"), junta as fotos que a
  base C usa.

  1. Lê prototipos/<letra>.html e descobre que fotos usa e a que largura.
  2. As fotos cujo original tem menos do dobro da largura com que aparecem
     (até 2400 px) passam pelo Real-ESRGAN, local e grátis (alguns minutos
     por foto: corre em segundo plano). Se a ampliação falhar, fica o
     original e a nota diz porquê.
  3. Grava em site/public/fotos/<nome>.jpg, até 2400 px (o next/image faz as
     variantes), e site/public/fotos/fotos-finais.json.

  O retoque da foto do primeiro ecrã é do Diogo: ele troca o ficheiro.
  Os originais do dossiê nunca são alterados.
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PY = process.platform === 'win32' ? 'python' : 'python3';
const IMAGENS = path.join(SKILL, 'scripts', 'imagens.py');
const ESRGAN_DIR = path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), '.local', 'share'), 'crisol', 'realesrgan');
const ESRGAN = path.join(ESRGAN_DIR, process.platform === 'win32' ? 'realesrgan-ncnn-vulkan.exe' : 'realesrgan-ncnn-vulkan');
const ESRGAN_ZIP = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip';
const LARGURA_PRIMEIRO_ECRA = 1440;
// Ecrãs de alta densidade pedem o dobro; a foto final tem no máximo 2400 px.
const precisaDeAmpliar = (original, noEcra) => original < Math.min(2 * noEcra, 2400);

function sair(texto) {
  console.error(texto);
  process.exit(1);
}

function argumentos() {
  const a = process.argv.slice(2);
  const o = { simular: false, extra: [] };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--base') o.base = a[++i].toLowerCase();
    else if (a[i] === '--extra') o.extra = a[++i].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    else if (a[i] === '--primeiro') o.primeiro = a[++i];
    else if (a[i] === '--simular') o.simular = true;
    else o.casa = path.resolve(a[i]);
  }
  if (!o.casa || !o.base || !o.primeiro) sair('Uso: node melhorar-fotos.mjs <pasta-da-casa> --base <letra> --primeiro <ficheiro> [--extra c] [--simular]');
  return o;
}

function python(...args) {
  const r = spawnSync(PY, [IMAGENS, ...args], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return JSON.parse(r.stdout.trim().split('\n').pop());
}

// fotos.md: "### `fotos/<nome>` (ATV-...)" para cada foto do pacote.
function mapaDoPacote(pasta) {
  const md = fs.readFileSync(path.join(pasta, 'fotos.md'), 'utf8');
  return new Map([...md.matchAll(/^### `fotos\/([^`]+)` \(([^)]+)\)/gm)].map((m) => [m[1], m[2]]));
}

async function larguraNoEcra(ficheiroHtml) {
  const pasta = path.dirname(ficheiroHtml);
  const servidor = await new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      const f = path.join(pasta, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!f.startsWith(pasta) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404).end(); return; }
      res.writeHead(200);
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`http://127.0.0.1:${servidor.address().port}/${path.basename(ficheiroHtml)}`, { waitUntil: 'networkidle' });
    return await p.evaluate(() => {
      const larguras = {};
      const registar = (url, w) => {
        const m = url && url.match(/fotos\/([A-Za-z0-9._-]+)/);
        if (m) larguras[m[1]] = Math.max(larguras[m[1]] ?? 0, Math.round(w));
      };
      for (const img of document.querySelectorAll('img')) registar(img.currentSrc || img.src, img.getBoundingClientRect().width);
      for (const el of document.querySelectorAll('*')) {
        const bg = getComputedStyle(el).backgroundImage;
        if (bg.includes('fotos/')) registar(bg, el.getBoundingClientRect().width);
      }
      return larguras;
    });
  } finally {
    await browser.close();
    servidor.close();
  }
}

function garantirEsrgan() {
  if (fs.existsSync(ESRGAN)) return;
  if (process.platform !== 'win32') sair(`Instala o realesrgan-ncnn-vulkan em ${ESRGAN_DIR}.`);
  console.log('A instalar o Real-ESRGAN (uma vez, ~45 MB)…');
  fs.mkdirSync(ESRGAN_DIR, { recursive: true });
  const zip = path.join(ESRGAN_DIR, 're.zip');
  execFileSync('curl', ['-sSL', '-o', zip, ESRGAN_ZIP]);
  execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Force '${zip}' '${ESRGAN_DIR}'`]);
  fs.rmSync(zip, { force: true });
}

function ampliarLocal(origem, destino) {
  garantirEsrgan();
  const r = spawnSync(ESRGAN, ['-i', origem, '-o', destino, '-n', 'realesrgan-x4plus', '-s', '4'], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0 || !fs.existsSync(destino)) throw new Error(`Real-ESRGAN falhou: ${r.stderr?.slice(-300)}`);
}

async function main() {
  const o = argumentos();
  const prototipos = path.join(o.casa, 'prototipos');
  const html = path.join(prototipos, `${o.base}.html`);
  if (!fs.existsSync(html)) sair(`Não existe a base ${o.base}: ${html}`);
  const contrato = JSON.parse(fs.readFileSync(path.join(o.casa, 'dossie', 'contrato.json'), 'utf8'));
  const ativos = new Map((contrato.ativos ?? []).map((a) => [a.id, a]));
  const pacote = mapaDoPacote(prototipos);
  if (!pacote.has(o.primeiro)) sair(`A foto do primeiro ecrã (${o.primeiro}) não está no pacote.`);

  const larguras = await larguraNoEcra(html);
  for (const letra of o.extra) {
    const outra = path.join(prototipos, `${letra}.html`);
    if (!fs.existsSync(outra)) sair(`Não existe a base ${letra}: ${outra}`);
    for (const [f, w] of Object.entries(await larguraNoEcra(outra))) larguras[f] = Math.max(larguras[f] ?? 0, w);
  }
  larguras[o.primeiro] = Math.max(larguras[o.primeiro] ?? 0, LARGURA_PRIMEIRO_ECRA);
  const usadas = Object.keys(larguras).filter((f) => pacote.has(f));
  const dimensoes = (f) => ativos.get(pacote.get(f))?.dimensoes ?? {};
  const ampliar = new Set(usadas.filter((f) => precisaDeAmpliar(dimensoes(f).largura ?? 0, larguras[f])));

  console.log('Fotos (largura máxima no ecrã a 1440 px; ↑ ampliação local):');
  for (const f of usadas) console.log(`  ${ampliar.has(f) ? '↑' : ' '} ${f}: ${larguras[f]} px no ecrã, original ${dimensoes(f).largura ?? '?'} px${f === o.primeiro ? ' (primeiro ecrã)' : ''}`);
  if (o.simular) {
    console.log(`${ampliar.size} com ampliação local (grátis, alguns minutos cada).`);
    return;
  }

  const destino = path.join(o.casa, 'site', 'public', 'fotos');
  const temporario = fs.mkdtempSync(path.join(os.tmpdir(), 'fotos-'));
  const finais = [];
  for (const ficheiro of usadas) {
    const id = pacote.get(ficheiro);
    const ativo = ativos.get(id);
    if (!ativo) { console.log(`Aviso: ${ficheiro} (${id}) não está no contrato; fica de fora.`); continue; }
    const original = path.join(o.casa, 'dossie', ativo.caminho);
    const nome = path.parse(ficheiro).name;
    let fonte = original;
    let metodo = 'original';
    let nota = '';
    if (ampliar.has(ficheiro)) {
      const ampliada = path.join(temporario, `${nome}-x4.png`);
      try {
        ampliarLocal(original, ampliada);
        fonte = ampliada;
        metodo = 'real-esrgan';
      } catch (causa) {
        nota = `ampliação local falhou, fica o original: ${causa.message.slice(0, 120)}`;
      }
    }
    const v = python('final', fonte, destino, nome);
    finais.push({ ficheiro, ativo: id, primeiro_ecra: ficheiro === o.primeiro, largura_no_ecra: larguras[ficheiro], metodo, nota, ...v });
    console.log(`${ampliar.has(ficheiro) ? '↑' : ' '} ${ficheiro}: ${metodo}${nota ? ` (${nota})` : ''}`);
  }
  fs.writeFileSync(path.join(destino, 'fotos-finais.json'), JSON.stringify(finais, null, 2));
  fs.rmSync(temporario, { recursive: true, force: true });
  console.log(`${finais.length} fotos em ${path.relative(process.cwd(), destino)}.`);
}

main();
