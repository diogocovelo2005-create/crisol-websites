import type { Metadata, Viewport } from 'next';
import { display, corpo } from '@/lib/fontes';
import { casa } from '@/lib/casa';
import ScrollSuave from '@/components/ScrollSuave';
import './globals.css';

// Trocar pelo dominio real quando houver. Sem isto o Next resolve as
// imagens de open graph contra localhost.
const URL_SITE = 'https://casa-rural-da-costeira.vercel.app';
const titulo = `${casa.nome} | ${casa.tipo} em ${casa.lugar}`;

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: titulo,
  description: casa.hero.texto,
  openGraph: {
    title: titulo,
    description: casa.hero.texto,
    images: [{ url: casa.hero.imagem, width: 2400, height: 1600, alt: casa.hero.alt }],
    locale: 'pt_PT',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#2e372e',
};

// Só o que o contrato deixa afirmar como facto: nome, tipo, morada,
// telefone e as comodidades confirmadas. Sem notas de plataformas.
const dados = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: casa.nome,
  description: casa.hero.texto,
  url: URL_SITE,
  image: `${URL_SITE}${casa.hero.imagem}`,
  telephone: '+351914797673',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calçada de Medados, 158',
    postalCode: '4690-055',
    addressLocality: 'Cinfães',
    addressRegion: 'Viseu',
    addressCountry: 'PT',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Piscina exterior', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Churrasqueira e forno a lenha', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Lareira', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi gratuito', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Estacionamento gratuito', value: true },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${corpo.variable}`}>
      <body className="bg-linho text-tinta antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-tinta focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-osso"
        >
          Saltar para o conteúdo
        </a>
        <ScrollSuave>{children}</ScrollSuave>
      </body>
    </html>
  );
}
