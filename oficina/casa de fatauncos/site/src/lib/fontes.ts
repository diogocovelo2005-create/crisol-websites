/*
  Par tipografico desta casa.

  Titulos: Bodoni Moda. A casa e um solar setecentista cheio de arte, com
  galeria propria e ar de museu: pede a serifa de contraste altissimo, de
  gravura, e tem italico verdadeiro para a palavra em destaque dos titulos
  (o texto entre *asteriscos*).

  Texto e versaletes: Mulish. Humanista, discreta e muito legivel; deixa a
  Bodoni falar sozinha e em maiusculas espacadas faz os rotulos pequenos.
*/

import { Bodoni_Moda, Mulish } from 'next/font/google';

export const display = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const corpo = Mulish({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
  weight: ['300', '400', '500'],
});
