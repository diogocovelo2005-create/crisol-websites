'use client';

import { motion } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A entrada de cada bloco. Serve a hierarquia: o olho apanha o bloco a
  assentar e sabe onde comecar a ler. Nao e decoracao, e por isso e que
  e curta e so acontece uma vez por elemento.

  `atraso` escalona irmaos dentro da mesma composicao. Acima de uns
  0.25s ja se nota a espera, portanto nao convem passar disso.
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
  const parado = useMovimentoReduzido();

  if (parado) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.75, delay: atraso, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
