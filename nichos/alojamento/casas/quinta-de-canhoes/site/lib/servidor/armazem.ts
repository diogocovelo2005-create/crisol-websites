import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/*
  A memória mínima das reservas: chave → JSON, com escrita condicional
  (etag) para duas ações ao mesmo tempo não se apagarem uma à outra.

  - No Netlify: Netlify Blobs (loja «reservas», consistência forte).
  - Em casa (sem ambiente Netlify): ficheiros em site/.dados/ (fora do git e
    do deploy), com a mesma interface.
*/

export type Lido<T> = { valor: T; etag: string } | null;
/** etag: string = só se não mudou; null = só se não existir; undefined = sempre. */
export type Condicao = { etag?: string | null };

export interface Armazem {
  ler<T>(chave: string): Promise<Lido<T>>;
  /** true se escreveu; false se a condição falhou (alguém escreveu entretanto). */
  escrever(chave: string, valor: unknown, condicao?: Condicao): Promise<boolean>;
  listar(prefixo: string): Promise<string[]>;
  apagar(chave: string): Promise<void>;
}

export const PASTA_DADOS = path.join(process.cwd(), ".dados");

// RESERVAS_ARMAZEM=blobs|ficheiros força um dos dois; por defeito, Blobs só dentro do Netlify.
const noNetlify = () =>
  process.env.RESERVAS_ARMAZEM ? process.env.RESERVAS_ARMAZEM === "blobs" : Boolean(process.env.NETLIFY_BLOBS_CONTEXT || process.env.DEPLOY_ID);

/* ---------------- Netlify Blobs ---------------- */

async function lojaBlobs(): Promise<Armazem> {
  const { getStore } = await import("@netlify/blobs");
  const loja = getStore({ name: "reservas", consistency: "strong" });
  return {
    async ler<T>(chave: string) {
      const r = await loja.getWithMetadata(chave, { type: "json" });
      return r ? { valor: r.data as T, etag: r.etag ?? "" } : null;
    },
    async escrever(chave, valor, condicao = {}) {
      if (condicao.etag === undefined) {
        await loja.setJSON(chave, valor);
        return true;
      }
      const r =
        condicao.etag === null ? await loja.setJSON(chave, valor, { onlyIfNew: true }) : await loja.setJSON(chave, valor, { onlyIfMatch: condicao.etag });
      return r.modified;
    },
    async listar(prefixo) {
      const { blobs } = await loja.list({ prefix: prefixo });
      return blobs.map((b) => b.key);
    },
    async apagar(chave) {
      await loja.delete(chave);
    },
  };
}

/* ---------------- Ficheiros (local) ---------------- */

const ficheiro = (chave: string) => path.join(PASTA_DADOS, `${chave.replace(/[^a-zA-Z0-9/_-]/g, "_")}.json`);
const etagDe = (texto: string) => createHash("sha1").update(texto).digest("hex");
// ponytail: um só processo local; a condição é verificada e escrita sem trinco entre processos.
let fila: Promise<unknown> = Promise.resolve();
const emFila = <T>(f: () => Promise<T>) => {
  const r = fila.then(f, f);
  fila = r.catch(() => undefined);
  return r;
};

const lojaFicheiros: Armazem = {
  async ler<T>(chave: string) {
    try {
      const texto = await readFile(ficheiro(chave), "utf8");
      return { valor: JSON.parse(texto) as T, etag: etagDe(texto) };
    } catch {
      return null;
    }
  },
  escrever(chave, valor, condicao = {}) {
    return emFila(async () => {
      const f = ficheiro(chave);
      let atual: string | null = null;
      try {
        atual = await readFile(f, "utf8");
      } catch {}
      if (condicao.etag === null && atual !== null) return false;
      if (typeof condicao.etag === "string" && (atual === null || etagDe(atual) !== condicao.etag)) return false;
      await mkdir(path.dirname(f), { recursive: true });
      await writeFile(f, JSON.stringify(valor, null, 2), "utf8");
      return true;
    });
  },
  async listar(prefixo) {
    const dir = path.join(PASTA_DADOS, path.dirname(prefixo + "x"));
    const base = path.basename(prefixo + "x").slice(0, -1);
    const nomes = await readdir(dir).catch(() => [] as string[]);
    const pasta = path.relative(PASTA_DADOS, dir);
    return nomes
      .filter((n) => n.endsWith(".json") && n.startsWith(base))
      .map((n) => (pasta ? `${pasta}/` : "") + n.slice(0, -5));
  },
  async apagar(chave) {
    await rm(ficheiro(chave), { force: true });
  },
};

let armazem: Promise<Armazem> | null = null;
export function obterArmazem(): Promise<Armazem> {
  armazem ??= noNetlify() ? lojaBlobs() : Promise.resolve(lojaFicheiros);
  return armazem;
}
