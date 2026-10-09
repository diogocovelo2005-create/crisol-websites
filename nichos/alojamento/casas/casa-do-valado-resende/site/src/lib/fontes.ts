/*
  Títulos e vozes: Fraunces. Uma serifa com carácter (desenho dos anos 20,
  remates macios pelo eixo SOFT), que no peso regular continua leve e no
  itálico tem voz própria: "toda *vossa*". É a resposta ao "pouca
  personalidade" da Newsreader leve, sem sair do padrão (serifa,
  itálico para a voz).

  Texto, rótulos e botões: Mulish, como em C.
*/

import { Fraunces, Mulish } from 'next/font/google';

export const display = Fraunces({
  subsets: ['latin'],
  variable: '--fonte-display',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT'],
});

export const corpo = Mulish({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
});
