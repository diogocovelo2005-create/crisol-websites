"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Revelar } from "@/components/Revelar";
import { Botao } from "@/components/Botao";

export function CortinaQuartos() {
  const container = useRef<HTMLDivElement>(null);
  
  // Efeito Parallax ligeiro na imagem de fundo enquanto fazemos scroll para revelar a cortina
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={container} className="relative z-20 -mt-[100vh] min-h-[100svh] w-full overflow-hidden flex flex-col justify-center bg-xisto shadow-[0_-25px_50px_rgba(0,0,0,0.25)]">
      
      {/* Imagem de Fundo com Parallax */}
      {/* O desfoque está na própria foto (desenhada uma vez) e não num backdrop-blur
          por cima: esse era refeito a cada frame do parallax e travava o scroll. */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 h-[120%] -top-[10%] will-change-transform z-0">
        <Image 
          src="/fotos/capa-quartos.jpg" 
          alt="Quartos da Quinta de Canhões" 
          fill 
          sizes="100vw" 
          quality={100} 
          unoptimized 
          className="object-cover blur-[2px] scale-[1.02]"
        />
        {/* Gradientes para escurecer e colorir a foto, mantendo-a no tom "vale" da paleta */}
        <div className="absolute inset-0 bg-gradient-to-b from-vale/70 to-vale/90" />
        
        {/* Sombra extra no topo para a transição com a secção anterior ser mais dramática */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[24svh] bg-gradient-to-b from-xisto/60 to-transparent" />
      </motion.div>

      {/* Cartão de Conteúdo (Glassmorphism) */}
      <div className="relative z-10 mx-auto max-w-[86rem] px-4 py-16 sm:px-5 sm:py-20 md:px-10 md:py-32 w-full">
        <Revelar>
          <div className="mx-auto flex max-w-[48rem] flex-col items-center justify-center rounded-[2rem] border border-cal/10 bg-cal/5 p-8 text-center backdrop-blur-md shadow-2xl sm:p-12 md:p-20">
            <h2 className="rustico-medio text-4xl md:text-5xl leading-[1.05] text-cal">
              Agora só falta <span className="italic">escolher o quarto</span>
            </h2>
            <p className="mt-6 max-w-[36ch] text-lg leading-relaxed text-cal/80">
              São três opções diferentes, cada uma com o seu charme e prontas para o receber.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <Botao href="/os-quartos#inicio" variante="vivo">
                Ver os quartos
              </Botao>
            </div>
          </div>
        </Revelar>
      </div>
    </div>
  );
}

