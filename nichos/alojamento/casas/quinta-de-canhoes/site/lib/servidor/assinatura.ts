import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { segredo, VALIDADE_LINKS_DIAS } from "@/lib/servidor/config";

/*
  Os links levam o pedido dentro deles, assinado: não há base de dados.

  token = base64url(deflate(JSON {t, exp, d})) + "." + base64url(HMAC-SHA256)

  `t` é o tipo do link (para um link da casa não servir na página do
  hóspede e vice-versa), `exp` a validade (ms) e `d` os dados. Quem mudar
  um só carácter invalida a assinatura.
*/

export type TipoToken = "casa" | "proposta";

const b64 = (b: Buffer) => b.toString("base64url");
const hmac = (corpo: string) => createHmac("sha256", segredo()).update(corpo).digest();

export function assinar<T>(tipo: TipoToken, dados: T, validadeDias = VALIDADE_LINKS_DIAS): string {
  const corpo = b64(deflateRawSync(Buffer.from(JSON.stringify({ t: tipo, exp: Date.now() + validadeDias * 86400000, d: dados }))));
  return `${corpo}.${b64(hmac(corpo))}`;
}

export type Verificacao<T> = { ok: true; dados: T } | { ok: false; motivo: "invalido" | "expirado" };

export function verificar<T>(tipo: TipoToken, token: string): Verificacao<T> {
  try {
    const [corpo, assinatura, ...resto] = decodeURIComponent(token).split(".");
    if (!corpo || !assinatura || resto.length) return { ok: false, motivo: "invalido" };
    const esperada = hmac(corpo);
    const recebida = Buffer.from(assinatura, "base64url");
    if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) return { ok: false, motivo: "invalido" };
    const conteudo = JSON.parse(inflateRawSync(Buffer.from(corpo, "base64url")).toString("utf8"));
    if (conteudo.t !== tipo) return { ok: false, motivo: "invalido" };
    if (typeof conteudo.exp !== "number" || Date.now() > conteudo.exp) return { ok: false, motivo: "expirado" };
    return { ok: true, dados: conteudo.d as T };
  } catch {
    return { ok: false, motivo: "invalido" };
  }
}
