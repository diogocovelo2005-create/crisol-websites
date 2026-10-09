# Execução do lote B — passagem completa

Data: 2026-09-21.

## Passagem do dossiê à base

- `novo-site.mjs` recusa `contrato.json` ausente, relatório ausente ou
  desatualizado e contrato bloqueado antes de copiar o molde ou instalar
  dependências.
- O diagnóstico de legado foi exercitado com Casa de Fataunços: a criação foi
  bloqueada com indicação explícita para migrar o dossiê.
- Uma base criada de uma entrada aprovada recebe `conteudo-fontes.json` em
  estado `em_construcao`, ligado ao slug, revisão e hash do contrato validado.
- O verificador só aceita estado `pronto` e confirma novamente a validade do
  dossiê, permissões de afirmações/citações, IDs, imagens finais e omissões.

## Recolha e síntese

`recolha-e-cobertura.md` passa a exigir inventário de superfícies, cobertura,
âmbito, filtros de pesquisas e tratamento uniforme de material do dono. As
referências de marketing, reviews e campos passam a separar associação
confirmada de semelhança, e a ligar argumentos e atritos a evidências/IDs.

## Verificação

- `node --test .claude/skills/adaptar-molde/tests/test_conteudo_fontes.mjs`:
  5 testes aprovados.
- `python -m unittest discover -s .claude/skills/al-dossier/tests -v`:
  21 testes aprovados.
- `node --check` nos dois scripts de adaptação e `git diff --check`: aprovados.

O lote não migrou Cerrado nem Fataunços e não alterou os respetivos sites. A
próxima migração deve começar por Cerrado, conforme o lote D do plano.
