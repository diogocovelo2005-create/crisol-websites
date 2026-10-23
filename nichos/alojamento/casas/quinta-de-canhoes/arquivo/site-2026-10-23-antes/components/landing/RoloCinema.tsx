"use client";

import { useRef } from "react";
import { useAnimationFrame } from "motion/react";
import Image from "next/image";

const FOTOS = [
  { src: "/fotos/historia-rua.jpg", alt: "Fachada e portão" },
  { src: "/fotos/historia-jardim.webp", alt: "Jardim da quinta" },
];

export function RoloCinema() {
  const containerRef = useRef<HTMLDivElement>(null);
  const facesRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // 12 faces transforma o "hexágono" num círculo suave perfeito
  const numFaces = 12;
  const faceWidth = 140; 
  // Cálculo exato do raio para que as faces se toquem perfeitamente nas arestas (formando fita contínua)
  const radius = Math.round((faceWidth / 2) / Math.tan(Math.PI / numFaces));

  // Criamos o array de faces, alternando as duas fotos que nos deste
  const faces = Array.from({ length: numFaces }).map((_, i) => FOTOS[i % 2]);

  useAnimationFrame((t) => {
    // Rotação global do cilindro (velocidade)
    const globalRot = (t * 0.015) % 360;
    
    if (containerRef.current) {
      // Aplicar a rotação ao cilindro inteiro, mantendo a inclinação (entortar a fita)
      containerRef.current.style.transform = `rotateX(-14deg) rotateZ(8deg) rotateY(${globalRot}deg)`;
    }

    // Calcular o blur e opacidade de CADA foto individualmente com base na sua posição 3D
    facesRef.current.forEach((face, i) => {
      if (!face) return;
      
      const baseAngle = i * (360 / numFaces);
      // O ângulo real da face neste exato milissegundo
      let currentWorldAngle = (baseAngle + globalRot) % 360;
      
      // Normalizar para sabermos a distância até à frente (0 graus) ou costas (180 graus)
      if (currentWorldAngle > 180) currentWorldAngle = 360 - currentWorldAngle;
      
      // Se estiver na metade de trás (> 90 graus), aplicamos blur e escurecemos
      const distanceToBack = Math.max(0, currentWorldAngle - 90) / 90; // 0 na frente, 1 lá muito atrás
      
      const blur = distanceToBack * 6; // máx de 6px de blur nas fotos de trás
      const opacity = 1 - (distanceToBack * 0.6); // caem para 40% de opacidade atrás
      const brightness = 1 - (distanceToBack * 0.5); // ficam mais escuras

      face.style.filter = `blur(${blur}px) brightness(${brightness})`;
      face.style.opacity = opacity.toString();
    });
  });

  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center [perspective:900px] overflow-hidden md:overflow-visible">
      
      {/* O Cilindro em 3D (Rolo) */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center [transform-style:preserve-3d] will-change-transform"
        style={{
          width: faceWidth,
          height: 240, // Altura da fita
        }}
      >
        {faces.map((foto, i) => {
          const angle = (360 / numFaces) * i;
          return (
            <div
              key={i}
              ref={(el) => { facesRef.current[i] = el; }}
              className="absolute top-0 left-0 w-full h-full bg-[#151515] p-[20px_0px] [transform-style:preserve-3d] will-change-[filter,opacity]"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                // Arestas exatas, removemos bordas laterais para parecer uma fita única
                borderLeft: "1px solid rgba(0,0,0,0.5)",
                borderRight: "1px solid rgba(0,0,0,0.5)",
              }}
            >
              {/* Perfurações da fita (topo) - furos da cor do fundo #d5d2be para dar realismo */}
              <div 
                className="absolute top-[5px] left-0 right-0 h-[10px] opacity-80"
                style={{
                  backgroundImage: "linear-gradient(to right, transparent 3px, #d5d2be 3px, #d5d2be 9px, transparent 9px)",
                  backgroundSize: "12px 10px",
                }}
              />
              
              {/* A Fotografia */}
              <div className="relative w-full h-full overflow-hidden bg-black mx-auto" style={{ width: "calc(100% - 10px)" }}>
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="160px"
                  className="object-cover sepia-[0.3] contrast-[1.15]"
                />
              </div>

              {/* Perfurações da fita (fundo) */}
              <div 
                className="absolute bottom-[5px] left-0 right-0 h-[10px] opacity-80"
                style={{
                  backgroundImage: "linear-gradient(to right, transparent 3px, #d5d2be 3px, #d5d2be 9px, transparent 9px)",
                  backgroundSize: "12px 10px",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
