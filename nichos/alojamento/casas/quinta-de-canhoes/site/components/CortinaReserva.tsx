"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Revelar } from "@/components/Revelar";
import { Botao } from "@/components/Botao";
import { IconeWhatsapp } from "@/components/IconeWhatsapp";
import { contactos, linkWhatsapp } from "@/lib/contactos";

export function CortinaReserva() {
  const container = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={container} data-contacto-whatsapp className="relative z-20 -mt-[100vh] min-h-[100svh] w-full overflow-hidden flex flex-col justify-center bg-vale shadow-[0_-25px_50px_rgba(0,0,0,0.3)]">
      
      {/* Imagem de Fundo Colorida com Parallax */}
      {/* O desfoque está na própria foto (desenhada uma vez) e não num backdrop-blur
          por cima: esse era refeito a cada frame do parallax e travava o scroll. */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 h-[120%] -top-[10%] will-change-transform z-0">
        <Image 
          src="/fotos/dia-piscina.jpg" 
          alt="Piscina da Quinta de Canhões" 
          fill 
          sizes="100vw" 
          quality={100} 
          unoptimized 
          className="object-cover blur-[2px] scale-[1.02]"
        />
        {/* Gradientes e blur para criar cor vibrante mas com legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-vale/90 via-vale/70 to-vale/80" />
        
        {/* Sombra extra no topo para a transição */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[24svh] bg-gradient-to-b from-[#243628] to-transparent opacity-90" />
      </motion.div>

      {/* Cartão de Conteúdo Centralizado */}
      <div className="relative z-10 mx-auto max-w-[86rem] px-4 py-16 sm:px-5 sm:py-20 md:px-10 md:py-32 w-full">
        <Revelar>
          <div className="mx-auto flex max-w-[48rem] flex-col items-center justify-center rounded-[2rem] border border-cal/10 bg-cal/10 p-8 text-center backdrop-blur-md shadow-2xl sm:p-12 md:p-20">
            <h2 className="cartaz text-4xl md:text-5xl lg:text-6xl leading-none text-cal italic drop-shadow-sm">
              Escolha as datas <br/> e ligue
            </h2>
            <p className="mt-6 max-w-[34ch] text-lg leading-relaxed text-cal/90 drop-shadow-sm">
              Quem responde é a Teresa, e diz-lhe logo o que há livre para a sua estadia.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <Botao
                href={linkWhatsapp()}
                target="_blank"
                rel="noreferrer"
                variante="vivo"
                seta={false}
                className="md:px-10 md:py-5 md:text-lg"
              >
                <IconeWhatsapp className="h-5 w-5 shrink-0" />
                WhatsApp
              </Botao>
              <Botao
                href={contactos.telemovel.href}
                variante="claro"
                seta={false}
                className="md:px-10 md:py-5 md:text-lg"
              >
                Ligar {contactos.telemovel.texto}
              </Botao>
            </div>
          </div>
        </Revelar>
      </div>
    </div>
  );
}

