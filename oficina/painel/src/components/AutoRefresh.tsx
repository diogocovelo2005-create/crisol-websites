"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Vai buscar os dados de novo a cada 10 s e quando a janela volta a ter foco. */
export function AutoRefresh({ segundos = 10 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, segundos * 1000);
    const foco = () => router.refresh();
    window.addEventListener("focus", foco);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", foco);
    };
  }, [router, segundos]);
  return null;
}
