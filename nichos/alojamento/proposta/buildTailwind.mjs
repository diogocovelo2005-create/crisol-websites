import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { renderTailwind } from './renderTailwind.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '../../..');
const arg = process.argv[2];
const configPath = join(AQUI, arg);
const mod = await import(pathToFileURL(configPath).href);
const d = mod.default;

const b64 = (p) => readFileSync(p).toString('base64');
function imagem(rel) {
  if (!rel) return null;
  const p = join(AQUI, rel);
  if (!existsSync(p)) return null;
  const tipo = p.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
  return `data:image/${tipo};base64,${b64(p)}`;
}
const foto = imagem(d.autor.foto);
const capa = imagem(d.casa.capa);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const htmlContent = renderTailwind(d, { esc, capa, foto });

const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(d.casa.nome)} — proposta de website</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            background: "#fdf9f3",
            "on-surface": "#1c1c18",
            primary: "#031810",
            secondary: "#D4A32A",
            "surface-container-low": "#f7f3ed",
            "outline-variant": "#dcd8d2"
          },
          fontFamily: {
            display: ["Newsreader", "serif"],
            body: ["Plus Jakarta Sans", "sans-serif"]
          }
        }
      }
    }
</script>
<style>
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; vertical-align: middle; line-height: 1; }
  @media print {
    body { background-color: #fdf9f3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body class="bg-background text-on-surface antialiased font-body">
  ${htmlContent}
</body>
</html>`;

mkdirSync(join(AQUI, 'out'), { recursive: true });
const htmlPath = join(AQUI, 'out', `${d.ficheiro}.html`);
writeFileSync(htmlPath, html, 'utf8');

const { chromium } = await import(pathToFileURL(join(RAIZ, '.claude/skills/lead-scraper/node_modules/playwright/index.mjs')).href);
const alternativas = [
  process.env.CHROME_PATH,
  join(process.env.LOCALAPPDATA ?? "", 'ms-playwright/chromium-1243/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter((p) => p && existsSync(p));

let browser;
for (const executablePath of [...alternativas, undefined]) {
  try {
    browser = await chromium.launch(executablePath ? { executablePath } : {});
    break;
  } catch {}
}
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const pdfPath = join(AQUI, 'out', `${d.ficheiro}.pdf`);
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: false, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
await browser.close();
console.log(pdfPath);
