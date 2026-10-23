"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export function FundoParallax({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Ao fazer scroll de 0 até 1200px (aproximadamente a secção seguinte)
  // Fazemos um ligeiro zoom (1 para 1.15) e movemos a imagem um pouco para baixo
  // para dar a sensação de paralaxe suave
  const scale = useTransform(scrollY, [0, 1200], [1, 1.12]);
  const y = useTransform(scrollY, [0, 1200], [0, 150]);

  return (
    <div ref={containerRef} className="sticky top-0 h-screen w-full overflow-hidden z-0">
      <motion.div style={{ scale, y }} className="absolute inset-0 will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          quality={100}
          unoptimized
          className="object-cover opacity-70 origin-bottom"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-xisto/90 via-xisto/20 to-transparent" />
    </div>
  );
}
