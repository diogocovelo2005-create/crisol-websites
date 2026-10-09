-- score.sql — nota de necessidade de website, 0 a 5.
--
-- O marcador da tabela (ver lib/db.js) e substituido pelo nome real antes de correr.
-- Deterministico e idempotente: correr duas vezes da o mesmo resultado.
--
--   5  sem website  ·  5  website partido
--   4  so redes sociais
--   3  legacy com falha tecnica grave
--   2  legacy
--   1  moderno com margem
--   0  moderno
--
-- Linhas ainda por auditar ficam com score NULL, e nao com 0: um zero diria
-- "tem site moderno, nao precisa de nada", que e a conclusao errada a tirar de
-- "ainda nao olhei".

update __TABELA__ set
  score = case

    -- Sem website e a nota maxima e nao depende da auditoria: sabemo-lo logo
    -- no Place Details. E por isso que este ramo vem antes de tudo.
    when website is null or btrim(website) = ''            then 5

    when site_state = 'broken'                             then 5
    when site_state = 'social_only'                        then 4

    -- Falha tecnica grave: as tres que um cliente ve no telemovel em cinco
    -- segundos.
    when site_state = 'legacy' and (
         has_https    is not true
      or has_viewport is not true
      or overflow_x   is true
    )                                                      then 3

    when site_state = 'legacy'                             then 2

    -- "Moderno com margem": passa no essencial mas tem uma fraqueza que se
    -- vende. Serve para separar o lead frio do lead morto.
    when site_state = 'modern' and (
         tem_jsonld is not true
      or (tem_form is not true and tem_contacto is not true)
      -- footer_year a NULL significa "nao encontrei rodape com ano", nao
      -- "e antigo". Sem o "is not null", NULL < 2023 avalia a NULL e o ramo
      -- inteiro deixava de decidir — a mesma armadilha que em JS nao existe,
      -- porque la null < 2023 e true.
      or (footer_year is not null and footer_year < extract(year from now())::int - 2)
    )                                                      then 1

    when site_state = 'modern'                             then 0

    else null
  end,
  atualizado_em = now()
where audited_at is not null
   or website is null
   or btrim(website) = '';
