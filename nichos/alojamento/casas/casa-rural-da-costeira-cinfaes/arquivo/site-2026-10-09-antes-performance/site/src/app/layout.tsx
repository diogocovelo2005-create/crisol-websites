import type { Metadata, Viewport } from 'next';
import { display, corpo } from '@/lib/fontes';
import { casa, RESERVA_AIRBNB } from '@/lib/casa';
import ScrollSuave from '@/components/ScrollSuave';
import './globals.css';

/* Sem domínio próprio confirmado (os domínios antigos não têm DNS): na
   Vercel usa o endereço de produção do projeto; fora dela, o local. */
const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3500';

const titulo = `${casa.nome} · ${casa.lugar}`;

export const metadata: Metadata = {
  metadataBase: new URL(base),
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

/* Só o que o contrato deixa afirmar como facto: nome, tipo e registo,
   morada, telefone e o que há na casa. Sem notas (pedem fonte e data),
   sem email (a confirmar com o dono) e sem capacidade (em conflito). */
const dados = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: casa.nome,
  description: casa.hero.texto,
  image: `${base}${casa.hero.imagem}`,
  url: base,
  telephone: '+351914797673',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calçada de Medados, 158',
    postalCode: '4690-055',
    addressLocality: 'Cinfães',
    addressRegion: 'Viseu',
    addressCountry: 'PT',
  },
  identifier: { '@type': 'PropertyValue', propertyID: 'RNET', value: '4967' },
  amenityFeature: [
    'Piscina exterior',
    'Churrasqueira e forno a lenha',
    'Lareira a lenha',
    'Aquecimento',
    'Wi-Fi gratuito',
    'Estacionamento gratuito',
  ].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  sameAs: [RESERVA_AIRBNB],
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
