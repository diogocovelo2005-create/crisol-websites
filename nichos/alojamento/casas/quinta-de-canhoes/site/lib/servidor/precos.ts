import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  TABELA_PADRAO,
  diferencas,
  errosTabela,
  normalizarPromocao,
  normalizarTabela,
  promocoesEmVigor,
  type PrecosBase,
  type Promocao,
  type TabelaPrecos,
} from "@/lib/precos";
import { hojeEmPortugal } from "@/lib/reserva";
import { obterArmazem } from "@/lib/servidor/armazem";
import { config, segredo } from "@/lib/servidor/config";
import { passo } from "@/lib/servidor/diagnostico";
import { enviarEmail } from "@/lib/servidor/email";
import { alteracaoPrecos } from "@/lib/servidor/emails-precos";
import type { Resposta } from "@/lib/servidor/fluxo";

/*
  Os preços no armazém das reservas, e o editor privado da D. Teresa
  (/precos/<chave>: sem página pública, sem email, sem palavra-passe).

    precos/atual  → a tabela em vigor, com a versão anterior dentro (para
                    «Desfazer») e o id da última alteração (idempotência).
    precos/chave  → o hash (SHA-256) da chave do link privado. Sem ele, o
                    editor não existe (404). Troca-se com
                    scripts/chave-precos.mjs, sem publicar.

  Leituras do Blobs são eventuais (podem vir atrasadas até ~1 min). Por isso
  o editor guarda a versão que tem, selada pelo servidor (HMAC), e devolve-a
  ao guardar: se a leitura vier atrasada, conta a versão do editor; a escrita
  é sempre condicional (etag), e quem escreve por cima de outro falha.
*/

const CHAVE = "precos/atual";
const CHAVE_ACESSO = "precos/chave";

type Versao = Pick<TabelaPrecos, "versao" | "atualizadoEm" | "base" | "promocoes">;
export type DocPrecos = TabelaPrecos & {
  anterior: Versao | null;
  ultimaAlteracao: { id: string; em: string; acao: "guardar" | "desfazer" } | null;
};

const DOC_PADRAO: DocPrecos = { ...TABELA_PADRAO, anterior: null, ultimaAlteracao: null };

const versaoDe = (d: Versao): Versao => ({ versao: d.versao, atualizadoEm: d.atualizadoEm, base: d.base, promocoes: d.promocoes });

function normalizarDoc(v: unknown): DocPrecos {
  const d = (v ?? {}) as Partial<DocPrecos>;
  return {
    ...normalizarTabela(d),
    anterior: d.anterior ? versaoDe(normalizarTabela(d.anterior)) : null,
    ultimaAlteracao: d.ultimaAlteracao && typeof d.ultimaAlteracao.id === "string" ? d.ultimaAlteracao : null,
  };
}

export async function lerDoc(): Promise<{ doc: DocPrecos; etag: string | null }> {
  const a = await obterArmazem();
  const lido = await a.ler<DocPrecos>(CHAVE);
  return lido ? { doc: normalizarDoc(lido.valor), etag: lido.etag } : { doc: structuredClone(DOC_PADRAO), etag: null };
}

/** A tabela em vigor para as contas (sem promoções já acabadas). Se o armazém falhar, os preços de origem. */
export async function lerTabela(): Promise<TabelaPrecos> {
  try {
    const { doc } = await lerDoc();
    return { versao: doc.versao, atualizadoEm: doc.atualizadoEm, base: doc.base, promocoes: promocoesEmVigor(doc.promocoes, hojeEmPortugal()) };
  } catch (e) {
    passo("preços: leitura falhou; ficam os de origem", { erro: (e as Error).message });
    return structuredClone(TABELA_PADRAO);
  }
}

/* ------------------------------------------------------------------ */
/* O selo da versão que o editor tem                                   */
/* ------------------------------------------------------------------ */

const selar = (doc: DocPrecos, etag: string | null) =>
  createHmac("sha256", segredo()).update(`precos|${etag ?? ""}|${JSON.stringify(doc)}`).digest("base64url");

function seloValido(doc: DocPrecos, etag: string | null, selo: string) {
  const esperado = Buffer.from(selar(doc, etag));
  const recebido = Buffer.from(String(selo));
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

/** O que o editor recebe: a tabela, a versão anterior (para «Desfazer») e o selo. */
export type EstadoEditor = { doc: DocPrecos; etag: string | null; selo: string };
export const estadoEditor = (doc: DocPrecos, etag: string | null): EstadoEditor => ({ doc, etag, selo: selar(doc, etag) });

/* ------------------------------------------------------------------ */
/* A chave do link privado                                             */
/* ------------------------------------------------------------------ */

/** O hash guardado no armazém (o mesmo cálculo em scripts/chave-precos.mjs). */
const hashChave = (chave: string) => createHash("sha256").update(`precos-chave|${chave}`).digest();

/**
  Se a chave abre o editor: compara o hash com o do armazém, em tempo
  constante. Sem chave guardada, nunca. A chave nunca vai para os registos.
*/
export async function chaveValida(chave: unknown): Promise<boolean> {
  if (typeof chave !== "string" || !/^[A-Za-z0-9_-]{32,128}$/.test(chave)) return false;
  try {
    const a = await obterArmazem();
    const lido = await a.ler<{ hash?: string }>(CHAVE_ACESSO);
    const guardado = typeof lido?.valor?.hash === "string" ? Buffer.from(lido.valor.hash, "hex") : null;
    const recebido = hashChave(chave);
    return !!guardado && guardado.length === recebido.length && timingSafeEqual(guardado, recebido);
  } catch (e) {
    passo("preços: não se conseguiu ler a chave", { erro: (e as Error).message });
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Guardar e desfazer                                                  */
/* ------------------------------------------------------------------ */

type Pedido = {
  chave?: unknown;
  id?: unknown;
  acao?: unknown;
  conhecida?: { doc?: unknown; etag?: unknown; selo?: unknown };
  base?: unknown;
  promocoes?: unknown;
};

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ordenar = (l: Promocao[]) => [...l].sort((a, b) => a.de.localeCompare(b.de) || a.ate.localeCompare(b.ate));

/** Só os campos conhecidos de uma promoção, com o nome e a oferta limpos aqui (o texto do browser não conta). */
const limparPromocao = (p: Promocao): Promocao => normalizarPromocao(p);

export async function guardarPrecos(corpo: unknown): Promise<Resposta> {
  const c = (corpo ?? {}) as Pedido;
  if (!(await chaveValida(c.chave))) return { ok: false, erro: "Este link já não é válido. Peça um novo ao Diogo.", estado: 404, link: "invalido" };
  if (typeof c.id !== "string" || !/^[a-zA-Z0-9-]{8,60}$/.test(c.id)) return { ok: false, erro: "Pedido inválido.", estado: 400 };
  if (c.acao !== "guardar" && c.acao !== "desfazer") return { ok: false, erro: "Pedido inválido.", estado: 400 };
  const id = c.id;
  const acao = c.acao;

  // A versão que o editor tem, selada por nós.
  const k = c.conhecida;
  const etagConhecida = typeof k?.etag === "string" ? k.etag : null;
  const docConhecido = k?.doc as DocPrecos | undefined;
  if (!docConhecido || typeof k?.selo !== "string" || !seloValido(docConhecido, etagConhecida, k.selo)) {
    return { ok: false, erro: "A página está desatualizada. Abra o link outra vez.", estado: 400, mudou: true };
  }

  const hoje = hojeEmPortugal();
  const a = await obterArmazem();
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    if (tentativa) await espera(500 * tentativa);
    const lido = await lerDoc();
    let atual = lido.doc;
    let etag = lido.etag;
    if (atual.ultimaAlteracao?.id === id) {
      // Já está feito (um segundo toque, ou a resposta perdeu-se).
      return { ok: true, repetido: true, estado: estadoEditor(atual, etag), mudancas: [] };
    }
    if (atual.versao < docConhecido.versao) {
      // Leitura atrasada: vale a versão que o editor tem (selada).
      atual = normalizarDoc(docConhecido);
      etag = etagConhecida;
    } else if (atual.versao > docConhecido.versao) {
      return {
        ok: false,
        erro: "Os preços foram mudados noutro sítio entretanto. Volte a abrir o link para ver os preços atuais.",
        estado: 409,
        mudou: true,
      };
    }

    let base: PrecosBase;
    let promocoes: Promocao[];
    if (acao === "desfazer") {
      if (!atual.anterior) return { ok: false, erro: "Não há nenhuma alteração para desfazer.", estado: 400 };
      base = atual.anterior.base;
      promocoes = promocoesEmVigor(atual.anterior.promocoes, hoje);
    } else {
      base = c.base as PrecosBase;
      promocoes = c.promocoes as Promocao[];
      const guardados = new Set(atual.promocoes.map((p) => p.id));
      const erros = errosTabela(base, promocoes, hoje, guardados);
      if (erros.length) return { ok: false, erro: erros.join(" "), estado: 400, erros };
      base = { duplo: base.duplo, twin: base.twin, suite: base.suite, casa: base.casa, crianca: base.crianca, pequenoAlmoco: base.pequenoAlmoco };
      promocoes = promocoesEmVigor(promocoes.map(limparPromocao), hoje);
    }
    promocoes = ordenar(promocoes);

    const antes = { base: atual.base, promocoes: promocoesEmVigor(atual.promocoes, hoje) };
    const mudancas = diferencas(antes, { base, promocoes });
    if (!mudancas.length && acao === "guardar") return { ok: true, semMudancas: true, estado: estadoEditor(atual, etag), mudancas };

    const em = new Date().toISOString();
    const novo: DocPrecos = {
      versao: atual.versao + 1,
      atualizadoEm: em,
      base,
      promocoes,
      anterior: versaoDe(atual),
      ultimaAlteracao: { id, em, acao },
    };
    const novaEtag = await a.escreverComEtag(CHAVE, novo, { etag: etag ?? null });
    if (novaEtag === null) {
      passo("preços: alguém escreveu ao mesmo tempo (ou a leitura vinha atrasada); tentar outra vez", { tentativa });
      continue;
    }
    passo("preços: guardados", { versao: novo.versao, acao, mudancas: mudancas.length });
    const email = await enviarEmail({ ...alteracaoPrecos(novo.versao, acao, mudancas), para: config.emailAlertas });
    if (!email.ok) passo("preços: o aviso ao Diogo falhou", { erro: email.erro });
    return { ok: true, estado: estadoEditor(novo, novaEtag || null), mudancas };
  }
  return { ok: false, erro: "Não conseguimos guardar agora. Espere um minuto e carregue outra vez em «Guardar».", estado: 503 };
}
