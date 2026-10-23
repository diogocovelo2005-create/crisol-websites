/** Dados da propriedade. Fonte: Booking.com e registo nacional de turismo. */
export const contactos = {
  nome: "Quinta de Canhões",
  telefone: { texto: "232 724 449", href: "tel:+351232724449" },
  telemovel: { texto: "964 506 038", href: "tel:+351964506038" },
  whatsapp: "https://wa.me/351964506038",
  /** Tempo de resposta mostrado junto ao WhatsApp. */
  resposta: "A Teresa responde normalmente no próprio dia.",
  email: { texto: "casadecanhoes@gmail.com", href: `mailto:casadecanhoes@gmail.com?subject=${encodeURIComponent("Pedido de reserva — Quinta de Canhões")}` },
  morada: {
    rua: "Rua dos Canhões, 510",
    localidade: "Canhões, Várzea",
    codigo: "3660-682 São Pedro do Sul",
    mapa: "https://www.google.com/maps/search/?api=1&query=Rua+dos+Canh%C3%B5es+510+3660-682+S%C3%A3o+Pedro+do+Sul",
  },
  booking:
    "https://www.booking.com/hotel/pt/quinta-de-canhaues.pt-pt.html",
  instagram: { texto: "@quintadecanhoes", href: "https://www.instagram.com/quintadecanhoes/" },
  facebook: "https://www.facebook.com/people/Casa-de-Canh%C3%B5es/100071936022704/",
  rnet: "1638",
  livroReclamacoes: "https://www.livroreclamacoes.pt/inicio",
} as const;

/** Link do WhatsApp da Teresa com a mensagem já escrita. */
export function linkWhatsapp(
  mensagem = "Olá Teresa, gostava de saber disponibilidade na Quinta de Canhões.",
) {
  return `${contactos.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const navegacao = [
  { texto: "A casa", href: "/a-casa" },
  { texto: "Os quartos", href: "/os-quartos" },
  { texto: "Reservar", href: "/reservar" },
] as const;
