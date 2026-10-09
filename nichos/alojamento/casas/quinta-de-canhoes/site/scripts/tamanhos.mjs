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
  "wc-duplo": ["public/fotos/quartos/quarto duplo/wc-duplo-filt.jpg", 95, [1280, 1920]],
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
