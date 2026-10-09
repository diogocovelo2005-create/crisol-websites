'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useRef } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  Ato 1 - O convite. Sentimento: curiosidade.

  A pagina fica presa enquanto a camara avanca pelo caminho ate a casa
  (a fotografia aproxima-se devagar). A promessa sai de cena e entra o
  segundo tempo: a voz de quem recebe, a contar de onde vem a casa. Quem
  faz scroll chega a porta e e recebido antes de ver qualquer facto.

  Gesto desta casa (personalidade "Cortina"): os dois textos nao deslizam,
  sao tapados e destapados por uma cortina horizontal. A promessa fecha-se
  de baixo para cima e a voz abre-se de cima para baixo, como a portada de
  uma janela de cantaria. As opacidades continuam a garantir que nunca ha
  dois textos visiveis ao mesmo tempo.

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
  const { voz, quem } = casa.atmosfera;

  const p = useProgresso(alvo, 'preso');
  const escala = useTransform(p, [0, 1], [1.02, 1.2]);
  const veu = useTransform(p, [0.08, 0.34], [0, 0.42]);
  // a promessa sai depressa, antes de a segunda frase entrar: as duas nunca
  // estao meio transparentes ao mesmo tempo por cima da foto
  const saiOp = useTransform(p, [0.02, 0.2], [1, 0]);
  // a cortina fecha de baixo para cima e leva a promessa com ela
  const saiCorte = useTransform(p, [0.02, 0.2], ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)']);
  // depois de desaparecer, os botoes deixam de apanhar cliques
  const saiToque = useTransform(p, (v) => (v > 0.15 ? 'none' : 'auto'));
  const entraOp = useTransform(p, [0.36, 0.44], [0, 1]);
  // e abre de cima para baixo para destapar a voz de quem recebe
  const entraCorte = useTransform(p, [0.36, 0.6], ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)']);

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
      {/* lvh e nao dvh: no telemovel a barra do browser esconde-se ao fazer
          scroll e o dvh muda de tamanho a meio do gesto. O hero crescia e a
          foto dava um salto. Com lvh a foto tem sempre a altura maior; o
          texto centra-se na altura visivel (svh), por isso nunca fica
          escondido atras da barra. */}
      <section className="sticky top-0 isolate h-lvh min-h-[560px] w-full deitado:min-h-0 overflow-hidden">
        <motion.div style={parado ? undefined : { scale: escala }} className="absolute inset-0 -z-10 origin-[55%_60%]">
          <Image src={imagem} alt={alt} fill priority quality={75} sizes="(max-width: 767px) 180vw, 120vw" className="object-cover" />
        </motion.div>
        <div className="veu-hero absolute inset-0 -z-10" />
        {!parado && <motion.div style={{ opacity: veu }} className="absolute inset-0 -z-10 bg-noite" />}

        <div className="relative mx-auto h-svh min-h-[560px] max-w-[1320px] px-6 deitado:min-h-0 md:px-10">
          {/* primeiro tempo: a promessa. No telemovel sobe (pb-44): a placa de
              madeira "Casa Fatauncos" da fotografia fica no quarto de baixo do
              ecra, e o botao Reservar, da mesma madeira, perdia-se em cima dela */}
          <motion.div
            style={parado ? undefined : { opacity: saiOp, clipPath: saiCorte, pointerEvents: saiToque }}
            className="flex h-full flex-col justify-center pb-16 pt-28 max-md:pb-44 deitado:pb-6 deitado:pt-24 baixo:pb-36 baixo:pt-24"
          >
            <motion.p {...entrada(0.1)} className="versalete text-osso/85">
              {etiqueta}
            </motion.p>
            <motion.h1
              {...entrada(0.2)}
              className="mt-6 max-w-[15ch] text-[clamp(2.9rem,14.5vw,4rem)] leading-[1.02] text-osso sm:text-[4.2rem] lg:text-[5.4rem] deitado:mt-3 deitado:max-w-none deitado:text-[2.6rem] baixo:mt-4 baixo:text-[clamp(2.6rem,13vw,3.3rem)]"
            >
              <Titulo texto={titulo} />
            </motion.h1>
            {/* no telemovel o hero ficava cheio: fica so o titulo e os botoes */}
            <motion.p
              {...entrada(0.35)}
              className="mt-7 max-w-[44ch] text-[1.05rem] font-light max-md:hidden leading-relaxed text-osso/90 md:text-[1.15rem] deitado:mt-3 deitado:max-w-[62ch] deitado:text-[0.95rem] baixo:mt-4 baixo:text-[0.95rem]"
            >
              {texto}
            </motion.p>
            <motion.div {...entrada(0.5)} className="mt-10 flex flex-wrap gap-3 deitado:mt-5 baixo:mt-6">
              <Botao href={casa.reservas} tom="cal-madeira">
                Reservar estadia
              </Botao>
              <Botao href="#a-casa" tom="contorno-claro">
                Conhecer a casa
              </Botao>
            </motion.div>
          </motion.div>

          {/* segundo tempo: a voz de quem recebe */}
          {!parado && (
            <motion.div
              style={{ opacity: entraOp, clipPath: entraCorte }}
              className="pointer-events-none absolute inset-x-6 bottom-0 top-0 flex flex-col justify-center md:inset-x-10"
            >
              <blockquote className="max-w-[30ch] font-display text-[1.6rem] leading-[1.25] text-osso sm:text-[2.1rem] lg:text-[2.6rem] deitado:max-w-[40ch] deitado:text-[1.6rem]">
                {/* hifen que nao parte: uma palavra com hifen nao pode ficar a
                    meio de duas linhas. As aspas so aparecem quando a frase e
                    citada a alguem (`quem`); quando a frase e da casa, nao. */}
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
