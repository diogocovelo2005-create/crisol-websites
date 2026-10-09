'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { suave, useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Um dos três tempos de «Um dia inteiro cá fora».

  Entrada: a foto chega parada e a legenda entra depois dela, como legenda
  de cena (o «quando» primeiro, o texto logo atrás).
  Saída: quando o plano sobe para fora do ecrã, escurece. Cada tempo
  escurece mais do que o anterior (`fim`): de manhã pouco, à tarde já como
  quem vê o sol a baixar, que é a frase que vem a seguir.
*/
type Dados = {
  foto: string;
  alt: string;
  foco: string;
  quando: string;
  o_que: string;
  texto: string;
};

export default function Plano({ p, primeiro, fim, direita = false }: { p: Dados; primeiro: boolean; fim: number; direita?: boolean }) {
  const caixa = useRef<HTMLDivElement>(null);
  const legenda = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();

  // saída: de o fundo do plano passar a 55% do ecrã até sair por cima
  const { pos, medida } = useMedida(caixa);
  const sombra = useTransform(pos, (v) => {
    const { altura, vh } = medida.current;
    const fundo = v + altura;
    return suave(prender((vh * 0.55 - fundo) / (vh * 0.55))) * fim;
  });

  // entrada da legenda
  const r = useRevelacao(legenda);
  const quandoOp = useTransform(r, (k) => suave(prender(k / 0.75)));
  const quandoTf = useTransform(r, (k) => (k >= 1 ? 'none' : `translateY(${((1 - suave(prender(k / 0.75))) * 18).toFixed(1)}px)`));
  const textoOp = useTransform(r, (k) => suave(prender((k - 0.25) / 0.75)));
  const textoTf = useTransform(r, (k) => (k >= 1 ? 'none' : `translateY(${((1 - suave(prender((k - 0.25) / 0.75))) * 12).toFixed(1)}px)`));

  const fixo = { opacity: 1, transform: 'none' };

  return (
    <div
      ref={caixa}
      className={`relative h-[78svh] min-h-[400px] overflow-hidden text-osso md:h-[50svh] ${primeiro ? '' : 'border-t-[6px] border-linho'}`}
    >
      <Image src={p.foto} alt={p.alt} fill sizes="100vw" quality={85} className="object-cover" style={{ objectPosition: p.foco }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-noite/75 to-transparent" />
      <div
        ref={legenda}
        className={`absolute inset-x-6 bottom-9 z-[1] mx-auto grid max-w-[1392px] gap-2.5 md:inset-x-10 md:bottom-12 lg:items-end lg:gap-x-12 lg:gap-y-6 ${
          direita ? 'justify-items-end text-right lg:grid-cols-[minmax(0,40ch)_14rem] lg:justify-end' : 'lg:grid-cols-[14rem_1fr]'
        }`}
      >
        <motion.h3
          className={`m-0 text-[clamp(2.2rem,4.8vw,4.4rem)] uppercase leading-[0.9] lg:row-span-2 ${direita ? 'lg:col-start-2 lg:row-start-1' : ''}`}
          style={parado ? fixo : { opacity: quandoOp, transform: quandoTf }}
        >
          {p.quando} <em>{p.o_que}</em>
        </motion.h3>
        <motion.p className={`m-0 max-w-[40ch] lg:row-start-2 ${direita ? 'lg:col-start-1' : 'lg:col-start-2'}`} style={parado ? fixo : { opacity: textoOp, transform: textoTf }}>
          {p.texto}
        </motion.p>
      </div>
      {!parado && <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-[2] bg-noite" style={{ opacity: sombra }} />}
    </div>
  );
}
