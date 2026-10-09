import Link from "next/link";
import { Foto } from "./Foto";
import { EsconderCartao } from "./Interativos";
import { PilhaNotas } from "./PilhaNotas";
import { precisaDeTi, type Projeto } from "@/lib/projetos";
import type { Nota } from "@/lib/notas-comum";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function dataCurta(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${MESES[Number(m) - 1]}`;
}

// Pequeno de propósito: foto e nome. O resto está na página do projeto.
// As notas deste AL ficam presas por baixo, numa pilha que se abre ao clicar.
export function Cartao({ p, notas }: { p: Projeto; notas?: Nota[] }) {
  const atrasado = precisaDeTi(p);

  return (
    <div className="group relative">
      <div data-projeto-id={p.id} className="relative rounded-lg transition-shadow data-[alvo-nota]:ring-2 data-[alvo-nota]:ring-tinta data-[alvo-nota]:ring-offset-2 data-[alvo-nota]:ring-offset-fundo">
        <Link
          href={`/${p.nicho}/${p.slug}`}
          title={atrasado ? "Precisa de ti" : undefined}
          className="relative block overflow-hidden rounded-lg bg-cartao shadow-cartao transition-shadow duration-200 hover:shadow-cartao-hover"
        >
          <Foto nicho={p.nicho} slug={p.slug} nome={p.nome} temFoto={p.temFoto} className="aspect-[3/2]" />
          <h3 className="truncate px-2.5 py-2 text-[13px] font-semibold">{p.nome}</h3>
          {atrasado && (
            <span aria-label="Precisa de ti" className="absolute right-2 top-2 size-3 rounded-full bg-alerta ring-2 ring-cartao" />
          )}
        </Link>
        <EsconderCartao id={{ nicho: p.nicho, slug: p.slug }} nome={p.nome} />
      </div>
      {notas && <PilhaNotas projetoId={p.id} nicho={p.nicho} nome={p.nome} iniciais={notas} />}
    </div>
  );
}
