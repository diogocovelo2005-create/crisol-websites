'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A frase de passagem escreve-se da esquerda para a direita ao ritmo do
  scroll, como um intertítulo de cinema: é a frase que liga um momento ao
  seguinte, e lê-se à medida que se destapa. Começa quando entra pelo fundo
  do ecrã e acaba quando chega a meio (useRevelacao).
*/
export default function Passagem({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref);
  // folga negativa em cima, em baixo e à esquerda para o itálico não cortar
  const clip = useTransform(r, (k) => (k >= 1 ? 'none' : `inset(-0.3em ${((1 - suave(k)) * 100).toFixed(2)}% -0.3em -0.3em)`));

  return (
    <motion.p ref={ref} className={className} style={parado ? { clipPath: 'none' } : { clipPath: clip }}>
      {children}
    </motion.p>
  );
}
