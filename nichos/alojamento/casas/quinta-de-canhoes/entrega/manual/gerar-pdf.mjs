// Gera ../Manual-Quinta-de-Canhoes.pdf a partir de o-seu-site.html.
//   node gerar-pdf.mjs <link-dos-precos> [saida.pdf]
// O link privado (/precos/<chave>) entra só no PDF; o HTML guarda o marcador {{LINK_PRECOS}}.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const link = process.argv[2];
if (!link) { console.error("Falta o link: node gerar-pdf.mjs https://quintadecanhoes.com/precos/<chave>"); process.exit(1); }

const require = createRequire(path.resolve(AQUI, "../../../../.claude/skills/criar-base/package.json"));
const { chromium } = require("playwright");

const tmp = path.join(AQUI, ".o-seu-site-com-link.html");
writeFileSync(tmp, readFileSync(path.join(AQUI, "o-seu-site.html"), "utf8").replaceAll("{{LINK_PRECOS}}", link));
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await p.pdf({ path: process.argv[3] || path.join(AQUI, "..", "Manual-Quinta-de-Canhoes.pdf"), format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" } });
await b.close();
rmSync(tmp);
console.log("PDF gerado.");
