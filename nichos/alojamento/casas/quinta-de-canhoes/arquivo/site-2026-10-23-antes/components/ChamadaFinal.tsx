import { Botao } from "@/components/Botao";
import { Revelar } from "@/components/Revelar";

type Props = {
  titulo: string;
  texto?: string;
  href?: string;
  cta?: string;
};

/** Fecho das páginas interiores. Cada uma acaba a empurrar para a seguinte. */
export function ChamadaFinal({
  titulo,
  texto,
  href = "/reservar",
  cta = "Reservar",
}: Props) {
  return (
    <section className="bg-vale py-20 md:py-28">
      <div className="mx-auto max-w-[86rem] px-6 md:px-10">
        <Revelar>
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div>
              <h2 className="rustico-medio max-w-[18ch] text-titulo leading-[1.02] text-cal">
                {titulo}
              </h2>
              {texto && (
                <p className="mt-5 max-w-[44ch] leading-relaxed text-cal/75">{texto}</p>
              )}
            </div>
            <Botao href={href} variante="claro" className="shrink-0">
              {cta}
            </Botao>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
