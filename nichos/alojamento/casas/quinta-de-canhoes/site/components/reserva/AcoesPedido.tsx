"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, LoaderCircle, MessageCircle, X } from "lucide-react";
import { Calendario } from "@/components/reserva/FormularioReserva";
import {
  SINAL_PERCENTAGEM,
  dataCurta,
  deIso,
  descreverPedido,
  euros,
  hojeEmPortugal,
  iso,
  recalcularPedido,
  type TabelaPrecos,
  type Alternativa,
  type PedidoReserva,
} from "@/lib/reserva";

/*
  As ações da casa sobre um pedido (/pedido/[token]). O estado vive no
  servidor: a página mostra só as ações possíveis no estado atual, e um botão
  já usado (aqui ou noutro sítio) responde com o que aconteceu, sem repetir.
*/

type Estado = { fase: "parado" | "a-enviar" | "enviado" | "erro"; hora?: string; erro?: string };
const PARADO: Estado = { fase: "parado" };
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

type RespostaAcao = { ok: boolean; erro?: string; conflitos?: { ref: string; estado: string }[]; devolver?: number };

async function agir(corpo: Record<string, unknown>): Promise<RespostaAcao> {
  try {
    const r = await fetch("/api/reserva/acao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(() => null);
    if (r.ok && j?.ok) return j;
    return { ok: false, erro: j?.erro ?? "Não foi possível enviar.", conflitos: j?.conflitos };
  } catch {
    return { ok: false, erro: "Sem ligação. Tente outra vez." };
  }
}

const agora = () => new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date());

export type SugestaoCliente = { rotulo: string; alternativa: Alternativa; pedido: PedidoReserva };

export function AcoesPedido({
  token,
  estado,
  pedido,
  conflitos,
  sugestoes,
  prazoSinal,
  devolucao,
  whatsapp,
  proposta,
  tabela,
}: {
  token: string;
  estado: "novo" | "proposta" | "confirmado" | "pago" | "recusado" | "cancelado" | "expirado";
  pedido: PedidoReserva;
  conflitos: string[];
  sugestoes: SugestaoCliente[];
  prazoSinal: string | null;
  devolucao: { dias: number; devolver: number } | null;
  whatsapp: string | null;
  proposta: { alternativas: PedidoReserva[]; aceite: number | null } | null;
  /** Os preços em vigor (para as datas marcadas à mão). */
  tabela?: TabelaPrecos;
}) {
  const router = useRouter();
  const [painel, setPainel] = useState<"nenhum" | "datas" | "recusar">("nenhum");

  /** Corre uma ação e, se correr bem, volta a ler a página (o estado novo vem do servidor). */
  const correr = async (corpo: Record<string, unknown>, set: (e: Estado) => void) => {
    set({ fase: "a-enviar" });
    const r = await agir({ token, ...corpo });
    if (!r.ok) {
      set({ fase: "erro", erro: r.erro });
      return r;
    }
    set({ fase: "enviado", hora: agora() });
    setTimeout(() => router.refresh(), 900);
    return r;
  };

  if (estado === "novo")
    return (
      <div className="space-y-6">
        <Confirmar pedido={pedido} conflitos={conflitos} correr={correr} />
        <Cartao etiqueta="Ou" titulo="Não há lugar?">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.95rem]">
            <button type="button" onClick={() => setPainel(painel === "datas" ? "nenhum" : "datas")} className="premir border border-xisto/40 px-5 py-3 text-xisto transition-colors hover:border-xisto" aria-expanded={painel === "datas"}>
              Não há estas datas
            </button>
            <button type="button" onClick={() => setPainel(painel === "recusar" ? "nenhum" : "recusar")} className="sublinha text-sm text-xisto-suave" aria-expanded={painel === "recusar"}>
              Recusar o pedido
            </button>
          </div>
          {painel === "datas" && <PropostaDatas pedido={pedido} sugestoes={sugestoes} correr={correr} tabela={tabela} />}
          {painel === "recusar" && <Recusar correr={correr} />}
        </Cartao>
      </div>
    );

  if (estado === "proposta")
    return (
      <div className="space-y-6">
        <Cartao etiqueta="À espera do hóspede" titulo="Propusemos outras datas">
          <ul className="space-y-2 text-[0.95rem] text-xisto">
            {proposta?.alternativas.map((a, i) => (
              <li key={i} className="border-b border-granito-linha pb-2">
                {dataCurta(a.estadia.chegada)} → {dataCurta(a.estadia.saida)} · {descreverPedido(a)} · {a.total !== null ? euros(a.total) : "a indicar"}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-xisto-suave">Quando o hóspede escolher uma, recebe um email e este pedido volta a «por confirmar».</p>
          <div className="mt-5">
            <button type="button" onClick={() => setPainel(painel === "recusar" ? "nenhum" : "recusar")} className="sublinha text-sm text-xisto-suave">
              Recusar o pedido
            </button>
            {painel === "recusar" && <Recusar correr={correr} />}
          </div>
        </Cartao>
      </div>
    );

  if (estado === "confirmado") return <Confirmado pedido={pedido} prazoSinal={prazoSinal} whatsapp={whatsapp} correr={correr} />;

  if (estado === "pago" && devolucao) return <Pago pedido={pedido} devolucao={devolucao} correr={correr} />;

  return (
    <Cartao etiqueta="Fechado" titulo="Não há mais nada a fazer">
      <p className="text-[0.98rem] text-xisto-suave">Este pedido já não tem ações. As noites dele estão livres no calendário.</p>
    </Cartao>
  );
}

type Correr = (corpo: Record<string, unknown>, set: (e: Estado) => void) => Promise<RespostaAcao>;

/* ---------------- confirmar ---------------- */

function Confirmar({ pedido, conflitos, correr }: { pedido: PedidoReserva; conflitos: string[]; correr: Correr }) {
  const [estado, setEstado] = useState<Estado>(PARADO);
  const [ajustar, setAjustar] = useState(false);
  const [total, setTotal] = useState(pedido.total !== null ? String(pedido.total) : "");
  const [motivo, setMotivo] = useState("");
  const [conflitoVisto, setConflitoVisto] = useState<string[]>(conflitos);

  const totalNum = Math.round(Number(total.replace(",", ".")));
  const semPreco = pedido.total === null;
  const usarTotal = ajustar || semPreco;
  const sinalNovo = usarTotal && totalNum > 0 ? Math.ceil((totalNum * SINAL_PERCENTAGEM) / 100) : pedido.sinal.valor;
  const falta = usarTotal && !(totalNum > 0) ? "Indique o total" : null;
  const forcar = conflitoVisto.length > 0;

  const confirmar = async () => {
    const r = await correr(
      { acao: "confirmar", ...(usarTotal ? { total: totalNum, motivo } : {}), ...(forcar ? { forcar: true } : {}) },
      setEstado,
    );
    if (!r.ok && r.conflitos?.length) setConflitoVisto(r.conflitos.map((c) => `${c.ref} (${c.estado})`));
  };

  return (
    <Cartao etiqueta="1 · Há lugar?" titulo="Confirmar a disponibilidade">
      <p className="text-[0.98rem] leading-relaxed text-xisto-suave">
        O hóspede recebe os dados para pagar o sinal de {SINAL_PERCENTAGEM} %{sinalNovo !== null ? ` (${euros(sinalNovo)})` : ""} por{" "}
        {pedido.pagamento === "mbway" ? "MB WAY" : "transferência"}. E a si chega um lembrete para fechar estas noites no Booking.
      </p>


      <div className="mt-5">
        {!semPreco && (
          <label className="flex items-center gap-2.5 text-[0.95rem] text-xisto">
            <input type="checkbox" checked={ajustar} onChange={(e) => setAjustar(e.target.checked)} className="size-4 accent-[#7a2b2b]" />
            Ajustar o total ({pedido.total !== null ? euros(pedido.total) : ""})
          </label>
        )}
        {usarTotal && (
          <div className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr]">
            <label className="block">
              <span className="etiqueta text-[0.6rem] text-xisto-suave">Novo total (€)</span>
              <input
                inputMode="numeric"
                value={total}
                onChange={(e) => setTotal(e.target.value.replace(/[^\d,.]/g, ""))}
                className="mt-1 block h-11 w-full border border-granito-linha bg-white/55 px-3 focus:border-xisto focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="etiqueta text-[0.6rem] text-xisto-suave">Motivo (opcional, segue para o hóspede)</span>
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Por exemplo: desconto por ficar uma semana"
                className="mt-1 block h-11 w-full border border-granito-linha bg-white/55 px-3 focus:border-xisto focus:outline-none"
              />
            </label>
            {totalNum > 0 && (
              <p className="text-sm text-xisto sm:col-span-2">
                Sinal de {SINAL_PERCENTAGEM} %: <strong className="font-medium">{euros(sinalNovo!)}</strong> · restante {euros(totalNum - sinalNovo!)}
              </p>
            )}
          </div>
        )}
      </div>

      {forcar && (
        <p role="alert" className="mt-5 border-l-[3px] border-caixilho bg-white/60 px-3 py-2 text-[0.92rem] text-xisto">
          Estas noites já estão ocupadas por {conflitoVisto.join(", ")}. Se confirmar, fica com reservas a mais nessas noites.
        </p>
      )}
      <BotaoAcao estado={estado} desligado={!!falta || estado.fase === "enviado"} aoPremir={confirmar} textoEnviado="Confirmado">
        {falta ?? (forcar ? "Confirmar mesmo assim" : "Confirmar disponibilidade")}
      </BotaoAcao>
    </Cartao>
  );
}

/* ---------------- à espera do sinal ---------------- */

function Confirmado({ pedido, prazoSinal, whatsapp, correr }: { pedido: PedidoReserva; prazoSinal: string | null; whatsapp: string | null; correr: Correr }) {
  const [sinal, setSinal] = useState<Estado>(PARADO);
  const [naoChegou, setNaoChegou] = useState<Estado>(PARADO);
  const [certeza, setCerteza] = useState(false);
  return (
    <div className="space-y-6">
      <Cartao etiqueta="2 · O sinal" titulo="Quando o sinal chegar">
        <p className="text-[0.98rem] leading-relaxed text-xisto-suave">
          Confira no banco {pedido.sinal.valor !== null ? `os ${euros(pedido.sinal.valor)} ` : ""}com «Reserva {pedido.referencia}»
          {prazoSinal ? `, até ${prazoSinal}` : ""}. Ao carregar, o hóspede recebe a confirmação da reserva.
        </p>
        <BotaoAcao estado={sinal} desligado={sinal.fase === "enviado"} aoPremir={() => correr({ acao: "sinal" }, setSinal)} textoEnviado="Reserva confirmada ao hóspede">
          Recebi o sinal
        </BotaoAcao>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noreferrer" className="premir mt-4 inline-flex items-center gap-2 border border-vale bg-vale px-4 py-2.5 text-[0.92rem] text-cal hover:bg-vale-claro">
            <MessageCircle size={16} /> Enviar os dados por WhatsApp
          </a>
        )}
        <p className="mt-2 text-sm text-xisto-suave">Para quando o email cai no spam ou volta para trás: abre o WhatsApp do hóspede com os dados do pagamento já escritos.</p>
      </Cartao>
      <Cartao etiqueta="Se não pagar" titulo="O sinal não chegou">
        <p className="text-[0.95rem] text-xisto-suave">Cancela o pedido, liberta as noites e avisa o hóspede com educação.</p>
        {!certeza ? (
          <button type="button" onClick={() => setCerteza(true)} className="premir mt-4 border border-xisto/40 px-5 py-3 text-[0.95rem] text-xisto hover:border-xisto">
            O sinal não chegou
          </button>
        ) : (
          <BotaoAcao estado={naoChegou} desligado={naoChegou.fase === "enviado"} aoPremir={() => correr({ acao: "sinalNaoChegou" }, setNaoChegou)} textoEnviado="Pedido cancelado" secundario>
            Sim, cancelar e avisar o hóspede
          </BotaoAcao>
        )}
      </Cartao>
    </div>
  );
}

/* ---------------- reserva paga ---------------- */

function Pago({ pedido, devolucao, correr }: { pedido: PedidoReserva; devolucao: { dias: number; devolver: number }; correr: Correr }) {
  const [estado, setEstado] = useState<Estado>(PARADO);
  const [certeza, setCerteza] = useState(false);
  return (
    <Cartao etiqueta="Reserva paga" titulo="Cancelar a reserva">
      <p className="text-[0.98rem] leading-relaxed text-xisto-suave">
        Faltam {devolucao.dias} dias para a chegada.{" "}
        {devolucao.devolver > 0 ? (
          <>
            Pela política (até 10 dias antes), devolve metade do sinal: <strong className="font-medium text-xisto">{euros(devolucao.devolver)}</strong>.
          </>
        ) : (
          <>Como faltam menos de 10 dias, o sinal{pedido.sinal.valor !== null ? ` (${euros(pedido.sinal.valor)})` : ""} não é devolvido.</>
        )}{" "}
        O hóspede recebe um email com este valor e as noites ficam livres.
      </p>
      {!certeza ? (
        <button type="button" onClick={() => setCerteza(true)} className="premir mt-4 border border-xisto/40 px-5 py-3 text-[0.95rem] text-xisto hover:border-xisto">
          Cancelar reserva
        </button>
      ) : (
        <BotaoAcao estado={estado} desligado={estado.fase === "enviado"} aoPremir={() => correr({ acao: "cancelarReserva" }, setEstado)} textoEnviado="Reserva cancelada" secundario>
          Sim, cancelar ({devolucao.devolver > 0 ? `devolver ${euros(devolucao.devolver)}` : "sem devolução"})
        </BotaoAcao>
      )}
    </Cartao>
  );
}

/* ---------------- peças ---------------- */

function Cartao({ etiqueta, titulo, children }: { etiqueta: string; titulo: string; children: ReactNode }) {
  return (
    <div className="border border-granito-linha bg-white/45 px-6 py-7 sm:px-8">
      <p className="etiqueta text-caixilho">{etiqueta}</p>
      <h2 className="rustico-medio mt-2 text-[1.6rem] leading-tight text-xisto">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function BotaoAcao({
  estado,
  desligado,
  aoPremir,
  children,
  textoEnviado,
  secundario = false,
}: {
  estado: Estado;
  desligado?: boolean;
  aoPremir: () => void;
  children: ReactNode;
  textoEnviado: string;
  secundario?: boolean;
}) {
  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={desligado || estado.fase === "a-enviar"}
        onClick={aoPremir}
        className={`botao inline-flex items-center gap-2.5 border px-7 py-4 text-[0.98rem] disabled:pointer-events-none ${
          secundario ? "border-caixilho text-caixilho" : "border-caixilho bg-caixilho text-cal"
        } disabled:border-granito-linha disabled:bg-granito/60 disabled:text-xisto-suave`}
      >
        {estado.fase === "a-enviar" ? (
          <>
            <LoaderCircle size={16} className="animate-spin" /> A enviar
          </>
        ) : estado.fase === "enviado" ? (
          `${textoEnviado} · às ${estado.hora}`
        ) : (
          children
        )}
      </button>
      {estado.fase === "erro" && (
        <p role="alert" className="mt-3 text-sm font-medium text-caixilho">
          {estado.erro}
        </p>
      )}
    </div>
  );
}

/* «Não há estas datas»: as sugestões do nosso calendário e, à mão, outras datas. Até três. */
function PropostaDatas({ pedido, sugestoes, correr, tabela }: { pedido: PedidoReserva; sugestoes: SugestaoCliente[]; correr: Correr; tabela?: TabelaPrecos }) {
  const [hoje, setHoje] = useState<Date | null>(null);
  const [mes, setMes] = useState<{ ano: number; mes: number } | null>(null);
  const [entrada, setEntrada] = useState<Date | null>(null);
  const [previa, setPrevia] = useState<Date | null>(null);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [manuais, setManuais] = useState<Alternativa[]>([]);
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState<Estado>(PARADO);

  useEffect(() => {
    const h = deIso(hojeEmPortugal())!;
    const c = deIso(pedido.estadia.chegada)!;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o dia só existe no browser
    setHoje(h);
    const base = c > h ? c : h;
    setMes({ ano: base.getFullYear(), mes: base.getMonth() });
  }, [pedido.estadia.chegada]);

  const total = marcadas.length + manuais.length;
  const cheio = total >= 3;
  const enviado = estado.fase === "enviado";

  const escolher = (d: Date) => {
    if (cheio || enviado) return;
    if (!entrada || d <= entrada) {
      setEntrada(d);
      return;
    }
    setManuais((a) => [...a, { chegada: iso(entrada), saida: iso(d) }]);
    setEntrada(null);
    setPrevia(null);
  };

  const enviar = () => correr({ acao: "alternativas", alternativas: [...marcadas.map((i) => sugestoes[i].alternativa), ...manuais], nota }, setEstado);

  const linha = (p: PedidoReserva) =>
    `${p.estadia.noites} ${p.estadia.noites === 1 ? "noite" : "noites"} · ${descreverPedido(p)} · total ${p.total !== null ? euros(p.total) : "a indicar"} · sinal ${
      p.sinal.valor !== null ? euros(p.sinal.valor) : `${SINAL_PERCENTAGEM} %`
    } · restante ${p.restante.valor !== null ? euros(p.restante.valor) : "a indicar"}`;

  return (
    <div className="mt-6 border-t border-granito-linha pt-6">
      <p className="etiqueta text-xisto-suave">Sugestões do nosso calendário</p>
      {sugestoes.length === 0 ? (
        <p className="mt-2 text-sm text-xisto-suave">Não encontrámos datas livres próximas com o mesmo pedido. Marque à mão no calendário abaixo.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sugestoes.map((s, i) => {
            const on = marcadas.includes(i);
            return (
              <li key={i}>
                <label className={`flex cursor-pointer items-start gap-3 border px-4 py-3 ${on ? "border-caixilho bg-white/70" : "border-granito-linha bg-white/40"}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={enviado || (!on && cheio)}
                    onChange={() => setMarcadas((m) => (on ? m.filter((x) => x !== i) : [...m, i]))}
                    className="mt-1 size-4 accent-[#7a2b2b]"
                  />
                  <span>
                    <span className="etiqueta block text-[0.58rem] text-caixilho">{s.rotulo}</span>
                    <span className="rustico-medio block text-[1.1rem] text-xisto">
                      {dataCurta(s.pedido.estadia.chegada)} → {dataCurta(s.pedido.estadia.saida)}
                    </span>
                    <span className="block text-sm text-xisto-suave">{linha(s.pedido)}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <p className="etiqueta mt-7 text-xisto-suave">Ou marque à mão (os mesmos quartos)</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="rustico-medio text-[1.3rem] text-xisto">{mes ? `${MESES[mes.mes][0].toUpperCase()}${MESES[mes.mes].slice(1)} ${mes.ano}` : " "}</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Mês anterior"
            disabled={!mes || !hoje || (mes.ano === hoje.getFullYear() && mes.mes === hoje.getMonth())}
            onClick={() => mes && setMes(mes.mes === 0 ? { ano: mes.ano - 1, mes: 11 } : { ano: mes.ano, mes: mes.mes - 1 })}
            className="premir grid size-10 place-items-center rounded-full border border-xisto/35 disabled:opacity-35"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Mês seguinte"
            onClick={() => mes && setMes(mes.mes === 11 ? { ano: mes.ano + 1, mes: 0 } : { ano: mes.ano, mes: mes.mes + 1 })}
            className="premir grid size-10 place-items-center rounded-full border border-xisto/35"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <Calendario mes={mes} hoje={hoje} entrada={entrada} saida={null} previa={previa} recomendada={null} fechadas={new Set()} aoEscolher={escolher} aoPassar={(d) => entrada && setPrevia(d)} />
      <p className="mt-3 text-sm text-xisto-suave">
        {cheio ? "Já tem três alternativas." : entrada ? `Chegada a ${dataCurta(iso(entrada))}: escolha a saída.` : "Escolha a chegada."}
      </p>
      {manuais.length > 0 && (
        <ol className="mt-3 border-t border-granito-linha">
          {manuais.map((a, i) => {
            const p = recalcularPedido(pedido, a, undefined, tabela);
            return (
              <li key={`${a.chegada}-${a.saida}`} className="flex items-start justify-between gap-4 border-b border-granito-linha py-3">
                <span>
                  <span className="rustico-medio text-[1.1rem] text-xisto">
                    {dataCurta(a.chegada)} → {dataCurta(a.saida)}
                  </span>
                  <span className="block text-sm text-xisto-suave">{linha(p)}</span>
                </span>
                {!enviado && (
                  <button type="button" aria-label={`Tirar ${dataCurta(a.chegada)}`} onClick={() => setManuais((l) => l.filter((_, j) => j !== i))} className="premir grid size-8 shrink-0 place-items-center rounded-full border border-xisto/30">
                    <X size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <label className="mt-5 block">
        <span className="etiqueta text-[0.62rem] text-xisto-suave">Nota para o hóspede (opcional)</span>
        <textarea
          rows={3}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          disabled={enviado}
          placeholder="Por exemplo: nessa semana só temos a Suite livre."
          className="mt-1.5 block w-full border border-granito-linha bg-white/55 px-3.5 py-3 focus:border-xisto focus:outline-none"
        />
      </label>
      <BotaoAcao estado={estado} desligado={!total || enviado} aoPremir={enviar} textoEnviado="Alternativas enviadas">
        {total ? `Enviar ${total === 1 ? "a alternativa" : `as ${total} alternativas`} ao hóspede` : "Marque uma alternativa"}
      </BotaoAcao>
      {total > 0 && !enviado && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-xisto-suave">
          <Check size={14} /> {total} de 3 marcadas · o hóspede só pode aceitar uma
        </p>
      )}
    </div>
  );
}

function Recusar({ correr }: { correr: Correr }) {
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState<Estado>(PARADO);
  return (
    <div className="mt-6 border-t border-granito-linha pt-6">
      <p className="text-[0.98rem] text-xisto">O hóspede recebe uma mensagem a agradecer e a dizer que desta vez não é possível. Não leva alternativas.</p>
      <label className="mt-4 block">
        <span className="etiqueta text-[0.62rem] text-xisto-suave">Nota para o hóspede (opcional)</span>
        <textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} disabled={estado.fase === "enviado"} className="mt-1.5 block w-full border border-granito-linha bg-white/55 px-3.5 py-3 focus:border-xisto focus:outline-none" />
      </label>
      <BotaoAcao estado={estado} desligado={estado.fase === "enviado"} aoPremir={() => correr({ acao: "recusar", nota }, setEstado)} textoEnviado="Recusa enviada" secundario>
        Enviar a recusa
      </BotaoAcao>
    </div>
  );
}
