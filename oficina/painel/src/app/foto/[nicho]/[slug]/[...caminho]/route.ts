import fs from "node:fs";
import path from "node:path";
import { caminhoFotoDoDossie } from "@/lib/disco";

// Uma foto do dossiê: /foto/<nicho>/<slug>/<pasta>/<ficheiro>.

const TIPOS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ nicho: string; slug: string; caminho: string[] }> },
) {
  const { nicho, slug, caminho } = await params;
  let ficheiro: string | null = null;
  try {
    ficheiro = caminhoFotoDoDossie(nicho, slug, caminho.map(decodeURIComponent).join("/"));
  } catch {
    ficheiro = null;
  }
  if (!ficheiro) return new Response("Não encontrado", { status: 404 });
  return new Response(fs.readFileSync(ficheiro), {
    headers: {
      "Content-Type": TIPOS[path.extname(ficheiro).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
