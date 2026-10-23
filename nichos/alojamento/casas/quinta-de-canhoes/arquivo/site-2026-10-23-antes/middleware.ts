import { NextResponse, type NextRequest } from "next/server";
import { APENAS_LANDING } from "@/lib/modo";

/** As páginas que ainda não fazem parte da proposta. */
const INTERIORES = ["/a-casa", "/os-quartos", "/reservar"];

/**
 * Enquanto a proposta for só a landing, os botões e o menu ficam todos no
 * lugar, mas quem os seguir encontra o aviso de obra em vez da página.
 *
 * É reescrita e não reencaminhamento: o endereço na barra continua a ser o
 * que a pessoa clicou, e por isso o aviso lê-se como o estado daquela
 * página e não como um engano.
 */
export function middleware(pedido: NextRequest) {
  if (!APENAS_LANDING) return NextResponse.next();

  const caminho = pedido.nextUrl.pathname;
  if (INTERIORES.some((p) => caminho === p || caminho.startsWith(p + "/"))) {
    return NextResponse.rewrite(new URL("/em-construcao", pedido.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/a-casa/:caminho*", "/os-quartos/:caminho*", "/reservar/:caminho*"],
};
