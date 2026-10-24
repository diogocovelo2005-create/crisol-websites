#!/usr/bin/env node
/*
  Gera uma chave nova para o link privado dos preços da D. Teresa
  (/precos/<chave>) e guarda o hash dela no armazém das reservas. A chave
  antiga deixa de abrir o editor (no Netlify, no máximo um minuto depois:
  as leituras do Blobs são eventuais). Não precisa de publicação.

    node scripts/chave-precos.mjs              → em casa (site/.dados/, para testar)
    node scripts/chave-precos.mjs --producao   → no site publicado (Netlify Blobs)

  Em produção usa NETLIFY_AUTH_TOKEN e NETLIFY_SITE_ID do .env.local do site
  (os mesmos do oficina/deploy-netlify.mjs), ou das variáveis de ambiente.
  Só imprime a chave nova e o link; nada mais do .env.local.

  Opções: --site-url <url> (por defeito https://quintadecanhoes.com em
  produção, http://localhost:4160 em casa).
*/
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const producao = args.includes("--producao");
const i = args.indexOf("--site-url");
const siteUrl = (i >= 0 ? args[i + 1] : producao ? "https://quintadecanhoes.com" : "http://localhost:4160").replace(/\/$/, "");

// O mesmo cálculo de lib/servidor/precos.ts (hashChave).
const chave = randomBytes(32).toString("base64url"); // 43 caracteres
const valor = { hash: createHash("sha256").update(`precos-chave|${chave}`).digest("hex"), criadaEm: new Date().toISOString() };

if (!producao) {
  const f = path.join(SITE, ".dados", "precos", "chave.json");
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(valor, null, 2), "utf8");
} else {
  const env = { ...lerEnv(path.join(SITE, ".env.local")), ...process.env };
  const token = env.NETLIFY_AUTH_TOKEN;
  const siteID = env.NETLIFY_SITE_ID || env.SITE_ID;
  if (!token || !siteID) {
    console.error("Faltam NETLIFY_AUTH_TOKEN e/ou NETLIFY_SITE_ID (no .env.local do site, como para o deploy).");
    process.exit(1);
  }
  const { getStore } = await import("@netlify/blobs");
  const loja = getStore({ name: "reservas", siteID, token });
  await loja.setJSON("precos/chave", valor);
  const lido = await loja.get("precos/chave", { type: "json" });
  if (lido?.hash !== valor.hash) {
    console.error("A chave foi escrita mas a leitura não confirmou. Corra outra vez.");
    process.exit(1);
  }
}

console.log(`Chave nova ${producao ? "no site publicado" : "em casa (.dados)"}. A anterior deixou de valer.`);
console.log(`Link para a D. Teresa:\n${siteUrl}/precos/${chave}`);

/** Lê um .env simples (NOME=valor), sem o imprimir. */
function lerEnv(f) {
  if (!existsSync(f)) return {};
  return Object.fromEntries(
    readFileSync(f, "utf8")
      .split(/\r?\n/)
      .map((l) => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
  );
}
