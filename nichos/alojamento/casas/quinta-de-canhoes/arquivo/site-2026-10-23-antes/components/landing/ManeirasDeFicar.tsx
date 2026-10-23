"use client";

import { motion, type Variants } from "motion/react";
import { OpcoesDeEstadia } from "@/components/landing/OpcoesDeEstadia";

const variants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15
    }
  }
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export function ManeirasDeFicar() {
  return (
    <section className="bg-cal-fundo pt-24 pb-0 md:pt-32 md:pb-0 overflow-hidden relative">
      <div className="mx-auto max-w-[74rem] px-6 md:px-10">
        <motion.div 
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={variants}
        >
          <div className="mx-auto max-w-[58rem] text-center">
            {/* Título reduzido de 6.4rem para 5rem no máximo */}
            <motion.h2 variants={childVariants} className="cartaz text-[clamp(2.5rem,6vw,5rem)] leading-[.94] text-xisto">
              <span className="rustico-medio mr-3 align-baseline text-caixilho">4</span>
              <span className="italic font-medium">maneiras</span><br />de acordar
            </motion.h2>

            {/* Texto reduzido, trocado text-corpo-grande por text-lg */}
            <motion.p variants={childVariants} className="mx-auto mt-6 max-w-[66ch] text-center text-base md:text-lg leading-relaxed text-xisto-suave md:mt-8">
              A Quinta adapta-se ao tempo que trouxer consigo. Pela privacidade e pelo
              sossego que oferece, a tão curta distância de São Pedro do Sul e de Viseu, dá
              para férias em família, para uns dias com amigos, ou para uma estadia de fim
              de semana que reponha as forças.
            </motion.p>
          </div>

          <motion.p
            variants={childVariants}
            className="etiqueta mx-auto mt-6 max-w-[46ch] text-center leading-[2] text-xs md:text-[13px] text-caixilho md:mt-8 tracking-[0.15em]"
            style={{ fontWeight: 700 }}
          >
            Piscina com vista para a montanha • Estacionamento grátis • Animais aceites
          </motion.p>

        </motion.div>
      </div>
      <motion.div
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
        variants={childVariants}
        className="relative z-10 mt-12 md:mt-16"
      >
        <OpcoesDeEstadia />
      </motion.div>
    </section>
  );
}
