# Execução do lote A — informação fiável

Data: 2026-09-21. Este registo fixa a referência anterior à migração dos
dossiês. Não altera os documentos nem as imagens das casas.

## Referência dos dossiês existentes

| Dossiê | Resultado | Avisos | Erros | Impressão digital | Ficheiros |
|---|---:|---:|---:|---|---:|
| Cerrado dos Outeirinhos | reprovado | 1 | 3 | `7c9b0335db0a661e80bae9da3e1e52a94599ade44061e4c224ea9e46d8ae78c2` | 132 |
| Casa de Fataunços | reprovado | 1 | 49 | `927c8f11f0781b38f129ca9498d67c3d5b1acada00d6fde2721603acd10ff980` | 85 |

Ambos são dossiês de legado, sem `contrato.json`; por isso não são equivalentes
a uma entrada aprovada para a construção.

- Cerrado: três citações de `pontos-fortes.md` não correspondem literalmente às
  reviews identificadas (`B-173`, `B-002`, `B-119`).
- Fataunços: faltam `site-pronto.md`, `quartos.md` e `dono.md`; as reviews não
  têm estrutura e cobertura declarada; os pontos fortes não declaram atualidade
  ou fotografias; e o índice de imagens diverge dos ficheiros no disco.

## Ferramentas e verificação

- Python 3.13, `jsonschema` 4.26.0 e Pillow 12.1.0.
- `python -m unittest discover -s .claude/skills/al-dossier/tests -v`: 21
  testes aprovados.
- `python -m py_compile` para os dois scripts: aprovado.
- `git diff --check`: sem problemas de espaços.

Os relatórios completos de referência foram gerados fora dos dossiês. Para
regenerar uma referência local, executar o validador com `--relatorio` e guardar
o resultado antes de qualquer migração.
