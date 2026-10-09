'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A família de entradas das fotos: todas abrem por clip-path enquanto a
  foto assenta (escala de 1.06 a 1), presas ao scroll, com a mesma curva.
  O que muda é por onde a foto abre, e isso diz o que ela conta:

  - 'direita' / 'esquerda'  Cá fora: a foto abre a partir do lado da
     frase, para fora. O olho vai da frase para o sítio, como num dia que
     passa de um canto do jardim para o outro.
  - 'centro'   Por dentro, a sala: abre do meio para os lados, como duas
     portadas. "Entra-se na pedra."
  - 'baixo'    Por dentro, as fotos pequenas: de cima para baixo, como o
     plano seguinte de um filme (a entrada que o site já tinha).
  - 'lados'    À volta, o rio: a vista alarga-se, "à volta há mais".
  - 'faixa'    Opiniões: a faixa de cinema abre do meio, como o ecrã de
     uma sala quando as barras se afastam.

  No telemóvel acompanha o dedo e para quando ele para. Com movimento
  reduzido fica aberta, sem escala.
*/
export type Abertura = 'baixo' | 'direita' | 'esquerda' | 'centro' | 'lados' | 'faixa';

const recorte: Record<Abertura, (s: number) => string> = {
  baixo: (s) => `inset(0 0 ${s * 100}% 0)`,
  direita: (s) => `inset(0 ${s * 100}% 0 0)`,
  esquerda: (s) => `inset(0 0 0 ${s * 100}%)`,
  centro: (s) => `inset(0 ${s * 50}% 0 ${s * 50}%)`,
  // pouco: o texto claro pousado na foto nunca pode cair na margem de linho
  lados: (s) => `inset(${s * 4}% ${s * 5}% ${s * 4}% ${s * 5}%)`,
  faixa: (s) => `inset(${s * 50}% 0 ${s * 50}% 0)`,
};

export default function FotoPlano({
  src,
  alt,
  sizes,
  foco = '50% 50%',
  className = '',
  qualidade = 85,
  abre = 'baixo',
  atraso = 0,
  children,
}: {
  src: string;
  alt: string;
  sizes: string;
  foco?: string;
  className?: string;
  qualidade?: number;
  abre?: Abertura;
  atraso?: number;
  /* por cima da foto e dentro do recorte (ex.: um véu) */
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const clipPath = useTransform(r, (k) => (k >= 1 ? 'none' : recorte[abre](Number((1 - suave(k)).toFixed(4)))));
  const transform = useTransform(r, (k) => (k >= 1 ? 'none' : `scale(${(1 + (1 - suave(k)) * 0.06).toFixed(4)})`));
  const posicao = /\b(absolute|fixed)\b/.test(className) ? '' : 'relative';

  return (
    <motion.div ref={ref} className={`${posicao} overflow-hidden ${className}`} style={parado ? { clipPath: 'none' } : { clipPath }}>
      <motion.div className="absolute inset-0" style={parado ? { transform: 'none' } : { transform }}>
        <Image src={src} alt={alt} fill sizes={sizes} quality={qualidade} className="object-cover" style={{ objectPosition: foco }} />
      </motion.div>
      {children}
    </motion.div>
  );
}
