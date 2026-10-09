#!/usr/bin/env python3
"""Cores reais das fotos: substitui as cores_dominantes do fotos-descricao.json.

Uso:
    python cores-fotos.py casas/<slug> [--json <outro fotos-descricao.json>]

O descritor escreve cores de cabeça (#87CEEB para qualquer céu). Aqui
tiram-se das próprias fotos: cada foto utilizável do contrato
(dossie/marketing/fotos/...) é reduzida e quantizada em 5 cores por k-means
(Pillow), e as cores ficam pela ordem da área que ocupam. Grava por cima do
campo `cores_dominantes` de cada foto descrita; o resto da descrição fica
igual. Corre depois do descritor de fotos.

--json: escreve noutro ficheiro (para testar numa cópia); as fotos e o
contrato continuam a ser os da casa.
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

CORES = 5
LADO = 160  # a foto é reduzida antes de quantizar: as cores dominantes não mudam


def cores_de(caminho):
    with Image.open(caminho) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((LADO, LADO))
    q = img.quantize(colors=CORES, method=Image.Quantize.MEDIANCUT, kmeans=8)
    paleta = q.getpalette()
    contagens = sorted(q.getcolors(), reverse=True)  # [(n, índice)], mais presente primeiro
    hexes = []
    for _, i in contagens:
        r, g, b = paleta[i * 3 : i * 3 + 3]
        h = f"#{r:02X}{g:02X}{b:02X}"
        if h not in hexes:
            hexes.append(h)
    return hexes[:CORES]


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    casa = Path(args[0])
    dossie = casa / "dossie"
    destino = Path(args[args.index("--json") + 1]) if "--json" in args else dossie / "fotos-descricao.json"
    if not destino.exists():
        print(f"Falta {destino}: corre primeiro o descritor de fotos.", file=sys.stderr)
        sys.exit(1)

    contrato_path = dossie / "contrato.json"
    utilizaveis = None
    if contrato_path.exists():
        contrato = json.loads(contrato_path.read_text(encoding="utf-8"))
        utilizaveis = {a["id"]: a.get("caminho") for a in contrato.get("ativos", []) if a.get("uso") == "utilizavel"}

    dados = json.loads(destino.read_text(encoding="utf-8"))
    fotos = dados.get("fotos", dados) if isinstance(dados, dict) else dados
    feitas, saltadas = 0, []
    for foto in fotos:
        if utilizaveis is not None and foto.get("id") not in utilizaveis:
            saltadas.append(f"{foto.get('id')} (não é utilizável no contrato)")
            continue
        caminho = foto.get("caminho") or (utilizaveis or {}).get(foto.get("id"))
        ficheiro = dossie / caminho if caminho else None
        if not ficheiro or not ficheiro.exists():
            saltadas.append(f"{foto.get('id')} (sem ficheiro: {caminho})")
            continue
        foto["cores_dominantes"] = cores_de(ficheiro)
        feitas += 1

    destino.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{feitas} fotos com cores reais em {destino}.")
    for s in saltadas:
        print(f"AVISO  saltada: {s}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
