/*
  O par do protótipo C ("O álbum").

  Títulos: Young Serif. Uma serifa de traço cheio e quente, com o ar das
  legendas escritas por baixo das fotografias de um álbum de família.
  Não tem itálico: o destaque dos títulos é a cor.

  Texto e versaletes: Figtree, uma sem-serifa redonda e calma.
*/

import { Figtree, Young_Serif } from 'next/font/google';

export const display = Young_Serif({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['400'],
});

export const corpo = Figtree({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['400', '500', '600'],
});
