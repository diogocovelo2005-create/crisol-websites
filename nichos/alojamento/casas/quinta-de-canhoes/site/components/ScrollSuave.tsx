"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Scroll suave. Desliga-se por completo se o utilizador pedir menos movimento. */
export function ScrollSuave() {
  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (semMovimento.matches) return;

    const lenis = new Lenis({ duration: 1.1, wheelMultiplier: 0.9 });
    let frame = 0;
    const correr = (tempo: number) => {
      lenis.raf(tempo);
      frame = requestAnimationFrame(correr);
    };
    frame = requestAnimationFrame(correr);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
