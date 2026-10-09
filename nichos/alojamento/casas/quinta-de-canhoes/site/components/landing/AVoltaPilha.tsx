"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

type Lugar = { nome: string; distancia: string; texto: string; imagem: string; alt: string };

const lugares: Lugar[] = [
  {
    nome: "As Termas",
    distancia: "3 km",
    texto: "A água sulfúrea brota a 68,7 graus e a nascente é explorada desde o século I. O balneário romano é Monumento Nacional. D. Afonso Henriques veio aqui curar uma perna partida em 1169 e ficou dois meses.",
    imagem: "/fotos/regiao-termas-wikimedia.jpg",
    alt: "Termas de São Pedro do Sul junto ao rio Vouga",
  },
  {
    nome: "Serra da Arada",
    distancia: "22 km",
    texto: "Do alto avistam-se o Montemuro, a Estrela e o Caramulo, e o vale de Lafões inteiro. Um paraíso natural de rocha nua, ar puro e horizontes sem fim.",
    imagem: "/fotos/regiao-serra-arada-wikimedia.jpg",
    alt: "Encostas rochosas da Serra da Arada iluminadas pelo sol",
  },
  {
    nome: "Aldeia da Pena",
    distancia: "19 km",
    texto: "Escondida no fundo do vale, com apenas 6 habitantes. É uma das aldeias de xisto mais preservadas de Portugal, onde parece que o tempo parou.",
    imagem: "/fotos/aldeia_pena-corrigida.jpg",
    alt: "Aldeia da Pena",
  },
  {
    nome: "Ecopista do Vouga",
    distancia: "1 km",
    texto: "A ecopista segue o traçado da antiga linha de caminho de ferro, ao lado do rio. Caminha-se e anda-se de bicicleta a partir daqui, acompanhando o curso da água.",
    imagem: "/fotos/regiao-vouga-wikimedia.jpg",
    alt: "Ponte da antiga Linha do Vouga sobre o rio em Vouzela",
  },
];

export function AVoltaPilha() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(420);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    let alive = true;
    const measure = () => {
      if (!sectionRef.current) return;
      setStep(window.innerWidth < 768 ? 330 : 420);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    document.fonts?.ready.then(() => { if (alive) measure(); });
    return () => {
      alive = false;
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", progress => {
    const travel = (lugares.length - 1) * step + 230;
    const distance = Math.max(0, Math.min(travel, progress * travel));
    const current = Math.min(lugares.length - 1, Math.floor(distance / step));
    const local = current === lugares.length - 1 ? 0 : Math.min(1, (distance - current * step) / step);
    const eased = local * local * (3 - 2 * local);

    setActive(previous => previous === current ? previous : current);

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      if (reducedMotion) {
        card.style.transform = index < current ? "translate3d(0,-110svh,0)" : `rotate(${-11 * (index - current)}deg)`;
        card.style.opacity = index < current ? "0" : "1";
        card.style.filter = "blur(0px)";
        return;
      }

      if (index < current) {
        card.style.transform = "translate3d(0,-110svh,0) rotate(-60deg)";
        card.style.opacity = "0";
        card.style.filter = "blur(0px)";
      } else if (index === current) {
        card.style.transform = `translate3d(0,${-112 * eased}svh,0) rotate(${-60 * eased}deg)`;
        card.style.opacity = String(1 - Math.max(0, (local - 0.82) / 0.18));
        card.style.filter = "blur(0px)";
      } else {
        const dist = (index - current) - eased; 
        const angle = -11 * dist;
        card.style.transform = `rotate(${angle}deg)`;
        
        // Remove o blur das fotografias inativas a pedido do utilizador.
        if (dist > 0) {
          card.style.filter = "blur(0px)";
          card.style.opacity = String(Math.max(0, 1 - (dist * 0.15))); 
        } else {
          card.style.filter = "blur(0px)";
          card.style.opacity = "1";
        }
      }
    });
  });

  const irParaLugar = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + index * step + 1, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="a-volta"
      className="relative z-20 text-cal -mt-24"
      style={{ height: `calc(240svh + ${(lugares.length - 1) * step + 230}px)` }}
    >
      <div className="absolute top-24 bottom-0 left-0 right-0 bg-[#243628] z-0 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]" />
      
      <div className="sticky top-0 mx-auto grid h-[100svh] max-w-[80rem] grid-rows-[auto_1fr] px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:grid-rows-1 md:gap-12 md:px-10 z-10 pt-16">
        <div className="relative z-10 max-w-[31rem] self-center pt-20 md:pt-0">
          <h2 className="cartaz pb-1 text-[clamp(3.3rem,6vw,5.5rem)] italic leading-[1.08]">À volta</h2>
          <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-cal/75 md:mt-6 md:text-lg">
            O centro de São Pedro do Sul fica já ali, a 1,8 km. O vale começa à porta.
          </p>
          <nav className="mt-8 hidden max-w-[25rem] border-y border-cal/15 md:block" aria-label="Lugares à volta da Quinta">
            {lugares.map((lugar, index) => (
              <button
                key={lugar.nome}
                type="button"
                onClick={() => irParaLugar(index)}
                aria-current={index === active ? "step" : undefined}
                className={`group flex w-full items-center justify-between border-b border-cal/10 py-3 text-left transition-colors last:border-b-0 ${index === active ? "text-cal" : "text-cal/46 hover:text-cal/75"}`}
              >
                <span className={`cartaz text-[1.35rem] transition-transform duration-200 ease-out ${index === active ? "translate-x-3 italic" : ""}`}>{lugar.nome}</span>
                <span className={`text-xs tracking-[0.08em] transition-opacity duration-200 ease-out ${index === active ? "opacity-100" : "opacity-0"}`}>{lugar.distancia}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="relative flex min-h-0 items-center justify-center pb-7 pt-3 md:pb-0 md:pt-0">
          <div className="relative h-[min(53svh,29rem)] w-[min(76vw,23rem)] translate-y-8 sm:w-[min(67vw,25rem)] md:h-[min(70svh,32rem)] md:w-[min(33vw,27rem)] md:translate-y-6">
            {lugares.map((lugar, index) => {
              const passed = index < active;
              const angle = -11 * (index - active);
              return (
                <article
                  key={lugar.nome}
                  ref={element => { cardRefs.current[index] = element; }}
                  className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.25rem] border border-[#c2c1aa] bg-[#d5d2be] text-xisto shadow-[0_22px_48px_rgba(8,18,12,0.34)] will-change-[transform,filter,opacity]"
                  style={{
                    zIndex: lugares.length - index,
                    transformOrigin: "12% 88%",
                    transform: passed ? "translate3d(0,-110svh,0) rotate(-60deg)" : `rotate(${angle}deg)`,
                    pointerEvents: index === active ? "auto" : "none",
                  }}
                  aria-hidden={index !== active}
                >
                  <div className="relative min-h-0 flex-[0_0_43%] overflow-hidden bg-xisto/5">
                    <img src={lugar.imagem} alt={lugar.alt} className="object-cover w-full h-full" />
                  </div>
                  
                  <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5">
                    <p className="etiqueta text-[10px] md:text-xs text-caixilho">{lugar.distancia}</p>
                    <h3 className="cartaz mt-1 md:mt-2 text-[clamp(1.5rem,2.5vw,2rem)] leading-none">{lugar.nome}</h3>
                    <p className="mt-2 md:mt-3 text-[0.8rem] leading-[1.5] text-xisto-suave md:text-[0.85rem]">{lugar.texto}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
