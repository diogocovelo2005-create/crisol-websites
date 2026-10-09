/*
  O par do protótipo B «Mato».

  Títulos: Instrument Serif. Uma serifa condensada, de contraste alto, que
  em maiúsculas faz os títulos altos do B e tem um itálico verdadeiro para
  a segunda metade de cada título. Só tem um peso (400).

  Texto, rótulos e botões: Hanken Grotesk, um grotesco limpo que aguenta
  as versaletes espaçadas.
*/

import { Hanken_Grotesk, Instrument_Serif } from 'next/font/google';

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
