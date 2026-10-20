import type { Resposta } from "@/lib/servidor/fluxo";

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
