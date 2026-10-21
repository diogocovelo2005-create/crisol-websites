"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Scroll suave. Desliga-se por completo se o utilizador pedir menos movimento. */
export function ScrollSuave() {
  const lenis = useRef<Lenis | null>(null);
  const caminho = usePathname();

  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (semMovimento.matches) return;

    const l = new Lenis({ duration: 1.1, wheelMultiplier: 0.9 });
    lenis.current = l;
    let frame = 0;
    const correr = (tempo: number) => {
      l.raf(tempo);
      frame = requestAnimationFrame(correr);
    };
    frame = requestAnimationFrame(correr);

    return () => {
      cancelAnimationFrame(frame);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  /*
    Ao mudar de página, pára a inércia do Lenis antes de o Next pôr a página
    nova no sítio (topo, âncora ou a posição guardada do «voltar»). Sem isto,
    um clique a meio de um scroll deixava o Lenis acabar a animação antiga e
    a página nova abria a meio. Corre no layout effect, antes do scroll do Next.
  */
  /*
    Um link para a página onde já se está (o «A casa» estando na casa, o
    logotipo na entrada) não muda o caminho, e o Next deixa-o onde está:
    leva-o ao topo, como os outros. As âncoras (#…) ficam com o browser.
  */
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash) return;
      if (lenis.current) lenis.current.scrollTo(0);
      else window.scrollTo({ top: 0 });
    };
    // Em captura: o Link do Next cancela o clique antes de ele chegar ao document.
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  useLayoutEffect(() => {
    const l = lenis.current;
    if (!l) return;
    l.stop();
    l.start();
  }, [caminho]);

  return null;
}
