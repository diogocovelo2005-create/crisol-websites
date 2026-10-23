/**
 * Gera versões mais pequenas das fotos que são muito maiores do que aparecem,
 * para o browser escolher a que chega ao ecrã (srcset). Cada versão leva a
 * mesma qualidade JPEG do original (lida das tabelas de quantização: tudo a 1
 * é 100; 2,1,1,2 é 95): só muda o número de píxeis, e o original continua a ser
 * servido aos ecrãs que precisam dele.
 *
 * Correr a partir da raiz do projeto:  node scripts/tamanhos.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/fotos/tamanhos");

/** nome de saída -> [original, qualidade do original, larguras a gerar] */
const fotos = {
  imagemacasa: ["public/fotos/imagemacasa.jpg", 100, [1280, 1920]],
  "wc-duplo": ["public/fotos/quartos/quarto duplo/wc-duplo-filt.jpg", 95, [640, 880, 1280, 1920]],
  // Páginas interiores (2026-10-22): só as larguras que algum ecrã pede abaixo do
  // original (ver lib/tamanhos.ts, que tem as mesmas listas e o sizes de cada caixa).
  alpendre: ["public/fotos/dia-alpendre.jpg", 100, [640, 800]],
  tanque: ["public/fotos/tanque.jpg", 100, [480, 640, 800]],
  casa3: ["public/fotos/canhoesacasa3.jpg", 100, [640, 800]],
  casa2: ["public/fotos/canhoesacasa2.jpg", 100, [480, 640]],
  "mesas-patio": ["public/fotos/mesas-patio.jpg", 100, [480, 640, 800]],
  "terraco-piscina": ["public/fotos/terraco-piscina.jpg", 100, [640, 800]],
  "qto-duplo-2": ["public/fotos/quartos/quarto duplo/quarto duplo 2.jpg", 100, [640, 880]],
  "qto-duplo": ["public/fotos/quartos/quarto duplo/quarto duplo.jpg", 100, [640, 880]],
  "qto-twin": ["public/fotos/quartos/quarto-twin.jpg", 100, [640, 880]],
  "wc-twin": ["public/fotos/quartos/quarto twinn/wc-twin-filt.jpg", 95, [800, 1280]],
  "qto-suite": ["public/fotos/quartos/suite/quarto suite.jpg", 100, [640, 880]],
  "suite-quarto": ["public/fotos/suite-quarto.jpg", 100, [640, 880]],
  "suite-wc": ["public/fotos/suite-wc.jpg", 100, [640, 880]],
  "suite-c19": ["public/fotos/quartos/suite/c19df66a-6b61-4e23-876f-29ca61d00c06.jpg", 100, [640, 880]],
  // Página inicial: cartões das estadias (carrossel/acordeão) e da volta (pilha).
  // Os originais da volta são ~q87–90; as versões vão a 92 para não somar perda.
  piscina: ["public/fotos/piscina canhoes.jpg", 100, [1024, 1280, 1440, 1920]],
  "quarto-duplo": ["public/fotos/quarto duplo melhorado.jpg", 100, [1024, 1280, 1440, 1920]],
  "quarto-twin": ["public/fotos/quarto twin 2.jpg", 100, [1024, 1280, 1440, 1920]],
  suite: ["public/fotos/suite 2.jpg", 100, [1024, 1280, 1440, 1920]],
  "aldeia-pena": ["public/fotos/aldeia_pena-corrigida.jpg", 92, [640, 960, 1280, 1920]],
  "serra-arada": ["public/fotos/regiao-serra-arada-wikimedia.jpg", 92, [640, 960, 1280]],
  vouga: ["public/fotos/regiao-vouga-wikimedia.jpg", 92, [640, 960, 1280]],
  termas: ["public/fotos/regiao-termas-wikimedia.jpg", 92, [640, 960]],
  nogueiras: ["public/fotos/regiao-nogueiras-wikimedia.jpg", 92, [640, 960, 1280]],
};

await mkdir(OUT, { recursive: true });
for (const [nome, [origem, qualidade, larguras]] of Object.entries(fotos)) {
  for (const w of larguras) {
    const destino = path.join(OUT, `${nome}-${w}.jpg`);
    await sharp(origem)
      .resize({ width: w, kernel: "lanczos3" })
      .jpeg({ quality: qualidade, chromaSubsampling: "4:2:0" })
      .toFile(destino);
    console.log(destino);
  }
}
