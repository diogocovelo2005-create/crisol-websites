/**
 * Converte as fotografias, dá-lhes nomes semânticos e escreve lib/fotos.ts
 * com dimensões e placeholder de desfoque.
 *
 * Correr a partir da raiz do projeto:  node scripts/fotos.mjs
 */
import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CASA = path.resolve("../pesquisa/fotos");
const REGIAO = path.resolve("../pesquisa/regiao");
const OUT = path.resolve("public/fotos");

/** [pasta, ficheiro] -> nome pela função que a fotografia tem na narrativa. */
const mapa = {
  hero: [CASA, "hero.png"],
  "hero-telemovel": [CASA, "hero telemovel.jpg"],

  "casa-fachada": [CASA, "21531741.jpg"],
  "casa-chegada": [CASA, "126945529.jpg"],
  historia: [CASA, "historia.webp"],

  interior: [CASA, "interior.jpg"],
  "dia-pequeno-almoco": [CASA, "200282537.jpg"],
  "dia-piscina": [CASA, "Polaroid.jpg"],
  "dia-piscina-larga": [CASA, "1-1024x576.jpeg"],
  "dia-alpendre": [CASA, "21531751.jpg"],
  "dia-mesa": [CASA, "126944821.jpg"],

  // Fotografias da própria casa, tiradas da ficha do Booking, que é onde
  // estão as dos quartos reais. As que tínhamos mostravam o mesmo quarto
  // de casal nos três tipos.
  "quarto-twin": [CASA, "quarto-twin.jpg"],
  suite: [CASA, "suite.jpg"],

  "quarto-azul": [CASA, "quarto.jpg"],
  "quarto-suculentas": [CASA, "quarto2.jpg"],
  "quarto-varanda": [CASA, "196113377.jpg"],
  "capa-quartos": [CASA, "interior3.jpg"],

  "volta-janela": [CASA, "126945002.jpg"],
  "volta-janela-cortina": [CASA, "126944892.jpg"],
  "detalhe-azaleas": [CASA, "126945036.jpg"],
  "detalhe-amores-perfeitos": [CASA, "21531730.jpg"],
  "detalhe-patio": [CASA, "380247522.jpg"],
  "detalhe-alto": [CASA, "21531771.jpg"],

  "regiao-termas": [REGIAO, "termas.jpg"],
  "regiao-vouga": [REGIAO, "vouga.jpg"],
  "regiao-serra": [REGIAO, "serra.jpg"],
  "regiao-viseu": [REGIAO, "viseu.jpg"],
};

await mkdir(OUT, { recursive: true });
const meta = {};

for (const [nome, [pasta, ficheiro]] of Object.entries(mapa)) {
  const src = path.join(pasta, ficheiro);
  const { width } = await sharp(src, { failOn: "none" }).metadata();

  // O hero de telemóvel é copiado tal e qual, sem passar pelo sharp: já
  // vem em JPEG e qualquer recodificação nossa só lhe tirava qualidade.
  if (nome === "hero-telemovel") {
    const destino = path.join(OUT, `${nome}.jpg`);
    await copyFile(src, destino);
    const info = await sharp(destino).metadata();
    const desfoque = await sharp(src).resize({ width: 16 }).jpeg({ quality: 40 }).toBuffer();
    meta[nome] = {
      src: `/fotos/${nome}.jpg`,
      width: info.width,
      height: info.height,
      blurDataURL: `data:image/jpeg;base64,${desfoque.toString("base64")}`,
    };
    console.log(`${ficheiro.padEnd(30)} -> ${nome}.jpg  ${info.width}x${info.height}  (copiado sem recodificar)`);
    continue;
  }

  // O hero fica sem perdas. É a única que ocupa o ecrã inteiro, e qualquer
  // recompressão nossa antes do next/image tira-lhe saturação e detalhe.
  const semPerdas = nome === "hero";
  const ext = semPerdas ? "png" : "jpg";
  const destino = path.join(OUT, `${nome}.${ext}`);

  // O hero é a única que ocupa o ecrã inteiro. O ficheiro de origem tem
  // 1536 px, menos de metade do que um ecrã de alta densidade pede, e o
  // next/image não amplia. Ampliamos aqui com lanczos3 e uma máscara de
  // nitidez: não inventa detalhe, mas evita a ampliação ingénua do browser
  // e deixa o next servir variantes de 2560 px.
  const base = semPerdas
    ? sharp(src, { failOn: "none" })
        .rotate()
        .resize({ width: width * 2, kernel: "lanczos3" })
        .sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 })
    : sharp(src, { failOn: "none" })
        .rotate()
        .resize({ width: Math.min(width, 1920), withoutEnlargement: true });

  await (semPerdas
    ? base.png({ compressionLevel: 9 })
    : base.jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
  ).toFile(destino);

  const info = await sharp(destino).metadata();
  const desfoque = await sharp(src, { failOn: "none" })
    .rotate()
    .resize({ width: 16 })
    .jpeg({ quality: 40 })
    .toBuffer();

  meta[nome] = {
    src: `/fotos/${nome}.${ext}`,
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/jpeg;base64,${desfoque.toString("base64")}`,
  };
  console.log(`${ficheiro.padEnd(30)} -> ${nome}.${ext}  ${info.width}x${info.height}`);
}

await writeFile(
  "lib/fotos.ts",
  "// Gerado por scripts/fotos.mjs. Não editar à mão.\n" +
    "export type Foto = { src: string; width: number; height: number; blurDataURL: string };\n" +
    "export const fotos = " +
    JSON.stringify(meta, null, 2) +
    " as const satisfies Record<string, Foto>;\n" +
    "export type NomeFoto = keyof typeof fotos;\n",
);

console.log(`\nlib/fotos.ts escrito com ${Object.keys(meta).length} fotografias.`);
