import { executarAcao } from "@/lib/servidor/fluxo";
import { comPrazo, lerJson } from "../responder";

/* Node e não edge: o envio usa SMTP (nodemailer) e node:crypto. */
export const runtime = "nodejs";

/** As ações das páginas da casa (/pedido) e do hóspede (/proposta). */
export async function POST(pedido: Request) {
  const corpo = await lerJson(pedido);
  if (!corpo) return Response.json({ ok: false, erro: "Pedido ilegível." }, { status: 400 });
  const acao = (corpo as { acao?: unknown }).acao;
  return comPrazo(`ação ${typeof acao === "string" ? acao : "?"}`, () => executarAcao(corpo));
}
