import { deIso, hojeEmPortugal, iso, somarDias } from "@/lib/reserva";
import { config } from "@/lib/servidor/config";
import { enviarEmail } from "@/lib/servidor/email";
import { resumoDiarioCasa } from "@/lib/servidor/emails";
import { linkCasa } from "@/lib/servidor/fluxo";
import { anotar, apagarRegisto, atualizar, limparDuplicados, listarRegistos, quandoTxt } from "@/lib/servidor/reservas";

/*
  Os lembretes de cada manhã (função agendada do Netlify → /api/lembretes):
  - à casa, um só email com os pedidos sem resposta há mais de 24 h e os
    sinais com o prazo passado;
  - sinais com o prazo passado há mais de 3 dias → «expirado» (libertam as
    noites), com aviso à casa e não ao hóspede;
  - registos apagados 12 meses depois da saída.
*/
export async function executarLembretes(agora = Date.now()) {
  const registos = await listarRegistos();
  const semResposta: typeof registos = [];
  const sinalAtrasado: typeof registos = [];
  const expirados: typeof registos = [];
  const apagados: string[] = [];
  const limite = iso(somarDias(deIso(hojeEmPortugal())!, -366));

  for (const r of registos) {
    if (r.pedido.estadia.saida < limite) {
      await apagarRegisto(r);
      apagados.push(r.ref);
      continue;
    }
    if (r.estado === "novo" && agora - Date.parse(r.atualizadoEm) > 24 * 3600000) semResposta.push(r);
    if (r.estado === "confirmado" && r.confirmacao) {
      const atraso = agora - Date.parse(r.confirmacao.prazoSinal);
      if (atraso > 3 * 86400000) {
        const m = await atualizar(r.ref, (x) => {
          if (x.estado !== "confirmado") return { erro: "mudou" };
          x.estado = "expirado";
          x.fim = { em: new Date(agora).toISOString(), motivo: "O sinal não chegou (expirado automaticamente)" };
          anotar(x, "Expirado: o sinal não chegou em 3 dias depois do prazo");
          return { registo: x };
        });
        if ("registo" in m) expirados.push(m.registo);
      } else if (atraso > 0) sinalAtrasado.push(r);
    }
  }

  const grupos = [
    { titulo: "Sem resposta há mais de 24 horas", itens: semResposta.map((r) => ({ p: r.pedido, link: linkCasa(r), nota: `pedido de ${quandoTxt(r.criadoEm)}` })) },
    {
      titulo: "O sinal ainda não chegou (prazo passado)",
      itens: sinalAtrasado.map((r) => ({ p: r.pedido, link: linkCasa(r), nota: `prazo: ${quandoTxt(r.confirmacao!.prazoSinal)}` })),
    },
    {
      titulo: "Expirados hoje: as noites ficaram livres",
      itens: expirados.map((r) => ({ p: r.pedido, link: linkCasa(r), nota: `o prazo do sinal era ${quandoTxt(r.confirmacao!.prazoSinal)}` })),
    },
  ];
  await limparDuplicados();
  const total = grupos.reduce((s, g) => s + g.itens.length, 0);
  let email: string | null = null;
  if (total) {
    const r = await enviarEmail({ ...resumoDiarioCasa(grupos), para: config.emailCasa });
    email = r.ok ? "enviado" : `falhou: ${r.erro}`;
  }
  return {
    semResposta: semResposta.map((r) => r.ref),
    sinalAtrasado: sinalAtrasado.map((r) => r.ref),
    expirados: expirados.map((r) => r.ref),
    apagados,
    email,
  };
}
