import { Foto } from "@/components/Foto";
import type { NomeFoto } from "@/lib/fotos";

type Props = {
  etiqueta: string;
  titulo: string;
  entrada?: string;
  foto: NomeFoto;
  alt: string;
};

export function CabecalhoPagina({ etiqueta, titulo, entrada, foto, alt }: Props) {
  return (
    <section className="relative flex min-h-[64svh] items-end overflow-hidden pt-24">
      <Foto
        nome={foto}
        alt={alt}
        preencher
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-xisto/82 via-xisto/34 to-xisto/48" />

      <div className="relative mx-auto w-full max-w-[86rem] px-6 pb-14 md:px-10 md:pb-20">
        <p className="etiqueta mb-5 text-cal/70">{etiqueta}</p>
        <h1 className="rustico max-w-[14ch] text-titulo leading-[1.0] text-cal">
          {titulo}
        </h1>
        {entrada && (
          <p className="mt-7 max-w-[46ch] text-corpo-grande leading-relaxed text-cal/85">
            {entrada}
          </p>
        )}
      </div>
    </section>
  );
}
