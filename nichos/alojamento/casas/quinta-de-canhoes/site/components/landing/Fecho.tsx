"use client";

import { useRef } from "react";
import Image from "next/image";
import { Botao } from "@/components/Botao";
import { Revelar } from "@/components/Revelar";
import { Rotativo, type Testemunho } from "@/components/Rotativo";
import { contactos, linkWhatsapp } from "@/lib/contactos";
import { IconeWhatsapp } from "@/components/IconeWhatsapp";
import { motion, useScroll, useTransform } from "motion/react";

const testemunhos: Testemunho[] = [
  {
    texto:
      "A localização muito boa, com um bom pequeno almoço e a simpatia da dona que nos recebeu e se despediu de nós num espaço maravilhoso que nos faz sentir em casa. Certamente a repetir.",
    autor: "Francisco",
    contexto: "Quarto Twin · setembro de 2025",
  },
  {
    texto:
      "Casa antiga recuperada com excelente bom gosto e estima. Muito sossegada. Piscina e jardim muito aprazíveis. A repetir e recomendo a quem procura sossego com conforto.",
    autor: "Alexandra",
    contexto: "Suite · julho de 2026",
  },
  {
    texto:
      "Adorei o alojamento, a D. Teresa muito simpática, sempre disponível… O pequeno almoço variava ao longo dos dias, excelentes panquecas e ovos mexidos!",
    autor: "Sandra",
    contexto: "Quarto Duplo · agosto de 2025",
  },
];

export function Fecho() {
  const container = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={container} data-contacto-whatsapp className="relative z-30 -mt-[100svh] overflow-hidden bg-[#2c3729]">
      <div className="relative w-full flex flex-col justify-center min-h-[100svh]">
        <motion.div style={{ y: imgY }} className="absolute inset-0 h-[130%] -top-[15%] will-change-transform z-[-1]">
        <Image src="/fotos/heroreservar.jpg" alt="Piscina da quinta" fill sizes="100vw" quality={100} unoptimized={true} className="object-cover" />
        {/* Adicionado gradiente overlay para escurecer o fundo e realçar o painel de vidro */}
        <div className="absolute inset-0 bg-gradient-to-b from-vale/60 to-vale/80" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[24svh] bg-gradient-to-b from-[#2c3729] via-[#2c3729]/80 to-transparent" />
      </motion.div>

      <div className="relative mx-auto max-w-[86rem] px-4 py-16 sm:px-5 sm:py-20 md:px-10 md:py-32 w-full">
        <Revelar>
          {/* Transformado em Glassmorphism flutuante e sofisticado */}
          <div className="mx-auto max-w-[68rem] rounded-[2rem] p-4 sm:p-12 md:p-20">
            <div className="grid gap-12 md:grid-cols-[1.05fr_1fr] md:gap-16">
              <div className="flex flex-col justify-center">
                <p className="etiqueta text-cal">Reservar</p>
                <h2 className="cartaz mt-4 max-w-[14ch] text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-cal md:mt-6">
                  Há um <span className="italic">quarto</span> à sua espera
                </h2>
                <p className="mt-4 max-w-[36ch] text-corpo-grande leading-relaxed text-cal/80 md:mt-6">
                  Ligue ou escreva. Quem responde é a Teresa, e diz-lhe logo o que há
                  livre.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-12">
                  <Botao
                    href={linkWhatsapp()}
                    target="_blank"
                    rel="noreferrer"
                    variante="cheio"
                    seta={false}
                  >
                    <IconeWhatsapp className="h-[1.1rem] w-[1.1rem] shrink-0" />
                    Escrever à Teresa
                  </Botao>
                  <p className="text-cal/80">
                    ou ligue{" "}
                    <a
                      href={contactos.telemovel.href}
                      className="text-[1.2rem] font-medium tracking-[0.01em] text-cal underline decoration-cal/50 decoration-1 underline-offset-[6px] transition-colors hover:decoration-caixilho md:text-[1.35rem]"
                      style={{ fontVariantNumeric: "tabular-nums lining-nums" }}
                    >
                      {contactos.telemovel.texto}
                    </a>
                  </p>
                </div>
                <p className="mt-6 text-sm italic text-cal/75">
                  Há vantagens que só encontra ao falar connosco.
                </p>
              </div>

              <div className="border-t border-cal/30 pt-10 md:border-l md:border-t-0 md:pl-16 md:pt-0">
                <p className="etiqueta mb-5 text-cal/80 md:mb-7">
                  <span className="cartaz mr-2 align-middle text-2xl text-cal">
                    8,6
                  </span>
                  <span className="align-middle">em 110 avaliações no Booking</span>
                </p>
                <div className="text-cal [&_.text-xisto]:!text-cal [&_.text-xisto-suave]:!text-cal/90 [&_.text-xisto-medio]:!text-cal/70 [&_.border-granito-linha]:!border-cal/40 [&_button]:hover:!border-caixilho [&_.bg-granito-linha]:!bg-cal/30"><Rotativo itens={testemunhos} /></div>
              </div>
            </div>
          </div>
        </Revelar>
      </div>
      </div>
    </section>
  );
}



