"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";

export function HeroQuartos() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const { scrollY } = useScroll();
  
  // Continuous slow zoom as user scrolls down the page
  const bgScale = useTransform(scrollY, [0, 4000], [1, 1.15]);
  
  // Opacity fading for the texts
  const opacityOut = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const yOut = useTransform(scrollYProgress, [0, 0.4], [0, -30]);
  
  const bgDarken = useTransform(scrollYProgress, [0, 0.7], [0, 0.75]);

  return (
    <div ref={containerRef} className="relative h-[200vh] w-full bg-xisto">
      
      {/* 1. Fixed Background & Content that will stick */}
      <div className="sticky top-0 isolate h-screen w-full overflow-hidden z-0">
        
        {/* Background Image */}
        <motion.div 
          style={{ scale: bgScale }}
          className="absolute inset-0 -z-20 will-change-transform origin-[50%_40%]"
        >
          <Image 
            src="/fotos/capa-quartos.jpg" 
            alt="Vista dos quartos da Quinta de Canhões" 
            fill 
            quality={100} 
            unoptimized 
            // Foto do topo: pedida logo, com prioridade, em vez de lazy.
            loading="eager"
            fetchPriority="high"
            className="object-cover opacity-80" 
          />
        </motion.div>
        
        {/* Colorful gradient overlay to bring more life/color to the page */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-vale/90 via-vale/60 to-transparent" />
        
        {/* Overlay that darkens when scrolling to give contrast to the next section entering */}
        <motion.div 
          className="absolute inset-0 -z-10 bg-xisto will-change-opacity"
          style={{ opacity: bgDarken }}
        />

        {/* Content wrapper */}
        <motion.div 
          style={{ opacity: opacityOut, y: yOut }}
          className="absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-10 will-change-[opacity,transform]"
        >
          <div className="mx-auto w-full max-w-[86rem]">
            <div className="grid gap-16 md:grid-cols-2 md:gap-24 lg:gap-32">
              
              {/* Opção 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="relative">
                  <span className="cartaz absolute -left-4 -top-12 text-[8rem] md:text-[10rem] text-cal/15 select-none pointer-events-none">2</span>
                  <div className="relative pt-6">
                    <h2 className="cartaz text-4xl md:text-5xl lg:text-6xl text-cal mb-4 leading-none italic">
                      A dois <br className="hidden md:block"/> ou com amigos
                    </h2>
                    <p className="text-cal/90 leading-relaxed max-w-sm mt-6 text-lg drop-shadow-sm">
                      Reserve apenas os quartos de que precisa. Cada quarto tem casa de banho privativa e total independência para entrar e sair.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Opção 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <div className="relative">
                  <span className="cartaz absolute -left-6 -top-12 text-[8rem] md:text-[10rem] text-caixilho/20 select-none pointer-events-none">15</span>
                  <div className="relative pt-6">
                    <h2 className="cartaz text-4xl md:text-5xl lg:text-6xl text-caixilho mb-4 leading-none italic">
                      A casa <br className="hidden md:block"/> inteira
                    </h2>
                    <p className="text-cal/90 leading-relaxed max-w-sm mt-6 text-lg drop-shadow-sm">
                      Cinco quartos disponíveis, acomodando até 15 pessoas. Ficam com a casa de jantar, o alpendre e o jardim por vossa conta.
                    </p>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


