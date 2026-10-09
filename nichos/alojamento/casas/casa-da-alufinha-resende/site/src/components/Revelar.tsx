'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A entrada de cada bloco: sobe um pouco e aparece. Serve a hierarquia: o
  olho apanha o bloco a assentar e sabe onde começar a ler.

  Presa ao scroll, não ao tempo, com o tempo do useRevelacao (do topo a
  entrar pelo fundo do ecrã até o centro chegar a meio): no telemóvel
  chega ao ritmo do dedo e para quando ele para. É só um exemplo de uso;
  outras revelações usam o mesmo hook com o visual delas.

  `atraso` (fração do ecrã) escalona irmãos da mesma linha.
*/
export default function Revelar({
  children,
  atraso = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  atraso?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const opacidade = useTransform(r, suave);
  const transform = useTransform(r, (k) => (k >= 1 ? 'none' : `translateY(${((1 - suave(k)) * y).toFixed(1)}px)`));

  return (
    // com movimento reduzido, valores explícitos: o 1.º render (igual ao do
    // servidor) já escreveu a opacidade, e tirar só o style deixava-o escondido
    <motion.div ref={ref} className={className} style={parado ? { opacity: 1, transform: 'none' } : { opacity: opacidade, transform }}>
      {children}
    </motion.div>
  );
}
