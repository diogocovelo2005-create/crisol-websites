'use client';

import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import Impressa from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  2 · Por fora. A chegada, pela ordem em que se chega: o portão (a
  fotografia pequena escorrega para dentro do álbum, da esquerda), a casa
  de pedra (pousada, com a fita), o terraço (por baixo dela). A ficha é a
  etiqueta pendurada pelo ilhó: chega a baloiçar e para, como a etiqueta
  de uma chave quando se pousa.
*/

const FICHA = [
  '60 m² em open space, de pedra, com teto e vigas de madeira à vista',
  'Cama queen e sofá-cama; uma casa de banho com duche',
  'Cozinha equipada e mesa de refeições',
  'Varanda privativa com spa de hidromassagem e duche exterior de água quente',
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
    <section id="fora" className="scroll-mt-20 pb-[110px] pt-[70px]" aria-labelledby="fora-titulo">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-5 md:px-10 lg:grid-cols-[4fr_5fr_3fr] lg:items-start">
        <div>
          <Revelar>
            <p className="pagina">
              A casa <span>· por fora</span>
            </p>
            <h2 id="fora-titulo" className="mb-[26px] mt-[18px] text-[2.4rem] leading-[1.08] lg:text-[3.3rem]">
              Por fora, uma casa de pedra <em>só para vocês</em>
            </h2>
          </Revelar>
          <Revelar atraso={0.04}>
            <p>Chega-se de carro e estaciona-se em frente ao portão, sem custo. Lá dentro da quinta, a casa: uma moradia de pedra, de construção tradicional, com entrada privada. Tudo é vosso: a casa, a varanda e o spa.</p>
            <p className="mt-3.5">Fora da cidade e perto dela: o centro de Lamego fica a poucos minutos de carro.</p>
          </Revelar>
          <Impressa
            src="/fotos/airbnb-31.jpg"
            alt="O estacionamento de gravilha junto ao portão de rede e ao muro de pedra, com um cedro grande à direita"
            foco="50% 65%"
            proporcao="4 / 3"
            rot={-3}
            de={{ x: -90, r: -6 }}
            legenda="À chegada, o portão."
            sizes="(max-width: 1023px) 80vw, 300px"
            className="mt-16 w-[78%] max-w-[300px]"
          />
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
          <Impressa
            src="/fotos/airbnb-03.jpg"
            alt="As paredes de pedra e o telhado de telha vistos do terraço, com o spa, o guarda-sol, a mesa e as espreguiçadeiras"
            foco="55% 50%"
            proporcao="3 / 2"
            rot={2.5}
            de={{ y: 70, r: 7 }}
            atraso={0.05}
            fita={4}
            sizes="(max-width: 1023px) 80vw, 380px"
            className="relative z-[1] ml-auto mt-5 w-[82%] lg:-mr-10"
          />
        </div>

        <div>
          <Etiqueta />
          <Revelar>
            <p className="passagem mt-9">Chama-se A Família na Quinta, e o nome tem uma razão de ser.</p>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
