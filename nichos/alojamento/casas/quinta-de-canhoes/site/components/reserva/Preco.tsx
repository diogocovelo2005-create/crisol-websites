"use client";

import { useEffect, useState } from "react";
import { NOME_PADRAO, TABELA_PADRAO, normalizarTabela, type CampoBase, type TabelaPrecos } from "@/lib/precos";
import { euros, gruposDeNoites, type PrecoNoite } from "@/lib/reserva";

/*
  Os preços no browser: um só pedido a /api/precos por página, partilhado
  pelo formulário e pelos preços soltos (os de /os-quartos). Enquanto não
  chega, valem os de origem; se falhar, também (o servidor confere o total).
*/
let pedido: Promise<TabelaPrecos> | null = null;

export function carregarPrecos(denovo = false): Promise<TabelaPrecos> {
  if (!pedido || denovo) {
    pedido = fetch("/api/precos", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j ? normalizarTabela(j) : TABELA_PADRAO))
      .catch(() => TABELA_PADRAO);
  }
  return pedido;
}

/** A tabela em vigor e uma forma de a pedir outra vez. */
export function usePrecos(): [TabelaPrecos, () => Promise<TabelaPrecos>] {
  const [t, setT] = useState<TabelaPrecos>(TABELA_PADRAO);
  useEffect(() => {
    let vivo = true;
    carregarPrecos().then((x) => vivo && setT(x));
    return () => {
      vivo = false;
    };
  }, []);
  const recarregar = () =>
    carregarPrecos(true).then((x) => {
      setT(x);
      return x;
    });
  return [t, recarregar];
}

/** Um preço de todos os dias solto num texto («8€»), sempre o que está em vigor. */
export function PrecoAoVivo({ campo, espaco = false }: { campo: CampoBase; espaco?: boolean }) {
  const [t] = usePrecos();
  return <>{`${t.base[campo]}${espaco ? " " : ""}€`}</>;
}

/*
  O preço antigo riscado, discreto: mais pequeno e na cor suave, antes do
  preço novo. Para quem usa leitor de ecrã, diz-se por palavras.
*/
export function Riscado({ antes, className = "text-xisto-suave" }: { antes: number; className?: string }) {
  return (
    <>
      <span className="sr-only">preço normal </span>
      <s className={`mr-1.5 decoration-1 ${className}`}>{euros(antes)}</s>
      <span className="sr-only">, com promoção </span>
    </>
  );
}

/** «3 noites × 97 €», ou com promoção em parte: «1 noite × 97 € + 2 noites × ~~97 €~~ 80 €». */
export function NoitesPrecos({ lista, quantidade = 1 }: { lista: PrecoNoite[]; quantidade?: number }) {
  const grupos = gruposDeNoites(lista);
  return (
    <>
      {grupos.map((g, i) => (
        <span key={i}>
          {i > 0 && " + "}
          {g.n} {g.n === 1 ? "noite" : "noites"} × {g.promo && g.promo !== NOME_PADRAO ? `${g.promo} · ` : ""}
          {g.antes !== undefined && <Riscado antes={g.antes} />}
          {euros(g.preco)}
        </span>
      ))}
      {quantidade > 1 ? ` × ${quantidade}` : ""}
    </>
  );
}
