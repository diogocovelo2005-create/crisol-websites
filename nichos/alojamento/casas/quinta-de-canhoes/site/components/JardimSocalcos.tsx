"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Revelar } from "./Revelar";

type Nivel = {
  nome: string;
  plantas: string;
  layout: "simples" | "colagem-paisagem" | "colagem-retrato";
  fotos: string[];
};

const jardimNiveis: Nivel[] = [
  { nome: "Alpendre", layout: "simples", fotos: ["/fotos/dia-alpendre.jpg"], plantas: "Videira e sardinheiras" },
  { nome: "Jardim", layout: "colagem-paisagem", fotos: ["/fotos/tanque.jpg", "/fotos/canhoesacasa3.jpg"], plantas: "Tanque de pedra antigo e a fachada sul" },
  { nome: "Pátio", layout: "colagem-retrato", fotos: ["/fotos/mesas-patio.jpg", "/fotos/canhoesacasa2.jpg"], plantas: "Sombra para as tardes quentes e recantos tranquilos" },
  { nome: "Terraço", layout: "simples", fotos: ["/fotos/terraco-piscina.jpg"], plantas: "Piscina com vista sobre o vale" }
];

function RenderLayout({ nivel }: { nivel: Nivel }) {
  if (nivel.layout === "simples") {
    return (
      <figure className="relative aspect-[4/3] md:aspect-[3/2] w-full max-w-3xl overflow-hidden bg-xisto shadow-[0_15px_40px_rgba(0,0,0,0.4)] rounded-sm border border-cal/5">
        <Image src={nivel.fotos[0]} alt={nivel.nome} fill quality={100} unoptimized className="object-cover" />
      </figure>
    );
  }

  if (nivel.layout === "colagem-paisagem") {
    return (
      <div className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[3/2]">
        {/* Foto 1: Quadrada (Tanque/Jardim) - Tamanho grande mantido */}
        <figure className="absolute top-0 left-0 w-[68%] md:w-[65%] aspect-square overflow-hidden bg-xisto shadow-[0_15px_30px_rgba(0,0,0,0.5)] rounded-sm z-10 border border-cal/10">
          <Image src={nivel.fotos[0]} alt={nivel.nome} fill quality={100} unoptimized className="object-cover" />
        </figure>
        {/* Foto 2: Paisagem (Casa) - Empurrada mais para a direita para mostrar a de trás */}
        <figure className="absolute bottom-[2%] right-0 md:right-[-12%] w-[78%] md:w-[75%] aspect-[3/2] overflow-hidden bg-xisto shadow-[0_25px_50px_rgba(0,0,0,0.6)] rounded-sm z-20 border border-cal/20">
          <Image src={nivel.fotos[1]} alt={nivel.nome + " extra"} fill quality={100} unoptimized className="object-cover" />
        </figure>
      </div>
    );
  }

  if (nivel.layout === "colagem-retrato") {
    return (
      <div className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[3/2]">
        {/* Foto 2: Retrato (Casa) no fundo à esquerda */}
        <figure className="absolute top-0 left-0 w-[55%] md:w-[50%] aspect-[3/4] overflow-hidden bg-xisto shadow-[0_15px_30px_rgba(0,0,0,0.5)] rounded-sm z-10 border border-cal/10">
          <Image src={nivel.fotos[1]} alt={nivel.nome + " extra"} fill quality={100} unoptimized className="object-cover" />
        </figure>
        {/* Foto 1: Quadrada (Pátio) à frente na direita */}
        <figure className="absolute bottom-0 right-0 w-[65%] md:w-[60%] aspect-square overflow-hidden bg-xisto shadow-[0_25px_50px_rgba(0,0,0,0.6)] rounded-sm z-20 border border-cal/20">
          <Image src={nivel.fotos[0]} alt={nivel.nome} fill quality={100} unoptimized className="object-cover" />
        </figure>
      </div>
    );
  }
  return null;
}

export function JardimSocalcos() {
  const [activeIndex, setActiveIndex] = useState(0);
  const imgRefs = useRef<(HTMLElement | null)[]>([]);
  const visibleRefs = useRef<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            visibleRefs.current.add(idx);
            changed = true;
          } else {
            visibleRefs.current.delete(idx);
            changed = true;
          }
        });

        // Atualiza para o índice mais alto que estiver visível no ecrã,
        // garantindo que quando uma nova carta sobrepõe a anterior, o menu atualiza corretamente.
        if (changed && visibleRefs.current.size > 0) {
          const maxIdx = Math.max(...Array.from(visibleRefs.current));
          setActiveIndex(maxIdx);
        }
      },
      { rootMargin: "-30% 0px -30% 0px" } 
    );

    imgRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    // Sem backdrop-blur: por baixo está a foto do hero a fazer zoom, e o desfoque
    // tinha de ser refeito a cada frame (metade dos frames passavam de 25 ms).
    <section className="bg-xisto/15 py-24 text-cal md:py-32 border-t border-cal/10 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
      <div className="mx-auto max-w-[86rem] px-6 md:px-10">
        <div className="md:flex gap-16 lg:gap-24 relative items-start">
          
          {/* Coluna da Esquerda: Lista animada (Sticky) */}
          <div className="md:w-1/3 mb-16 md:mb-0 md:sticky md:top-48 z-30">
            <h2 className="rustico-medio text-4xl mb-6 text-cal drop-shadow-sm">O jardim desce<br/>em <span className="text-caixilho-claro">socalcos</span></h2>
            <p className="text-cal/80 leading-relaxed mb-12">
              São cerca de 2.000 m² de terreno, divididos em diferentes patamares que acompanham a inclinação natural do vale. Cada socalco tem as suas flores.
            </p>
            
            <ul className="space-y-4 border-l border-cal/30 pl-6">
              {jardimNiveis.map((nivel, i) => {
                const ativo = activeIndex === i;
                return (
                  <li key={i} className={`relative transition-all duration-500 ${ativo ? 'opacity-100' : 'opacity-40'}`}>
                    <span 
                      className={`absolute -left-[29px] top-2 h-2 w-2 rounded-full transition-all duration-500 shadow-md ${
                        ativo ? 'bg-cal scale-125' : 'bg-cal/30 scale-100'
                      }`} 
                    />
                    
                    <h4 className={`rustico-medio text-xl text-cal drop-shadow-sm transition-transform duration-500 ${ativo ? 'translate-x-1' : 'translate-x-0'}`}>
                      {nivel.nome}
                    </h4>
                    
                    <motion.div
                      initial={false}
                      animate={{ height: ativo ? "auto" : 0, opacity: ativo ? 1 : 0 }}
                      className="overflow-hidden"
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <p className="text-sm text-caixilho-claro mt-1 pb-2 pl-1">{nivel.plantas}</p>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Coluna da Direita: Fotografias (Stacking Cards) */}
          <div className="md:w-2/3 relative pb-[10vh]">
            {jardimNiveis.map((nivel, i) => {
              const isPast = i < activeIndex;
              return (
                <div
                  key={i}
                  ref={(el) => { imgRefs.current[i] = el; }}
                  data-index={i}
                  // A margem faz a carta seguinte entrar pelo fundo do ecrã logo depois
                  // de a anterior prender (20vh de pausa). Antes eram 100vh de margem:
                  // quase um ecrã de scroll sem nada a mexer, depois a foto a correr.
                  // Conta: 100vh + pausa - topo do sticky - altura da carta.
                  className={`sticky top-24 md:top-32 w-full flex justify-center items-center h-[60vh] md:h-[70vh] transition-opacity duration-1000 ${isPast ? 'opacity-0' : 'opacity-100'} ${i > 0 ? 'mt-[calc(60vh-6rem)] md:mt-[calc(50vh-8rem)]' : ''}`}
                  style={{ zIndex: 10 + i }}
                >
                  <Revelar className="w-full flex justify-center items-center h-full relative">
                    <RenderLayout nivel={nivel} />
                    {/* Mobile Caption Overlay */}
                    <div className="absolute -bottom-8 left-0 right-0 z-30 md:hidden bg-xisto/90 backdrop-blur-md p-4 rounded-md border border-cal/10 text-cal shadow-xl">
                      <h4 className="rustico-medio text-xl">{nivel.nome}</h4>
                      <p className="text-sm text-cal/80 mt-1">{nivel.plantas}</p>
                    </div>
                  </Revelar>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
