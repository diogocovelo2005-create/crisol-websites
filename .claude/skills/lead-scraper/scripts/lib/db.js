/**
 * db.js — acesso ao Supabase.
 *
 * Duas ligacoes distintas, de proposito:
 *
 *   PostgREST (SUPABASE_SERVICE_ROLE_KEY)  le e escreve linhas. E o caminho
 *                                          normal, usado em todo o pipeline.
 *   Postgres directo (SUPABASE_DB_URL)     corre DDL. O PostgREST nao faz
 *                                          create table nem create index.
 *
 * A segunda e opcional: sem ela o pipeline imprime o SQL para colares no
 * editor do Supabase e para uma vez, em vez de falhar lead a lead.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS = path.join(AQUI, "..");

/* ─────────────────────────────── nomes ──────────────────────────────────── */

/**
 * Limite de identificadores do Postgres: 63 caracteres, e ele corta o que
 * passa disso **em silencio** — dois nichos com prefixo comum ficariam com o
 * mesmo nome de tabela e a escrever um por cima do outro.
 *
 * O que fixa o maximo nao e a tabela, e a vista:
 *
 *   leads_ (6) + slug (44) + _prioritarias (13) = 63   exactamente no limite
 *
 * Por isso 44 e nao 50. Os indices usam sufixos curtos (_i1, _i2, _i3) para
 * caberem com folga.
 */
export const MAX_SLUG = 44;

export function nomeTabela(slug) {
  const limpo = String(slug)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/_+$/, "");
  if (!limpo) throw new Error(`Slug invalido: "${slug}"`);
  if (!/^[a-z]/.test(limpo)) throw new Error(`Slug tem de comecar por letra: "${slug}"`);
  return `leads_${limpo}`;
}

/* ────────────────────────────── clientes ────────────────────────────────── */

export function clienteSupabase() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios no .env.");
  }
  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Le um .sql de scripts/ e substitui o marcador da tabela. */
export function lerSql(ficheiro, tabela) {
  const bruto = fs.readFileSync(path.join(SCRIPTS, ficheiro), "utf8");
  return bruto.replaceAll("__TABELA__", tabela);
}

/**
 * Corre SQL arbitrario por ligacao directa. Devolve null se nao houver
 * SUPABASE_DB_URL — quem chama decide o que fazer com isso.
 */
export async function correrSql(sql) {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) return null;

  const { default: pg } = await import("pg");
  const cliente = new pg.Client({
    connectionString: url,
    // O Supabase serve um certificado valido, mas o CA pode nao estar na store
    // do Node em Windows. Isto e uma ligacao a base de dados do proprio
    // utilizador, com credenciais que ele forneceu.
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });
  await cliente.connect();
  try {
    await cliente.query(sql);
    return true;
  } finally {
    await cliente.end();
  }
}

/* ──────────────────────────── garantir a tabela ─────────────────────────── */

async function tabelaExiste(sb, tabela) {
  const { error } = await sb.from(tabela).select("place_id").limit(1);
  if (!error) return true;
  // PGRST205 = a tabela nao esta na cache de schema do PostgREST.
  if (error.code === "PGRST205" || /Could not find the table/i.test(error.message)) return false;
  throw new Error(`Nao consegui verificar a tabela ${tabela}: ${error.message}`);
}

/**
 * Garante que a tabela existe antes de escrever a primeira lead.
 *
 * A alternativa — deixar cada insert falhar — enche o ecra com milhares de
 * mensagens identicas e esconde o problema real, que e uma linha de setup por
 * fazer.
 */
export async function garantirTabela(sb, tabela) {
  if (await tabelaExiste(sb, tabela)) return { criada: false };

  const ddl = lerSql("schema.sql", tabela);

  const feito = await correrSql(ddl);
  if (!feito) {
    console.error(`
A tabela ${tabela} nao existe e nao ha SUPABASE_DB_URL no .env para a criar.

Duas opcoes:

  1) Acrescenta a connection string ao .env e volta a correr:
       Supabase > Project Settings > Database > Connection string > URI
       SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres

  2) Cola isto no SQL Editor do Supabase (Database > SQL Editor):

${ddl}
`);
    throw new Error(`Tabela ${tabela} em falta.`);
  }

  // Sem isto, o PostgREST continua a servir a cache antiga e os primeiros
  // inserts falhavam com PGRST205 sobre uma tabela que ja existe.
  await correrSql("notify pgrst, 'reload schema';");
  for (let i = 0; i < 10; i++) {
    if (await tabelaExiste(sb, tabela)) return { criada: true };
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(
    `Criei ${tabela} mas o PostgREST ainda nao a ve. Espera uns segundos e volta a correr.`
  );
}

/** Aplica score.sql. Sem SUPABASE_DB_URL, imprime-o e devolve false. */
export async function aplicarScore(tabela) {
  const sql = lerSql("score.sql", tabela);
  const feito = await correrSql(sql);
  if (!feito) {
    console.log(`\nSem SUPABASE_DB_URL. Cola isto no SQL Editor do Supabase:\n\n${sql}`);
    return false;
  }
  return true;
}
