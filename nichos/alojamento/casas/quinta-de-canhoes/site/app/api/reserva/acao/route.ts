import { executarAcao } from "@/lib/servidor/fluxo";
import { lerJson, responder } from "../responder";

/* Node e não edge: o envio usa SMTP (nodemailer) e node:crypto. */
export const runtime = "nodejs";

/** As ações das páginas da casa (/pedido) e do hóspede (/proposta). */
export async function POST(pedido: Request) {
  const corpo = await lerJson(pedido);
  if (!corpo) return Response.json({ ok: false, erro: "Pedido ilegível." }, { status: 400 });
  try {
    return responder(await executarAcao(corpo));
  } catch (e) {
    console.error("[reserva]", e);
    return Response.json({ ok: false, erro: "Erro no servidor." }, { status: 500 });
  }
}
