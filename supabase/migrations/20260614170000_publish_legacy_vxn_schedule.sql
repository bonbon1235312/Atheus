begin;

update public.fixtures
set published_at = coalesce(published_at, created_at, now()),
    updated_at = now()
where external_fixture_key like 'legacy-vxn:%'
  and published_at is null;

do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.import_legacy_vxn_canonical(text,text,boolean)'::regprocedure
  )
  into v_definition;

  v_definition := replace(
    v_definition,
    'case when source_fixture.status = ''completed'' then source_fixture.updated_at else null end',
    'coalesce(source_fixture.updated_at, source_fixture.created_at, now())'
  );

  execute v_definition;
end;
$$;

commit;
