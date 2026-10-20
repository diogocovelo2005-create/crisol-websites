import { montarPedido, recalcularPedido, somarDias, type FormaPagamento, type PedidoReserva } from "@/lib/reserva";
import { config } from "@/lib/servidor/config";
import * as E from "@/lib/servidor/emails";
import type { SemDestino } from "@/lib/servidor/modelo-email";

/* Só para a pré-visualização em /dev/emails: cada email com dados de exemplo. */

function exemplo(pagamento: FormaPagamento = "mbway"): PedidoReserva {
  const h = new Date();
  const chegada = somarDias(new Date(h.getFullYear(), h.getMonth(), h.getDate()), 24);
  const p = montarPedido({
    chegada,
    saida: somarDias(chegada, 3),
    grupo: { adultos: 2, criancas: ["crianca", "bebe"] },
    escolha: { duplo: 1 },
    casaInteira: false,
    comPequenoAlmoco: true,
    hospede: { nome: "Ana Ribeiro", email: "ana@exemplo.pt", telefone: "912 345 678", mensagem: "Chegamos por volta das 18h." },
    pagamento,
    animal: "grande",
  });
  p.referencia = "4821";
  return p;
}

const L = `${config.siteUrl}/pedido/exemplo`;

export const MODELOS: Record<string, { titulo: string; email: () => SemDestino }> = {
  "hospede-sinal-mbway": { titulo: "Hóspede · pague o sinal (MB WAY)", email: () => E.pagarSinalHospede(exemplo()) },
  "hospede-sinal-transferencia": { titulo: "Hóspede · pague o sinal (transferência)", email: () => E.pagarSinalHospede(exemplo("transferencia")) },
  "hospede-confirmada": { titulo: "Hóspede · reserva confirmada", email: () => E.reservaConfirmadaHospede(exemplo()) },
  "hospede-proposta": {
    titulo: "Hóspede · propostas de datas",
    email: () => {
      const p = exemplo();
      const alt = [7, 21].map((n) => {
        const c = somarDias(new Date(p.estadia.chegada + "T00:00"), n);
        const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return recalcularPedido(p, { chegada: iso(c), saida: iso(somarDias(c, n === 7 ? 3 : 2)) });
      });
      return E.propostaHospede(p, alt, "Nessa semana já temos a casa cheia, mas temos estas.", [`${config.siteUrl}/proposta/exemplo?alt=0`, `${config.siteUrl}/proposta/exemplo?alt=1`]);
    },
  },
  "hospede-recusa": { titulo: "Hóspede · recusa", email: () => E.recusaHospede(exemplo(), "Nessas datas a casa está fechada para obras.") },
  "casa-novo": { titulo: "Casa · novo pedido", email: () => E.novoPedidoCasa(exemplo(), L) },
  "casa-aceitou": { titulo: "Casa · hóspede aceitou proposta", email: () => E.novoPedidoCasa(exemplo(), L, true) },
  "casa-booking": { titulo: "Casa · fechar no Booking", email: () => E.confirmadoCasa(exemplo(), L) },
  alerta: { titulo: "Alerta · envio falhou", email: () => E.alertaFalha("o pedido de Ana Ribeiro não chegou à casa", "Gmail: autenticação falhou (EAUTH)", exemplo()) },
};

/** O HTML para o browser: as imagens inline passam a data URI. */
export const paraBrowser = (e: SemDestino) =>
  (e.anexos ?? []).reduce((h, a) => h.split(`cid:${a.cid}`).join(`data:${a.tipo};base64,${a.base64}`), e.html);
