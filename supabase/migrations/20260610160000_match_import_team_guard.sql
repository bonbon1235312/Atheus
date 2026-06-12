alter table public.match_import_player_rows
  alter column team_id set not null;

comment on column public.match_import_player_rows.team_id is
  'Required fixture-team mapping for every imported player row.';
