import { receberPedido } from "@/lib/servidor/fluxo";
import { comPrazo, lerJson } from "./responder";

/* Node e não edge: o envio usa SMTP (nodemailer) e node:crypto. */
export const runtime = "nodejs";

/** Recebe o pedido do formulário de /reservar. */
export async function POST(pedido: Request) {
  const corpo = await lerJson(pedido);
  if (!corpo) return Response.json({ ok: false, erro: "Pedido ilegível." }, { status: 400 });
  return comPrazo("pedido do site", () => receberPedido(corpo));
}
