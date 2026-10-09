import type { Metadata } from 'next';
import { corpo, display } from '@/lib/fontes';
import { proposta } from '@/lib/proposta';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.casacalcada.com'),
  title: `${proposta.nome} | ${proposta.tipo} em Cinfães`,
  description:
    'Uma casa senhorial do século XVIII, com capela própria, jardins em socalcos e vista sobre o Douro.',
  openGraph: {
    title: `${proposta.nome} | ${proposta.tipo} em Cinfães`,
    description:
      'Uma casa senhorial do século XVIII, com capela própria, jardins em socalcos e vista sobre o Douro.',
    images: [
      {
        url: '/fotos/proposta-piscina.webp',
        width: 1620,
        height: 1080,
        alt: 'Piscina e torre da Casa da Calçada',
      },
    ],
    locale: 'pt_PT',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${corpo.variable}`}>
      <body>
        <a className="saltar" href="#conteudo">
          Saltar para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
