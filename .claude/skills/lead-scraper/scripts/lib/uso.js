/**
 * uso.js — contador mensal de chamadas pagas.
 *
 * Os limites gratuitos da Google sao POR MES E POR PROJETO, nao por corrida.
 * Sem isto, tres corridas no mesmo mes julgavam-se cada uma com 1000 chamadas
 * gratis e a terceira gerava factura sem ninguem contar com isso.
 *
 * O ficheiro e local e aproximado: conta o que ESTE repositorio gastou. Se
 * usares a mesma chave noutro sitio, a Google conta na mesma e este numero
 * fica curto. A verdade esta em Cloud Console > Billing.
 */

import fs from "node:fs";
import path from "node:path";

const FICHEIRO = path.join(".state", "uso-mensal.json");

/** Limites gratuitos por mes e por projeto. Ver references/places-api.md. */
export const GRATIS_MES = {
  pesquisa: Infinity,      // Search Essentials (IDs Only)
  essentials: 10000,       // Place Details Essentials  — id, location, types
  enterprise: 1000,        // Place Details Enterprise  — websiteUri, rating, ...
};

export const PRECO_POR_MIL = {
  pesquisa: 0,
  essentials: 5,
  enterprise: 20,
};

const mesActual = () => new Date().toISOString().slice(0, 7); // "2026-08"

export function lerUso() {
  const vazio = { mes: mesActual(), pesquisa: 0, essentials: 0, enterprise: 0 };
  if (!fs.existsSync(FICHEIRO)) return vazio;
  try {
    const u = JSON.parse(fs.readFileSync(FICHEIRO, "utf8"));
    // Mes diferente = limites renovados. Nao se acumula de mes para mes.
    return u.mes === mesActual() ? { ...vazio, ...u } : vazio;
  } catch {
    return vazio;
  }
}

export function registarUso(delta) {
  const u = lerUso();
  for (const k of ["pesquisa", "essentials", "enterprise"]) u[k] += delta[k] ?? 0;
  u.mes = mesActual();
  fs.mkdirSync(path.dirname(FICHEIRO), { recursive: true });
  fs.writeFileSync(FICHEIRO, JSON.stringify(u, null, 2));
  return u;
}

/** Quantas chamadas deste tipo ainda cabem no gratis este mes. */
export function restanteGratis(tipo, uso = lerUso()) {
  const limite = GRATIS_MES[tipo];
  if (limite === Infinity) return Infinity;
  return Math.max(0, limite - (uso[tipo] ?? 0));
}

/** Custo em dolares de n chamadas de um tipo, ja descontando o gratis restante. */
export function custoDe(tipo, n, uso = lerUso()) {
  const pagas = Math.max(0, n - restanteGratis(tipo, uso));
  return (pagas * PRECO_POR_MIL[tipo]) / 1000;
}

export function resumo(uso = lerUso()) {
  return [
    `mes ${uso.mes}`,
    `pesquisa ${uso.pesquisa} (gratis, ilimitado)`,
    `Details Essentials ${uso.essentials}/${GRATIS_MES.essentials}`,
    `Details Enterprise ${uso.enterprise}/${GRATIS_MES.enterprise}`,
  ].join(" · ");
}
