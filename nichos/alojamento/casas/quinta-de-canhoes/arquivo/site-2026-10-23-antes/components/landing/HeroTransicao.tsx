"use client";

import { motion, useScroll, useTransform } from "motion/react";
import React from "react";

export function HeroTransicao({ children }: { children?: React.ReactNode }) {
  const spacerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start start", "end end"]
  });
  
  // Pegamos no scroll global da página para a animação de zoom não travar.
  // Vai fazer zoom continuamente enquanto fazemos scroll na página inteira (até 4000px).
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 4000], [1, 1.15]);

  // 1. Texto inicial (Hero) desvanece rápido mas suave (em 25% do scroll)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  // 2. Texto secundário (Intro) entra bem rápido (termina aos 30%) e 
  // FICA ESTÁTICO durante muito tempo (de 30% até 90% do total)
  const introOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.9, 1], [0, 1, 1, 0]);
  const introScale = useTransform(scrollYProgress, [0.1, 0.3, 0.9, 1], [1.05, 1, 1, 0.95]);
  
  // Escurecemos o fundo mais rapidamente para dar destaque ao novo texto
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [0.15, 0.75]);

  // Pointer events baseados na opacidade para garantir que os links (se houver)
  // só são clicáveis no texto ativo
  const heroEvents = useTransform(heroOpacity, v => v > 0.5 ? 'auto' : 'none') as any;
  const introEvents = useTransform(introOpacity, v => v > 0.5 ? 'auto' : 'none') as any;

  return (
    <div className="relative w-full bg-xisto">
      {/* Fundo Fixo e Textos (presos ao ecrã) */}
      <div className="sticky top-0 isolate h-screen w-full overflow-hidden z-0">
        
        {/* Background Image com Zoom */}
        <motion.div style={{ scale }} className="absolute inset-0 -z-10 origin-[50%_60%] will-change-transform">
          {/* Foto do topo: pedida logo, com prioridade (antes ficava em lazy e só
              aparecia aos 4,7 s em 4G). O browser escolhe o tamanho que chega ao
              ecrã; as versões vêm de scripts/tamanhos.mjs, com a mesma qualidade
              do original. O sizes conta com o object-cover (num ecrã alto a foto
              cobre 1,5x a altura) e com o zoom até 1,15. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fotos/imagemacasa.jpg"
            srcSet="/fotos/tamanhos/imagemacasa-1280.jpg 1280w, /fotos/tamanhos/imagemacasa-1920.jpg 1920w, /fotos/imagemacasa.jpg 2528w"
            sizes="max(115vw, 173vh)"
            alt="Fachada de granito da casa"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
        </motion.div>
        
        {/* Overlays Escuros */}
        <motion.div 
          className="absolute inset-0 -z-10 bg-xisto will-change-opacity"
          style={{ opacity: bgOpacity }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-xisto/90 via-transparent to-transparent opacity-80" />

        {/* 1. Texto do Hero */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center will-change-transform"
          style={{ opacity: heroOpacity, scale: heroScale, pointerEvents: heroEvents }}
        >
          <h1 className="rustico-medio text-[12vw] italic leading-none text-cal drop-shadow-lg md:text-[8vw]">
            Cem anos de granito
          </h1>
          <p className="mt-8 max-w-xl text-lg text-cal/90 drop-shadow-md mx-auto">
            Uma casa centenária recuperada com a estrutura original, rodeada de um jardim que desce em socalcos até à piscina.
          </p>
        </motion.div>

        {/* 2. Texto de Introdução ("A mesma estrutura, o mesmo vermelho") */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center will-change-transform"
          style={{ opacity: introOpacity, scale: introScale, pointerEvents: introEvents }}
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="rustico-medio text-3xl md:text-5xl text-cal mb-8">A mesma estrutura,<br className="md:hidden" /> o mesmo <span className="text-caixilho-claro">vermelho</span></h2>
            <div className="space-y-6 text-lg md:text-xl text-cal/95 leading-relaxed drop-shadow-md">
              <p>
                A quinta foi recuperada respeitando inteiramente a arquitectura característica da região. O granito espesso ficou à vista, tanto por dentro como por fora, guardando o fresco no verão e o calor no inverno.
              </p>
              <p>
                As portas, os caixilhos e o gradeamento continuam pintados do mesmo vermelho escuro de sempre. É assim que a casa se destaca no meio de todo este verde.
              </p>
            </div>
          </div>
        </motion.div>
        
      </div>
      
      {/* Espaçador para fazer o scroll - longo para dar muito tempo de leitura */}
      <div ref={spacerRef} className="relative z-10 h-[200vh] md:h-[260vh] w-full pointer-events-none" />

      {/* Secção do Jardim (desliza por cima do fundo preso) */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
