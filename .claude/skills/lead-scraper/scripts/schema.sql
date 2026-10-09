-- schema.sql — DDL de uma tabela de leads (uma por nicho).
--
-- O marcador da tabela (ver lib/db.js) e substituido pelo nome real antes de correr.
-- Idempotente: pode correr as vezes que forem precisas.

-- O enum nao tem "create type if not exists" em Postgres. Este bloco e a
-- forma canonica de o tornar idempotente.
do $$ begin
  create type site_state as enum ('none', 'social_only', 'broken', 'legacy', 'modern');
exception
  when duplicate_object then null;
end $$;

create table if not exists __TABELA__ (
  place_id          text primary key,

  -- ── Place Details (fase B do discovery, a paga) ──────────────────────────
  nome              text,
  morada            text,
  lat               double precision,
  lng               double precision,
  telefone          text,
  website           text,
  rating            numeric(2,1),
  num_reviews       integer,
  business_status   text,
  primary_type      text,
  types             text[],
  google_maps_uri   text,

  -- ── Proveniencia ────────────────────────────────────────────────────────
  -- Arrays e nao colunas: um lugar e tipicamente encontrado por varios termos
  -- e em varias celulas. Serve para o relatorio saber que termos puxam o peso,
  -- e para distinguir "o Text Search nao acrescentou nada" de "o Text Search
  -- nem chegou a correr".
  fontes            text[] not null default '{}',   -- 'nearby:plumber', 'text:picheleiro'
  celulas           text[] not null default '{}',   -- 'c12', 'r3', 'c12.2.0'

  -- ── Auditoria (audit.js) ────────────────────────────────────────────────
  site_state        site_state,
  http_status       integer,
  final_url         text,
  has_https         boolean,
  has_viewport      boolean,
  overflow_x        boolean,
  meta_generator    text,
  footer_year       integer,
  tem_form          boolean,
  tem_contacto      boolean,
  tem_jsonld        boolean,
  num_imagens       integer,
  parqueado         boolean,

  -- Colunas especificas de nicho vivem AQUI, nunca como colunas novas. Uma
  -- coluna nova por nicho faria divergir o schema entre tabelas e partiria
  -- qualquer consulta que atravesse nichos.
  audit_extra       jsonb not null default '{}'::jsonb,

  screenshot        text,
  audited_at        timestamptz,

  score             smallint,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);

-- Sufixos curtos de proposito. O limite de identificadores do Postgres sao 63
-- caracteres e ele corta em silencio: com o slug limitado a 44, a tabela tem
-- no maximo 50 e a vista _prioritarias chega exactamente a 63.
create index if not exists __TABELA___i1 on __TABELA__ (score desc nulls last, num_reviews desc nulls last);
create index if not exists __TABELA___i2 on __TABELA__ (audited_at) where audited_at is null;
create index if not exists __TABELA___i3 on __TABELA__ (site_state);

create or replace view __TABELA___prioritarias as
  select *
  from __TABELA__
  where score >= 4
    -- "is distinct from" e nao "<>": com business_status a NULL, a comparacao
    -- <> avalia a NULL, o WHERE trata NULL como falso, e as linhas sem estado
    -- desapareciam da vista sem erro nenhum. E a mesma armadilha do
    -- .neq('site_state','none') no audit.js.
    and business_status is distinct from 'CLOSED_PERMANENTLY'
  order by score desc, num_reviews desc nulls last;
