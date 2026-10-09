'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useRef } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import Revelar from '@/components/Revelar';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  Ato 2 - O mundo onde vai entrar. Sentimento: intimidade.

  A historia da casa em texto corrido, com a colagem de fotos a
  mexer a velocidades diferentes (a pequena mais depressa), para haver
  profundidade entre as duas.
*/

export default function Atmosfera() {
  const a = casa.atmosfera;
  const parado = useMovimentoReduzido();
  const colagem = useRef<HTMLDivElement>(null);
  const pc = useProgresso(colagem, 'passagem');
  const yGrande = useTransform(pc, [0, 1], [30, -30]);
  const yPequena = useTransform(pc, [0, 1], [110, -110]);

  return (
    <section id="a-casa" className="scroll-mt-20">
      {/* a historia */}
      <div className="mx-auto max-w-[1320px] px-6 pt-28 md:px-10 md:pt-36">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
          <Revelar className="lg:col-span-5">
            <p className="versalete text-ouro-escuro">{a.etiqueta}</p>
            <h2 className="mt-5 text-[2.5rem] text-tinta md:text-[3.2rem]">
              <Titulo texto={a.titulo} />
            </h2>
            <span aria-hidden className="mt-7 block h-px w-12 bg-ouro" />
            <p className="mt-7 max-w-[46ch] font-light leading-[1.8] text-tinta-medio">{a.texto}</p>
            <Botao href="#espacos" tom="contorno" className="mt-10">
              Ver os espaços
            </Botao>
          </Revelar>

          <div ref={colagem} className="relative pb-16 lg:col-span-6 lg:col-start-7">
            <motion.div
              style={parado ? undefined : { y: yGrande }}
              className="relative aspect-[5/6] w-[86%] overflow-hidden rounded-[10px] sm:aspect-[4/4.2]"
            >
              <Image src={a.imagem} alt={a.alt} fill quality={88} sizes="(max-width: 1024px) 150vw, 70vw" className="object-cover" />
            </motion.div>
            {a.imagemPequena && a.altPequena && (
              <motion.div
                style={parado ? undefined : { y: yPequena }}
                className="absolute bottom-0 right-0 aspect-[4/5] w-[44%] overflow-hidden rounded-[10px] border-[6px] border-linho shadow-[0_20px_50px_-24px_rgba(34,38,31,0.45)]"
              >
                <Image src={a.imagemPequena} alt={a.altPequena} fill quality={85} sizes="(max-width: 1024px) 44vw, 22vw" className="object-cover" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
