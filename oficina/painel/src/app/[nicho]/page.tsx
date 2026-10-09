import Link from "next/link";
import { notFound } from "next/navigation";
import { COLUNAS, eNicho } from "@/lib/estados";
import { COR } from "@/lib/cores";
import { contagens, noQuadro, ordenar, projetosDoNicho, type Projeto } from "@/lib/projetos";
import { notasDoQuadro, notasDosProjetos } from "@/lib/notas";
import { Cartao } from "@/components/Cartao";
import { Topo } from "@/components/Topo";
import { AutoRefresh } from "@/components/AutoRefresh";
import { PostIts } from "@/components/PostIts";

export const dynamic = "force-dynamic";

export default async function Quadro({ params }: { params: Promise<{ nicho: string }> }) {
  const { nicho } = await params;
  if (!eNicho(nicho)) notFound();

  const [projetos, porNicho, notas] = await Promise.all([projetosDoNicho(nicho), contagens(), notasDoQuadro(nicho)]);
  const ativos = projetos.filter(noQuadro);
  const notasPorProjeto = await notasDosProjetos(ativos.map((p) => p.id));
  const semEstado = ativos.filter((p) => !p.coluna);
  const arquivados = projetos.length - ativos.length;

  const colunas: { id: string; nome: string; lista: Projeto[] }[] = [
    ...(semEstado.length ? [{ id: "sem", nome: "Sem estado", lista: semEstado }] : []),
    ...COLUNAS.map((c) => ({
      id: c.id as string,
      nome: c.nome as string,
      lista: ativos.filter((p) => p.coluna === c.id).sort(ordenar),
    })),
  ];

  return (
    <main className="relative min-h-[75vh] pb-16">
      <AutoRefresh />
      <PostIts contexto={{ nicho }} iniciais={notas} />
      <Topo ativo={nicho} contagens={porNicho} />

      <div className="mt-6 flex gap-4 overflow-x-auto px-6 pb-4 md:px-8">
        {colunas.map((c) => (
          <section key={c.id} className="w-[180px] shrink-0" aria-label={c.nome}>
            <h2 className="mb-3 flex items-center gap-2 border-t-[3px] pt-2.5 text-[14px] font-semibold" style={{ borderColor: COR[c.id] }}>
              <span style={{ color: COR[c.id] }}>{c.nome}</span>
              <span className="font-normal text-tinta-3">{c.lista.length}</span>
            </h2>
            <div className="flex flex-col gap-2.5">
              {c.lista.map((p) => (
                <Cartao key={p.id} p={p} notas={notasPorProjeto[p.id] ?? []} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {arquivados > 0 && (
        <p className="px-6 pt-4 text-[13px] md:px-8">
          <Link href={`/${nicho}/arquivo`} className="text-tinta-2 underline underline-offset-4 hover:text-tinta">
            Arquivo ({arquivados})
          </Link>
        </p>
      )}
    </main>
  );
}
