# Entrada validada e conteúdo rastreável

## Antes de criar a base

`novo-site.mjs` aceita apenas um dossiê com:

1. `contrato.json` no schema atual;
2. `validacao.json` com resultado aprovado;
3. impressão digital do relatório igual ao material atual;
4. prontidão `pronto_para_base` ou `com_limitacoes`.

Para testar a criação sem tocar numa casa existente, o comando aceita
`--dossie <pasta> --destino <pasta>`. Ambos os caminhos são explícitos, o
destino tem de não existir e a mesma validação é obrigatória.

Um dossiê de legado é material para migração, não uma entrada equivalente. O
script para antes de copiar o molde ou instalar dependências e explica o passo
em falta.

## `conteudo-fontes.json`

O script cria este ficheiro na raiz da base. É o mapa entre conteúdo final e o
contrato. Mantém-no atualizado durante a adaptação e só altera `estado` para
`pronto` depois da revisão final.

```json
{
  "schema_version": "1.0",
  "estado": "pronto",
  "contrato": {
    "slug": "casa-exemplo",
    "revisao": "2026-09-21",
    "impressao_digital_sha256": "<hash de validacao.json>"
  },
  "campos": [
    {"destino": "src/lib/casa.ts#casa.pilares[0]", "tipo": "factual", "fontes": ["AFIR-1"]},
    {"destino": "src/lib/casa.ts#casa.pico.intro", "tipo": "editorial", "fontes": ["AFIR-1", "CIT-1"]},
    {"destino": "src/lib/casa.ts#casa.opinioes[0]", "tipo": "citacao", "fontes": ["CIT-1"]}
  ],
  "ativos": [
    {"destino": "public/fotos/jardim.jpg", "ativo_id": "ATIVO-1"}
  ],
  "omissoes": [
    {"id": "AFIR-9", "motivo": "Conflito ativo sobre o pequeno-almoço."}
  ]
}
```

- Um campo `factual` só aponta para afirmações com uso `afirmar` ou
  `afirmar_com_condicao`; no segundo caso, preserva a condição no texto final.
- Um campo `citacao` aponta para uma `CIT-*` e conserva autor, plataforma e
  palavras originais.
- Um campo `editorial` identifica escrita própria. Quando contiver promessa
  factual, aponta para as afirmações ou citações que a sustentam.
- Uma imagem final aponta para um `ATIVO-*` utilizável. Não atribuas uma foto a
  uma unidade sem essa confirmação no contrato.
- Omissões registam material relevante que foi conscientemente deixado fora;
  não servem para justificar conteúdo do molde.

Antes de fechar, corre:

```bash
node nichos/alojamento/.claude/skills/adaptar-molde/scripts/verificar-conteudo-fontes.mjs nichos/alojamento/casas/<slug>/site nichos/alojamento/casas/<slug>/dossie
```

O verificador confirma novamente o dossiê, a impressão digital, IDs, permissões
de uso e ficheiros de imagem finais. Não confirma se a redação respeita uma
condição implícita: essa continua a ser uma revisão semântica obrigatória.
