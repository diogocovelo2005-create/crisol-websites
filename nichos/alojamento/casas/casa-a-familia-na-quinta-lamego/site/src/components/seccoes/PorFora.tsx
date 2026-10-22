'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import Impressa from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  2 · Por fora. A casa de pedra (pousada, com a fita); o portão e o
  terraço saíram na correção 4, a pedido do Diogo. A ficha é a
  etiqueta pendurada pelo ilhó: chega a baloiçar e para, como a etiqueta
  de uma chave quando se pousa.
*/

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// a varanda e o vale: a fotografia abre-se do meio para os lados
function Vale() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref);
  const transform = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0, 0.8));
    return `translate3d(0, ${((1 - k) * 60).toFixed(1)}px, 0) rotate(${(-1 - (1 - k) * 2.5).toFixed(2)}deg)`;
  });
  const opacidade = useTransform(r, [0, 0.3], [0, 1]);
  const abre = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0.12, 0.95));
    return `inset(0 ${((1 - k) * 38).toFixed(2)}% 0 ${((1 - k) * 38).toFixed(2)}%)`;
  });
  return (
    <motion.figure ref={ref} style={parado ? { transform: 'rotate(-1deg)', opacity: 1 } : { transform, opacity: opacidade }} className="foto relative !p-4">
      <motion.div style={parado ? { clipPath: 'none' } : { clipPath: abre }} className="relative h-[340px] overflow-hidden lg:h-[520px]">
        <Image src="/fotos/airbnb-04.jpg" alt="A varanda com o spa, as espreguiçadeiras, a mesa e o corrimão de madeira, e o vale ao fundo" fill sizes="(max-width: 1023px) 92vw, 780px" quality={85} className="object-cover" style={{ objectPosition: '55% 60%' }} />
      </motion.div>
      <figcaption className="absolute bottom-[30px] left-8 !mt-0 bg-cartao px-3 py-1.5 font-display text-[0.95rem]">O vale, da varanda.</figcaption>
    </motion.figure>
  );
}

const FICHA = [
  '60 m² em open space, de pedra, com teto e vigas de madeira à vista',
  'Cama queen e sofá-cama; uma casa de banho com duche',
  'Cozinha equipada e mesa de refeições',
  'Varanda privativa com spa de hidromassagem, mesa e espreguiçadeiras',
  'Duche exterior com água quente',
  'Ar condicionado, Wi-Fi, Netflix e Disney+',
  'Estacionamento gratuito em frente ao portão',
  'A Sé de Lamego a cerca de 4 minutos de carro',
];

function Etiqueta() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso: 0.04 });
  // um pêndulo amortecido, preso ao scroll: chega inclinada e assenta em 1,5°
  const transform = useTransform(r, (t) => {
    const ang = 1.5 + -18 * Math.exp(-3.4 * t) * Math.cos(2 * Math.PI * 1.25 * t) * (1 - t);
    return `translate3d(0, ${((1 - Math.min(1, t * 2.5)) * -36).toFixed(1)}px, 0) rotate(${ang.toFixed(2)}deg)`;
  });
  const opacidade = useTransform(r, [0, 0.25], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={parado ? { transform: 'rotate(1.5deg)', opacity: 1 } : { transform, opacity: opacidade }}
      className="relative origin-[20px_24px] rounded-[4px_14px_14px_4px] bg-cartao px-6 pb-[22px] pt-7 shadow-[0_12px_26px_rgba(44,31,22,0.16)] lg:mt-[110px]"
    >
      <span aria-hidden className="absolute left-[14px] top-[18px] size-3 rounded-full border-2 border-telha" />
      <h3 className="ml-[22px] text-[1.15rem]">A casa, ao certo</h3>
      <ul className="mt-4">
        {FICHA.map((l) => (
          <li key={l} className="border-t border-dashed border-tinta/30 py-2 text-[0.95rem] leading-[1.45]">
            {l}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function PorFora() {
  return (
    <section id="fora" className="scroll-mt-20 pb-[40px] pt-[70px]" aria-labelledby="fora-titulo">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-5 md:px-10 lg:grid-cols-[4fr_5fr_3fr] lg:items-start">
        <div>
          <Revelar>
            <p className="pagina">
              A casa <span>· de fora</span>
            </p>
            <h2 id="fora-titulo" className="mb-[26px] mt-[18px] text-[2.4rem] leading-[1.08] lg:text-[3.3rem]">
              De fora, uma casa de pedra <em>só para vocês</em>
            </h2>
          </Revelar>
          <Revelar atraso={0.04}>
            <p>Chega-se de carro e estaciona-se em frente ao portão, sem custo. Lá dentro da quinta, a casa: uma moradia de pedra, de construção tradicional, com entrada privada.</p>
          </Revelar>
        </div>

        <div className="relative">
          <Impressa
            src="/fotos/airbnb-32.jpg"
            alt="A fachada de pedra com telhado de telha, a varanda, o spa, o guarda-sol e as espreguiçadeiras"
            proporcao="4 / 5"
            rot={-2}
            de={{ y: -30, r: -5, s: 1.07 }}
            fita
            legenda="Pedra por fora, madeira por dentro."
            sizes="(max-width: 1023px) 92vw, 470px"
            className="mt-[30px]"
          />
        </div>

        <div>
          <Etiqueta />
        </div>
      </div>

      <div id="varanda" className="mx-auto mt-24 grid max-w-[1320px] scroll-mt-24 grid-cols-1 items-center gap-12 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Vale />
        </div>
        <div className="lg:col-span-5">
          <Revelar>
            <h3 className="text-[2.1rem] leading-[1.08] lg:text-[2.7rem]">
              Cá fora, <em>também é tudo vosso.</em>
            </h3>
          </Revelar>
          <Revelar atraso={0.03}>
            <p className="mt-5 text-[1.08rem]">Spa de hidromassagem, espreguiçadeiras, guarda-sol e um duche de água quente ao ar livre. À frente, o vale e as montanhas.</p>
          </Revelar>
          <Revelar atraso={0.05}>
            <blockquote className="cita mt-[26px]">
              <p>&ldquo;Uma bonita vista da varanda e das janelas no interior da casa.&rdquo;</p>
              <cite>Joana, Airbnb</cite>
            </blockquote>
          </Revelar>
          <Revelar atraso={0.07}>
            <p className="passagem mt-[26px]">E Lamego? A poucos minutos de carro.</p>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
