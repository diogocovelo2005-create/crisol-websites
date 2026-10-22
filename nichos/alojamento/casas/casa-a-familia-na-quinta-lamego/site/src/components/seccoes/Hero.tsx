'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { aoMedir } from '@/lib/posicao';
import AcoesReserva from '@/components/AcoesReserva';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  O primeiro ecrã, formato fixo de todas as casas: a foto a ecrã inteiro,
  a etiqueta, o título, o texto e as duas ações.

  A saída é desta casa (o álbum do C): ao descer, a promessa sai, e a
  fotografia do primeiro ecrã encolhe, roda um pouco, ganha a margem de
  papel e a fita-cola, e pousa à direita como a primeira fotografia do
  álbum. Ao lado entra a primeira página: a voz do projeto, em cartão
  colado. A casa e a família que acolhe ficam na mesma página, e o resto
  do site é o álbum a folhear-se.

  Tudo preso ao scroll (o ecrã acompanha o dedo). Com movimento reduzido
  não há prisão: fica o primeiro ecrã estático e a página da voz por baixo.
*/

const VOZ = '«Acolhemos animais de quinta necessitados de abrigo e amor e damos-lhes uma família e um lar para a vida inteira!»';
const VOZ_QUEM = 'A Família na Quinta, site do projeto e Facebook';

// curva de movimento no ecrã (ease-in-out forte) e de chegada (ease-out)
const dentroFora = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

type Ecra = { vw: number; vh: number };

// Onde a fotografia pousa, como fotografia do álbum
function destino({ vw, vh }: Ecra) {
  if (vw < 768) {
    const w = vw * 0.72;
    return { w, s: w / vw, cx: vw / 2 + 6, cy: vh * 0.27 };
  }
  const conteudoDireita = (vw + Math.min(vw, 1320)) / 2 - 40;
  const w = Math.min(690, vw * 0.48);
  return { w, s: w / vw, cx: conteudoDireita - w / 2 - 10, cy: vh * 0.5 + 16 };
}

function CartaoVoz({ estatico = false }: { estatico?: boolean }) {
  return (
    <div className={`relative bg-cartao shadow-[0_18px_40px_rgba(44,31,22,0.14)] ${estatico ? 'mx-auto max-w-[900px] px-6 py-10 md:px-[72px] md:pb-[52px] md:pt-16' : 'px-6 pb-7 pt-9 md:px-12 md:pb-10 md:pt-12'}`} style={{ transform: 'rotate(-0.6deg)' }}>
      <span aria-hidden className="fita-cola !left-[70px] !ml-0" style={{ transform: 'rotate(-4deg)' }} />
      <span aria-hidden className="fita-cola !left-auto !right-[70px] !ml-0" style={{ transform: 'rotate(5deg)' }} />
      <blockquote>
        <p className={`font-display leading-[1.25] text-tinta ${estatico ? 'text-[1.7rem] md:text-[2.5rem]' : 'text-[1.25rem] sm:text-[1.6rem] lg:text-[2.2rem]'}`}>{VOZ}</p>
        <cite className="mt-5 block text-[0.8rem] font-semibold not-italic uppercase tracking-[0.16em] text-tinta-medio">{VOZ_QUEM}</cite>
      </blockquote>
    </div>
  );
}

export default function Hero() {
  const alvo = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { etiqueta, titulo, texto, imagem, alt, foco } = casa.hero;
  const [ecra, setEcra] = useState<Ecra>({ vw: 1440, vh: 900 });
  const ecraRef = useRef(ecra);

  useEffect(() => {
    const medir = () => {
      const novo = { vw: window.innerWidth, vh: window.innerHeight };
      ecraRef.current = novo;
      setEcra(novo);
    };
    medir();
    return aoMedir(medir);
  }, []);

  const p = useProgresso(alvo, 'preso');
  const zoom = useTransform(p, [0, 0.3], [1.02, 1.08]);
  // a promessa sai depressa, antes de a fotografia começar a encolher
  const saiOp = useTransform(p, [0.02, 0.16], [1, 0]);
  const saiY = useTransform(p, [0.02, 0.16], [0, -50]);
  const saiToque = useTransform(p, (v) => (v > 0.12 ? 'none' : 'auto'));

  // a fotografia passa a fotografia do álbum
  const encolhe = useTransform(p, (v) => dentroFora(fatia(v, 0.14, 0.7)));
  const fotoTransform = useTransform(encolhe, (e) => {
    const { vw, vh } = ecraRef.current;
    const d = destino({ vw, vh });
    const s = 1 + (d.s - 1) * e;
    const tx = (d.cx - vw / 2) * e;
    const ty = (d.cy - vh / 2) * e;
    return `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${(2.2 * e).toFixed(2)}deg) scale(${s.toFixed(4)})`;
  });
  const veuOp = useTransform(encolhe, [0, 0.5], [1, 0]);
  const papelOp = useTransform(encolhe, [0.35, 0.75], [0, 1]);
  // a fita-cola cola-se quando a fotografia já pousou
  const fitaOp = useTransform(p, [0.66, 0.74], [0, 1]);
  const fitaT = useTransform(p, (v) => {
    const k = chegar(fatia(v, 0.66, 0.76));
    return `rotate(-3deg) scale(${(1.35 - 0.35 * k).toFixed(3)})`;
  });

  // a primeira página: o cartão da voz chega por baixo e assenta
  const vozOp = useTransform(p, [0.5, 0.68], [0, 1]);
  const vozT = useTransform(p, (v) => {
    const k = chegar(fatia(v, 0.5, 0.78));
    return `translate3d(0, ${((1 - k) * 60).toFixed(1)}px, 0) rotate(${((1 - k) * -3).toFixed(2)}deg)`;
  });
  const passOp = useTransform(p, [0.78, 0.92], [0, 1]);
  const passT = useTransform(p, (v) => `translate3d(${((1 - chegar(fatia(v, 0.78, 0.94))) * 24).toFixed(1)}px, 0, 0)`);

  const d = destino(ecra);
  // a margem de papel é desenhada no tamanho cheio e encolhe com a foto:
  // no fim fica com 14 px dos lados e 40 em baixo, como as outras impressas
  const margem = (px: number) => `${(-px / d.s).toFixed(1)}px`;
  const telemovel = ecra.vw < 768;

  const atraso = (s: number) => ({ animationDelay: `${s}s` });

  const promessa = (
    <motion.div
      style={parado ? undefined : { opacity: saiOp, y: saiY, pointerEvents: saiToque }}
      className="flex h-full flex-col justify-start pb-16 pt-32 md:pt-36 lg:pt-40"
    >
      <p style={atraso(0.1)} className="entrada-hero versalete text-osso">
        {etiqueta}
      </p>
      <h1 style={atraso(0.2)} className="entrada-hero mt-5 max-w-[15ch] text-[2.9rem] leading-[1.04] tracking-[-0.025em] text-osso sm:text-[4.2rem] lg:text-[5rem]">
        <Titulo texto={titulo} />
      </h1>
      <p style={atraso(0.35)} className="entrada-hero mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-osso md:text-[1.12rem]">
        {texto}
      </p>
      <div style={atraso(0.5)} className="entrada-hero mt-9 flex flex-wrap gap-3">
        <AcoesReserva claro limite={1} />
        <Botao href={casa.navegacao[0]?.href ?? '#conteudo'} tom="contorno-claro">
          Conhecer a casa
        </Botao>
      </div>
    </motion.div>
  );

  if (parado) {
    return (
      <>
        <section className="relative isolate h-svh min-h-[560px] w-full overflow-hidden">
          <Image src={imagem} alt={alt} fill preload quality={90} sizes="(max-width: 767px) 330vw, 100vw" className="-z-10 object-cover" style={{ objectPosition: foco }} />
          <div className="veu-hero absolute inset-0 -z-10" />
          <div className="relative mx-auto h-full max-w-[1320px] px-6 md:px-10">{promessa}</div>
        </section>
        <section aria-label="A voz do projeto" className="px-5 pb-20 pt-24 md:px-10">
          <CartaoVoz estatico />
          <p className="passagem mx-auto mt-11 max-w-[900px] text-right">Primeiro, a casa.</p>
        </section>
      </>
    );
  }

  return (
    <div ref={alvo} className="relative h-[200vh] md:h-[220vh]">
      <section className="sticky top-0 isolate h-lvh min-h-[560px] w-full overflow-hidden bg-linho">
        {/* a margem de papel e a fita, por baixo e por cima da fotografia */}
        <motion.div aria-hidden style={{ transform: fotoTransform }} className="absolute inset-0 z-[1] origin-center">
          <motion.div
            style={{ opacity: papelOp, top: margem(14), left: margem(14), right: margem(14), bottom: margem(40) }}
            className="absolute bg-cartao shadow-[0_24px_50px_rgba(44,31,22,0.22),0_2px_6px_rgba(44,31,22,0.12)]"
          />
        </motion.div>
        <motion.div style={{ transform: fotoTransform }} className="absolute inset-0 z-[1] origin-center overflow-hidden">
          <motion.div style={{ scale: zoom }} className="absolute inset-0 origin-[55%_60%]">
            <Image src={imagem} alt={alt} fill preload quality={90} sizes="(max-width: 767px) 330vw, 120vw" className="object-cover" style={{ objectPosition: foco ?? '50% 50%' }} />
          </motion.div>
          <motion.div style={{ opacity: veuOp }} className="veu-hero absolute inset-0" />
        </motion.div>
        <motion.div aria-hidden style={{ transform: fotoTransform }} className="pointer-events-none absolute inset-0 z-[1] origin-center">
          <motion.span
            style={{ opacity: fitaOp, transform: fitaT, width: `${(110 / d.s).toFixed(0)}px`, height: `${(28 / d.s).toFixed(0)}px`, top: margem(16), marginLeft: `${(-55 / d.s).toFixed(0)}px` }}
            className="absolute left-1/2 bg-[rgba(226,168,106,0.55)]"
          />
        </motion.div>

        {/* a primeira página do álbum: a voz do projeto */}
        <div
          className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1320px] flex-col px-5 md:px-10"
          style={
            telemovel
              ? { justifyContent: 'flex-start', paddingTop: `${(d.cy + (d.w * ecra.vh) / ecra.vw / 2 + 64).toFixed(0)}px` }
              : { justifyContent: 'center', paddingRight: `${(d.w + 4).toFixed(0)}px` }
          }
        >
          <motion.div style={{ opacity: vozOp, transform: vozT }} aria-label="A voz do projeto" role="group">
            <CartaoVoz />
          </motion.div>
          {/* afastada da fotografia: a margem de papel, a rotação e a sombra
              passam uns 40 px para cá da coluna, e a frase ficava por baixo */}
          <motion.p style={{ opacity: passOp, transform: passT }} className="passagem relative z-[2] mt-8 pr-10 text-right md:mt-10 md:pr-[96px]">
            Primeiro, a casa.
          </motion.p>
        </div>

        <div className="relative z-[2] mx-auto h-svh max-w-[1320px] px-6 md:h-full md:px-10">{promessa}</div>
      </section>
    </div>
  );
}
