import type { Metadata } from "next";
import { SITE, metadados } from "@/lib/seo";
import { TARIFAS } from "@/lib/reserva";
import { Hero } from "@/components/landing/Hero";
import { ManeirasDeFicar } from "@/components/landing/ManeirasDeFicar";
import { Historia } from "@/components/landing/Historia";
import { AVoltaPilha } from "@/components/landing/AVoltaPilha";
import { Fecho } from "@/components/landing/Fecho";
import { contactos } from "@/lib/contactos";

export const metadata: Metadata = metadados({
  titulo: "Quinta de Canhões — Turismo rural em São Pedro do Sul",
  descricao:
    "Casa centenária de turismo em espaço rural em Várzea, São Pedro do Sul, perto das Termas. Piscina, jardim em socalcos e pequeno-almoço caseiro.",
  caminho: "/",
  absoluto: true,
});

/* Dados estruturados: só factos do site. Sem avaliações (as notas são do Booking
   e o Google não aceita avaliações autopromovidas). */
const dadosEstruturados = {
  "@context": "https://schema.org",
  "@type": "BedAndBreakfast",
  name: "Quinta de Canhões",
  url: SITE,
  description:
    "Casa centenária de turismo em espaço rural sobre o vale do Vouga, em Várzea, São Pedro do Sul. Piscina, jardim em socalcos e pequeno-almoço caseiro.",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${contactos.morada.rua}, ${contactos.morada.localidade}`,
    addressLocality: "São Pedro do Sul",
    postalCode: "3660-682",
    addressRegion: "Viseu",
    addressCountry: "PT",
  },
  telephone: contactos.telefone.href.replace("tel:", ""),
  email: contactos.email.texto,
  image: `${SITE}/og.jpg`,
  checkinTime: "15:00",
  checkoutTime: "11:00",
  petsAllowed: true,
  priceRange: `${Math.min(...Object.values(TARIFAS.base))} € – ${Math.max(...Object.values(TARIFAS.base))} € por noite`,
  amenityFeature: ["Piscina", "Pequeno-almoço", "Estacionamento", "Jardim"].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  sameAs: [contactos.instagram.href, contactos.facebook, contactos.booking],
};

export default function Pagina() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
      />
      <Hero />
      <ManeirasDeFicar />
      <Historia />
      <AVoltaPilha />
      <Fecho />
    </>
  );
}
