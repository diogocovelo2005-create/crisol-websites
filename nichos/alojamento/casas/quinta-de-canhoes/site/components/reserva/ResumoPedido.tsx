import {
  FORMAS_PAGAMENTO,
  POLITICA_SINAL,
  SINAL_PERCENTAGEM,
  dataLonga,
  descreverPedido,
  euros,
  type PedidoReserva,
} from "@/lib/reserva";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/* O resumo de um pedido (as datas, o que pediu e as contas, com o sinal à
   vista), para as páginas da casa e do hóspede. Sem estado. */
export function ResumoPedido({ pedido: p, comHospede = false }: { pedido: PedidoReserva; comHospede?: boolean }) {
  const noites = plural(p.estadia.noites, "noite", "noites");
  const linhas: [string, string, string][] = [];
  if (p.casaInteira) {
    linhas.push([
      "A casa inteira",
      p.casaInteira.precoPorNoite !== null ? `${noites} × ${euros(p.casaInteira.precoPorNoite)}` : "Preço a indicar pela casa",
      p.casaInteira.subtotal !== null ? euros(p.casaInteira.subtotal) : "—",
    ]);
  }
  for (const l of p.quartos) {
    const precos = [...new Set(l.precosPorNoite.map((n) => n.preco))];
    linhas.push([
      `${l.quantidade > 1 ? `${l.quantidade} × ` : ""}${l.nome}`,
      `${noites} × ${precos.length === 1 ? euros(precos[0]) : "preço da noite"}${l.quantidade > 1 ? ` × ${l.quantidade}` : ""}`,
      euros(l.subtotal),
    ]);
  }
  linhas.push([
    "Pequeno-almoço",
    p.pequenoAlmoco.incluido ? `${plural(p.pessoas, "pessoa", "pessoas")} × ${noites} × ${euros(p.pequenoAlmoco.porPessoaNoite)}` : "Não incluído",
    p.pequenoAlmoco.incluido ? euros(p.pequenoAlmoco.subtotal) : "—",
  ]);

  const dados: [string, string][] = [
    ["Chegada", `${dataLonga(p.estadia.chegada)}, a partir das 15h00`],
    ["Saída", `${dataLonga(p.estadia.saida)}, até às 11h00`],
    ["Noites", String(p.estadia.noites)],
    ["Pessoas", String(p.pessoas)],
    [p.casaInteira ? "Reserva" : "Quartos", descreverPedido(p)],
    ["Pagamento", FORMAS_PAGAMENTO.find((f) => f.id === p.pagamento)?.nome ?? p.pagamento],
  ];
  if (comHospede) {
    dados.push(["Nome", p.hospede.nome], ["Email", p.hospede.email], ["Telemóvel", p.hospede.telefone]);
  }

  return (
    <div className="text-xisto">
      <dl className="grid grid-cols-[110px_1fr] border-t border-granito-linha">
        {dados.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="etiqueta border-b border-granito-linha py-3.5 text-[0.6rem] leading-tight text-xisto-suave">{k}</dt>
            <dd className="break-words border-b border-granito-linha py-3">
              {k === "Email" ? (
                <a className="sublinha text-caixilho" href={`mailto:${v}`}>{v}</a>
              ) : k === "Telemóvel" ? (
                <a className="sublinha text-caixilho" href={`tel:${v.replace(/[^\d+]/g, "")}`}>{v}</a>
              ) : (
                v
              )}
            </dd>
          </div>
        ))}
      </dl>
      {comHospede && p.hospede.mensagem && (
        <blockquote className="mt-5 whitespace-pre-line border-l-2 border-caixilho pl-4 text-[0.98rem] leading-relaxed">{p.hospede.mensagem}</blockquote>
      )}

      <ul className="mt-8 border-t border-granito-linha">
        {linhas.map(([a, b, c]) => (
          <li key={a} className="flex items-baseline justify-between gap-4 border-b border-granito-linha py-3">
            <span>
              {a}
              <span className="block text-sm text-xisto-suave">{b}</span>
            </span>
            <span className="shrink-0">{c}</span>
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-4 py-4">
          <span className="rustico-medio text-[1.3rem]">Total da estadia</span>
          <span className="rustico-medio text-[1.5rem]">{p.total !== null ? euros(p.total) : <span className="text-base text-xisto-suave">A indicar pela casa</span>}</span>
        </li>
      </ul>
      <div className="bg-vale px-5 py-5 text-cal">
        <div className="flex items-baseline justify-between gap-4">
          <p className="leading-snug">
            Para confirmar a reserva paga apenas o <strong className="font-medium">sinal de {SINAL_PERCENTAGEM} %</strong>
          </p>
          <p className="rustico-medio shrink-0 text-[1.9rem] leading-none">{p.sinal.valor !== null ? euros(p.sinal.valor) : `${SINAL_PERCENTAGEM} %`}</p>
        </div>
        <p className="mt-3 border-t border-cal/20 pt-3 text-[0.95rem] text-cal/80">
          {p.restante.valor !== null
            ? `O restante, ${euros(p.restante.valor)}, paga-se ${p.restante.quando}.`
            : `O sinal é ${SINAL_PERCENTAGEM} % do total que a casa indicar; o restante paga-se ${p.restante.quando}.`}{" "}
          {POLITICA_SINAL}
        </p>
      </div>
    </div>
  );
}

/* A faixa do topo das páginas do circuito: escura, para o cabeçalho do site
   (claro sobre transparente no topo) se ler. */
export function FaixaTopo({ etiqueta, titulo, texto }: { etiqueta: string; titulo: string; texto?: string }) {
  return (
    <section className="bg-vale pb-14 pt-32 text-cal md:pb-16 md:pt-36">
      <div className="mx-auto max-w-[86rem] px-6 md:px-10">
        <p className="etiqueta text-cal/70">{etiqueta}</p>
        <h1 className="rustico mt-4 max-w-[22ch] text-titulo leading-[1.04]">{titulo}</h1>
        {texto && <p className="mt-5 max-w-[58ch] text-corpo-grande leading-relaxed text-cal/85">{texto}</p>}
      </div>
    </section>
  );
}
