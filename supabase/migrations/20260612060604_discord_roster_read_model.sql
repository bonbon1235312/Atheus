-- Tenant-safe compatibility payload for existing League Bot roster commands.

create or replace function public.atheus_discord_roster_read_model(
  p_discord_guild_id text
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with guild_context as (
    select mapping.league_id
    from (
      select guild.league_id
      from public.league_discord_guilds guild
      where guild.discord_guild_id = btrim(p_discord_guild_id)
        and guild.unlinked_at is null

      union

      select team.league_id
      from public.teams team
      where team.discord_guild_id = btrim(p_discord_guild_id)
        and team.status = 'active'
    ) mapping
    limit 1
  ),
  current_season as (
    select season.id, season.league_id, season.name
    from public.seasons season
    join guild_context context on context.league_id = season.league_id
    order by
      case season.status when 'active' then 0 when 'draft' then 1 else 2 end,
      season.starts_on desc nulls last,
      season.created_at desc
    limit 1
  ),
  ranked_standings as (
    select
      standings.*,
      row_number() over (
        partition by standings.league_id, standings.season_id
        order by
          standings.points desc,
          standings.goal_difference desc,
          standings.goals_for desc,
          standings.team_name
      )::integer as table_position
    from public.atheus_standings standings
    join guild_context context on context.league_id = standings.league_id
    join current_season season on season.id = standings.season_id
  ),
  team_rows as (
    select
      team.id,
      team.league_id,
      team.name,
      team.slug,
      team.abbreviation,
      team.discord_role_id,
      team.discord_guild_id,
      team.logo_url,
      team.primary_colour,
      coalesce(finance.budget, 0) as budget,
      coalesce(standings.played, 0) as played,
      coalesce(standings.won, 0) as won,
      coalesce(standings.drawn, 0) as drawn,
      coalesce(standings.lost, 0) as lost,
      coalesce(standings.goals_for, 0) as goals_for,
      coalesce(standings.goals_against, 0) as goals_against,
      coalesce(standings.goal_difference, 0) as goal_difference,
      coalesce(standings.points, 0) as points,
      coalesce(standings.table_position, 0) as table_position
    from public.teams team
    join guild_context context on context.league_id = team.league_id
    join current_season season on season.league_id = team.league_id
    left join public.team_finances finance
      on finance.league_id = team.league_id
      and finance.season_id = season.id
      and finance.team_id = team.id
    left join ranked_standings standings
      on standings.league_id = team.league_id
      and standings.season_id = season.id
      and standings.team_id = team.id
    where team.status in ('active', 'replaced')
  )
  select jsonb_build_object(
    'league_id', league.id,
    'league_name', league.name,
    'league_slug', league.slug,
    'season_id', season.id,
    'season_name', season.name,
    'timezone', league.timezone,
    'teams', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', team.id,
          'name', team.name,
          'slug', team.slug,
          'abbreviation', team.abbreviation,
          'role_id', team.discord_role_id,
          'discord_guild_id', team.discord_guild_id,
          'logo_url', team.logo_url,
          'primary_colour', team.primary_colour,
          'budget', team.budget,
          'played', team.played,
          'wins', team.won,
          'draws', team.drawn,
          'losses', team.lost,
          'goals_for', team.goals_for,
          'goals_against', team.goals_against,
          'goal_difference', team.goal_difference,
          'points', team.points,
          'table_position', team.table_position,
          'members', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'user_id', identity.discord_user_id,
                'player_identity_id', identity.id,
                'player_name', identity.canonical_name,
                'is_manager', membership.is_manager,
                'is_co_manager', membership.is_co_manager,
                'strike_active', membership.strike_active,
                'joined_at', membership.joined_at
              )
              order by
                membership.is_manager desc,
                membership.is_co_manager desc,
                identity.canonical_name
            )
            from public.roster_memberships membership
            join public.player_identities identity
              on identity.league_id = membership.league_id
              and identity.id = membership.player_identity_id
            where membership.league_id = team.league_id
              and membership.season_id = season.id
              and membership.team_id = team.id
              and membership.status = 'active'
              and membership.left_at is null
          ), '[]'::jsonb)
        )
        order by
          case when team.table_position > 0 then team.table_position else 9999 end,
          team.name
      )
      from team_rows team
    ), '[]'::jsonb),
    'loans', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', loan.id,
          'player_user_id', identity.discord_user_id,
          'player_identity_id', identity.id,
          'player_name', identity.canonical_name,
          'source_team_id', source.id,
          'source_team_name', source.name,
          'destination_team_id', destination.id,
          'destination_team_name', destination.name,
          'expires_at', loan.expires_at,
          'note', loan.note
        )
        order by loan.expires_at nulls last, identity.canonical_name
      )
      from public.player_loans loan
      join public.player_identities identity
        on identity.league_id = loan.league_id
        and identity.id = loan.player_identity_id
      join public.teams source
        on source.league_id = loan.league_id
        and source.id = loan.source_team_id
      join public.teams destination
        on destination.league_id = loan.league_id
        and destination.id = loan.destination_team_id
      where loan.league_id = league.id
        and loan.season_id = season.id
        and loan.status = 'active'
        and loan.ended_at is null
    ), '[]'::jsonb)
  )
  from guild_context context
  join public.leagues league on league.id = context.league_id
  join current_season season on season.league_id = league.id;
$$;

revoke all on function public.atheus_discord_roster_read_model(text)
  from public, anon, authenticated;
grant execute on function public.atheus_discord_roster_read_model(text)
  to service_role;

comment on function public.atheus_discord_roster_read_model(text) is
  'Guild-scoped canonical roster payload for compatibility League Bot commands.';
