'use client';

import { motion, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  A linha do dia (de B), "lá fora, o dia todo": o filete que liga a
  piscina, o deck e a churrasqueira desenha-se à medida que se lê.

  Para quê: diz que os três momentos são um dia só, um a seguir ao outro,
  e mostra onde se vai nele. No telemóvel a linha é vertical e a ponta
  dela acompanha o ponto de leitura (62% da altura do ecrã), por isso
  anda com o dedo e para com ele. No computador é horizontal e corre da
  piscina à churrasqueira enquanto o bloco sobe.

  Só transform (scaleX / scaleY). Com movimento reduzido está desenhada
  desde o início.
*/
export default function LinhaDoDia({ children, className = '', lista = '' }: { children: React.ReactNode; className?: string; lista?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const largo = useMedia('(min-width: 768px)');
  const { pos, medida } = useMedida(ref);
  // por ref: a função do useTransform pode ficar com o valor do 1.º render
  const largoRef = useRef(largo);
  useEffect(() => {
    largoRef.current = largo;
  }, [largo]);

  const desenho = useTransform(pos, (v) => {
    const { altura, vh } = medida.current;
    return prender(largoRef.current ? (vh * 0.8 - v) / (vh * 0.35) : (vh * 0.62 - v) / altura);
  });

  const linha = largo ? 'left-0 right-0 top-7 h-px origin-left' : 'bottom-0 left-7 top-0 w-px origin-top';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.span
        key={parado ? 'parada' : 'viva'}
        aria-hidden
        style={parado ? undefined : largo ? { scaleX: desenho } : { scaleY: desenho }}
        className={`pointer-events-none absolute block bg-tinta/30 ${linha}`}
      />
      <ol className={lista}>{children}</ol>
    </div>
  );
}
