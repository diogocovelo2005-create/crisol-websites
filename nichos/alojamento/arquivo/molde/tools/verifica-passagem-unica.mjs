import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
await page.goto(process.argv[2] ?? 'http://localhost:3300/catalogo', { waitUntil: 'networkidle' });

for (const codigo of ['E2', 'E5']) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.reload({ waitUntil: 'networkidle' });
  const seletor = `[data-variante="${codigo}"]`;
  const inicial = await page.$eval(seletor, (el) => ({ topo: el.getBoundingClientRect().top + scrollY, altura: el.getBoundingClientRect().height }));
  await page.evaluate((y) => window.scrollTo(0, y), inicial.topo + 5);
  await page.waitForTimeout(900);
  const seletorInicial = codigo === 'E2' ? `${seletor} .translate-x-2` : `${seletor} article h3`;
  const primeiroVisivel = await page.$eval(seletorInicial, (el) => el.textContent?.trim());
  const fim = inicial.topo + inicial.altura - 895;
  await page.evaluate((y) => window.scrollTo(0, y), fim);
  await page.waitForTimeout(1400);
  await page.evaluate((y) => window.scrollTo(0, y), fim - 120);
  await page.waitForTimeout(1200);
  const livre = await page.$eval(seletor, (el) => ({
    altura: el.getBoundingClientRect().height,
    setas: [...el.querySelectorAll('button')].filter((b) => /anterior|seguinte/i.test(b.getAttribute('aria-label') ?? '') && getComputedStyle(b).pointerEvents !== 'none').length,
    y: scrollY,
  }));
  const seletorAtivo = codigo === 'E2' ? `${seletor} .translate-x-2` : `${seletor} article h3`;
  const antesDaSeta = await page.$eval(seletorAtivo, (el) => el.textContent?.trim());
  await page.click(`${seletor} button[aria-label="Espaço anterior"]`);
  await page.waitForTimeout(350);
  const depoisDaSeta = await page.$eval(seletorAtivo, (el) => el.textContent?.trim());
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, inicial.topo - 225));
  await page.waitForTimeout(1200);
  const regresso = await page.$eval(seletor, (el) => ({ topo: el.getBoundingClientRect().top, altura: el.getBoundingClientRect().height }));
  console.log(JSON.stringify({ codigo, inicial: { ...inicial, primeiroVisivel }, livre, setas: { antesDaSeta, depoisDaSeta }, regresso }));
}

console.log(JSON.stringify({ erros }));
await browser.close();
