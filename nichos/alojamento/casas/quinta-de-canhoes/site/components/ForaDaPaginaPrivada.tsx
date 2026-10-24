"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

/*
  No editor privado dos preços (/precos/<chave>) não vão o rodapé (links
  para fora, o mapa da Google), o WhatsApp nem o aviso de cookies.

  Quem o diz é a própria página (<PaginaPrivada />), e só quando a chave é
  a certa: assim um 404 em /precos/<qualquer coisa> é igual a todos os
  outros, sem pistas. Até o browser arrancar, um <style> da página esconde-os;
  depois saem de vez.
*/
let privada = false;
const ouvintes = new Set<() => void>();
const mudar = (v: boolean) => {
  privada = v;
  ouvintes.forEach((f) => f());
};
const subscrever = (f: () => void) => {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
};

export function ForaDaPaginaPrivada({ children }: { children: ReactNode }) {
  const esconder = useSyncExternalStore(subscrever, () => privada, () => false);
  return esconder ? null : <>{children}</>;
}

export function PaginaPrivada() {
  useEffect(() => {
    mudar(true);
    return () => mudar(false);
  }, []);
  return <style>{"footer,.botao-whatsapp,.balao-whatsapp,.aviso-cookies{display:none!important}"}</style>;
}
