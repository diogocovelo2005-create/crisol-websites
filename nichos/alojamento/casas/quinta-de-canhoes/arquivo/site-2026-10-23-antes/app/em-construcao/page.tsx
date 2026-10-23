import type { Metadata } from "next";
import { Botao } from "@/components/Botao";
import { Revelar } from "@/components/Revelar";

export const metadata: Metadata = {
  title: "Em construção",
  robots: { index: false, follow: false },
};

/**
 * O lugar onde param, por agora, as ligações para as páginas que ainda não
 * estão feitas. Só o aviso e o caminho de volta: não é uma página de
 * conteúdo e não deve prometer nada que ainda não exista.
 */
export default function PaginaEmConstrucao() {
  return (
    <section className="flex min-h-[100svh] items-center justify-center bg-cal-fundo px-6 pt-24 pb-16">
      <Revelar className="text-center">
        <h1 className="rustico text-titulo leading-[1.05] text-xisto">Em construção</h1>

        <div className="mt-10">
          <Botao href="/" variante="contorno">
            Voltar à entrada
          </Botao>
        </div>
      </Revelar>
    </section>
  );
}
