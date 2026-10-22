'use client';

import { motion, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Impressa, { type De } from '@/components/Impressa';
import Revelar from '@/components/Revelar';
import Ampliada, { type FotoAlbum } from '@/components/Ampliada';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  4 · Por dentro: o álbum da casa, a secção com mais fotografias, para se
  percorrer devagar. Sete tempos pela ordem em que se entra (a entrada, o
  espaço aberto, a sala, o quarto, a cozinha, a casa de banho, os
  pormenores). À esquerda, o índice do álbum fica à vista e um marcador
  desce com a página em que se está: nunca se perde o sítio na casa.

  As fotografias deste álbum entram nos cantos de papel (não levam fita):
  escorregam para dentro, de lado, e os cantos fecham-se por cima. Cada
  uma abre-se em grande com um clique.
*/

type Foto = FotoAlbum & { proporcao: string; legenda?: string; de: De; classe: string; sizes: string };
type Tempo = { id: string; nome: string; linha: string; grelha: string; lado?: string; fotos: Omit<Foto, 'tempo'>[] };

const TEMPOS: Tempo[] = [
  {
    id: 'entrada',
    nome: 'A entrada',
    lado: 'lg:col-span-5 lg:col-start-8 lg:self-center',
    linha: 'Entra-se pela vossa porta, com um cofre de chaves.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-38.jpg', alt: 'A porta de madeira à esquerda e, depois do arco de pedra, a mesa de toalha floral e a cozinha', foco: '60% 45%', proporcao: '4 / 3', de: { x: -70, r: -3 }, classe: 'lg:col-span-6', sizes: '(max-width: 1023px) 92vw, 470px' },
    ],
  },
  {
    id: 'espaco',
    nome: 'O espaço aberto',
    linha: '60 m² debaixo das vigas de madeira.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-11.jpg', alt: 'O espaço inteiro sob o teto de madeira: os sofás de verga, a mesa de centro, a cama à direita, a cozinha azul ao fundo e a mesa redonda no canto', foco: '45% 55%', proporcao: '3 / 2', legenda: 'Um só espaço, de pedra e madeira.', de: { y: 60, s: 1.03 }, classe: 'lg:col-span-8', sizes: '(max-width: 1023px) 92vw, 620px' },
      { src: '/fotos/airbnb-07.jpg', alt: 'O espaço aberto ao alto: a cozinha azul, o sofá de vime, a cama ao centro e os globos sob o teto de madeira', foco: '50% 55%', proporcao: '2 / 3', de: { x: 70, r: 3 }, classe: 'lg:col-span-4', sizes: '(max-width: 1023px) 70vw, 300px' },
      { src: '/fotos/airbnb-06.jpg', alt: 'A cama à esquerda, o sofá bege à frente, os cadeirões de vime e a cozinha azul ao fundo, com os candeeiros de globos', foco: '50% 55%', proporcao: '3 / 2', de: { x: -70, r: -3 }, classe: 'relative z-[1] lg:col-span-5 lg:col-start-5 lg:-mt-36', sizes: '(max-width: 1023px) 92vw, 390px' },
    ],
  },
  {
    id: 'sala',
    nome: 'A sala',
    lado: 'lg:col-span-3 lg:self-center',
    linha: 'Sofá, cadeirões e televisão com Netflix e Disney+; ar condicionado e Wi-Fi.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-02.jpg', alt: 'O sofá cinzento em L, os cadeirões de vime e a televisão na parede de pedra', foco: '55% 55%', proporcao: '4 / 3', de: { x: 70, r: 3 }, classe: 'lg:col-span-6', sizes: '(max-width: 1023px) 92vw, 470px' },
      { src: '/fotos/airbnb-05.jpg', alt: 'Um cadeirão de vime com almofadas e uma planta de folha grande, junto à parede de pedra e à janela', foco: '55% 62%', proporcao: '3 / 4', de: { x: 70, r: 4 }, classe: 'lg:col-span-3 lg:mt-14', sizes: '(max-width: 1023px) 70vw, 230px' },
    ],
  },
  {
    id: 'quarto',
    nome: 'O quarto',
    linha: 'Uma cama queen, contra a parede de pedra; há também um sofá-cama.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-19.jpg', alt: 'A cama sob o teto alto de madeira e os oito globos âmbar, com os candeeiros de parede acesos', foco: '50% 80%', proporcao: '2 / 3', de: { x: -70, r: -3 }, classe: 'lg:col-span-3', sizes: '(max-width: 1023px) 70vw, 230px' },
      { src: '/fotos/airbnb-01.jpg', alt: 'A cama de cabeceira escura entre duas mesas de cabeceira brancas, contra a parede de pedra', foco: '50% 55%', proporcao: '4 / 3', de: { x: 70, r: 3 }, classe: 'lg:col-span-5 lg:mt-8', sizes: '(max-width: 1023px) 92vw, 390px' },
      { src: '/fotos/airbnb-23.jpg', alt: 'A cama, a cómoda azul com o cabide de pé e o sofá bege à frente', foco: '50% 55%', proporcao: '4 / 3', de: { x: 70, r: 3 }, classe: 'lg:col-span-4 lg:mt-20', sizes: '(max-width: 1023px) 92vw, 310px' },
    ],
  },
  {
    id: 'cozinha',
    nome: 'A cozinha',
    linha: 'Frigorífico com congelador, micro-ondas, chaleira, torradeira, tachos e loiça, e uma mesa de refeições.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-14.jpg', alt: 'A cozinha de portas azuis encastrada na parede de pedra, com a chaleira vermelha e o barril com flores', foco: '50% 55%', proporcao: '4 / 3', de: { x: -70, r: -3 }, classe: 'lg:col-span-5', sizes: '(max-width: 1023px) 92vw, 390px' },
      { src: '/fotos/airbnb-15.jpg', alt: 'A mesa redonda de toalha floral e as quatro cadeiras brancas, no canto de pedra', foco: '51% 66%', proporcao: '4 / 3', de: { x: 70, r: 3 }, classe: 'lg:col-span-3 lg:mt-24', sizes: '(max-width: 1023px) 70vw, 230px' },
      { src: '/fotos/airbnb-17.jpg', alt: 'A mesa de refeições e a cozinha no mesmo espaço, com o chão de madeira à frente', foco: '55% 55%', proporcao: '4 / 3', de: { x: -70, r: -3 }, classe: 'lg:col-span-4 lg:mt-12', sizes: '(max-width: 1023px) 92vw, 310px' },
    ],
  },
  {
    id: 'banho',
    nome: 'A casa de banho',
    lado: 'lg:col-span-4 lg:self-center',
    linha: 'Com duche.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-09.jpg', alt: 'O duche de vidro de caixilho preto, os dois espelhos redondos iluminados e a parede de pedra à direita', foco: '50% 55%', proporcao: '3 / 2', de: { x: 70, r: 3 }, classe: 'lg:col-span-8', sizes: '(max-width: 1023px) 92vw, 630px' },
    ],
  },
  {
    id: 'pormenores',
    nome: 'Os pormenores',
    linha: 'O café em cima de um barril, a cómoda azul, os candeeiros de globos a descer do teto.',
    grelha: 'lg:grid-cols-12',
    fotos: [
      { src: '/fotos/airbnb-12.jpg', alt: 'A máquina de café em cima de um barril, com chávenas coloridas e flores secas, contra a parede de pedra', foco: '45% 58%', proporcao: '2 / 3', legenda: 'O rústico e o moderno, lado a lado.', de: { x: -70, r: -4 }, classe: 'lg:col-span-4', sizes: '(max-width: 1023px) 70vw, 310px' },
      { src: '/fotos/airbnb-34.jpg', alt: 'A cómoda azul com um cartaz de madeira, um vaso de barro, pinhas e um garrafão com flores secas', foco: '55% 55%', proporcao: '2 / 3', de: { y: 70, r: 2 }, classe: 'lg:col-span-4 lg:mt-12', sizes: '(max-width: 1023px) 70vw, 310px' },
      { src: '/fotos/airbnb-36.jpg', alt: 'O teto de tábuas e vigas escuras com o candeeiro de globos de vidro', foco: '45% 55%', proporcao: '4 / 5', de: { x: 70, r: 4 }, classe: 'lg:col-span-4 lg:mt-4', sizes: '(max-width: 1023px) 70vw, 310px' },
    ],
  },
];

const INICIO = TEMPOS.map((_, i) => TEMPOS.slice(0, i).reduce((soma, t) => soma + t.fotos.length, 0));
const TODAS: FotoAlbum[] = TEMPOS.flatMap((t) => t.fotos.map((f) => ({ src: f.src, alt: f.alt, foco: f.foco, tempo: t.nome })));

function Indice({ atual }: { atual: number }) {
  const parado = useMovimentoReduzido();
  const lista = useRef<HTMLOListElement>(null);
  const y = useSpring(0, { stiffness: 260, damping: 30 });

  useEffect(() => {
    const li = lista.current?.children[atual] as HTMLElement | undefined;
    if (!li) return;
    const alvo = li.offsetTop + li.offsetHeight / 2 - 9;
    if (parado) y.jump(alvo);
    else y.set(alvo);
  }, [atual, parado, y]);

  return (
    <nav aria-label="O álbum da casa por dentro" className="sticky top-28 hidden lg:block">
      <p className="versalete text-tinta-medio">O álbum</p>
      <div className="relative mt-5 border-l border-linha pl-6">
        <motion.span aria-hidden style={{ y }} className="absolute -left-[5px] top-0 block h-[18px] w-[9px] rounded-[2px] bg-telha" />
        <ol ref={lista}>
          {TEMPOS.map((t, i) => (
            <li key={t.id}>
              <a
                href={`#dentro-${t.id}`}
                aria-current={i === atual ? 'true' : undefined}
                className={`flex items-baseline gap-3 py-2 font-display text-[1.12rem] leading-tight transition-colors duration-200 ${i === atual ? 'text-telha' : 'text-tinta/65 hover:text-tinta'}`}
              >
                <span className="font-corpo text-[0.72rem] font-semibold tracking-[0.14em] text-tinta-medio">{i + 1}</span>
                {t.nome}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-8 max-w-[22ch] text-[0.88rem] leading-snug text-tinta-medio">Cada fotografia abre-se em grande com um clique.</p>
    </nav>
  );
}

function cabeca(t: Tempo, i: number, classe: string) {
  return (
    <Revelar y={14} className={classe}>
      <h3 id={`tempo-${t.id}`} className="flex shrink-0 items-baseline gap-3 text-[1.9rem] leading-tight">
        <span className="font-corpo text-[0.78rem] font-semibold tracking-[0.16em] text-telha">{i + 1}</span>
        {t.nome}
      </h3>
      <p className="max-w-[52ch] text-tinta-medio">{t.linha}</p>
    </Revelar>
  );
}

export default function PorDentro() {
  const [atual, setAtual] = useState(0);
  const [aberta, setAberta] = useState<number | null>(null);
  const mudar = useCallback((i: number | null) => setAberta(i), []);

  useEffect(() => {
    const paginas = Array.from(document.querySelectorAll<HTMLElement>('[data-tempo]'));
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setAtual(Number((e.target as HTMLElement).dataset.tempo));
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    paginas.forEach((p) => obs.observe(p));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="dentro" className="scroll-mt-20 pb-[100px] pt-[110px]" aria-labelledby="dentro-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Revelar>
            <p className="pagina">
              A casa <span>· por dentro</span>
            </p>
            <h2 id="dentro-titulo" className="mt-[18px] text-[2.4rem] leading-[1.06] lg:text-[3.6rem]">
              Por dentro, <em>um só espaço de pedra e madeira</em>
            </h2>
            <p className="mt-6 max-w-[58ch]">Lá dentro é um só espaço: a cama, a sala e a cozinha à vista umas das outras, debaixo do teto de madeira com as vigas à mostra, entre paredes de pedra. O rústico e o moderno lado a lado.</p>
          </Revelar>
          <Revelar atraso={0.05}>
            <blockquote className="cita">
              <p>&ldquo;Fotos não fazem justiça ao espaço... é ainda mais bonito.&rdquo;</p>
              <cite>Duarte, Airbnb</cite>
            </blockquote>
          </Revelar>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[230px_1fr] lg:gap-16">
          <div>
            <Indice atual={atual} />
          </div>
          <div>
            {TEMPOS.map((t, i) => (
              <article key={t.id} id={`dentro-${t.id}`} data-tempo={i} className="scroll-mt-28 border-t border-linha pb-12 pt-8 first:border-t-0 first:pt-0 lg:pb-12" aria-labelledby={`tempo-${t.id}`}>
                {!t.lado && cabeca(t, i, 'mb-7 flex flex-col gap-2 lg:flex-row lg:items-baseline lg:gap-6')}
                <div className={`grid grid-cols-1 items-start gap-x-8 gap-y-10 ${t.grelha}`}>
                  {t.fotos.map((f, j) => {
                    const indice = INICIO[i] + j;
                    return (
                      <Impressa
                        key={f.src}
                        src={f.src}
                        alt={f.alt}
                        foco={f.foco}
                        proporcao={f.proporcao}
                        legenda={f.legenda}
                        de={f.de}
                        atraso={j * 0.02}
                        cantos
                        sizes={f.sizes}
                        className={f.classe}
                        onAbrir={() => setAberta(indice)}
                      />
                    );
                  })}
                  {t.lado && cabeca(t, i, `flex flex-col gap-3 ${t.lado}`)}
                </div>
              </article>
            ))}
            <Revelar>
              <p className="passagem max-w-[34ch]">Por umas noites, a casa é vossa. Na quinta, há quem lá tenha casa para sempre.</p>
            </Revelar>
          </div>
        </div>
      </div>
      <Ampliada fotos={TODAS} indice={aberta} mudar={mudar} />
    </section>
  );
}
