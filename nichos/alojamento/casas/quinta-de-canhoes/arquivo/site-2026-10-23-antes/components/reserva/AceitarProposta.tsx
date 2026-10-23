"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BotaoAcao } from "@/components/reserva/AcoesPedido";
import { Bilhete } from "@/components/reserva/BilhetePedido";
import { SINAL_PERCENTAGEM, euros, type PedidoReserva } from "@/lib/reserva";

/* A página do hóspede com as datas que a casa propõe. Abrir o link do email
   não aceita nada (os leitores de email abrem links sozinhos): aceita-se
   aqui, com um clique. */
export function AceitarProposta({ token, alternativas, inicial }: { token: string; alternativas: PedidoReserva[]; inicial: number }) {
  const [escolhida, setEscolhida] = useState(Math.min(Math.max(0, inicial), alternativas.length - 1));
  const [estado, setEstado] = useState<{ fase: "parado" | "a-enviar" | "enviado" | "erro"; hora?: string; erro?: string }>({ fase: "parado" });
  const enviado = estado.fase === "enviado";

  const aceitar = async () => {
    setEstado({ fase: "a-enviar" });
    try {
      const r = await fetch("/api/reserva/acao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "aceitar", token, alt: escolhida }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) return setEstado({ fase: "erro", erro: j?.erro ?? "Não foi possível enviar." });
      setEstado({ fase: "enviado", hora: new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date()) });
    } catch {
      setEstado({ fase: "erro", erro: "Sem ligação. Tente outra vez." });
    }
  };

  return (
    <div>
      <fieldset disabled={enviado}>
        <legend className="etiqueta text-xisto-suave">As datas que lhe propomos</legend>
        <div className="mt-3 grid gap-5">
          {alternativas.map((a, i) => {
            const on = i === escolhida;
            return (
              <label
                key={i}
                className={`block cursor-pointer outline-offset-4 transition-shadow duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caixilho ${
                  on ? "ring-4 ring-caixilho" : "ring-1 ring-granito-linha hover:ring-xisto/40"
                }`}
              >
                <input type="radio" name="alternativa" checked={on} onChange={() => setEscolhida(i)} className="sr-only" />
                <Bilhete
                  pedido={a}
                  foto={false}
                  titulo={alternativas.length > 1 ? `Proposta ${i + 1}` : "A proposta"}
                  rodape={
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[0.95rem] text-cal/85">
                        Total {a.total !== null ? euros(a.total) : "a indicar"} · sinal de {SINAL_PERCENTAGEM} %:{" "}
                        <strong className="font-medium text-cal">{a.sinal.valor !== null ? euros(a.sinal.valor) : `${SINAL_PERCENTAGEM} %`}</strong>
                      </p>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${on ? "bg-cal text-xisto" : "border border-cal/35 text-cal/80"}`}>
                        <span aria-hidden="true" className={`grid size-4 place-items-center rounded-full border ${on ? "border-caixilho" : "border-cal/60"}`}>
                          <span className={`size-2 rounded-full bg-caixilho ${on ? "opacity-100" : "opacity-0"}`} />
                        </span>
                        {on ? "Escolhida" : "Escolher"}
                      </span>
                    </div>
                  }
                />
              </label>
            );
          })}
        </div>
      </fieldset>
      <BotaoAcao estado={estado} desligado={enviado} aoPremir={aceitar} textoEnviado="Aceite">
        Aceito estas datas
      </BotaoAcao>
      {enviado && (
        <p className="mt-4 flex items-start gap-2.5 text-[0.98rem] leading-relaxed text-xisto">
          <Check size={18} className="mt-0.5 shrink-0 text-caixilho" />
          Obrigado. Confirmamos outra vez a disponibilidade e enviamos-lhe por email os dados para pagar o sinal. Ainda não é reserva. Se não receber nada, veja na pasta de spam.
        </p>
      )}
    </div>
  );
}
