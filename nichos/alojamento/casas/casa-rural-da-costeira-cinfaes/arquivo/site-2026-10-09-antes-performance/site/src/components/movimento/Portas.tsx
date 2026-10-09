'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { suave } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  O efeito marcante: «a casa chama para dentro». Duas folhas da cor do
  papel tapam o primeiro ecrã da sala e abrem-se para os lados com o
  scroll, como as portas de casa ao fim da tarde: primeiro uma frincha
  escura ao meio, depois a sala inteira, com a lareira e a mesa.

  Ligado ao scroll (no telemóvel acompanha o dedo): começa quando o topo
  da sala entra pelo fundo do ecrã e está aberto quando esse topo chega a
  30% do ecrã, antes de se ler o título. Depois de aberto, as folhas ficam
  escondidas (nada fica no ecrã). Só transform. Com movimento reduzido não
  há folhas.

  Vai dentro de uma secção com `position: relative`.
*/
export default function Portas() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);

  const aberto = useTransform(pos, (v) => {
    const { vh } = medida.current;
    return suave(prender((vh - v) / (vh * 0.7)));
  });
  const esquerda = useTransform(aberto, (k) => `translateX(${(-k * 100).toFixed(2)}%)`);
  const direita = useTransform(aberto, (k) => `translateX(${(k * 100).toFixed(2)}%)`);
  const visivel = useTransform(aberto, (k) => (k >= 1 ? 'hidden' : 'visible'));

  if (parado) return null;

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[100svh] overflow-hidden"
      style={{ visibility: visivel }}
    >
      <motion.div className="absolute inset-y-0 left-0 w-1/2 bg-linho will-change-transform" style={{ transform: esquerda }} />
      <motion.div className="absolute inset-y-0 right-0 w-1/2 bg-linho will-change-transform" style={{ transform: direita }} />
    </motion.div>
  );
}
