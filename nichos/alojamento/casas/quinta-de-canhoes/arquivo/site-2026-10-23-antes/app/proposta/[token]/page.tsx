import type { Metadata } from "next";
import Image from "next/image";
import { AceitarProposta } from "@/components/reserva/AceitarProposta";
import { Bilhete, Etiquetas, fotoDoPedido } from "@/components/reserva/BilhetePedido";
import { FaixaTopo } from "@/components/reserva/ResumoPedido";
import { dataCurta, type PedidoReserva } from "@/lib/reserva";
import { registoDoLink } from "@/lib/servidor/fluxo";
import { quandoTxt } from "@/lib/servidor/reservas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Outras datas",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/* A página do hóspede com as alternativas que a casa propôs. */
export default async function PaginaProposta({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ alt?: string }>;
}) {
  const { token } = await params;
  const { alt } = await searchParams;
  const l = await registoDoLink("hospede", token);
  if ("erro" in l) {
    return (
      <FaixaTopo
        etiqueta="O seu pedido"
        titulo={l.erro === "expirado" ? "Este link já expirou" : "Este link não é válido"}
        texto="Responda ao nosso email, ou faça um novo pedido no site."
      />
    );
  }
  const r = l.registo;
  const original = r.original ?? r.pedido;
  const nome = original.hospede.nome.trim().split(/\s+/)[0];
  const aceite = r.proposta?.aceite;
  const aberta = r.estado === "proposta" && r.proposta && !aceite;

  if (!aberta) {
    const escolhida = aceite ? r.proposta!.alternativas[aceite.indice] : null;
    return (
      <>
        <FaixaTopo
          etiqueta={`O seu pedido · ${r.ref}`}
          titulo={escolhida ? `${nome}, já escolheu as datas` : `${nome}, este pedido já foi tratado`}
          texto={
            escolhida
              ? `Escolheu ${dataCurta(escolhida.estadia.chegada)} → ${dataCurta(escolhida.estadia.saida)} a ${quandoTxt(aceite!.em)}. Confirmamos a disponibilidade e enviamos-lhe por email os dados para o sinal.`
              : "Já não há datas por escolher neste pedido. Se precisar de alguma coisa, responda ao nosso email."
          }
        />
        {escolhida && (
          <section className="bg-cal py-14 md:py-20">
            <div className="mx-auto max-w-[52rem] px-6 md:px-10">
              <Bilhete pedido={escolhida} titulo="As datas que escolheu" />
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <FaixaTopo
        etiqueta={`O seu pedido · ${r.ref}`}
        titulo={`${nome}, escolha as datas`}
        texto={`Para ${dataCurta(original.estadia.chegada)} → ${dataCurta(original.estadia.saida)} já não havia lugar. Propomos-lhe estas alternativas; escolha uma.`}
      />
      <section className="bg-cal py-14 md:py-20">
        <div className="mx-auto max-w-[52rem] px-6 md:px-10">
          <FotoPedido pedido={original} />
          {r.proposta!.nota && <p className="mb-8 whitespace-pre-line border-l-2 border-caixilho pl-4 text-corpo-grande leading-relaxed text-xisto">{r.proposta!.nota}</p>}
          <AceitarProposta token={token} alternativas={r.proposta!.alternativas} inicial={Number(alt ?? 0) || 0} />
          <p className="mt-10 border-t border-granito-linha pt-5 text-[0.95rem] text-xisto-suave">
            Nenhuma serve? Responda ao nosso email e vemos outra.
          </p>
        </div>
      </section>
    </>
  );
}

/* A foto do que pediu e as etiquetas, antes das propostas. */
function FotoPedido({ pedido }: { pedido: PedidoReserva }) {
  const f = fotoDoPedido(pedido);
  return (
    <div className="mb-8">
      <div className="relative aspect-[5/2] w-full overflow-hidden bg-granito">
        <Image src={f.src} alt={f.alt} fill sizes="(min-width: 860px) 760px, 100vw" className="object-cover" style={{ objectPosition: f.foco ?? "50% 60%" }} />
      </div>
      <div className="mt-4">
        <Etiquetas pedido={pedido} />
      </div>
    </div>
  );
}
