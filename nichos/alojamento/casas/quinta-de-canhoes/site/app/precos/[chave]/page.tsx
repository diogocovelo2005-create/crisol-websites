import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaPrivada } from "@/components/ForaDaPaginaPrivada";
import { EditorPrecos } from "@/components/precos/EditorPrecos";
import { FaixaTopo } from "@/components/reserva/ResumoPedido";
import { hojeEmPortugal } from "@/lib/reserva";
import { chaveValida, estadoEditor, lerDoc } from "@/lib/servidor/precos";

export const dynamic = "force-dynamic";

/* Só com a chave certa: com outra, nem o título passa para o 404 (seria uma pista). */
export async function generateMetadata({ params }: { params: Promise<{ chave: string }> }): Promise<Metadata> {
  const { chave } = await params;
  // O título de um 404 qualquer do site.
  if (!(await chaveValida(chave))) return { title: { absolute: "Quinta de Canhões — Turismo rural em São Pedro do Sul" } };
  return {
    title: "Os preços do site",
    robots: { index: false, follow: false, nocache: true },
    // A chave vai no endereço: não pode sair em referrers.
    referrer: "no-referrer",
  };
}

/*
  O editor privado dos preços da D. Teresa: /precos/<chave>. Só existe com a
  chave certa (comparada com o hash guardado no armazém); com outra qualquer,
  ou sem chave guardada, é o 404 normal do site. Fora do sitemap e do
  robots.txt (lá revelava o caminho). Troca-se a chave com
  scripts/chave-precos.mjs.
*/
export default async function PaginaEditorPrecos({ params }: { params: Promise<{ chave: string }> }) {
  const { chave } = await params;
  if (!(await chaveValida(chave))) notFound();
  const { doc, etag } = await lerDoc();
  return (
    <>
      <PaginaPrivada />
      <FaixaTopo
        etiqueta="Preços da casa"
        titulo="Os preços do site"
        texto="Mude o que precisar e carregue em «Guardar». Os pedidos que já chegaram ficam com o preço com que foram feitos."
      />
      <EditorPrecos chave={chave} inicial={estadoEditor(doc, etag)} hoje={hojeEmPortugal()} />
    </>
  );
}
