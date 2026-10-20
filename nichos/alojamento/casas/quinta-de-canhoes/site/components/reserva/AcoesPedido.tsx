"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import { Calendario } from "@/components/reserva/FormularioReserva";
import {
  SINAL_PERCENTAGEM,
  dataCurta,
  euros,
  iso,
  noitesEntre,
  recalcularPedido,
  type PedidoReserva,
} from "@/lib/reserva";

/*
  As ações da casa sobre um pedido (/pedido/[token]). Não há estado no
  servidor: cada ação manda os emails e devolve o link do passo seguinte.
  Depois de enviar, o botão desliga-se e diz a hora; carregar outra vez
  noutra visita só reenviaria o email.
*/

type Estado = { fase: "parado" | "a-enviar" | "enviado" | "erro"; hora?: string; erro?: string };
const PARADO: Estado = { fase: "parado" };
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

async function agir(corpo: Record<string, unknown>): Promise<{ ok: boolean; erro?: string; proximo?: string }> {
  try {
    const r = await fetch("/api/reserva/acao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(() => null);
    if (r.ok && j?.ok) return j;
    return { ok: false, erro: j?.erro ?? "Não foi possível enviar." };
  } catch {
    return { ok: false, erro: "Sem ligação. Tente outra vez." };
  }
}

const agora = () => new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date());

export function AcoesPedido({ token, fase, pedido }: { token: string; fase: "novo" | "confirmado"; pedido: PedidoReserva }) {
  const [confirmar, setConfirmar] = useState<Estado>(PARADO);
  const [sinal, setSinal] = useState<Estado>(PARADO);
  const [proximo, setProximo] = useState<string | null>(fase === "confirmado" ? `/pedido/${token}` : null);
  const [painel, setPainel] = useState<"nenhum" | "datas" | "recusar">("nenhum");
  const [totalCombinado, setTotalCombinado] = useState("");

  const semPreco = pedido.total === null;
  const totalNum = Number(totalCombinado.replace(",", "."));
  const sinalCombinado = semPreco && totalNum > 0 ? Math.ceil((Math.round(totalNum) * SINAL_PERCENTAGEM) / 100) : null;
  const tokenSinal = proximo?.split("/").pop() ?? null;
  const respondido = confirmar.fase === "enviado";

  const fazerConfirmar = async () => {
    setConfirmar({ fase: "a-enviar" });
    const r = await agir({ acao: "confirmar", token, ...(semPreco ? { totalCombinado: Math.round(totalNum) } : {}) });
    if (!r.ok) return setConfirmar({ fase: "erro", erro: r.erro });
    setConfirmar({ fase: "enviado", hora: agora() });
    setProximo(r.proximo ?? null);
    setPainel("nenhum");
  };

  const fazerSinal = async () => {
    if (!tokenSinal) return;
    setSinal({ fase: "a-enviar" });
    const r = await agir({ acao: "sinal", token: tokenSinal });
    if (!r.ok) return setSinal({ fase: "erro", erro: r.erro });
    setSinal({ fase: "enviado", hora: agora() });
  };

  return (
    <div className="space-y-6">
      {fase === "novo" && (
        <Cartao etiqueta="1 · Há lugar?" titulo="Confirmar a disponibilidade">
          <p className="text-[0.98rem] leading-relaxed text-xisto-suave">
            O hóspede recebe os dados para pagar o sinal de {SINAL_PERCENTAGEM} %
            {pedido.sinal.valor !== null ? ` (${euros(pedido.sinal.valor)})` : ""} por {pedido.pagamento === "mbway" ? "MB WAY" : "transferência"}. E a si chega um
            lembrete para fechar estas noites no Booking.
          </p>
          {semPreco && (
            <label className="mt-5 block">
              <span className="etiqueta text-[0.62rem] text-xisto-suave">Total da estadia a cobrar (casa inteira{pedido.pequenoAlmoco.incluido ? ", com o pequeno-almoço" : ""}), em euros *</span>
              <input
                inputMode="numeric"
                value={totalCombinado}
                onChange={(e) => setTotalCombinado(e.target.value.replace(/[^\d,.]/g, ""))}
                disabled={respondido}
                className="mt-1.5 block h-12 w-full max-w-[16rem] border border-granito-linha bg-white/55 px-3.5 text-[1.05rem] focus:border-xisto focus:outline-none"
              />
              {sinalCombinado !== null && (
                <span className="mt-2 block text-sm text-xisto">
                  Sinal de {SINAL_PERCENTAGEM} %: <strong className="font-medium">{euros(sinalCombinado)}</strong> · restante {euros(Math.round(totalNum) - sinalCombinado)}
                </span>
              )}
            </label>
          )}
          <BotaoAcao
            estado={confirmar}
            desligado={respondido || (semPreco && !(totalNum > 0))}
            aoPremir={fazerConfirmar}
            textoEnviado="Dados do sinal enviados"
          >
            {semPreco && !(totalNum > 0) ? "Indique o total para confirmar" : "Confirmar disponibilidade"}
          </BotaoAcao>

          {!respondido && (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-granito-linha pt-5 text-[0.95rem]">
              <button type="button" onClick={() => setPainel(painel === "datas" ? "nenhum" : "datas")} className="premir border border-xisto/40 px-5 py-3 text-xisto transition-colors hover:border-xisto" aria-expanded={painel === "datas"}>
                Não há estas datas
              </button>
              <button type="button" onClick={() => setPainel(painel === "recusar" ? "nenhum" : "recusar")} className="sublinha text-sm text-xisto-suave" aria-expanded={painel === "recusar"}>
                Recusar o pedido
              </button>
            </div>
          )}
          {painel === "datas" && !respondido && <PropostaDatas token={token} pedido={pedido} />}
          {painel === "recusar" && !respondido && <Recusar token={token} />}
        </Cartao>
      )}

      {proximo && (
        <Cartao etiqueta={fase === "novo" ? "2 · Depois" : "2 · O sinal"} titulo="Quando o sinal chegar">
          <p className="text-[0.98rem] leading-relaxed text-xisto-suave">
            Confira no banco {pedido.sinal.valor !== null || sinalCombinado !== null ? `os ${euros((pedido.sinal.valor ?? sinalCombinado)!)} ` : ""}com a mensagem «Reserva{" "}
            {pedido.referencia}». Ao carregar, o hóspede recebe a confirmação da reserva.
          </p>
          <BotaoAcao estado={sinal} desligado={sinal.fase === "enviado"} aoPremir={fazerSinal} textoEnviado="Reserva confirmada ao hóspede">
            Recebi o sinal
          </BotaoAcao>
          {fase === "novo" && (
            <p className="mt-4 text-sm text-xisto-suave">
              Este botão também vem no email do lembrete do Booking, para quando o sinal chegar.{" "}
              <a href={proximo} className="sublinha text-caixilho">
                Abrir esta página
              </a>
            </p>
          )}
        </Cartao>
      )}
    </div>
  );
}

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

/* «Não há estas datas»: a casa marca até três alternativas no calendário. */
function PropostaDatas({ token, pedido }: { token: string; pedido: PedidoReserva }) {
  const [hoje, setHoje] = useState<Date | null>(null);
  const [mes, setMes] = useState<{ ano: number; mes: number } | null>(null);
  const [entrada, setEntrada] = useState<Date | null>(null);
  const [previa, setPrevia] = useState<Date | null>(null);
  const [alternativas, setAlternativas] = useState<{ chegada: string; saida: string }[]>([]);
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState<Estado>(PARADO);

  useEffect(() => {
    const d = new Date();
    const h = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const c = new Date(pedido.estadia.chegada + "T00:00");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o dia só existe no browser
    setHoje(h);
    const base = c > h ? c : h;
    setMes({ ano: base.getFullYear(), mes: base.getMonth() });
  }, [pedido.estadia.chegada]);

  const cheio = alternativas.length >= 3;
  const enviado = estado.fase === "enviado";

  const escolher = (d: Date) => {
    if (cheio || enviado) return;
    if (!entrada || d <= entrada) {
      setEntrada(d);
      return;
    }
    setAlternativas((a) => [...a, { chegada: iso(entrada), saida: iso(d) }]);
    setEntrada(null);
    setPrevia(null);
  };

  const enviar = async () => {
    setEstado({ fase: "a-enviar" });
    const r = await agir({ acao: "alternativas", token, alternativas, nota });
    if (!r.ok) return setEstado({ fase: "erro", erro: r.erro });
    setEstado({ fase: "enviado", hora: agora() });
  };

  const noitesOriginais = pedido.estadia.noites;

  return (
    <div className="mt-6 border-t border-granito-linha pt-6">
      <p className="text-[0.98rem] leading-relaxed text-xisto">
        Marque até três alternativas: carregue no dia de chegada e depois no de saída. O pedido original era de {noitesOriginais}{" "}
        {noitesOriginais === 1 ? "noite" : "noites"}; o preço e o sinal fazem-se para o mesmo pedido.
      </p>
      <div className="mt-5 grid gap-8">
        <div>
          <div className="flex items-center justify-between">
            <p className="rustico-medio text-[1.4rem] text-xisto">{mes ? `${MESES[mes.mes][0].toUpperCase()}${MESES[mes.mes].slice(1)} ${mes.ano}` : " "}</p>
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
          <Calendario
            mes={mes}
            hoje={hoje}
            entrada={entrada}
            saida={null}
            previa={previa}
            recomendada={null}
            fechadas={new Set()}
            aoEscolher={escolher}
            aoPassar={(d) => entrada && setPrevia(d)}
          />
          <p className="mt-3 text-sm text-xisto-suave">
            {cheio ? "Já tem três alternativas." : entrada ? `Chegada a ${dataCurta(iso(entrada))}: escolha a saída.` : "Escolha a chegada."}
          </p>
        </div>
        <div>
          <p className="etiqueta text-xisto-suave">As alternativas</p>
          {alternativas.length === 0 ? (
            <p className="mt-3 border-y border-granito-linha py-4 text-sm text-xisto-suave">Ainda nenhuma.</p>
          ) : (
            <ol className="mt-3 border-t border-granito-linha">
              {alternativas.map((a, i) => {
                const p = recalcularPedido(pedido, a);
                const n = noitesEntre(new Date(a.chegada + "T00:00"), new Date(a.saida + "T00:00"));
                return (
                  <li key={`${a.chegada}-${a.saida}`} className="flex items-start justify-between gap-4 border-b border-granito-linha py-3">
                    <span>
                      <span className="rustico-medio text-[1.15rem] text-xisto">
                        {dataCurta(a.chegada)} → {dataCurta(a.saida)}
                      </span>
                      <span className="block text-sm text-xisto-suave">
                        {n} {n === 1 ? "noite" : "noites"} · total {p.total !== null ? euros(p.total) : "a indicar"} · sinal{" "}
                        {p.sinal.valor !== null ? euros(p.sinal.valor) : `${SINAL_PERCENTAGEM} %`}
                      </span>
                    </span>
                    {!enviado && (
                      <button type="button" aria-label={`Tirar a alternativa ${i + 1}`} onClick={() => setAlternativas((l) => l.filter((_, j) => j !== i))} className="premir grid size-8 shrink-0 place-items-center rounded-full border border-xisto/30">
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
              placeholder="Por exemplo: nessa semana só temos a Suite livre na sexta."
              className="mt-1.5 block w-full border border-granito-linha bg-white/55 px-3.5 py-3 focus:border-xisto focus:outline-none"
            />
          </label>
          <BotaoAcao estado={estado} desligado={!alternativas.length || enviado} aoPremir={enviar} textoEnviado="Alternativas enviadas">
            {alternativas.length ? `Enviar ${alternativas.length === 1 ? "a alternativa" : `as ${alternativas.length} alternativas`} ao hóspede` : "Marque uma alternativa"}
          </BotaoAcao>
          {enviado && <p className="mt-3 text-sm text-xisto-suave">Quando o hóspede aceitar, recebe um email com o pedido nas datas novas, para confirmar.</p>}
        </div>
      </div>
    </div>
  );
}

function Recusar({ token }: { token: string }) {
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState<Estado>(PARADO);
  const enviar = async () => {
    setEstado({ fase: "a-enviar" });
    const r = await agir({ acao: "recusar", token, nota });
    if (!r.ok) return setEstado({ fase: "erro", erro: r.erro });
    setEstado({ fase: "enviado", hora: agora() });
  };
  return (
    <div className="mt-6 border-t border-granito-linha pt-6">
      <p className="text-[0.98rem] text-xisto">O hóspede recebe uma mensagem a agradecer e a dizer que desta vez não é possível. Não leva alternativas.</p>
      <label className="mt-4 block">
        <span className="etiqueta text-[0.62rem] text-xisto-suave">Nota para o hóspede (opcional)</span>
        <textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} disabled={estado.fase === "enviado"} className="mt-1.5 block w-full border border-granito-linha bg-white/55 px-3.5 py-3 focus:border-xisto focus:outline-none" />
      </label>
      <BotaoAcao estado={estado} desligado={estado.fase === "enviado"} aoPremir={enviar} textoEnviado="Recusa enviada" secundario>
        Enviar a recusa
      </BotaoAcao>
    </div>
  );
}
