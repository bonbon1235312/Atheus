# Atheus V2.0 Execution Plan

## Execution Principles

1. Do not rewrite first.
2. Stabilize and verify the current system.
3. Make Supabase canonical by stages.
4. Keep Discord automation, but move control into the platform.
5. Preserve valuable bot workflows until web/canonical replacements are tested.
6. Add tests before broad permission refactors.
7. Treat data migration as a product risk, not a background chore.
8. Launch V2.0 through a staging/pilot league before broad release.

## Phase 0 - Baseline And Safety

### 0.1 Record current checks

Run in `C:\Portfolio\atheus`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Run in `C:\VPG BOT\League Bot`:

```powershell
python -m unittest discover -s tests
```

Record failures before changing behavior.

### 0.2 Verify live Supabase schema

Tasks:

- Compare production tables/functions/grants to `supabase/migrations`.
- Confirm the initial manual schema is equivalent to local migrations.
- Confirm read models exist:
  - `atheus_public_fixtures`
  - `atheus_standings`
  - `atheus_player_totals`
  - `atheus_player_match_history`
- Confirm service-role-only functions are not executable by `anon` or `authenticated`.

### 0.3 Snapshot data

Tasks:

- Backup Supabase production.
- Backup bot SQLite DB.
- Export current environment variable names, not secret values.
- Record bot host path for database resolution.

### 0.4 Fix immediate security footgun

Change:

- Remove `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SERVICE_KEY` fallback from `supabase_stats.py`.
- Require `SUPABASE_ANON_KEY` for the old live-stats reader.

Why first:

This is a small change with meaningful blast-radius reduction.

## Phase 1 - Access And Trust Foundation

### 1.1 Permission matrix

Create a doc/table defining access for:

- Discord owner
- owner
- admin
- fixture_manager
- reviewer
- site admin
- manager
- player
- worker
- public visitor

Map each action:

- league create
- billing
- site credential rotate
- staff add/remove
- setup season
- create team
- link EA club
- manage divisions
- preview/publish fixtures
- reschedule/postpone/cancel
- clear fixtures
- approve/reject import
- override result
- erase player stats
- edit player identity
- merge player identity
- toggle collector
- Discord automation settings

### 1.2 Add permission tests

Target files:

- `auth.ts`
- `lib/league-access.ts`
- `app/admin/[leagueId]/*/actions.ts`
- Supabase RPCs where practical.

Minimum cases:

- unauthenticated denied
- wrong league denied
- site admin allowed for operational admin actions
- site admin denied for owner-only actions
- reviewer cannot publish fixtures
- fixture manager cannot approve imports
- admin cannot manage owner credential if policy says owner-only

### 1.3 Centralize admin data loading

Add:

- `lib/admin-dashboard-data.ts`
- `lib/audit-log.ts`
- `lib/job-status.ts`

Move repeated page queries into these modules.

## Phase 2 - League OS Control Centre

### 2.1 Build read-only dashboard data

Data required:

- league identity/status
- current season
- team count
- linked EA count
- division count
- fixture counts by status
- pending import count
- last collector run
- next collector window
- failed Discord job count
- outbox pending count
- recent audit rows
- public site URL

### 2.2 Replace workspace card grid

Target:

- `app/admin/[leagueId]/page.tsx`
- `app/globals.css`

New sections:

- Operations summary
- Matchday
- Review queue
- Automation health
- Setup readiness
- Recent audit
- Next actions

### 2.3 Add role-specific dashboards

Owner sees:

- billing
- staff
- credentials
- setup

Admin sees:

- setup
- teams
- divisions
- fixtures
- collector

Reviewer sees:

- imports
- players
- corrections

Fixture manager sees:

- fixtures
- schedule health

## Phase 3 - Audit Timeline

### 3.1 Create audit loader

Target:

- `audit_logs` table.
- Optional view: `league_audit_timeline`.

Fields:

- time
- actor
- action
- entity
- summary
- before/after

### 3.2 Add admin UI

Add:

- dashboard preview of latest actions
- full audit page
- filters by action/entity/actor

### 3.3 Normalize missing audit coverage

Review actions and fill gaps:

- bot roster/transfer operations
- Discord job execution
- collector replay
- AI actions later

## Phase 4 - Match Review And Evidence

### 4.1 Add import detail page

Target:

- `app/admin/[leagueId]/imports`

Show:

- fixture
- detected EA match
- confidence
- score
- player rows
- diagnostics
- duplicate/idempotency state
- review history

### 4.2 Add deterministic flags

Examples:

- impossible score
- no player rows
- unexpected club pair
- duplicate EA match ID
- kickoff too far from fixture
- player stat outliers

### 4.3 Add replay request

Use a queued worker pattern. Do not run replay directly in a server action.

## Phase 5 - Canonical Roster Migration

### 5.1 Expose sync health

Show:

- canonical guild binding
- last roster snapshot
- pending outbox rows
- failed outbox rows
- last Supabase mirror error

### 5.2 Move reads first

Already partially supported:

- `/managerlist`
- `/viewteam`
- `/showroster`
- `/missinggamertags`
- `/allrosters`

Plan:

- Enable canonical reads in staging.
- Compare output against SQLite.
- Record mismatches.
- Fix read model/RPC.

### 5.3 Move writes second

For each transaction type:

- sign
- sell
- loan
- recall
- release
- co-manager changes
- transfer market

Approach:

- Keep SQLite transaction.
- Write outbox.
- Mirror to canonical.
- Verify canonical event.
- Eventually invert to canonical-first.

Do not remove SQLite until rollback path is clear.

## Phase 6 - Discord Automation Product Layer

### 6.1 Add Discord automation settings

Schema:

- channels
- templates
- reminder offsets
- role sync enabled
- announcement preferences

### 6.2 Expand job types

Add:

- match reminders
- role sync
- setup repair
- announcement templates
- report publish

### 6.3 Add job dashboard

Show:

- queued
- leased
- failed
- completed recent
- retry time
- worker ID
- last error

## Phase 7 - Public Site V2

### 7.1 Match Centre

Add public route for fixture/match details.

### 7.2 Reports

Add match report storage and rendering.

### 7.3 Branding controls

Add:

- contrast validation
- theme presets
- logo checks
- preview

### 7.4 Mobile pass

Verify:

- public home
- fixtures
- table
- stats
- player profile
- match centre

## Phase 8 - AI Operations

### 8.1 Rules/documents

Add league documents storage and retrieval.

### 8.2 Low-risk AI

Start with:

- rule lookup
- match report drafts
- transfer summaries

### 8.3 AI audit

Record:

- prompt source
- source rows/documents
- generated text
- actor
- approval state

### 8.4 Higher-risk AI later

Only after deterministic checks:

- suspicious import explanations
- fixture suggestions
- admin task suggestions

## Phase 9 - Billing And Productisation

### 9.1 Stripe

Implement:

- checkout
- webhook
- billing portal
- entitlement updates

Rule:

Stripe webhook should be the only writer of premium entitlement state.

### 9.2 Plan limits

Plan gates:

- number of leagues
- public branding features
- AI reports
- custom domains later
- support tier

### 9.3 Support and operations

Add:

- support contact flow
- internal operator view
- incident runbook
- backup runbook
- customer onboarding checklist

## First 10 Tasks To Start Now

1. Put `C:\VPG BOT\League Bot` under Git or document why it must remain outside Git temporarily.
2. Remove service-role fallback from `supabase_stats.py`.
3. Run current website lint/typecheck/build and bot tests.
4. Verify live Supabase schema and grants.
5. Create a permission matrix.
6. Add permission regression tests for website actions/RPCs.
7. Add dashboard data loader for League OS Control Centre.
8. Rebuild `app/admin/[leagueId]/page.tsx` into operations dashboard.
9. Add audit timeline query and UI.
10. Add import detail/evidence page.

## Commands To Run Next

Website:

```powershell
cd C:\Portfolio\atheus
npm run lint
npm run typecheck
npm run build
```

Bot:

```powershell
cd "C:\VPG BOT\League Bot"
python -m unittest discover -s tests
```

Git status:

```powershell
git -C C:\Portfolio\atheus status --short --branch
```

Supabase:

```powershell
cd C:\Portfolio\atheus
npm run beta:vxn:dry-run
```

Only run the VXN apply command after confirming production env vars and backup state.

