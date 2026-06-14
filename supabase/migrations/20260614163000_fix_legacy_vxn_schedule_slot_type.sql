begin;

do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.import_legacy_vxn_canonical(text,text,boolean)'::regprocedure
  )
  into v_definition;

  if position(
    'v_season_id, NULL::uuid,' in v_definition
  ) = 0 then
    v_definition := replace(
      v_definition,
      'v_season_id, NULL,',
      'v_season_id, NULL::uuid,'
    );
    execute v_definition;
  end if;
end;
$$;

commit;
