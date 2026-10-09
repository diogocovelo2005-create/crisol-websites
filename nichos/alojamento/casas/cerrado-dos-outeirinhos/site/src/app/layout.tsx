import type { Metadata } from 'next';
import { display, corpo } from '@/lib/fontes';
import { casa } from '@/lib/casa';
import ScrollSuave from '@/components/ScrollSuave';
import './globals.css';

export const metadata: Metadata = {
  // O dominio da casa. Sem isto o Next resolve as imagens de open graph
  // contra localhost.
  metadataBase: new URL('https://www.cerradodosouteirinhos.pt'),
  title: `${casa.nome} | ${casa.tipo} em ${casa.lugar}`,
  description: casa.hero.texto,
  openGraph: {
    title: `${casa.nome} | ${casa.tipo} em ${casa.lugar}`,
    description: casa.hero.texto,
    images: [{ url: casa.hero.imagem, width: 3000, height: 2000, alt: casa.hero.alt }],
    locale: 'pt_PT',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${corpo.variable}`}>
      <body className="bg-linho text-tinta antialiased">
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
