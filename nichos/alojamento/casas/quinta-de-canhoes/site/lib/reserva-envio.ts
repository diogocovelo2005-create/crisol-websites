import type { PedidoReserva } from "@/lib/reserva";

export type RespostaEnvio = { ok: true; referencia: string } | { ok: false; erro: string; ocupado?: boolean; precosMudaram?: boolean };

/*
  O único ponto de saída do pedido: envia-o a /api/reserva (Route Handler,
  que no Netlify corre como função). O servidor valida, refaz as contas com
  lib/reserva.ts e manda os emails; ver lib/servidor/fluxo.ts.

  `antiSpam`: o campo escondido (deve ir vazio) e a hora a que o formulário
  abriu (um envio em poucos segundos não é de uma pessoa).
*/
export async function enviarPedido(
  pedido: PedidoReserva,
  antiSpam: { armadilha: string; abertoEm: number },
): Promise<RespostaEnvio> {
  try {
    const r = await fetch("/api/reserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedido, ...antiSpam }),
    });
    const corpo = await r.json().catch(() => null);
    if (r.ok && corpo?.ok) return { ok: true, referencia: corpo.referencia };
    return { ok: false, erro: corpo?.erro ?? "Não conseguimos enviar o pedido.", ocupado: corpo?.ocupado === true, precosMudaram: corpo?.precosMudaram === true };
  } catch {
    return { ok: false, erro: "Não conseguimos enviar o pedido." };
  }
}
