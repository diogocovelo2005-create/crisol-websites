// Perfil Google Maps de cada casa: nome, morada, website, telefone, nota, fechado. Passo 4 e 5 do SKILL.md.
//   node ferramentas/maps.mjs <lista.json> "<Concelho>" <saida.json>
// Lista: [{ "id", "nome", "localidade" }]. Retoma se parar (o que já foi lido fica na saída).
// Não decide se o perfil é desta casa: quem monta as leads aceita-o só se a morada for do concelho.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , entrada, concelho, saida] = process.argv;
if (!saida) { console.error('uso: node ferramentas/maps.mjs <lista.json> "<Concelho>" <saida.json>'); process.exit(1); }
const lista = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const feito = fs.existsSync(saida) ? JSON.parse(fs.readFileSync(saida, 'utf8')) : {};
const limpa = s => s.replace(/["“”]/g, '').replace(/\s+/g, ' ').trim();
const sa = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const { chromium } = createRequire(path.join(RAIZ, 'package.json'))('playwright-core');
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: true });
const page = await browser.newPage({ locale: 'pt-PT', viewport: { width: 1280, height: 900 } });
await page.goto('https://www.google.com/maps?hl=pt-PT');
try { await page.getByRole('button', { name: /Rejeitar tudo|Aceitar tudo/ }).first().click({ timeout: 6000 }); await page.waitForTimeout(2000); } catch {}

for (const c of lista) {
  if (feito[c.id] && !feito[c.id].erro) continue;
  const local = sa(c.localidade) === sa(concelho) || !c.localidade ? concelho : `${c.localidade} ${concelho}`;
  const q = `${limpa(c.nome)} ${local}`;
  try {
    await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=pt-PT', { timeout: 25000 });
    try { await page.waitForSelector('h1.DUwDvf, a.hfpxzc', { timeout: 9000 }); } catch {}
    await page.waitForTimeout(900);
    let alternativas = [];
    if (!(await page.locator('h1.DUwDvf').count())) {
      const links = page.locator('a.hfpxzc');
      alternativas = await links.evaluateAll(as => as.slice(0, 5).map(a => a.getAttribute('aria-label')));
      if (await links.count()) { await links.first().click(); try { await page.waitForSelector('h1.DUwDvf', { timeout: 8000 }); } catch {} await page.waitForTimeout(900); }
    }
    const i = await page.evaluate(() => ({
      nome: document.querySelector('h1.DUwDvf')?.textContent.trim() || '',
      morada: (document.querySelector('button[data-item-id="address"]')?.innerText || '').replace(/\n/g, ' ').trim(),
      site: document.querySelector('a[data-item-id="authority"]')?.href || '',
      tel: document.querySelector('button[data-item-id^="phone:tel:"]')?.getAttribute('data-item-id').replace('phone:tel:', '') || '',
      nota: document.querySelector('div.F7nice')?.innerText.replace(/\n/g, ' ') || '',
      fechado: /Encerrado permanentemente|Permanently closed/.test(document.querySelector('div[role="main"]')?.innerText || ''),
    }));
    feito[c.id] = { q, ...i, alternativas };
    console.log(c.id, '|', c.nome, '=>', i.nome, '|', i.morada, '|', i.site, '|', i.tel, '|', i.nota, i.fechado ? 'FECHADO' : '');
  } catch (e) {
    feito[c.id] = { q, erro: e.message.slice(0, 80) };
    console.log(c.id, 'ERRO', e.message.slice(0, 80));
  }
  fs.writeFileSync(saida, JSON.stringify(feito, null, 1));
}
await browser.close();
