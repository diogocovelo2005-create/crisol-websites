"use client";

import { useEffect, useState } from "react";

/*
  O consentimento para o mapa do Google (o único serviço do site que põe
  cookies, e de terceiros). Guarda-se em localStorage, que não é um cookie;
  se o armazenamento falhar, o site funciona e o mapa fica bloqueado.

  Eventos na window, para o aviso, o mapa e o link do rodapé falarem entre si:
    «consentimento-mudou»  a escolha mudou
    «abrir-aviso-cookies»  o link «Preferências de cookies» pediu o aviso
*/

export type Consentimento = "aceite" | "recusado" | null;

const CHAVE = "quinta-de-canhoes:consentimento-mapa";
const MUDOU = "consentimento-mudou";
export const ABRIR_AVISO = "abrir-aviso-cookies";

export function lerConsentimento(): Consentimento {
  try {
    const v = window.localStorage.getItem(CHAVE);
    return v === "aceite" || v === "recusado" ? v : null;
  } catch {
    return null;
  }
}

/** Grava a escolha. Se não der para gravar, vale só para esta visita. */
let emMemoria: Consentimento = null;
export function gravarConsentimento(v: Exclude<Consentimento, null>) {
  emMemoria = v;
  try {
    window.localStorage.setItem(CHAVE, v);
  } catch {}
  window.dispatchEvent(new CustomEvent(MUDOU));
}

export function useConsentimento() {
  // null até montar: o servidor não sabe a escolha, e assim não há saltos.
  const [{ estado, pronto }, setValor] = useState<{ estado: Consentimento; pronto: boolean }>({ estado: null, pronto: false });
  useEffect(() => {
    const ler = () => setValor({ estado: lerConsentimento() ?? emMemoria, pronto: true });
    ler();
    window.addEventListener(MUDOU, ler);
    window.addEventListener("storage", ler);
    return () => {
      window.removeEventListener(MUDOU, ler);
      window.removeEventListener("storage", ler);
    };
  }, []);
  return { estado, pronto };
}

export const abrirAvisoCookies = () => window.dispatchEvent(new CustomEvent(ABRIR_AVISO));
