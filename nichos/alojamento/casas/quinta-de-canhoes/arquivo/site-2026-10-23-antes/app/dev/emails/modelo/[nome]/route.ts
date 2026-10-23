import { MODELOS, paraBrowser } from "@/lib/servidor/exemplos-email";

/* Só em desenvolvimento: um email com dados de exemplo (?texto para a versão em texto). */
export async function GET(pedido: Request, { params }: { params: Promise<{ nome: string }> }) {
  if (process.env.NODE_ENV !== "development") return new Response("Não encontrado", { status: 404 });
  const m = MODELOS[(await params).nome];
  if (!m) return new Response("Não encontrado", { status: 404 });
  const e = m.email();
  if (new URL(pedido.url).searchParams.has("texto")) return new Response(`Assunto: ${e.assunto}\n\n${e.texto}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(paraBrowser(e), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
