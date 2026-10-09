#!/usr/bin/env python3
"""Prepara as imagens que os construtores dos protótipos recebem.

  Pacote (as fotos da casa escolhidas no BRIEF):
    python preparar-fotos.py pacote <pasta-da-casa> ATV-1 ATV-2 ...
    Copia os ativos para <casa>/prototipos/fotos/ com no máximo 1600 px de
    lado e escreve <casa>/prototipos/fotos.md com a descrição de cada uma
    (vinda de dossie/fotos-descricao.json). Recusa ativos que não sejam
    "utilizavel" ou que ainda não estejam descritos.

    Exceção: as fotos de terceiros da região (marketing/fotos/regiao/, uso
    "restrito") entram como fotos/regiao-<nome>.jpg, com o crédito, a
    licença, a página no Commons (de dossie/regiao/regiao.md) e as
    restrições do contrato numa secção própria de fotos.md. As outras fotos
    "restrito" continuam recusadas.

  Inspirações (as capturas que o Diogo manda no chat):
    python preparar-fotos.py inspiracao <pasta-da-casa> <imagem> [<imagem> ...]
    Copia-as para <casa>/prototipos/inspiracao/ como inspiracao-1.jpg, ...

  Folha de contacto (só para diagnóstico; a escolha faz-se pelas descrições):
    python preparar-fotos.py folha <pasta-da-casa> <saida.jpg>
"""

import json
import math
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

LADO_MAXIMO = 1600


def sair(texto):
    print(texto, file=sys.stderr)
    sys.exit(1)


def ler_json(caminho, descricao):
    if not caminho.exists():
        sair(f"Falta {descricao}: {caminho}")
    return json.loads(caminho.read_text(encoding="utf-8"))


def fonte(tamanho):
    for nome in ("arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(nome, tamanho)
        except OSError:
            continue
    return ImageFont.load_default()


def guardar_reduzida(origem, destino, lado=LADO_MAXIMO):
    with Image.open(origem) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        img.thumbnail((lado, lado))
        img.save(destino, quality=84, optimize=True, progressive=True)
        return img.size


def e_foto_da_regiao(ativo):
    return ativo.get("uso") == "restrito" and ativo.get("caminho", "").replace("\\", "/").startswith("marketing/fotos/regiao/")


def paginas_commons(dossie):
    """{nome do ficheiro: página no Commons}, lida de regiao/regiao.md (a
    linha "URL:" a seguir à linha "Foto: `marketing/fotos/regiao/…`")."""
    regiao = dossie / "regiao" / "regiao.md"
    paginas, atual = {}, None
    if not regiao.exists():
        return paginas
    for linha in regiao.read_text(encoding="utf-8").splitlines():
        m = re.search(r"Foto:\s*`marketing/fotos/regiao/([^`]+)`", linha)
        if m:
            atual = m.group(1)
            continue
        if linha.startswith("#"):
            atual = None
        m = re.search(r"URL:\s*(https://commons\.wikimedia\.org/\S+)", linha)
        if m and atual and atual not in paginas:
            paginas[atual] = m.group(1)
    return paginas


def bloco_da_regiao(id_, ativo, nome, largura, altura, pagina):
    restricoes = ativo.get("restricoes", [])
    texto = " ".join(restricoes)
    credito = re.search(r"'(Foto:[^']+)'", texto)
    licenca = re.search(r"https://creativecommons\.org/[^\s)'\"]+", texto)
    dominio_publico = "domínio público" in texto.lower()
    d = ativo.get("dimensoes", {})
    linhas = [
        f"### `fotos/{nome}` ({id_})",
        f"- Foto de terceiros, para a secção da região. Original: {d.get('largura', '?')}×{d.get('altura', '?')} px; no pacote: {largura}×{altura} px.",
        f"- Assunto: {ativo.get('assunto', '')}",
        f"- Crédito junto da foto (ou num bloco de créditos ligado a ela): \"{credito.group(1) if credito else 'VER CONTRATO'}\".",
        f"- Licença: {licenca.group(0).rstrip('.,') if licenca else ('domínio público' if dominio_publico else 'VER CONTRATO')}.",
        f"- Página no Commons: {pagina or 'não encontrada em dossie/regiao/regiao.md (é obrigatória: pede-a ao Diogo)'}",
    ]
    linhas += [f"- Restrição: {r}" for r in restricoes]
    linhas.append(
        f"- Tamanho máximo: até ~{d.get('largura', largura)} px de largura no ecrã"
        + (" (abaixo de 2400 px: não usar em ecrã inteiro)." if (d.get("largura") or largura) < 2400 else ".")
    )
    linhas.append("- Sem texto por cima, sem recorte e sem mudar a cor (seria obra derivada); marcas de água do autor ficam como estão. No pacote só foi reduzida de tamanho.")
    return "\n".join(linhas) + "\n"


def pacote(casa, ids):
    dossie = casa / "dossie"
    contrato = ler_json(dossie / "contrato.json", "o contrato")
    ativos = {a["id"]: a for a in contrato.get("ativos", [])}
    descricoes = {d["id"]: d for d in ler_json(dossie / "fotos-descricao.json", "as descrições (corre o subagente descritor-fotos)")["fotos"]}
    if not ids:
        sair("Indica os IDs dos ativos a incluir.")

    pasta = casa / "prototipos" / "fotos"
    pasta.mkdir(parents=True, exist_ok=True)
    blocos, blocos_regiao, usados = [], [], set()
    commons = None
    for id_ in ids:
        ativo = ativos.get(id_) or sair(f"{id_} não existe no contrato.")
        if e_foto_da_regiao(ativo):
            commons = paginas_commons(dossie) if commons is None else commons
            origem = dossie / ativo["caminho"]
            if not origem.exists():
                sair(f"{id_}: falta o ficheiro {origem}")
            nome = f"regiao-{origem.stem}.jpg"
            usados.add(nome)
            largura, altura = guardar_reduzida(origem, pasta / nome)
            pagina = commons.get(origem.name)
            if not pagina:
                print(f"AVISO  {id_}: sem página no Commons em dossie/regiao/regiao.md", file=sys.stderr)
            blocos_regiao.append(bloco_da_regiao(id_, ativo, nome, largura, altura, pagina))
            continue
        if ativo.get("uso") != "utilizavel":
            sair(f"{id_} tem uso '{ativo.get('uso')}': não pode ser usado.")
        desc = descricoes.get(id_) or sair(f"{id_} ainda não está descrito: corre o subagente descritor-fotos.")
        origem = dossie / ativo["caminho"]
        nome = origem.stem + ".jpg"
        if nome in usados:
            nome = f"{origem.stem}-{id_.lower()}.jpg"
        usados.add(nome)
        largura, altura = guardar_reduzida(origem, pasta / nome)
        q, luz, foco = desc.get("qualidade", {}), desc.get("luz", {}), desc.get("ponto_focal", {})
        blocos.append(
            f"### `fotos/{nome}` ({id_})\n"
            f"- Original: {ativo['dimensoes']['largura']}×{ativo['dimensoes']['altura']} px; no pacote: {largura}×{altura} px. "
            f"Aguenta até ~{desc.get('largura_maxima_px', '?')} px de largura no ecrã.\n"
            f"- Assunto: {desc.get('assunto', '')}\n"
            f"- Onde está: {desc.get('onde_esta_o_assunto', '')}\n"
            f"- Ponto focal: {foco.get('x', 50)}% {foco.get('y', 50)}% (usa em object-position). Não cortar: {desc.get('zona_segura', '')}\n"
            f"- Luz: {luz.get('tipo', '')}, {luz.get('hora_aparente', '')}. "
            f"Qualidade {q.get('nota', '?')}/5 (nitidez {q.get('nitidez', '?')}, ruído {q.get('ruido', '?')}, {q.get('exposicao', '')}).\n"
            f"- Cores: {', '.join(desc.get('cores_dominantes', []))}\n"
        )
    # Um pacote refeito não deixa fotos antigas para trás: iriam aos construtores sem descrição.
    for antiga in pasta.iterdir():
        if antiga.is_file() and antiga.name not in usados:
            antiga.unlink()
    texto = "# Fotografias do pacote\n\n" + "\n".join(blocos)
    if blocos_regiao:
        texto += "\n## Região (fotos de terceiros, com crédito)\n\n" + "\n".join(blocos_regiao)
    (casa / "prototipos" / "fotos.md").write_text(texto, encoding="utf-8")
    folha_do_pacote(pasta, casa / "prototipos" / "folha-de-contacto.jpg")
    print(f"{len(ids)} fotografias em {pasta}, as descrições em prototipos/fotos.md e a folha em prototipos/folha-de-contacto.jpg")


def folha_do_pacote(pasta, saida):
    """Todas as fotos do pacote numa imagem, rotuladas com o ficheiro. Os
    construtores veem a cor e o ambiente numa só leitura, em vez de abrirem
    cada foto."""
    fotos = sorted(f for f in pasta.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
    celula, legenda, colunas = 300, 26, 5
    tela = Image.new("RGB", (colunas * celula, math.ceil(len(fotos) / colunas) * (celula + legenda)), "white")
    desenho, letra = ImageDraw.Draw(tela), fonte(15)
    for i, foto in enumerate(fotos):
        x, y = (i % colunas) * celula, (i // colunas) * (celula + legenda)
        with Image.open(foto) as img:
            img = ImageOps.exif_transpose(img).convert("RGB")
            img.thumbnail((celula - 8, celula - 8))
            tela.paste(img, (x + (celula - img.width) // 2, y + (celula - img.height) // 2))
        desenho.text((x + 6, y + celula + 2), foto.name, fill="black", font=letra)
    tela.save(saida, quality=78)


def inspiracao(casa, imagens):
    if not imagens:
        sair("Indica as imagens de inspiração.")
    pasta = casa / "prototipos" / "inspiracao"
    pasta.mkdir(parents=True, exist_ok=True)
    existentes = len(list(pasta.glob("inspiracao-*.jpg")))
    for i, origem in enumerate(imagens, start=existentes + 1):
        if not Path(origem).exists():
            sair(f"Não encontro a imagem: {origem}")
        guardar_reduzida(origem, pasta / f"inspiracao-{i}.jpg", lado=2000)
    print(f"{len(imagens)} inspirações em {pasta}")


def folha(casa, saida):
    dossie = casa / "dossie"
    ativos = [a for a in ler_json(dossie / "contrato.json", "o contrato").get("ativos", []) if a.get("uso") == "utilizavel"]
    celula, legenda, colunas = 320, 44, 5
    tela = Image.new("RGB", (colunas * celula, math.ceil(len(ativos) / colunas) * (celula + legenda)), "white")
    desenho, letra = ImageDraw.Draw(tela), fonte(15)
    for i, ativo in enumerate(ativos):
        x, y = (i % colunas) * celula, (i // colunas) * (celula + legenda)
        try:
            with Image.open(dossie / ativo["caminho"]) as img:
                img = ImageOps.exif_transpose(img).convert("RGB")
                img.thumbnail((celula - 8, celula - 8))
                tela.paste(img, (x + (celula - img.width) // 2, y + (celula - img.height) // 2))
        except OSError:
            desenho.text((x + 8, y + 8), "sem ficheiro", fill="red", font=letra)
        d = ativo.get("dimensoes", {})
        desenho.text((x + 6, y + celula + 2), ativo["id"], fill="black", font=letra)
        desenho.text((x + 6, y + celula + 22), f'{d.get("largura")}×{d.get("altura")}', fill="#555", font=letra)
    Path(saida).parent.mkdir(parents=True, exist_ok=True)
    tela.save(saida, quality=80)
    print(f"Folha com {len(ativos)} fotografias: {saida}")


def main():
    args = sys.argv[1:]
    if len(args) >= 2 and args[0] == "pacote":
        pacote(Path(args[1]), args[2:])
    elif len(args) >= 2 and args[0] == "inspiracao":
        inspiracao(Path(args[1]), args[2:])
    elif len(args) == 3 and args[0] == "folha":
        folha(Path(args[1]), args[2])
    else:
        sair(__doc__)


if __name__ == "__main__":
    main()
