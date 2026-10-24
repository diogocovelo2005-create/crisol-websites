import { esc, etiqueta, montar, paragrafo, pequeno, type SemDestino } from "@/lib/servidor/modelo-email";

/*
  O email dos preços, no modelo único dos emails das reservas: ao Diogo,
  o que mudou a cada alteração. Nunca leva a chave nem o link do editor.
*/

/** Ao Diogo: o que mudou nos preços. */
export function alteracaoPrecos(versao: number, acao: "guardar" | "desfazer", mudancas: string[]): SemDestino {
  const titulo = acao === "desfazer" ? "Alteração desfeita" : "Alterados pela casa";
  const lista = mudancas.length ? mudancas : ["(sem diferenças nos preços em vigor)"];
  return montar({
    assunto: `Reservas - Preços (versão ${versao}) - ${titulo}`,
    previa: lista.slice(0, 2).join(" · "),
    rotulo: "Preços do site",
    frase: acao === "desfazer" ? "A última alteração aos preços foi desfeita." : "Os preços do site mudaram.",
    corpo:
      etiqueta("O que mudou", "24px 0 8px") +
      lista.map((l) => paragrafo(esc(l), "6px 0 0")).join("") +
      pequeno(`Versão ${versao}. Os pedidos já feitos mantêm o preço com que foram feitos.`, "22px 0 0"),
    texto: `${titulo} (versão ${versao})\n\n${lista.map((l) => `- ${l}`).join("\n")}\n\nOs pedidos já feitos mantêm o preço com que foram feitos.`,
  });
}
