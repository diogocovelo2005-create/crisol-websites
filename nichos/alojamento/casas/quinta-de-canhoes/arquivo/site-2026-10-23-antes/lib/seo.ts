import type { Metadata } from "next";

/** O domínio publicado. Os canonical, o og:url e o sitemap usam sempre este. */
export const SITE = "https://quintadecanhoes.com";

const IMAGEM = { url: "/og.jpg", width: 1200, height: 630, alt: "A Quinta de Canhões sobre o vale do Vouga, em São Pedro do Sul" };

/** Título, descrição, canonical, Open Graph e Twitter de uma página indexável. */
export function metadados({ titulo, descricao, caminho, absoluto = false }: { titulo: string; descricao: string; caminho: string; absoluto?: boolean }): Metadata {
  const tituloCompleto = absoluto ? titulo : `${titulo} — Quinta de Canhões`;
  return {
    title: absoluto ? { absolute: titulo } : titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      title: tituloCompleto,
      description: descricao,
      url: caminho,
      siteName: "Quinta de Canhões",
      locale: "pt_PT",
      type: "website",
      images: [IMAGEM],
    },
    twitter: { card: "summary_large_image", title: tituloCompleto, description: descricao, images: [IMAGEM.url] },
  };
}
