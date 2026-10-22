'use client';

import Image from 'next/image';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import Impressa from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { aoMedir } from '@/lib/posicao';

/*
  3 · A família na quinta: a revelação.

  Até aqui o visitante viu uma casa de pedra e leu o nome dela; acha que
  "A Família na Quinta" é só um nome simpático. A passagem fica no papel do
  álbum: "Chama-se A Família na Quinta. Falta conhecer a família." Com o
  ecrã preso, as outras palavras saem e fica só "família.", grande e
  escura. As letras são uma janela: o escuro delas é o fundo da fotografia
  do borrego, e dentro do "f" e do "a" já se vê um olho. O scroll entra
  pela palavra adentro (pelo "l"), as letras abrem-se até a fotografia
  encher o ecrã, e o título responde por cima dela, dito palavra a
  palavra: "Uma família com cascos, penas e orelhas compridas". A família
  do nome são eles.

  Só clip-path (o recorte das letras, um clipPath SVG com o texto na fonte
  da página), transform e opacity. Com movimento reduzido não há prisão: a
  frase no papel e, por baixo, a fotografia com o título.
*/

const BORREGO = '/fotos/3c4517_e8ec6b46161342f5b5855d7e46bb0d2a.jpg';
const BORREGO_ALT = 'Um borrego branco bebé, de frente e de boca aberta, e a mão de quem o acolhe a tocar-lhe no focinho';
const LEGENDA = 'Acolher, nas palavras da família, é dar um lar para a vida inteira.';
const TITULO = ['Uma', 'família', 'com', 'cascos,', 'penas', 'e', 'orelhas', 'compridas'];
const ESCALA = 80; // até onde a palavra cresce

const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const dentroFora = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const chegar = (t: number) => 1 - Math.pow(1 - t, 3);

type Geo = { w: number; h: number; fs: number; cy: number; ox: number; oy: number };

function PalavraTitulo({ p, i, children }: { p: MotionValue<number>; i: number; children: string }) {
  const a = 0.7 + i * 0.022;
  const k = useTransform(p, (v) => chegar(fatia(v, a, a + 0.12)));
  const transform = useTransform(k, (v) => `translate3d(0, ${((1 - v) * 0.5).toFixed(3)}em, 0)`);
  const Tag = i >= 3 ? motion.em : motion.span;
  return (
    <>
      <Tag aria-hidden style={{ opacity: k, transform, display: 'inline-block' }}>
        {children}
      </Tag>{' '}
    </>
  );
}

function Palco() {
  const alvo = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const ele = useRef<HTMLSpanElement>(null);
  const recorte = useRef<SVGTextElement>(null);
  const p = useProgresso(alvo, 'preso');
  const [geo, setGeo] = useState<Geo>({ w: 1440, h: 900, fs: 200, cy: 540, ox: 760, oy: 520 });

  // onde fica a palavra, e o ponto dentro do "l" por onde se entra nela
  useEffect(() => {
    const medir = () => {
      const el = palco.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const fs = Math.round(Math.min(230, w * 0.16, h * 0.26));
      const cy = Math.round(h * 0.6);
      setGeo((g) => ({ ...g, w, h, fs, cy }));
      requestAnimationFrame(() => {
        const l = ele.current?.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        if (l) setGeo((g) => ({ ...g, ox: l.left - b.left + l.width / 2, oy: l.top - b.top + l.height * 0.5 }));
      });
    };
    medir();
    return aoMedir(medir);
  }, []);

  const { fs, cy } = geo;
  const geoRef = useRef(geo);

  // as outras palavras da frase saem; fica "família."
  const fraseOp = useTransform(p, [0.02, 0.16], [1, 0]);
  const fraseT = useTransform(p, (v) => `translate3d(-50%, calc(-100% - ${(chegar(fatia(v, 0.02, 0.2)) * 48).toFixed(1)}px), 0)`);
  // entrar pela palavra: escala exponencial, para o avanço parecer constante
  const zoom = useTransform(p, (v) => {
    const s = Math.pow(ESCALA, dentroFora(fatia(v, 0.12, 0.72)));
    const { ox, oy } = geoRef.current;
    return `translate(${ox} ${oy}) scale(${s.toFixed(4)}) translate(${-ox} ${-oy})`;
  });
  // o atributo transform do SVG escreve-se à mão (o Motion trata-o como estilo)
  useEffect(() => {
    const escrever = (t: string) => recorte.current?.setAttribute('transform', t);
    escrever(zoom.get());
    return zoom.on('change', escrever);
  }, [zoom]);
  useEffect(() => {
    geoRef.current = geo;
    const s = Math.pow(ESCALA, dentroFora(fatia(p.get(), 0.12, 0.72)));
    recorte.current?.setAttribute('transform', `translate(${geo.ox} ${geo.oy}) scale(${s.toFixed(4)}) translate(${-geo.ox} ${-geo.oy})`);
  }, [geo, p]);
  // a cena por trás da janela cresce menos do que a janela (é mais funda)
  const fotoT = useTransform(p, (v) => `scale(${(1.1 - 0.1 * dentroFora(fatia(v, 0.08, 0.75))).toFixed(4)})`);
  // o escuro das letras: a fotografia velada, que clareia ao entrar
  const veu = useTransform(p, [0.1, 0.5], [0.62, 0]);
  // a fotografia inteira, sem recorte, acaba a abertura
  // abre em círculo (clip-path), não em fade: um fade deixava o linho a transparecer e a foto pálida
  const inteira = useTransform(p, [0.64, 0.71], ['circle(0% at 45% 50%)', 'circle(80% at 45% 50%)']);
  const baixo = useTransform(p, [0.66, 0.8], [0, 1]);
  const fimOp = useTransform(p, [0.84, 0.96], [0, 1]);

  return (
    <div ref={alvo} className="relative h-[220vh]">
      <div ref={palco} className="sticky top-0 h-svh overflow-hidden bg-linho">
        <p className="sr-only">Chama-se A Família na Quinta. Falta conhecer a família.</p>

        {/* o recorte: a palavra, na fonte da página */}
        <svg aria-hidden width="0" height="0" className="absolute">
          <defs>
            <clipPath id="recorte-familia" clipPathUnits="userSpaceOnUse">
              <text
                ref={recorte}
                x={geo.w / 2}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontFamily: 'var(--font-display)', fontSize: fs, letterSpacing: '-0.01em' }}
              >
                família.
              </text>
            </clipPath>
          </defs>
        </svg>

        {/* a fotografia dentro das letras */}
        <div aria-hidden className="absolute inset-0" style={{ clipPath: 'url(#recorte-familia)' }}>
          <motion.div className="absolute inset-0" style={{ transform: fotoT }}>
            <Image src={BORREGO} alt="" fill sizes="100vw" quality={82} className="object-cover" style={{ objectPosition: '45% 45%' }} />
          </motion.div>
          <motion.div className="absolute inset-0 bg-noite" style={{ opacity: veu }} />
        </div>

        {/* a mesma fotografia, inteira: a janela acabou de abrir */}
        <motion.figure className="absolute inset-0" style={{ clipPath: inteira }}>
          <motion.div className="absolute inset-0" style={{ transform: fotoT }}>
            <Image src={BORREGO} alt={BORREGO_ALT} fill sizes="100vw" quality={82} className="object-cover" style={{ objectPosition: '45% 45%' }} />
          </motion.div>
          <motion.figcaption
            style={{ opacity: fimOp }}
            className="absolute bottom-8 right-[104px] hidden max-w-[34ch] bg-cartao px-3 py-1.5 font-display text-[0.95rem] leading-[1.35] text-tinta md:block"
          >
            {LEGENDA}
          </motion.figcaption>
        </motion.figure>

        {/* para medir o "l": a mesma palavra, invisível, no mesmo sítio */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 whitespace-nowrap font-display text-transparent"
          style={{ top: cy, fontSize: fs, lineHeight: 1, letterSpacing: '-0.01em', transform: 'translate(-50%, -50%)' }}
        >
          famí<span ref={ele}>l</span>ia.
        </span>

        {/* o resto da frase, por cima da palavra */}
        <motion.p
          aria-hidden
          className="passagem absolute left-1/2 w-[min(90vw,780px)] text-center !text-[clamp(1.6rem,2.6vw,2.4rem)] !leading-[1.2]"
          style={{ top: cy - fs * 0.5, opacity: fraseOp, transform: fraseT }}
        >
          Chama-se A Família na Quinta.
          <br />
          <span className="text-tinta">Falta conhecer a</span>
        </motion.p>

        {/* a resposta, por cima da fotografia */}
        <motion.div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(34,23,15,0.82)_0%,rgba(34,23,15,0.55)_30%,rgba(34,23,15,0)_62%)]" style={{ opacity: baixo }} />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1320px] px-5 pb-[clamp(48px,9svh,96px)] text-osso md:px-10">
          <motion.p className="pagina !text-ouro" style={{ opacity: fimOp }}>
            A quinta <span className="!text-cartao/80">· a família</span>
          </motion.p>
          <h2 id="quinta-titulo" aria-label={TITULO.join(' ')} className="mt-[18px] max-w-[16ch] text-[2.6rem] leading-[1.04] text-osso lg:text-[4.4rem]">
            {TITULO.map((w, i) => (
              <PalavraTitulo key={i} p={p} i={i}>
                {w}
              </PalavraTitulo>
            ))}
          </h2>
        </div>
      </div>
    </div>
  );
}

// movimento reduzido: a frase no papel e, por baixo, a fotografia com o título
function Parado() {
  return (
    <>
      <div className="bg-linho px-5 pb-[90px] pt-[30px] text-center">
        <p className="passagem mx-auto max-w-[780px] !text-[clamp(1.6rem,2.6vw,2.4rem)] !leading-[1.2]">
          Chama-se A Família na Quinta.
          <br />
          <span className="text-tinta">Falta conhecer a família.</span>
        </p>
      </div>
      <figure className="relative h-svh min-h-[560px] overflow-hidden">
        <Image src={BORREGO} alt={BORREGO_ALT} fill sizes="100vw" quality={82} className="object-cover" style={{ objectPosition: '45% 45%' }} />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(34,23,15,0.82)_0%,rgba(34,23,15,0.55)_30%,rgba(34,23,15,0)_62%)]" />
        <figcaption className="absolute bottom-8 right-[104px] hidden max-w-[34ch] bg-cartao px-3 py-1.5 font-display text-[0.95rem] leading-[1.35] text-tinta md:block">{LEGENDA}</figcaption>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1320px] px-5 pb-[clamp(48px,9svh,96px)] md:px-10">
          <p className="pagina !text-ouro">
            A quinta <span className="!text-cartao/80">· a família</span>
          </p>
          <h2 id="quinta-titulo" className="mt-[18px] max-w-[16ch] text-[2.6rem] leading-[1.04] text-osso lg:text-[4.4rem]">
            Uma família com <em className="!text-ouro">cascos, penas e orelhas compridas</em>
          </h2>
        </div>
      </figure>
    </>
  );
}

export default function Familia() {
  const parado = useMovimentoReduzido();
  return (
    <section id="quinta" className="madeira scroll-mt-20 pb-[120px]" aria-labelledby="quinta-titulo">
      {parado ? <Parado /> : <Palco />}
      <div className="mx-auto mt-[100px] max-w-[1320px] px-5 md:px-10">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-3">
          <div className="pt-1.5">
            <Revelar>
              <p className="font-display text-[2.1rem] leading-[1.1] text-osso lg:text-[2.6rem]">
                A família é <span className="text-ouro">maior</span> do que se pensa.
              </p>
            </Revelar>
            <Revelar atraso={0.03}>
              <p className="mt-6 text-[1.08rem]">Animais que outros exploravam, maltratavam ou iam matar ganham na quinta um lar para a vida inteira.</p>
            </Revelar>
            <Revelar atraso={0.05}>
              <p className="mt-5 font-display text-[1.3rem] leading-[1.35] text-osso">
                O projeto chama-se «A Família na Quinta». <span className="text-ouro">A casa também.</span>
              </p>
            </Revelar>
          </div>
          <Impressa
            src="/fotos/3c4517_049df7bf6abe4293909d6a87abb074d7.jpg"
            alt="Um cabrito cor de creme ao colo, de cabeça virada para a direita"
            foco="57% 34%"
            proporcao="1 / 1"
            rot={2}
            de={{ y: 120, r: -4, s: 0.96 }}
            fita
            sizes="(max-width: 1023px) 92vw, 400px"
            className="-mt-2.5"
          />
          <div>
            <Revelar atraso={0.03}>
              <blockquote className="cita">
                <p>&ldquo;Os animais da quinta foram uma agradável surpresa à chegada&rdquo;</p>
                <cite>Lígia, Airbnb</cite>
              </blockquote>
            </Revelar>
            <Revelar>
              <p className="passagem mt-[30px]">Aos animais, a família dá casa para sempre. A quem chega, abre esta.</p>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  );
}
