-- Notas com título (em letra maior) e checklist. Já aplicado no Supabase
-- (migração notas_titulo_e_checklist, 2026-10-04).
alter table notas add column if not exists titulo text not null default '';
alter table notas add column if not exists itens jsonb not null default '[]';
comment on column notas.titulo is 'Título opcional, mostrado em letra maior';
comment on column notas.itens is 'Checklist: [{id, texto, feito}]';
