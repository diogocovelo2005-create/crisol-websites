#!/usr/bin/env node
/**
 * crawl-old-site.js — salvaguarda um site existente antes de o substituir.
 *
 *   node scripts/crawl-old-site.js --url https://dominio.pt --out ./legado [--max 300]
 *
 * Produz:
 *   legado/inventario.json   todos os URLs, com título, estado e ligações
 *   legado/content/*.md      conteúdo de cada página em Markdown
 *   legado/assets.json       imagens e PDFs referenciados
 *
 * O conteúdo é para PORTAR, não para reescrever. Em profissões reguladas o
 * texto existente já passou pelo crivo do cliente.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

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
if (!A.url) { console.error('Falta --url'); process.exit(1); }

const OUT = A.out || './legado';
const MAX = Number(A.max ?? 300);
const raiz = new URL(A.url);
fs.mkdirSync(`${OUT}/content`, { recursive: true });

const norm = (u) => {
  try {
    const x = new URL(u, raiz);
    if (x.origin !== raiz.origin) return null;
    x.hash = '';
    // remove parâmetros de tracking, preserva os funcionais
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid']
      .forEach((p) => x.searchParams.delete(p));
    // /index.html, /index.php e / são a mesma página: colapsa-as para não
    // duplicarem no inventário e gerarem redirects repetidos
    x.pathname = x.pathname.replace(/\/(index|default)\.(html?|php|aspx?)$/i, '/');
    return x.href.replace(/\/$/, '') || x.origin;
  } catch { return null; }
};

const slug = (u) => {
  const p = new URL(u).pathname.replace(/^\/|\/$/g, '') || 'index';
  return p.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
};

/** Conversão mínima de HTML para Markdown. Preserva estrutura, não estilo. */
function paraMarkdown(blocos) {
  return blocos.map((b) => {
    if (b.tag === 'h1') return `# ${b.texto}`;
    if (b.tag === 'h2') return `## ${b.texto}`;
    if (b.tag === 'h3') return `### ${b.texto}`;
    if (b.tag === 'h4') return `#### ${b.texto}`;
    if (b.tag === 'li') return `- ${b.texto}`;
    return b.texto;
  }).filter(Boolean).join('\n\n');
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (compatible; site-delivery-migration/1.0)',
  ignoreHTTPSErrors: true,
});

const fila = [norm(A.url)];
const vistos = new Set(fila);
const inventario = [];
const assets = new Set();

while (fila.length && inventario.length < MAX) {
  const url = fila.shift();
  const page = await ctx.newPage();
  const registo = { url, estado: null, titulo: null, h1: null, erro: null };

  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    registo.estado = r?.status() ?? null;

    const d = await page.evaluate(() => {
      const lixo = 'nav,header,footer,script,style,noscript,aside,[role=navigation]';
      const doc = document.cloneNode(true);
      doc.querySelectorAll(lixo).forEach((n) => n.remove());
      const blocos = [];
      doc.querySelectorAll('h1,h2,h3,h4,p,li,blockquote').forEach((n) => {
        const texto = n.innerText?.trim();
        if (texto && texto.length > 1) blocos.push({ tag: n.tagName.toLowerCase(), texto });
      });
      return {
        titulo: document.title,
        h1: document.querySelector('h1')?.innerText?.trim() ?? null,
        descricao: document.querySelector('meta[name="description"]')?.content ?? null,
        blocos,
        links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
        imgs: [...document.images].map((i) => i.src),
        docs: [...document.querySelectorAll('a[href$=".pdf"],a[href$=".doc"],a[href$=".docx"]')]
                .map((a) => a.href),
      };
    });

    registo.titulo = d.titulo;
    registo.h1 = d.h1;
    registo.descricao = d.descricao;

    const md = [
      '---',
      `url: ${url}`,
      `titulo: ${JSON.stringify(d.titulo ?? '')}`,
      `descricao: ${JSON.stringify(d.descricao ?? '')}`,
      '---',
      '',
      paraMarkdown(d.blocos),
    ].join('\n');
    fs.writeFileSync(`${OUT}/content/${slug(url)}.md`, md);

    d.imgs.forEach((i) => assets.add(i));
    d.docs.forEach((i) => assets.add(i));

    for (const href of d.links) {
      const n = norm(href);
      if (n && !vistos.has(n)) { vistos.add(n); fila.push(n); }
    }
  } catch (e) {
    registo.erro = String(e.message ?? e).slice(0, 200);
  } finally {
    await page.close().catch(() => {});
  }

  inventario.push(registo);
  process.stdout.write(`\r  ${inventario.length} páginas · ${fila.length} na fila   `);
}

await browser.close();

fs.writeFileSync(`${OUT}/inventario.json`, JSON.stringify({
  origem: A.url,
  data: new Date().toISOString(),
  total: inventario.length,
  truncado: fila.length > 0,
  paginas: inventario,
}, null, 2));
fs.writeFileSync(`${OUT}/assets.json`, JSON.stringify([...assets], null, 2));

console.log(`\n\n✓ ${inventario.length} páginas · ${assets.size} recursos`);
console.log(`  ${OUT}/inventario.json`);
console.log(`  ${OUT}/content/`);
if (fila.length) console.log(`\n  ⚠ Limite de ${MAX} atingido, ${fila.length} URLs por visitar. Usa --max maior.`);
console.log('\nCruza este inventário com o sitemap.xml antigo e com a Search Console.');
console.log('Páginas órfãs com tráfego são frequentes e não aparecem num crawl.');
