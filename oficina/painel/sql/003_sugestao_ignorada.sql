-- A última sugestão que ele ignorou (para não voltar a aparecer). 'estado:<x>' nas de estado.
alter table projetos add column if not exists sugestao_ignorada text;
