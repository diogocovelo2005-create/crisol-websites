/*
  Par tipografico, escolhido para esta casa.

  Titulos: Playfair Display. A casa e da 2.a metade do seculo XIX e
  conta-se pelo fidalgo que a mandou construir: pede uma serifa de
  contraste alto do mesmo tempo, e o Playfair tem italico verdadeiro
  para a parte do titulo em destaque.

  Texto e versaletes: Figtree. Sem serifa, discreto e muito legivel, com
  o peso 300 que o molde usa no texto corrido. Ao lado de uma serifa que
  fala alto, o texto sussurra.
*/

import { Playfair_Display, Figtree } from 'next/font/google';

export const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const corpo = Figtree({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['300', '400', '500'],
});
