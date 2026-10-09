import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "cheio" | "contorno" | "claro" | "texto";

const estilos: Record<Variante, string> = {
  cheio:
    "bg-caixilho text-cal border border-caixilho hover:bg-transparent hover:text-caixilho",
  contorno:
    "border border-caixilho text-caixilho hover:bg-caixilho hover:text-cal",
  claro:
    "border border-cal/45 text-cal hover:border-cal hover:bg-cal hover:text-xisto",
  texto: "border-b border-current pb-1 text-caixilho hover:opacity-70",
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
    variante === "texto" ? "" : pequeno ? "px-5 py-2.5" : "px-7 py-3.5";

  return (
    <Link
      {...resto}
      className={`group inline-flex items-center transition-colors duration-300 ${
        pequeno ? "gap-2.5 text-[0.8rem]" : "gap-3 text-sm"
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
