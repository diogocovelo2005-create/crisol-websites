"use client";

import { abrirAvisoCookies } from "@/lib/consentimento";

/* O link do rodapé que volta a abrir o aviso (e permite retirar o consentimento). */
export function PreferenciasCookies({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={abrirAvisoCookies} className={className}>
      Preferências de cookies
    </button>
  );
}
