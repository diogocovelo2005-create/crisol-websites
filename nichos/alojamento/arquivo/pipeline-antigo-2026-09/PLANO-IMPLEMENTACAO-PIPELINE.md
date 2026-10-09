# Plano de implementação do pipeline de alojamento

Data: 21 de setembro de 2026.

Estado: **planeado; implementação por iniciar**.

Base: [auditoria do al-dossier e da adaptação](AUDITORIA-AL-DOSSIER.md).

## 1. Objetivo e resultado esperado

Transformar a sequência `al-dossier → adaptar-molde → base local` num processo que entregue uma primeira proposta com informação rastreável, narrativa específica e componentes verificados, reduzindo as correções factuais, editoriais repetitivas e técnicas do Diogo.

Ao terminar:

- o dossiê distingue evidência, interpretação e conteúdo utilizável;
- cada afirmação utilizável tem prova, âmbito, estado e condições;
- cada imagem tem origem, assunto, associações confirmadas e restrições;
- a adaptação recebe um contrato validado antes de escrever;
- o site preserva as condições da informação e permite rastrear o que foi usado;
- decisões recebidas durante a construção regressam ao registo da casa;
- as correções técnicas transversais beneficiam a próxima casa;
- as intervenções posteriores são registadas por causa para medir o resultado.

O trabalho inclui as duas skills ativas, os seus scripts, o modelo de conteúdo, componentes relevantes do molde e migração dos dois dossiês de referência. A validação de sites será local; publicação e alteração dos sites existentes não fazem parte deste plano.

## 2. Decisões de desenho

### 2.1. Preservar o que já funciona

Manter recolha ampla, reviews completas acessíveis, voz da casa, análise de argumentos e atritos, arquivo de textos, inventário de fotografias e organização por casa. O `al-dossier` continua sem escrever a copy final nem escolher o layout.

### 2.2. Acrescentar um contrato pequeno e verificável

Criar `dossie/contrato.json`, versionado, para a passagem à construção. Começar pelos elementos utilizados ou candidatos a utilização no site, pelas restrições e pelas respetivas provas. O corpus completo permanece nos documentos existentes; não é necessário converter milhares de reviews para avançar.

`site-pronto.md` será uma vista gerada desse contrato. As partes factuais repetidas no resumo, quartos e canais serão geradas ou referenciadas por ID. As partes editoriais mantêm redação humana/agente, mas têm de apontar para afirmações e provas existentes.

**Regra:** nenhuma informação operacional terá duas versões independentes mantidas manualmente.

### 2.3. Distinguir estados e funções

Separar:

- origem: casa, dono, hóspede, plataforma, registo público ou terceiro;
- natureza: facto, testemunho, promessa subjetiva, métrica ou inferência;
- estado: confirmado, conflitante, desconhecido, histórico, substituído ou retirado;
- uso: afirmar, afirmar com condição, citar, inspiração editorial ou não usar;
- âmbito: casa, unidade, espaço, tarifa, ocupação, datas e estação;
- datas: recolha, publicação/estadia, confirmação e validade conhecida.

Uma instrução do Diogo sobre estilo não confirma um facto. Uma confirmação do dono não autoriza o agente a apagar silenciosamente provas contraditórias: a resolução fica documentada. Uma nova decisão explícita pode substituir uma restrição anterior, preservando o histórico.

### 2.4. Ter alternativas seguras

Ausência de reviews permite omitir Opiniões. Ausência de foto atribuível permite uma galeria geral. Ausência de WhatsApp permite telefone/email. Falta de um facto pode resultar na sua omissão.

Um bloqueio afeta primeiro a afirmação, imagem ou secção correspondente. Só bloqueia toda a construção quando impede o objetivo da base, por exemplo por identidade incerta ou falta de qualquer ação final verificada.

### 2.5. Implementar sem criar mais trabalho de aprovação

O agente faz autonomamente a revisão editorial, factual e técnica prevista. Perguntas ao Diogo ficam reservadas para informação essencial que não se consiga obter ou decisões que dependam dele. Preferências documentadas são aplicadas no âmbito em que foram expressas; não se inventam regras gerais a partir de um pedido isolado.

## 3. Sequência e dependências

| Fase | Entrega | Depende de | Concluída quando |
|---|---|---|---|
| 0 | Referência inicial e casos de regressão | Auditoria | Estado atual e falhas reproduzíveis preservados |
| 1 | Contrato v1 e regras coerentes | 0 | Formato e decisões cobrem os casos reais sem ambiguidades |
| 2 | Validação e geração de documentos | 1 | Casos inválidos falham e lacunas legítimas são representadas corretamente |
| 3 | Recolha e síntese adaptadas ao contrato | 1 e 2 | O produtor consegue entregar o pacote completo e declarar cobertura real |
| 4 | Adaptação consome e respeita o contrato | 2 e 3 | Uma entrada inválida não cria site; uma entrada válida tem conteúdo rastreável |
| 5 | Molde tolera os dados reais e incorpora correções | 1 e 4 | Contactos, avaliações, conteúdo e mobile passam nos casos definidos |
| 6 | Migração e ensaio nos dois casos existentes | 3, 4 e 5 | Cerrado e Fataunços têm contratos revistos e percursos ensaiados localmente |
| 7 | Ativação e medição numa casa nova | 6 | Nova base é produzida pelo percurso completo e há registo da primeira proposta |

As fases são lotes sequenciais de implementação e revisão. Não pressupõem trabalho de subagentes nem alterações simultâneas nos mesmos ficheiros.

## 4. Fase 0: preservar a referência e os problemas conhecidos

### Tarefas

- [x] Confirmar o estado do repositório e preservar alterações existentes; não fazer staging global de trabalho anterior.
- [x] Guardar resultados dos validadores dos dois dossiês, com data e versão/hash dos ficheiros relevantes.
- [x] Registar as falhas observadas na auditoria como casos de regressão pequenos e reproduzíveis.
- [x] Preservar uma referência dos textos/índices e decisões anteriores antes da migração, sem duplicar desnecessariamente todas as imagens.
- [x] Separar regras históricas das skills e comportamento atual: não reintroduzir limites de ajustes já retirados.

### Casos mínimos

1. Ficheiros obrigatórios vazios.
2. Review sem tabela/declaração de cobertura.
3. Citação alterada ou inventada com ID real.
4. Fotografia indexada que não existe, mesmo sem pasta de imagens.
5. Ficha de quarto vazia apesar de ter título.
6. IDs de reviews duplicados.
7. Afirmação simultaneamente autorizada e conflitante.
8. Informação retirada durante a adaptação que regressa num resumo antigo.

### Critério de conclusão

Os casos demonstram o problema original, com resultado esperado definido. A referência permite comparar a migração e recuperar o estado anterior dos documentos.

## 5. Fase 1: definir o contrato v1 e resolver as regras incompatíveis

### Ficheiros

Alterar:

- `.claude/skills/al-dossier/SKILL.md`
- `.claude/skills/al-dossier/references/proveniencia.md`
- `.claude/skills/al-dossier/references/campos.md`
- `.claude/skills/al-dossier/references/identidade.md`

Criar:

- `.claude/skills/al-dossier/references/contrato.md`
- `.claude/skills/al-dossier/schemas/contrato.schema.json`
- exemplos mínimos válidos e inválidos junto dos testes da skill.

### Conteúdo do contrato

| Grupo | Conteúdo mínimo |
|---|---|
| Manifesto | Versão do schema, slug, revisão do dossiê, data, âmbito demonstração/publicação |
| Entidades | Casa, unidades/tipos, espaços e tarifas relevantes, com IDs estáveis |
| Fontes/evidências | Fonte identificada, URL/bloco ou prova local, excerto e datas; relação com a entidade |
| Afirmações | Proposição única, natureza, estado, uso, âmbito, evidências e condições |
| Citações selecionadas | Review de origem, excerto literal, autor, plataforma, data, língua e eventual tradução identificada |
| Ativos visuais | ID, caminho, dimensões, assunto, origem, unidade confirmada ou desconhecida, restrições e derivação |
| Canais e métricas | Ação de reserva/contacto, destino, escala/fonte/data das avaliações |
| Argumentos | Evidências e contagens referenciadas, relevância, contrapontos e fotos candidatas |
| Restrições/decisões | Quem decidiu, quando, origem, entidades afetadas e eventual decisão substituída |
| Cobertura e lacunas | Fontes percorridas, limites, faltas, impacto e alternativa segura |

### Regras a fechar

- [x] Resolver a taxonomia que mistura origem com certeza e incluir registos públicos/terceiros.
- [x] Definir quando uma afirmação pode ser usada com uma única fonte adequada; impedir que repetição de opiniões se transforme automaticamente em facto.
- [x] Separar inventário de disponibilidade e condições da tarifa de políticas gerais.
- [x] Distinguir data de recolha de confirmação atual; definir critérios de revisão por classe de informação, com exemplos concretos.
- [x] Registar desconhecidos explicitamente; não usar strings vazias como substituto de estado.
- [x] Manter IDs em novas recolhas e relações entre versões substituídas.
- [x] Definir precedência: uma restrição ativa impede uso; um conflito não resolvido impede afirmar sem condição; uma decisão nova explícita pode substituir a anterior com registo.
- [x] Declarar que `site-pronto.md` é gerado e não constitui uma segunda fonte de verdade editável.

### Critério de conclusão

Os exemplos incluem: casa com pouca informação, foto só do dono, tarifa com pequeno-almoço, quarto sem foto confirmada, fonte bloqueada, review traduzida e decisão posteriormente alterada. Cada caso tem uma utilização inequívoca.

## 6. Fase 2: implementar validação e geração

### Ficheiros

Alterar:

- `.claude/skills/al-dossier/scripts/validar-dossie.py`

Criar:

- `.claude/skills/al-dossier/scripts/gerar-site-pronto.py`
- `.claude/skills/al-dossier/tests/`, com fixtures pequenas e testes de regressão;
- declaração de dependências de tooling da skill, incluindo validação JSON Schema e leitura de imagens quando necessárias.

Manter os scripts em Python, junto do validador atual. A validação JSON Schema deve usar uma biblioteca declarada, sem reproduzir parcialmente a especificação num validador improvisado. Falta de uma dependência necessária produz erro de ambiente claro; nunca sucesso com uma verificação obrigatória silenciosamente omitida.

### Tarefas

- [x] Validar estrutura, campos obrigatórios, tipos e enumerações do contrato.
- [x] Validar IDs únicos e todas as referências cruzadas.
- [x] Detetar ficheiros vazios, ilegíveis e entradas obrigatórias sem conteúdo nem ausência justificada.
- [x] Validar as citações selecionadas contra os originais. Permitir apenas normalização de espaços/quebras para comparação; cortes têm de preservar segmentos e ordem; tradução não passa pelo teste de correspondência literal.
- [x] Distinguir corpus sem reviews confirmado de recolha não efetuada. Ambos podem ser representados; só o segundo é lacuna de recolha.
- [x] Calcular contagens a partir de IDs e grupos de duplicados confirmados, mantendo o universo e as escalas.
- [x] Validar caminhos, legibilidade, dimensões, imagens retiradas e referências a ficheiros de prova.
- [x] Bloquear relações incompatíveis: facto conflitante autorizado, ativo retirado utilizável, preço sem condições, citação sem autor/origem.
- [x] Gerar `site-pronto.md` de forma determinística, incluindo condições, proibições e lacunas.
- [x] Produzir `validacao.json` com erros/avisos, verificações executadas e impressão digital do contrato e dependências relevantes.
- [x] Invalidar o relatório se o material validado mudar. A indicação manual de “pronto” não substitui verificação atual.
- [x] Separar resultado mecânico de revisão semântica. O script não certifica a veracidade da fonte nem a interpretação da imagem.

### Testes positivos adicionais

- Dossiê pequeno com ausência justificada de reviews passa para uma base sem Opiniões.
- Não ter Instagram não impede usar fontes suficientes já confirmadas.
- Foto genérica de quarto pode ser usada sem atribuição a uma unidade.
- Telefone confirmado funciona mesmo sem WhatsApp ou email.
- Citação literal com corte explícito passa; palavras acrescentadas falham.
- Uma nota sobre “Continuar a ler” fora do texto de uma review não é tratada automaticamente como truncagem.

### Critério de conclusão

Todos os casos negativos falham pelo motivo certo, os positivos passam e a geração não altera o estado das afirmações. Alterar uma restrição invalida a validação anterior.

## 7. Fase 3: melhorar a recolha, o inventário e a síntese editorial

### Ficheiros

Alterar as referências `marketing.md`, `mineracao-reviews.md`, `campos.md` e o percurso principal do `al-dossier`.

### Recolha

- [x] Reaproveitar nome, localização, links e preferências já fornecidos; perguntar só pelo que falta.
- [x] Localizar e indexar material do dono com a mesma disciplina do material recolhido.
- [x] Confirmar entidade e âmbito de cada anúncio, incluindo casa inteira versus quartos.
- [x] Inventariar páginas, galerias e unidades a percorrer antes da recolha.
- [x] Registar cobertura por fonte/material: completo no universo observado, parcial, bloqueado, não encontrado ou não aplicável.
- [x] Preservar filtros, datas e ocupações das pesquisas comerciais, incluindo idades quando relevantes.
- [x] Documentar tentativas e alternativas em fontes bloqueadas; não confundir indisponibilidade numa data com inexistência de uma unidade.

### Fotografias

- [x] Separar sempre propriedade, unidade, região e marca, independentemente do número de imagens.
- [x] Retirar a exclusividade de galeria como critério suficiente de atribuição confirmada.
- [x] Separar publicação, autoria fotográfica e estado de utilização.
- [x] Preservar originais e derivação dos ficheiros tratados; medir a resolução real.
- [x] Associar imagens relacionadas, como pares do mesmo enquadramento, sem pressupor correspondência só pelo nome.
- [x] Registar possibilidades de uso em desktop/mobile e restrições de recorte; evitar um veto universal a interiores ou verticais no hero.
- [x] Conciliar total observado, ficheiros únicos, duplicados e material inacessível.

### Síntese editorial

- [x] Ligar cada contagem de argumento/atrito aos IDs efetivamente analisados.
- [x] Separar frequência, intensidade, especificidade, atualidade e relevância para a decisão.
- [x] Analisar elogios e queixas independentemente da nota global da review.
- [x] Distinguir duplicado confirmado de suspeita de semelhança.
- [x] Entregar uma ficha curta: promessa sustentada, argumentos prioritários, detalhes distintivos, voz, material visual e promessas a evitar.
- [x] Acrescentar exemplos aceites/rejeitados e preferências documentadas com âmbito geral ou específico da casa.
- [x] Permitir pouco conteúdo quando é o que a evidência sustenta; não obrigar a inventar três momentos ou oito espaços.

### Critério de conclusão

Uma execução de recolha consegue produzir o contrato e explicar todas as faltas relevantes. O resumo não promove informação bloqueada, e o construtor identifica os argumentos e materiais utilizáveis sem reler todo o corpus.

## 8. Fase 4: ligar o contrato à construção e fechar o ciclo de decisões

### Ficheiros

Alterar:

- `.claude/skills/adaptar-molde/SKILL.md`
- `.claude/skills/adaptar-molde/scripts/novo-site.mjs`
- referências `selecao.md`, `formas-de-contar.md`, `ordem.md`, `verificar.md` e `registo.md`

Criar:

- `.claude/skills/adaptar-molde/references/entrada-e-conteudo.md`
- formato documentado de `site/conteudo-fontes.json`;
- verificação de integridade desse mapa, reutilizando a leitura do contrato.

### Antes de construir

- [x] `novo-site.mjs` verifica contrato e estado de validação antes de copiar ficheiros ou instalar dependências.
- [x] Falha de entrada devolve erros acionáveis e não deixa um site parcialmente criado.
- [x] Dossiê antigo recebe diagnóstico de migração; nunca é apresentado como equivalente a contrato validado.
- [x] Ordem de leitura: resumo e restrições → `site-pronto.md` → argumentos → imagens/unidades/provas necessárias.
- [x] Rever autonomamente a composição: diferenciais presentes, redundâncias, material suficiente e ação de reserva/contacto clara.

### Durante a construção

- [x] Mapear campos factuais e imagens utilizados para IDs em `conteudo-fontes.json`; incluir revisão do contrato, condições e omissões deliberadas.
- [x] Identificar texto editorial como tal, com referências às afirmações que o sustentam quando contém promessas factuais.
- [x] Registar derivação entre ativos do dossiê e imagens finais em `public/fotos/`.
- [x] Não preencher ausência com o conteúdo fictício do molde.
- [x] Se uma variante não suporta o conteúdo, adaptar ou escolher outra; não reinterpretar o facto para caber.
- [x] Priorizar cortar redundância antes de diminuir o texto para caber num palco fixo.

### Depois de construir

- [x] Conferir texto efetivamente renderizado, citações, imagens, links, alt text e metadados relevantes contra o contrato.
- [x] Verificar o mapa automaticamente e rever semanticamente condições e promessas implícitas; a existência de um ID não prova que o texto o respeita.
- [x] Registar decisões novas no contrato/`dono.md`, com data e fonte. Se alteram permissões, regenerar a vista e revalidar o conteúdo afetado.
- [x] Atualizar `ADAPTACAO.md` com direção, decisões, limitações e resultados, mantendo-o curto e distinguindo estado atual de histórico.

### Critério de conclusão

Uma alteração numa restrição identifica os campos/imagens afetados. Um dossiê inválido não inicia uma base. Um pedido de estilo não passa a confirmação factual. As decisões tomadas durante a adaptação chegam ao agente da próxima execução.

## 9. Fase 5: corrigir o modelo de conteúdo e o molde

Antes de implementar nesta pasta, ler o `AGENTS.md` e a documentação local indicada para a versão instalada do framework. Correções dos sites anteriores são referências a adaptar, não blocos para copiar sem verificar.

### Ficheiros principais

- `molde/src/lib/casa.ts` e tipo explícito de conteúdo a extrair desse exemplo;
- `molde/src/components/seccoes/Provas.tsx`;
- variantes de Fecho: `Cortina.tsx`, `Moldura.tsx`, `Portadas.tsx`, `Postal.tsx`;
- `molde/src/components/variantes/espacos/Indice.tsx`;
- `molde/src/components/variantes/registo.ts`;
- `molde/src/lib/useProgresso.ts` e componentes Hero/Pico/Fecho afetados;
- ferramentas existentes de imagens e de vistoria, conforme necessário.

### Modelo e componentes

- [x] Contactos opcionais e ações tipadas: telefone, email, WhatsApp confirmado, reserva ou pedido de disponibilidade.
- [x] Registo com tipo e número, sem pressupor RNAL para todas as casas.
- [x] Avaliações com média, escala, plataforma, total e data; sem cinco estrelas fixas para qualquer origem.
- [x] Estado sem reviews e omissão de canais desconhecidos tratados sem conteúdo fictício nem falha de renderização.
- [x] Catálogo declara campos renderizados, imagens necessárias, número de itens suportado e comportamento mobile.
- [x] Texto importante não desaparece porque a variante ignora um campo: renderizar, relocalizar ou registar omissão deliberada.

### Comportamento e imagens

- [x] Rever correções de altura útil e de medição de scroll já documentadas nos dois sites.
- [x] Testar efeitos em todas as variantes que dependem da medição partilhada; não aplicar uma regra global de `resize` sem confirmar orientação, carregamento de imagens e mudanças reais de layout.
- [x] Verificar começo, meio, fim, regresso, âncoras e refresh das secções interativas.
- [x] Verificar maior citação, maior título e maior número de itens suportado nos estados relevantes.
- [x] Corrigir recortes e CTA sobre a imagem real; preservar os originais.
- [x] Manter movimento reduzido, teclado e controlos utilizáveis.

### Verificação técnica

Executar lint, tipos e build, além do percurso no browser. A seleção de tamanhos inclui desktop, mobile, alturas curtas e limites onde o layout muda. Repetir checks apenas após mudanças que os possam afetar.

Comportamentos da barra do browser móvel devem ser verificados em dispositivo real quando disponível. Emulação não será declarada como prova equivalente. O registo identifica o que ficou por confirmar, sem impedir os restantes testes locais.

### Critério de conclusão

Os componentes aceitam os dados reais dos casos de referência sem pressupor WhatsApp, estrelas ou campos fictícios. As correções técnicas escolhidas têm verificação registada e não exigem a mesma intervenção na próxima cópia do molde.

## 10. Fase 6: migrar e ensaiar Cerrado e Fataunços

### Estratégia de migração

1. Preparar contratos candidatos numa área de trabalho separada, preservando os documentos originais e caminhos das fotos.
2. Migrar apenas o que a evidência local sustenta. Não preencher provas ou confirmações ausentes para obter um resultado verde.
3. Distinguir conflito real de diferenças de âmbito, como tipo comercial versus classificação do registo.
4. Gerar as novas vistas, comparar com o material anterior e produzir lista das alterações/pendências.
5. Depois de validado o conjunto candidato, substituir apenas os documentos planeados de forma controlada, conservando a referência anterior fora do conjunto ativo.
6. Repetir a validação no destino final. Uma interrupção não deve deixar contrato de uma revisão e vista de outra.

### Primeiro: Cerrado dos Outeirinhos

- [x] Separar o total de unidades da classificação de suites e do inventário inferido da disponibilidade.
- [x] Tratar voucher sem confirmação temporal, autoria atual dos doces e menções isoladas.
- [x] Impedir atribuição automática da foto da casa de banho à Suite Eira; preservar a dúvida até haver prova suficiente.
- [x] Registar Instagram/Facebook/detalhe de suite inacessíveis e respetivo impacto.
- [x] Recuperar decisões documentadas da adaptação, separando direção visual de confirmação factual.
- [x] Usar o conteúdo existente como referência para identificar violações e omissões, sem alterar o site atual.

### Depois: Casa de Fataunços

- [x] Criar `site-pronto.md`, `quartos.md` e `dono.md` a partir das provas existentes; declarar explicitamente fichas incompletas.
- [x] Atribuir IDs estáveis às reviews e reparar as ligações utilizadas na síntese.
- [x] Registar a decisão final sobre os pianos e impedir que o resumo volte a prometer concertos.
- [x] Conciliar fotografias, caminhos, dimensões e versões derivadas; não presumir que originais ausentes podem ser recuperados.
- [x] Preservar pedidos de retirada do dono e a evolução documentada das fontes de imagens permitidas.
- [x] Atualizar contagens e argumentos cujo cálculo não seja rastreável, sem fabricar precisão.

### Ensaio de construção

Preparar um percurso de teste isolado que use o mesmo código de criação/validação e grave o resultado numa pasta temporária controlada. Os caminhos de origem e destino são verificados antes de operações de cópia ou limpeza. Não contornar os checks para facilitar o ensaio e não reutilizar a pasta dos sites existentes.

Ensaiar pelo menos:

- entrada válida com material suficiente;
- base possível com limitações assumidas;
- identidade sem confirmação suficiente;
- zero reviews utilizáveis;
- fotos apenas do dono;
- Booking inacessível;
- alteração posterior de uma restrição.

### Critério de conclusão

Os dois dossiês estão migrados com pendências honestas e as inconsistências conhecidas resolvidas ou bloqueadas. O ensaio mostra que o consumidor respeita esses estados. Os sites existentes permanecem intactos.

## 11. Fase 7: ativar e medir numa casa nova

### Ativação

- [x] Tornar a validação v1 obrigatória para novas bases depois da migração e dos ensaios.
- [x] Documentar o comando de diagnóstico/migração para dossiês antigos.
- [x] Atualizar as instruções de entrada do nicho e remover instruções concorrentes ou desatualizadas nos ficheiros ativos.
- [x] Manter a skill principal curta, com ligações para contratos, exemplos e verificações específicas.

### Avaliação real

Usar a próxima casa identificada no fluxo de trabalho; não inventar um cliente nem escolher uma fonte ambígua para completar a avaliação. A infraestrutura pode ficar concluída antes de esse caso existir, mas a validação numa casa nova continuará marcada como pendente.

Guardar a primeira proposta antes das alterações posteriores e registar:

| Métrica | Como medir |
|---|---|
| Rastreabilidade factual | Afirmações finais verificadas e ligadas a provas / afirmações factuais finais |
| Violações do contrato | Afirmações bloqueadas, condições perdidas ou imagens atribuídas sem prova que chegaram à base |
| Fidelidade de citações | Excertos incorretos ou traduções apresentadas como originais |
| Herança do molde | Contactos, links, nomes e outros dados fictícios que permaneceram |
| Cobertura | Material recolhido dentro do universo observado e faltas com motivo |
| Trabalho do construtor | Tempo de procura/reinterpretação e pedidos de informação que o dossiê deveria conter |
| Intervenção do Diogo | Correções separadas entre facto, recolha, editorial, UX, bug, material novo e expansão do pedido |

Metas iniciais: todas as afirmações factuais publicadas na base com rastreabilidade; nenhuma violação conhecida dos bloqueios; nenhuma citação inventada; nenhuma atribuição de quarto sem prova; nenhum contacto fictício. Não converter estas metas numa promessa de verdade externa absoluta.

## 12. Lotes de entrega e prioridades

| Lote | Conteúdo | Ganho imediato |
|---|---|---|
| A. Informação fiável | Fases 0, 1 e 2 | Impede falsos sucessos de validação e define como a informação pode ser usada |
| B. Passagem completa | Fases 3 e 4 | Reduz recolhas incompletas, interpretação repetida e perda de decisões |
| C. Base reutilizável | Fase 5 | Elimina adaptações e bugs conhecidos que voltavam a exigir intervenção |
| D. Migração e ativação | Fases 6 e 7 | Demonstra o percurso em casos reais e cria medição da primeira proposta |

Cada lote termina com ficheiros alterados, verificações executadas, limitações e próximo passo registados. A conclusão de um lote não exige uma nova aprovação quando o trabalho estiver dentro da implementação autorizada.

O primeiro lote a executar será **A**, começando pela reprodução dos seis falsos sucessos do validador e pela especificação do contrato mínimo. O bloqueio obrigatório de novas bases só será ativado no fim, quando existir um percurso funcional de produção, migração e consumo.

## 13. Condições para considerar a implementação concluída

- [x] As regras das skills, schema, gerador e validador são compatíveis entre si.
- [x] Casos inválidos e casos legítimos com pouca informação estão cobertos por testes úteis.
- [x] Dossiê e adaptação trocam um contrato único e versionado.
- [x] Mudanças invalidam verificações antigas e propagam restrições aos campos afetados.
- [x] Cerrado e Fataunços foram migrados sem inventar confirmações ou alterar os sites atuais.
- [x] O molde trata contactos, avaliações e ausências corretamente.
- [x] As correções técnicas selecionadas foram verificadas no percurso completo.
- [x] Existe instrução clara para continuar a partir de uma falha ou dossiê antigo.
- [ ] A primeira execução numa casa nova foi avaliada, ou está explicitamente pendente por falta de caso real.
- [x] O relatório final distingue trabalho implementado, verificado e ainda não verificado.
