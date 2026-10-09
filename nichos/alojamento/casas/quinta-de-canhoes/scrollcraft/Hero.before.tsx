"use client";

import { useRef } from "react";
import { Foto } from "@/components/Foto";
import { Botao } from "@/components/Botao";
import { TituloHero } from "@/components/landing/TituloHero";
import { motion, useScroll, useTransform } from "motion/react";

export function Hero() {
  const container = useRef<HTMLDivElement>(null);
  
  // Usamos 200vh. A parte 'sticky' (100vh) vai ficar fixa durante 100vh de scroll.
  // Depois disso (quando scrollYProgress chegar a 0.5), ela solta-se e acompanha o ecrã.
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"], // 0 = topo no topo. 1 = fundo no topo (200vh depois)
  });

  // O zoom vai até 30% (scale 1.3), terminando um pouco antes de se soltar (0.4)
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.3]);
  const yImage = useTransform(scrollYProgress, [0, 0.4], ["0%", "5%"]);
  
  // O texto sai de cena suavemente (desliza para cima e desvanece) muito rápido (0 a 0.2)
  const textY = useTransform(scrollYProgress, [0, 0.2], ["0%", "-40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  // A imagem de fundo desvanece COMPLETAMENTE antes de a secção se soltar (0.3 a 0.48).
  // Assim, quando a secção começar a subir (aos 0.5), já só se vê a cor 'bg-cal-fundo',
  // fundindo-se de forma 100% invisível com a secção seguinte que tem a mesma cor!
  const imageOpacity = useTransform(scrollYProgress, [0.3, 0.48], [1, 0]);

  return (
    <section ref={container} className="relative h-[200vh] bg-cal-fundo">
      
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex items-center justify-center">
        
        {/* Fotografia */}
        <motion.div style={{ scale, y: yImage, opacity: imageOpacity }} className="absolute inset-0 origin-center will-change-transform">
          <Foto
            nome="hero-telemovel"
            alt="Janela de caixilho vermelho aberta sobre o vale do Vouga"
            preencher
            priority
            qualidade={100}
            sizes="100vw"
            className="object-cover object-center md:hidden"
          />
          <Foto
            nome="hero"
            alt="Janela de caixilho vermelho aberta sobre o vale do Vouga"
            preencher
            priority
            qualidade={96}
            sizes="100vw"
            className="hidden object-cover object-center md:block"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-xisto/70 via-transparent to-xisto/20" />
        </motion.div>

        {/* Textos */}
        <motion.div style={{ y: textY, opacity: textOpacity }} className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          
          <div className="absolute inset-0 flex items-center justify-center pt-[20%] md:pt-0">
            <h1
              className="cartaz flex w-[min(86vw,42rem)] flex-col items-center text-center text-[9.4vw] md:text-[clamp(2.5rem,6.5vw,5.5rem)]"
              style={{ lineHeight: 1.3 }}
            >
              <TituloHero />
            </h1>
          </div>

          <div className="mx-auto w-full max-w-[86rem] px-6 pt-6 md:px-10 md:pt-7">
            <p className="rustico-encorpado text-[1.35rem] leading-[0.94] text-cal [text-shadow:0_1px_16px_rgba(34,31,27,0.7)] md:text-[1.6rem]">
              Quinta de
              <br />
              Canhões
            </p>
          </div>

          <div className="mx-auto w-full max-w-[86rem] px-6 pb-16 md:px-10 md:pb-20 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-4">
              <Botao href="/reservar" variante="cheio" pequeno>
                Reservar
              </Botao>
              <Botao href="/a-casa" variante="claro" pequeno>
                Conhecer a casa
              </Botao>
            </div>

            <p
              className="etiqueta mt-5 text-cal/80 [text-shadow:0_1px_14px_rgba(34,31,27,0.75)]"
              style={{ fontSize: "0.56rem", letterSpacing: "0.18em" }}
            >
              Turismo de Habitação · Várzea, São Pedro do Sul
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
