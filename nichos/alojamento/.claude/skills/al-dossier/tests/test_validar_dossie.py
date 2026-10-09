"""Regressões do validador do dossiê.

Corre com:
    python -m unittest discover -s nichos/alojamento/.claude/skills/al-dossier/tests -v
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


AQUI = Path(__file__).resolve()
SKILL = AQUI.parents[1]
VALIDADOR = SKILL / "scripts" / "validar-dossie.py"
GERADOR = SKILL / "scripts" / "gerar-site-pronto.py"
OBRIGATORIOS = [
    "resumo.md", "pontos-fortes.md", "site-pronto.md", "descricao-al.md",
    "reviews.md", "factos.md", "quartos.md", "dono.md", "canais.md",
    "compliance.md", "fontes.md",
]


def base_legado(pasta: Path) -> None:
    for ficheiro in OBRIGATORIOS:
        (pasta / ficheiro).write_text(f"# {ficheiro}\nConteúdo confirmado para validação.\n", encoding="utf-8")
    (pasta / "reviews.md").write_text(
        "# Reviews\n\n"
        "| Plataforma | Prefixo | Recolhidas | Com texto | Total na plataforma |\n"
        "|---|---|---|---|---|\n"
        "| Booking | B | 1 | 1 | 1 |\n\n"
        "## Booking\n\n"
        "### B-001 · Rosa — 10/10 ★ citada\n"
        "Gostou:\n> Jardim muito bonito e silencioso.\n",
        encoding="utf-8",
    )
    (pasta / "pontos-fortes.md").write_text(
        "# Pontos\n\n## Pontos fortes\n\n### Jardim\n"
        "[INFERIDO] Força: uma review.\nAtual: sim, 2026.\nFotos: nenhuma.\n",
        encoding="utf-8",
    )
    (pasta / "quartos.md").write_text(
        "# Quartos\n\n| Tipo | Camas |\n|---|---|\n| Quarto Duplo | 1 casal |\n\n"
        "## Quarto Duplo\n"
        "[OFICIAL] Quarto com cama de casal, casa de banho privativa e janela para o jardim.\n",
        encoding="utf-8",
    )


def contrato_minimo() -> dict:
    return {
        "schema_version": "1.0",
        "manifesto": {"slug": "casa-teste", "revisao": "2026-09-21", "prontidao": "pronto_para_base"},
        "entidades": [{"id": "CASA-1", "tipo": "casa", "nome": "Casa Teste"}],
        "evidencias": [{"id": "EVID-1", "origem": "casa", "entidade_ids": ["CASA-1"], "local": "site próprio", "recolhido_em": "2026-09-21"}],
        "afirmacoes": [{"id": "AFIR-1", "entidade_id": "CASA-1", "texto": "Tem jardim.", "natureza": "facto", "categoria": "geral", "origem": "casa", "estado": "confirmado", "uso": "afirmar", "evidencia_ids": ["EVID-1"]}],
        "citacoes": [{"id": "CIT-1", "review_id": "B-001", "texto_original": "Jardim muito bonito e silencioso.", "autor": "Rosa", "plataforma": "Booking", "lingua": "pt"}],
        "ativos": [],
        "decisoes": [],
        "cobertura": [{"id": "COB-1", "fonte": "Booking", "material": "reviews", "estado": "completo_no_universo_observado", "observado": 1, "recolhido": 1}],
    }


class ValidarDossieTests(unittest.TestCase):
    def executar(self, pasta: Path, *opcoes: str):
        return subprocess.run([sys.executable, str(VALIDADOR), str(pasta), *opcoes], capture_output=True, text=True, encoding="utf-8")

    def gerar(self, pasta: Path):
        return subprocess.run([sys.executable, str(GERADOR), str(pasta)], capture_output=True, text=True, encoding="utf-8")

    def preparar(self):
        temporario = tempfile.TemporaryDirectory()
        pasta = Path(temporario.name)
        base_legado(pasta)
        self.addCleanup(temporario.cleanup)
        return pasta

    def test_legado_valido_passa_com_aviso_de_migracao(self):
        resultado = self.executar(self.preparar())
        self.assertEqual(resultado.returncode, 0, resultado.stdout)
        self.assertIn("contrato.json ausente", resultado.stdout)

    def test_ficheiros_obrigatorios_vazios_falham(self):
        pasta = self.preparar()
        for ficheiro in OBRIGATORIOS:
            (pasta / ficheiro).write_text("", encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("ficheiro vazio", resultado.stdout)

    def test_review_sem_tabela_de_contagens_falha(self):
        pasta = self.preparar()
        (pasta / "reviews.md").write_text("### B-001 · Rosa — 10/10\nTexto completo.\n", encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("tabela de contagens", resultado.stdout)

    def test_ausencia_confirmada_de_reviews_passa(self):
        pasta = self.preparar()
        (pasta / "reviews.md").write_text(
            "# Reviews\n\n| Plataforma | Prefixo | Recolhidas | Com texto | Total na plataforma |\n"
            "|---|---|---|---|---|\n| Booking | B | 0 | 0 | 0 |\n",
            encoding="utf-8",
        )
        contrato = contrato_minimo()
        contrato["citacoes"] = []
        contrato["cobertura"] = [{
            "id": "COB-1", "fonte": "Booking", "material": "reviews",
            "estado": "completo_no_universo_observado", "observado": 0, "recolhido": 0,
            "limitacao": "Não existiam reviews no universo observado.",
        }]
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertEqual(resultado.returncode, 0, resultado.stdout)

    def test_citacao_alterada_com_id_real_falha(self):
        pasta = self.preparar()
        (pasta / "site-pronto.md").write_text('[OPINIAO] "Piscina aquecida enorme." (B-001)\n', encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("não corresponde ao texto da review", resultado.stdout)

    def test_citacao_com_corte_explicito_e_literal_passa(self):
        pasta = self.preparar()
        (pasta / "site-pronto.md").write_text('[OPINIAO] "Jardim muito bonito […] silencioso." (B-001)\n', encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertEqual(resultado.returncode, 0, resultado.stdout)

    def test_nota_sobre_texto_truncado_fora_de_prova_passa(self):
        pasta = self.preparar()
        (pasta / "descricao-al.md").write_text(
            "# Descrição\n\nA expressão “Continuar a ler” identifica um botão observado na recolha.\n",
            encoding="utf-8",
        )
        resultado = self.executar(pasta)
        self.assertEqual(resultado.returncode, 0, resultado.stdout)

    def test_indice_de_foto_sem_pasta_falha(self):
        pasta = self.preparar()
        destino = pasta / "marketing"
        destino.mkdir()
        (destino / "fotos.md").write_text("| Ficheiro | Resolução |\n|---|---|\n| exterior/casa.jpg | 3000x2000 |\n", encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("falta a pasta", resultado.stdout)

    def test_ficha_de_quarto_vazia_falha(self):
        pasta = self.preparar()
        (pasta / "quartos.md").write_text("| Tipo | Camas |\n|---|---|\n| Quarto Duplo | 1 casal |\n\n## Quarto Duplo\n", encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("ficha 'Quarto Duplo' está vazia", resultado.stdout)

    def test_ids_de_reviews_duplicados_falham(self):
        pasta = self.preparar()
        (pasta / "reviews.md").write_text(
            "| Plataforma | Prefixo | Recolhidas | Com texto | Total na plataforma |\n|---|---|---|---|---|\n| Booking | B | 2 | 2 | 2 |\n\n"
            "### B-001 · Rosa — 10/10\nPrimeira.\n\n### B-001 · Manuel — 9/10\nSegunda.\n",
            encoding="utf-8",
        )
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("ID duplicado B-001", resultado.stdout)

    def test_contrato_valido_passa(self):
        pasta = self.preparar()
        (pasta / "contrato.json").write_text(json.dumps(contrato_minimo(), ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertEqual(resultado.returncode, 0, resultado.stdout)

    def test_gera_vista_deterministica_do_contrato(self):
        pasta = self.preparar()
        contrato = contrato_minimo()
        contrato["afirmacoes"].append({
            "id": "AFIR-2", "entidade_id": "CASA-1", "texto": "Pequeno-almoço incluído.",
            "natureza": "facto", "categoria": "tarifa", "origem": "casa", "estado": "confirmado",
            "uso": "afirmar_com_condicao", "condicao": "Apenas na tarifa X.",
            "ambito": {"tarifa": "X"}, "evidencia_ids": ["EVID-1"],
        })
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.gerar(pasta)
        vista = (pasta / "site-pronto.md").read_text(encoding="utf-8")
        self.assertEqual(resultado.returncode, 0, resultado.stdout)
        self.assertIn("Vista gerada de `contrato.json`", vista)
        self.assertIn("Pequeno-almoço incluído.", vista)
        self.assertIn("Apenas na tarifa X.", vista)

    def test_gerador_restaura_vista_se_contrato_for_invalido(self):
        pasta = self.preparar()
        anterior = (pasta / "site-pronto.md").read_text(encoding="utf-8")
        contrato = contrato_minimo()
        contrato["afirmacoes"][0]["estado"] = "conflitante"
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.gerar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertEqual((pasta / "site-pronto.md").read_text(encoding="utf-8"), anterior)

    def test_relatorio_tem_impressao_digital_do_material_validado(self):
        pasta = self.preparar()
        relatorio = pasta / "validacao.json"
        resultado = self.executar(pasta, "--relatorio", str(relatorio))
        dados = json.loads(relatorio.read_text(encoding="utf-8"))
        self.assertEqual(resultado.returncode, 0, resultado.stdout)
        self.assertEqual(dados["resultado"], "aprovado")
        self.assertIn("sha256", dados["impressao_digital"])
        self.assertTrue(dados["impressao_digital"]["ficheiros"])

    def test_relatorio_desatualizado_nao_passa(self):
        pasta = self.preparar()
        relatorio = pasta / "validacao.json"
        self.assertEqual(self.executar(pasta, "--relatorio", str(relatorio)).returncode, 0)
        (pasta / "factos.md").write_text("# factos\nConteúdo alterado depois da validação.\n", encoding="utf-8")
        resultado = self.executar(pasta, "--verificar-relatorio", str(relatorio))
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("relatório de validação desatualizado", resultado.stdout)

    def test_contrato_bloqueia_afirmacao_conflitante(self):
        pasta = self.preparar()
        contrato = contrato_minimo()
        contrato["afirmacoes"][0]["estado"] = "conflitante"
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("só pode usar 'afirmar' com estado confirmado", resultado.stdout)

    def test_contrato_bloqueia_testemunho_transformado_em_facto(self):
        pasta = self.preparar()
        contrato = contrato_minimo()
        contrato["afirmacoes"][0]["natureza"] = "testemunho"
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("não pode transformar testemunho", resultado.stdout)

    def test_decisao_ativa_de_retirar_impede_afirmacao_utilizavel(self):
        pasta = self.preparar()
        contrato = contrato_minimo()
        contrato["decisoes"].append({
            "id": "DEC-1", "estado": "ativa", "efeito": "bloquear_uso",
            "texto": "Retirar a promessa do jardim.", "decidido_em": "2026-09-21",
            "afetados": ["AFIR-1"],
        })
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("decisão ativa DEC-1 bloqueia AFIR-1", resultado.stdout)

    def test_tarifa_sem_condicao_e_ambito_falha(self):
        pasta = self.preparar()
        contrato = contrato_minimo()
        contrato["afirmacoes"][0]["categoria"] = "tarifa"
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("é tarifa e exige uso 'afirmar_com_condicao' com âmbito", resultado.stdout)

    def test_contrato_com_dimensoes_de_ativo_erradas_falha(self):
        pasta = self.preparar()
        fotos = pasta / "marketing" / "fotos"
        fotos.mkdir(parents=True)
        Image.new("RGB", (30, 20), "white").save(fotos / "casa.png")
        (pasta / "marketing" / "fotos.md").write_text(
            "| Ficheiro | Resolução |\n|---|---|\n| casa.png | 30x20 |\n", encoding="utf-8"
        )
        contrato = contrato_minimo()
        contrato["ativos"].append({
            "id": "ATIVO-1", "caminho": "marketing/fotos/casa.png",
            "dimensoes": {"largura": 20, "altura": 30}, "assunto": "Casa",
            "publicador": "casa", "uso": "utilizavel", "restricoes": [],
        })
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertNotEqual(resultado.returncode, 0)
        self.assertIn("ativo ATIVO-1 diz 20×30, o ficheiro tem 30×20", resultado.stdout)

    def test_ativo_generico_sem_unidade_confirmada_passa(self):
        pasta = self.preparar()
        fotos = pasta / "marketing" / "fotos"
        fotos.mkdir(parents=True)
        Image.new("RGB", (30, 20), "white").save(fotos / "casa.png")
        (pasta / "marketing" / "fotos.md").write_text(
            "| Ficheiro | Resolução |\n|---|---|\n| casa.png | 30x20 |\n", encoding="utf-8"
        )
        contrato = contrato_minimo()
        contrato["ativos"].append({
            "id": "ATIVO-1", "caminho": "marketing/fotos/casa.png",
            "dimensoes": {"largura": 30, "altura": 20}, "assunto": "Ambiente da casa",
            "publicador": "dono", "uso": "utilizavel", "restricoes": [],
        })
        (pasta / "contrato.json").write_text(json.dumps(contrato, ensure_ascii=False), encoding="utf-8")
        resultado = self.executar(pasta)
        self.assertEqual(resultado.returncode, 0, resultado.stdout)


if __name__ == "__main__":
    unittest.main()
