import type { Resposta } from "@/lib/servidor/fluxo";
import { registarArmazem } from "@/lib/servidor/armazem";
import { passo } from "@/lib/servidor/diagnostico";

/** Lê o JSON do pedido (com limite de tamanho) e responde com o estado certo. */
export async function lerJson(pedido: Request): Promise<unknown | null> {
  const texto = await pedido.text();
  if (texto.length > 60000) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export function responder(r: Resposta) {
  if (r.ok) return Response.json(r);
  const { estado, ...corpo } = r;
  return Response.json(corpo, { status: estado ?? 500 });
}

/** Prazo total de uma rota: abaixo do corte das funções do Netlify (~30 s). */
export const PRAZO_TOTAL_MS = 20000;

/*
  Corre o trabalho com prazo total. Se passar do prazo (ou rebentar), responde
  com um erro normal, que o formulário mostra com o link do WhatsApp, em vez de
  um 502/504 genérico do Netlify.
*/
export async function comPrazo(nome: string, trabalho: () => Promise<Resposta>): Promise<Response> {
  const t0 = Date.now();
  passo(`${nome}: início`);
  registarArmazem();
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<Resposta>((resolver) => {
    temporizador = setTimeout(
      () => resolver({ ok: false, erro: "Não conseguimos enviar o pedido.", estado: 503, prazo: true }),
      PRAZO_TOTAL_MS,
    );
  });
  try {
    const r = await Promise.race([trabalho(), limite]);
    passo(`${nome}: fim`, { ms: Date.now() - t0, ok: r.ok, ...(r.ok ? {} : { erro: r.erro, prazo: !!(r as { prazo?: boolean }).prazo }) });
    return responder(r);
  } catch (e) {
    passo(`${nome}: ERRO`, { ms: Date.now() - t0, erro: (e as Error).message });
    console.error("[reserva]", e);
    return Response.json({ ok: false, erro: "Não conseguimos enviar o pedido." }, { status: 500 });
  } finally {
    clearTimeout(temporizador);
  }
}
