import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const url = process.env.PROPOSTA_URL ?? 'http://localhost:3300';
const pasta = path.resolve('..', 'scrollcraft', 'shots');
await mkdir(pasta, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const relatorio = { erros: [], resultados: [] };

async function verificar(nome, viewport, reducedMotion = 'no-preference', colorScheme = 'light') {
  const contexto = await browser.newContext({ viewport, reducedMotion, colorScheme });
  const pagina = await contexto.newPage();
  const consola = [];
  pagina.on('console', (mensagem) => {
    if (mensagem.type() === 'error') consola.push(mensagem.text());
  });
  pagina.on('pageerror', (erro) => consola.push(erro.message));
  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

  await pagina.screenshot({ path: path.join(pasta, `${nome}-topo.png`), fullPage: false });
  for (const [id, fracao] of [['quinta', 0.05], ['travessia', 0.05], ['ficar', 0.04], ['contacto', 0]]) {
    await pagina.evaluate(({ id, fracao }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const topo = window.scrollY + el.getBoundingClientRect().top;
      window.scrollTo(0, topo + el.getBoundingClientRect().height * fracao);
    }, { id, fracao });
    await pagina.waitForTimeout(900);
    await pagina.screenshot({ path: path.join(pasta, `${nome}-${id}.png`), fullPage: false });
  }

  await pagina.evaluate(() => {
    const el = document.getElementById('capela');
    if (!el) return;
    const topo = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo(0, topo + (el.getBoundingClientRect().height - window.innerHeight) * 0.56);
  });
  await pagina.waitForTimeout(900);
  await pagina.screenshot({ path: path.join(pasta, `${nome}-capela-meio.png`), fullPage: false });
  await pagina.evaluate(() => {
    const el = document.getElementById('capela');
    if (!el) return;
    const topo = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo(0, topo + (el.getBoundingClientRect().height - window.innerHeight) * 0.84);
  });
  await pagina.waitForTimeout(500);
  await pagina.screenshot({ path: path.join(pasta, `${nome}-capela-final.png`), fullPage: false });

  await pagina.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await pagina.waitForTimeout(350);
  const tecnicos = await pagina.evaluate(() => ({
    titulo: document.title,
    h1: document.querySelectorAll('h1').length,
    imagensFalhadas: [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    overflowHorizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    emails: [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')),
    telefones: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
    livro: Boolean(document.querySelector('a[href*="livroreclamacoes"]')),
    idioma: document.documentElement.lang,
    alturaCapela: Math.round(document.querySelector('#capela')?.getBoundingClientRect().height ?? 0),
  }));

  relatorio.resultados.push({ nome, viewport, reducedMotion, ...tecnicos, consola });
  await contexto.close();
}

await verificar('desktop', { width: 1440, height: 1000 });
await verificar('mobile', { width: 390, height: 844 });
await verificar('reduzido', { width: 1440, height: 1000 }, 'reduce');
await verificar('dark', { width: 1440, height: 1000 }, 'no-preference', 'dark');
await browser.close();

for (const resultado of relatorio.resultados) {
  const falha = resultado.h1 !== 1 || resultado.imagensFalhadas.length > 0 || resultado.overflowHorizontal > 1 || resultado.consola.length > 0 || !resultado.livro || resultado.idioma !== 'pt-PT';
  if (falha) relatorio.erros.push(resultado.nome);
}

console.log(JSON.stringify(relatorio, null, 2));
if (relatorio.erros.length) process.exitCode = 1;
