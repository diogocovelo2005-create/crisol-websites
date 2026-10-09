"use client";

import { motion, useReducedMotion } from "motion/react";

const DURACAO_FOCO = 2.4;
const DURACAO_OPACIDADE = 0.9;

export function TituloHero() {
  const semMovimento = useReducedMotion();

  const baseAnim = semMovimento
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
    : {
        initial: { filter: "blur(18px)", opacity: 0, y: 15 },
        animate: { filter: "blur(0px)", opacity: 1, y: 0 },
        transition: {
          filter: { duration: DURACAO_FOCO, ease: [0.25, 0.55, 0.3, 1] as const },
          opacity: { duration: DURACAO_OPACIDADE, ease: "easeOut" as const },
          y: { duration: 1.5, ease: [0.16, 1, 0.3, 1] as const },
        },
      };

  return (
    <>
      <motion.div {...baseAnim} style={{ willChange: "filter, opacity, transform" }}>
        <span className="block text-cal [text-shadow:0_4px_32px_rgba(34,31,27,0.7)]">
          Acorde com o
        </span>
      </motion.div>

      <motion.div
        {...baseAnim}
        transition={semMovimento ? baseAnim.transition : { ...baseAnim.transition as any, delay: 0.15 }}
        style={{ willChange: "filter, opacity, transform" }}
      >
        <span className="block text-cal [text-shadow:0_4px_32px_rgba(34,31,27,0.7)]">
          vale à janela
        </span>
      </motion.div>
    </>
  );
}
