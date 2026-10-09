'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import AcoesReserva from '@/components/AcoesReserva';
import Titulo from '@/components/Titulo';

/*
  VARIANTE F3 - Cortina que sobe.

  A foto ja esta no ecra inteiro, parada por baixo da pagina. A secao
  anterior (aqui, uma opiniao, como no fim do site real) sobe como uma
  cortina e destapa-a; so depois o convite aparece por cima da foto.

  Estrutura: a camada da foto e sticky e vem primeiro; a cortina puxa-se
  para cima dela com -mt-[100vh] e sobe com o scroll normal da pagina.
  O espaco no fim segura a foto parada depois de a cortina sair.
*/

export default function F3Cortina() {
  const f = casa.fecho;
  const r = casa.reviews;
  const citacoes = r?.citacoes ?? [];
  const [ativo, setAtivo] = useState(0);
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');

  // curso = 120vh; a cortina sai toda aos 100vh (p ~ 0.83)
  const escala = useTransform(p, [0, 0.83], [1.1, 1]);
  const veu = useTransform(p, [0.55, 0.85], [0, 0.4]);
  const op = useTransform(p, [0.62, 0.82], [0, 1]);
  const y = useTransform(p, [0.62, 0.82], [30, 0]);

  useEffect(() => {
    if (citacoes.length < 2) return;
    const id = window.setInterval(() => setAtivo((i) => (i + 1) % citacoes.length), 4000);
    return () => window.clearInterval(id);
  }, [citacoes.length]);

  const mudar = (passo: number) => setAtivo((i) => (i + passo + citacoes.length) % citacoes.length);
  const citacao = citacoes[ativo];

  return (
    <section id="reservar" ref={alvo} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ scale: escala }} className="absolute inset-0">
          <Image src={f.imagem} alt={f.alt} fill sizes="100vw" quality={85} className="object-cover" />
        </motion.div>
        <motion.div style={{ opacity: veu }} className="absolute inset-0 bg-noite" />
        <motion.div style={{ opacity: op, y }} className="absolute inset-0 mx-auto flex max-w-[1320px] flex-col justify-end px-6 pb-[14vh] text-osso md:px-10">
          <p className="versalete text-ouro">{f.etiqueta}</p>
          <h2 className="mt-5 max-w-[14ch] text-[3rem] md:text-[5.4rem]">
            <Titulo texto={f.titulo} />
          </h2>
          <p className="mt-6 max-w-[42ch] font-light leading-[1.8] text-osso/85">{f.texto}</p>
          <div className="mt-10"><AcoesReserva claro /></div>
        </motion.div>
      </div>

      {/* a cortina: a ultima coisa antes do fecho, com uma sombra na orla de baixo */}
      {citacao && <div className="relative z-10 -mt-[100vh] flex h-screen items-center bg-linho shadow-[0_40px_60px_-10px_rgba(21,26,19,0.35)]">
        <figure className="mx-auto max-w-[900px] px-6 text-center">
          <p className="versalete text-ouro-escuro">{r?.etiqueta}</p>
          <blockquote key={citacao.quem} className="mt-8 min-h-[7.5rem] font-display text-[2rem] leading-[1.25] md:text-[3rem]">
            &ldquo;{citacao.texto}&rdquo;
          </blockquote>
          <figcaption className="mt-8 text-[0.95rem] text-tinta-medio">
            {citacao.quem} · {citacao.onde}
          </figcaption>
          <div className="mt-7 flex justify-center gap-2">
            <button type="button" onClick={() => mudar(-1)} aria-label="Opinião anterior" className="grid size-11 place-items-center rounded-full border border-tinta/25"><CaretLeftIcon size={18} /></button>
            <button type="button" onClick={() => mudar(1)} aria-label="Opinião seguinte" className="grid size-11 place-items-center rounded-full border border-tinta/25"><CaretRightIcon size={18} /></button>
          </div>
        </figure>
      </div>}

      {citacao && <div className="h-[120vh]" aria-hidden />}
    </section>
  );
}
