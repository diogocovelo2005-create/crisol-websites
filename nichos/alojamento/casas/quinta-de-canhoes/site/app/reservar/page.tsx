import type { Metadata } from "next";
import { Foto } from "@/components/Foto";
import { Revelar } from "@/components/Revelar";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { WidgetReserva } from "@/components/WidgetReserva";
import { contactos } from "@/lib/contactos";

export const metadata: Metadata = {
  title: "Reservar",
  description:
    "Telefone, WhatsApp e email da Quinta de Canhões, em Várzea, São Pedro do Sul. Quem responde é a Teresa.",
};

const vias = [
  { etiqueta: "Telefone", ...contactos.telefone },
  { etiqueta: "Telemóvel e WhatsApp", ...contactos.telemovel },
  { etiqueta: "Email", ...contactos.email, pequeno: true },
];

export default function PaginaReservar() {
  return (
    <>
      <CabecalhoPagina
        etiqueta="Reservar"
        titulo="Venha passar uns dias"
        entrada="A maneira mais simples é ligar ou escrever. Quem responde é a Teresa, e diz-lhe logo o que há livre."
        foto="heroreservar"
        alt="Vista panorâmica do terraço da Quinta de Canhões ao nascer do sol"
      />

      <section className="bg-cal py-24 md:py-32">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10">
          <div className="grid gap-14 md:grid-cols-12 md:gap-16">
            <Revelar className="md:col-span-6">
              <div className="space-y-8">
                {vias.map((v) => (
                  <div key={v.etiqueta}>
                    <p className="etiqueta text-xisto-medio">{v.etiqueta}</p>
                    <a
                      href={v.href}
                      className={`sublinha rustico-medio mt-2 inline-block text-xisto ${
                        "pequeno" in v && v.pequeno
                          ? "break-all text-xl md:text-2xl"
                          : "text-3xl md:text-4xl"
                      }`}
                    >
                      {v.texto}
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-14 border-t border-granito-linha pt-8">
                <p className="etiqueta text-xisto-medio">Onde é</p>
                <p className="mt-4 text-corpo-grande leading-relaxed text-xisto-suave">
                  {contactos.morada.rua}
                  <br />
                  {contactos.morada.localidade}
                  <br />
                  {contactos.morada.codigo}
                </p>
                <p className="mt-5 text-sm text-xisto-medio">
                  Chega-se de carro, e o estacionamento é à porta. Viseu fica a 24
                  quilómetros e as Termas a sete minutos.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                  <a
                    href={contactos.morada.mapa}
                    target="_blank"
                    rel="noreferrer"
                    className="sublinha text-caixilho"
                  >
                    Ver no mapa
                  </a>
                  <a
                    href={contactos.booking}
                    target="_blank"
                    rel="noreferrer"
                    className="sublinha text-xisto-suave"
                  >
                    Ou reservar pelo Booking
                  </a>
                </div>
              </div>

              <p className="mt-12 border-t border-granito-linha pt-5 text-sm text-xisto-medio">
                Turismo de Habitação · Registo Nacional de Turismo 1638
              </p>
            </Revelar>

            <Revelar atraso={0.1} className="md:col-span-6">
              <figure className="relative aspect-[4/5] w-full overflow-hidden">
                <Foto
                  nome="historia"
                  alt="A casa de granito vista de baixo do jardim, entre palmeiras, laranjeiras e canteiros floridos"
                  preencher
                  sizes="(min-width: 768px) 48vw, 100vw"
                  className="object-cover"
                />
              </figure>
            </Revelar>
          </div>

          <Revelar atraso={0.2} className="mt-32 pt-16 border-t border-granito-linha">
            <div className="mb-10 text-center">
              <h3 className="rustico-medio text-3xl text-xisto md:text-4xl">
                Prefere usar o Booking.com?
              </h3>
              <p className="mt-4 text-xisto-suave text-lg max-w-2xl mx-auto">
                Pode verificar as datas livres e garantir a sua reserva automaticamente através da plataforma parceira.
              </p>
            </div>
            <WidgetReserva />
          </Revelar>

        </div>
      </section>
    </>
  );
}
