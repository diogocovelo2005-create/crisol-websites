'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useRef } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import AcoesReserva from '@/components/AcoesReserva';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  O primeiro ecrã, formato fixo de todas as casas (como na Casa do Valado):
  uma foto panorâmica a ecrã inteiro, o logótipo ou o nome no canto
  superior esquerdo (no Cabecalho), e, alinhados à esquerda e em cima, a
  etiqueta, uma frase grande em serifa com itálico (*asteriscos* em
  casa.hero.titulo), um texto curto e duas ações: a primeira ação de
  reserva e "Conhecer a casa". O véu (.veu-hero) só escurece a faixa onde
  está o texto; o resto da foto fica com a luz dela.

  Ao descer, a página fica presa um pouco (90vh no computador, 50vh no
  telemóvel): a foto aproxima-se devagar, a promessa sai e, se houver
  `casa.voz`, entra a voz de quem lá ficou. Com movimento reduzido não há
  prisão nem segundo tempo: fica o primeiro ecrã estático e completo.

  Tudo o que se lê vem de casa.ts.
*/
const facil = [0.22, 0.61, 0.36, 1] as const;

export default function Hero() {
  const alvo = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { etiqueta, titulo, texto, imagem, alt, foco } = casa.hero;
  const voz = casa.voz?.texto;
  const quem = casa.voz?.quem;

  const p = useProgresso(alvo, 'preso');
  const escala = useTransform(p, [0, 1], [1.02, 1.2]);
  const veu = useTransform(p, [0.08, 0.34], [0, 0.42]);
  // a promessa sai depressa, antes de a segunda frase entrar: as duas nunca
  // estão meio transparentes ao mesmo tempo por cima da foto
  const saiOp = useTransform(p, [0.02, 0.2], [1, 0]);
  const saiY = useTransform(p, [0.02, 0.2], [0, -50]);
  // depois de desaparecer, os botões deixam de apanhar cliques
  const saiToque = useTransform(p, (v) => (v > 0.15 ? 'none' : 'auto'));
  const entraOp = useTransform(p, [0.36, 0.56], [0, 1]);
  const entraY = useTransform(p, [0.36, 0.56], [40, 0]);

  // Com movimento reduzido, os elementos vão para visível sem transição. Não
  // basta tirar a animação: o primeiro render (igual ao do servidor) já os
  // pôs a opacidade 0, e sem um alvo explícito ficavam lá presos.
  const entrada = (atraso: number) =>
    parado
      ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: atraso, ease: facil },
        };

  return (
    <div ref={alvo} className={parado ? 'relative' : 'relative h-[150vh] md:h-[190svh]'}>
      <section className="sticky top-0 isolate h-lvh min-h-[560px] w-full overflow-hidden">
        <motion.div style={parado ? undefined : { scale: escala }} className="absolute inset-0 -z-10 origin-[55%_60%]">
          <Image src={imagem} alt={alt} fill priority quality={90} sizes="(max-width: 767px) 330vw, 120vw" className="object-cover" style={{ objectPosition: foco ?? '50% 50%' }} />
        </motion.div>
        <div className="veu-hero absolute inset-0 -z-10" />
        {!parado && <motion.div style={{ opacity: veu }} className="absolute inset-0 -z-10 bg-noite" />}

        <div className="relative mx-auto h-svh max-w-[1320px] px-6 md:h-full md:px-10">
          {/* primeiro tempo: a promessa */}
          <motion.div
            style={parado ? undefined : { opacity: saiOp, y: saiY, pointerEvents: saiToque }}
            className="flex h-full flex-col justify-start pb-16 pt-32 md:pt-36 lg:pt-40"
          >
            <motion.p {...entrada(0.1)} className="versalete text-osso">
              {etiqueta}
            </motion.p>
            <motion.h1
              {...entrada(0.2)}
              className="mt-5 max-w-[15ch] text-[2.9rem] leading-[1.02] tracking-[-0.02em] text-osso sm:text-[4.2rem] lg:text-[5.75rem]"
            >
              <Titulo texto={titulo} />
            </motion.h1>
            <motion.p
              {...entrada(0.35)}
              className="mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-osso md:text-[1.12rem]"
            >
              {texto}
            </motion.p>
            <motion.div {...entrada(0.5)} className="mt-9 flex flex-wrap gap-3">
              <AcoesReserva claro limite={1} />
              <Botao href={casa.navegacao[0]?.href ?? '#conteudo'} tom="contorno-claro">
                Conhecer a casa
              </Botao>
            </motion.div>
          </motion.div>

          {/* segundo tempo: a voz de quem lá ficou */}
          {!parado && voz && (
            <motion.div
              style={{ opacity: entraOp, y: entraY }}
              className="pointer-events-none absolute inset-x-6 bottom-0 top-0 flex flex-col justify-center md:inset-x-10"
            >
              <blockquote className="max-w-[30ch] font-display text-[1.6rem] leading-[1.25] text-osso sm:text-[2.1rem] lg:text-[2.6rem]">
                {/* hífen que não parte: 'devolvê-la' não pode ficar a meio de duas
                    linhas. As aspas só aparecem quando a frase é de alguém (`quem`). */}
                {quem ? '“' : ''}
                {voz.replaceAll('-', '‑')}
                {quem ? '”' : ''}
              </blockquote>
              {quem && <p className="versalete mt-7 text-osso/85">{quem}</p>}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
