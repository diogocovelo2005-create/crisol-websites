'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useEffect, useRef } from 'react';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  Ato final - O convite a agir. Sentimento: decisao.

  A fotografia comeca pequena, a meio do ecra, e cresce continuamente
  enquanto a seccao sobe, ate ocupar tudo quando encosta ao topo, sem
  prender a pagina. O texto fica parado dentro da seccao e
  parte dele cai fora da fotografia.

  Gesto desta casa (personalidade "Cortina"): a moldura inicial nao e um
  retangulo, e um arco de porta (os cantos de cima abrem a 50%), como as
  portas de cantaria da casa. O arco endireita-se a medida que cresce e no
  fim e o ecra inteiro.

  O truque da cor: o texto existe duas vezes, no mesmo sitio exato.
  - por baixo, uma copia escura sobre o linho;
  - por cima, uma copia clara, recortada com o MESMO clip-path da foto.
  Assim cada letra e escura enquanto esta fora da fotografia e fica clara
  no instante em que a fotografia a cobre, letra a letra, sem calcular
  nada. No fim a foto cobre tudo e o texto fica todo claro, parado: o
  fim resolve.

  A copia escura e decorativa para leitores de ecra (aria-hidden) e os
  links dela saem da ordem do teclado, para nao haver botoes repetidos.
  Com movimento reduzido fica so a versao final: foto inteira, texto claro.
*/

function Conteudo({ claro, blocoRef }: { claro: boolean; blocoRef?: React.Ref<HTMLDivElement> }) {
  const { etiqueta, titulo, texto } = casa.fecho;
  const foco = claro ? {} : { tabIndex: -1 };

  return (
    <div className="mx-auto flex h-full max-w-[1320px] flex-col justify-center px-6 md:px-10">
      {/* o bloco e medido no telemovel: a moldura inicial da foto envolve-o */}
      <div ref={blocoRef}>
      <p className={`versalete ${claro ? 'text-ouro-claro' : 'text-ouro-escuro'}`}>{etiqueta}</p>
      <h2 className={`mt-5 max-w-[14ch] text-[3rem] md:text-[5rem] ${claro ? 'text-osso' : 'text-tinta'}`}>
        <Titulo texto={titulo} />
      </h2>
      <p className={`mt-6 max-w-[40ch] font-light leading-[1.8] ${claro ? 'text-osso/85' : 'text-tinta-medio'}`}>
        {texto}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Botao href={casa.reservas} tom={claro ? 'ouro' : 'floresta-madeira'} {...foco}>
          Reservar estadia
        </Botao>
        <Botao href={`tel:${casa.contacto.telemovelLimpo}`} tom={claro ? 'contorno-claro' : 'contorno'} {...foco}>
          <PhoneIcon size={17} weight="regular" />
          {casa.contacto.telemovel}
        </Botao>
      </div>
      </div>
    </div>
  );
}

// Duas fotos: horizontal no computador, retrato no telemovel. A horizontal
// esticada a um ecra alto perdia resolucao. So a visivel e descarregada.
function Fotografia() {
  const { imagem, imagemTelemovel, alt } = casa.fecho;
  return (
    <>
      <Image src={imagem} alt={alt} fill quality={86} sizes="140vw" className="hidden object-cover md:block" />
      <Image src={imagemTelemovel} alt={alt} fill quality={88} sizes="180vw" className="object-cover md:hidden" />
      <div className="absolute inset-0 bg-gradient-to-r from-floresta/90 via-floresta/60 to-floresta/15" />
    </>
  );
}

export default function Fecho() {
  const parado = useMovimentoReduzido();
  const alvo = useRef<HTMLElement>(null);
  // A seccao nao prende a pagina: a foto amplia continuamente enquanto a
  // seccao sobe no ecra (do topo dela a entrar por baixo ate encostar ao
  // topo) e chega ao ecra inteiro nesse momento. O scroll nunca para.
  const p = useProgresso(alvo, 'entrada');
  const telemovel = useMedia('(max-width: 767px)');

  // a foto cresce de um quadro a meio do ecra ate ao ecra inteiro
  const recorteLargo = useTransform(
    p,
    [0, 1],
    [
      'inset(22% 24% 22% 22% round 50% 50% 8px 8px)',
      'inset(0% 0% 0% 0% round 0% 0% 0px 0px)',
    ],
  );
  // No telemovel a moldura inicial envolve o bloco de texto inteiro (da
  // etiqueta ao ultimo botao), com uma margem a volta, e cresce dai ate ao
  // ecra. Mede-se o bloco da copia escura, que nunca e recortada.
  const bloco = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const moldura = useRef({ cima: 0, direita: 0, baixo: 0, esquerda: 0 });

  useEffect(() => {
    if (!telemovel) return;
    const MARGEM = 20;
    const medir = () => {
      const b = bloco.current?.getBoundingClientRect();
      const s = palco.current?.getBoundingClientRect();
      if (!b || !s) return;
      moldura.current = {
        cima: Math.max(0, b.top - s.top - MARGEM),
        direita: Math.max(0, s.right - b.right - MARGEM),
        baixo: Math.max(0, s.bottom - b.bottom - MARGEM),
        esquerda: Math.max(0, b.left - s.left - MARGEM),
      };
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (bloco.current) ro.observe(bloco.current);
    if (palco.current) ro.observe(palco.current);
    return () => ro.disconnect();
  }, [telemovel]);

  const recorteTelemovel = useTransform(p, (v) => {
    const k = 1 - Math.min(1, Math.max(0, v));
    const m = moldura.current;
    // o mesmo arco do computador: os cantos de cima abrem ate 40% e fecham
    return `inset(${m.cima * k}px ${m.direita * k}px ${m.baixo * k}px ${m.esquerda * k}px round ${40 * k}% ${40 * k}% ${8 * k}px ${8 * k}px)`;
  });
  const recorte = telemovel ? recorteTelemovel : recorteLargo;
  const escala = useTransform(p, [0, 1], telemovel ? [1.1, 1] : [1.25, 1]);

  if (parado) {
    return (
      <section id="reservar" className="relative mt-10 h-svh min-h-[640px] overflow-hidden md:mt-36">
        <div className="absolute inset-0">
          <Fotografia />
        </div>
        <div className="relative h-full">
          <Conteudo claro />
        </div>
      </section>
    );
  }

  return (
    <section id="reservar" ref={alvo} className="relative mt-10 md:mt-36">
      <div ref={palco} className="relative h-svh min-h-[640px] overflow-hidden bg-linho">
        {/* por baixo: texto escuro sobre linho */}
        <div aria-hidden className="absolute inset-0">
          <Conteudo claro={false} blocoRef={bloco} />
        </div>

        {/* por cima: a foto e o texto claro, recortados juntos */}
        <motion.div style={{ clipPath: recorte }} className="absolute inset-0">
          <motion.div style={{ scale: escala }} className="absolute inset-0">
            <Fotografia />
          </motion.div>
          <div className="absolute inset-0">
            <Conteudo claro />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
