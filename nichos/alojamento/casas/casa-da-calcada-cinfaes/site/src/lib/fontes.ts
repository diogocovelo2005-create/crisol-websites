/*
  Par tipografico da Casa da Calcada.

  A skill de desenho desaconselha serifa por defeito e proibe pelo nome as
  duas que qualquer modelo escolhe primeiro (Fraunces e Instrument Serif).
  Aqui a serifa justifica-se e nao e por "parecer premium": a casa e do
  seculo XVIII, tem capela consagrada e cantaria feita a mao, e a seccao
  central da pagina e um arquivo. EB Garamond e uma garalda com italico
  verdadeiro, desenhada para corpos de texto de livro. Nao se repete
  Cormorant, Playfair nem Bodoni, ja usadas noutras casas do nicho.

  Texto e rotulos: Geist. Nao se usa Inter nem system-ui.
*/

import { EB_Garamond, Geist } from 'next/font/google';

export const display = EB_Garamond({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['400', '500'],
  style: ['normal', 'italic'],
});

export const corpo = Geist({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['300', '400', '500'],
});
