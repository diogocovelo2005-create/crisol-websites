'use client';

import Image from 'next/image';
import { easeInOut, motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import AcoesReserva from '@/components/AcoesReserva';
import Titulo from '@/components/Titulo';

/*
  VARIANTE F2 - Portão.

  A foto esta atras de duas folhas verde-floresta que se abrem para os
  lados com o scroll, como um portão de madeira contemporâneo e neutro. O convite e o
  botao ficam sempre ao centro e sempre claros: sobre o verde e, depois,
  sobre a foto escurecida. No fim a foto ocupa tudo e fica parada.
*/

export default function F2Portadas() {
  const f = casa.fecho;
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');

  const esquerda = useTransform(p, [0.08, 0.7], ['0%', '-101%'], { ease: easeInOut });
  const direita = useTransform(p, [0.08, 0.7], ['0%', '101%'], { ease: easeInOut });
  // as folhas rodam um pouco nas dobradicas, para parecerem portadas e nao cortinas
  const rodaE = useTransform(p, [0.08, 0.7], [0, -14]);
  const rodaD = useTransform(p, [0.08, 0.7], [0, 14]);
  const escala = useTransform(p, [0.08, 0.8], [1.15, 1]);
  const veu = useTransform(p, [0.3, 0.75], [0, 0.45]);
  const parado = useMovimentoReduzido();

  const convite = (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-osso">
      <p className="versalete text-ouro">{f.etiqueta}</p>
      <h2 className="mt-5 max-w-[16ch] text-[3rem] md:text-[5rem]">
        <Titulo texto={f.titulo} />
      </h2>
      <p className="mt-6 max-w-[42ch] font-light leading-[1.8] text-osso/85">{f.texto}</p>
      <div className="mt-10 flex justify-center"><AcoesReserva claro /></div>
    </div>
  );

  // com movimento reduzido: as portadas ja estao abertas
  if (parado) {
    return (
      <section id="reservar" className="relative h-dvh min-h-[640px] overflow-hidden">
        <Image src={f.imagem} alt={f.alt} fill sizes="100vw" quality={85} className="object-cover" />
        <div className="absolute inset-0 bg-noite/45" />
        {convite}
      </section>
    );
  }

  return (
    <section id="reservar" ref={alvo} className="relative h-[220vh] bg-floresta">
      <div className="sticky top-0 h-screen overflow-hidden [perspective:1600px]">
        <motion.div style={{ scale: escala }} className="absolute inset-0">
          <Image src={f.imagem} alt={f.alt} fill sizes="100vw" quality={85} className="object-cover" />
        </motion.div>
        <motion.div style={{ opacity: veu }} className="absolute inset-0 bg-noite" />

        <motion.div
          style={{ x: esquerda, rotateY: rodaE }}
          className="absolute inset-y-0 left-0 w-1/2 origin-left border-r border-black/25"
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-floresta)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0, rgba(255,255,255,.045) 1px, transparent 1px, transparent 9.5vw), linear-gradient(90deg, color-mix(in srgb, var(--color-floresta) 88%, black), color-mix(in srgb, var(--color-floresta) 70%, var(--color-ouro)))' }} />
          <div className="absolute inset-7 border border-black/25 shadow-[inset_0_0_0_4px_rgba(255,255,255,.035)] md:inset-12" />
          <div className="absolute right-5 top-1/2 h-20 w-2 -translate-y-1/2 rounded-full bg-noite shadow-lg md:right-8" />
        </motion.div>
        <motion.div
          style={{ x: direita, rotateY: rodaD }}
          className="absolute inset-y-0 right-0 w-1/2 origin-right border-l border-black/25"
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-floresta)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0, rgba(255,255,255,.045) 1px, transparent 1px, transparent 9.5vw), linear-gradient(90deg, color-mix(in srgb, var(--color-floresta) 70%, var(--color-ouro)), color-mix(in srgb, var(--color-floresta) 88%, black))' }} />
          <div className="absolute inset-7 border border-black/25 shadow-[inset_0_0_0_4px_rgba(255,255,255,.035)] md:inset-12" />
          <div className="absolute left-5 top-1/2 h-20 w-2 -translate-y-1/2 rounded-full bg-noite shadow-lg md:left-8" />
        </motion.div>

        {convite}
      </div>
    </section>
  );
}
