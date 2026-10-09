#!/usr/bin/env node

import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:3300/catalogo';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });

const links = await page.locator('nav a[href^="#"]').evaluateAll((elements) => elements.map((element) => ({
  href: element.getAttribute('href'),
  text: element.textContent?.replace(/\s+/g, ' ').trim(),
})));
const summary = await page.locator('main > section').first().innerText();
const pending = await page.getByText('por avaliar', { exact: true }).count();
const horizontal = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

await page.screenshot({ path: '.shots/catalogo-v3-topo.png', fullPage: false });
await browser.close();

const result = {
  prototypes: links.length,
  codes: links.map((link) => link.href?.slice(1)),
  says23: summary.includes('23 protótipos'),
  says22Approved: summary.includes('22 aprovados'),
  pending,
  horizontal,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (links.length !== 23 || !result.says23 || !result.says22Approved || pending !== 1 || horizontal || errors.length) process.exit(1);
