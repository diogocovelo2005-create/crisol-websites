'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A entrada dos títulos, a mesma em todos: o título sobe de trás de uma
  linha, como um intertítulo de filme. Marca cada passagem da história
  (os títulos lidos por ordem contam-na) no momento em que se chega a ela.

  Presa ao scroll (useRevelacao). A janela fica parada e o texto sobe
  dentro dela; quando acaba, sai o recorte (o itálico e as descendentes
  ficam inteiros). Com movimento reduzido, parado e visível.
*/
type Tag = 'h2' | 'h3';

export default function Sobe({
  as = 'h2',
  className = '',
  atraso = 0,
  children,
}: {
  as?: Tag;
  className?: string;
  atraso?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const clipPath = useTransform(r, (k) => (k >= 1 ? 'none' : 'inset(-0.5em -0.6em -0.18em -0.6em)'));
  const transform = useTransform(r, (k) => (k >= 1 ? 'none' : `translateY(${((1 - suave(k)) * 0.9).toFixed(3)}em)`));
  const opacity = useTransform(r, (k) => Math.min(1, suave(k) * 1.6));
  const M = as === 'h3' ? motion.h3 : motion.h2;

  return (
    <M ref={ref} className={className} style={parado ? { clipPath: 'none' } : { clipPath }}>
      <motion.span className="block" style={parado ? { opacity: 1, transform: 'none' } : { opacity, transform }}>
        {children}
      </motion.span>
    </M>
  );
}
