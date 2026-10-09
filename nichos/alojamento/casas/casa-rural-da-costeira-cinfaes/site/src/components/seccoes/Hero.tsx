'use client';

import Image from 'next/image';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useEffect, useRef } from 'react';
import { aoMedir, useMedida } from '@/lib/posicao';
import { serra } from '@/lib/serra';
import { casa } from '@/lib/casa';
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

  Ao descer, a página fica presa: a foto aproxima-se devagar e escurece, a
  promessa sai, a encosta sobe (ver «A saída» abaixo) e «A casa de perto»
  chega por cima. Se houver `casa.voz`, entra a voz de quem lá ficou. Com movimento reduzido não há
  prisão nem segundo tempo: fica o primeiro ecrã estático e completo.

  Tudo o que se lê vem de casa.ts.
*/
export default function Hero() {
  const alvo = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { etiqueta, titulo, texto, imagem, alt, foco } = casa.hero;
  const voz = casa.voz?.texto;
  const quem = casa.voz?.quem;

  // Tudo em px de scroll (S) desde o topo, medido sem o deslocamento do
  // sticky. H: altura do primeiro ecrã; A: altura do bloco preso.
  const { pos, medida } = useMedida(alvo);
  const palco = useRef<HTMLElement>(null);
  const alto = useRef(900);
  useEffect(() => {
    const medir = () => {
      if (palco.current) alto.current = palco.current.offsetHeight;
    };
    medir();
    return aoMedir(medir);
  }, []);
  const S = useTransform(pos, (v) => -v);
  const lim = (v: number) => Math.min(1, Math.max(0, v));
  const entre = (v: number, a: number, b: number) => lim((v - a) / (b - a));

  // O zoom ligeiro de todo o tempo preso.
  const escala = useTransform(S, (v) => 1.02 + 0.18 * lim(v / Math.max(1, medida.current.altura - alto.current)));
  // O escurecer do início; alivia enquanto a encosta sobe, para o papel não
  // ficar sujo.
  const veu = useTransform(S, (v) => {
    const H = alto.current;
    const E = medida.current.altura - 2 * H;
    return 0.42 * entre(v, 0.07 * H, 0.3 * H) - 0.27 * entre(v, E, E + H);
  });

  /*
    A saída: «A encosta» (escolhida pelo Diogo a 08/10/2026). Três perfis de
    serra da cor do papel sobem por cima da foto: dois translúcidos aqui (a
    serra ao longe e a encosta do meio, como a névoa nos vales do Douro) e o
    da frente, sólido, que é o topo da própria secção «A casa de perto»
    (Patio.tsx), a subir por cima do hero preso ao ritmo do dedo. Quando a
    crista da frente passa, o título da secção já vem logo atrás: não há
    ecrã de papel vazio. Os de trás vão à frente dela, mais devagar.
    Cada camada: 130% do ecrã, crista à volta de 13% da altura dela.
  */
  const linha = (v: number, inicio: number, vel: number) => {
    const H = alto.current;
    const l = Math.min(1.15 * H, 1.15 * H - vel * (v - inicio));
    return `translate3d(0, ${(l - 0.169 * H).toFixed(1)}px, 0)`;
  };
  const longe = useTransform(S, (v) => linha(v, 0, 0.9));
  const meio = useTransform(S, (v) => linha(v, medida.current.altura - 2 * alto.current - 0.3 * alto.current, 0.95));

  // a promessa sai depressa, no início do tempo preso
  const saiOp = useTransform(S, (v) => 1 - entre(v, 0.02 * alto.current, 0.18 * alto.current));
  const saiY = useTransform(S, (v) => -50 * entre(v, 0.02 * alto.current, 0.18 * alto.current));
  // depois de desaparecer, os botões deixam de apanhar cliques
  const saiToque = useTransform(S, (v) => (v > 0.14 * alto.current ? 'none' : 'auto'));
  const entraOp = useTransform(S, (v) => entre(v, 0.32 * alto.current, 0.5 * alto.current));
  const entraY = useTransform(S, (v) => 40 * (1 - entre(v, 0.32 * alto.current, 0.5 * alto.current)));

  // A entrada de cada linha é CSS (.entrada-hero em globals.css): corre no
  // primeiro desenho, sem esperar pela hidratação. Com movimento reduzido o
  // próprio CSS a desliga.
  const entrada = (atraso: number) => ({ '--atraso': `${atraso}s` }) as React.CSSProperties;

  return (
    // O bloco preso: o primeiro ecrã + o tempo do zoom e do escurecer (40vh
    // no telemóvel, 45vh no computador) + um ecrã em que «A casa de perto»
    // sobe por cima dele (a secção seguinte tem margem negativa de um ecrã).
    <div
      ref={alvo}
      className={parado ? 'relative' : 'relative h-[calc(2*max(100lvh,var(--hmin))+40vh)] md:h-[calc(2*max(100lvh,var(--hmin))+45vh)]'}
    >
      <section ref={palco} className="sticky top-0 isolate h-lvh min-h-[var(--hmin)] w-full overflow-hidden">
        <motion.div style={parado ? undefined : { scale: escala }} className="absolute inset-0 -z-10 origin-[55%_60%]">
          <Image src={imagem} alt={alt} fill priority quality={90} sizes="(max-width: 767px) 330vw, 120vw" className="object-cover" style={{ objectPosition: foco ?? '50% 50%' }} />
        </motion.div>
        <div className="veu-hero absolute inset-0 -z-10" />
        {!parado && <motion.div style={{ opacity: veu }} className="absolute inset-0 -z-10 bg-noite" />}
        {/* com movimento reduzido: degradé parado da cor do papel no fundo,
            para a passagem continuar sem linha dura */}
        {parado ? (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[18%] bg-linear-to-t [@media(max-height:700px)]:h-[7%] from-linho to-linho/0" />
        ) : (
          <>
            <Camada transform={longe} alfa={0.36} perfil={[0.6, 13, 8, 1]} />
            <Camada transform={meio} alfa={0.58} perfil={[2.4, 13, 6.5, 0.6]} />
          </>
        )}

        <div className="relative mx-auto h-svh max-w-[1760px] px-5 md:h-full md:px-8">
          {/* primeiro tempo: a promessa */}
          <motion.div
            style={parado ? undefined : { opacity: saiOp, y: saiY, pointerEvents: saiToque }}
            className="flex h-full flex-col justify-start pb-16 pt-32 md:pt-36 lg:pt-40 [@media(max-height:559px)]:pb-4 [@media(max-height:559px)]:pt-[88px]"
          >
            <p style={entrada(0.1)} className="entrada-hero versalete text-osso">
              {etiqueta}
            </p>
            <h1
              style={entrada(0.2)}
              className="entrada-hero mt-5 max-w-[15ch] text-[3.1rem] leading-[1.02] tracking-[-0.02em] text-osso sm:text-[4.7rem] lg:text-[6.5rem] [@media(max-height:559px)]:mt-2 [@media(max-height:559px)]:max-w-[26ch] [@media(max-height:559px)]:text-[2.5rem] [@media(max-height:559px)]:leading-[1.02]"
            >
              <Titulo texto={titulo} />
            </h1>
            <p
              style={entrada(0.35)}
              className="entrada-hero mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-osso md:text-[1.12rem] [@media(max-height:559px)]:mt-3 [@media(max-height:559px)]:max-w-[70ch] [@media(max-height:559px)]:text-base [@media(max-height:559px)]:leading-snug"
            >
              {texto}
            </p>
            <div style={entrada(0.5)} className="entrada-hero mt-9 flex flex-wrap gap-3 [@media(max-height:559px)]:mt-4">
              <AcoesReserva claro limite={1} />
              <Botao href={casa.navegacao[0]?.href ?? '#conteudo'} tom="contorno-claro">
                Conhecer a casa
              </Botao>
            </div>
          </motion.div>

          {/* segundo tempo: a voz de quem lá ficou */}
          {!parado && voz && (
            <motion.div
              style={{ opacity: entraOp, y: entraY }}
              className="pointer-events-none absolute inset-x-5 bottom-0 top-0 flex flex-col justify-center md:inset-x-8"
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

/* Uma camada de serra translúcida: SVG parado (pinta-se uma vez) que só se
   desloca. No telemóvel o SVG estica muito na vertical, por isso a serra é
   mais baixa e mais lisa (senão viravam agulhas). */
function Camada({ transform, alfa, perfil }: { transform: MotionValue<string>; alfa: number; perfil: [number, number, number, number] }) {
  const [fase, base, amp, aspereza] = perfil;
  return (
    <motion.div aria-hidden style={{ transform }} className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[130%] will-change-transform">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hidden size-full md:block">
        <path d={serra(fase, base, amp, aspereza)} fill="#e4e7df" fillOpacity={alfa} />
      </svg>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="block size-full md:hidden">
        <path d={serra(fase, base, amp * 0.4, aspereza * 0.3)} fill="#e4e7df" fillOpacity={alfa} />
      </svg>
    </motion.div>
  );
}
