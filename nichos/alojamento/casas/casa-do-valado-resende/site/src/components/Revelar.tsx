'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A entrada de cada bloco, igual em toda a página: sobe um pouco e
  aparece enquanto o topo dele atravessa o último quarto do ecrã.

  Presa ao scroll, não ao tempo: no telemóvel chega ao ritmo do dedo e
  para quando ele para, nada fica a acabar sozinho depois do gesto. Num
  salto por âncora, o que está no destino já está no sítio.

  `atraso` escalona irmãos da mesma linha (uma foto e o texto dela
  chegam juntos, o segundo um passo atrás): desloca a janela de entrada
  uns pontos percentuais do ecrã, não segundos.
*/
export default function Revelar({
  children,
  atraso = 0,
  y = 26,
  className,
}: {
  children: React.ReactNode;
  atraso?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);

  const t = useTransform(pos, (v) => {
    const vh = medida.current.vh;
    const d = atraso * 0.6;
    const k = prender((vh * (1 - d) - v) / (vh * 0.24));
    return 1 - (1 - k) * (1 - k);
  });
  const transform = useTransform(t, (k) => (k >= 1 ? 'none' : `translateY(${((1 - k) * y).toFixed(1)}px)`));

  if (parado) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ opacity: t, transform }}>
      {children}
    </motion.div>
  );
}
