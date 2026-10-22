'use client';

import { motion, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  O título das secções da quinta chega dito, palavra a palavra, presas ao
  scroll: é a voz da família a contar. (Nas secções da casa os títulos
  chegam em bloco, com a página.) O *texto entre asteriscos* sai em <em>.
*/

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);

function Palavra({ r, i, n, children, em }: { r: MotionValue<number>; i: number; n: number; children: string; em: boolean }) {
  const a = (i / n) * 0.55;
  const k = useTransform(r, (v) => chegar(Math.min(1, Math.max(0, (v - a) / 0.45))));
  const transform = useTransform(k, (v) => `translate3d(0, ${((1 - v) * 0.45).toFixed(3)}em, 0)`);
  const Tag = em ? motion.em : motion.span;
  return (
    <Tag style={{ opacity: k, transform, display: 'inline-block' }}>
      {children}
    </Tag>
  );
}

export default function TituloDito({ texto, id, className }: { texto: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref);
  const palavras = texto.split('*').flatMap((parte, j) => parte.split(' ').filter(Boolean).map((p) => ({ p, em: j % 2 === 1 })));

  if (parado) {
    return (
      <h2 ref={ref} id={id} className={className}>
        {texto.split('*').map((p, j) => (j % 2 ? <em key={j}>{p}</em> : <span key={j}>{p}</span>))}
      </h2>
    );
  }
  return (
    <h2 ref={ref} id={id} className={className} aria-label={texto.replaceAll('*', '')}>
      {palavras.map((w, i) => (
        <span key={i} aria-hidden>
          <Palavra r={r} i={i} n={palavras.length} em={w.em}>
            {w.p}
          </Palavra>{' '}
        </span>
      ))}
    </h2>
  );
}
