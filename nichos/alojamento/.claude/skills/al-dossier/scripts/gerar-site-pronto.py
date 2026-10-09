"""Gera a vista legível do contrato do dossiê.

Uso:
    python gerar-site-pronto.py <pasta do dossiê>

O ficheiro gerado é ``site-pronto.md``. O script só o substitui se o dossiê
completo passar pelo validador; em caso de erro restaura a vista anterior.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


RAIZ_SKILL = Path(__file__).resolve().parents[1]
VALIDADOR = RAIZ_SKILL / "scripts" / "validar-dossie.py"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def texto(valor: object) -> str:
    return str(valor).replace("|", "\\|").replace("\n", " ").strip()


def tabela(linhas: list[list[str]], cabecalho: list[str]) -> list[str]:
    if not linhas:
        return ["_Nenhum registo._", ""]
    saida = ["| " + " | ".join(cabecalho) + " |", "|" + "|".join("---" for _ in cabecalho) + "|"]
    saida.extend("| " + " | ".join(linha) + " |" for linha in linhas)
    saida.append("")
    return saida


def renderizar(contrato: dict) -> str:
    manifesto = contrato["manifesto"]
    grupos = {
        "afirmar": ("Pode afirmar como facto", "Afirmações confirmadas que o site pode fazer pela sua própria voz."),
        "afirmar_com_condicao": ("Pode afirmar com condição", "O texto tem de preservar a condição e o âmbito indicados."),
        "citar": ("Só citando", "Conservar aspas, autor e plataforma; não converter em voz da casa."),
        "inspiracao_editorial": ("Só para inspiração editorial", "Pode orientar tom ou composição, mas não fundamenta promessas factuais."),
        "nao_usar": ("Não usar", "Não afirmar, sugerir nem preencher esta lacuna com conteúdo do molde."),
    }
    linhas = [
        f"# O que o site pode dizer: {manifesto['slug']}",
        "",
        "_Vista gerada de `contrato.json`; não editar manualmente._",
        "",
        "## Estado da revisão",
        "",
        f"- Revisão: {manifesto['revisao']}",
        f"- Prontidão: `{manifesto['prontidao']}`",
    ]
    if manifesto.get("notas"):
        linhas.append(f"- Notas: {texto(manifesto['notas'])}")
    linhas.append("")
    for uso, (titulo, explicacao) in grupos.items():
        linhas.extend([f"## {titulo}", "", explicacao, ""])
        registos = [afirmacao for afirmacao in contrato["afirmacoes"] if afirmacao["uso"] == uso]
        tabela_linhas = []
        for afirmacao in registos:
            ambito = json.dumps(afirmacao.get("ambito", {}), ensure_ascii=False, sort_keys=True) if afirmacao.get("ambito") else "—"
            condicao = afirmacao.get("condicao", "—")
            tabela_linhas.append([
                f"`{texto(afirmacao['id'])}` {texto(afirmacao['texto'])}",
                texto(ambito),
                texto(condicao),
                ", ".join(f"`{texto(evidencia)}`" for evidencia in afirmacao["evidencia_ids"]),
            ])
        linhas.extend(tabela(tabela_linhas, ["Afirmação", "Âmbito", "Condição", "Provas"]))

    linhas.extend(["## Citações selecionadas", ""])
    citacoes = [[
        f"`{texto(citacao['id'])}` “{texto(citacao['texto_original'])}”",
        texto(citacao["autor"]), texto(citacao["plataforma"]), f"`{texto(citacao['review_id'])}`",
    ] for citacao in contrato["citacoes"]]
    linhas.extend(tabela(citacoes, ["Excerto literal", "Autor", "Plataforma", "Review"]))

    linhas.extend(["## Cobertura e limitações", ""])
    cobertura = [[
        f"`{texto(item['id'])}` {texto(item['material'])}", texto(item['fonte']), texto(item['estado']), texto(item.get('limitacao', '—')),
    ] for item in contrato["cobertura"]]
    linhas.extend(tabela(cobertura, ["Material", "Fonte", "Estado", "Limitação"]))
    return "\n".join(linhas).rstrip() + "\n"


def main(pasta: Path) -> int:
    contrato_path = pasta / "contrato.json"
    destino = pasta / "site-pronto.md"
    if not pasta.is_dir():
        print(f"ERRO   a pasta do dossiê não existe: {pasta}")
        return 2
    try:
        contrato = json.loads(contrato_path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print("ERRO   falta contrato.json; não é possível gerar site-pronto.md")
        return 2
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        print(f"ERRO   contrato.json inválido: {exc}")
        return 2
    try:
        gerado = renderizar(contrato)
    except (KeyError, TypeError) as exc:
        print(f"ERRO   contrato.json incompleto: {exc}")
        return 2

    anterior = destino.read_bytes() if destino.exists() else None
    destino.write_text(gerado, encoding="utf-8")
    resultado = subprocess.run(
        [sys.executable, str(VALIDADOR), str(pasta)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if resultado.returncode == 0:
        print(f"Gerado: {destino}")
        return 0
    if anterior is None:
        destino.unlink(missing_ok=True)
    else:
        destino.write_bytes(anterior)
    print("ERRO   o dossiê não passou a validação; site-pronto.md anterior foi restaurado")
    print(resultado.stdout, end="")
    return resultado.returncode


if __name__ == "__main__":
    argumentos = argparse.ArgumentParser(description="Gera site-pronto.md a partir de contrato.json.")
    argumentos.add_argument("pasta", type=Path, help="pasta do dossiê")
    opcoes = argumentos.parse_args()
    sys.exit(main(opcoes.pasta))
