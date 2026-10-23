import { srcSetDe } from "@/lib/tamanhos";

/**
 * O mesmo que <Image fill unoptimized> (mesmo estilo, lazy, decoding async), mas
 * com srcset: o browser escolhe a versão que chega à caixa (lib/tamanhos.ts).
 * O sizes tem de dizer a largura real da foto na caixa, já com o object-cover.
 */
export function FotoTamanhos({ src, alt, sizes, className }: { src: string; alt: string; sizes: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      loading="lazy"
      decoding="async"
      sizes={sizes}
      srcSet={srcSetDe(src)}
      src={src}
      alt={alt}
      className={className}
      style={{ position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent" }}
    />
  );
}
