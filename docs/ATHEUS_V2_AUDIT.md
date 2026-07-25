# Atheus V2.0 Audit

## Executive Summary

The Atheus ecosystem is already more than a simple Discord bot. The current workspace contains a Next.js/Supabase league platform in `C:\Portfolio\atheus` and a Python/discord.py bot codebase in `C:\VPG BOT\League Bot`. Together they cover league onboarding, Discord ownership, league-scoped site administration, season setup, teams, divisions, fixtures, public league sites, EA FC result collection, match review, player statistics, roster/transfer operations, graphics, and operational monitoring.

The main V2.0 challenge is not inventing the product from nothing. It is consolidating the working pieces into one coherent league infrastructure platform. The website is the right long-term canonical surface. The bot is valuable, but it still carries legacy SQLite state, a compatibility Supabase mirror, a canonical Supabase adapter, and an older Google Sheets/MySQL EAFC26 stats pipeline. V2.0 should reduce that split-brain state and make the platform feel deliberate, reliable, and productized.

## Repositories And Apps Found

### `C:\Portfolio\atheus`

- Git repo: yes, branch observed as `codex/greenfield-atheus...origin/codex/greenfield-atheus`.
- Dirty state observed: untracked `.claude/`; not touched.
- Role: primary Atheus website and canonical multi-tenant platform.
- Framework: Next.js 16 App Router, React 19, TypeScript strict, Auth.js v5 beta, Supabase JS v2, Sentry.
- Package manager: npm with `package-lock.json`.
- Build scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm run beta:vxn:dry-run`, `npm run beta:vxn:apply`.
- Major file inventory observed: 49 `.tsx`, 43 `.ts`, 29 `.sql`, 3 `.css`, 4 `.md`.

### `C:\VPG BOT\League Bot`

- Git repo: no Git metadata found at this path.
- Role: Discord bot, legacy league operations engine, canonical adapter, EA collector host, graphics renderer.
- Framework/runtime: Python, `discord.py`, `aiosqlite`, `aiohttp`, Pillow, APScheduler, gspread, MySQL connector, requests, Sentry SDK.
- Package manager: pip via `requirements.txt`.
- Startup: `python index.py` or `python C:\VPG BOT\index.py league`.
- Major file inventory observed: 53 `.py`, 1 `.sql`, 1 `.js`, 2 `.md`, 1 `.png`.

## Product Surfaces

### Website / platform

Observed routes and surfaces:

- Studio and marketing pages: `app/page.tsx`, `app/about`, `app/services`, `app/projects`, `app/contact`, `app/upgrade`.
- Discord owner account area: `app/admin/page.tsx`.
- League site login: `app/admin/site-login`.
- League admin workspace: `app/admin/[leagueId]`.
- Tenant admin routing: `app/tenant/[leagueSlug]/admin/[[...section]]`.
- League setup: `app/admin/[leagueId]/setup`.
- Team and EA club linking: `app/admin/[leagueId]/teams`.
- Divisions: `app/admin/[leagueId]/divisions`.
- Fixtures and result controls: `app/admin/[leagueId]/fixtures`.
- Match-import review: `app/admin/[leagueId]/imports`.
- Collector operations: `app/admin/[leagueId]/collector`.
- Staff roles: `app/admin/[leagueId]/staff`.
- Player identity registry: `app/admin/[leagueId]/players`.
- Public league site: `app/leagues/[leagueSlug]`.
- Public fixture/table/stats/team/player pages: `app/leagues/[leagueSlug]/fixtures`, `table`, `stats`, `teams/[teamSlug]`, `players/[playerId]`.
- API routes: Auth.js, health, EA club search.

### Discord bot

Observed cogs and modules:

- Admin/setup commands: `cogs/admin.py`.
- Roster and transaction commands: `cogs/transactions.py`.
- Public roster commands: `cogs/public.py`.
- Moderation and coins: `cogs/moderation.py`.
- Welcome/goodbye: `cogs/welcomer.py`.
- Roster role sync: `cogs/roster_sync.py`.
- Team of the Week graphics: `totw`.
- Canonical tenant adapter and `/league` commands: `atheus_tenant`.
- Website-driven EA collector: `atheus_collector`.
- Legacy EAFC26 pipeline: `STATS EAFC26`.
- Supabase compatibility mirror: `supabase_bridge.py`.
- Supabase live stats reader: `supabase_stats.py`.

## Database And Data Model

### Canonical Supabase schema

Observed canonical tables and views include:

- `leagues`
- `league_discord_guilds`
- `league_memberships`
- `league_branding`
- `league_settings`
- `seasons`
- `competitions`
- `competition_teams`
- `league_schedule_slots`
- `teams`
- `team_ea_club_links`
- `team_replacements`
- `fixtures`
- `match_imports`
- `match_import_player_rows`
- `player_identities`
- `player_aliases`
- `matches`
- `player_match_stats`
- `team_finances`
- `roster_memberships`
- `player_loans`
- `transfer_events`
- `audit_logs`
- `collector_runs`
- `discord_jobs`
- `discord_guild_setups`
- `platform_entitlements`
- `league_creation_signals`
- `league_site_credentials`
- Read models: `atheus_public_fixtures`, `atheus_standings`, `atheus_player_totals`, `atheus_player_match_history`.

Strengths:

- UUID primary keys and league-scoped canonical tables.
- RLS enabled on core tables with browser grants revoked.
- Server-side RPCs contain many role and league checks.
- Audit logs exist and are used for many significant changes.
- Collector ingestion is service-role-only and idempotency-aware.
- Discord job queue exists for setup and announcements.
- Site credentials are hashed with scrypt and create a synthetic `site:<league_id>` admin membership.

Risks:

- Browser users do not directly use Supabase RLS policies; the Next server service-role client is the trust boundary. This is acceptable only if every route/action/RPC keeps strict checks.
- There are many migrations in a short period. The `supabase/README.md` notes the initial schema was applied manually before migration ledger tracking, so production drift must be treated as possible until checked.
- Compatibility tables and canonical tables coexist.
- Billing is modeled through entitlements, but Stripe checkout/webhooks are not implemented in the inspected code.
- Database backup/restore process is not documented in the current repository.

### Bot SQLite schema

Observed local SQLite tables include:

- `guild_settings`
- `teams`
- `team_members`
- `loans`
- `transactions`
- `canonical_transaction_outbox`
- `canonical_guild_bindings`
- `pending_signings`
- `gamertags`
- `advertisements`
- `advertisement_offers`
- `warnings`
- `coins`

Strengths:

- WAL mode and synchronous writes are enabled.
- Local writes remain durable when Supabase is temporarily unavailable.
- Canonical transaction outbox has retry state.
- Persistent Discord views are re-registered on startup.

Risks:

- SQLite is still the source of truth for important roster flows unless canonical reads/writes are fully enabled.
- `database.py` is large and centralizes many concerns.
- The bot can mirror whole guild snapshots into legacy `league_bot_*` Supabase tables, while also mirroring canonical transactions into canonical tables.

### Legacy mirror schema

`supabase_league_bot_schema.sql` creates `league_bot_*` tables and grants select to `anon` and `authenticated`. This is useful for compatibility read models, but it is not the right long-term privacy model for a league infrastructure platform.

## Auth And Permissions

### Website

- Auth.js supports Discord OAuth and a custom `league-admin` credentials provider.
- Discord OAuth scopes: `identify guilds`.
- Discord tokens are refreshed server-side.
- League owners create a league based on Discord guild ownership/management and bot installation.
- League site credentials are separate from Discord and cannot manage ownership, billing, or staff.
- `requireLeagueAccess` checks active `league_memberships` and allowed roles.
- Owner-only staff management is enforced by both route/action code and RPCs.

Strengths:

- Separation between Discord owner account area and league-site admin area is strong product positioning.
- Site credential lockout exists after repeated failures.
- Password hashing uses salted scrypt.
- Free league abuse signals are HMAC-hashed.

Risks:

- Site credential login is username/password only; V2.0 should add optional Discord handoff, passkeys, or stricter recovery flows.
- There is no obvious centralized permission manifest that maps every UI feature to roles.
- Some server actions rely heavily on database RPC checks rather than duplicating all checks in TypeScript. That is viable, but it needs route-level tests.

### Discord bot

- Admin access is based on Discord administrator, manage server, manage roles, owner, or configured manager/co-manager roles.
- Transaction commands check team manager/co-manager context.
- Tenant `/league` commands resolve guild context through Supabase RPC.
- Job execution refuses stale cross-league guild jobs.

Risks:

- Message content intent is enabled.
- Some commands can DM many users or perform destructive actions; there are confirmations in places, but V2.0 should add consistent cooldowns and audit records.
- The older live stats reader can fall back to `SUPABASE_SERVICE_ROLE_KEY` if anon key is missing. That should be removed.

## Environment Variables

### Website

Required/important:

- `AUTH_URL`
- `ATHEUS_ROOT_DOMAIN`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `ATHEUS_BOT_CLIENT_ID`
- `ATHEUS_DISCORD_BOT_TOKEN`
- `ATHEUS_BOT_PERMISSIONS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ABUSE_SIGNAL_SECRET`
- `ATHEUS_FREE_MIN_GUILD_MEMBERS`
- `EA_PROCLUBS_COOKIE`
- `EA_PROCLUBS_SEARCH_BASE_URL`
- `ATHEUS_VXN_DISCORD_GUILD_ID`
- `ATHEUS_VXN_OWNER_DISCORD_USER_ID`
- `SENTRY_*`
- `ATHEUS_ALERT_WEBHOOK`
- `ATHEUS_ALERT_URL`
- `ATHEUS_ALERT_SECRET`

### Bot

Required/important:

- `ATHEUS_BOT_TOKEN`
- `ATHEUS_BOT_CLIENT_ID`
- legacy aliases: `LEAGUE_BOT_TOKEN`, `LEAGUE_BOT_CLIENT_ID`, `RAIJIN_BOT_TOKEN`, `RAIJIN_BOT_CLIENT_ID`
- `OWNER_ID`
- `LEAGUE_GUILD_ID`
- `ATHEUS_WEBSITE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LEAGUE_SUPABASE_SYNC_*`
- `ATHEUS_COLLECTOR_*`
- `ATHEUS_EA_*`
- `ATHEUS_TENANT_*`
- `ATHEUS_DISCORD_*`
- `ATHEUS_CANONICAL_*`
- `ATHEUS_GRAPHICS_ENABLED`
- `EAFC26_*`
- `SENTRY_*`
- `ATHEUS_ALERT_*`

## Current Feature Completeness

### Complete or materially working

- Discord OAuth onboarding.
- League creation with slug/domain model.
- League-scoped site admin credentials.
- Season foundation and schedule windows.
- Team creation and EA club linking.
- Divisions and competition team assignment.
- Round-robin fixture generation and publishing.
- Fixture lifecycle controls.
- Match import approval/rejection.
- Collector target discovery and ingestion.
- Public league home, fixtures, table, stats, team pages, player pages.
- Staff role management.
- Player identity/alias/merge controls.
- Discord job queue for setup.
- Bot roster, transfers, loans, releases, advertisements, gamertags, warnings, coins.
- Canonical bot transaction outbox.
- Bot `/league` public commands with graphics.
- Monitoring via Sentry and Discord alert forwarding.

### Half-built or transitional

- Billing/premium: entitlements exist, but Stripe is not implemented.
- Canonical roster state: mirrored from bot, not clearly the sole source of truth yet.
- Discord automation: guild setup jobs exist, but broader announcements/reminders/role sync from canonical state are incomplete.
- EA FC pipeline: newer collector exists, older Google Sheets/MySQL path still exists.
- Public league sites: strong base, but no news, media, advanced analytics, or self-serve branding polish beyond CSS variables.
- Admin dashboard: functional control room, but not yet a polished operating center with cross-league status, alerts, checklists, and audit timeline.
- AI operations layer: not implemented.
- Status/backups/recovery: monitoring exists, but operational runbooks are thin.

### Should be preserved

- Canonical Supabase direction.
- Tenant subdomain model.
- Separate Discord owner account and league-site admin account.
- Service-role-only server access with revoked browser grants.
- Audit log habit in RPCs.
- Fixture generation with timezone and DST handling.
- Collector run telemetry and EA 403 cooldown.
- Canonical transaction outbox.
- Public sports-product design direction.
- Bot graphics generation.

### Should be archived or phased down

- `league_bot_*` compatibility tables as public-ish read models.
- Google Sheets/MySQL EAFC26 pipeline once canonical collector is production-proven.
- Manual legacy VXN import scripts after migration is complete and snapshotted.
- Legacy Raijin naming where it does not protect existing persistent data.
- Shutdown announcement hardcoding in `index.py` once no longer operationally relevant.

## Biggest Problems

1. Split source of truth: website canonical Supabase, bot SQLite, legacy Supabase mirror, and MySQL all coexist.
2. Product positioning split: `app/page.tsx` now positions Atheus Industries, while the league platform is framed as a case study in some docs. V2.0 needs a clear product/brand decision.
3. Security blast radius: service role is widely used server-side and in bot utilities; one stats reader can fall back to service role.
4. Billing gap: entitlements exist, but premium productization is not wired.
5. Operational reliability gap: Sentry and collector runs exist, but no full status page, backup runbook, data repair workflow, or incident checklist was found.
6. UX density mismatch: public league pages are strong, but admin workflows need a clearer operations dashboard, alerts, and progressive setup guidance.
7. Test coverage is stronger on Python adapter/collector pieces than on Next route/action/RPC behavior.
8. Database migration drift is possible due to manually applied initial schema.

## Biggest V2.0 Opportunities

1. Make Supabase canonical for all league state and turn the bot into an automation client.
2. Launch a real League OS dashboard: setup, fixtures, review queue, roster state, alerts, audit logs, and public site health in one place.
3. Build a trusted Match Centre: fixture, lineup, result package, EA evidence, manual correction history, and generated match report.
4. Productize multi-league support with branding, staff roles, tiers, and status.
5. Add AI operations as a reviewer assistant, not an uncontrolled decision-maker.
6. Replace spreadsheet/MySQL stats paths with canonical collector and approval workflows.
7. Turn public league sites into shareable sports media hubs.
8. Expose reliability as a product feature: audit logs, backups, incident status, and transparent data provenance.

## Recommended V2.0 Headline Feature

The headline feature should be:

**Atheus League OS Control Centre**

This should be the first screen after league login: a command center showing setup readiness, live fixture windows, collector state, pending imports, upcoming matchday, roster sync health, staff actions, audit activity, and public-site status. It ties together the website, Discord bot, EA collector, and public league site into one serious platform experience.

