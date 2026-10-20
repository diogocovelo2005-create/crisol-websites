"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Botao } from "@/components/Botao";

export function Historia() {
  const reduced = useReducedMotion();

  return (
    <section id="a-casa" className="relative overflow-hidden bg-[#d5d2be] text-xisto">
      <div className="relative mx-auto max-w-[76rem] px-6 py-24 md:px-10 md:py-32">
        <div className="relative">
          <div className="absolute left-0 top-[4.5rem] z-10 h-[16.5rem] w-full md:top-0 md:h-[23rem] md:w-[45%]">
            <motion.div
              initial={reduced ? false : { x: -28, y: 18, rotate: -10, scale: 0.97 }}
              whileInView={{ x: 0, y: 0, rotate: -6, scale: 1 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18 }}
              className="absolute bottom-0 left-0 z-10 w-[230px] rounded-[2px] bg-[#f9f8f3] p-[6px] pb-[30px] shadow-[0_15px_30px_rgba(20,18,15,0.12)] md:w-[270px] md:p-[10px] md:pb-[40px]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-xisto/5">
                <Image src="/fotos/historia.jpg" alt="A casa original, décadas atrás" fill sizes="(min-width: 768px) 270px, 230px" quality={90} className="object-cover" />
              </div>
            </motion.div>
            <motion.div
              initial={reduced ? false : { x: 28, y: -18, rotate: 12, scale: 0.97 }}
              whileInView={{ x: 0, y: 0, rotate: 8, scale: 1 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18, delay: 0.12 }}
              className="absolute right-0 top-0 z-20 w-[230px] rounded-[2px] bg-[#f9f8f3] p-[6px] pb-[30px] shadow-[0_20px_40px_rgba(20,18,15,0.2)] md:w-[270px] md:p-[10px] md:pb-[40px]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-xisto/5">
                <Image src="/fotos/historia2.jpg" alt="A casa hoje, recuperada" fill sizes="(min-width: 768px) 270px, 230px" quality={90} className="object-cover" />
              </div>
            </motion.div>
          </div>

          <h2 className="cartaz pointer-events-none absolute left-0 top-0 z-30 max-w-[9ch] pb-2 text-[clamp(3.1rem,11vw,4rem)] italic leading-[1.08] text-[#702c2c] [text-shadow:0_1px_1px_#d5d2be,0_0_10px_#d5d2be] md:left-[32%] md:top-12 md:max-w-none md:whitespace-nowrap md:text-[clamp(3.1rem,6vw,5.5rem)]">
            Desde há cem anos
          </h2>

          <div className="relative z-20 pt-[23rem] md:ml-auto md:w-[52%] md:pt-[15rem]">
            <p className="max-w-[48ch] text-corpo-grande leading-relaxed text-xisto-suave">
              A casa é centenária. Foi recuperada mantendo a estrutura original,
              a arquitectura característica da região e o granito à vista. Os
              caixilhos, as portas e o gradeamento conservam o mesmo vermelho.
            </p>
            <p className="mt-5 max-w-[48ch] text-corpo-grande leading-relaxed text-xisto-suave">
              Lá fora, os socalcos abrem espaço aos jardins bem cuidados. De
              cada canto, a vista foge para as montanhas que fecham o vale. É um
              refúgio para abrandar.
            </p>
            <Botao href="/a-casa" variante="texto" className="mt-9 text-base">
              O que estas paredes guardam
            </Botao>
          </div>
        </div>
      </div>
    </section>
  );
}
