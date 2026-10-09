# Migrar um dossiê legado

Uma base nova só consome `contrato.json`, `site-pronto.md` gerado e
`validacao.json` atual. Um dossiê antigo continua a ser prova de trabalho
anterior, mas não é uma entrada equivalente.

## Percurso seguro

1. Copia o dossiê para uma área de trabalho fora de `casas/<slug>/site`.
2. Lê primeiro `dono.md`, `fontes.md`, `factos.md`, `quartos.md`, `reviews.md`
   e `marketing/fotos.md`; preserva caminhos e não elimina material histórico.
3. Cria `contrato.json` a partir de provas existentes. Declara conflitos,
   lacunas e restrições como `nao_usar`; não as resolve por inferência.
4. Dá IDs estáveis às reviews e corrige índices de imagens apenas com a
   resolução real dos ficheiros.
5. Gera a vista e o relatório no candidato:

```bash
python .claude/skills/al-dossier/scripts/gerar-site-pronto.py <dossie-candidato>
python .claude/skills/al-dossier/scripts/validar-dossie.py <dossie-candidato> --relatorio <dossie-candidato>/validacao.json
python .claude/skills/al-dossier/scripts/validar-dossie.py <dossie-candidato> --verificar-relatorio <dossie-candidato>/validacao.json
```

6. Só depois substitui os documentos planeados no dossiê ativo, conserva uma
   referência anterior fora do conjunto ativo e repete os três comandos no
   destino final.

Para confirmar que a criar-base aceita o dossiê, sem gastar nada nem criar
ficheiros, usa:

```bash
node .claude/skills/criar-base/scripts/fotos-por-descrever.mjs casas/<slug>
```

O comando só lê: falha se o dossiê não estiver aprovado, e lista as fotos
utilizáveis que ainda faltam descrever.
