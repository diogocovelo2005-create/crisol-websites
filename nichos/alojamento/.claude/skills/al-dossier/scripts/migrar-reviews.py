"""Normaliza IDs estáveis de reviews num dossiê legado.

Uso:
    python migrar-reviews.py <pasta-do-dossie> [--aplicar]

Reconhece secções Booking, Google, TripAdvisor e Airbnb. Sem ``--aplicar``
apenas mostra a alteração prevista. Com ``--aplicar``, acrescenta o prefixo
ao título de cada review que ainda não tenha ID e grava ``reviews-index.json``
com uma impressão digital do bloco original. É idempotente: uma segunda
execução não renumera nem altera IDs existentes.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


SECCAO = re.compile(r"^##\s+(.+?)\s*$", re.M)
REVIEW = re.compile(r"^###\s+(?![A-Z]-\d{2,4}\b)(.+?)\s*$", re.M)
COM_ID = re.compile(r"^###\s+([A-Z]-\d{2,4})\s*[·—-]\s*(.+?)\s*$", re.M)


def prefixo(titulo: str) -> str | None:
    normalizado = titulo.casefold()
    if "booking" in normalizado:
        return "B"
    if "google" in normalizado:
        return "G"
    if "tripadvisor" in normalizado:
        return "T"
    if "airbnb" in normalizado:
        return "A"
    return None


def secao_em(texto: str, posicao: int) -> str:
    anteriores = [item for item in SECCAO.finditer(texto) if item.start() < posicao]
    return anteriores[-1].group(1) if anteriores else ""


def proximo_numero(texto: str, prefixo_id: str) -> int:
    usados = [int(numero) for atual, numero in re.findall(r"\b([A-Z])-([0-9]{2,4})\b", texto) if atual == prefixo_id]
    return max(usados, default=0) + 1


def plano(texto: str) -> list[tuple[int, int, str, str, str]]:
    proximo: dict[str, int] = {}
    alteracoes = []
    for match in REVIEW.finditer(texto):
        secao = secao_em(texto, match.start())
        atual = prefixo(secao)
        if not atual:
            continue
        if atual not in proximo:
            proximo[atual] = proximo_numero(texto, atual)
        identificador = f"{atual}-{proximo[atual]:03d}"
        proximo[atual] += 1
        alteracoes.append((match.start(1), match.end(1), identificador, match.group(1), secao))
    return alteracoes


def indexar(texto: str) -> list[dict[str, str]]:
    encontrados = list(COM_ID.finditer(texto))
    resultado = []
    for indice, match in enumerate(encontrados):
        fim = encontrados[indice + 1].start() if indice + 1 < len(encontrados) else len(texto)
        bloco = texto[match.start():fim].strip()
        resultado.append({
            "id": match.group(1),
            "titulo_original": match.group(2),
            "impressao_digital": hashlib.sha256(bloco.encode("utf-8")).hexdigest(),
        })
    return resultado


def main(pasta: Path, aplicar: bool) -> int:
    caminho = pasta / "reviews.md"
    if not caminho.is_file():
        print(f"ERRO: falta {caminho}")
        return 2
    texto = caminho.read_text(encoding="utf-8")
    alteracoes = plano(texto)
    print(f"{len(alteracoes)} títulos sem ID encontrados em {caminho}")
    if not aplicar:
        for _, _, identificador, titulo, secao in alteracoes[:10]:
            print(f"  {identificador} · {titulo} ({secao})")
        return 0
    for inicio, fim, identificador, titulo, _ in reversed(alteracoes):
        texto = texto[:inicio] + f"{identificador} · {titulo}" + texto[fim:]
    caminho.write_text(texto, encoding="utf-8")
    indice = {"versao": 1, "reviews": indexar(texto)}
    (pasta / "reviews-index.json").write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Aplicados {len(alteracoes)} IDs; índice com {len(indice['reviews'])} reviews.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pasta", type=Path)
    parser.add_argument("--aplicar", action="store_true")
    args = parser.parse_args()
    raise SystemExit(main(args.pasta, args.aplicar))
