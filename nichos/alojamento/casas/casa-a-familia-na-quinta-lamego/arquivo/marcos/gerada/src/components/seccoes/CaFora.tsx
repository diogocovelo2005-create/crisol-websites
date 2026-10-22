'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import Impressa from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  6 · Cá fora: o postal, frente e verso (C). O postal chega e endireita-se;
  na frente o vale abre-se do meio para os lados, como quem chega à
  varanda; no verso o selo é carimbado em Lamego. Por baixo, mais duas
  fotografias da varanda, pousadas cada uma do seu lado.
*/

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

function Postal() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref);

  const transform = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0, 0.8));
    return `translate3d(0, ${((1 - k) * 70).toFixed(1)}px, 0) rotate(${(-0.8 - (1 - k) * 3).toFixed(2)}deg)`;
  });
  const opacidade = useTransform(r, [0, 0.3], [0, 1]);
  const vale = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0.15, 0.95));
    return `inset(0 ${((1 - k) * 38).toFixed(2)}% 0 ${((1 - k) * 38).toFixed(2)}%)`;
  });
  const seloT = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0.72, 0.9));
    return `rotate(${(4 + (1 - k) * 12).toFixed(2)}deg) scale(${(1 + (1 - k) * 0.45).toFixed(3)})`;
  });
  const seloOp = useTransform(r, [0.72, 0.8], [0, 1]);
  const carimboOp = useTransform(r, [0.86, 0.96], [0, 0.75]);
  const carimboT = useTransform(r, (v) => `rotate(-14deg) scale(${(1.15 - 0.15 * chegar(fatia(v, 0.86, 1))).toFixed(3)})`);

  return (
    <motion.div
      ref={ref}
      style={parado ? { transform: 'rotate(-0.8deg)', opacity: 1 } : { transform, opacity: opacidade }}
      className="grid grid-cols-1 bg-cartao text-tinta shadow-[0_24px_50px_rgba(44,31,22,0.28)] lg:grid-cols-[7fr_5fr]"
    >
      <div className="relative p-4">
        <motion.div style={parado ? { clipPath: 'none' } : { clipPath: vale }} className="relative h-[340px] overflow-hidden lg:h-[600px]">
          <Image src="/fotos/airbnb-04.jpg" alt="A varanda com o spa, as espreguiçadeiras, a mesa e o corrimão de madeira, e o vale ao fundo" fill sizes="(max-width: 1023px) 92vw, 740px" quality={85} className="object-cover" style={{ objectPosition: '55% 60%' }} />
        </motion.div>
        <span className="absolute bottom-[30px] left-8 bg-cartao px-3 py-1.5 font-display text-[0.95rem]">O vale, da varanda.</span>
      </div>
      <div className="relative mx-4 mb-4 flex flex-col border-t border-tinta/20 px-2 pb-8 pt-10 lg:mx-0 lg:my-4 lg:border-l lg:border-t-0 lg:pb-9 lg:pl-10 lg:pr-11 lg:pt-11">
        <motion.div
          style={parado ? { transform: 'rotate(4deg)', opacity: 1 } : { transform: seloT, opacity: seloOp }}
          className="absolute right-[30px] top-[30px] w-[110px] border-[3px] border-dotted border-telha/60 bg-cartao p-[5px]"
        >
          <div className="relative h-[120px]">
            <Image src="/fotos/airbnb-30.jpg" alt="O spa e as espreguiçadeiras na varanda, com o vale ao fundo" fill sizes="100px" className="object-cover" style={{ objectPosition: '45% 60%' }} />
          </div>
        </motion.div>
        {/* o carimbo dos correios */}
        <motion.svg
          aria-hidden
          viewBox="0 0 120 120"
          style={parado ? { opacity: 0.75, transform: 'rotate(-14deg)' } : { opacity: carimboOp, transform: carimboT }}
          className="pointer-events-none absolute right-[100px] top-[96px] w-[104px] text-telha"
        >
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <defs>
            <path id="carimbo-arco" d="M 60 60 m -45 0 a 45 45 0 1 1 90 0" />
          </defs>
          <text fontSize="13" letterSpacing="4" fill="currentColor" fontFamily="var(--font-corpo)" fontWeight="600">
            <textPath href="#carimbo-arco" startOffset="50%" textAnchor="middle">
              LAMEGO
            </textPath>
          </text>
          <path d="M28 66 H92 M28 74 H92" stroke="currentColor" strokeWidth="1.5" />
        </motion.svg>
        <h2 id="fora-varanda-titulo" className="mt-5 max-w-[11ch] text-[2rem] leading-[1.12] lg:text-[2.3rem]">
          Cá fora, a varanda é só vossa, <em>de frente para o vale</em>
        </h2>
        <p className="mt-[22px] bg-[repeating-linear-gradient(transparent_0_27px,rgba(44,31,22,0.16)_27px_28px)] leading-[28px]">
          A varanda é privativa: spa de hidromassagem, mesa, cadeiras, espreguiçadeiras e guarda-sol. Ao lado, um duche exterior com água quente. Da varanda e das janelas vê-se o vale e as montanhas.
        </p>
        <blockquote className="cita mt-[22px]">
          <p className="!text-[1.15rem]">&ldquo;Uma bonita vista da varanda e das janelas no interior da casa.&rdquo;</p>
          <cite>Joana, Airbnb</cite>
        </blockquote>
      </div>
    </motion.div>
  );
}

export default function CaFora() {
  return (
    <section id="varanda" className="scroll-mt-20 py-[110px]" aria-labelledby="fora-varanda-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <Revelar>
          <p className="pagina mb-[30px]">
            A casa <span>· cá fora</span>
          </p>
        </Revelar>
        <Postal />
        <div className="mt-16 grid grid-cols-1 items-start gap-10 md:grid-cols-12">
          <Impressa
            src="/fotos/airbnb-10.jpg"
            alt="O pátio com o spa ao centro, as espreguiçadeiras, a mesa redonda e, à esquerda, a cerca de madeira com o duche exterior"
            foco="55% 50%"
            proporcao="3 / 2"
            rot={-2.5}
            de={{ x: -80, y: 30, r: -6 }}
            fita
            legenda="Um duche ao ar livre, com água quente."
            sizes="(max-width: 767px) 92vw, 520px"
            className="md:col-span-5 md:col-start-2"
          />
          <Impressa
            src="/fotos/airbnb-27.jpg"
            alt="O corrimão de madeira junto à parede de pedra e ao telhado, com as colinas e o vale ao fundo"
            foco="60% 45%"
            proporcao="3 / 2"
            rot={2}
            de={{ x: 80, y: 30, r: 6 }}
            atraso={0.05}
            fita={3}
            sizes="(max-width: 767px) 92vw, 470px"
            className="md:col-span-5 md:col-start-8 md:mt-14"
          />
        </div>
        <Revelar>
          <p className="passagem mt-12">Quando a estadia acaba, a quinta continua. E pode continuar convosco.</p>
        </Revelar>
      </div>
    </section>
  );
}
