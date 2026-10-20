import type { Metadata } from "next";
import { Suspense } from "react";
import { Young_Serif, Playfair_Display, Karla } from "next/font/google";
import "./globals.css";
import { ScrollSuave } from "@/components/ScrollSuave";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { AvisoCookies } from "@/components/AvisoCookies";
import { BotaoWhatsapp } from "@/components/BotaoWhatsapp";

// Young Serif: serifa antiga de traço grosso e cunhas largas.
const display = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-display",
});

// Playfair Display: elegante para hotelaria boutique.
const cartaz = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--fonte-cartaz",
});

const corpo = Karla({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-corpo",
});

const DESCRICAO =
  "Casa centenária de Turismo de Habitação sobre o vale do Vouga, em Várzea, São Pedro do Sul. Jardim, piscina e um pequeno-almoço de que os hóspedes não se esquecem.";

export const metadata: Metadata = {
  metadataBase: new URL("https://quintadecanhoes.pt"),
  title: {
    default: "Quinta de Canhões — Turismo de Habitação em São Pedro do Sul",
    template: "%s — Quinta de Canhões",
  },
  description: DESCRICAO,
  openGraph: {
    title: "Quinta de Canhões",
    description: DESCRICAO,
    locale: "pt_PT",
    type: "website",
    images: [{ url: "/fotos/hero.jpg", width: 1535, height: 1024 }],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${cartaz.variable} ${corpo.variable}`}>
      <body>
        <Suspense fallback={null}>
          <ScrollSuave />
        </Suspense>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-cal focus:px-4 focus:py-2 focus:text-xisto"
        >
          Saltar para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo">{children}</main>
        <Rodape />
        <AvisoCookies />
        <BotaoWhatsapp />
      </body>
    </html>
  );
}
