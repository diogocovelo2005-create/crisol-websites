import { Hero } from "@/components/landing/Hero";
import { ManeirasDeFicar } from "@/components/landing/ManeirasDeFicar";
import { Historia } from "@/components/landing/Historia";
import { AVoltaPilha } from "@/components/landing/AVoltaPilha";
import { Fecho } from "@/components/landing/Fecho";
import { contactos } from "@/lib/contactos";

const dadosEstruturados = {
  "@context": "https://schema.org",
  "@type": "BedAndBreakfast",
  name: "Quinta de Canhões",
  description:
    "Casa centenária de Turismo de Habitação sobre o vale do Vouga, em Várzea, São Pedro do Sul.",
  address: {
    "@type": "PostalAddress",
    streetAddress: contactos.morada.rua,
    addressLocality: "São Pedro do Sul",
    postalCode: "3660-682",
    addressRegion: "Viseu",
    addressCountry: "PT",
  },
  telephone: "+351232724449",
  email: contactos.email.texto,
  image: "/fotos/hero.png",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "8.6",
    bestRating: "10",
    ratingCount: "110",
  },
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
