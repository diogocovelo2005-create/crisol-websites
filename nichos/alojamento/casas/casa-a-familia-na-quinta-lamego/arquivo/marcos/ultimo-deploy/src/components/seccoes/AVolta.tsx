'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useRef } from 'react';
import Revelar from '@/components/Revelar';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  8 · À volta: os postais da região, do mais perto ao mais longe. Chegam
  dados como cartas, da esquerda para a direita, cada um um pouco depois
  do anterior: a ordem é a da estrada. As fotografias são de terceiros:
  sem recorte e sem nada por cima, com o crédito por baixo.
*/

type Sitio = { foto: string; w: number; h: number; alt: string; min: string; nome: string; texto: string; autor: string; pagina: string; licenca: string; licencaUrl: string };

const SITIOS: Sitio[] = [
  { foto: '/fotos/regiao-se-de-lamego.jpg', w: 2400, h: 1602, alt: 'A fachada da Sé de Lamego', min: 'cerca de 4 min de carro', nome: 'Sé de Lamego', texto: 'Catedral do séc. XII, com a torre românica e a fachada do início do séc. XVI.', autor: 'Ricardo Saraiva de Almeida', pagina: 'https://commons.wikimedia.org/wiki/File:S%C3%A9_de_Lamego_1_-_2017-05-04.jpg', licenca: 'CC BY-SA 4.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0' },
  { foto: '/fotos/regiao-santuario-dos-remedios.jpg', w: 2400, h: 1607, alt: 'O Santuário de Nossa Senhora dos Remédios e o escadório', min: 'cerca de 8 min de carro', nome: 'Santuário de Nossa Senhora dos Remédios', texto: 'Barroco, com a primeira pedra em 1750 e o escadório começado em 1777; o projeto é atribuído a Nasoni.', autor: 'Concierge.2C', pagina: 'https://commons.wikimedia.org/wiki/File:Lamego_-_Santu%C3%A1rio_de_Nossa_Senhora_dos_Rem%C3%A9dios_-_Vista_geral_(1).jpg', licenca: 'CC BY-SA 3.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0' },
  { foto: '/fotos/regiao-capela-de-balsemao.jpg', w: 2400, h: 1590, alt: 'A Capela de São Pedro de Balsemão e o largo empedrado', min: 'cerca de 12 min de carro', nome: 'Capela de São Pedro de Balsemão', texto: 'De origem alto-medieval, com três naves e o sarcófago do bispo D. Afonso Pires.', autor: 'Pedro Nuno Caetano', pagina: 'https://commons.wikimedia.org/wiki/File:S._Pedro_de_Balsem%C3%A3o_I.jpg', licenca: 'CC BY 2.0', licencaUrl: 'https://creativecommons.org/licenses/by/2.0' },
  { foto: '/fotos/regiao-museu-do-douro.jpg', w: 2400, h: 1600, alt: 'O Museu do Douro em Peso da Régua, com um barco rabelo à frente', min: 'cerca de 15 min de carro', nome: 'Museu do Douro', texto: 'O museu da região, em Peso da Régua, na Casa da Companhia.', autor: 'FWinkel', pagina: 'https://commons.wikimedia.org/wiki/File:Museu_do_Douro_in_Peso_da_R%C3%A9gua.jpg', licenca: 'CC BY-SA 4.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0' },
  { foto: '/fotos/regiao-porto-de-rei.jpg', w: 2400, h: 1600, alt: 'A praia fluvial de Porto de Rei, no Douro', min: 'cerca de 23 min de carro', nome: 'Parque Fluvial de Porto de Rei', texto: 'Praia fluvial no Douro, com piscina, cais e parque de merendas.', autor: 'Vitor Oliveira from Torres Vedras, PORTUGAL', pagina: 'https://commons.wikimedia.org/wiki/File:Praia_Fluvial_de_Porto_de_Rei_-_Portugal_(29051552232).jpg', licenca: 'CC BY-SA 2.0', licencaUrl: 'https://creativecommons.org/licenses/by-sa/2.0' },
];

const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

function Postal({ s, i }: { s: Sitio; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso: i * 0.016 });
  const rot = i % 2 ? 2 : -2;
  const transform = useTransform(r, (v) => {
    const k = chegar(fatia(v, 0, 0.9));
    return `translate3d(${((1 - k) * -110).toFixed(1)}px, ${((1 - k) * 24).toFixed(1)}px, 0) rotate(${(rot - (1 - k) * 9).toFixed(2)}deg)`;
  });
  const opacidade = useTransform(r, [0, 0.35], [0, 1]);
  const textoOp = useTransform(r, [0.55, 0.9], [0, 1]);

  return (
    <article ref={ref} className={i % 2 ? 'lg:mt-[26px]' : ''}>
      <motion.figure style={parado ? { transform: `rotate(${rot}deg)`, opacity: 1 } : { transform, opacity: opacidade }} className="foto">
        <Image src={s.foto} alt={s.alt} width={s.w} height={s.h} sizes="(max-width: 767px) 92vw, (max-width: 1023px) 45vw, 230px" className="h-auto w-full" />
        <figcaption className="!mt-2 !font-corpo !text-[0.66rem] !leading-[1.35] text-tinta-medio">
          Foto: {s.autor} /{' '}
          <a href={s.pagina} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            Wikimedia Commons
          </a>
          ,{' '}
          <a href={s.licencaUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            {s.licenca}
          </a>
        </figcaption>
      </motion.figure>
      <motion.div style={parado ? { opacity: 1 } : { opacity: textoOp }}>
        <span className="mt-[22px] inline-block rounded-[30px] border-[1.5px] border-telha px-2.5 py-1 text-[0.76rem] font-semibold tracking-[0.08em] text-telha">{s.min}</span>
        <h3 className="mt-2.5 text-[1.25rem] leading-[1.2]">{s.nome}</h3>
        <p className="mt-2 text-[0.95rem] leading-[1.5]">{s.texto}</p>
      </motion.div>
    </article>
  );
}

export default function AVolta() {
  return (
    <section id="volta" className="scroll-mt-20 py-[110px]" aria-labelledby="volta-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Revelar>
            <p className="pagina">
              A casa <span>· à volta</span>
            </p>
            <h2 id="volta-titulo" className="mt-[18px] text-[2.4rem] leading-[1.06] lg:text-[3.6rem]">
              À volta, Lamego a minutos de carro, <em>e o Douro logo a seguir</em>
            </h2>
          </Revelar>
          <Revelar atraso={0.04}>
            <p>A casa fica numa quinta familiar em Lamego, a poucos minutos de carro do centro. De carro, chega-se depressa ao melhor da cidade e ao Douro.</p>
          </Revelar>
        </div>
        <div className="mt-[60px] grid grid-cols-1 items-start gap-[26px] sm:grid-cols-2 lg:grid-cols-5">
          {SITIOS.map((s, i) => (
            <Postal key={s.nome} s={s} i={i} />
          ))}
        </div>
        <Revelar>
          <p className="passagem mt-[50px]">E para ficar, umas noites, na casa da quinta.</p>
        </Revelar>
      </div>
    </section>
  );
}
