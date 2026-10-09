import fs from "node:fs";
import path from "node:path";
import { fotoDeCapa } from "@/lib/disco";

const TIPOS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(_: Request, { params }: { params: Promise<{ nicho: string; slug: string }> }) {
  const { nicho, slug } = await params;
  let ficheiro: string | null = null;
  try {
    ficheiro = fotoDeCapa(nicho, slug);
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
  if (!ficheiro) return new Response("Sem foto", { status: 404 });
  const corpo = fs.readFileSync(ficheiro);
  return new Response(corpo, {
    headers: {
      "Content-Type": TIPOS[path.extname(ficheiro).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
