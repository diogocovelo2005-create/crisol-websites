import { lerTabela } from "@/lib/servidor/precos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Os preços em vigor (de todos os dias e promoções), para o formulário. Sem cache: a casa muda-os quando quer. */
export async function GET() {
  const t = await lerTabela();
  return Response.json(t, { headers: { "Cache-Control": "no-store" } });
}
