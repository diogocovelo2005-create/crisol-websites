# Confirmar identidade entre plataformas

O mesmo nome de AL aparece em concelhos diferentes com frequência ("Casa do
Mar", "Vila Bela", "Quinta da Serra"). Recolher informação da fonte errada
não dá erro nenhum — só produz um dossiê que parece completo e está errado.

## Campos de referência

- **Nome** — nunca chega sozinho, é o campo com mais colisões
- **Morada / coordenadas** — o campo mais fiável quando disponível
- **Telefone** — costuma ser o mesmo em todas as plataformas de um AL a sério
- **Número de registo** — quando visível, é o identificador mais forte que
  existe em Portugal: é único por registo e obrigatório em anúncios
  legítimos. É **RNAL** num Alojamento Local e **RNET** num empreendimento
  turístico (Turismo de Habitação, Turismo Rural, hotel rural). O Booking
  mostra-o como "Licença número"; o Airbnb às vezes como "Exempt", o que
  não prova nada. O prefixo diz o tipo de casa: regista-o.

## Regra de confirmação

Precisas de pelo menos **dois campos independentes** a bater certo entre a
fonte nova e a fonte que já confirmaste, antes de tratares essa fonte como
sendo sobre o mesmo AL. Nome sozinho nunca é suficiente. Nome + morada
aproximada já é suficiente na maior parte dos casos; nome + número de
registo é praticamente certeza.

Quando os campos batem certo parcialmente (ex.: morada igual, telefone
diferente — pode ter mudado de gestor), regista isso em `fontes.md` em vez de
decidir sozinho se ainda é o mesmo AL. Um telefone diferente pode significar
gestão nova, ou pode significar que é outro alojamento na mesma rua. No
contrato, liga a fonte apenas à entidade confirmada; uma unidade, quarto,
tarifa ou anúncio de casa inteira não passa automaticamente a representar a
casa toda.

## Ordem prática

1. Começa pela fonte mais forte que já tens (normalmente o link que o humano
   deu, ou o registo do Google Maps — tem morada e coordenadas de origem)
2. Para cada plataforma nova, procura pelo nome + concelho
3. Se aparecer mais que um resultado plausível, compara morada e telefone
   antes de escolher
4. Confirma antes de recolher — não recolhas "provisoriamente" de uma fonte
   não confirmada; isso é como a contaminação entra no dossiê sem ninguém dar
   por isso

## Quando não bater certo

Marca a fonte como `[A_VERIFICAR]` em `fontes.md`, explica o que não bateu
(qual campo, que valores diferentes), e não uses essa fonte para preencher
`factos.md` nem `compliance.md` até alguém confirmar. Podes ainda assim
registar o que encontraste lá — só não o tratas como confirmado.
