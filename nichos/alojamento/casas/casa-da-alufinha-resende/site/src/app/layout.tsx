import type { Metadata, Viewport } from 'next';
import { display, corpo } from '@/lib/fontes';
import { casa, canais } from '@/lib/casa';
import ScrollSuave from '@/components/ScrollSuave';
import './globals.css';

// Ainda não há domínio: trocar pelo real antes de publicar (sem isto o
// Next resolve as imagens de Open Graph contra o localhost).
const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3500';

const titulo = `${casa.nome} · Casa inteira com piscina privada em Resende, Douro`;
const descricao =
  'Casa antiga de granito em São João de Fontoura, Resende, remodelada, com três quartos, três casas de banho e piscina privada virada para os socalcos do Douro. Ligue 912 331 756.';

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: titulo,
  description: descricao,
  openGraph: {
    title: titulo,
    description: descricao,
    images: [{ url: casa.hero.imagem, width: 2528, height: 1684, alt: casa.hero.alt }],
    locale: 'pt_PT',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#ece5da',
};

// Só o que o contrato do dossiê deixa afirmar (AFIR-01, 02, 03, 07, 08, 16,
// 20, 21, 26, 42). Sem notas de plataformas: não são do próprio site.
const dadosEstruturados = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: casa.nome,
  description: casa.hero.texto,
  image: `${base}${casa.hero.imagem}`,
  telephone: '+351912331756',
  email: 'mariajoaopaulapinto@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calçada da Ponte da Alufinha, 142',
    postalCode: '4660-339',
    addressLocality: 'São João de Fontoura',
    addressRegion: 'Resende',
    addressCountry: 'PT',
  },
  numberOfRooms: 3,
  amenityFeature: ['Piscina exterior privada', 'Ar condicionado', 'Wi-Fi gratuito', 'Estacionamento privado gratuito'].map((nome) => ({
    '@type': 'LocationFeatureSpecification',
    name: nome,
    value: true,
  })),
  sameAs: canais.map((c) => c.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${corpo.variable}`}>
      <body className="bg-linho text-tinta antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }} />
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
