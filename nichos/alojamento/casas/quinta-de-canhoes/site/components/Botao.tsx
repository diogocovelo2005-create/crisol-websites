import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "cheio" | "vivo" | "contorno" | "claro" | "texto";

const estilos: Record<Variante, string> = {
  // O hover dos botões (fica branco e cresce um pouco) vive na classe .botao,
  // em globals.css, para ser igual em todo o site.
  cheio: "botao bg-caixilho text-cal border border-caixilho",
  /** Vermelho mais vivo, para fundos escuros. */
  vivo: "botao bg-caixilho-claro text-cal border border-caixilho-claro",
  contorno: "botao border border-caixilho text-caixilho",
  claro: "botao border border-cal/55 text-cal",
  texto: "border-b border-current pb-1 text-caixilho transition-opacity duration-300 hover:opacity-70",
};

type Props = ComponentProps<typeof Link> & {
  variante?: Variante;
  /** Mostra a seta que indica que se vai para outro sítio. */
  seta?: boolean;
  /** Versão mais contida, para onde o botão não deve dominar. */
  pequeno?: boolean;
};

export function Botao({
  variante = "contorno",
  seta = true,
  pequeno = false,
  className = "",
  children,
  ...resto
}: Props) {
  const caixa =
    variante === "texto" ? "" : pequeno ? "px-6 py-3" : "px-8 py-4";

  return (
    <Link
      {...resto}
      className={`group inline-flex items-center ${
        pequeno ? "gap-2.5 text-[0.85rem]" : "gap-3 text-base"
      } ${caixa} ${estilos[variante]} ${className}`}
    >
      {children}
      {seta && (
        <svg
          viewBox="0 0 20 12"
          aria-hidden="true"
          className="h-2.5 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        >
          <path
            d="M0 6h18M13 1l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      )}
    </Link>
  );
}
