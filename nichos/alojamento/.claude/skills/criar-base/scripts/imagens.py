#!/usr/bin/env python3
"""Operação de imagem do melhorar-fotos.mjs.

  python imagens.py final <origem> <pasta-destino> <nome>
      Grava <nome>.jpg com até 2400 px de largura. O next/image faz as
      variantes a partir dele. Imprime JSON com a largura e a altura.
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

LARGURA_MAXIMA = 2400


def final(origem, destino, nome):
    with Image.open(origem) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((LARGURA_MAXIMA, LARGURA_MAXIMA * 4))
    pasta = Path(destino)
    pasta.mkdir(parents=True, exist_ok=True)
    img.save(pasta / f"{nome}.jpg", quality=88, optimize=True, progressive=True)
    print(json.dumps({"jpg": f"{nome}.jpg", "largura": img.width, "altura": img.height}))


def main():
    a = sys.argv[1:]
    if len(a) == 4 and a[0] == "final":
        final(a[1], a[2], a[3])
    else:
        print(__doc__, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
