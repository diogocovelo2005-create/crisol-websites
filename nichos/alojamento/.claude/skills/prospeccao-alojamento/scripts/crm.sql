-- crm.sql — a tabela de trabalho do Diogo (crm_alojamento), e a classificação
-- que a alimenta: tipo de lead, nota 0 a 10 e motivo.
--
-- Idempotente: pode correr as vezes que forem precisas. Não toca no motor: a
-- coluna `score` (0 a 5) e a vista `_prioritarias` continuam como estão.
--
-- DUAS TABELAS, DE PROPÓSITO
--
--   leads_alojamento   a da máquina. Os scripts escrevem lá os dados do Google
--                      e os defeitos medidos nos sites. Ele não a abre.
--   crm_alojamento     a dele. Só as colunas que ele usa, e é lá que edita o
--                      estado, a decisão e as notas.
--
-- As colunas técnicas não se podem apagar (os scripts e o trigger precisam
-- delas), e o Supabase não deixa editar vistas. Daí a segunda tabela.
--
-- O FLUXO, todo por triggers — não há comando para correr, e por isso não há
-- comando para esquecer:
--
--   1. uma linha entra ou muda em leads_alojamento
--   2. BEFORE: calcula tipo_lead, nota e motivo (lendo a `decisao` dele)
--   3. AFTER:  copia para crm_alojamento os dados e a classificação, e NUNCA
--              toca em estado, decisao, notas ou estado_em
--   4. se ele muda a `decisao` no crm, a linha da máquina é recalculada, e o
--      passo 3 traz de volta o tipo e a nota novos

/* ─────────────────────────────── tipos ─────────────────────────────────── */

-- A ordem dos valores é a ordem em que aparecem no menu do Supabase.
do $$ begin
  create type tipo_lead as enum (
    'site mau',        -- morto com prova, defeito que se vê, só motor de reservas, ou ele decidiu
    'sem site',        -- nada, ou só Facebook / Instagram / Booking / agregador
    'por decidir',     -- o script tem dúvidas: decide ele
    'site razoável',   -- moderno, com uma fraqueza pequena
    'site bom',        -- não é lead
    'fechado',         -- fechou de vez, segundo o Google
    'por auditar'      -- ainda ninguém abriu o site
  );
exception when duplicate_object then null;
end $$;

-- A ordem segue o caminho de uma lead, do primeiro contacto ao pagamento.
do $$ begin
  create type estado_lead as enum (
    'por contactar',
    'contactado',
    'não atendeu',
    'sem resposta',
    'voltar a contactar',
    'interessado',
    'reunião marcada',
    'a construir base',
    'base enviada',
    'reunião de feedback',
    'disse que sim',
    'disse que não',
    'a construir site',
    'site acabado',
    'publicado',
    'pago',
    'não contactar mais'  -- pediu para não voltar a ser contactado
  );
exception when duplicate_object then null;
end $$;

/* ───────────────────── tabela da máquina: colunas ──────────────────────── */

-- A vista antiga lia colunas que saem daqui; tem de cair antes delas.
drop view if exists leads_alojamento_ordenadas;

alter table leads_alojamento
  -- escritas pelo trigger
  add column if not exists tipo_lead      tipo_lead,
  add column if not exists nota           smallint check (nota between 0 and 10),
  add column if not exists motivo         text,
  -- escritas pelo estetica.js
  add column if not exists sinais_feio    text[],
  add column if not exists duvida_script  text,
  add column if not exists estetica_em    timestamptz,
  -- as colunas dele mudaram-se para crm_alojamento
  drop column if exists estado,
  drop column if exists notas,
  drop column if exists estado_em,
  drop column if exists decisao;

/* ───────────────────────── tabela dele ─────────────────────────────────── */

-- A ordem das colunas é a ordem em que ele as vê, da esquerda para a direita:
-- quem é · quanto vale · o que ele fez · como contactar · porquê · contexto ·
-- automáticas. O Postgres não reordena colunas: mudar esta ordem numa base
-- que já tem a tabela obriga a recriá-la, copiando os dados.
create table if not exists crm_alojamento (
  nome          text,
  nota          smallint,
  tipo_lead     tipo_lead,
  estado        estado_lead not null default 'por contactar',
  decisao       tipo_lead,        -- quando preenchida, manda sobre o script
  notas         text,
  telefone      text,
  website       text,
  motivo        text,
  rating        numeric(2,1),
  num_reviews   integer,
  primary_type  text,
  morada        text,
  estado_em     timestamptz,      -- desde quando está neste estado
  -- O Supabase precisa de uma chave para deixar editar linhas. Fica no fim.
  place_id      text primary key references leads_alojamento (place_id) on delete cascade
);

-- Sem políticas, a chave pública do projeto não lê nem escreve aqui. O Table
-- Editor e os scripts usam papéis que passam por cima do RLS.
alter table crm_alojamento enable row level security;

/* ─────────────── páginas que não são o site da casa ────────────────────── */

-- Motor de reservas PRÓPRIO: a casa paga para receber reservas diretas e não
-- tem mais nada. É das melhores leads — já quer fugir à comissão, e convence-se
-- com "um site a sério traz-te mais marcações diretas".
create or replace function eh_motor_reservas(host text) returns boolean
language sql immutable as $$
  select host ~* '(^|\.)(direct-book\.com|book-directonline\.com|vacation-bookings\.com|guestcentric\.net|amenitiz\.io|cloudbeds\.com|beds24\.com|avaibook\.com|bookonline\.pro|simplebooking\.it|hotelrunner\.com|lodgify\.com|smoobu\.com|hostaway\.com|guesty\.com)$'
$$;

-- Agregador de TERCEIROS: copia o anúncio e fica com a reserva. Não é da casa,
-- por isso a casa conta como sem site. A lista cresce com a de rubrica.md.
create or replace function eh_agregador(host text) returns boolean
language sql immutable as $$
  select host ~* '(^|\.)(bluepillow\.com|freecancellations\.com|hoteisnew\.com|hoteisdiarios\.com|snaptrip\.com|tripingguide\.com|hoteisweb\.com|hotelscoimbra\.com|centro-portugal-hotels\.com|costaprata\.net|hotels-pt\.net|reserving\.com|housity\.net|planetofhotels\.com|myboutiquehotel\.com|guestreservations\.com|bedandbreakfast\.eu|a-hotel\.com|booked\.net|hotelmix\.co\.uk|guidetoeurope\.com|chambres-hotes\.fr|destinia\.com|amimir\.com|portugal-alojamento\.pt|alojamento-portugal\.pt|accoportugal\.pt|bandbwww\.com|res-menu\.net|vivehotels\.com|expedia\.[a-z.]+|hotels\.com|agoda\.com|trivago\.[a-z.]+|hostelworld\.com|vrbo\.com)$'
$$;

/* ──────────────────────────── nota 0 a 10 ──────────────────────────────── */

-- NOTA = BASE (o tipo de lead) + NEGÓCIO (quanto a casa vale), de 0 a 10.
--
--   base      site mau 7 · por decidir 5 · sem site 4 · site razoável 2
--             site bom e fechado → 0 fixo, sem bónus
--
--   negócio   100+ avaliações +2 · 25 a 99 +1 · menos de 5 −1
--             rating 4,5 ou mais +1
--             4 ou mais defeitos graves no site +1
--
-- SITE MAU só com prova: o domínio não existe, erro 404, parqueado com a frase
-- à vista, só um motor de reservas, ou velho com pelo menos um defeito que o
-- hóspede VÊ.
--
-- POR DECIDIR quando o script não tem a certeza, e não finge que tem:
--   · demorou mais de 20 s, bloqueou o robô, ou outro erro que também acontece
--     a sites vivos
--   · parqueado só por ter pouco texto (dúvida deixada pelo estetica.js)
--   · velho, mas só com defeitos que o hóspede não vê
--   · só UM defeito grave
--   · dois ou mais sinais de site feio E 25 ou mais avaliações (filtro 2)
--
-- Os defeitos são os sete do motor (lib/site.js), com a mesma leitura dos
-- nulos: NULL quer dizer "não consegui medir", nunca "está mal". Por isso
-- "is false" / "is true" e nunca "not x".

create or replace function leads_alojamento_classificar()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  ano      int := extract(year from now())::int;
  reviews  int := coalesce(new.num_reviews, 0);
  lista    text[] := '{}';
  graves   text[] := '{}';
  feio     int := coalesce(cardinality(new.sinais_feio), 0);
  visiveis int;
  erro     text := coalesce(new.audit_extra->>'erro', '');
  host     text := regexp_replace(lower(coalesce(substring(new.website from '://([^/:?#]+)'), '')), '^www\.', '');
  escolha  tipo_lead;
  tipo     tipo_lead;
  base     int;
  bonus    int := 0;
begin
  select c.decisao into escolha from crm_alojamento c where c.place_id = new.place_id;

  /* ---- os sete defeitos do motor, com nome ---- */
  if new.has_https    is false then graves := array_append(graves, 'sem https'::text); end if;
  if new.has_viewport is false then graves := array_append(graves, 'não adaptado a telemóvel'::text); end if;
  if new.overflow_x   is true  then graves := array_append(graves, 'obriga a arrastar para o lado'::text); end if;
  lista := graves;
  if new.footer_year is not null and new.footer_year < ano - 4 then
    lista := array_append(lista, ('rodapé de ' || new.footer_year));
  end if;
  if coalesce(new.meta_generator, '') ~* '(frontpage|dreamweaver|microsoft\s+word|publisher|iweb|joomla!?\s*[123]\.|drupal\s*[67]|wordpress\s*[1-4]\.|namo\s+webeditor|netobjects|adobe\s+golive|mobirise)' then
    lista := array_append(lista, ('feito com ' || new.meta_generator));
  end if;
  -- Até aqui, defeitos que um hóspede VÊ. Os dois seguintes não se vêem: um
  -- site bonito pode não ter formulário nem ter dados para o Google. Sozinhos
  -- não provam site mau — em Viseu eram 27 dos 63 "site mau".
  visiveis := cardinality(lista);
  if new.tem_form is false and new.tem_contacto is false then
    lista := array_append(lista, 'sem formulário nem contacto'::text);
  end if;
  if new.tem_jsonld is false then lista := array_append(lista, 'sem dados para o Google'::text); end if;

  /* ---- tipo e motivo ---- */
  if new.business_status = 'CLOSED_PERMANENTLY' then
    tipo := 'fechado';        new.motivo := 'fechou de vez, segundo o Google';

  elsif escolha is not null then
    tipo := escolha;          new.motivo := 'decidido por ti';

  elsif new.website is null or btrim(new.website) = '' then
    tipo := 'sem site';       new.motivo := 'sem site na ficha do Google';

  elsif eh_motor_reservas(host) then
    tipo := 'site mau';
    new.motivo := 'o "site" é só a página de reservas (' || host || '): já quer fugir à comissão';

  elsif eh_agregador(host) then
    tipo := 'sem site';       new.motivo := 'o "site" é de um agregador, não da casa: ' || host;

  elsif new.site_state = 'social_only' then
    tipo := 'sem site';       new.motivo := 'o "site" é um perfil: ' || new.website;

  elsif new.site_state is null then
    tipo := 'por auditar';    new.motivo := null;

  elsif new.site_state = 'broken' then
    -- Morto COM PROVA: o domínio não existe, a página não existe, ou está
    -- parqueado com a frase à vista. Qualquer outro erro também acontece a
    -- sites vivos (redirecionou a meio, o servidor não respondeu uma vez) e
    -- por isso é dúvida, não prova.
    if erro ~* 'ERR_NAME_NOT_RESOLVED' then
      tipo := 'site mau';     new.motivo := 'o domínio já não existe';
    elsif erro = '' and new.http_status in (404, 410) then
      tipo := 'site mau';     new.motivo := 'a página não existe (erro ' || new.http_status || ')';
    elsif erro ~* 'timeout' then
      tipo := 'por decidir';  new.motivo := 'demorou mais de 20 s a abrir: morto ou só lento?';
    elsif new.http_status in (401, 403, 429, 503) then
      tipo := 'por decidir';  new.motivo := 'o site bloqueou o robô (http ' || new.http_status || ')';
    elsif new.duvida_script is not null then
      tipo := 'por decidir';  new.motivo := new.duvida_script;
    elsif new.estetica_em is null and new.parqueado is true and erro = '' then
      tipo := 'por auditar';  new.motivo := 'falta confirmar se está mesmo parqueado';
    elsif erro = '' and new.parqueado is true then
      tipo := 'site mau';     new.motivo := 'domínio parqueado ou "em construção"';
    else
      tipo := 'por decidir';
      new.motivo := 'não abriu, mas pode ser do robô e não do site: '
        || coalesce(nullif(left(erro, 80), ''), 'erro ' || new.http_status);
    end if;

  elsif new.site_state = 'legacy' and visiveis >= 1 then
    tipo := 'site mau';       new.motivo := array_to_string(lista, ' · ');

  elsif new.site_state = 'legacy' then
    tipo := 'por decidir';
    new.motivo := 'só defeitos que o hóspede não vê: ' || array_to_string(lista, ' · ');

  elsif new.site_state = 'modern' and new.estetica_em is null then
    tipo := 'por auditar';    new.motivo := 'falta a passagem de estética';

  elsif new.site_state = 'modern' and cardinality(graves) = 1 then
    tipo := 'por decidir';    new.motivo := 'só um defeito grave: ' || graves[1];

  elsif new.site_state = 'modern' and feio >= 2 and reviews >= 25 then
    tipo := 'por decidir';    new.motivo := 'parece feio: ' || array_to_string(new.sinais_feio, ' · ');

  elsif new.site_state = 'modern' and (
       new.tem_jsonld is not true
    or (new.tem_form is not true and new.tem_contacto is not true)
    or (new.footer_year is not null and new.footer_year < ano - 2)
  ) then
    tipo := 'site razoável';
    new.motivo := coalesce(nullif(array_to_string(lista, ' · '), ''), 'rodapé de ' || new.footer_year);

  else
    tipo := 'site bom';       new.motivo := null;
  end if;

  new.tipo_lead := tipo;

  /* ---- nota ---- */
  base := case tipo
    when 'site mau'      then 7
    when 'por decidir'   then 5
    when 'sem site'      then 4
    when 'site razoável' then 2
    else null end;

  if tipo in ('site bom', 'fechado') then new.nota := 0;  return new; end if;
  if base is null                    then new.nota := null; return new; end if;

  if    reviews >= 100 then bonus := bonus + 2;
  elsif reviews >= 25  then bonus := bonus + 1;
  elsif reviews < 5    then bonus := bonus - 1;
  end if;
  if new.rating >= 4.5          then bonus := bonus + 1; end if;
  if cardinality(lista) >= 4    then bonus := bonus + 1; end if;

  new.nota := greatest(0, least(10, base + bonus));
  return new;
end $$;

drop trigger if exists leads_alojamento_classificar on leads_alojamento;
create trigger leads_alojamento_classificar
  before insert or update on leads_alojamento
  for each row execute function leads_alojamento_classificar();

/* ───────────────── máquina → tabela dele (nunca o contrário) ───────────── */

create or replace function leads_alojamento_para_crm()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into crm_alojamento as c
    (place_id, nota, tipo_lead, motivo, nome, telefone, website, morada,
     rating, num_reviews, primary_type)
  values
    (new.place_id, new.nota, new.tipo_lead, new.motivo, new.nome, new.telefone,
     new.website, new.morada, new.rating, new.num_reviews, new.primary_type)
  on conflict (place_id) do update set
    -- estado, decisao, notas e estado_em ficam de fora DE PROPÓSITO: são dele.
    nota = excluded.nota, tipo_lead = excluded.tipo_lead, motivo = excluded.motivo,
    nome = excluded.nome, telefone = excluded.telefone, website = excluded.website,
    morada = excluded.morada, rating = excluded.rating,
    num_reviews = excluded.num_reviews, primary_type = excluded.primary_type
  where (c.nota, c.tipo_lead, c.motivo, c.nome, c.telefone, c.website, c.morada,
         c.rating, c.num_reviews, c.primary_type)
     is distinct from
        (excluded.nota, excluded.tipo_lead, excluded.motivo, excluded.nome,
         excluded.telefone, excluded.website, excluded.morada, excluded.rating,
         excluded.num_reviews, excluded.primary_type);
  return null;
end $$;

drop trigger if exists leads_alojamento_para_crm on leads_alojamento;
create trigger leads_alojamento_para_crm
  after insert or update on leads_alojamento
  for each row execute function leads_alojamento_para_crm();

/* ─────────────────────── o que ele muda no crm ─────────────────────────── */

-- A data do estado muda sozinha quando ele muda o estado.
create or replace function crm_alojamento_estado_em()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.estado is distinct from old.estado then
    new.estado_em := now();
  end if;
  return new;
end $$;

drop trigger if exists crm_alojamento_estado_em on crm_alojamento;
create trigger crm_alojamento_estado_em
  before insert or update on crm_alojamento
  for each row execute function crm_alojamento_estado_em();

-- Quando ele escolhe (ou apaga) uma decisão, a linha da máquina é recalculada
-- e o tipo, a nota e o motivo novos voltam para aqui. "update of decisao" só
-- dispara quando a decisão está no SET — a cópia máquina→crm nunca a mexe,
-- por isso não há ciclo.
create or replace function crm_alojamento_decisao()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.decisao is distinct from old.decisao then
    update leads_alojamento set atualizado_em = now() where place_id = new.place_id;
  end if;
  return null;
end $$;

drop trigger if exists crm_alojamento_decisao on crm_alojamento;
create trigger crm_alojamento_decisao
  after update of decisao on crm_alojamento
  for each row execute function crm_alojamento_decisao();

/* ────────────────────────── recalcular tudo ────────────────────────────── */

-- Recalcula a classificação e enche/atualiza o crm. Não mexe em estado,
-- decisao nem notas.
update leads_alojamento set atualizado_em = atualizado_em;
