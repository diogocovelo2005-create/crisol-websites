import Link from "next/link";
import { notFound } from "next/navigation";
import { eNicho } from "@/lib/estados";
import { projeto as lerProjeto } from "@/lib/projetos";
import { casasDoProjeto, ficheirosDoDossie, fotosDoDossie } from "@/lib/disco";
import { Dossie } from "@/components/Interativos";

export const dynamic = "force-dynamic";

export default async function PaginaDossie({
  params,
  searchParams,
}: {
  params: Promise<{ nicho: string; slug: string }>;
  searchParams: Promise<{ casa?: string }>;
}) {
  const { nicho, slug } = await params;
  if (!eNicho(nicho)) notFound();
  const p = await lerProjeto(nicho, slug);
  if (!p) notFound();

  // Num grupo de casas, `?casa=<pasta>` mostra o dossiê de uma casa; sem ele, o do grupo.
  const casas = casasDoProjeto(nicho, slug);
  const { casa: pedida } = await searchParams;
  const casa = casas.find((c) => c.pasta === pedida)?.pasta;
  const ficheiros = ficheirosDoDossie(nicho, slug, casa);
  const fotos = fotosDoDossie(nicho, slug, casa);

  const pilula = (ativa: boolean) =>
    `rounded-full border px-3 py-1 text-[13px] ${
      ativa ? "border-tinta bg-tinta text-cartao" : "border-linha bg-cartao text-tinta-2 hover:border-tinta-3 hover:text-tinta"
    }`;

  return (
    <main className="mx-auto max-w-[860px] px-5 pb-24 pt-6">
      <Link href={`/${nicho}/${slug}`} className="text-[14px] text-tinta-2 hover:text-tinta">
        ← {p.nome}
      </Link>
      {casas.length > 0 && (
        <nav aria-label="Casas do projeto" className="mt-5 flex flex-wrap gap-2">
          <Link href={`/${nicho}/${slug}/dossie`} className={pilula(!casa)}>
            Grupo
          </Link>
          {casas.map((c) => (
            <Link key={c.pasta} href={`/${nicho}/${slug}/dossie?casa=${c.pasta}`} className={pilula(c.pasta === casa)}>
              {c.nome}
            </Link>
          ))}
        </nav>
      )}
      <div className="mt-5 rounded-xl bg-cartao p-6 shadow-cartao">
        {ficheiros.length ? (
          <Dossie key={casa ?? "grupo"} ficheiros={ficheiros} fotos={fotos} base={`/foto/${nicho}/${slug}`} />
        ) : (
          <p className="text-tinta-2">Ainda não há dossiê.</p>
        )}
      </div>
    </main>
  );
}
