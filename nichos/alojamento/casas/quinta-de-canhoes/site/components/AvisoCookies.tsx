"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ABRIR_AVISO, gravarConsentimento, useConsentimento } from "@/lib/consentimento";

/*
  O aviso de cookies. O único serviço com cookies é o mapa do Google do
  rodapé, por isso o aviso aparece quando o rodapé se aproxima (assim nunca
  tapa o formulário de reserva) e sempre que se carrega em «Preferências de
  cookies». «Aceitar» e «Recusar» com o mesmo peso; nada pré-marcado.
  Não aparece sozinho nas páginas internas (pedido, proposta, dev).
*/
export function AvisoCookies() {
  const caminho = usePathname();
  const { estado, pronto } = useConsentimento();
  const [perto, setPerto] = useState(false);
  const [pedido, setPedido] = useState(false);

  const interna = ["/pedido", "/proposta", "/dev"].some((p) => caminho.startsWith(p));

  useEffect(() => {
    const abrir = () => setPedido(true);
    window.addEventListener(ABRIR_AVISO, abrir);
    return () => window.removeEventListener(ABRIR_AVISO, abrir);
  }, []);

  useEffect(() => {
    const rodape = document.querySelector("footer");
    if (!rodape) return;
    const o = new IntersectionObserver(([e]) => setPerto(e.isIntersecting), { rootMargin: "0px 0px 200px 0px" });
    o.observe(rodape);
    return () => o.disconnect();
  }, [caminho]);

  const visivel = pedido || (pronto && estado === null && perto && !interna);

  const escolher = (v: "aceite" | "recusado") => {
    gravarConsentimento(v);
    setPedido(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="aviso-cookies-titulo"
      aria-hidden={!visivel}
      data-visivel={visivel}
      className="aviso-cookies fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-[25rem]"
    >
      <div className="border border-granito-linha border-t-[3px] border-t-caixilho bg-cal px-5 py-4 text-xisto shadow-[0_18px_40px_-18px_rgb(34_31_27/0.45)]">
        <p id="aviso-cookies-titulo" className="text-[0.95rem] leading-snug">
          Usamos o mapa do Google, que põe cookies da Google. Aceita?
        </p>
        {estado && (
          <p className="mt-1 text-[0.8rem] text-xisto-suave">A sua escolha atual: {estado === "aceite" ? "aceite" : "recusado"}.</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          {(
            [
              ["recusado", "Recusar"],
              ["aceite", "Aceitar"],
            ] as const
          ).map(([v, t]) => (
            <button
              key={v}
              type="button"
              tabIndex={visivel ? 0 : -1}
              onClick={() => escolher(v)}
              className="premir min-w-24 border border-xisto/60 px-4 py-2 text-[0.9rem] text-xisto transition-colors hover:border-xisto hover:bg-xisto hover:text-cal"
            >
              {t}
            </button>
          ))}
          <Link href="/privacidade#cookies" tabIndex={visivel ? 0 : -1} className="sublinha ml-auto text-[0.8rem] text-xisto-suave">
            Saber mais
          </Link>
        </div>
      </div>
    </div>
  );
}
