/*
  O par tipográfico do protótipo C ("Planos").

  Títulos: Libre Bodoni. Serifa de contraste alto, com um itálico
  verdadeiro para a palavra em destaque ("só para vocês", "cá fora.").

  Texto, versaletes e botões: Public Sans.
*/

import { Libre_Bodoni, Public_Sans } from 'next/font/google';

export const display = Libre_Bodoni({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

export const corpo = Public_Sans({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['400', '500', '600'],
});
