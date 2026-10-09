'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  As fotos dos quartos em muro (o Masonry do React Bits, adaptado):
  duas colunas desencontradas, uma alta e uma baixa de cada lado, como
  fotografias postas numa parede. A entrada é a do Masonry, as fotos a
  subirem de baixo e a assentarem, uma coluna atrás da outra; aqui presa
  ao scroll (no componente original arranca sozinha com o tempo) e sem o
  desfoque (só transform e opacity). Ao passar o rato, a foto recua um
  pouco, como no original.

  Serve a pausa dos quartos: depois do dia lá fora, a casa arruma-se
  devagar para a noite, um quarto de cada vez.

  Com movimento reduzido fica tudo no lugar.
*/

export type FotoQuarto = { src: string; alt: string; legenda: string; foco: string };

function Tijolo({ foto, alta, atraso }: { foto: FotoQuarto; alta: boolean; atraso: number }) {
  const ref = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso });
  const transform = useTransform(r, (k) => (k >= 1 ? 'none' : `translateY(${((1 - suave(k)) * 120).toFixed(1)}px)`));
  const opacity = useTransform(r, (k) => Math.min(1, suave(k) * 1.4));

  return (
    <motion.figure ref={ref} className="m-0" style={parado ? { opacity: 1, transform: 'none' } : { opacity, transform }}>
      <div
        className={`relative w-full overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[0.97] ${
          alta ? 'h-[340px] lg:h-[54svh] lg:min-h-[420px]' : 'h-[260px] lg:h-[36svh] lg:min-h-[290px]'
        }`}
      >
        <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" style={{ objectPosition: foto.foco }} />
      </div>
      <figcaption className="mt-2.5 px-6 font-display text-[1.05rem] italic text-tinta-medio lg:px-10">{foto.legenda}</figcaption>
    </motion.figure>
  );
}

/* fotos: [alta, baixa] à esquerda e [baixa, alta] à direita */
export default function MuroQuartos({ fotos }: { fotos: [FotoQuarto, FotoQuarto, FotoQuarto, FotoQuarto] }) {
  const [a, b, c, d] = fotos;
  return (
    <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-x-2.5">
      <div className="grid content-start gap-2.5 lg:gap-4">
        <Tijolo foto={a} alta atraso={0} />
        <Tijolo foto={c} alta={false} atraso={0} />
      </div>
      <div className="grid content-start gap-2.5 lg:gap-4">
        <Tijolo foto={b} alta={false} atraso={0.05} />
        <Tijolo foto={d} alta atraso={0.05} />
      </div>
    </div>
  );
}
