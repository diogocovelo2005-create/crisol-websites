import type { Metadata, Viewport } from 'next';
import { display, corpo } from '@/lib/fontes';
import { casa, AIRBNB, FACEBOOK } from '@/lib/casa';
import ScrollSuave from '@/components/ScrollSuave';
import './globals.css';

const titulo = 'A Família na Quinta · Casa de pedra numa quinta em Lamego';
const descricao = casa.hero.texto;

export const metadata: Metadata = {
  // Trocar pelo domínio real quando houver.
  metadataBase: new URL('https://afamilianaquinta.pt'),
  title: titulo,
  description: descricao,
  openGraph: {
    title: titulo,
    description: descricao,
    images: [{ url: casa.hero.imagem, width: 2400, height: 1600, alt: casa.hero.alt }],
    locale: 'pt_PT',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#f5eee2',
};

// Só o que o contrato deixa afirmar sem condição (sem registo, capacidade
// nem nota, que esperam pelo dono).
const dados = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: casa.nome,
  description: 'Moradia de pedra de 60 m² em open space, com varanda privativa e spa, numa quinta familiar em Lamego.',
  image: `https://afamilianaquinta.pt${casa.hero.imagem}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Lamego', addressCountry: 'PT' },
  amenityFeature: ['Ar condicionado', 'Wi-Fi', 'Cozinha equipada', 'Varanda privativa com spa', 'Duche exterior', 'Estacionamento gratuito'].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  sameAs: [AIRBNB, FACEBOOK],
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
