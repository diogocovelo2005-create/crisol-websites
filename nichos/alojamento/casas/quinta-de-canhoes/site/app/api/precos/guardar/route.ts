import { lerJson, responder } from "@/app/api/reserva/responder";
import { registarArmazem } from "@/lib/servidor/armazem";
import { passo } from "@/lib/servidor/diagnostico";
import { guardarPrecos } from "@/lib/servidor/precos";

export const runtime = "nodejs";

/** O editor dos preços: guardar ou desfazer (com o link assinado). */
export async function POST(pedido: Request) {
  registarArmazem();
  const corpo = await lerJson(pedido);
  if (!corpo) return Response.json({ ok: false, erro: "Pedido ilegível." }, { status: 400 });
  try {
    return responder(await guardarPrecos(corpo));
  } catch (e) {
    passo("preços: guardar: ERRO", { erro: (e as Error).message });
    return Response.json({ ok: false, erro: "Não conseguimos guardar agora. Espere um minuto e tente outra vez." }, { status: 500 });
  }
}
