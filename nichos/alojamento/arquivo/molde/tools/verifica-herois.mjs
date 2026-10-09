#!/usr/bin/env node

import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3300/catalogo';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(1200);

async function sectionBox(code) {
  return page.$eval(`[data-variante="${code}"]`, (element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + window.scrollY, travel: Math.max(0, rect.height - window.innerHeight) };
  });
}

async function goTo(box, fraction) {
  await page.evaluate(({ top, travel, fraction }) => window.scrollTo(0, top + travel * fraction), { ...box, fraction });
  await page.waitForTimeout(900);
}

const h2 = await sectionBox('H2');
const h2Samples = [];
for (const fraction of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
  await goTo(h2, fraction);
  h2Samples.push(await page.evaluate((fraction) => {
    const name = document.querySelector('[data-variante="H2"] [data-hero-name]');
    const copy = document.querySelector('[data-variante="H2"] [data-hero-copy]');
    const nameRect = name.getBoundingClientRect();
    const copyStyle = getComputedStyle(copy);
    return {
      fraction,
      nameTop: Number(nameRect.top.toFixed(1)),
      nameHeight: Number(nameRect.height.toFixed(1)),
      nameTransform: getComputedStyle(name).transform,
      copyOpacity: Number(Number.parseFloat(copyStyle.opacity).toFixed(2)),
      copyTransform: copyStyle.transform,
    };
  }, fraction));
}

const h3 = await sectionBox('H3');
const h3Samples = [];
for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
  await goTo(h3, fraction);
  h3Samples.push(await page.$eval('[data-variante="H3"] [data-hero-expand]', (element, fraction) => ({
    fraction,
    clipPath: getComputedStyle(element).clipPath,
  }), fraction));
}

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
await page.waitForTimeout(400);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const refreshY = await page.evaluate(() => Math.round(window.scrollY));

await browser.close();

console.log(JSON.stringify({ h2Samples, h3Samples, refreshY, errors }, null, 2));

