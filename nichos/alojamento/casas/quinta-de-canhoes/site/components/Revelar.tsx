"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  atraso?: number;
  className?: string;
  /** Distância que o elemento sobe ao aparecer. */
  subida?: number;
};

/** Aparecimento discreto ao entrar no ecrã. Sem movimento, só opacidade, se assim for pedido. */
export function Revelar({ children, atraso = 0, className, subida = 18 }: Props) {
  const semMovimento = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: semMovimento ? 0 : subida }}
      whileInView={{ opacity: 1, y: 0 }}
      // Basta 5% do bloco estar visível. A margem negativa que aqui
      // estava exigia que o bloco entrasse bem dentro do ecrã, o que em
      // ecrãs pequenos, com blocos altos, podia nunca acontecer.
      viewport={{ once: true, amount: 0.05 }}
      transition={{
        duration: semMovimento ? 0.2 : 0.85,
        delay: atraso,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
