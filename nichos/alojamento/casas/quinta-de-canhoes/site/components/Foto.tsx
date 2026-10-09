import Image from "next/image";
import { fotos, type NomeFoto } from "@/lib/fotos";

type Props = {
  nome: NomeFoto;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Recorta a imagem para preencher o contentor, que tem de ser posicionado. */
  preencher?: boolean;
  /** Sobe a qualidade. Só vale a pena no hero, que ocupa o ecrã todo. */
  qualidade?: number;
};

export function Foto({
  nome,
  alt,
  className,
  sizes = "100vw",
  priority,
  preencher,
  qualidade,
}: Props) {
  const f = fotos[nome];

  const comuns = {
    src: f.src,
    alt,
    sizes,
    priority,
    quality: qualidade,
    placeholder: "blur" as const,
    blurDataURL: f.blurDataURL,
    className,
  };

  if (preencher) return <Image {...comuns} fill />;

  return <Image {...comuns} width={f.width} height={f.height} />;
}
