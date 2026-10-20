import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { AcoesPedido } from "@/components/reserva/AcoesPedido";
import { Bilhete, Etiquetas } from "@/components/reserva/BilhetePedido";
import { FaixaTopo } from "@/components/reserva/ResumoPedido";
import { POLITICA_SINAL, SINAL_PERCENTAGEM, dataCurta, descreverGrupo, euros, grupoDoPedido, type PedidoReserva } from "@/lib/reserva";
import { verificar } from "@/lib/servidor/assinatura";
import type { DadosCasa } from "@/lib/servidor/fluxo";

export const metadata: Metadata = {
  title: "Pedido de reserva",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/*
  A página da casa para um pedido (quem lê é a Teresa, muitas vezes no
  telemóvel). O pedido vem todo no link, assinado.

  Ordem: o essencial num relance (bilhete, etiquetas, total e sinal) →
  responder → o cliente → os detalhes. No computador, «Responder» fica
  ao lado, preso ao topo.
*/
export default async function PaginaPedido({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const v = verificar<DadosCasa>("casa", token);
  if (!v.ok) return <LinkInvalido expirado={v.motivo === "expirado"} />;
  const { pedido: p, fase, aceite } = v.dados;

  const estado =
    fase === "confirmado"
      ? { texto: "À espera do sinal", cor: "bg-[#e7a598] text-xisto" }
      : aceite
        ? { texto: "Aceitou novas datas · por confirmar", cor: "bg-cal text-xisto" }
        : { texto: "Novo pedido · por responder", cor: "bg-cal text-xisto" };

  return (
    <>
      <section className="bg-vale pb-10 pt-28 text-cal md:pb-12 md:pt-32">
        <div className="mx-auto max-w-[86rem] px-6 md:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`etiqueta rounded-full px-3 py-1.5 text-[0.62rem] ${estado.cor}`}>{estado.texto}</span>
            {p.referencia && <span className="etiqueta text-[0.62rem] text-cal/70">Referência {p.referencia}</span>}
          </div>
          <h1 className="rustico mt-4 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">{p.hospede.nome}</h1>
          <p className="mt-2 text-corpo-grande text-cal/80">
            {dataCurta(p.estadia.chegada)} → {dataCurta(p.estadia.saida)} · {p.casaInteira ? "a casa inteira · " : ""}{descreverGrupo(grupoDoPedido(p))}
          </p>
        </div>
      </section>

      <section className="bg-cal pb-20 pt-8 md:pt-12">
        <div className="mx-auto grid max-w-[86rem] gap-8 px-6 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-12">
          {/* 1 · o essencial */}
          <div className="space-y-5 lg:col-start-1 lg:row-start-1">
            <Bilhete pedido={p} titulo={aceite ? "As novas datas" : "A estadia pedida"} />
            <Etiquetas pedido={p} />
            <Valores pedido={p} />
          </div>

          {/* 2 · responder */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-6">
              <p className="etiqueta mb-3 text-xisto-suave">Responder</p>
              <AcoesPedido token={token} fase={fase} pedido={p} />
            </div>
          </div>

          {/* 3 · o cliente e os detalhes */}
          <div className="space-y-5 lg:col-start-1 lg:row-start-2">
            <Cliente pedido={p} />
            <Detalhes pedido={p} />
          </div>
        </div>
      </section>
    </>
  );
}

function Valores({ pedido: p }: { pedido: PedidoReserva }) {
  return (
    <div className="grid grid-cols-2 border border-granito-linha border-t-[3px] border-t-caixilho bg-white/60">
      <div className="px-5 py-5 sm:px-6">
        <p className="etiqueta text-[0.62rem] text-xisto-suave">Total da estadia</p>
        <p className="rustico mt-1 text-[clamp(2rem,4.4vw,2.8rem)] leading-none text-xisto">{p.total !== null ? euros(p.total) : "A indicar"}</p>
        <p className="mt-2 text-sm text-xisto-suave">
          {p.estadia.noites} {p.estadia.noites === 1 ? "noite" : "noites"}
          {p.pequenoAlmoco.incluido ? ` · pequeno-almoço ${euros(p.pequenoAlmoco.subtotal)}` : ""}
        </p>
      </div>
      <div className="border-l border-granito-linha px-5 py-5 sm:px-6">
        <p className="etiqueta text-[0.62rem] text-caixilho">Sinal de {SINAL_PERCENTAGEM} %</p>
        <p className="rustico mt-1 text-[clamp(2rem,4.4vw,2.8rem)] leading-none text-caixilho">{p.sinal.valor !== null ? euros(p.sinal.valor) : `${SINAL_PERCENTAGEM} %`}</p>
        <p className="mt-2 text-sm text-xisto-suave">
          Restante {p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"}, {p.restante.quando}
        </p>
      </div>
      <p className="col-span-2 border-t border-granito-linha px-5 py-3 text-[0.85rem] leading-snug text-xisto-suave sm:px-6">
        <strong className="font-medium text-xisto">Cancelamento:</strong> {POLITICA_SINAL}
      </p>
    </div>
  );
}

function linkWhatsappCliente(p: PedidoReserva) {
  let n = p.hospede.telefone.replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  else if (n.startsWith("00")) n = n.slice(2);
  else if (n.length === 9) n = `351${n}`;
  const texto = `Olá ${p.hospede.nome.trim().split(/\s+/)[0]}, daqui fala a Quinta de Canhões, sobre o seu pedido de reserva para ${dataCurta(p.estadia.chegada)} → ${dataCurta(p.estadia.saida)}.`;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

function Cliente({ pedido: p }: { pedido: PedidoReserva }) {
  const h = p.hospede;
  const tel = h.telefone.replace(/[^\d+]/g, "");
  const botao = "premir inline-flex items-center gap-2 border px-4 py-2.5 text-[0.92rem] transition-colors";
  return (
    <div className="border border-granito-linha bg-white/60 px-5 py-5 sm:px-6">
      <p className="etiqueta text-[0.62rem] text-xisto-suave">O cliente</p>
      <p className="rustico-medio mt-1 text-[1.5rem] leading-tight text-xisto">{h.nome}</p>
      <div className="mt-2 flex flex-col gap-1 text-[1.02rem] sm:flex-row sm:flex-wrap sm:gap-x-6">
        <a href={`tel:${tel}`} className="sublinha w-fit text-caixilho">
          {h.telefone}
        </a>
        <a href={`mailto:${h.email}`} className="sublinha w-fit break-all text-caixilho">
          {h.email}
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`tel:${tel}`} className={`${botao} border-xisto/25 text-xisto hover:border-xisto`}>
          <Phone size={16} /> Ligar
        </a>
        <a href={linkWhatsappCliente(p)} target="_blank" rel="noreferrer" className={`${botao} border-vale bg-vale text-cal hover:bg-vale-claro`}>
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href={`mailto:${h.email}`} className={`${botao} border-xisto/25 text-xisto hover:border-xisto`}>
          <Mail size={16} /> Email
        </a>
      </div>
      {h.mensagem && (
        <blockquote className="mt-5 whitespace-pre-line border-l-2 border-caixilho pl-4 text-[0.95rem] leading-relaxed text-xisto-suave">«{h.mensagem}»</blockquote>
      )}
    </div>
  );
}

function Detalhes({ pedido: p }: { pedido: PedidoReserva }) {
  const n = `${p.estadia.noites} ${p.estadia.noites === 1 ? "noite" : "noites"}`;
  const linhas: [string, string][] = [];
  if (p.casaInteira) linhas.push(["A casa inteira", p.casaInteira.subtotal !== null ? euros(p.casaInteira.subtotal) : "a indicar"]);
  for (const l of p.quartos) {
    const preco = l.precosPorNoite[0]?.preco;
    linhas.push([`${l.quantidade > 1 ? `${l.quantidade} × ` : ""}${l.nome} · ${n}${preco ? ` × ${euros(preco)}` : ""}`, euros(l.subtotal)]);
  }
  linhas.push([
    p.pequenoAlmoco.incluido ? `Pequeno-almoço · ${p.pequenoAlmoco.pessoas ?? p.pessoas} ${(p.pequenoAlmoco.pessoas ?? p.pessoas) === 1 ? "adulto" : "adultos"} × ${n} × ${euros(p.pequenoAlmoco.porPessoaNoite)}` : "Pequeno-almoço",
    p.pequenoAlmoco.incluido ? euros(p.pequenoAlmoco.subtotal) : "não incluído",
  ]);
  if (p.camaSuplementar && !p.camaSuplementar.incluidaNaCasa) {
    const c = p.camaSuplementar;
    linhas.push([
      `Cama suplementar · ${c.criancas} ${c.criancas === 1 ? "criança" : "crianças"} (3–10) × ${n} × ${euros(c.porNoite)}`,
      euros(c.subtotal),
    ]);
  }
  linhas.push(["Total", p.total !== null ? euros(p.total) : "a indicar"]);
  return (
    <div className="px-1 text-sm text-xisto-suave">
      <p className="etiqueta mb-2 text-[0.6rem]">As contas</p>
      <ul className="border-t border-granito-linha">
        {linhas.map(([a, b]) => (
          <li key={a} className="flex justify-between gap-4 border-b border-granito-linha py-1.5">
            <span>{a}</span>
            <span className="shrink-0">{b}</span>
          </li>
        ))}
      </ul>

    </div>
  );
}

function LinkInvalido({ expirado }: { expirado: boolean }) {
  return (
    <FaixaTopo
      etiqueta="Pedido de reserva"
      titulo={expirado ? "Este link já expirou" : "Este link não é válido"}
      texto={
        expirado
          ? "Os links dos emails valem durante algum tempo. Se precisar, responda ao email do pedido."
          : "Pode ter ficado cortado ao copiar. Abra-o outra vez a partir do email."
      }
    />
  );
}
