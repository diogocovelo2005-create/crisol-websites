import type { Metadata, Viewport } from 'next';
import { display, corpo } from '@/lib/fontes';
import { BOOKING, AIRBNB, casa } from '@/lib/casa';
import ScrollSuave from '@/components/ScrollSuave';
import './globals.css';

// Trocar pelo domínio real quando houver (casadovalado.com é outra casa).
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3500';

const titulo = 'Casa do Valado · Casa de pedra com piscina em Resende';
const descricao = casa.hero.texto;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: titulo,
  description: descricao,
  openGraph: {
    title: titulo,
    description: descricao,
    images: [{ url: casa.hero.imagem, width: 2400, height: 1600, alt: casa.hero.alt }],
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: titulo, description: descricao, images: [casa.hero.imagem] },
};

export const viewport: Viewport = {
  themeColor: '#ece9e1',
};

/* Só o que o contrato deixa afirmar pela voz da casa: sem capacidade,
   sem horas de saída, sem preço, sem notas agregadas. */
const dados = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: casa.nome,
  description: descricao,
  url: SITE,
  image: new URL(casa.hero.imagem, SITE).toString(),
  telephone: '+351911505394',
  email: 'wearecasadovalado@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Valado 321',
    addressLocality: 'Resende',
    addressRegion: 'Viseu',
    addressCountry: 'PT',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Piscina privada ao ar livre', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi gratuito', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Ar condicionado', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Estacionamento gratuito', value: true },
  ],
  numberOfRooms: 3,
  sameAs: [BOOKING, AIRBNB],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${corpo.variable}`}>
      <body className="bg-linho text-tinta antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-tinta focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-osso"
        >
          Saltar para o conteúdo
        </a>
        <ScrollSuave>{children}</ScrollSuave>
      </body>
    </html>
  );
}
