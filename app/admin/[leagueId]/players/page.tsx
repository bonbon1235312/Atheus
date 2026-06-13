import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireLeagueAccess } from "@/lib/league-access";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  IdentityMergeForm,
  PlayerIdentityControls,
} from "./player-identity-controls";

export const dynamic = "force-dynamic";

export default async function PlayerIdentitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.discordUserId) {
    redirect("/admin");
  }

  const { leagueId } = await params;
  const access = await requireLeagueAccess(leagueId, [
    "owner",
    "admin",
    "reviewer",
  ]);
  if (!access) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim().toLowerCase() ?? "";
  const database = supabaseAdmin();
  const [{ data: identities }, { data: aliases }, { data: teams }] =
    await Promise.all([
      database
        .from("player_identities")
        .select(
          "id, canonical_name, normalized_name, discord_user_id, current_team_id, created_at",
        )
        .eq("league_id", leagueId)
        .order("canonical_name")
        .limit(1000),
      database
        .from("player_aliases")
        .select(
          "id, player_identity_id, alias, normalized_alias, source, created_at",
        )
        .eq("league_id", leagueId)
        .order("created_at"),
      database
        .from("teams")
        .select("id, name, status")
        .eq("league_id", leagueId)
        .order("name"),
    ]);

  const aliasByIdentity = new Map<
    string,
    {
      id: string;
      alias: string;
      normalizedAlias: string;
      source: string;
    }[]
  >();
  for (const alias of aliases ?? []) {
    const identityId = alias.player_identity_id as string;
    const current = aliasByIdentity.get(identityId) ?? [];
    current.push({
      id: alias.id as string,
      alias: alias.alias as string,
      normalizedAlias: alias.normalized_alias as string,
      source: alias.source as string,
    });
    aliasByIdentity.set(identityId, current);
  }

  const teamById = new Map(
    (teams ?? []).map((team) => [team.id as string, team.name as string]),
  );
  const playerOptions = (identities ?? []).map((identity) => ({
    id: identity.id as string,
    name: identity.canonical_name as string,
  }));
  const visibleIdentities = (identities ?? []).filter((identity) => {
    if (!query) {
      return true;
    }
    const names = [
      identity.canonical_name as string,
      ...(aliasByIdentity.get(identity.id as string) ?? []).map(
        (alias) => alias.alias,
      ),
    ];
    return names.some((name) => name.toLowerCase().includes(query));
  });

  return (
    <main className="workspace-page players-admin-page">
      <header className="workspace-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-mark">A</span>
          <span>ATHEUS</span>
        </Link>
        <Link className="header-link" href={`/admin/${leagueId}`}>
          Back to workspace
        </Link>
      </header>

      <section className="workspace-intro">
        <p className="eyebrow">Player registry / {access.leagueName}</p>
        <h1>Keep every career intact.</h1>
        <p>
          Search canonical players and every known alias. Correct a gamertag,
          link Discord identity and team ownership, or merge duplicates without
          splitting public statistics.
        </p>
      </section>

      <section className="teams-shell">
        <div className="section-title-row">
          <p className="step-index">High-risk control</p>
          <h2>Merge duplicate identities</h2>
        </div>
        <IdentityMergeForm leagueId={leagueId} players={playerOptions} />
      </section>

      <section className="teams-shell">
        <div className="section-title-row">
          <p className="step-index">{identities?.length ?? 0} identities</p>
          <h2>Player registry</h2>
        </div>
        <form className="player-search-form" method="get">
          <label className="field">
            <span>Search gamertag or alias</span>
            <input
              defaultValue={resolvedSearchParams.q ?? ""}
              name="q"
              placeholder="Start typing a gamertag"
            />
          </label>
          <button className="button button-secondary" type="submit">
            Search players
          </button>
          {query ? (
            <Link className="text-button" href={`/admin/${leagueId}/players`}>
              Clear search
            </Link>
          ) : null}
        </form>

        {visibleIdentities.length ? (
          <div className="player-identity-list">
            {visibleIdentities.map((identity) => {
              const identityId = identity.id as string;
              const identityAliases = aliasByIdentity.get(identityId) ?? [];
              return (
                <article key={identityId}>
                  <div className="player-identity-heading">
                    <span>
                      <strong>{identity.canonical_name as string}</strong>
                      <small>
                        {identityAliases.length} alias
                        {identityAliases.length === 1 ? "" : "es"}
                      </small>
                    </span>
                    <span>
                      <strong>
                        {teamById.get(identity.current_team_id as string) ??
                          "Unattached"}
                      </strong>
                      <small>
                        {identity.discord_user_id
                          ? `Discord ${identity.discord_user_id as string}`
                          : "No Discord link"}
                      </small>
                    </span>
                  </div>
                  <PlayerIdentityControls
                    aliases={identityAliases}
                    identity={{
                      id: identityId,
                      canonicalName: identity.canonical_name as string,
                      normalizedName: identity.normalized_name as string,
                      discordUserId:
                        (identity.discord_user_id as string | null) ?? null,
                      currentTeamId:
                        (identity.current_team_id as string | null) ?? null,
                    }}
                    leagueId={leagueId}
                    teams={(teams ?? []).map((team) => ({
                      id: team.id as string,
                      name: `${team.name as string}${team.status === "active" ? "" : ` (${team.status as string})`}`,
                    }))}
                  />
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">
            No canonical player or alias matched that search.
          </p>
        )}
      </section>
    </main>
  );
}
