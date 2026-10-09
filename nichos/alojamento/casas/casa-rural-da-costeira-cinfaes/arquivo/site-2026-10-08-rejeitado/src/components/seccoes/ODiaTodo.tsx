'use client';

import Image from 'next/image';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import Revelar from '@/components/Revelar';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useProgresso } from '@/lib/useProgresso';
import { suave, useRevelacao } from '@/lib/useRevelacao';

/*
  3 · O dia todo (sequencia). O efeito marcante do site: o travelling do
  dia. Um palco preso a ecra inteiro, como um plano de cinema: a camara
  corre a piscina de lado (a casa a esquerda, o churrasco coberto ao
  fundo), as tres linhas sucedem-se coladas a foto, a churrasqueira de 2013
  entra pequena junto da linha dela (nunca ampliada), o bilhar entra num
  corte lateral, na mesma direcao da camara, e no fim o plano funde-se no
  verde da faixa, que leva a sala.

  Porque este: o dia passa-se ca fora, sem sair da propriedade. Um so plano
  a correr o exterior conta isso melhor do que fotos soltas.

  Com movimento reduzido nao ha palco: fica a composicao parada (a piscina
  com a linha, o churrasco e o bilhar lado a lado).

  Fecha com a unica citacao solta do site, na faixa que leva a sala, com o
  terreno de 2013 em contraluz, pequeno, para respirar.
*/

const LINHA = 'max-w-[22ch] font-display text-[1.75rem] leading-[1.12] md:text-[2.4rem]';

function Linha({ p, entra, sai, children }: { p: MotionValue<number>; entra: [number, number] | null; sai: [number, number]; children: React.ReactNode }) {
  const op = useTransform(p, (v) => {
    const dentro = entra ? suave(Math.min(1, Math.max(0, (v - entra[0]) / (entra[1] - entra[0])))) : 1;
    const fora = 1 - suave(Math.min(1, Math.max(0, (v - sai[0]) / (sai[1] - sai[0]))));
    return Math.min(dentro, fora);
  });
  const transform = useTransform(p, (v) => {
    const d = entra ? 1 - suave(Math.min(1, Math.max(0, (v - entra[0]) / (entra[1] - entra[0])))) : 0;
    const f = suave(Math.min(1, Math.max(0, (v - sai[0]) / (sai[1] - sai[0]))));
    return `translate3d(0, ${(d * 18 - f * 14).toFixed(1)}px, 0)`;
  });
  return (
    <motion.p style={{ opacity: op, transform }} className={`absolute bottom-0 left-0 ${LINHA}`}>
      {children}
    </motion.p>
  );
}

function Travelling() {
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');

  // a camara: corre a piscina da casa para o churrasco, e para
  const camara = useTransform(p, (v) => {
    const k = 0.08 + 0.64 * suave(Math.min(1, v / 0.6));
    return `translate3d(calc(${(-k).toFixed(4)} * (100% - 100vw)), 0, 0)`;
  });

  // a churrasqueira de 2013: abre de baixo para cima, pequena
  const churrasco = useTransform(p, (v) => {
    const r = suave(Math.min(1, Math.max(0, (v - 0.28) / 0.08)));
    return `inset(${((1 - r) * 100).toFixed(1)}% 0 0 0)`;
  });
  const churrascoOp = useTransform(p, [0.28, 0.33, 0.52, 0.57], [0, 1, 1, 0]);

  // o corte para o bilhar: entra pela direita, na direcao da camara
  const corte = useTransform(p, (v) => {
    const r = Math.min(1, Math.max(0, (v - 0.56) / 0.12));
    const e = r < 0.5 ? 4 * r * r * r : 1 - Math.pow(-2 * r + 2, 3) / 2;
    return `inset(0 0 0 ${((1 - e) * 100).toFixed(2)}%)`;
  });
  const corteCamara = useTransform(p, (v) => {
    const r = suave(Math.min(1, Math.max(0, (v - 0.56) / 0.3)));
    return `translate3d(${(-r * 6).toFixed(2)}%, 0, 0)`;
  });

  // o fim: o plano funde-se no verde da faixa
  const fundir = useTransform(p, [0.87, 1], [0, 1]);
  // a regua dos tres tempos, para se saber onde se esta
  const regua = useTransform(p, (v) => `scaleX(${Math.min(1, v / 0.86).toFixed(3)})`);

  return (
    <div ref={alvo} className="relative h-[400lvh]">
      <div className="sticky top-0 h-lvh overflow-hidden text-osso">
        {/* 1 e 2: a piscina, num plano mais largo que o ecra */}
        <motion.div style={{ transform: camara }} className="absolute inset-y-0 left-0 w-[max(130vw,150lvh)] will-change-transform">
          <Image
            src="/fotos/piscina-06.jpg"
            alt="A piscina comprida com o trampolim, a casa de granito à esquerda, o churrasco coberto ao fundo e a encosta"
            fill
            sizes="(max-width: 767px) 330vw, 130vw"
            className="object-cover"
            style={{ objectPosition: '50% 50%' }}
          />
        </motion.div>

        {/* 3: o bilhar, num corte lateral */}
        <motion.div style={{ clipPath: corte }} className="absolute inset-0 overflow-hidden">
          <motion.div style={{ transform: corteCamara }} className="absolute inset-y-0 left-0 w-[108%]">
            <Image
              src="/fotos/jogos-01.jpg"
              alt="A zona coberta com a mesa de bilhar, os matraquilhos e duas cadeiras de madeira, sobre relva sintética"
              fill
              sizes="110vw"
              className="object-cover"
              style={{ objectPosition: '50% 50%' }}
            />
          </motion.div>
        </motion.div>

        {/* veu so onde esta o texto */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-noite/80 via-noite/45 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1320px] px-6 pb-10 md:px-10 md:pb-14">
          <motion.figure
            style={{ clipPath: churrasco, opacity: churrascoOp }}
            className="m-0 mb-6 w-[11rem] md:mb-8 md:w-[18rem]"
          >
            <Image
              src="/fotos/churrasqueira-02.jpg"
              alt="O alpendre do churrasco com o forno a lenha e uma rede, numa foto da casa de 2013"
              width={720}
              height={540}
              sizes="(min-width: 768px) 288px, 176px"
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.figure>

          <div className="relative h-[6.6rem] md:h-[8.4rem]">
            <Linha p={p} entra={null} sai={[0.22, 0.28]}>
              Piscina com trampolim e espreguiçadeiras.
            </Linha>
            <Linha p={p} entra={[0.29, 0.35]} sai={[0.52, 0.57]}>
              Churrasqueira e forno a lenha, com mesa ao ar livre.
            </Linha>
            <Linha p={p} entra={[0.66, 0.72]} sai={[0.86, 0.92]}>
              Bilhar e matraquilhos, à sombra.
            </Linha>
          </div>

          <div aria-hidden className="mt-6 h-px w-24 bg-osso/30 md:mt-8">
            <motion.div style={{ transform: regua }} className="h-full w-full origin-left bg-osso" />
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: fundir }} className="pointer-events-none absolute inset-0 bg-agua" />
      </div>
    </div>
  );
}

function Parado() {
  return (
    <>
      <div className="relative h-[72svh] min-h-[440px] overflow-hidden text-osso md:h-[78svh] md:min-h-[560px]">
        <Image
          src="/fotos/piscina-06.jpg"
          alt="A piscina comprida com o trampolim, a casa de granito à esquerda, o churrasco coberto ao fundo e a encosta"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '50% 50%' }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-noite/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1320px] px-6 pb-8 md:px-10 md:pb-12">
          <p className={LINHA}>Piscina com trampolim e espreguiçadeiras.</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-x-8 gap-y-12 px-6 pb-20 pt-12 md:grid-cols-12 md:px-10 md:pb-28 md:pt-16">
        <figure className="m-0 md:col-span-5">
          <Image
            src="/fotos/churrasqueira-02.jpg"
            alt="O alpendre do churrasco com o forno a lenha e uma rede, numa foto da casa de 2013"
            width={720}
            height={540}
            sizes="(min-width: 768px) 400px, 80vw"
            className="aspect-[4/3] w-[82%] max-w-[26rem] object-cover md:w-full"
          />
          <figcaption className="mt-4 max-w-[30ch] font-display text-[1.35rem] leading-[1.2] md:text-[1.5rem]">
            Churrasqueira e forno a lenha, com mesa ao ar livre.
          </figcaption>
        </figure>

        <figure className="m-0 md:col-span-7 md:mt-24">
          <div className="relative aspect-[3/2]">
            <Image
              src="/fotos/jogos-01.jpg"
              alt="A zona coberta com a mesa de bilhar, os matraquilhos e duas cadeiras de madeira, sobre relva sintética"
              fill
              sizes="(min-width: 1320px) 720px, (min-width: 768px) 55vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 50%' }}
            />
          </div>
          <figcaption className="mt-4 max-w-[30ch] font-display text-[1.35rem] leading-[1.2] md:text-[1.5rem]">
            Bilhar e matraquilhos, à sombra.
          </figcaption>
        </figure>
      </div>
    </>
  );
}

function Faixa() {
  const ref = useRef<HTMLQuoteElement>(null);
  const r = useRevelacao(ref);

  return (
    // o fundo desce do verde da encosta para o escuro da sala: o sol a baixar
    <div className="bg-[linear-gradient(to_bottom,var(--color-agua)_62%,var(--color-serao))] px-6 pb-24 pt-10 text-center text-osso md:pb-28 md:pt-12">
      <figure className="m-0 mx-auto mb-14 w-40 md:mb-16 md:w-52">
        <Image
          src="/fotos/jardim-08.jpg"
          alt="O terreno da casa em contraluz, numa foto de 2013"
          width={632}
          height={472}
          sizes="208px"
          className="aspect-[4/3] w-full object-cover"
        />
      </figure>
      <blockquote ref={ref} className="mx-auto max-w-[34rem]">
        <ScrollReveal progresso={r} className="font-display text-[1.75rem] italic leading-[1.15] md:text-[2.5rem]">
          “é uma casa muito bem aquecida e confortável no inverno.”
        </ScrollReveal>
        <footer className="versalete mt-6 text-liquen">Tarsila · Airbnb</footer>
      </blockquote>
      <Revelar className="mx-auto mt-14 w-fit">
        <p className="passagem text-osso [&::before]:mx-auto">Quando o sol baixa, entra-se.</p>
      </Revelar>
    </div>
  );
}

export default function ODiaTodo() {
  const parado = useMovimentoReduzido();

  return (
    <section id="dia" className="scroll-mt-20 bg-linho">
      <div className="mx-auto max-w-[1320px] px-6 pb-10 md:px-10 md:pb-14">
        <h2 className="titulo-seccao">
          O dia <em>todo</em>
        </h2>
      </div>

      {parado ? <Parado /> : <Travelling />}

      <Faixa />
    </section>
  );
}
