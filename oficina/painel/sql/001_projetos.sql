-- Painel de projetos: tabelas, triggers e os projetos que já existiam.
-- Ver oficina/painel/PLANO.md.
--
-- Regras:
--   * o crm_alojamento não ganha colunas. Deste ficheiro, só lhe toca um
--     trigger que lê o estado;
--   * um projeto com place_id tem o estado no CRM, e projetos.estado fica nulo;
--   * um projeto sem place_id (fora da prospeção) tem o estado em
--     projetos.estado, com os mesmos valores (enum estado_lead).

-- ─── Tabelas ────────────────────────────────────────────────────────────────

create table if not exists projetos (
  id                uuid primary key default gen_random_uuid(),
  nicho             text not null,
  place_id          text unique,          -- liga ao crm_<nicho>; nulo = fora da prospeção
  nome              text not null,
  slug              text not null,        -- a pasta dentro do nicho
  estado            estado_lead,          -- só para projetos sem place_id
  estado_em         timestamptz,          -- idem
  porta             int unique,           -- porta do servidor local do site
  telefone          text,                 -- só para projetos sem place_id
  email             text,
  email_origem      text check (email_origem in ('dossie', 'dossie-a-verificar', 'manual', 'sem-email')),
  proximo_passo     text,
  proximo_passo_ate date,
  url_enviada       text,
  valor             numeric(10, 2),
  motivo_fim        text,
  voltar_em         date,
  criado_em         timestamptz not null default now(),
  unique (nicho, slug)
);

create table if not exists projeto_passos (
  id          uuid primary key default gen_random_uuid(),
  projeto_id  uuid not null references projetos (id) on delete cascade,
  fase        smallint not null check (fase between 1 and 5),
  chave       text,                       -- id do passo no checklist.json; nulo nos extra
  texto       text not null,
  ordem       int not null default 0,
  auto        text,                       -- chave da deteção automática, se houver
  extra       boolean not null default false,
  feito_em    timestamptz,
  criado_em   timestamptz not null default now(),
  unique (projeto_id, chave)
);

create table if not exists projeto_eventos (
  id          bigint generated always as identity primary key,
  projeto_id  uuid not null references projetos (id) on delete cascade,
  tipo        text not null check (tipo in ('criado', 'estado', 'nota', 'passo')),
  texto       text not null,
  criado_em   timestamptz not null default now()
);

create index if not exists projeto_passos_projeto on projeto_passos (projeto_id);
create index if not exists projeto_eventos_projeto on projeto_eventos (projeto_id, criado_em desc);

-- Só a chave de serviço (o painel, no servidor) lá chega.
alter table projetos        enable row level security;
alter table projeto_passos  enable row level security;
alter table projeto_eventos enable row level security;

-- ─── Utilitários ────────────────────────────────────────────────────────────

create or replace function painel_slug(t text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(t,
      'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
      'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn')),
    '[^a-z0-9]+', '-', 'g'))
$$;

create or replace function painel_proxima_porta() returns int
language sql as $$
  select coalesce(max(porta), 3100) + 1 from projetos
$$;

-- Estados em que uma lead do CRM passa a ser projeto.
create or replace function painel_estado_de_projeto(e estado_lead) returns boolean
language sql immutable as $$
  select e in ('a construir base', 'base enviada', 'reunião de feedback',
               'disse que sim', 'a construir site', 'site acabado',
               'publicado', 'pago')
$$;

-- ─── Trigger no CRM do alojamento ───────────────────────────────────────────
-- Quando o estado muda: cria o projeto (se for caso disso) e regista o evento.

create or replace function crm_alojamento_projeto() returns trigger
language plpgsql as $$
declare
  pid uuid;
begin
  if new.estado is not distinct from old.estado then
    return new;
  end if;

  select id into pid from projetos where place_id = new.place_id;

  if pid is null and painel_estado_de_projeto(new.estado) then
    insert into projetos (nicho, place_id, nome, slug, porta)
    values ('alojamento', new.place_id, new.nome, painel_slug(new.nome), painel_proxima_porta())
    returning id into pid;
    insert into projeto_eventos (projeto_id, tipo, texto)
    values (pid, 'criado', 'Entrou no painel');
  end if;

  if pid is not null then
    insert into projeto_eventos (projeto_id, tipo, texto)
    values (pid, 'estado', old.estado || ' → ' || new.estado);
  end if;

  return new;
end $$;

drop trigger if exists crm_alojamento_projeto on crm_alojamento;
create trigger crm_alojamento_projeto
  after update of estado on crm_alojamento
  for each row execute function crm_alojamento_projeto();

-- ─── Trigger nos projetos de fora da prospeção ──────────────────────────────

create or replace function projetos_estado() returns trigger
language plpgsql as $$
begin
  if new.estado is distinct from old.estado then
    new.estado_em := now();
    insert into projeto_eventos (projeto_id, tipo, texto)
    values (new.id, 'estado', coalesce(old.estado::text, 'sem estado') || ' → ' || coalesce(new.estado::text, 'sem estado'));
  end if;
  return new;
end $$;

drop trigger if exists projetos_estado on projetos;
create trigger projetos_estado
  before update of estado on projetos
  for each row execute function projetos_estado();

-- ─── Os projetos que já existiam ────────────────────────────────────────────

-- Fora da prospeção: o estado fica vazio, é o Diogo que o escolhe no painel.
insert into projetos (nicho, nome, slug, porta) values
  ('alojamento', 'Casa de Fataunços',      'casa-de-fatauncos-vouzela', 3101),
  ('alojamento', 'Quinta de Canhões',      'quinta-de-canhoes',         3102),
  ('advocacia',  'Manuel Covelo Advogado', 'manuel-covelo-advogado',    3103)
on conflict (nicho, slug) do nothing;

-- Do CRM: as leads que já estão num estado de projeto.
insert into projetos (nicho, place_id, nome, slug, porta)
select 'alojamento', c.place_id, c.nome, painel_slug(c.nome),
       3103 + row_number() over (order by c.estado_em)
from crm_alojamento c
where painel_estado_de_projeto(c.estado)
  and not exists (select 1 from projetos p where p.place_id = c.place_id);

insert into projeto_eventos (projeto_id, tipo, texto)
select id, 'criado', 'Entrou no painel'
from projetos p
where not exists (select 1 from projeto_eventos e where e.projeto_id = p.id);

-- ─── search_path fixo (aviso do linter do Supabase) ─────────────────────────

alter function painel_slug(text) set search_path = public;
alter function painel_proxima_porta() set search_path = public;
alter function painel_estado_de_projeto(estado_lead) set search_path = public;
alter function crm_alojamento_projeto() set search_path = public;
alter function projetos_estado() set search_path = public;
