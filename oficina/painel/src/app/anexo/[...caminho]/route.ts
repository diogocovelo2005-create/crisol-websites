import { db } from "@/lib/supabase";

// O bucket "notas" é privado; isto pede um link assinado com a chave de
// serviço e redireciona para lá.
export async function GET(_: Request, { params }: { params: Promise<{ caminho: string[] }> }) {
  const { caminho } = await params;
  const alvo = caminho.map(decodeURIComponent).join("/");
  const { data, error } = await db.storage.from("notas").createSignedUrl(alvo, 60);
  if (error || !data) return new Response("Não encontrado", { status: 404 });
  return Response.redirect(data.signedUrl);
}
