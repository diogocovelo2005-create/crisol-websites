import type { Metadata } from "next";
import { Foto } from "@/components/Foto";
import { Revelar } from "@/components/Revelar";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { IconeInstagram, IconeWhatsapp } from "@/components/IconeWhatsapp";
import { contactos, linkWhatsapp } from "@/lib/contactos";
import { FormularioReserva } from "@/components/reserva/FormularioReserva";
import { SINAL_PERCENTAGEM } from "@/lib/reserva";

export const metadata: Metadata = {
  title: "Reservar",
  description:
    `Escolha as datas e o quarto e faça o pedido à Quinta de Canhões, em Várzea, São Pedro do Sul. Confirmamos a disponibilidade e a reserva fica feita com um sinal de ${SINAL_PERCENTAGEM} %.`,
};

const horarios = [
  { etiqueta: "Check-in", valor: "15h00 – 21h00" },
  { etiqueta: "Check-out", valor: "Até às 11h00" },
  { etiqueta: "Animais", valor: "Até 8 kg, gratuitos" },
];

const vantagens = [
  {
    titulo: "Um preço que se combina aqui",
    texto: "Sem plataformas pelo meio, a conversa sobre o preço é outra. Pergunte.",
  },
  {
    titulo: "Condições que não estão anunciadas",
    texto: "Há épocas e estadias com condições que não aparecem em lado nenhum.",
  },
  {
    titulo: "Uma estadia à sua medida",
    texto: "A hora de chegada, as camas juntas, o seu cão: combina-se tudo numa conversa.",
  },
];

export default function PaginaReservar() {
  return (
    <>
      <CabecalhoPagina
        etiqueta="Reservar"
        titulo="Venha passar uns dias"
        entrada={`Escolha as datas e o quarto e faça o pedido aqui. Confirmamos a disponibilidade e, para ficar reservado, paga apenas um sinal de ${SINAL_PERCENTAGEM} %.`}
        foto="reservar-hero"
        nota="Prefere falar? O telefone e o WhatsApp estão logo abaixo."
        alt="A piscina da Quinta de Canhões entre o relvado, as espreguiçadeiras e a ramada da casa"
      />

      <section className="bg-cal pt-20 md:pt-28" aria-labelledby="titulo-pedido">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10">
          <div className="mb-12 grid items-end gap-6 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-7">
              <p className="etiqueta text-xisto-suave">Pedido de reserva</p>
              <h2 id="titulo-pedido" className="rustico-medio mt-4 text-titulo leading-[1.04] text-xisto">
                Escolha as datas e o quarto
              </h2>
            </div>
            <p className="max-w-[44ch] leading-relaxed text-xisto-suave md:col-span-5">
              Agora não paga nada. A reserva fica confirmada quando a casa disser que há lugar e o sinal
              de {SINAL_PERCENTAGEM} % chegar.
            </p>
          </div>
          <FormularioReserva />
        </div>
      </section>

      <section className="border-t border-granito-linha bg-cal py-24 md:py-32">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10">
          <Revelar>
            <p className="etiqueta text-xisto-suave">Prefere falar com a Teresa?</p>
            <h2 className="rustico-medio mt-4 max-w-[34ch] text-subtitulo leading-tight text-xisto">
              Ligue ou escreva: ela diz-lhe logo o que há livre.
            </h2>
          </Revelar>
          <div className="mt-12 grid gap-14 md:grid-cols-12 md:gap-16">
            <Revelar className="md:col-span-6">
              <p className="etiqueta text-xisto-medio">WhatsApp</p>
              <a
                href={linkWhatsapp()}
                target="_blank"
                rel="noreferrer"
                className="botao mt-4 inline-flex items-center gap-4 border border-caixilho bg-caixilho px-9 py-5 text-lg text-cal md:text-xl"
              >
                <IconeWhatsapp className="h-6 w-6 shrink-0" />
                Escrever pelo WhatsApp
              </a>
              <p className="mt-3 flex items-center gap-2 text-sm text-xisto-medio">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3f8f55]" />
                {contactos.resposta}
              </p>

              <div className="mt-12">
                <p className="etiqueta text-xisto-medio">Ou ligue</p>
                <a
                  href={contactos.telemovel.href}
                  className="sublinha rustico-medio mt-2 inline-block text-3xl text-xisto md:text-4xl"
                >
                  {contactos.telemovel.texto}
                </a>
              </div>

              <div className="mt-10">
                <p className="etiqueta text-xisto-medio">Instagram</p>
                <a
                  href={contactos.instagram.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-3 inline-flex items-center gap-3.5 text-xl text-xisto transition-colors hover:text-caixilho md:text-2xl"
                >
                  <IconeInstagram className="h-7 w-7 shrink-0" />
                  <span className="sublinha">{contactos.instagram.texto}</span>
                </a>
              </div>

              <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-granito-linha pt-6">
                {horarios.map((h) => (
                  <div key={h.etiqueta}>
                    <dt className="etiqueta text-xisto-medio">{h.etiqueta}</dt>
                    <dd className="mt-2 text-sm leading-snug text-xisto md:text-base">{h.valor}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-granito-linha pt-6 text-xs text-xisto-medio">
                <li>
                  Fixo{" "}
                  <a href={contactos.telefone.href} className="sublinha text-xisto-suave">
                    {contactos.telefone.texto}
                  </a>
                </li>
                <li>
                  <a href={contactos.email.href} className="sublinha break-all text-xisto-suave">
                    {contactos.email.texto}
                  </a>
                </li>
                <li>
                  <a
                    href={contactos.booking}
                    target="_blank"
                    rel="noreferrer"
                    className="sublinha text-xisto-suave"
                  >
                    Booking
                  </a>
                </li>
              </ul>
            </Revelar>

            <Revelar atraso={0.1} className="md:col-span-6">
              <div className="bg-vale px-7 py-10 text-cal sm:px-10 md:px-12 md:py-14">
                <p className="etiqueta text-cal/70">Porquê falar connosco</p>
                <h2 className="rustico-medio mt-4 max-w-[18ch] text-3xl leading-[1.08] md:text-4xl">
                  Quem reserva com a Teresa fica mais perto da casa
                </h2>
                <ul className="mt-10 divide-y divide-cal/15 border-t border-cal/15">
                  {vantagens.map((v) => (
                    <li key={v.titulo} className="py-6">
                      <p className="rustico-medio text-xl leading-snug">{v.titulo}</p>
                      <p className="mt-2 max-w-[42ch] leading-relaxed text-cal/75">{v.texto}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Revelar>
          </div>
        </div>
      </section>

      <section className="border-t border-granito-linha bg-cal py-20 md:py-28">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10">
          <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
            <Revelar className="md:col-span-5">
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
              <div className="mt-6 text-sm">
                <a
                  href={contactos.morada.mapa}
                  target="_blank"
                  rel="noreferrer"
                  className="sublinha text-caixilho"
                >
                  Ver no mapa
                </a>
              </div>
              <p className="mt-12 border-t border-granito-linha pt-5 text-sm text-xisto-medio">
                Turismo de Habitação · Registo Nacional de Turismo 1638
              </p>
            </Revelar>

            <Revelar atraso={0.1} className="md:col-span-7">
              <figure className="relative aspect-[4/3] w-full overflow-hidden">
                <Foto
                  nome="historia"
                  alt="A casa de granito vista de baixo do jardim, entre palmeiras, laranjeiras e canteiros floridos"
                  preencher
                  sizes="(min-width: 768px) 56vw, 100vw"
                  className="object-cover"
                />
              </figure>
            </Revelar>
          </div>
        </div>
      </section>
    </>
  );
}
