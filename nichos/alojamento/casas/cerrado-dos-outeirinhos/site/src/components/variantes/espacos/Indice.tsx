'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/reactbits/ScrollStack';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import Titulo from '@/components/Titulo';

/*
  VARIANTE E2 - Indice.

  Os nomes dos espacos em letra grande, em lista. O scroll acende um de
  cada vez; a foto do lado troca (abre de baixo para cima por cima da
  anterior) e o fundo muda ligeiramente de tom em cada espaco.
  No telemovel nao prende: lista simples com foto em cada espaco.
*/

// tons de fundo, todos proximos do linho, um por espaco
// tons de granito, um por espaco: variacoes do fundo do tema (#f1ece2)
const TONS = ['#e7dfd2', '#e2e0d9', '#eadcd0', '#dee2de', '#ece3d7', '#e1ddd3'];

// O `casa` e `as const`, por isso cada espaco tem o seu proprio tipo e so
// um deles traz `link`. Sem este guarda o TypeScript recusa `e.link` nos
// outros, que e precisamente o que se quer: o campo e opcional.
type Espaco = (typeof casa.visita.espacos)[number];
const linkDe = (e: Espaco) => ('link' in e ? e.link : undefined);

function Largo() {
  const v = casa.visita;
  const n = v.espacos.length;
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');
  const [ativo, setAtivo] = useState(0);

  useMotionValueEvent(p, 'change', (x) => {
    const i = Math.min(n - 1, Math.floor(x * n * 0.999));
    if (i !== ativo) setAtivo(i);
  });

  const fundo = useTransform(
    p,
    v.espacos.map((_, i) => (i + 0.5) / n),
    v.espacos.map((_, i) => TONS[i % TONS.length]),
  );

  return (
    <motion.section id="espacos" ref={alvo} style={{ backgroundColor: fundo, height: `${n * 70 + 30}vh` }} className="relative scroll-mt-20">
      <div className="sticky top-0 mx-auto grid h-screen max-w-[1320px] grid-cols-[1fr_1.05fr] items-center gap-16 px-10">
        <div>
          <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
          <h2 className="mt-4 text-[1.3rem] italic text-tinta-medio">
            <Titulo texto={v.titulo} />
          </h2>
          <ol className="mt-8 flex flex-col">
            {v.espacos.map((e, i) => (
              <li key={e.nome} className="border-t border-linha py-2.5 last:border-b">
                <div className="flex items-baseline gap-5">
                  <span className={`w-6 text-[0.8rem] tabular-nums transition-colors duration-500 ${i === ativo ? 'text-ouro-escuro' : 'text-tinta/30'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-display text-[2.6rem] leading-[1.15] transition-all duration-500 xl:text-[3rem] ${
                      i === ativo ? 'translate-x-2 text-tinta' : 'text-tinta/25'
                    }`}
                  >
                    {e.nome}
                  </span>
                </div>
                <div
                  className={`grid pl-11 transition-[grid-template-rows,opacity] duration-500 ${
                    i === ativo ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden text-[0.95rem] font-light leading-[1.7] text-tinta-medio">
                    <p className="max-w-[42ch] pb-1 pt-1">{e.nota}</p>
                    {/* Ajuste desta casa: um espaco pode levar um link para uma
                        pagina propria. Cresce de duas maneiras, so com
                        `transform` e cor: quando o scroll acende este espaco
                        (i === ativo) e quando o rato passa por cima. A origem
                        e a esquerda, para crescer para dentro da linha em vez
                        de empurrar o texto para os dois lados. */}
                    {linkDe(e) && (
                      <Link
                        href={linkDe(e)!.href}
                        className={`mb-1 mt-3 inline-block origin-left font-display text-[1.2rem] italic text-ouro-escuro underline decoration-ouro/40 underline-offset-[6px] transition-[scale,color,text-decoration-color] duration-700 ease-out hover:scale-110 hover:text-ouro hover:decoration-ouro/80 ${
                          i === ativo ? 'scale-105' : 'scale-100'
                        }`}
                      >
                        {linkDe(e)!.texto} <span aria-hidden>&rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative aspect-[4/5] max-h-[80vh] w-full overflow-hidden rounded-[10px]">
          {v.espacos.map((e, i) => (
            <div
              key={e.nome}
              className="absolute inset-0 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)]"
              style={{ clipPath: i <= ativo ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)', zIndex: i }}
            >
              <Image
                src={e.imagem}
                alt={e.alt}
                fill
                sizes="45vw"
                quality={85}
                className={`object-cover transition-transform duration-[1400ms] ease-out ${i === ativo ? 'scale-100' : 'scale-110'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* A lista de baixo, sem animacao nenhuma: e o que fica com movimento
   reduzido. Serve tambem de base ao cartao da pilha. */
function Cartao({ e, i }: { e: Espaco; i: number }) {
  return (
    <>
      {/* A pilha iguala a altura dos cartoes e e a foto que fica com a
          folga: sem isto, os de nota curta ficavam com um vazio em baixo. */}
      <div className="relative min-h-[9rem] flex-1 overflow-hidden">
        <Image src={e.imagem} alt={e.alt} fill sizes="(min-width: 640px) 60vw, 100vw" quality={85} className="object-cover" />
      </div>
      <div className="p-5 sm:p-6">
        <p className="flex items-baseline gap-3">
          <span className="text-[0.8rem] tabular-nums text-ouro-escuro">{String(i + 1).padStart(2, '0')}</span>
          <span className="font-display text-[1.7rem] leading-tight sm:text-[2rem]">{e.nome}</span>
        </p>
        <p className="mt-2 text-[0.95rem] font-light leading-[1.7] text-tinta-medio">{e.nota}</p>
        {linkDe(e) && (
          <Link
            href={linkDe(e)!.href}
            className="mt-3 inline-block font-display text-[1.15rem] italic text-ouro-escuro underline decoration-ouro/40 underline-offset-[6px]"
          >
            {linkDe(e)!.texto} <span aria-hidden>&rarr;</span>
          </Link>
        )}
      </div>
    </>
  );
}

function Estreito() {
  const v = casa.visita;
  const parado = useMovimentoReduzido();

  // Os valores da pilha acompanham a largura: num telemovel os cartoes sao
  // mais altos e o ecra mais curto, e com o intervalo do tablet via-se um
  // cartao de cada vez em vez da pilha.
  const [muitoEstreito, setMuitoEstreito] = useState(false);
  useEffect(() => {
    const medir = () => setMuitoEstreito(window.innerWidth < 640);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  const cabecalho = (
    <>
      <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
      <h2 className="mt-4 text-[2.4rem]">
        <Titulo texto={v.titulo} />
      </h2>
    </>
  );

  // Com movimento reduzido nao ha pilha: os cartoes ficam uns debaixo dos
  // outros, na mesma ordem e com o mesmo desenho.
  if (parado) {
    return (
      <section id="espacos" className="scroll-mt-20 bg-linho-escuro px-6 pb-20 pt-24">
        {cabecalho}
        <ol className="mt-10 flex flex-col gap-8">
          {v.espacos.map((e, i) => (
            <li key={e.nome} className="flex flex-col overflow-hidden rounded-[14px] bg-linho shadow-[0_18px_50px_-24px_rgba(20,26,32,0.5)]">
              <Cartao e={e} i={i} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  /* Ajuste desta casa: no telemovel os espacos eram uma lista parada, e o
     Diogo pediu movimento. Sao os mesmos seis cartoes, pela mesma ordem,
     empilhados com o ScrollStack do React Bits: cada um prende-se no topo
     e encolhe quando o seguinte lhe sobe por cima. No computador nada
     muda: continua a ser o indice E2 do catalogo. */
  return (
    <section id="espacos" className="scroll-mt-20 bg-linho-escuro px-6 pb-16 pt-24">
      {cabecalho}
      <div className="mt-10">
        <ScrollStack
          useWindowScroll
          /* O intervalo e quase a altura de um cartao: e o tempo que cada
             espaco fica sozinho no ecra antes de o seguinte lhe subir por
             cima. Com menos, a nota era tapada antes de se ler. */
          itemDistance={muitoEstreito ? 200 : 280}
          itemStackDistance={muitoEstreito ? 14 : 22}
          itemScale={0.02}
          baseScale={muitoEstreito ? 0.93 : 0.9}
          stackPosition={muitoEstreito ? '15%' : '20%'}
          scaleEndPosition={muitoEstreito ? '6%' : '10%'}
          holdViewports={0.2}
        >
          {v.espacos.map((e, i) => (
            <ScrollStackItem
              key={e.nome}
              itemClassName="flex flex-col overflow-hidden rounded-[14px] bg-linho shadow-[0_18px_50px_-24px_rgba(20,26,32,0.5)]"
            >
              <Cartao e={e} i={i} />
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}

export default function E2Indice() {
  const largo = useMedia('(min-width: 1024px)');
  const parado = useMovimentoReduzido();
  // com movimento reduzido nao prende: a lista simples, como no telemovel
  return largo && !parado ? <Largo /> : <Estreito />;
}
