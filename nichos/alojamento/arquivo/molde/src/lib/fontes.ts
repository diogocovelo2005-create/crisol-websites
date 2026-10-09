/*
  Par tipografico, tirado das referencias.

  Titulos: Cormorant Garamond. E a serifa de contraste alto e desenho
  classico que La Bastide e Luna Vista usam, e tem um italico verdadeiro
  para a palavra em destaque ("heart *of* Joshua Tree").

  Texto e versaletes: Jost. E o geometrico de ar Futura das referencias,
  que em maiusculas espacadas faz os rotulos e os botoes pequenos.
*/

import { Cormorant_Garamond, Jost } from 'next/font/google';

export const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const corpo = Jost({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['300', '400', '500'],
});
