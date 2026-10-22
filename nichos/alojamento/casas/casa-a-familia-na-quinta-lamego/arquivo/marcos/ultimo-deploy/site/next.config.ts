import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    // So WebP. O AVIF ficava pendurado para sempre em certas larguras (a foto
    // da historia a 750px nunca chegava ao telemovel): bug do codificador.
    formats: ['image/webp'],
    // O Next 16 so aceita as qualidades desta lista. Um `quality={90}`
    // fora dela cai para 75 sem aviso, e o hero perde nitidez.
    qualities: [75, 85, 86, 88, 90],
    // 31 dias de cache para as fotos otimizadas (por defeito são 4 h).
    // Vem da rapidez da Fataunços e da Porta Caseira.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    optimizePackageImports: ['motion', '@phosphor-icons/react'],
  },
};

export default config;
