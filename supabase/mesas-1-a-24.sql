-- ================================================================
-- TATÁ SUSHI — LAYOUT DO MAPA DE CHÃO OFICIAL
--   Salão: 24 mesas sequenciais (1 a 24) · Varanda: 60/62/64/65/66
-- ================================================================
-- COMO USAR: cole este arquivo INTEIRO no SQL Editor do Supabase e
-- execute (botão Run). É IDEMPOTENTE: pode rodar quantas vezes
-- quiser, não duplica mesas nem mexe nas reservas existentes.
--
-- O que ele faz:
--   1. Garante as mesas 1 a 24 do salão — ativas, capacidade 2,
--      nas posições do mapa de chão (3 colunas).
--   2. Garante as mesas da varanda (60, 62, 64, 65, 66) — ATIVAS
--      e funcionais, capacidade 2.
--   3. Mantém as banquetas de apoio (41-45 do bar e 51-55 da barra
--      fria) como INATIVAS (aparecem pretas no mapa).
--   4. Desativa apenas V1 e V2 (não constam no mapa de chão) SEM
--      apagar nada do banco.
--   5. Se algum casal ativo estiver numa mesa desativada, ele volta
--      para "aguardando mesa" (a hostess realoca pelo mapa).
--
-- As reservas oficiais usam mesas 1 a 17, então nenhuma é afetada.
-- ================================================================

-- 1. Salão: mesas 1 a 24 — upsert (cria as que faltam, reativa e
--    reposiciona as que existem). Colunas do mapa, de baixo p/ cima:
--    direita 1-8, centro 9-16, esquerda 17-24.
insert into public.tables (numero, area, capacidade, ativa, pos_x, pos_y)
select n::text, 'salao'::public.area_tipo, 2, true,
       case (n - 1) / 8 when 0 then 77 when 1 then 48.5 else 19 end,
       53.4 - ((n - 1) % 8) * 4.85
from generate_series(1, 24) as n
on conflict (numero) do update set
  area = excluded.area,
  capacidade = 2,
  ativa = true,
  pos_x = excluded.pos_x,
  pos_y = excluded.pos_y;

-- 2. Varanda: visível e funcional (60/62/64 à direita, 66/65 à esquerda)
insert into public.tables (numero, area, capacidade, ativa, pos_x, pos_y, observacao) values
  ('60', 'varanda', 2, true, 77, 79.5, 'Área externa — sofá'),
  ('62', 'varanda', 2, true, 77, 86.5, 'Área externa — sofá'),
  ('64', 'varanda', 2, true, 77, 93.5, 'Área externa — sofá'),
  ('66', 'varanda', 2, true, 23, 82.5, 'Área externa'),
  ('65', 'varanda', 2, true, 21, 92,   'Área externa')
on conflict (numero) do update set
  area = excluded.area,
  capacidade = 2,
  ativa = true,
  pos_x = excluded.pos_x,
  pos_y = excluded.pos_y;

-- 3. Apoio (banquetas do bar e da barra fria): existem mas ficam
--    inativas; V1/V2 não constam no mapa de chão e também saem.
insert into public.tables (numero, area, capacidade, ativa, pos_x, pos_y, observacao) values
  ('41', 'salao', 2, false, 31,   11.7, 'Balcão do bar — apoio'),
  ('42', 'salao', 2, false, 40.5, 11.7, 'Balcão do bar — apoio'),
  ('43', 'salao', 2, false, 50,   11.7, 'Balcão do bar — apoio'),
  ('44', 'salao', 2, false, 59.5, 11.7, 'Balcão do bar — apoio'),
  ('45', 'salao', 2, false, 68.5, 11.7, 'Balcão do bar — apoio'),
  ('51', 'salao', 2, false, 28, 59, 'Barra fria — apoio'),
  ('52', 'salao', 2, false, 28, 62, 'Barra fria — apoio'),
  ('53', 'salao', 2, false, 28, 65, 'Barra fria — apoio'),
  ('54', 'salao', 2, false, 28, 68, 'Barra fria — apoio'),
  ('55', 'salao', 2, false, 28, 71, 'Barra fria — apoio')
on conflict (numero) do update set
  ativa = false,
  pos_x = excluded.pos_x,
  pos_y = excluded.pos_y;

update public.tables set ativa = false where numero in ('V1', 'V2');

-- 4. Casais ativos que estavam em mesa desativada voltam para a fila
--    (quem estava sentado volta como "chegou", igual à troca no mapa)
update public.reservations r
   set table_id = null,
       status = case when r.status = 'sentado'
                     then 'chegou'::public.reserva_status
                     else r.status end
 where r.table_id in (select id from public.tables where not ativa)
   and r.status in ('pre_reserva','pix_pendente','confirmada','chegou','sentado');

-- 5. Conferência — esperado: 29 ativas (24 salão + 5 varanda),
--    0 reservas ativas em mesa inativa.
select 'mesas ativas (deve ser 29)' as item, count(*)::text as valor
  from public.tables where ativa
union all
select 'salão ativas (deve ser 24)', count(*)::text
  from public.tables where ativa and area = 'salao'
union all
select 'varanda ativas (deve ser 5)', count(*)::text
  from public.tables where ativa and area = 'varanda'
union all
select 'reservas ativas em mesa inativa (deve ser 0)', count(*)::text
  from public.reservations r
  join public.tables t on t.id = r.table_id
 where not t.ativa
   and r.status in ('pre_reserva','pix_pendente','confirmada','chegou','sentado')
union all
select 'reservas ativas com mesa', count(*)::text
  from public.reservations
 where table_id is not null
   and status in ('pre_reserva','pix_pendente','confirmada','chegou','sentado');
