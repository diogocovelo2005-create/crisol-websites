'use client';

import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { prender } from '@/lib/posicao';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { suave } from '@/lib/useRevelacao';

/*
  O fecho sobre o portão (a fachada-02, com o nome da casa). Pedidos do
  Diogo: "tem de ficar maior. e podes usar o scroll expand nela" e, a
  2026-10-09, que o Reservar fique com a foto do portão de fundo: sobre o
  mesmo fundo aparece "O portão está à vossa espera.", que desaparece, e
  aparece "Falta só escolher as datas." com o número por baixo.

  A sequência, presa ao scroll (no telemóvel acompanha o dedo):
  1. a passagem "Agora é a vossa vez." lê-se ao chegar; o quadrado do
     portão (a foto inteira) cresce por cima dela até encher o ecrã;
  2. a legenda do portão aparece no canto inferior esquerdo;
  3. a legenda sai, o véu escurece o lado do texto e entram, por ordem, o
     título, a frase, o número e os canais. No telemóvel o portão, que
     parou com o nome inteiro, acaba de encher o ecrã para o texto caber.
  Serve o fim da história: chega-se ao portão da casa, e a seguir é só
  ligar.

  Só clip-path, transform e opacity. Com movimento reduzido não há
  prisão: a passagem e, a seguir, o portão grande e parado com a legenda e
  o texto por cima.
*/

type Geo = { vw: number; vh: number; fimW: number; fimH: number; lado: number; caixa: number; inicio: number };

function geometria(vw: number, vh: number): Geo {
  const retrato = vw < vh;
  const fimW = vw;
  const fimH = retrato ? Math.min(vh * 0.8, vw * 1.25) : vh;
  return {
    vw,
    vh,
    fimW,
    fimH,
    lado: Math.max(fimW, fimH),
    caixa: Math.max(vw, vh),
    inicio: retrato ? Math.min(vw * 0.9, vh * 0.5) : Math.min(vh * 0.62, vw * 0.8),
  };
}

// as fases do progresso preso
const EXPANDE = [0, 0.42] as const;
const LEGENDA_ENTRA = [0.45, 0.54] as const;
const LEGENDA_SAI = [0.63, 0.7] as const;
const ENCHE = [0.63, 0.77] as const; // telemóvel: do retrato ao ecrã inteiro; o véu do texto
const TEXTO = [0.72, 0.84, 0.88, 0.92] as const; // início de cada linha (título, frase, número, canais)

const fase = (v: number, a: number, b: number) => prender((v - a) / (b - a));

const LEGENDA = 'O portão está à vossa espera.';
const ALT = 'O portão de ferro da casa, com o nome Casa da Alufinha, o caminho de calçada e a casa ao fundo, ao fim da tarde';

const corte = 'font-display text-[clamp(1.6rem,2.6vw,2.3rem)] italic leading-[1.2]';
const legenda = 'max-w-[20ch] font-display text-[clamp(1.6rem,3.2vw,2.8rem)] italic leading-[1.1] text-osso';
// o véu do texto: forte em baixo e à esquerda, onde está o texto
const veuTexto =
  'bg-[linear-gradient(0deg,rgba(36,26,20,.88)_0%,rgba(36,26,20,.76)_55%,rgba(36,26,20,.4)_100%)] lg:bg-[linear-gradient(90deg,rgba(36,26,20,.86)_0%,rgba(36,26,20,.74)_45%,rgba(36,26,20,.22)_85%)]';

/* `linhas`: o texto do fecho, quatro blocos (título, frase, número, canais) */
export default function PortaoExpande({ passagem, linhas }: { passagem: string; linhas: React.ReactNode[] }) {
  const alvo = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const p = useProgresso(alvo, 'preso');
  const [geo, setGeo] = useState<Geo>(() => geometria(1440, 900));
  const geoRef = useRef(geo);
  const versao = useMotionValue(0);

  useEffect(() => {
    let largura = 0;
    const medir = () => {
      // no telemóvel, a barra do browser a esconder-se muda só a altura:
      // não se mede de novo, senão o portão saltava a meio do gesto
      if (largura && window.innerWidth === largura && window.matchMedia('(hover: none)').matches) return;
      largura = window.innerWidth;
      const g = geometria(window.innerWidth, window.innerHeight);
      geoRef.current = g;
      setGeo(g);
      versao.set(versao.get() + 1);
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [versao]);

  const clipPath = useTransform([p, versao], ([v]: number[]) => {
    const { vw, vh, fimW, fimH, inicio } = geoRef.current;
    const k = suave(fase(v, ...EXPANDE));
    const k2 = suave(fase(v, ...ENCHE));
    const w1 = inicio + (fimW - inicio) * k;
    const h1 = inicio + (fimH - inicio) * k;
    const w = w1 + (vw - w1) * k2;
    const h = h1 + (vh - h1) * k2;
    return `inset(${((vh - h) / 2).toFixed(1)}px ${((vw - w) / 2).toFixed(1)}px)`;
  });
  const transform = useTransform([p, versao], ([v]: number[]) => {
    const { lado, caixa, inicio } = geoRef.current;
    const k = suave(fase(v, ...EXPANDE));
    const k2 = suave(fase(v, ...ENCHE));
    const l1 = inicio + (lado - inicio) * k;
    const l = l1 + (caixa - l1) * k2;
    return `translate(-50%, -50%) scale(${(l / caixa).toFixed(4)})`;
  });
  const legendaOp = useTransform(p, (v) => suave(fase(v, ...LEGENDA_ENTRA)) * (1 - suave(fase(v, ...LEGENDA_SAI))));
  const legendaT = useTransform(p, (v) => `translateY(${((1 - suave(fase(v, ...LEGENDA_ENTRA))) * 14 - suave(fase(v, ...LEGENDA_SAI)) * 14).toFixed(1)}px)`);
  const veuLegenda = useTransform(p, (v) => suave(fase(v, ...LEGENDA_ENTRA)));
  const veuTextoOp = useTransform(p, (v) => suave(fase(v, ...ENCHE)));
  const toque = useTransform(p, (v) => (v > TEXTO[2] ? 'auto' : 'none'));

  // cada linha do texto sobe e aparece, uma depois da outra
  const ops = TEXTO.map((a) => useTransform(p, (v) => suave(fase(v, a, a + 0.07)))); // eslint-disable-line react-hooks/rules-of-hooks
  const ts = TEXTO.map((a) => useTransform(p, (v) => `translateY(${((1 - suave(fase(v, a, a + 0.07))) * 22).toFixed(1)}px)`)); // eslint-disable-line react-hooks/rules-of-hooks

  const sizes = '(orientation: portrait) 220vw, 100vw';

  if (parado) {
    return (
      <>
        <div className="caixa py-16 md:py-[88px]">
          <p className={`max-w-[24ch] ${corte}`}>{passagem}</p>
        </div>
        <div className="relative isolate min-h-[100svh] w-full overflow-hidden">
          <Image src="/fotos/fachada-02.jpg" alt={ALT} fill sizes="100vw" quality={90} className="-z-10 object-cover" />
          <div aria-hidden className={`absolute inset-0 -z-10 ${veuTexto}`} />
          <div className="caixa flex min-h-[100svh] flex-col justify-end pb-28 pt-28 text-osso md:pb-16">
            <p className={legenda}>{LEGENDA}</p>
            <div className="mt-10">{linhas}</div>
          </div>
        </div>
      </>
    );
  }

  const margemV = (geo.vh - geo.fimH) / 2;

  return (
    <div ref={alvo} className="relative h-[300svh] md:h-[330svh]">
      <div className="sticky top-0 isolate h-svh w-full overflow-hidden">
        <div className="caixa absolute inset-x-0" style={{ bottom: (geo.vh + geo.inicio) / 2 + 24 }}>
          <p className={`max-w-[24ch] ${corte}`}>{passagem}</p>
        </div>
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <motion.div className="absolute left-1/2 top-1/2" style={{ width: geo.caixa, height: geo.caixa, transform }}>
            <Image src="/fotos/fachada-02.jpg" alt={ALT} fill sizes={sizes} quality={90} className="object-cover" />
          </motion.div>
          {/* véu da legenda (só no canto dela) e véu do texto (do lado dele) */}
          <motion.div aria-hidden className="veu-portao absolute inset-x-0" style={{ top: margemV, bottom: margemV, opacity: veuLegenda }} />
          <motion.div aria-hidden className={`absolute inset-0 ${veuTexto}`} style={{ opacity: veuTextoOp }} />
        </motion.div>

        <motion.p className={`absolute left-6 md:left-10 ${legenda}`} style={{ bottom: margemV + 32, opacity: legendaOp, transform: legendaT }}>
          {LEGENDA}
        </motion.p>

        <motion.div
          className="caixa absolute inset-x-0 bottom-0 pb-24 text-osso md:pb-14 lg:pb-16"
          style={{ pointerEvents: toque }}
          // pelo teclado: o foco num link ainda escondido leva ao fim da sequência, onde ele se vê
          onFocusCapture={() => {
            const el = alvo.current;
            if (!el || p.get() >= 0.95) return;
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight });
          }}
        >
          {linhas.map((l, i) => (
            <motion.div key={i} style={{ opacity: ops[Math.min(i, ops.length - 1)], transform: ts[Math.min(i, ts.length - 1)] }}>
              {l}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
