-- Esconder um cartão do quadro sem apagar nada. O projeto vai para o Arquivo
-- e pode voltar a aparecer. Nulo = visível.
alter table projetos add column if not exists oculto_em timestamptz;
