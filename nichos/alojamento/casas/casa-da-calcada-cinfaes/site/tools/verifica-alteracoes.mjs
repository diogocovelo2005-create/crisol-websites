import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const url = process.env.SITE_URL ?? 'http://localhost:3300';
const pasta = path.resolve('..', 'scrollcraft', 'shots');
await mkdir(pasta, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const contexto = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const pagina = await contexto.newPage();
const consola = [];
pagina.on('console', (mensagem) => mensagem.type() === 'error' && consola.push(mensagem.text()));
pagina.on('pageerror', (erro) => consola.push(erro.message));

await pagina.goto(url, { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

const espacos = await pagina.locator('#espacos').boundingBox();
if (!espacos) throw new Error('A secção #espacos não foi encontrada.');
await pagina.evaluate((topo) => window.scrollTo(0, topo), espacos.y);
await pagina.waitForTimeout(500);
await pagina.screenshot({ path: path.join(pasta, 'alteracoes-espacos-1.png') });

const alturaEspacos = await pagina.locator('#espacos').evaluate((elemento) => elemento.getBoundingClientRect().height);
await pagina.evaluate(({ topo, altura }) => window.scrollTo(0, topo + (altura - window.innerHeight) * 0.82), { topo: espacos.y, altura: alturaEspacos });
await pagina.waitForTimeout(700);
await pagina.screenshot({ path: path.join(pasta, 'alteracoes-espacos-2.png') });

const ultimoMomento = pagina.getByText('Há um Douro inteiro à volta', { exact: true });
await ultimoMomento.waitFor({ state: 'attached' });
await ultimoMomento.evaluate((elemento) => {
  let raiz = elemento.parentElement;
  while (raiz && raiz.getBoundingClientRect().height < window.innerHeight * 3) raiz = raiz.parentElement;
  if (!raiz) return;
  const retangulo = raiz.getBoundingClientRect();
  const topo = window.scrollY + retangulo.top;
  window.scrollTo(0, topo + (retangulo.height - window.innerHeight) * 0.94);
});
await pagina.waitForTimeout(900);
await pagina.screenshot({ path: path.join(pasta, 'alteracoes-arredores.png') });

const tecnicos = await pagina.evaluate(() => ({
  imagensFalhadas: [...document.images].filter((imagem) => !imagem.complete || imagem.naturalWidth === 0).map((imagem) => imagem.src),
  overflowHorizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  imagensAlteradas: [...document.images]
    .filter((imagem) => /patio-escadas-01|tanque-nascente-01|capela-interior-01|arredores-foz-bestanca-douro/.test(imagem.src))
    .map((imagem) => ({ src: imagem.src, alt: imagem.alt, largura: imagem.naturalWidth, altura: imagem.naturalHeight })),
  credito: document.body.innerText.includes('Foz do Bestança - Rio Douro'),
  textoArredores: document.body.innerText.includes('cascatas no vale do Bestança'),
}));

await contexto.close();

const contextoMovel = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const movel = await contextoMovel.newPage();
const consolaMovel = [];
movel.on('console', (mensagem) => mensagem.type() === 'error' && consolaMovel.push(mensagem.text()));
movel.on('pageerror', (erro) => consolaMovel.push(erro.message));
await movel.goto(url, { waitUntil: 'networkidle' });
await movel.evaluate(() => document.fonts.ready);
await movel.locator('#espacos').evaluate((elemento) => elemento.scrollIntoView({ block: 'start' }));
await movel.waitForTimeout(350);
await movel.screenshot({ path: path.join(pasta, 'alteracoes-mobile-espacos.png') });
for (const alt of [
  'Pátio em vários níveis, com escadas de pedra entre os edifícios da quinta',
  'Tanque de pedra alimentado pela nascente, com o repuxo a correr junto ao jardim',
  'Interior da capela, com bancos de madeira, altares de pedra e vitrais',
]) {
  await movel.getByAltText(alt, { exact: true }).evaluate((elemento) => elemento.scrollIntoView({ block: 'center', inline: 'center' }));
  await movel.waitForTimeout(250);
}
await movel.getByText('Há um Douro inteiro à volta', { exact: true }).evaluate((elemento) => elemento.scrollIntoView({ block: 'center' }));
await movel.waitForTimeout(350);
await movel.screenshot({ path: path.join(pasta, 'alteracoes-mobile-arredores.png') });
const tecnicosMovel = await movel.evaluate(() => ({
  imagensFalhadas: [...document.images]
    .filter((imagem) => /patio-escadas-01|tanque-nascente-01|capela-interior-01|arredores-foz-bestanca-douro/.test(imagem.src))
    .filter((imagem) => !imagem.complete || imagem.naturalWidth === 0)
    .map((imagem) => imagem.src),
  overflowHorizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await contextoMovel.close();

await browser.close();
console.log(JSON.stringify({ desktop: { ...tecnicos, consola }, movel: { ...tecnicosMovel, consola: consolaMovel } }, null, 2));
if (
  tecnicos.imagensFalhadas.length ||
  tecnicos.overflowHorizontal > 1 ||
  consola.length ||
  !tecnicos.credito ||
  !tecnicos.textoArredores ||
  tecnicosMovel.imagensFalhadas.length ||
  tecnicosMovel.overflowHorizontal > 1 ||
  consolaMovel.length
) process.exitCode = 1;
