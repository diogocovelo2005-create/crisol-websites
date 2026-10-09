#!/usr/bin/env node
/*
  Serve uma pasta estática em http://localhost:<porta>/ (por defeito 3400).

  Uso:
    node servir.mjs <pasta> [porta]

  Serve para os protótipos: o index.html de comparação e os <letra>.html,
  com as fotografias em fotos/. Sem dependências.
*/

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const pasta = path.resolve(process.argv[2] ?? '.');
const porta = Number(process.argv[3] ?? 3400);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(pasta)) {
  console.error(`A pasta não existe: ${pasta}`);
  process.exit(1);
}

http
  .createServer((pedido, resposta) => {
    const caminho = decodeURIComponent(new URL(pedido.url, 'http://localhost').pathname);
    let ficheiro = path.join(pasta, caminho);
    if (!ficheiro.startsWith(pasta)) {
      resposta.writeHead(403).end();
      return;
    }
    if (fs.existsSync(ficheiro) && fs.statSync(ficheiro).isDirectory()) ficheiro = path.join(ficheiro, 'index.html');
    if (!fs.existsSync(ficheiro)) {
      resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
      return;
    }
    resposta.writeHead(200, {
      'Content-Type': TIPOS[path.extname(ficheiro).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(ficheiro).pipe(resposta);
  })
  .listen(porta, 'localhost', () => console.log(`A servir ${pasta} em http://localhost:${porta}/`));
