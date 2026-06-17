begin;

-- ────────────────────────────────────────────────────────────────────────────
-- atheus_player_totals (revised): attribute stats to the team they were earned
-- with, not the player's current team.
--
-- Previously this view grouped every player_match_stats row by the player's
-- player_identities.current_team_id. Because current_team_id is overwritten to
-- the most recent team a gamertag played for, a player who moved (or whose club
-- was swapped via replace_league_team) dragged their entire stat history onto
-- the new club's page.
--
-- player_match_stats.team_id already records the team the player actually
-- represented in each match, so we now group on that. The row's team_* columns
-- are the team where the stats were earned; current_team_* is kept as a separate
-- "currently plays for" label for leaderboards and headers.
-- ────────────────────────────────────────────────────────────────────────────
drop view if exists public.atheus_player_totals;

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
  -- Team the stats were earned with (the grouping key).
  pms.team_id,
  earned_team.name as team_name,
  earned_team.slug as team_slug,
  earned_team.abbreviation as team_abbreviation,
  earned_team.logo_url as team_logo_url,
  -- Where the player currently plays, for display only.
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
join public.teams earned_team
  on earned_team.id = pms.team_id
  and earned_team.league_id = pms.league_id
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
  pms.team_id,
  earned_team.name,
  earned_team.slug,
  earned_team.abbreviation,
  earned_team.logo_url,
  pi.current_team_id,
  current_team.name,
  current_team.slug,
  current_team.abbreviation,
  current_team.logo_url;

revoke all on public.atheus_player_totals from public, anon, authenticated;
grant select on public.atheus_player_totals to service_role;

comment on view public.atheus_player_totals is
  'Approved player totals aggregated across aliases, grouped by the team the stats were earned with (team_*); current_team_* is the player''s present club for display.';

commit;
