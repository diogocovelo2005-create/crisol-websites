'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { CaretLeftIcon, CaretRightIcon, PhoneIcon, StarIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  VARIANTE F3 - Cortina que sobe.

  A foto ja esta no ecra inteiro, parada por baixo da pagina. A secao
  anterior sobe como uma cortina e destapa-a; so depois o convite
  aparece por cima da foto.

  Estrutura: a camada da foto e sticky e vem primeiro; a cortina puxa-se
  para cima dela com -mt-[100vh] e sobe com o scroll normal da pagina.
  O espaco no fim segura a foto parada depois de a cortina sair.

  Ajuste desta casa: a cortina ja nao mostra uma citacao fixa. O Diogo
  pediu uma secçao so em vez de duas: o carrossel de Opinioes (o mesmo
  de sempre, com setas e pontos, a rodar por casa.reviews.citacoes) e
  agora tambem a propria cortina. Por isso o id="opinioes" fica na
  secçao inteira e o id="reservar" no ecra fixo, que e onde a cortina
  sobe e a foto aparece: as duas ancoras do menu levam ao mesmo sitio,
  o que faz sentido porque e uma secçao so.
*/

export default function F3Cortina() {
  const f = casa.fecho;
  const r = casa.reviews;
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');
  const parado = useMovimentoReduzido();

  const [i, setI] = useState(0);
  const n = r.citacoes.length;
  const c = r.citacoes[i];
  const ir = (d: number) => setI((x) => (x + d + n) % n);

  // curso = 120vh; a cortina sai toda aos 100vh (p ~ 0.83)
  const escala = useTransform(p, [0, 0.83], [1.1, 1]);
  // Ajuste desta casa: veu a 0.5 em vez de 0.4. A foto e a fachada
  // iluminada de noite, e o granito fica amarelo-claro debaixo do
  // texto; a 0.4 a etiqueta pequena deixava de se ler.
  const veu = useTransform(p, [0.55, 0.85], [0, 0.5]);
  const op = useTransform(p, [0.62, 0.82], [0, 1]);
  const y = useTransform(p, [0.62, 0.82], [30, 0]);

  return (
    <section id="opinioes" ref={alvo} className="relative scroll-mt-20">
      {/* svh e nao vh: no telemovel o 100vh conta com a barra do browser
          escondida, e com ela a mostra o fundo do convite ficava cortado.
          A cortina, mais abaixo, mede o mesmo para as duas coincidirem. */}
      <div id="reservar" className="sticky top-0 h-svh overflow-hidden">
        <motion.div style={{ scale: escala }} className="absolute inset-0">
          <Image src={f.imagem} alt={f.alt} fill sizes="100vw" quality={85} className="object-cover" />
        </motion.div>
        <motion.div style={{ opacity: veu }} className="absolute inset-0 bg-noite" />
        <motion.div style={{ opacity: op, y }} className="absolute inset-0 mx-auto flex max-w-[1320px] flex-col justify-end px-6 pb-[10vh] pt-24 text-osso md:pb-[14vh] md:px-10">
          <p className="versalete text-ouro">{f.etiqueta}</p>
          <h2 className="mt-4 max-w-[14ch] text-[2.4rem] md:mt-5 md:text-[5.4rem]">
            <Titulo texto={f.titulo} />
          </h2>
          <p className="mt-5 max-w-[42ch] text-[0.95rem] font-light leading-[1.7] text-osso/85 md:mt-6 md:text-[1rem] md:leading-[1.8]">{f.texto}</p>
          <div className="mt-7 flex flex-wrap gap-3 md:mt-10">
            <Botao href={casa.reservas}>Ver datas e reservar</Botao>
            {/* Ajuste desta casa: nao ha WhatsApp publicado pelo Cerrado. O
                segundo botao e o telemovel das reservas, o que a casa
                divulga no Facebook e no Instagram. */}
            <Botao href={`tel:${casa.contacto.telemovelLimpo}`} tom="contorno-claro">
              <PhoneIcon size={18} weight="regular" /> {casa.contacto.telemovel}
            </Botao>
          </div>
        </motion.div>
      </div>

      {/* a cortina: o carrossel de opinioes, que sobe e destapa o convite */}
      {/* A cortina e a altura visivel do ecra (svh), a mesma do convite por
          baixo. O `pt-24` guarda o espaco do cabecalho fixo: sem ele, a
          etiqueta das opinioes ficava por baixo do logotipo no telemovel. */}
      <div className="relative z-10 -mt-[100svh] flex h-svh items-center bg-linho pb-8 pt-24 shadow-[0_40px_60px_-10px_rgba(20,26,32,0.35)] md:pb-0 md:pt-0">
        <div className="mx-auto w-full max-w-[1000px] px-6 text-center">
          <p className="versalete text-ouro-escuro">{r.etiqueta}</p>
          <h2 className="mt-4 text-[1.9rem] text-tinta [@media(max-height:620px)]:mt-2 [@media(max-height:620px)]:text-[1.5rem] md:mt-5 md:text-[2.8rem]">
            <Titulo texto={r.titulo} />
          </h2>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[0.85rem] text-tinta-medio md:mt-4 md:text-[0.95rem]">
            {Array.from({ length: 5 }).map((_, k) => (
              <StarIcon key={k} size={15} weight="fill" className="text-ouro" />
            ))}
            <span className="ml-2 font-medium text-tinta">{r.media}</span>
            <span className="font-light">
              em {r.total} avaliações {r.fonte}
            </span>
          </p>

          <div className="mt-6 flex items-center gap-2 [@media(max-height:620px)]:mt-3 md:mt-10 md:gap-10">
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label="Opinião anterior"
              className="shrink-0 p-2 text-tinta/60 transition-colors hover:text-tinta"
            >
              <CaretLeftIcon size={26} weight="thin" />
            </button>

            <div className="relative min-h-[13rem] flex-1 [@media(max-height:620px)]:min-h-[10rem] md:min-h-[10rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={i}
                  initial={parado ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={parado ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <blockquote className="font-display text-[1.15rem] italic leading-snug text-tinta [@media(max-height:620px)]:text-[1rem] md:text-[1.8rem]">
                    “{c.texto}”
                  </blockquote>
                  <figcaption className="versalete mt-4 text-[0.68rem] text-tinta-medio md:mt-6 md:text-[0.72rem]">
                    {c.quem} <span className="text-ouro">/</span> {c.onde}, {c.data}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => ir(1)}
              aria-label="Opinião seguinte"
              className="shrink-0 p-2 text-tinta/60 transition-colors hover:text-tinta"
            >
              <CaretRightIcon size={26} weight="thin" />
            </button>
          </div>

          {/* O ponto continua a ser de 8px, mas quem carrega nele e o
              botao, com 24px de lado: e o minimo para o dedo. O `gap-0`
              devolve o espacamento que o `p-2` ja da. */}
          <div className="mt-4 flex justify-center gap-0 md:mt-7">
            {r.citacoes.map((q, k) => (
              <button
                key={q.quem}
                type="button"
                onClick={() => setI(k)}
                aria-label={`Ver opinião ${k + 1}`}
                aria-current={k === i}
                className="grid place-items-center p-2"
              >
                <span
                  className={`block size-2 rounded-full border border-ouro transition-colors ${k === i ? 'bg-ouro' : 'bg-transparent'}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[120vh]" aria-hidden />
    </section>
  );
}
