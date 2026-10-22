'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Uma fotografia impressa do álbum (papel, sombra, legenda), com a entrada
  presa ao scroll. Todas as entradas são da mesma família: a fotografia
  chega e é colada no papel (a mesma curva de chegada), mas cada uma traz
  o seu gesto, conforme o sítio de onde vem:

  - `de`: o deslocamento e a rotação de partida ({ x, y, r, s }); uma
    fotografia que escorrega para dentro do álbum vem de lado, uma que é
    pousada vem de cima e maior.
  - `fita`: a fita-cola chega no fim, já com a fotografia assente.
  - `cantos`: os cantos de álbum, em vez da fita (o álbum da casa por dentro).
  - a legenda escreve-se da esquerda para a direita, depois de a foto assentar.

  `rot` é a rotação final, a de quem colou a fotografia à mão.
*/

export type De = { x?: number; y?: number; r?: number; s?: number };

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

export default function Impressa({
  src,
  alt,
  foco = '50% 50%',
  legenda,
  rot = 0,
  de = { y: 40, r: 3, s: 1.04 },
  atraso = 0,
  fita = false,
  cantos = false,
  proporcao,
  altura,
  sizes,
  className = '',
  onAbrir,
}: {
  src: string;
  alt: string;
  foco?: string;
  legenda?: React.ReactNode;
  rot?: number;
  de?: De;
  atraso?: number;
  fita?: boolean | number;
  cantos?: boolean;
  proporcao?: string;
  altura?: string;
  sizes: string;
  className?: string;
  onAbrir?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const { x = 0, y = 0, r: dr = 0, s = 1 } = de;

  const transform = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0, 0.85));
    const f = 1 - k;
    return `translate3d(${(x * f).toFixed(1)}px, ${(y * f).toFixed(1)}px, 0) rotate(${(rot + dr * f).toFixed(2)}deg) scale(${(1 + (s - 1) * f).toFixed(4)})`;
  });
  const opacidade = useTransform(r, [0, 0.35], [0, 1]);
  const fitaOp = useTransform(r, [0.75, 0.9], [0, 1]);
  const fitaRot = typeof fita === 'number' ? fita : -3;
  const fitaT = useTransform(r, (v) => `rotate(${fitaRot}deg) scale(${(1.3 - 0.3 * chegar(fatia(v, 0.75, 0.95))).toFixed(3)})`);
  const cantoOp = useTransform(r, [0.7, 0.88], [0, 0.82]);
  const cantoS = useTransform(r, (v) => `scale(${(1.6 - 0.6 * chegar(fatia(v, 0.7, 0.92))).toFixed(3)})`);
  const escrita = useTransform(r, (v) => `inset(-4px ${((1 - chegar(fatia(v, 0.72, 1))) * 100).toFixed(1)}% -4px 0)`);

  // com movimento reduzido, valores explícitos (o 1.º render já escreveu os animados)
  const estilo = parado ? { transform: `rotate(${rot}deg)`, opacity: 1 } : { transform, opacity: opacidade };

  const imagem = (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: proporcao, height: altura }}>
      <Image src={src} alt={alt} fill sizes={sizes} quality={85} className="object-cover" style={{ objectPosition: foco }} />
    </div>
  );

  return (
    <motion.figure ref={ref} style={estilo} className={`foto ${className}`}>
      {fita !== false && <motion.span aria-hidden className="fita-cola" style={parado ? { transform: `rotate(${fitaRot}deg)`, opacity: 1 } : { opacity: fitaOp, transform: fitaT }} />}
      {cantos &&
        ['canto-a', 'canto-b', 'canto-c', 'canto-d'].map((c) => (
          <motion.span key={c} aria-hidden className={`canto ${c}`} style={parado ? { opacity: 0.82, transform: 'none' } : { opacity: cantoOp, transform: cantoS }} />
        ))}
      {onAbrir ? (
        <button type="button" onClick={onAbrir} className="group block w-full cursor-zoom-in text-left" aria-label={`Ver maior: ${alt}`}>
          {imagem}
        </button>
      ) : (
        imagem
      )}
      {legenda && (
        <motion.figcaption style={parado ? { clipPath: 'none' } : { clipPath: escrita }}>{legenda}</motion.figcaption>
      )}
    </motion.figure>
  );
}
