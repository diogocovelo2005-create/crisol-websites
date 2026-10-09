-- Post-its: papéis com um pino, soltos no quadro de cada nicho ou presos a um
-- projeto. A cor diz a prioridade; a posição e a rotação ficam guardadas
-- para não saltarem a cada refresh.
create table if not exists notas (
  id          uuid primary key default gen_random_uuid(),
  nicho       text,                                              -- nota do quadro de um nicho
  projeto_id  uuid references projetos (id) on delete cascade,   -- nota de um projeto
  texto       text not null default '',
  prioridade  text not null default 'media' check (prioridade in ('alta', 'media', 'baixa')),
  pos_x       real not null default 50,   -- percentagem dentro da área onde vive
  pos_y       real not null default 50,
  rotacao     smallint not null default 0,
  anexos      jsonb not null default '[]',
  criado_em   timestamptz not null default now(),
  constraint notas_um_dono check ((nicho is not null) <> (projeto_id is not null))
);

create index if not exists notas_nicho on notas (nicho) where nicho is not null;
create index if not exists notas_projeto on notas (projeto_id) where projeto_id is not null;

alter table notas enable row level security;

-- Só a chave de serviço (o painel, no servidor) lá chega.
insert into storage.buckets (id, name, public)
values ('notas', 'notas', false)
on conflict (id) do nothing;
