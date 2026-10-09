/*
  Par tipografico do prototipo B «Mato».

  Titulos: Instrument Serif. Serifa de display estreita e alta, em
  maiusculas, com o italico em minusculas para a palavra em destaque.
  So existe no peso 400: os titulos nunca pedem negrito (seria falso).

  Texto e versaletes: Hanken Grotesk, grotesca sobria que segura as
  maiusculas espacadas dos rotulos e dos botoes.
*/

import { Instrument_Serif, Hanken_Grotesk } from 'next/font/google';

export const display = Instrument_Serif({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
});

export const corpo = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['400', '500', '600'],
});
