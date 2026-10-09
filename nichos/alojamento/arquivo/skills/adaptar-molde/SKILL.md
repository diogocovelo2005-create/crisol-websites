---
name: adaptar-molde
description: >
  Cria uma primeira proposta de landing page para um alojamento a partir do
  dossiê e da base técnica em nichos/alojamento/molde. Define o que apresentar
  pelas fotografias e pela experiência real da casa, com liberdade de composição.
  Usa para adaptar o molde, criar uma base ou transformar um dossiê num site.
---

# Uma proposta própria para cada casa

Entrega uma base convincente para o Diogo apresentar ao potencial cliente.
Não precisa de acabamento de produto final. Precisa de direção reconhecível,
fotografias que valorizem a casa, texto verdadeiro e contacto funcional.
Eficiência inclui o tempo de revisão do Diogo: assume a seleção de fotografias
e a direção criativa, sem lhe transferir essas decisões.

## Molde e protótipos

O molde é base técnica e exemplo de execução. Os protótipos são **apenas exemplos
opcionais**, não um menu a preencher nem a solução preferida por serem fáceis de
copiar. Não comeces pelo catálogo: decide primeiro o que esta casa merece mostrar.

Podes alterar toda a apresentação: secções, ordem, composição, modelo de dados,
tipografia, cores, imagens e animações. Podes criar componentes sem partir do
protótipo mais próximo. Não precisas de conservar Hero/Pilares/Atmosfera/Pico/
Espaços/Opiniões/Fecho, três momentos, horas ou gestos de animação.

Liberdade não obriga a inventar tudo. Reutiliza o que servir a proposta.
Trocar nomes, cores e fotos mantendo a mesma página não cumpre a diferenciação:
ela deve ser visível no conteúdo, na composição e no percurso, não só nos efeitos.

## Limites

- Só factos, contactos, citações e imagens sustentados pelo dossiê, respeitando
  condições e restrições. Nunca inventes experiências para preencher composições.
- Mantém legibilidade, acessibilidade, responsive e controlo do utilizador.
- Um exemplo aprovado foi validado no seu contexto, não nesta casa. Exemplos
  por avaliar ou rejeitados não são código validado: lê o motivo e não transportes
  os problemas conhecidos. Isso não impede criar uma solução própria.
- Não expandas além da landing page nem instales dependências sem necessidade.
  Não publiques; a entrega externa pertence a `site-delivery`.

## 1. Preparar e compreender

Lê [entrada-e-conteudo.md](references/entrada-e-conteudo.md). O script exige
dossiê validado e nunca substitui um site existente:

```bash
node nichos/alojamento/.claude/skills/adaptar-molde/scripts/novo-site.mjs <slug>
cd nichos/alojamento/casas/<slug>/site
npm run dev -- -p 3300
```

Para ensaios, aceita `--dossie <pasta> --destino <pasta-inexistente>`.

Lê contrato, `site-pronto.md`, resumo, voz, argumentos e inventário fotográfico.
Inspeciona visualmente as fotos antes de escolher a estrutura; usa folhas de
contacto para conjuntos grandes e abre as candidatas no tamanho de utilização.
Segue [selecao.md](references/selecao.md).

Se faltar material essencial, retoma a recolha direcionada com `al-dossier`,
preservando o existente e revalidando o contrato. Não transfiras essa pesquisa
para o Diogo. Se o material não existir, muda a proposta para o que consegues
sustentar e regista a limitação.

## 2. Decidir o que apresentar, depois como

Antes de consultar exemplos, regista brevemente em `ADAPTACAO.md` o argumento,
as imagens que o demonstram e o percurso proposto. Inclui um mapa curto das
imagens escolhidas e da origem. Lê [formas-de-contar.md](references/formas-de-contar.md)
para a experiência e [ordem.md](references/ordem.md) para o ritmo.

Consulta `nichos/alojamento/VARIACOES.md` e compara com bases recentes,
sobretudo de casas próximas. Se a mesma página sobreviver quase intacta à troca
de nome e imagens, revê a direção antes de investir em animações.
Não forces novidade gratuita nem construas várias páginas completas para decidir.

Só depois, se útil, consulta `molde/src/components/variantes/registo.ts` e exemplos
pertinentes. Usa-os, transforma-os ou ignora-os conforme a composição.
Não é obrigatório escolher códigos nem abrir `/catalogo`.

## 3. Construir

Monta a página e adapta os dados ao conteúdo necessário. `src/lib/casa.ts` é
ponto de partida, não schema editorial obrigatório. Atualiza `conteudo-fontes.json`
com os destinos reais dos campos e imagens. Material `citar`,
`inspiracao_editorial` ou `nao_usar` não se transforma em facto.
Transcreve opiniões fielmente; sem travessões longos na escrita própria visível.

Define identidade pelas fotografias e voz. Consulta [paleta.md](references/paleta.md)
e [fontes.md](references/fontes.md) ao trabalhar esses elementos.
Segue [ajustes.md](references/ajustes.md) para validação das alterações.
Resolve seleção, composição e clareza antes do movimento.

## 4. Criticar e verificar

Segue [verificar.md](references/verificar.md). Imagens pouco convidativas,
texto desligado da fotografia e repetição do molde são falhas, mesmo sem erros
técnicos. Percorre a página a 1440 × 900 e 390 × 844, com os estados das
interações que realmente existem, teclado, movimento reduzido, links e contraste.
Corrige problemas materiais; evita polimento sem efeito na apresentação.

## 5. Fechar

- Remove catálogo e código não utilizado da cópia do cliente.
- Corre lint, tipos e build. Marca `conteudo-fontes.json` como `pronto` e executa
  o verificador de [entrada-e-conteudo.md](references/entrada-e-conteudo.md).
- Regista direção e composição em `VARIACOES.md`, segundo
  [registo.md](references/registo.md); códigos são opcionais.
- Atualiza `ADAPTACAO.md` para a versão final, com verificações executadas e limites.

Entrega endereço local, direção, decisões principais e estado da verificação.
O entregável é uma base apresentável; publicar exige autorização.
