'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A entrada dos quartos (Boa noite, o pormenor): a foto abre de cima para
  baixo, como a luz a entrar por uma janela, presa ao scroll (do topo a
  entrar no ecrã até o centro chegar a meio) e fica. Só clip-path: nada
  se amplia, que a mesa do pequeno-almoço é uma foto pequena.
*/
export default function AbrirDeCima({ children, atraso = 0, className }: { children: React.ReactNode; atraso?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const clipPath = useTransform(r, (k) => (k >= 1 ? 'none' : `inset(0 0 ${((1 - suave(k)) * 100).toFixed(1)}% 0)`));

  return (
    <motion.div ref={ref} className={className} style={parado ? { clipPath: 'none' } : { clipPath }}>
      {children}
    </motion.div>
  );
}
