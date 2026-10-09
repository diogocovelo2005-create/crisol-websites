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
  Ato 1 - O convite. Sentimento: curiosidade.

  A pagina fica presa enquanto a camara avanca pelo caminho ate a casa
  (a fotografia aproxima-se devagar). A promessa sai de cena e entra o
  segundo tempo: a voz dos anfitrioes, a contar de onde vem a casa. Quem
  faz scroll chega a porta e e recebido antes de ver qualquer facto.

  E so 90vh de scroll a mais no computador, e 50vh no telemovel, onde o
  polegar percorre menos: o hero nao pode fazer esperar.

  Com movimento reduzido nao ha prisao nem segundo tempo: fica o hero
  estatico, completo, com o CTA.
*/
const facil = [0.22, 0.61, 0.36, 1] as const;

export default function Hero() {
  const alvo = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { etiqueta, titulo, texto, imagem, alt } = casa.hero;
  const voz = casa.voz?.texto;
  const quem = casa.voz?.quem;

  const p = useProgresso(alvo, 'preso');
  const escala = useTransform(p, [0, 1], [1.02, 1.2]);
  const veu = useTransform(p, [0.08, 0.34], [0, 0.42]);
  // a promessa sai depressa, antes de a segunda frase entrar: as duas nunca
  // estao meio transparentes ao mesmo tempo por cima da foto
  const saiOp = useTransform(p, [0.02, 0.2], [1, 0]);
  const saiY = useTransform(p, [0.02, 0.2], [0, -50]);
  // depois de desaparecer, os botoes deixam de apanhar cliques
  const saiToque = useTransform(p, (v) => (v > 0.15 ? 'none' : 'auto'));
  const entraOp = useTransform(p, [0.36, 0.56], [0, 1]);
  const entraY = useTransform(p, [0.36, 0.56], [40, 0]);

  // Com movimento reduzido, os elementos vao para visivel sem transicao. Nao
  // basta tirar a animacao: o primeiro render (igual ao do servidor) ja os
  // pos a opacidade 0, e sem um alvo explicito ficavam la presos.
  const entrada = (atraso: number) =>
    parado
      ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: atraso, ease: facil },
        };

  return (
    <div ref={alvo} className={parado ? 'relative' : 'relative h-[150vh] md:h-[190vh]'}>
      <section className="sticky top-0 isolate h-lvh min-h-[560px] w-full overflow-hidden">
        <motion.div style={parado ? undefined : { scale: escala }} className="absolute inset-0 -z-10 origin-[55%_60%]">
          <Image src={imagem} alt={alt} fill priority quality={99} sizes="(max-width: 767px) 330vw, 120vw" className="object-cover object-[50%_60%]" />
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
              className="mt-5 max-w-[15ch] text-[2.9rem] leading-[1.02] tracking-[-0.02em] text-osso [&_em]:text-barro-claro sm:text-[4.2rem] lg:text-[5.75rem]"
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

          {/* segundo tempo: a voz de quem recebe */}
          {!parado && voz && (
            <motion.div
              style={{ opacity: entraOp, y: entraY }}
              className="pointer-events-none absolute inset-x-6 bottom-0 top-0 flex flex-col justify-center md:inset-x-10"
            >
              <blockquote className="max-w-[30ch] font-display text-[1.6rem] leading-[1.25] text-osso sm:text-[2.1rem] lg:text-[2.6rem]">
                {/* hifen que nao parte: 'devolvê-la' nao pode ficar a meio de duas
                    linhas. As aspas so aparecem quando a frase e de alguem (`quem`). */}
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
