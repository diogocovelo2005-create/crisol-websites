-- O concelho dos projetos de fora da prospeção (os do CRM tiram-no da morada).
alter table projetos add column if not exists local text;
update projetos set local = 'Vouzela' where slug = 'casa-de-fatauncos-vouzela' and local is null;
update projetos set local = 'São Pedro do Sul' where slug = 'quinta-de-canhoes' and local is null;
update projetos set local = 'Viseu' where slug = 'manuel-covelo-advogado' and local is null;
