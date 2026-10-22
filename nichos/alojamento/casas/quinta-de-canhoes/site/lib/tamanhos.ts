/**
 * Versões mais pequenas das fotos das páginas interiores, geradas por
 * scripts/tamanhos.mjs com a mesma qualidade JPEG do original (as listas de
 * larguras têm de bater com as de lá). O original entra sempre no srcset, para
 * os ecrãs que precisam dele.
 */
const versoes: Record<string, [nome: string, larguras: number[], original: number]> = {
  "/fotos/dia-alpendre.jpg": ["alpendre", [640, 800], 1200],
  "/fotos/tanque.jpg": ["tanque", [480, 640, 800], 1024],
  "/fotos/canhoesacasa3.jpg": ["casa3", [640, 800], 1264],
  "/fotos/canhoesacasa2.jpg": ["casa2", [480, 640], 896],
  "/fotos/mesas-patio.jpg": ["mesas-patio", [480, 640, 800], 1024],
  "/fotos/terraco-piscina.jpg": ["terraco-piscina", [640, 800], 1024],
  "/fotos/quartos/quarto duplo/quarto duplo 2.jpg": ["qto-duplo-2", [640, 880], 1024],
  "/fotos/quartos/quarto duplo/quarto duplo.jpg": ["qto-duplo", [640, 880], 1024],
  "/fotos/quartos/quarto duplo/wc-duplo-filt.jpg": ["wc-duplo", [640, 880, 1280, 1920], 3072],
  "/fotos/quartos/quarto-twin.jpg": ["qto-twin", [640, 880], 1024],
  "/fotos/quartos/quarto twinn/wc-twin-filt.jpg": ["wc-twin", [800, 1280], 2048],
  "/fotos/quartos/suite/quarto suite.jpg": ["qto-suite", [640, 880], 1024],
  "/fotos/suite-quarto.jpg": ["suite-quarto", [640, 880], 1024],
  "/fotos/suite-wc.jpg": ["suite-wc", [640, 880], 1024],
  "/fotos/quartos/suite/c19df66a-6b61-4e23-876f-29ca61d00c06.jpg": ["suite-c19", [640, 880], 1024],
};

export function srcSetDe(src: string): string | undefined {
  const v = versoes[src];
  if (!v) return undefined;
  const [nome, larguras, original] = v;
  return [...larguras.map((w) => `/fotos/tamanhos/${nome}-${w}.jpg ${w}w`), `${encodeURI(src)} ${original}w`].join(", ");
}
