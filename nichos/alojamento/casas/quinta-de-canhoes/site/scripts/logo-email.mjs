/*
  Gera as imagens dos emails (lib/servidor/logo-email.ts):
  - o logotipo do site (Young Serif encorpada) em PNG transparente, a 2x,
    em duas versões: escura (xisto, com um halo finíssimo da cor do papel,
    invisível no modo claro, que o mantém legível se um cliente escurecer o
    fundo sem trocar a imagem) e clara (para o modo escuro);
  - uma faixa de cada quarto e da casa, em JPEG leve, para «A sua estadia».

  Precisa do site a correr (para a fonte) e do Playwright:
    node scripts/logo-email.mjs http://localhost:4160
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://localhost:4160';
const req = createRequire(path.resolve('../../../.claude/skills/criar-base/package.json'));
const { chromium } = req('playwright');

const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 600, height: 400 } });
await p.goto(`${base}/em-construcao`, { waitUntil: 'networkidle' });

async function logo(cor, halo) {
  await p.evaluate(({ cor, halo }) => {
    document.documentElement.style.background = 'transparent';
    document.body.innerHTML = '';
    document.body.style.background = 'transparent';
    const d = document.createElement('div');
    d.id = 'logo';
    d.className = 'rustico-encorpado';
    const s = halo ? [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(([x, y]) => `${x * 1.2}px ${y * 1.2}px 0 ${halo}`).join(',') : 'none';
    d.style.cssText = `display:inline-block;padding:6px 6px 8px 4px;font-size:34px;line-height:0.98;color:${cor};text-shadow:${s};`;
    d.innerHTML = 'Quinta de<br>Canhões';
    document.body.appendChild(d);
  }, { cor, halo });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  const png = await p.locator('#logo').screenshot({ omitBackground: true });
  return sharp(png).png({ palette: true, colors: 96, compressionLevel: 9 }).toBuffer();
}

const escuro = await logo('#221f1b', '#fbf6ec');
const claro = await logo('#f7f1e6', null);
await b.close();
const meta = await sharp(escuro).metadata();

const FOTOS = {
  duplo: 'public/fotos/quartos/quarto duplo/quarto duplo.jpg',
  twin: 'public/fotos/quartos/quarto-twin.jpg',
  suite: 'public/fotos/quartos/suite/quarto suite.jpg',
  casa: 'public/fotos/casa-fachada.jpg',
};
const FOCO = { duplo: 'attention', twin: 'attention', suite: 'attention', casa: 'attention' };
const fotos = {};
for (const [k, f] of Object.entries(FOTOS)) {
  const buf = await sharp(f).resize(1040, 360, { fit: 'cover', position: FOCO[k] }).jpeg({ quality: 62, mozjpeg: true }).toBuffer();
  fotos[k] = buf.toString('base64');
  console.log(`foto ${k}: ${buf.length} bytes`);
}

fs.writeFileSync(
  'lib/servidor/logo-email.ts',
  `/* Gerado por scripts/logo-email.mjs. Não editar à mão. */
export const LOGO_EMAIL = {
  largura: ${meta.width / 2},
  altura: ${meta.height / 2},
  /** Xisto, fundo transparente, halo da cor do papel. */
  base64: "${escuro.toString('base64')}",
  /** Clara, para o modo escuro. */
  base64Claro: "${claro.toString('base64')}",
};

/** Faixas de 520×180 (a 2x) para «A sua estadia». */
export const FOTOS_EMAIL: Record<"duplo" | "twin" | "suite" | "casa", string> = ${JSON.stringify(fotos, null, 2)};
`,
);
console.log(`logo ${meta.width}x${meta.height}px, ${escuro.length} + ${claro.length} bytes`);
