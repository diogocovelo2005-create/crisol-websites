import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // O nodemailer fica fora do bundle e corre como pacote Node normal (funções do Netlify).
  serverExternalPackages: ["nodemailer"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Sem isto o Next ignora o quality das imagens e serve tudo a 75.
    qualities: [75, 92, 96, 100],
    // Larguras geradas. As grandes existem para ecrãs de alta densidade.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560, 3200],
  },
};

export default nextConfig;
