import { readFile } from "node:fs/promises";
import path from "node:path";
import { PASTA_EMAILS } from "@/lib/servidor/email";

/* Só em desenvolvimento: devolve um email gravado em .emails/. */
export async function GET(_pedido: Request, { params }: { params: Promise<{ ficheiro: string }> }) {
  if (process.env.NODE_ENV !== "development") return new Response("Não encontrado", { status: 404 });
  const nome = path.basename(decodeURIComponent((await params).ficheiro));
  if (!/\.(html|txt)$/.test(nome)) return new Response("Não encontrado", { status: 404 });
  try {
    const conteudo = await readFile(path.join(PASTA_EMAILS, nome), "utf8");
    return new Response(conteudo, { headers: { "Content-Type": `${nome.endsWith(".html") ? "text/html" : "text/plain"}; charset=utf-8` } });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
