'use client';

import { createContext, useContext } from 'react';
import { casa } from '@/lib/casa';

/*
  Os dados do pico, iguais para todas as variantes (Relogio, Provas,
  Caderno, Livro). Vem de casa.pico.

  O catalogo (/catalogo) pode passar outro pico pelo PicoContexto, para
  mostrar a mesma variante com outra forma de contar. No site de um
  cliente nao ha contexto e usa-se sempre casa.pico.
*/

export type Momento = {
  marca: string;
  momento: string;
  titulo: string;
  texto: string;
  imagem: string;
  alt: string;
  aspeto?: number;
  par?: { imagem: string; alt: string };
};

export type Pico = {
  forma: string;
  etiqueta: string;
  titulo: string;
  intro: string;
  linha: readonly string[];
  sol: readonly string[];
  momentos: readonly Momento[];
};

export const PicoContexto = createContext<Pico | null>(null);

export function usePico(): Pico {
  return useContext(PicoContexto) ?? casa.pico;
}
