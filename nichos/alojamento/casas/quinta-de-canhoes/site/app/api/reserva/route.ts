import { receberPedido } from "@/lib/servidor/fluxo";
import { lerJson, responder } from "./responder";

/* Node e não edge: o envio usa SMTP (nodemailer) e node:crypto. */
export const runtime = "nodejs";

/** Recebe o pedido do formulário de /reservar. */
export async function POST(pedido: Request) {
  const corpo = await lerJson(pedido);
  if (!corpo) return Response.json({ ok: false, erro: "Pedido ilegível." }, { status: 400 });
  try {
    return responder(await receberPedido(corpo));
  } catch (e) {
    console.error("[reserva]", e);
    return Response.json({ ok: false, erro: "Erro no servidor." }, { status: 500 });
  }
}
