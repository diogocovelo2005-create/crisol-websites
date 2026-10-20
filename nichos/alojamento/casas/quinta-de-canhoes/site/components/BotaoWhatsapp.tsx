"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { linkWhatsapp } from "@/lib/contactos";
import { IconeWhatsapp } from "@/components/IconeWhatsapp";

const CHAVE = "qc-balao-whatsapp";

/**
 * Botão do WhatsApp no canto inferior direito. Aparece depois do primeiro ecrã,
 * nunca na página Reservar (que já é toda contacto) e esconde-se enquanto houver
 * no ecrã um bloco que já leva ao WhatsApp, para não tapar esses botões.
 */
export function BotaoWhatsapp() {
  const caminho = usePathname();
  const [passouHero, setPassouHero] = useState(false);
  const [blocoAVista, setBlocoAVista] = useState(false);
  const [balao, setBalao] = useState(false);

  // Fora da página de reserva (que já tem o WhatsApp) e das páginas da casa.
  const ativo = caminho !== "/reservar" && !caminho.startsWith("/pedido") && !caminho.startsWith("/dev");
  const visivel = ativo && passouHero && !blocoAVista;
  const balaoAberto = balao && visivel;

  useEffect(() => {
    if (!ativo) return;
    // O primeiro ecrã da página inicial é mais comprido (fica preso a meio).
    const limite = caminho === "/" ? 1.1 : 0.82;
    const aoScroll = () => setPassouHero(window.scrollY > window.innerHeight * limite);
    aoScroll();
    window.addEventListener("scroll", aoScroll, { passive: true });
    return () => window.removeEventListener("scroll", aoScroll);
  }, [caminho, ativo]);

  useEffect(() => {
    if (!ativo) return;
    const blocos = document.querySelectorAll("[data-contacto-whatsapp]");
    if (!blocos.length) return;
    const aVista = new Set<Element>();
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) aVista.add(e.target);
          else aVista.delete(e.target);
        }
        setBlocoAVista(aVista.size > 0);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    blocos.forEach((b) => obs.observe(b));
    return () => {
      obs.disconnect();
      setBlocoAVista(false);
    };
  }, [caminho, ativo]);

  // O balão, uma vez por visita, alguns segundos depois de o botão aparecer.
  useEffect(() => {
    if (!visivel) return;
    let jaVisto = false;
    try {
      jaVisto = sessionStorage.getItem(CHAVE) === "1";
    } catch {}
    if (jaVisto) return;
    const abrir = setTimeout(() => {
      setBalao(true);
      try {
        sessionStorage.setItem(CHAVE, "1");
      } catch {}
    }, 5000);
    return () => clearTimeout(abrir);
  }, [visivel]);

  useEffect(() => {
    if (!balaoAberto) return;
    const fechar = setTimeout(() => setBalao(false), 12000);
    return () => clearTimeout(fechar);
  }, [balaoAberto]);

  if (!ativo) return null;

  return (
    <div
      className="pointer-events-none fixed z-30 flex flex-col items-end gap-3"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      <div
        role="status"
        aria-hidden={!balaoAberto}
        className={`balao-whatsapp relative w-[15rem] max-w-[calc(100vw-2rem)] origin-bottom-right border border-granito-linha bg-cal py-3.5 pl-4 pr-9 text-sm leading-snug text-xisto shadow-[0_10px_30px_rgba(34,31,27,0.18)] ${
          balaoAberto ? "pointer-events-auto" : ""
        }`}
        data-aberto={balaoAberto}
      >
        <a
          href={linkWhatsapp()}
          target="_blank"
          rel="noreferrer"
          tabIndex={balaoAberto ? 0 : -1}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caixilho"
        >
          Fale diretamente com quem melhor conhece a casa.
        </a>
        <button
          type="button"
          onClick={() => setBalao(false)}
          tabIndex={balaoAberto ? 0 : -1}
          aria-label="Fechar"
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center text-xisto-suave transition-colors hover:text-xisto focus-visible:outline-2 focus-visible:outline-caixilho"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      <a
        href={linkWhatsapp()}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a Teresa pelo WhatsApp"
        tabIndex={visivel ? 0 : -1}
        aria-hidden={!visivel}
        data-visivel={visivel}
        className={`botao-whatsapp flex h-12 w-12 items-center justify-center rounded-full border border-cal/25 bg-vale text-cal shadow-[0_8px_24px_rgba(34,31,27,0.28)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-caixilho ${
          visivel ? "pointer-events-auto" : ""
        }`}
      >
        <IconeWhatsapp className="h-[1.4rem] w-[1.4rem]" />
      </a>
    </div>
  );
}
