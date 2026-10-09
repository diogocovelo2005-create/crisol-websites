'use client';

import Image from 'next/image';
import { easeInOut, motion, useTransform, type MotionValue } from 'motion/react';

type M = Momento;
import { useRef } from 'react';
import { usePico, type Momento } from './dados';
import PicoEstatico from './Estatico';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useMedia } from '@/lib/usaMedia';
import Titulo from '@/components/Titulo';

/*
  VARIANTE P1 - Relogio, sem a linha do dia.

  Ato 3 - O PICO. Sentimento: desejo.

  A pagina prende-se e o scroll passa a ser o relogio: a fotografia, o
  texto e a cor da propria pagina mudam em conjunto de momento para
  momento. O ultimo fica parado no fim, para a seccao acabar em vez de
  desaparecer.

  A linha do dia com o sol a andar foi retirada. Esta casa nao conta um
  dia por horas: conta tres coisas que acontecem sempre, e uma barra de
  manha-tarde-noite por baixo dizia o contrario do texto.

  Antes do primeiro momento ha um instante de silencio: so o titulo.

  O cartao de cada momento cabe inteiro no ecra preso: a fotografia e
  medida pela altura e entra na proporcao dela (3:2), sem zoom e sem
  recorte, e o texto ao lado foi reduzido para nunca sair por baixo. No
  catalogo a fotografia ocupava 70vh e o texto ficava cortado.

  Com movimento reduzido, volta a lista estatica com as tres fotos.
*/

// Telemoveis de ecra baixo (ate 740px de altura, ex.: iPhone SE): foto mais
// baixa e texto mais pequeno, senao a hora sobrepunha a foto e a ultima linha
// passava por baixo da linha do dia. Os outros ecras ficam iguais.

/*
  As janelas de cada momento saem do numero de momentos, e nao de uma lista
  fixa de tres: esta casa tem quatro. Abrem a 5% (o titulo sozinho antes) e
  a ultima acaba depois do fim, para o quarto momento ficar parado no
  ecra em vez de desaparecer.
*/
function janelasDe(n: number) {
  const inicio = 0.05;
  const largura = (1 - inicio) / n;
  return Array.from({ length: n }, (_, i) => ({
    entra: inicio + largura * i,
    sai: i === n - 1 ? 1.01 : inicio + largura * (i + 1),
  }));
}

function Momento({ f, p, i, total, rapido }: { f: M; p: MotionValue<number>; i: number; total: number; rapido: boolean }) {
  const { entra, sai } = janelasDe(total)[i];
  const ultimo = i === total - 1;
  // no telemovel as transicoes sao mais curtas: o texto aparece logo
  // no telemovel a seccao e mais curta, por isso a fracao e maior (0.1 de
  // 1850px da uns 185px); a curva easeInOut arranca e para devagar, para o
  // texto nao aparecer aos solavancos
  const t = rapido ? 0.05 : 0.035;
  const op = useTransform(p, ultimo ? [entra, entra + t] : [entra, entra + t, sai - t, sai], ultimo ? [0, 1] : [0, 1, 1, 0], { ease: easeInOut });
  const y = useTransform(p, ultimo ? [entra, entra + t] : [entra, entra + t, sai - t, sai], ultimo ? [36, 0] : [36, 0, 0, -36], { ease: easeInOut });

  return (
    <motion.div style={{ opacity: op, y }} className="absolute inset-0 flex flex-col justify-center">
      <p className="font-display text-[clamp(1.85rem,4.6vh,3.4rem)] leading-none">
        <span className="tabular-nums" style={f.marca.length > 6 ? { fontSize: '0.72em' } : undefined}>{f.marca}</span>
      </p>
      <p className="versalete mt-[clamp(0.4rem,1.2vh,0.9rem)] opacity-70">{f.momento}</p>
      <h3 className="mt-[clamp(0.5rem,1.6vh,1.1rem)] text-[clamp(1.75rem,4.2vh,2.9rem)]">{f.titulo}</h3>
      <p className="mt-[clamp(0.5rem,1.6vh,1.1rem)] max-w-[44ch] text-[clamp(0.95rem,2.1vh,1.12rem)] font-light leading-[1.6] opacity-80">{f.texto}</p>
    </motion.div>
  );
}

function Foto({ f, p, i, total }: { f: M; p: MotionValue<number>; i: number; total: number }) {
  const { entra } = janelasDe(total)[i];
  /*
    A fotografia nova sobe por cima da anterior, como uma folha de album a
    ser virada. A janela e curta (7% do percurso da seccao, contra os 15%
    do catalogo): a imagem passa depressa a meio da mudanca e fica muito
    mais tempo inteira e parada.
  */
  const clip = useTransform(
    p,
    [entra - 0.035, entra + 0.035],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    { ease: easeInOut },
  );

  return (
    <motion.div style={{ clipPath: clip, zIndex: i }} className="absolute inset-0 overflow-hidden rounded-none">
      {/* A caixa ja tem a proporcao da fotografia (3:2), por isso o
          object-cover nao corta nada, e nao ha zoom nenhum. */}
      <Image src={f.imagem} alt={f.alt} fill quality={88} sizes="(max-width: 1024px) 92vw, 46vw" className="object-cover" />
    </motion.div>
  );
}

// Componente proprio para o useScroll so correr com o alvo montado.
function RelogioAnimado() {
  const forma = usePico();
  const momentos = forma.momentos;
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');
  // no telemovel a seccao dura menos scroll (320vh em vez de 380vh) e as
  // transicoes sao mais curtas, para o conteudo acompanhar o dedo
  const telemovel = useMedia('(max-width: 767px)');

  // a luz do dia: a cor da pagina e do texto seguem a hora
  // A cor da pagina acompanha a passagem: papel no principio, papel
  // aquecido a meio, escuro no fim. Os valores sao os tokens desta casa.
  const fundo = useTransform(p, [0, 0.4, 0.58, 0.74, 0.84, 1], ['#efeff0', '#efeff0', '#e9e6e2', '#e2d8d2', '#1a1d20', '#1a1d20']);
  const tinta = useTransform(p, [0, 0.76, 0.84, 1], ['#141618', '#141618', '#f2f2f3', '#f2f2f3']);
  const acento = useTransform(p, [0, 0.76, 0.84, 1], ['#8c2f18', '#8c2f18', '#c98d72', '#c98d72']);

  // silencio antes do pico: so o titulo
  // o silencio e curto: o titulo sai logo que a seccao prende e o primeiro
  // momento entra a seguir, antes de o titulo ja ter subido demasiado
  const tituloOp = useTransform(p, [0, 0.015, 0.055], [1, 1, 0], { ease: easeInOut });
  const tituloY = useTransform(p, [0, 0.055], [0, -40], { ease: easeInOut });
  const palcoOp = useTransform(p, [0.02, 0.06], [0, 1], { ease: easeInOut });

  return (
    <motion.div ref={alvo} style={{ backgroundColor: fundo, color: tinta }} className="h-[400vh] md:h-[460vh]">
      {/* A altura do palco nao muda quando a barra do browser recolhe. A linha
          pode acompanhar o fundo real sem deslocar fotografia ou texto. */}
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* o titulo, sozinho */}
        <motion.div
          style={{ opacity: tituloOp, y: tituloY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.p style={{ color: acento }} className="versalete">
            {forma.etiqueta}
          </motion.p>
          <h2 className="mt-5 text-[clamp(1.8rem,6vh,4.2rem)]">
            <Titulo texto={forma.titulo} />
          </h2>
          <p className="mt-5 max-w-[44ch] text-[clamp(0.82rem,1.8vh,1rem)] font-light leading-[1.7] opacity-75">{forma.intro}</p>
        </motion.div>

        {/* o palco do dia */}
        <motion.div
          style={{ opacity: palcoOp }}
          className="mx-auto grid h-full max-w-[1400px] grid-rows-[auto_1fr] content-center gap-[clamp(0.75rem,2.5vh,1.75rem)] px-6 pb-[clamp(0.75rem,3vh,2.25rem)] pt-[clamp(4.75rem,9vh,7rem)] md:px-10 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-12"
        >
          <div className="relative mx-auto aspect-[3/2] h-[clamp(9rem,32vh,18rem)] w-auto max-w-full lg:order-2 lg:col-span-7 lg:col-start-6 lg:mx-0 lg:h-[clamp(14rem,56vh,34rem)]">
            {momentos.map((f, i) => (
              <Foto key={f.titulo} f={f} p={p} i={i} total={momentos.length} />
            ))}
          </div>
          <div className="relative h-full min-h-0 lg:order-1 lg:col-span-5 lg:h-[clamp(14rem,56vh,34rem)]">
            {momentos.map((f, i) => (
              <Momento key={f.titulo} f={f} p={p} i={i} total={momentos.length} rapido={telemovel} />
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

/* Com movimento reduzido, o pico e a lista estatica, igual em todas as variantes. */
export default function Relogio() {
  const parado = useMovimentoReduzido();
  return parado ? <PicoEstatico /> : <RelogioAnimado />;
}
