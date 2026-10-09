#!/usr/bin/env node
/**
 * preflight.js — verificação do site novo antes de tocar no domínio.
 *
 *   node scripts/preflight.js --url https://preview-url [--paginas /,/contactos]
 *
 * Não verifica estética. Verifica se o site EXISTE para quem o procura.
 */
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
const base = A.url.replace(/\/$/, '');

const R = [];
const add = (nivel, area, msg) => R.push({ nivel, area, msg });

// Bloquear estes é a falha invisível mais comum: o site funciona para ti
// e é invisível para o ChatGPT, o Perplexity e o Claude.
const BOTS = ['GPTBot','OAI-SearchBot','ChatGPT-User','PerplexityBot','ClaudeBot','Google-Extended','Bingbot','Googlebot'];

// ---------- robots.txt ----------
let robots = '';
try {
  const r = await fetch(`${base}/robots.txt`);
  if (r.ok) {
    robots = await r.text();
    if (/^\s*Disallow:\s*\/\s*$/mi.test(robots) && !/Allow:/i.test(robots))
      add('CRÍTICO', 'robots', 'Disallow: / — o site inteiro está bloqueado');
    for (const b of BOTS) {
      const bloco = robots.match(new RegExp(`User-agent:\\s*${b}[\\s\\S]*?(?=User-agent:|$)`, 'i'));
      if (bloco && /Disallow:\s*\/\s*$/mi.test(bloco[0]))
        add('CRÍTICO', 'crawlers', `${b} bloqueado no robots.txt`);
    }
    if (!/sitemap:/i.test(robots)) add('AVISO', 'robots', 'sem referência ao sitemap');
  } else add('AVISO', 'robots', `robots.txt devolveu ${r.status}`);
} catch { add('AVISO', 'robots', 'robots.txt inacessível'); }

// ---------- sitemap ----------
try {
  const r = await fetch(`${base}/sitemap.xml`);
  if (!r.ok) add('CRÍTICO', 'sitemap', `sitemap.xml devolveu ${r.status}`);
  else {
    const x = await r.text();
    const n = (x.match(/<loc>/g) || []).length;
    if (!n) add('CRÍTICO', 'sitemap', 'sitemap sem URLs');
    else add('OK', 'sitemap', `${n} URLs`);
    if (/localhost|127\.0\.0\.1|vercel\.app|netlify\.app/.test(x))
      add('CRÍTICO', 'sitemap', 'contém URLs de staging — vão ser indexados');
  }
} catch { add('CRÍTICO', 'sitemap', 'sitemap.xml inacessível'); }

// ---------- HTTPS e cabeçalhos ----------
try {
  const r = await fetch(base, { redirect: 'follow' });
  if (!r.url.startsWith('https://')) add('CRÍTICO', 'https', 'o site não serve por HTTPS');
  if (!r.headers.get('strict-transport-security')) add('AVISO', 'segurança', 'sem HSTS');
  if (!r.headers.get('x-content-type-options')) add('AVISO', 'segurança', 'sem X-Content-Type-Options');
} catch (e) { add('CRÍTICO', 'https', String(e.message).slice(0, 80)); }

// ---------- páginas ----------
const paginas = (A.paginas ? String(A.paginas).split(',') : ['/']).map((p) => p.trim());
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

for (const p of paginas) {
  const page = await ctx.newPage();
  const url = `${base}${p === '/' ? '' : p}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

    // Conteúdo servido em HTML: compara o HTML cru com o DOM renderizado.
    // Faz um segundo pedido à mesma página — é intencional, é a única forma
    // de ver o que um crawler sem JavaScript recebe. Pode divergir se houver
    // cache agressiva ou testes A/B; nesse caso confirma à mão com curl.
    const cru = await (await fetch(url)).text();
    const textoCru = cru.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').trim().length;
    const textoDom = (await page.evaluate(() => document.body.innerText.length));
    if (textoDom > 400 && textoCru < textoDom * 0.4)
      add('CRÍTICO', 'render', `${p}: conteúdo só existe depois do JavaScript — invisível para parte dos crawlers`);

    const d = await page.evaluate(() => ({
      titulo: document.title,
      desc: document.querySelector('meta[name="description"]')?.content ?? null,
      canonical: document.querySelector('link[rel=canonical]')?.href ?? null,
      og: !!document.querySelector('meta[property="og:image"]'),
      viewport: !!document.querySelector('meta[name=viewport]'),
      h1: [...document.querySelectorAll('h1')].map((h) => h.innerText.trim()),
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      semAlt: [...document.images].filter((i) => i.getAttribute('alt') === null).length,
      lang: document.documentElement.lang,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 8,
      noindex: !!document.querySelector('meta[name=robots][content*="noindex"]'),
    }));

    if (d.noindex)        add('CRÍTICO', 'indexação', `${p}: meta noindex ainda ativa`);
    if (!d.titulo)        add('CRÍTICO', 'meta', `${p}: sem <title>`);
    if (!d.desc)          add('AVISO',   'meta', `${p}: sem meta description`);
    if (!d.canonical)     add('AVISO',   'meta', `${p}: sem canonical`);
    if (!d.og)            add('AVISO',   'meta', `${p}: sem og:image — partilhas sem pré-visualização`);
    if (!d.viewport)      add('CRÍTICO', 'mobile', `${p}: sem meta viewport`);
    if (d.overflow)       add('CRÍTICO', 'mobile', `${p}: overflow horizontal em 390px`);
    if (d.h1.length === 0) add('CRÍTICO', 'estrutura', `${p}: sem <h1>`);
    if (d.h1.length > 1)  add('AVISO',   'estrutura', `${p}: ${d.h1.length} <h1>`);
    if (!d.lang)          add('AVISO',   'a11y', `${p}: <html> sem atributo lang`);
    if (d.semAlt)         add('AVISO',   'a11y', `${p}: ${d.semAlt} imagens sem atributo alt`);

    if (!d.jsonld.length) add('AVISO', 'schema', `${p}: sem JSON-LD`);
    else d.jsonld.forEach((s, i) => {
      try { JSON.parse(s); } catch { add('CRÍTICO', 'schema', `${p}: JSON-LD #${i + 1} inválido — pode desqualificar a página`); }
    });
  } catch (e) {
    add('CRÍTICO', 'página', `${p}: ${String(e.message).slice(0, 80)}`);
  } finally { await page.close().catch(() => {}); }
}
await browser.close();

// ---------- relatório ----------
const ordem = { 'CRÍTICO': 0, 'AVISO': 1, 'OK': 2 };
R.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
console.log('');
for (const r of R) {
  const marca = r.nivel === 'CRÍTICO' ? '✗' : r.nivel === 'AVISO' ? '⚠' : '✓';
  console.log(`  ${marca}  [${r.area}] ${r.msg}`);
}
const crit = R.filter((r) => r.nivel === 'CRÍTICO').length;
console.log(`\n  ${crit} críticos · ${R.filter((r) => r.nivel === 'AVISO').length} avisos\n`);
if (crit) console.log('  Não mudes o DNS com críticos por resolver.\n');
process.exit(crit ? 1 : 0);
