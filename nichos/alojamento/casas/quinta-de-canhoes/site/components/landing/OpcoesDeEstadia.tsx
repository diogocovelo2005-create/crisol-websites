"use client";

import { useEffect, useState } from "react";
import AccordionGallery from "@/components/reactbits/AccordionGallery";
import DepthCarousel from "@/components/reactbits/DepthCarousel";
import { fotos, type NomeFoto } from "@/lib/fotos";

type Opcao = {
  nome: string;
  detalhe: string;
  frase: string;
  /** Segunda linha, só onde há mais que dizer. */
  extra?: string;
  /** Número que decide a reserva, destacado em linha própria. */
  capacidade?: string;
  imagem: string;
  alt: string;
};

const opcoes: Opcao[] = [
  {
    nome: "A casa inteira",
    detalhe: "Cinco quartos",
    // Na linha da ficha, em maiúsculas de 11 px, este número passava
    // despercebido. É ele que decide a reserva de um grupo, por isso tem
    // linha própria e a cor dos caixilhos.
    capacidade: "Até 15 pessoas",
    frase: "Para juntar amigos ou família e fazer da Quinta a casa de todos.",
    extra: "E o dia acaba na piscina, no relvado, com a montanha toda em frente.",
    imagem: "/fotos/piscina canhoes.jpg",
    alt: "A piscina no relvado da quinta, com o jardim em socalcos, a pérgula coberta de verde e a casa de granito acima",
  },
  {
    nome: "Quarto Duplo",
    detalhe: "Uma cama de casal",
    frase: "Para acordar devagar, com a manhã inteira só para os dois.",
    imagem: "/fotos/quarto duplo melhorado.jpg",
    alt: "Quarto com cama de casal, colcha verde-água e gravuras botânicas por cima da cabeceira",
  },
  {
    nome: "Quarto Twin",
    detalhe: "Duas camas individuais",
    frase: "Para partilhar a viagem sem deixar de ter o seu próprio espaço.",
    imagem: "/fotos/quarto twin 2.jpg",
    alt: "Quarto com duas camas individuais, cabeceiras brancas em ferro forjado e gravuras botânicas na parede",
  },
  {
    nome: "Suites",
    detalhe: "Cama de casal e dois sofás-cama",
    frase: "Para ficar mais tempo, espalhar-se e deixar o dia entrar.",
    imagem: "/fotos/suite 2.jpg",
    alt: "Sala ampla da suite, com paredes de granito, sofás de couro, mesa de madeira lavrada e a sala de jantar ao fundo",
  },
];

const LIMITE_ESTREITO = 768;

/**
 * Duas apresentações para as mesmas quatro opções.
 *
 * Em ecrã largo, um acordeão de painéis: o que está sob o rato abre-se e
 * mostra a fotografia. Em telemóvel isso não funciona, porque não há rato,
 * por isso entra um carrossel em profundidade que se arrasta com o dedo.
 * Só uma delas é montada de cada vez, para não carregar fotografias que
 * ninguém vai ver.
 */
export function OpcoesDeEstadia() {
  const [estreito, setEstreito] = useState(false);

  useEffect(() => {
    const medir = () => setEstreito(window.innerWidth < LIMITE_ESTREITO);
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  return estreito ? <Carrossel /> : <Acordeao />;
}

/** Telemóvel: carrossel em profundidade, arrastável ao dedo. */
function Carrossel() {
  return (
    // overflow-x-clip: a secção à volta perde o overflow-hidden (Hero.module.css
    // põe-na visible), e sem este corte os 24px de cada lado alargavam a página
    // no telemóvel, empurrando o menu e o botão do WhatsApp para fora do ecrã.
    <div className="mt-10 overflow-x-clip">
      {/* Sai da goteira da página para o cartão da frente ocupar quase o
          ecrã todo. O overflow-hidden é o que impede os cartões de trás,
          que ficam para lá da borda, de alargarem a página. */}
      <div className="-mx-6 overflow-hidden">
        <div className="h-[clamp(26rem,118vw,30rem)]">
          <DepthCarousel
            items={opcoes.map((o) => ({
              image: o.imagem,
              alt: o.alt,
              label: o.nome,
              detail: [o.detalhe, o.capacidade].filter(Boolean).join(" · "),
              description: [o.frase, o.extra].filter(Boolean).join(" "),
            }))}
            cardWidth={330}
            cardHeight={408}
            sideRoom={36}
            /* Sem sombra: com os cartões quase encostados, as sombras dos
               de trás somavam-se e liam-se como um risco escuro debaixo da
               pilha. */
            cardShadow="none"
            radius={14}
            tint="#2c3729"
            depth={170}
            spread={68}
            tilt={8}
            visibleCards={3}
            blur={2}
            duration={0.7}
            autoplay
            autoplayDelay={5200}
            loop
            showControls={false}
            showIndicators
          />
        </div>
      </div>

    </div>
  );
}

/** Ecrã largo: acordeão de painéis, abre o que está sob o rato. */
function Acordeao() {
  return (
    <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 px-2 sm:px-4 md:mt-12 lg:px-6">
      <AccordionGallery
        items={opcoes.map((o) => ({
          image: o.imagem,
          label: o.nome,
          detail: [o.detalhe, o.capacidade].filter(Boolean).join(" · "),
          description: [o.frase, o.extra].filter(Boolean).join(" "),
          alt: o.alt,
        }))}
        defaultIndex={0}
        trigger="hover"
        grayscale={false}
        height={550}
        gap={8}
        radius={4}
        expandRatio={0.48}
        tilt={1.2}
        parallax={0.24}
        accentColor="#7a2b2b"
        overlayColor="#1a1815"
        textColor="#f3e9d8"
      />

    </div>
  );
}

