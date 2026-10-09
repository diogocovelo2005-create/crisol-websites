#!/usr/bin/env python
"""Confere o BRIEF.md contra o contrato do dossiê, antes de lançar os protótipos.

Uso:
    python validar-brief.py casas/<slug> [--brief <outro BRIEF.md>]

Faz o que não precisa de juízo, para o Claude não ter de ler o contrato:
- cada ID entre parênteses retos existe no contrato;
- o uso é compatível: nada de "nao_usar"; "citar" só em linhas de citação;
- cada citação está à letra (com cortes […] permitidos), com o autor e a
  plataforma certos;
- telefones e emails do brief existem no contrato;
- números do texto que não aparecem em lado nenhum do contrato (aviso);
- fotos citadas existem no pacote;
- sem travessões longos;
- o guião (`## O guião`, depois de `## A história`) existe e cada linha tem
  o formato `N. <Nome> · <tipo> · <o que se descobre> → <a pergunta que
  puxa o seguinte>`, com o tipo em {plano largo, sequência, pausa,
  pormenor, fecho} (erro); mais de duas sequências é aviso.

Avisos de conteúdo (podem ser legítimos, mas confirma):
- mais de 5 citações, ou mais de uma em língua estrangeira (com `Tradução:`);
- frases negativas sobre a casa no texto visível ("não se vê", "não tem",
  "não há", "não é", ", o rio não");
- uma secção dedicada ao anfitrião (o anfitrião menciona-se, não tem secção).

Lista no fim as condições dos factos "afirmar_com_condicao" usados: o Claude
confirma só essas, à vista, no texto.

Sai com 0 se não houver erros e 2 se houver.
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

ID = re.compile(r"\b[A-Z]{2,8}-[A-Z0-9][A-Z0-9-]*\b")
BLOCO_IDS = re.compile(r"\[([A-Z]{2,8}-[^\]]+)\]")
CITACAO = re.compile(r'^>\s*["“](.+)["”]\s*\(([^,)]+),\s*([^)]+)\)\s*\[([^\]]+)\]')


def sair(texto):
    print(texto, file=sys.stderr)
    sys.exit(1)


def normalizar(texto):
    texto = unicodedata.normalize("NFKC", texto)
    texto = re.sub(r"[“”«»„\"]", '"', texto)
    texto = re.sub(r"[‘’`´]", "'", texto)
    return re.sub(r"\s+", " ", texto).strip().lower()


def excerto_de(citacao, original):
    """Aceita a citação inteira ou cortes explícitos, com os pedaços pela ordem."""
    pedacos = [p.strip(" .,;") for p in re.split(r"\[…\]|\[\.\.\.\]|…", normalizar(citacao))]
    alvo = normalizar(original)
    posicao = 0
    for pedaco in filter(None, pedacos):
        encontrado = alvo.find(pedaco, posicao)
        if encontrado < 0:
            return False
        posicao = encontrado + len(pedaco)
    return True


TIPOS_MOMENTO = {"plano largo", "sequência", "pausa", "pormenor", "fecho"}
MAX_CITACOES = 5
MAX_SEQUENCIAS = 2
NEGATIVAS = re.compile(
    r"\bnão\s+(?:se\s+vê|se\s+veem|se\s+vêem|tem|têm|há|é|são)\b|,\s*(?:o|a|os|as)\s+\w+\s+não\b",
    re.IGNORECASE,
)
# Linhas de instrução para quem constrói, dentro do texto das secções.
INSTRUCAO = re.compile(
    r"^\s*(?:[-*]\s*)?(?:\*\*)?(?:por confirmar|para quem constrói|atualizar|não mostrar|nota|fotos?:|crédito|nada de)",
    re.IGNORECASE,
)
ANFITRIAO = re.compile(r"anfitri|propriet|quem recebe|\bos donos\b|\bo dono\b|\ba dona\b", re.IGNORECASE)


def seccoes_do_brief(linhas):
    """[(nivel2_titulo, inicio, fim)] para cada cabeçalho `## `."""
    marcas = [(i, l[3:].strip()) for i, l in enumerate(linhas) if l.startswith("## ")]
    return [(t, i, marcas[k + 1][0] if k + 1 < len(marcas) else len(linhas)) for k, (i, t) in enumerate(marcas)]


def verificar_guiao(linhas, seccoes, erros, avisos):
    titulos = [t for t, _, _ in seccoes]
    guiao = next(((i, f) for t, i, f in seccoes if t.lower().startswith("o guião")), None)
    if not guiao:
        erros.append("falta a secção `## O guião` (depois de `## A história`): a lista numerada de momentos")
        return set()
    pos_guiao = titulos.index(next(t for t in titulos if t.lower().startswith("o guião")))
    pos_historia = next((k for k, t in enumerate(titulos) if t.lower().startswith("a história")), None)
    if pos_historia is None or pos_guiao != pos_historia + 1:
        avisos.append("o guião deve vir logo a seguir a `## A história`")
    inicio, fim = guiao
    momentos = []
    for n in range(inicio + 1, fim):
        linha = linhas[n].strip()
        if not linha or linha == "---":
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", linha)
        if not m:
            continue
        partes = [p.strip() for p in m.group(2).split("·")]
        if len(partes) < 3 or not partes[0]:
            erros.append(f"linha {n + 1}: momento do guião fora do formato `N. Nome · tipo · o que se descobre → a pergunta seguinte`")
            continue
        nome, tipo, resto = partes[0], partes[1].lower(), " · ".join(partes[2:])
        if tipo not in TIPOS_MOMENTO:
            erros.append(f"linha {n + 1}: tipo '{partes[1]}' inválido no guião (usa: {', '.join(sorted(TIPOS_MOMENTO))})")
        # O fecho é o último: não tem seguinte, a pergunta é opcional.
        sem_seta = "→" not in resto and tipo == "fecho" and resto.strip()
        if not sem_seta and ("→" not in resto or not all(p.strip() for p in resto.split("→", 1))):
            erros.append(f"linha {n + 1}: o momento '{nome}' precisa de `o que se descobre → a pergunta que puxa o seguinte`")
        momentos.append((nome, tipo))
    if not momentos:
        erros.append("o guião não tem momentos (linhas `N. Nome · tipo · … → …`)")
    sequencias = sum(1 for _, t in momentos if t == "sequência")
    if sequencias > MAX_SEQUENCIAS:
        avisos.append(f"o guião tem {sequencias} sequências (mais de {MAX_SEQUENCIAS} pesa: cada uma prende o scroll)")
    n_seccoes = sum(1 for t in titulos if re.match(r"\d+\.", t))
    if momentos and len(momentos) < n_seccoes:
        avisos.append(f"o guião tem {len(momentos)} momentos para {n_seccoes} secções: cada secção corresponde a pelo menos um")
    return set(range(inicio, fim))


def verificar_conteudo(linhas, seccoes, avisos, excluir):
    citacoes = [n for n, l in enumerate(linhas) if re.match(r'^>\s*["“]', l.strip())]
    if len(citacoes) > MAX_CITACOES:
        avisos.append(f"{len(citacoes)} citações no brief (mais de {MAX_CITACOES} cansa: escolhe as que contam)")
    traducoes = [n for n, l in enumerate(linhas) if re.search(r"\bTradução:", l)]
    if len(traducoes) > 1:
        avisos.append(f"{len(traducoes)} citações em língua estrangeira (com `Tradução:`): no máximo uma")

    # Texto visível: dentro das secções numeradas, do **Texto:** até às
    # **Fotos:**, mais as linhas "Passagem:"; fora das citações e instruções.
    for titulo, inicio, fim in seccoes:
        if not re.match(r"\d+\.", titulo):
            continue
        no_texto = False
        for n in range(inicio + 1, fim):
            l = linhas[n]
            if l.startswith("**Texto:**"):
                no_texto = True
                continue
            if l.startswith("**Fotos:**"):
                no_texto = False
            visivel = (no_texto or l.startswith("Passagem:")) and n not in excluir
            if not visivel or l.lstrip().startswith(">") or INSTRUCAO.match(l) or re.search(r"\bTradução:", l):
                continue
            if NEGATIVAS.search(l):
                avisos.append(f"linha {n + 1}: frase negativa sobre a casa (diz o que tem, não o que falta?): {l.strip()[:140]}")

        # Secção dedicada ao anfitrião: no título, ou no começo do "Na história".
        historia = next((linhas[n] for n in range(inicio, fim) if linhas[n].startswith("**Na história:**")), "")
        primeira = re.split(r"[,.;:]", historia.replace("**Na história:**", "").strip(), maxsplit=1)[0]
        if ANFITRIAO.search(titulo) or ANFITRIAO.search(primeira):
            avisos.append(f"secção '{titulo}' parece dedicada ao anfitrião: menciona-se quem recebe, sem secção própria")


def main():
    args = sys.argv[1:]
    if not args:
        sair(__doc__)
    casa = Path(args[0])
    brief_path = Path(args[args.index("--brief") + 1]) if "--brief" in args else casa / "prototipos" / "BRIEF.md"
    if not brief_path.exists():
        sair(f"Falta o brief: {brief_path}")
    contrato_path = casa / "dossie" / "contrato.json"
    if not contrato_path.exists():
        sair(f"Falta o contrato: {contrato_path}")

    brief = brief_path.read_text(encoding="utf-8")
    contrato = json.loads(contrato_path.read_text(encoding="utf-8"))
    afirmacoes = {a["id"]: a for a in contrato.get("afirmacoes", [])}
    citacoes = {c["id"]: c for c in contrato.get("citacoes", [])}
    ativos = {a["id"]: a for a in contrato.get("ativos", [])}
    outros = {x["id"] for chave in ("evidencias", "entidades", "decisoes") for x in contrato.get(chave, []) if "id" in x}
    texto_contrato = json.dumps(contrato, ensure_ascii=False)

    erros, avisos, condicoes = [], [], {}
    linhas = brief.splitlines()
    seccoes = seccoes_do_brief(linhas)
    linhas_guiao = verificar_guiao(linhas, seccoes, erros, avisos)
    verificar_conteudo(linhas, seccoes, avisos, linhas_guiao)

    for n, linha in enumerate(brief.splitlines(), 1):
        e_citacao = linha.lstrip().startswith(">")
        for bloco in BLOCO_IDS.findall(linha):
            for id_ in ID.findall(bloco):
                if id_ in afirmacoes:
                    a = afirmacoes[id_]
                    uso = a.get("uso")
                    if uso == "nao_usar":
                        erros.append(f"linha {n}: {id_} é 'nao_usar' e não pode aparecer")
                    elif uso == "citar" and not e_citacao:
                        erros.append(f"linha {n}: {id_} é só para citar, mas está numa frase do texto")
                    elif uso == "inspiracao_editorial" and not e_citacao:
                        avisos.append(f"linha {n}: {id_} é só inspiração editorial; confirma que não está a ser afirmado")
                    elif uso == "afirmar_com_condicao":
                        condicoes[id_] = a.get("condicao", "(sem condição escrita no contrato)")
                elif id_ in citacoes or id_ in ativos or id_ in outros:
                    continue
                else:
                    erros.append(f"linha {n}: {id_} não existe no contrato")

        if e_citacao:
            m = CITACAO.match(linha.strip())
            if not m:
                if re.match(r'^>\s*["“]', linha.strip()):
                    erros.append(f"linha {n}: citação fora do formato > \"…\" (Autor, Plataforma) [CIT-…]")
                continue
            texto, autor, plataforma, ids = m.groups()
            cit_ids = [i for i in ID.findall(ids) if i in citacoes]
            if not cit_ids:
                erros.append(f"linha {n}: citação sem ID de citação do contrato")
                continue
            c = citacoes[cit_ids[0]]
            if not excerto_de(texto, c.get("texto_original", "")):
                erros.append(f"linha {n}: {cit_ids[0]} não está à letra (compara com o texto_original do contrato)")
            if normalizar(autor) != normalizar(c.get("autor", "")):
                erros.append(f"linha {n}: {cit_ids[0]} autor '{autor}' em vez de '{c.get('autor')}'")
            if normalizar(plataforma) != normalizar(c.get("plataforma", "")):
                erros.append(f"linha {n}: {cit_ids[0]} plataforma '{plataforma}' em vez de '{c.get('plataforma')}'")

        if "—" in linha:
            erros.append(f"linha {n}: travessão longo (—)")

    # Contactos: têm de estar no contrato, com os mesmos dígitos.
    digitos_contrato = re.sub(r"\D", "", texto_contrato)
    for telefone in set(re.findall(r"(?:\+351[\s.]?)?\b[29]\d{2}[\s.]?\d{3}[\s.]?\d{3}\b", brief)):
        nucleo = re.sub(r"\D", "", telefone)[-9:]
        if nucleo not in digitos_contrato:
            erros.append(f"telefone {telefone.strip()} não está no contrato")
    for email in {e.rstrip(".") for e in re.findall(r"[\w.+-]+@[\w-]+\.[\w.]+", brief)}:
        if email.lower() not in texto_contrato.lower():
            erros.append(f"email {email} não está no contrato")

    # Números do texto (fora de títulos, cores, IDs e ficheiros) sem rasto no contrato.
    corpo = "\n".join(l for n, l in enumerate(linhas) if not l.lstrip().startswith("#") and n not in linhas_guiao)
    corpo = re.sub(r"#[0-9a-fA-F]{3,8}\b|\[[A-Z]{2,8}-[^\]]*\]|\S+\.(?:jpe?g|png|webp)\b", " ", corpo)
    soltos = sorted({n for n in re.findall(r"\d+", corpo) if len(n) > 1 and n not in texto_contrato}, key=int)
    if soltos:
        avisos.append(f"números sem rasto no contrato: {', '.join(soltos[:15])}")

    # Fotos citadas no brief têm de estar no pacote.
    pacote = casa / "prototipos" / "fotos"
    for foto in sorted(set(re.findall(r"fotos/([\w.-]+\.(?:jpe?g|png|webp))", brief))):
        if pacote.exists() and not (pacote / foto).exists():
            erros.append(f"fotos/{foto} não está no pacote (corre preparar-fotos.py pacote)")

    for e in erros:
        print(f"ERRO   {e}")
    for a in avisos:
        print(f"AVISO  {a}")
    if condicoes:
        print("\nCondições a confirmar no texto (cada facto tem de as levar):")
        for id_, condicao in condicoes.items():
            print(f"- {id_}: {condicao}")
    print(f"\n{len(erros)} erros, {len(avisos)} avisos, {len(condicoes)} condições a confirmar.")
    sys.exit(2 if erros else 0)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
