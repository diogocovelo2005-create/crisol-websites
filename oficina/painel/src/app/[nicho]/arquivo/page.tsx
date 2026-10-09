import Link from "next/link";
import { notFound } from "next/navigation";
import { NICHOS, eNicho } from "@/lib/estados";
import { noQuadro, projetosDoNicho } from "@/lib/projetos";
import { Foto } from "@/components/Foto";
import { MostrarCartao } from "@/components/Interativos";

export const dynamic = "force-dynamic";

export default async function Arquivo({ params }: { params: Promise<{ nicho: string }> }) {
  const { nicho } = await params;
  if (!eNicho(nicho)) notFound();
  const fora = (await projetosDoNicho(nicho)).filter((p) => !noQuadro(p));

  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-6">
      <Link href={`/${nicho}`} className="text-[14px] text-tinta-2 hover:text-tinta">
        ← {NICHOS.find((n) => n.id === nicho)!.nome}
      </Link>
      <h1 className="mt-4 text-[28px] font-bold">Arquivo</h1>

      {fora.length ? (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {fora.map((p) => (
            <div key={p.id}>
              <Link href={`/${nicho}/${p.slug}`} className="block overflow-hidden rounded-lg bg-cartao shadow-cartao hover:shadow-cartao-hover">
                <Foto nicho={nicho} slug={p.slug} nome={p.nome} temFoto={p.temFoto} className="aspect-[3/2] grayscale" />
                <div className="px-2.5 py-2">
                  <h2 className="truncate text-[13px] font-semibold">{p.nome}</h2>
                  <p className="truncate text-[12px] text-tinta-2">
                    {p.coluna === "fim" ? (p.motivo_fim ?? p.estadoAtual) : "Tirado do quadro"}
                  </p>
                </div>
              </Link>
              {p.oculto_em && (
                <div className="mt-2">
                  <MostrarCartao id={{ nicho, slug: p.slug }} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-tinta-2">Vazio.</p>
      )}
    </main>
  );
}
