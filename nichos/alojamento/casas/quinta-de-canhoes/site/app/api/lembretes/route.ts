import { createHmac, timingSafeEqual } from "node:crypto";
import { segredo } from "@/lib/servidor/config";
import { executarLembretes } from "@/lib/servidor/lembretes";

export const runtime = "nodejs";

/*
  Chamada pela função agendada do Netlify (netlify/functions/lembretes.mts),
  com o cabeçalho x-lembretes = HMAC-SHA256("lembretes", SEGREDO_RESERVAS).
  Para testar em casa: LEMBRETES_SEM_AUTENTICACAO=1 ao arrancar o servidor.
*/
export async function POST(pedido: Request) {
  const livre = process.env.LEMBRETES_SEM_AUTENTICACAO === "1";
  if (!livre) {
    const esperado = createHmac("sha256", segredo()).update("lembretes").digest();
    const recebido = Buffer.from(pedido.headers.get("x-lembretes") ?? "", "hex");
    if (recebido.length !== esperado.length || !timingSafeEqual(recebido, esperado)) return new Response("Não autorizado", { status: 401 });
  }
  try {
    return Response.json(await executarLembretes());
  } catch (e) {
    console.error("[reserva] lembretes", e);
    return Response.json({ erro: "Falhou" }, { status: 500 });
  }
}
