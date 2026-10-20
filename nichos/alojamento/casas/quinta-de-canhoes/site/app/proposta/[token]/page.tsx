import type { Metadata } from "next";
import Image from "next/image";
import { AceitarProposta } from "@/components/reserva/AceitarProposta";
import { Etiquetas, fotoDoPedido } from "@/components/reserva/BilhetePedido";
import { FaixaTopo } from "@/components/reserva/ResumoPedido";
import { dataCurta, descreverPedido, recalcularPedido, type PedidoReserva } from "@/lib/reserva";
import { verificar } from "@/lib/servidor/assinatura";
import type { DadosProposta } from "@/lib/servidor/fluxo";

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
  const v = verificar<DadosProposta>("proposta", token);
  if (!v.ok) {
    return (
      <FaixaTopo
        etiqueta="O seu pedido"
        titulo={v.motivo === "expirado" ? "Este link já expirou" : "Este link não é válido"}
        texto="Responda ao nosso email, ou faça um novo pedido no site."
      />
    );
  }
  const { pedido, alternativas, nota } = v.dados;
  const recalculadas = alternativas.map((a) => recalcularPedido(pedido, a));
  const nome = pedido.hospede.nome.trim().split(/\s+/)[0];

  return (
    <>
      <FaixaTopo
        etiqueta="O seu pedido"
        titulo={`${nome}, escolha as datas`}
        texto={`Para ${dataCurta(pedido.estadia.chegada)} → ${dataCurta(pedido.estadia.saida)} já não havia lugar. Para ${pedido.casaInteira ? "a casa inteira" : descreverPedido(pedido)}, propomos-lhe estas datas.`}
      />
      <section className="bg-cal py-14 md:py-20">
        <div className="mx-auto max-w-[52rem] px-6 md:px-10">
          <FotoPedido pedido={pedido} />
          {nota && <p className="mb-8 whitespace-pre-line border-l-2 border-caixilho pl-4 text-corpo-grande leading-relaxed text-xisto">{nota}</p>}
          <AceitarProposta token={token} alternativas={recalculadas} inicial={Number(alt ?? 0) || 0} />
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
