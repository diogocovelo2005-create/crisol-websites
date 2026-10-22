import { hojeEmPortugal } from "@/lib/reserva";
import { listarRegistos, ocupacaoDe } from "@/lib/servidor/reservas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* As noites ocupadas no nosso calendário (de hoje em diante), por tipo de quarto. Sem dados pessoais. */
export async function GET() {
  const hoje = hojeEmPortugal();
  const o = ocupacaoDe(await listarRegistos());
  const noites = Object.fromEntries(Object.entries(o).filter(([d]) => d >= hoje));
  return Response.json({ noites }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } });
}
