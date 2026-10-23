import Image from "next/image";
import type { ReactNode } from "react";
import { BedDouble, Coffee, Landmark, PawPrint, Smartphone, Users } from "lucide-react";
import { fotos } from "@/lib/fotos";
import { animalDoPedido, textoAnimal, deIso, descreverGrupo, descreverPedido, grupoDoPedido, quartos, type PedidoReserva } from "@/lib/reserva";

/*
  As peças visuais de um pedido, na linguagem dos emails: o bilhete de
  chegada e saída (dia em grande, noites ao centro) com a foto do quarto, e
  as etiquetas do que se pediu. Para a página da casa e a do hóspede.
*/

const fmt = (v: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-PT", o).format(deIso(v)!);

export function fotoDoPedido(p: PedidoReserva) {
  if (p.casaInteira) return { src: fotos["casa-fachada"].src, alt: "A fachada de granito da Quinta de Canhões" };
  const q = quartos.find((x) => x.id === p.quartos[0]?.tipo) ?? quartos[0];
  return { src: q.foto, alt: q.alt, foco: q.foco };
}

function Lado({ rotulo, v, hora, direita = false }: { rotulo: string; v: string; hora: string; direita?: boolean }) {
  return (
    <div className={direita ? "text-right" : ""}>
      <p className="etiqueta text-[0.62rem] text-[#e7a598]">{rotulo}</p>
      <p className="rustico mt-1 text-[3.4rem] leading-none sm:text-[4rem]">{fmt(v, { day: "numeric" })}</p>
      <p className="rustico-medio mt-1 text-[1.1rem]">{fmt(v, { month: "long" })}</p>
      <p className="mt-0.5 text-[0.85rem] leading-snug text-cal/70">
        {fmt(v, { weekday: "long" })}
        <br />
        {hora}
      </p>
    </div>
  );
}

/** Chegada · noites · saída, num bloco verde do vale; com ou sem foto em cima. */
export function Bilhete({ pedido: p, foto = true, titulo, rodape, compacto = false }: { pedido: PedidoReserva; foto?: boolean; titulo?: string; rodape?: ReactNode; compacto?: boolean }) {
  const f = fotoDoPedido(p);
  return (
    <div className="overflow-hidden">
      {foto && (
        <div className={`relative w-full overflow-hidden bg-granito ${compacto ? "aspect-[3/1]" : "aspect-[5/2]"}`}>
          <Image src={f.src} alt={f.alt} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" style={{ objectPosition: f.foco ?? "50% 60%" }} />
        </div>
      )}
      <div className="border-t-[3px] border-caixilho bg-vale px-5 py-5 text-cal sm:px-7 sm:py-6">
        {titulo && <p className="rustico-medio mb-3 text-[1.25rem]">{titulo}</p>}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Lado rotulo="Chegada" v={p.estadia.chegada} hora="desde as 15h" />
          <div className="flex h-full flex-col items-center justify-center border-x border-dashed border-cal/30 px-4 sm:px-7">
            <span className="rustico text-[2rem] leading-none text-[#e7a598]">{p.estadia.noites}</span>
            <span className="etiqueta mt-1 text-[0.58rem] text-cal/70">{p.estadia.noites === 1 ? "noite" : "noites"}</span>
          </div>
          <Lado rotulo="Saída" v={p.estadia.saida} hora="até às 11h" direita />
        </div>
        {rodape && <div className="mt-5 border-t border-cal/15 pt-4">{rodape}</div>}
      </div>
    </div>
  );
}

/** O que se pediu, em etiquetas com ícone. */
export function Etiquetas({ pedido: p }: { pedido: PedidoReserva }) {
  const animal = animalDoPedido(p);
  const itens: [ReactNode, string, boolean?, boolean?][] = [
    [<BedDouble key="q" size={17} />, descreverPedido(p)],
    [<Users key="p" size={17} />, descreverGrupo(grupoDoPedido(p))],
    [<Coffee key="c" size={17} />, p.pequenoAlmoco.incluido ? "Com pequeno-almoço" : "Sem pequeno-almoço", !p.pequenoAlmoco.incluido],
    [p.pagamento === "mbway" ? <Smartphone key="m" size={17} /> : <Landmark key="t" size={17} />, p.pagamento === "mbway" ? "MB WAY" : "Transferência"],
    ...(animal === "pequeno" ? ([[<PawPrint key="a" size={17} />, "Animal até 8 kg (gratuito)"]] as [ReactNode, string][]) : []),
    ...(animal === "grande"
      ? ([[<PawPrint key="a" size={17} />, p.animalDecisao ? textoAnimal(p)! : "Animal com mais de 8 kg · a decidir", false, !p.animalDecisao]] as [ReactNode, string, boolean, boolean][])
      : []),
  ];
  return (
    <ul className="flex flex-wrap gap-2">
      {itens.map(([icone, texto, apagado, alerta]) => (
        <li
          key={texto}
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.92rem] ${
            alerta ? "border-caixilho bg-caixilho font-medium text-cal" : apagado ? "border-granito-linha text-xisto-suave" : "border-xisto/20 bg-white/60 text-xisto"
          }`}
        >
          <span className={alerta ? "text-cal" : apagado ? "text-xisto-suave" : "text-caixilho"}>{icone}</span>
          {texto}
        </li>
      ))}
    </ul>
  );
}
