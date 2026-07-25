# Atheus V2.0 Roadmap

## Stage 0 - Stabilise Current Platform

Goal:

Create a known-good baseline before major changes.

Tasks:

- Run and record `npm run lint`, `npm run typecheck`, and `npm run build` in `C:\Portfolio\atheus`.
- Run the Python unit tests in `C:\VPG BOT\League Bot`.
- Verify live Supabase schema against local migrations.
- Snapshot production Supabase and bot SQLite data before any migration.
- Remove service-role fallback from the bot stats reader.
- Create an env inventory for website, bot, collector, and old EAFC26 pipeline.
- Document the current deployment topology.
- Identify which feature flags are enabled in production.
- Add baseline route/action tests for critical website permissions.

Expected outcome:

The team knows what is running, what is tested, and what data must be protected.

Risk level:

Low. Mostly inspection and hardening.

Estimated complexity:

Medium, because live schema drift is possible.

Suggested order of files/components:

1. `package.json`
2. `requirements.txt`
3. `.env.example` files
4. `supabase/README.md`
5. `supabase/migrations`
6. `auth.ts`
7. `lib/supabase-admin.ts`
8. `supabase_stats.py`
9. `database.py`
10. `tests`

## Stage 1 - V2.0 Foundation

Goal:

Make canonical platform boundaries explicit.

Tasks:

- Define one canonical data ownership model.
- Write a role and permission matrix.
- Add a typed platform domain layer for leagues, teams, fixtures, players, and staff.
- Centralize server action permission helpers.
- Add integration tests for owner/admin/reviewer/fixture_manager/site-admin access.
- Add an audit timeline query and component.
- Add a queue status model for Discord jobs and collector state.
- Define archive/suspend semantics for leagues.

Expected outcome:

The platform has clear boundaries before new features are layered on.

Risk level:

Medium.

Estimated complexity:

Medium-high.

Suggested order:

1. `lib/league-access.ts`
2. `auth.ts`
3. `app/admin/[leagueId]/*/actions.ts`
4. `supabase/migrations/*staff*`
5. `supabase/migrations/*fixture*`
6. `lib/database.types.ts`
7. new tests

## Stage 2 - Dashboard Rebuild

Goal:

Turn the admin workspace into the Atheus League OS Control Centre.

Tasks:

- Replace workspace cards with an operations dashboard.
- Add setup checklist with blockers.
- Add matchday panel.
- Add collector health and EA cooldown panel.
- Add pending imports panel.
- Add Discord job queue panel.
- Add roster sync health.
- Add recent audit activity.
- Add public-site preview/status.
- Add role-specific views for owner, admin, fixture manager, and reviewer.

Expected outcome:

Owners and staff can understand the entire league state from one page.

Risk level:

Medium.

Estimated complexity:

High.

Suggested order:

1. `app/admin/[leagueId]/page.tsx`
2. `app/admin/[leagueId]/collector/page.tsx`
3. `app/admin/[leagueId]/imports/page.tsx`
4. `app/admin/[leagueId]/fixtures/page.tsx`
5. `lib/public-league-data.ts`
6. new `lib/admin-dashboard-data.ts`
7. `app/globals.css`

## Stage 3 - Discord Automation Upgrade

Goal:

Make Discord automation configurable and auditable from the platform.

Tasks:

- Expand `discord_jobs` job types for announcements, reminders, role sync, and setup repair.
- Add web UI for Discord automation settings.
- Add job retry/readback controls.
- Add channel/template configuration.
- Add match reminders based on fixtures.
- Add role sync from canonical roster state.
- Add manager/player notification preferences where practical.
- Keep every Discord side effect idempotent.

Expected outcome:

Discord becomes a reliable automation worker, not an untracked command surface.

Risk level:

Medium-high.

Estimated complexity:

High.

Suggested order:

1. `supabase/migrations/*discord_tenant_adapter*`
2. `lib/discord-jobs.ts`
3. `atheus_tenant/cog.py`
4. `atheus_tenant/guild_setup.py`
5. `cogs/roster_sync.py`
6. new website Discord automation page

## Stage 4 - EA FC Stats And Verification

Goal:

Make canonical EA collection the only long-term stats pipeline.

Tasks:

- Build a Match Evidence page.
- Add replay/recheck controls for collector packages.
- Add collector job/run drilldowns.
- Add confidence explanations.
- Add raw payload storage policy and retention decision.
- Add stat validation checks for impossible rows.
- Add manual correction comparison view.
- Migrate or archive Google Sheets/MySQL EAFC26 pipeline.
- Add tests for parser and matching edge cases.

Expected outcome:

EA results feel verified, explainable, and recoverable.

Risk level:

High, because stats trust is core product trust.

Estimated complexity:

High.

Suggested order:

1. `atheus_collector/parser.py`
2. `atheus_collector/matching.py`
3. `atheus_collector/service.py`
4. `supabase/migrations/*collector*`
5. `app/admin/[leagueId]/imports`
6. `app/admin/[leagueId]/collector`
7. `STATS EAFC26` archive plan

## Stage 5 - AI Operations Layer

Goal:

Add AI assistance without weakening trust.

Tasks:

- Add rule lookup over league rules/docs.
- Add match report drafts from approved match data.
- Add transfer window summaries.
- Add suspicious import flags based on deterministic checks first.
- Add fixture suggestion assistant.
- Add admin support assistant.
- Add an AI activity log.
- Require human confirmation for every write.

Expected outcome:

Admins save time, but the platform remains deterministic and auditable.

Risk level:

Medium-high.

Estimated complexity:

High.

Suggested order:

1. Create `league_documents` or rules storage.
2. Add AI prompt/evidence logging tables.
3. Add report generation after match approval.
4. Add dashboard AI suggestions.
5. Add review queue flags.

## Stage 6 - Public League Sites

Goal:

Make league sites impressive enough to share as the product.

Tasks:

- Build full Match Centre pages.
- Add generated match reports.
- Add team form and player form views.
- Add news/announcement pages.
- Add better mobile filters.
- Add public verification markers.
- Add league branding controls.
- Add SEO metadata per league/team/player/match.
- Add Open Graph images if feasible.

Expected outcome:

Players and managers treat the league site as the official home of the league.

Risk level:

Medium.

Estimated complexity:

High.

Suggested order:

1. `app/leagues/[leagueSlug]/page.tsx`
2. `app/leagues/[leagueSlug]/fixtures/page.tsx`
3. new match route
4. `app/leagues/[leagueSlug]/stats/page.tsx`
5. `app/leagues/[leagueSlug]/teams/[teamSlug]/page.tsx`
6. `app/leagues/[leagueSlug]/players/[playerId]/page.tsx`
7. `app/leagues/[leagueSlug]/public.css`

## Stage 7 - Premium And Productisation

Goal:

Turn Atheus into a paid, supportable platform.

Tasks:

- Implement Stripe checkout and webhooks.
- Make Stripe the only writer of premium entitlement state.
- Add plan limits.
- Add owner billing portal.
- Add support workflow.
- Add internal admin/operator dashboard.
- Add customer onboarding checklist.
- Add backups, recovery, and incident runbooks.
- Add terms/privacy/data-retention docs.

Expected outcome:

Atheus is ready for real leagues and future clients.

Risk level:

High.

Estimated complexity:

High.

Suggested order:

1. `platform_entitlements` schema review
2. billing migrations
3. Stripe route handlers
4. owner billing UI
5. entitlement checks in creation and feature gates
6. operator dashboard
7. legal/support docs

## Recommended First 10 Implementation Tasks

1. Remove service-role fallback from `supabase_stats.py` and require `SUPABASE_ANON_KEY` for that reader.
2. Run and record website lint/typecheck/build and bot tests.
3. Verify live Supabase schema against the full migration set.
4. Create a permission matrix document and matching route/action test plan.
5. Add tests for `requireLeagueAccess` and site-admin role behavior.
6. Build the League OS Control Centre data loader.
7. Replace the admin workspace card grid with operational sections.
8. Add audit timeline UI and query.
9. Add Discord job queue visibility.
10. Add Match Evidence page for imports.

