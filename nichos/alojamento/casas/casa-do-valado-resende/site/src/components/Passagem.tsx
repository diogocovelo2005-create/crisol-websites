'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A passagem: a frase curta que fecha uma secção e abre a seguinte (do
  BRIEF). É a dobradiça do fio: o filete desce da secção que acaba e a
  frase assenta na ponta dele. A Folha prende a secção com a última
  passagem a 45% do ecrã, e a folha seguinte sobe por cima dela.

  Presa ao scroll. A frase entra inteira, não palavra a palavra: assim
  distingue-se das vozes dos hóspedes, que chegam como ditas.
  `data-passagem` é o que a Folha procura para saber onde prender.
*/
export default function Passagem({ children, escuro = false, className = '' }: { children: string; escuro?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);

  // do topo a 96% do ecrã até 58%: o filete primeiro, a frase a seguir
  const t = useTransform(pos, (v) => {
    const vh = medida.current.vh;
    return prender((vh * 0.96 - v) / (vh * 0.38));
  });
  const filete = useTransform(t, (k) => `scaleY(${prender(k / 0.55).toFixed(3)})`);
  const frase = useTransform(t, (k) => prender((k - 0.35) / 0.65));
  const desce = useTransform(frase, (k) => (k >= 1 ? 'none' : `translateY(${((1 - k) * -14).toFixed(1)}px)`));

  const corFilete = escuro ? 'bg-barro-claro/60' : 'bg-barro/50';
  const corFrase = escuro ? 'text-barro-claro' : 'text-barro';

  return (
    <div className={className}>
      <div ref={ref} data-passagem className="mx-auto flex max-w-[36rem] flex-col items-center px-6 text-center">
        {parado ? (
          <>
            <span aria-hidden className={`block h-10 w-px md:h-12 ${corFilete}`} />
            <p className={`voz mt-4 text-[1.45rem] leading-snug md:text-[1.85rem] ${corFrase}`}>{children}</p>
          </>
        ) : (
          <>
            <motion.span aria-hidden style={{ transform: filete }} className={`block h-10 w-px origin-top md:h-12 ${corFilete}`} />
            <motion.p
              style={{ opacity: frase, transform: desce }}
              className={`voz mt-4 text-[1.45rem] leading-snug md:text-[1.85rem] ${corFrase}`}
            >
              {children}
            </motion.p>
          </>
        )}
      </div>
    </div>
  );
}
