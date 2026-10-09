"""Validação mecânica de um dossiê da skill al-dossier.

Uso:
    python validar-dossie.py <pasta do dossie>

Sem ``contrato.json``, valida o formato legado com regras estritas para que
ficheiros vazios, citações sem origem, IDs duplicados e índices de imagens
incompletos não passem como dossiê terminado.

Com ``contrato.json``, valida também o schema v1, as referências internas e as
regras de uso. O script não certifica que uma página externa diz a verdade nem
substitui a revisão semântica final.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    Draft202012Validator = None
    FormatChecker = None

sys.stdout.reconfigure(encoding="utf-8")

RAIZ_SKILL = Path(__file__).resolve().parents[1]
SCHEMA = RAIZ_SKILL / "schemas" / "contrato.schema.json"
VERSAO_VALIDACAO = "1.0.0"
OBRIGATORIOS = [
    "resumo.md", "pontos-fortes.md", "site-pronto.md", "descricao-al.md",
    "reviews.md", "factos.md", "quartos.md", "dono.md", "canais.md",
    "compliance.md", "fontes.md",
]
CITAM_REVIEWS = ["pontos-fortes.md", "site-pronto.md", "resumo.md", "quartos.md", "factos.md"]
ID_REVIEW = re.compile(r"\b([A-Z]-\d{2,4})\b")
TITULO_REVIEW = re.compile(r"^###\s+([A-Z]-\d{2,4})\b(.*)$", re.M)
IMAGEM = re.compile(r"\.(jpe?g|png|webp|gif|avif|ico)$", re.I)
RESOLUCAO = re.compile(r"(\d{2,5})\s*[×x]\s*(\d{2,5})")
TRUNCADO = re.compile(r"\b(Continuar a ler|Ler mais|Mostrar mais|Read more|Show more|Lire la suite|Leer más)\b", re.I)
CITACAO_COM_ID = re.compile(
    r"^\s*\[OPINIAO\]\s+[\"“]([^\n\"”]+)[\"”].{0,220}?\b([A-Z]-\d{2,4})\b",
    re.M,
)
MARCADOR_CORTE = re.compile(r"\[(?:…|\.\.\.)\]|…")


class Resultado:
    def __init__(self) -> None:
        self.erros: list[str] = []
        self.avisos: list[str] = []

    def erro(self, texto: str) -> None:
        self.erros.append(texto)

    def aviso(self, texto: str) -> None:
        self.avisos.append(texto)

    def como_json(self, pasta: Path) -> dict:
        return {
            "versao_validador": VERSAO_VALIDACAO,
            "dossie": pasta.name,
            "resultado": "aprovado" if not self.erros else "reprovado",
            "erros": self.erros,
            "avisos": self.avisos,
            "verificacoes": [
                "ficheiros_obrigatorios", "reviews_e_citacoes", "quartos",
                "pontos_fortes", "fotos", "contrato" if (pasta / "contrato.json").exists() else "legado",
            ],
            "impressao_digital": impressao_digital(pasta),
        }


def ler(caminho: Path) -> str:
    try:
        return caminho.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return ""


def impressao_digital(pasta: Path) -> dict:
    """Resume o material validado, sem incluir relatórios anteriores.

    Também fica de fora fotos-descricao.json: é escrito pela criar-base depois
    da aprovação e não altera o que foi validado.
    """
    ficheiros = []
    for caminho in sorted(pasta.rglob("*")):
        if not caminho.is_file() or caminho.name in {"validacao.json", "fotos-descricao.json"}:
            continue
        relativo = caminho.relative_to(pasta).as_posix()
        try:
            dados = caminho.read_bytes()
        except OSError:
            continue
        ficheiros.append({
            "caminho": relativo,
            "bytes": len(dados),
            "sha256": hashlib.sha256(dados).hexdigest(),
        })
    total = hashlib.sha256(json.dumps(ficheiros, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()
    return {"sha256": total, "ficheiros": ficheiros}


def normalizar(texto: str) -> str:
    texto = unicodedata.normalize("NFKC", texto)
    return re.sub(r"\s+", " ", texto).strip()


def corresponde_excerto(citacao: str, original: str) -> bool:
    """Aceita literal ou cortes explícitos, desde que os segmentos conservem ordem."""
    citacao_normalizada = normalizar(citacao)
    original_normalizado = normalizar(original)
    if not MARCADOR_CORTE.search(citacao_normalizada):
        return citacao_normalizada in original_normalizado
    posicao = 0
    encontrou_segmento = False
    for segmento in MARCADOR_CORTE.split(citacao_normalizada):
        segmento = normalizar(segmento)
        if not segmento:
            continue
        encontrou_segmento = True
        indice = original_normalizado.find(segmento, posicao)
        if indice < 0:
            return False
        posicao = indice + len(segmento)
    return encontrou_segmento


def tabelas(texto: str):
    """Devolve tabelas Markdown como (cabeçalho, linhas)."""
    blocos, atual = [], []
    for linha in texto.splitlines() + [""]:
        if linha.strip().startswith("|"):
            atual.append([celula.strip() for celula in linha.strip().strip("|").split("|")])
        else:
            if len(atual) >= 2 and set("".join(atual[1])) <= set("-: "):
                blocos.append((atual[0], atual[2:]))
            atual = []
    return blocos


def coluna(cabecalho, nome):
    for indice, valor in enumerate(cabecalho):
        if nome.lower() in valor.lower():
            return indice
    return None


def blocos_reviews(texto: str):
    matches = list(TITULO_REVIEW.finditer(texto))
    resultado = []
    for indice, match in enumerate(matches):
        fim = matches[indice + 1].start() if indice + 1 < len(matches) else len(texto)
        resultado.append((match.group(1), match.group(2), texto[match.start():fim]))
    return resultado


def exigir_conteudo(pasta: Path, resultado: Resultado) -> None:
    for ficheiro in OBRIGATORIOS:
        caminho = pasta / ficheiro
        if not caminho.exists():
            resultado.erro(f"falta o ficheiro {ficheiro}")
        elif len(normalizar(ler(caminho))) < 12:
            resultado.erro(f"{ficheiro}: ficheiro vazio ou sem conteúdo útil")


def validar_reviews_legado(pasta: Path, resultado: Resultado):
    texto = ler(pasta / "reviews.md")
    if not texto:
        return {}
    blocos = blocos_reviews(texto)
    ids = [identificador for identificador, _, _ in blocos]
    for identificador, total in sorted(Counter(ids).items()):
        if total > 1:
            resultado.erro(f"reviews.md: ID duplicado {identificador}")
    por_id = {identificador: bloco for identificador, _, bloco in blocos}
    tabelas_reviews = tabelas(texto)
    if not tabelas_reviews:
        resultado.erro("reviews.md: falta a tabela de contagens no topo")
    else:
        cabecalho, linhas = tabelas_reviews[0]
        indice_prefixo, indice_recolhidas = coluna(cabecalho, "prefixo"), coluna(cabecalho, "recolhidas")
        if indice_prefixo is None or indice_recolhidas is None:
            resultado.erro("reviews.md: a primeira tabela não tem as colunas 'Prefixo' e 'Recolhidas'")
        elif not linhas and blocos:
            resultado.erro("reviews.md: tabela de contagens sem plataformas")
        else:
            for linha in linhas:
                if len(linha) <= max(indice_prefixo, indice_recolhidas):
                    resultado.erro("reviews.md: linha incompleta na tabela de contagens")
                    continue
                prefixo, recolhidas = linha[indice_prefixo], linha[indice_recolhidas]
                if not recolhidas.isdigit():
                    resultado.erro(f"reviews.md: 'Recolhidas' para {prefixo or 'plataforma sem prefixo'} não é inteiro")
                    continue
                real = sum(1 for identificador in ids if identificador.startswith(prefixo + "-"))
                if real != int(recolhidas):
                    resultado.erro(f"reviews.md: a tabela diz {recolhidas} reviews '{prefixo}-', as secções têm {real}")
            if not blocos and not linhas:
                resultado.erro("reviews.md: não há reviews nem uma declaração de cobertura com contagens a zero")

    for identificador, _, bloco in blocos:
        match = TRUNCADO.search(bloco)
        if match:
            resultado.erro(f"reviews.md: {identificador} contém texto truncado ('{match.group(0)}')")
    return por_id


def validar_citacoes_legado(pasta: Path, reviews: dict[str, str], resultado: Resultado) -> None:
    citados = defaultdict(set)
    for ficheiro in CITAM_REVIEWS:
        texto = ler(pasta / ficheiro)
        for identificador in ID_REVIEW.findall(texto):
            citados[identificador].add(ficheiro)
        for cita, identificador in CITACAO_COM_ID.findall(texto):
            original = reviews.get(identificador)
            if original is not None and not corresponde_excerto(cita, original):
                resultado.erro(f"{ficheiro}: citação de {identificador} não corresponde ao texto da review")
    for identificador, ficheiros in sorted(citados.items()):
        original = reviews.get(identificador)
        if original is None:
            resultado.erro(f"{identificador} citado em {', '.join(sorted(ficheiros))} não existe em reviews.md")
        elif "★" not in original.splitlines()[0]:
            resultado.erro(f"{identificador} está citado mas não tem '★ citada' no título em reviews.md")


def validar_truncamento_outros(pasta: Path, resultado: Resultado) -> None:
    for ficheiro in ["descricao-al.md", "marketing/textos.md"]:
        for numero, linha in enumerate(ler(pasta / ficheiro).splitlines(), 1):
            match = TRUNCADO.search(linha)
            if match and re.match(r"\s*\[(OFICIAL|PLATAFORMA|OPINIAO)\]\s+[\"“].*" + re.escape(match.group(0)), linha):
                resultado.erro(f"{ficheiro}:{numero}: texto truncado ('{match.group(0)}')")


def validar_quartos_legado(pasta: Path, resultado: Resultado) -> None:
    texto = ler(pasta / "quartos.md")
    if not texto:
        return
    tabelas_quartos = tabelas(texto)
    if not tabelas_quartos:
        resultado.erro("quartos.md: falta a tabela de tipos no topo")
        return
    fichas = list(re.finditer(r"^##\s+(.+)$", texto, re.M))
    for linha in tabelas_quartos[0][1]:
        if not linha:
            continue
        tipo = linha[0].strip("* `")
        if not tipo:
            continue
        ficha = next((match for match in fichas if tipo.lower() in match.group(1).strip().lower()), None)
        if ficha is None:
            resultado.erro(f"quartos.md: o tipo '{tipo}' não tem ficha (## {tipo})")
            continue
        proximos = [match.start() for match in fichas if match.start() > ficha.start()]
        fim = min(proximos) if proximos else len(texto)
        if len(normalizar(texto[ficha.end():fim])) < 40:
            resultado.erro(f"quartos.md: a ficha '{tipo}' está vazia ou sem detalhe útil")


def validar_pontos_fortes_legado(pasta: Path, resultado: Resultado) -> None:
    texto = ler(pasta / "pontos-fortes.md")
    if not texto:
        return
    secao = re.search(r"^## Pontos fortes$(.*?)(?=^## |\Z)", texto, re.M | re.S)
    if not secao:
        resultado.erro("pontos-fortes.md: falta a secção '## Pontos fortes'")
        return
    blocos = re.split(r"^### ", secao.group(1), flags=re.M)[1:]
    if not blocos:
        resultado.erro("pontos-fortes.md: a secção '## Pontos fortes' não tem pontos")
    for bloco in blocos:
        nome = bloco.splitlines()[0][:60] if bloco.splitlines() else "sem nome"
        for campo in ("Atual:", "Fotos:"):
            if campo not in bloco:
                resultado.erro(f"pontos-fortes.md: '{nome}' sem a linha '{campo}'")


def validar_fotos_legado(pasta: Path, resultado: Resultado) -> None:
    pasta_fotos = pasta / "marketing" / "fotos"
    indice_path = pasta / "marketing" / "fotos.md"
    indice = ler(indice_path)
    if indice and not pasta_fotos.is_dir():
        resultado.erro("marketing/fotos.md existe mas falta a pasta marketing/fotos/")
        return
    if pasta_fotos.is_dir() and not indice:
        resultado.erro("marketing/fotos/ existe mas falta marketing/fotos.md")
        return
    if not pasta_fotos.is_dir():
        return
    if Image is None:
        resultado.erro("Pillow não instalado: não é possível conferir imagens obrigatórias")
        return
    no_disco = {imagem.relative_to(pasta_fotos).as_posix(): imagem for imagem in pasta_fotos.rglob("*") if imagem.is_file() and IMAGEM.search(imagem.name)}
    no_indice = set()
    encontrou_coluna = False
    for cabecalho, linhas in tabelas(indice):
        indice_ficheiro = coluna(cabecalho, "ficheiro")
        if indice_ficheiro is None:
            continue
        encontrou_coluna = True
        indice_resolucao = coluna(cabecalho, "resolu")
        for linha in linhas:
            if len(linha) <= indice_ficheiro:
                continue
            nome = linha[indice_ficheiro].strip("` ").removeprefix("fotos/")
            if not IMAGEM.search(nome):
                continue
            if nome not in no_disco:
                resultado.erro(f"fotos.md: '{nome}' está no índice mas não existe no disco")
                continue
            no_indice.add(nome)
            if indice_resolucao is None or len(linha) <= indice_resolucao:
                resultado.erro(f"fotos.md: '{nome}' não tem resolução no índice")
                continue
            match = RESOLUCAO.search(linha[indice_resolucao])
            if not match:
                resultado.erro(f"fotos.md: '{nome}' tem resolução inválida no índice")
                continue
            try:
                with Image.open(no_disco[nome]) as imagem:
                    real = imagem.size
            except Exception as exc:
                resultado.erro(f"fotos.md: não foi possível abrir '{nome}' ({exc})")
                continue
            esperada = (int(match.group(1)), int(match.group(2)))
            if real != esperada:
                resultado.erro(f"fotos.md: '{nome}' diz {esperada[0]}×{esperada[1]}, o ficheiro tem {real[0]}×{real[1]}")
    if no_disco and not encontrou_coluna:
        resultado.erro("marketing/fotos.md: falta uma tabela com a coluna 'Ficheiro'")
    for nome in sorted(set(no_disco) - no_indice):
        resultado.erro(f"marketing/fotos/{nome} está no disco mas não no índice fotos.md")


def validar_legado(pasta: Path, resultado: Resultado) -> None:
    exigir_conteudo(pasta, resultado)
    reviews = validar_reviews_legado(pasta, resultado)
    validar_citacoes_legado(pasta, reviews, resultado)
    validar_truncamento_outros(pasta, resultado)
    validar_quartos_legado(pasta, resultado)
    validar_pontos_fortes_legado(pasta, resultado)
    validar_fotos_legado(pasta, resultado)


def ids_unicos(registos, grupo: str, resultado: Resultado) -> set[str]:
    valores = [registo.get("id") for registo in registos if isinstance(registo, dict) and isinstance(registo.get("id"), str)]
    for identificador, total in Counter(valores).items():
        if total > 1:
            resultado.erro(f"contrato.json: ID duplicado {identificador} em {grupo}")
    return set(valores)


def validar_contrato(pasta: Path, resultado: Resultado) -> None:
    caminho = pasta / "contrato.json"
    try:
        contrato = json.loads(caminho.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        resultado.erro(f"contrato.json: JSON inválido ({exc})")
        return
    if Draft202012Validator is None or FormatChecker is None:
        resultado.erro("jsonschema não instalado: não é possível validar contrato.json")
        return
    try:
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        resultado.erro(f"schema do contrato indisponível ({exc})")
        return
    validador = Draft202012Validator(schema, format_checker=FormatChecker())
    for erro in sorted(validador.iter_errors(contrato), key=lambda item: list(item.absolute_path)):
        local = ".".join(str(parte) for parte in erro.absolute_path) or "raiz"
        resultado.erro(f"contrato.json:{local}: {erro.message}")
    if resultado.erros:
        return

    entidades = ids_unicos(contrato["entidades"], "entidades", resultado)
    evidencias = ids_unicos(contrato["evidencias"], "evidencias", resultado)
    afirmacoes = ids_unicos(contrato["afirmacoes"], "afirmacoes", resultado)
    citacoes = ids_unicos(contrato["citacoes"], "citacoes", resultado)
    ativos = ids_unicos(contrato["ativos"], "ativos", resultado)
    decisoes = ids_unicos(contrato["decisoes"], "decisoes", resultado)
    cobertura = ids_unicos(contrato["cobertura"], "cobertura", resultado)
    grupos = [entidades, evidencias, afirmacoes, citacoes, ativos, decisoes, cobertura]
    todos = set().union(*grupos)
    afirmacoes_por_id = {afirmacao["id"]: afirmacao for afirmacao in contrato["afirmacoes"]}
    ativos_por_id = {ativo["id"]: ativo for ativo in contrato["ativos"]}
    if len(todos) != sum(len(grupo) for grupo in grupos):
        resultado.erro("contrato.json: IDs repetidos entre grupos")

    for evidencia in contrato["evidencias"]:
        for entidade in evidencia["entidade_ids"]:
            if entidade not in entidades:
                resultado.erro(f"contrato.json: evidência {evidencia['id']} referencia entidade inexistente {entidade}")
    textos = defaultdict(set)
    for afirmacao in contrato["afirmacoes"]:
        for evidencia in afirmacao["evidencia_ids"]:
            if evidencia not in evidencias:
                resultado.erro(f"contrato.json: afirmação {afirmacao['id']} referencia evidência inexistente {evidencia}")
        if afirmacao["entidade_id"] not in entidades:
            resultado.erro(f"contrato.json: afirmação {afirmacao['id']} referencia entidade inexistente {afirmacao['entidade_id']}")
        if afirmacao["uso"] == "afirmar" and afirmacao["estado"] != "confirmado":
            resultado.erro(f"contrato.json: {afirmacao['id']} só pode usar 'afirmar' com estado confirmado")
        if afirmacao["uso"] == "afirmar_com_condicao" and (afirmacao["estado"] != "confirmado" or not afirmacao.get("condicao", "").strip()):
            resultado.erro(f"contrato.json: {afirmacao['id']} exige estado confirmado e condição escrita")
        if afirmacao["uso"] in {"afirmar", "afirmar_com_condicao"} and afirmacao["natureza"] == "testemunho":
            resultado.erro(f"contrato.json: {afirmacao['id']} não pode transformar testemunho em facto do site")
        if afirmacao["categoria"] in {"tarifa", "disponibilidade"}:
            if afirmacao["uso"] != "afirmar_com_condicao" or not afirmacao.get("ambito"):
                resultado.erro(f"contrato.json: {afirmacao['id']} é {afirmacao['categoria']} e exige uso 'afirmar_com_condicao' com âmbito")
        textos[normalizar(afirmacao["texto"]).casefold()].add(afirmacao["uso"])
    for texto, usos in textos.items():
        if usos & {"afirmar", "afirmar_com_condicao"} and "nao_usar" in usos:
            resultado.erro(f"contrato.json: '{texto}' está simultaneamente autorizado e bloqueado")

    reviews = {identificador: bloco for identificador, _, bloco in blocos_reviews(ler(pasta / "reviews.md"))}
    for citacao in contrato["citacoes"]:
        original = reviews.get(citacao["review_id"])
        if original is None:
            resultado.erro(f"contrato.json: citação {citacao['id']} referencia review inexistente {citacao['review_id']}")
        elif not corresponde_excerto(citacao["texto_original"], original):
            resultado.erro(f"contrato.json: citação {citacao['id']} não corresponde ao texto de {citacao['review_id']}")

    for ativo in contrato["ativos"]:
        caminho_ativo = pasta / ativo["caminho"]
        if not caminho_ativo.is_file():
            resultado.erro(f"contrato.json: ativo {ativo['id']} aponta para ficheiro inexistente {ativo['caminho']}")
        elif Image is None:
            resultado.erro("Pillow não instalado: não é possível conferir as dimensões dos ativos do contrato")
        else:
            try:
                with Image.open(caminho_ativo) as imagem:
                    dimensoes_reais = imagem.size
                dimensoes_declaradas = (ativo["dimensoes"]["largura"], ativo["dimensoes"]["altura"])
                if dimensoes_reais != dimensoes_declaradas:
                    resultado.erro(f"contrato.json: ativo {ativo['id']} diz {dimensoes_declaradas[0]}×{dimensoes_declaradas[1]}, o ficheiro tem {dimensoes_reais[0]}×{dimensoes_reais[1]}")
            except Exception as exc:
                resultado.erro(f"contrato.json: não foi possível abrir ativo {ativo['id']} ({exc})")
        if ativo.get("entidade_confirmada") and ativo["entidade_confirmada"] not in entidades:
            resultado.erro(f"contrato.json: ativo {ativo['id']} referencia entidade inexistente {ativo['entidade_confirmada']}")
        if ativo.get("derivado_de") and ativo["derivado_de"] not in ativos:
            resultado.erro(f"contrato.json: ativo {ativo['id']} referencia origem inexistente {ativo['derivado_de']}")

    for decisao in contrato["decisoes"]:
        for afetado in decisao["afetados"]:
            if afetado not in todos:
                resultado.erro(f"contrato.json: decisão {decisao['id']} afeta ID inexistente {afetado}")
        if decisao["estado"] == "substituida" and decisao.get("substituida_por") not in decisoes:
            resultado.erro(f"contrato.json: decisão {decisao['id']} substituída sem decisão sucessora válida")
        if decisao["estado"] == "ativa" and decisao["efeito"] == "bloquear_uso":
            for afetado in decisao["afetados"]:
                afirmacao = afirmacoes_por_id.get(afetado)
                ativo = ativos_por_id.get(afetado)
                if afirmacao and afirmacao["uso"] != "nao_usar":
                    resultado.erro(f"contrato.json: decisão ativa {decisao['id']} bloqueia {afetado}, mas a afirmação continua com uso {afirmacao['uso']}")
                if ativo and ativo["uso"] == "utilizavel":
                    resultado.erro(f"contrato.json: decisão ativa {decisao['id']} bloqueia {afetado}, mas o ativo continua utilizável")

    if contrato["manifesto"]["prontidao"] == "pronto_para_base":
        if not any(afirmacao["uso"] in {"afirmar", "afirmar_com_condicao", "citar"} for afirmacao in contrato["afirmacoes"]):
            resultado.erro("contrato.json: pronto_para_base sem conteúdo permitido para a base")


def validar(pasta: Path) -> Resultado:
    resultado = Resultado()
    validar_legado(pasta, resultado)
    if (pasta / "contrato.json").exists():
        validar_contrato(pasta, resultado)
    else:
        resultado.aviso("contrato.json ausente: validado no formato legado; migrar antes de o usar como contrato de construção")
    return resultado


def verificar_relatorio_anterior(pasta: Path, caminho: Path, resultado: Resultado) -> None:
    try:
        anterior = json.loads(caminho.read_text(encoding="utf-8"))
    except FileNotFoundError:
        resultado.erro(f"relatório de validação ausente: {caminho}")
        return
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        resultado.erro(f"relatório de validação inválido: {exc}")
        return
    atual = impressao_digital(pasta)["sha256"]
    if anterior.get("versao_validador") != VERSAO_VALIDACAO:
        resultado.erro("relatório de validação criado por outra versão do validador")
    if anterior.get("resultado") != "aprovado":
        resultado.erro("relatório de validação anterior não aprovou o dossiê")
    if anterior.get("impressao_digital", {}).get("sha256") != atual:
        resultado.erro("relatório de validação desatualizado: o material do dossiê mudou")


def main(pasta: Path, relatorio: Path | None = None, verificar_relatorio: Path | None = None) -> int:
    if not pasta.is_dir():
        print(f"ERRO   a pasta do dossiê não existe: {pasta}")
        return 2
    resultado = validar(pasta)
    if verificar_relatorio:
        verificar_relatorio_anterior(pasta, verificar_relatorio, resultado)
    for aviso in resultado.avisos:
        print(f"AVISO  {aviso}")
    for erro in resultado.erros:
        print(f"ERRO   {erro}")
    print(f"\n{len(resultado.erros)} erros, {len(resultado.avisos)} avisos")
    if relatorio:
        try:
            relatorio.write_text(json.dumps(resultado.como_json(pasta), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"Relatório: {relatorio}")
        except OSError as exc:
            print(f"ERRO   não foi possível escrever o relatório {relatorio}: {exc}")
            return 2
    return 1 if resultado.erros else 0


if __name__ == "__main__":
    argumentos = argparse.ArgumentParser(description="Valida um dossiê da skill al-dossier.")
    argumentos.add_argument("pasta", type=Path, help="pasta do dossiê")
    argumentos.add_argument("--relatorio", type=Path, help="escreve validacao.json (ou outro caminho) com resultado e hashes")
    argumentos.add_argument("--verificar-relatorio", type=Path, metavar="CAMINHO", help="confirma que um relatório aprovado ainda corresponde ao material atual")
    opcoes = argumentos.parse_args()
    sys.exit(main(opcoes.pasta, opcoes.relatorio, opcoes.verificar_relatorio))
