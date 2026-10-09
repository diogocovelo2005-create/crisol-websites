import fs from "node:fs";
import { caminhoProposta } from "@/lib/disco";

export async function GET(_: Request, { params }: { params: Promise<{ nicho: string; slug: string }> }) {
  const { nicho, slug } = await params;
  let ficheiro: string | null = null;
  try {
    ficheiro = caminhoProposta(nicho, slug);
  } catch {
    ficheiro = null;
  }
  if (!ficheiro) return new Response("Sem proposta", { status: 404 });
  return new Response(fs.readFileSync(ficheiro), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="proposta-${slug}.pdf"` },
  });
}
