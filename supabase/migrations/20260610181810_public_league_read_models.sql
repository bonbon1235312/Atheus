begin;

drop view if exists public.atheus_player_match_history;
drop view if exists public.atheus_player_totals;
drop view if exists public.atheus_standings;
drop view if exists public.atheus_public_fixtures;

create view public.atheus_public_fixtures
with (security_invoker = true)
as
select
  f.id,
  f.league_id,
  l.slug as league_slug,
  f.season_id,
  s.name as season_name,
  s.slug as season_slug,
  f.competition_id,
  c.name as competition_name,
  c.slug as competition_slug,
  c.kind as competition_kind,
  f.gameday_number,
  f.round_label,
  f.kickoff_at,
  f.status,
  f.home_team_id,
  home.name as home_team_name,
  home.slug as home_team_slug,
  home.abbreviation as home_team_abbreviation,
  home.logo_url as home_team_logo_url,
  home.primary_colour as home_team_primary_colour,
  f.away_team_id,
  away.name as away_team_name,
  away.slug as away_team_slug,
  away.abbreviation as away_team_abbreviation,
  away.logo_url as away_team_logo_url,
  away.primary_colour as away_team_primary_colour,
  case when m.id is not null then m.home_score else null end as home_score,
  case when m.id is not null then m.away_score else null end as away_score,
  case when m.id is not null then m.result_source else null end as result_source,
  f.result_note,
  (m.id is not null) as has_approved_result,
  coalesce(m.is_forfeit, false) as is_forfeit,
  coalesce(m.is_void, false) as is_void,
  m.approved_at
from public.fixtures f
join public.leagues l on l.id = f.league_id
join public.seasons s on s.id = f.season_id and s.league_id = f.league_id
join public.competitions c on c.id = f.competition_id and c.league_id = f.league_id
join public.teams home on home.id = f.home_team_id and home.league_id = f.league_id
join public.teams away on away.id = f.away_team_id and away.league_id = f.league_id
left join public.matches m
  on m.fixture_id = f.id
  and m.league_id = f.league_id
where l.status = 'active'
  and f.published_at is not null
  and f.status <> 'cancelled';

create view public.atheus_standings
with (security_invoker = true)
as
with eligible_teams as (
  select
    l.id as league_id,
    l.slug as league_slug,
    s.id as season_id,
    s.name as season_name,
    c.id as competition_id,
    c.name as competition_name,
    t.id as team_id,
    t.name as team_name,
    t.slug as team_slug,
    t.abbreviation,
    t.logo_url,
    t.primary_colour
  from public.leagues l
  join public.seasons s
    on s.league_id = l.id
    and s.status in ('active', 'completed')
  join public.competitions c
    on c.league_id = l.id
    and c.season_id = s.id
    and c.kind = 'league'
    and c.active
  join public.teams t
    on t.league_id = l.id
    and t.status in ('active', 'replaced')
  where l.status = 'active'
),
team_results as (
  select
    f.league_id,
    f.season_id,
    f.competition_id,
    f.home_team_id as team_id,
    m.home_score as goals_for,
    m.away_score as goals_against,
    (m.home_score > m.away_score)::integer as won,
    (m.home_score = m.away_score)::integer as drawn,
    (m.home_score < m.away_score)::integer as lost
  from public.matches m
  join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
  join public.competitions c
    on c.id = f.competition_id
    and c.league_id = f.league_id
    and c.kind = 'league'
  where not m.is_void

  union all

  select
    f.league_id,
    f.season_id,
    f.competition_id,
    f.away_team_id as team_id,
    m.away_score as goals_for,
    m.home_score as goals_against,
    (m.away_score > m.home_score)::integer as won,
    (m.away_score = m.home_score)::integer as drawn,
    (m.away_score < m.home_score)::integer as lost
  from public.matches m
  join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
  join public.competitions c
    on c.id = f.competition_id
    and c.league_id = f.league_id
    and c.kind = 'league'
  where not m.is_void
),
aggregated as (
  select
    tr.league_id,
    tr.season_id,
    tr.competition_id,
    tr.team_id,
    count(*)::integer as played,
    sum(tr.won)::integer as won,
    sum(tr.drawn)::integer as drawn,
    sum(tr.lost)::integer as lost,
    sum(tr.goals_for)::integer as goals_for,
    sum(tr.goals_against)::integer as goals_against
  from team_results tr
  group by tr.league_id, tr.season_id, tr.competition_id, tr.team_id
)
select
  et.league_id,
  et.league_slug,
  et.season_id,
  et.season_name,
  et.competition_id,
  et.competition_name,
  et.team_id,
  et.team_name,
  et.team_slug,
  et.abbreviation,
  et.logo_url,
  et.primary_colour,
  coalesce(a.played, 0)::integer as played,
  coalesce(a.won, 0)::integer as won,
  coalesce(a.drawn, 0)::integer as drawn,
  coalesce(a.lost, 0)::integer as lost,
  coalesce(a.goals_for, 0)::integer as goals_for,
  coalesce(a.goals_against, 0)::integer as goals_against,
  (coalesce(a.goals_for, 0) - coalesce(a.goals_against, 0))::integer
    as goal_difference,
  (
    coalesce(a.won, 0) * settings.points_for_win
    + coalesce(a.drawn, 0) * settings.points_for_draw
    + coalesce(a.lost, 0) * settings.points_for_loss
  )::integer as points
from eligible_teams et
join public.league_settings settings on settings.league_id = et.league_id
left join aggregated a
  on a.league_id = et.league_id
  and a.season_id = et.season_id
  and a.competition_id = et.competition_id
  and a.team_id = et.team_id;

create view public.atheus_player_totals
with (security_invoker = true)
as
select
  pms.league_id,
  l.slug as league_slug,
  f.season_id,
  s.name as season_name,
  f.competition_id,
  c.name as competition_name,
  c.kind as competition_kind,
  pms.player_identity_id,
  pi.canonical_name as player_name,
  pi.current_team_id,
  current_team.name as current_team_name,
  current_team.slug as current_team_slug,
  current_team.abbreviation as current_team_abbreviation,
  current_team.logo_url as current_team_logo_url,
  count(distinct pms.match_id)::integer as matches_played,
  sum(pms.goals)::integer as goals,
  sum(pms.assists)::integer as assists,
  sum(pms.goals + pms.assists)::integer as goal_contributions,
  round(avg(pms.rating), 2) as average_rating,
  sum(coalesce(pms.shots, 0))::integer as shots,
  sum(coalesce(pms.passes_made, 0))::integer as passes_made,
  sum(coalesce(pms.pass_attempts, 0))::integer as pass_attempts,
  case
    when sum(coalesce(pms.pass_attempts, 0)) > 0
      then round(
        sum(coalesce(pms.passes_made, 0))::numeric
        / sum(coalesce(pms.pass_attempts, 0))::numeric
        * 100,
        2
      )
    else null
  end as pass_accuracy_pct,
  sum(coalesce(pms.tackles_made, 0))::integer as tackles_made,
  sum(coalesce(pms.saves, 0))::integer as saves,
  sum(coalesce(pms.red_cards, 0))::integer as red_cards,
  count(*) filter (where pms.clean_sheet is true)::integer as clean_sheets,
  array_remove(array_agg(distinct upper(pms.position_code)), null) as positions_played,
  max(f.kickoff_at) as last_played_at
from public.player_match_stats pms
join public.matches m
  on m.id = pms.match_id
  and m.league_id = pms.league_id
  and not m.is_void
join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
join public.seasons s on s.id = f.season_id and s.league_id = f.league_id
join public.competitions c
  on c.id = f.competition_id
  and c.league_id = f.league_id
join public.leagues l on l.id = pms.league_id and l.status = 'active'
join public.league_settings settings
  on settings.league_id = pms.league_id
  and settings.public_stats_enabled
join public.player_identities pi
  on pi.id = pms.player_identity_id
  and pi.league_id = pms.league_id
left join public.teams current_team
  on current_team.id = pi.current_team_id
  and current_team.league_id = pi.league_id
group by
  pms.league_id,
  l.slug,
  f.season_id,
  s.name,
  f.competition_id,
  c.name,
  c.kind,
  pms.player_identity_id,
  pi.canonical_name,
  pi.current_team_id,
  current_team.name,
  current_team.slug,
  current_team.abbreviation,
  current_team.logo_url;

create view public.atheus_player_match_history
with (security_invoker = true)
as
select
  pms.id,
  pms.league_id,
  l.slug as league_slug,
  f.season_id,
  s.name as season_name,
  f.competition_id,
  c.name as competition_name,
  c.kind as competition_kind,
  pms.player_identity_id,
  pi.canonical_name as player_name,
  pms.team_id,
  player_team.name as team_name,
  player_team.slug as team_slug,
  player_team.abbreviation as team_abbreviation,
  case
    when pms.team_id = f.home_team_id then f.away_team_id
    else f.home_team_id
  end as opponent_team_id,
  case
    when pms.team_id = f.home_team_id then away.name
    else home.name
  end as opponent_team_name,
  case
    when pms.team_id = f.home_team_id then away.slug
    else home.slug
  end as opponent_team_slug,
  f.kickoff_at,
  case
    when pms.team_id = f.home_team_id then m.home_score
    else m.away_score
  end as team_score,
  case
    when pms.team_id = f.home_team_id then m.away_score
    else m.home_score
  end as opponent_score,
  pms.position_code,
  pms.goals,
  pms.assists,
  pms.rating,
  pms.shots,
  pms.passes_made,
  pms.pass_attempts,
  pms.pass_accuracy_pct,
  pms.tackles_made,
  pms.saves,
  pms.red_cards,
  pms.minutes_played,
  pms.clean_sheet
from public.player_match_stats pms
join public.matches m
  on m.id = pms.match_id
  and m.league_id = pms.league_id
  and not m.is_void
join public.fixtures f on f.id = m.fixture_id and f.league_id = m.league_id
join public.seasons s on s.id = f.season_id and s.league_id = f.league_id
join public.competitions c
  on c.id = f.competition_id
  and c.league_id = f.league_id
join public.leagues l on l.id = pms.league_id and l.status = 'active'
join public.league_settings settings
  on settings.league_id = pms.league_id
  and settings.public_stats_enabled
join public.player_identities pi
  on pi.id = pms.player_identity_id
  and pi.league_id = pms.league_id
join public.teams player_team
  on player_team.id = pms.team_id
  and player_team.league_id = pms.league_id
join public.teams home on home.id = f.home_team_id and home.league_id = f.league_id
join public.teams away on away.id = f.away_team_id and away.league_id = f.league_id;

revoke all on public.atheus_public_fixtures from public, anon, authenticated;
revoke all on public.atheus_standings from public, anon, authenticated;
revoke all on public.atheus_player_totals from public, anon, authenticated;
revoke all on public.atheus_player_match_history from public, anon, authenticated;

grant select on public.atheus_public_fixtures to service_role;
grant select on public.atheus_standings to service_role;
grant select on public.atheus_player_totals to service_role;
grant select on public.atheus_player_match_history to service_role;

comment on view public.atheus_public_fixtures is
  'Published fixtures with scorelines sourced only from canonical approved matches.';
comment on view public.atheus_standings is
  'Full approved league table including eligible teams that have not played yet.';
comment on view public.atheus_player_totals is
  'Approved player totals aggregated across aliases and historical team changes.';
comment on view public.atheus_player_match_history is
  'Approved per-match player statistics for public player detail pages.';

commit;
