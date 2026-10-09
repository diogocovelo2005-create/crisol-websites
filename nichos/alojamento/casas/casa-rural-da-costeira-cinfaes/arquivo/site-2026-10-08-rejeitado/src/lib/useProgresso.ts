'use client';

import { useTransform, type MotionValue } from 'motion/react';
import { type RefObject } from 'react';
import { prender, useMedida } from '@/lib/posicao';

/*
  Progresso de scroll de uma secção, de 0 a 1, calculado à mão.

  Porque não `useScroll({ target, offset })` do Motion: nesta versão ele
  passa a animação para a ScrollTimeline nativa do browser, e com secções
  `sticky` o progresso sai errado. Aqui deriva-se do scrollY da janela e
  da posição natural da secção (lib/posicao), que não muda quando ela ou
  um antepassado ficam presos.

  Modos:
  - 'preso'    de o topo da secção tocar o topo do ecrã até o fundo dela
               tocar o fundo do ecrã. Para secções com filho sticky.
  - 'entrada'  de o topo da secção entrar por baixo até chegar ao topo.
  - 'passagem' de o topo entrar por baixo até o fundo sair por cima.
*/
export type Modo = 'preso' | 'entrada' | 'passagem';

export function useProgresso(ref: RefObject<HTMLElement | null>, modo: Modo = 'preso'): MotionValue<number> {
  // pos: o topo natural da secção em relação ao topo do ecrã (positivo abaixo)
  const { pos, medida } = useMedida(ref);

  return useTransform(pos, (v) => {
    const { altura, vh } = medida.current;
    if (modo === 'preso') return prender(-v / Math.max(1, altura - vh));
    if (modo === 'entrada') return prender((vh - v) / vh);
    return prender((vh - v) / (altura + vh));
  });
}
