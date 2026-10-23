import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { comTempo, passo } from "@/lib/servidor/diagnostico";

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

export const CONSISTENCIA = "eventual";

/*
  O fetch que o Blobs usa. Lê já o corpo inteiro e devolve uma resposta nova
  com esse corpo em memória (os blobs daqui são JSON pequenos).

  Porquê: dentro do servidor do Next, cancelar o corpo de uma resposta de
  fetch (res.body.cancel()) nunca resolve — nem com cache: "no-store", nem com
  o fetch original guardado pelo Next (_nextOriginalFetch); confirmado em
  `next start`. O @netlify/blobs faz exatamente isso numa resposta 404
  (discardBody), por isso a leitura de uma chave inexistente ficava presa
  para sempre. Ler o corpo resolve; e o cancel() de uma resposta construída
  a partir de bytes também.

  E regista cada pedido: método, servidor, estado e duração (sem token nem chave).
*/
const fetchComRegisto: typeof fetch = async (entrada, opcoes) => {
  const url = new URL(typeof entrada === "string" ? entrada : entrada instanceof URL ? entrada.href : entrada.url);
  const t0 = Date.now();
  try {
    const r = await fetch(entrada, { ...opcoes, cache: "no-store" });
    const corpo = await r.arrayBuffer();
    passo("blobs http", { metodo: opcoes?.method ?? "GET", servidor: url.host, estado: r.status, bytes: corpo.byteLength, ms: Date.now() - t0 });
    const semCorpo = r.status === 204 || r.status === 304 || corpo.byteLength === 0;
    return new Response(semCorpo ? null : corpo, { status: r.status, statusText: r.statusText, headers: r.headers });
  } catch (e) {
    passo("blobs http: ERRO", { metodo: opcoes?.method ?? "GET", servidor: url.host, ms: Date.now() - t0, erro: (e as Error).message });
    throw e;
  }
};

/** Que campos traz o contexto do Blobs injetado pelo runtime (só presença, nunca valores). */
function camposDoContexto() {
  const g = globalThis as unknown as { netlifyBlobsContext?: string };
  const bruto = g.netlifyBlobsContext ?? process.env.NETLIFY_BLOBS_CONTEXT;
  if (!bruto) return null;
  try {
    const c = JSON.parse(Buffer.from(bruto, "base64").toString("utf8")) as Record<string, unknown>;
    return Object.fromEntries(Object.keys(c).map((k) => [k, !!c[k]]));
  } catch {
    return { ilegivel: true };
  }
}

/** Tempo-limite de cada operação do armazém. */
const LIMITE_MS = 5000;

/*
  Onde corre. O @netlify/blobs procura o contexto em globalThis.netlifyBlobsContext
  ou na variável NETLIFY_BLOBS_CONTEXT (é o que o runtime do Netlify injeta nas
  funções, incluindo a do Next). Dentro do Netlify (Lambda) nunca se usam
  ficheiros: o disco é só de leitura.
  RESERVAS_ARMAZEM=blobs|ficheiros força um dos dois.
*/
function sinaisDoAmbiente() {
  const g = globalThis as unknown as { netlifyBlobsContext?: unknown; Netlify?: unknown };
  return {
    RESERVAS_ARMAZEM: process.env.RESERVAS_ARMAZEM ?? null,
    NETLIFY_BLOBS_CONTEXT: !!process.env.NETLIFY_BLOBS_CONTEXT,
    globalNetlifyBlobsContext: !!g.netlifyBlobsContext,
    globalNetlify: !!g.Netlify,
    DEPLOY_ID: !!process.env.DEPLOY_ID,
    SITE_ID: !!process.env.SITE_ID,
    NETLIFY: !!process.env.NETLIFY,
    CONTEXT: !!process.env.CONTEXT,
    AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    NETLIFY_BLOBS_TOKEN: !!process.env.NETLIFY_BLOBS_TOKEN,
    contexto: camposDoContexto(),
    cwd: process.cwd(),
  };
}

function noNetlify() {
  const s = sinaisDoAmbiente();
  if (s.RESERVAS_ARMAZEM) return s.RESERVAS_ARMAZEM === "blobs";
  return s.NETLIFY_BLOBS_CONTEXT || s.globalNetlifyBlobsContext || s.globalNetlify || s.DEPLOY_ID || s.AWS_LAMBDA_FUNCTION_NAME;
}

/* ---------------- Netlify Blobs ---------------- */

async function lojaBlobs(): Promise<Armazem> {
  const { getStore } = await import("@netlify/blobs");
  // Por defeito o contexto vem do runtime do Netlify. Se faltar, o caminho manual
  // documentado é siteID + token (NETLIFY_SITE_ID/SITE_ID e NETLIFY_BLOBS_TOKEN).
  const manual = process.env.NETLIFY_BLOBS_TOKEN && (process.env.SITE_ID || process.env.NETLIFY_SITE_ID);
  /*
    Consistência eventual (a do Blobs por defeito, pelo edgeURL). A forte vai
    pelo uncachedEdgeURL e, dentro da função do Next no Netlify, a leitura
    ficava presa (o cliente repete pedidos falhados com 5 s de espera). A
    proteção contra escritas cruzadas está nas escritas condicionais
    (onlyIfNew / onlyIfMatch), que o servidor do Blobs verifica sempre.
  */
  const opcoes = { name: "reservas", fetch: fetchComRegisto };
  const loja = manual
    ? getStore({ ...opcoes, siteID: (process.env.SITE_ID || process.env.NETLIFY_SITE_ID)!, token: process.env.NETLIFY_BLOBS_TOKEN! })
    : getStore(opcoes);
  passo("armazém Blobs pronto", { modo: manual ? "siteID+token" : "contexto do runtime", consistencia: CONSISTENCIA });
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

/** Cada operação com tempo-limite e duração nos registos. */
function comLimites(a: Armazem, nome: string): Armazem {
  return {
    ler: (c) => comTempo(`armazém ${nome} ler ${c}`, a.ler(c), LIMITE_MS),
    escrever: (c, v, cond) => comTempo(`armazém ${nome} escrever ${c}`, a.escrever(c, v, cond), LIMITE_MS),
    listar: (p) => comTempo(`armazém ${nome} listar ${p}`, a.listar(p), LIMITE_MS),
    apagar: (c) => comTempo(`armazém ${nome} apagar ${c}`, a.apagar(c), LIMITE_MS),
  };
}

/** Para o início de cada pedido: que armazém se usa, porquê e com que consistência. */
export function registarArmazem() {
  const blobs = noNetlify();
  passo(`armazém escolhido: ${blobs ? "blobs" : "ficheiros"}`, { consistencia: blobs ? CONSISTENCIA : "—", ...sinaisDoAmbiente() });
}

let armazem: Promise<Armazem> | null = null;
export function obterArmazem(): Promise<Armazem> {
  if (!armazem) {
    const blobs = noNetlify();
    passo(`armazém escolhido: ${blobs ? "blobs" : "ficheiros"}`, sinaisDoAmbiente());
    armazem = (blobs ? lojaBlobs() : Promise.resolve(lojaFicheiros)).then((a) => comLimites(a, blobs ? "blobs" : "ficheiros"));
    // Se a criação falhar, tenta outra vez no pedido seguinte.
    armazem.catch((e) => {
      passo("armazém: ERRO ao criar", { erro: (e as Error).message });
      armazem = null;
    });
  }
  return armazem;
}
