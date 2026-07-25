# Atheus V2.0 Architecture Recommendation

## Recommended Architecture

Atheus V2.0 should use the existing Next.js/Supabase platform as the canonical application and the Python Discord bot as an automation worker. The bot should remain excellent at Discord-specific behavior, but core league state should converge into Supabase.

Recommended model:

- Next.js app: product UI, admin workflows, public league sites, server-side actions, API routes.
- Supabase Postgres: canonical league database, RPC guardrails, audit logs, jobs, read models.
- Python bot: Discord command surface and automation worker.
- EA collector: private worker process hosted with the bot or separated later.
- Background jobs: Supabase-backed queues first, dedicated worker system later only if needed.
- Monitoring: Sentry plus Discord alerts, extended with dashboard-visible operational state.

## Frontend Architecture

Keep:

- Next.js App Router.
- Server components for data-heavy pages.
- Server actions for authenticated admin mutations.
- Public league ISR where safe.
- CSS variable theming per league.

Improve:

- Split the large `app/globals.css` into clearer layers:
  - base/studio
  - admin
  - forms
  - operations dashboard
  - public league
- Create shared admin components for:
  - operation panels
  - status chips
  - audit timeline rows
  - empty states
  - dangerous action confirmations
  - stat cards
  - tables
- Add data loader modules for admin pages instead of embedding many Supabase queries directly in page components.
- Add Playwright or route tests for tenant admin flows.

Recommended structure:

```text
app/
  admin/
  leagues/
  tenant/
components/
  admin/
  public-league/
  forms/
lib/
  access/
  admin-dashboard/
  public-league/
  jobs/
  monitoring/
```

Do not build a separate frontend app yet. The current Next app is sufficient and avoids unnecessary deployment complexity.

## Backend/API Architecture

Current backend is mostly:

- Next server actions.
- Supabase service-role server client.
- Supabase RPC functions.
- A few Next route handlers.

Recommended V2.0 approach:

- Keep server actions for form/workflow mutations.
- Keep Supabase RPCs for multi-row transactional changes.
- Introduce small service modules for business logic and permission checks.
- Avoid direct table writes in server actions when the write has business rules; use RPCs.
- Keep route handlers for external callbacks, search APIs, and webhooks.

Important rule:

Every service-role query must be protected by one of:

- prior `requireLeagueAccess` check,
- Discord owner session check,
- league-site session check,
- RPC-internal membership check,
- non-user worker key path.

## Discord Bot Architecture

Current bot strengths:

- Mature Discord command set.
- SQLite durability.
- Persistent views re-register on startup.
- Canonical transaction outbox.
- Tenant adapter.
- Graphics generation.

Recommended direction:

- Keep the bot for Discord-specific commands, messages, roles, DMs, and graphics.
- Move canonical league data writes to Supabase RPCs.
- Treat SQLite as a short-term local queue/cache for Discord operations.
- Keep outbox pattern until every write is canonical-first.
- Make `/league` commands read from canonical read models.
- Move legacy roster/transfer commands toward canonical write APIs.

Long-term target:

```text
Discord command -> bot validation -> platform API/RPC -> canonical DB -> audit log -> Discord side effects
```

Not:

```text
Discord command -> SQLite source of truth -> periodic mirror -> website catches up
```

## Database Schema Direction

The current canonical schema is a strong base. V2.0 should refine it rather than replace it.

Keep:

- `league_id` scoping.
- UUID keys.
- read models for public pages.
- audit logs.
- service-role-only RPCs.
- idempotency keys for imports and jobs.

Add or improve:

- `league_audit_timeline` view for UI.
- `league_incidents` or `operations_events` if operational status needs history.
- `league_documents` for rules and AI retrieval.
- `match_reports` for generated or manually written reports.
- `match_evidence` if raw/published evidence should be separated from `match_imports`.
- `automation_settings` for Discord templates, reminders, and channels.
- `notification_preferences` if player/manager preferences become real.
- `billing_customers`, `billing_subscriptions`, or Stripe-linked metadata tables if not kept solely in `platform_entitlements`.
- `backups` or backup metadata if operator dashboard needs visibility.

Do not add separate databases for V2.0 unless scale forces it.

## Supabase Structure

Recommended:

- Keep one Supabase project for the platform while small.
- Separate environments: local, staging, production.
- Use migrations as source of truth.
- Add schema-drift checks before deploy.
- Generate `lib/database.types.ts` after migrations and keep it in sync.
- Continue revoking browser access to sensitive tables.
- Consider public read policies only for deliberately public, low-risk read models if the app later needs direct browser reads.

Critical action:

Verify live production schema before applying new migrations, because the current docs say the initial schema was manually applied on 2026-06-08 before later migration ledger entries.

## Auth And Permissions

Current:

- Discord OAuth for ownership and account area.
- Credentials provider for league-site admin.
- `league_memberships` roles: owner, admin, reviewer, fixture_manager.
- Site credentials create `site:<league_id>` admin membership.

Recommended:

- Create a formal permission matrix.
- Keep owner-only billing and staff management tied to Discord auth.
- Keep league-site admin for operational work only.
- Add optional 2FA/passkey or magic-link upgrade path for site admin later.
- Add tests for every role:
  - owner
  - admin
  - fixture_manager
  - reviewer
  - site admin
  - unauthenticated
  - wrong league

## Background Jobs

Current:

- `discord_jobs` handled by `atheus_tenant.cog`.
- Collector loop handled by `atheus_collector`.
- Canonical transaction outbox in SQLite.

Recommended:

- Keep Supabase-backed jobs for now.
- Add a job dashboard in the admin or operator area.
- Add job types:
  - `guild.setup`
  - `announcement.send`
  - `match.reminder`
  - `role.sync`
  - `fixture.collection.retry`
  - `report.generate`
- Add max attempts, leases, failure reasons, next retry, and idempotency keys.
- Use dedicated worker IDs.
- Avoid queueing user-visible Discord side effects without audit metadata.

## Logging And Observability

Current:

- Sentry in website and bot.
- Discord alert forwarding.
- `/api/health`.
- Collector run telemetry.
- Bot logs.

Recommended:

- Add platform operations page:
  - website health
  - Supabase connectivity
  - collector last run
  - Discord job queue
  - bot presence
  - EA cooldown
  - failed imports
  - failed jobs
- Add correlation IDs for collector/import/job flows.
- Add Sentry tags: league_id, route, job_type, worker_id.
- Add alert rules for:
  - collector repeatedly failing
  - Discord job queue stuck
  - import queue growing
  - auth failures spike
  - Supabase RPC failures

## Rate Limits

Current:

- EA club search has in-memory per-user/league limit.
- Collector has poll seconds and EA 403 cooldown.
- Discord API rate limits are mostly left to discord.py.

Recommended:

- Move critical rate limits to durable storage for multi-instance deployments.
- Rate limit:
  - site login attempts by league/user/IP hash
  - EA club search
  - import replay
  - announcement jobs
  - DM role command
  - destructive admin actions
- Preserve user-friendly error messages with retry times.

## Error Handling

Recommended pattern:

- User-facing actions return clear errors.
- Unexpected errors go to Sentry and dev alerts.
- Every destructive or corrective action requires a reason.
- Every failure that affects automation becomes visible in dashboard.
- RPCs should raise specific messages; server actions should translate only where needed.

## Deployment Strategy

Current likely shape:

- Next app on Vercel.
- Bot on a private host.
- Supabase hosted.

Recommended:

- Keep Vercel for website if it is already working.
- Keep bot/collector on private worker host initially.
- Separate staging and production Supabase projects.
- Add `.env.example` parity checks.
- Add deployment checklist:
  - migrations applied
  - generated types updated
  - build passed
  - bot tests passed
  - worker env checked
  - smoke test league route
  - smoke test Discord job claim

## Monorepo Vs Separate Repos

Current:

- Website is Git-backed.
- Bot path is not a Git repo.

Recommendation:

Move toward one Git-managed workspace or monorepo, but do it deliberately.

Preferred V2.0 structure:

```text
atheus/
  apps/web/
  apps/bot/
  packages/shared-types/
  packages/league-domain/
  supabase/
  docs/
```

Short-term:

- Put the bot under Git immediately, even before monorepo migration.
- Keep the current two paths operational.
- Do not move files until deployment paths and launcher references are documented.

Why:

- Shared docs, migrations, and release history matter.
- The bot and website already depend on each other.
- Separate untracked bot work is risky for a serious platform.

## Migration Plan From Current System

1. Stabilize and snapshot.
2. Make bot path Git-managed.
3. Verify production Supabase schema.
4. Remove unsafe service-role fallbacks.
5. Add permission matrix and tests.
6. Build League OS Control Centre.
7. Move Discord roster reads to canonical where ready.
8. Move transaction writes to canonical-first or outbox-backed RPCs.
9. Retire `league_bot_*` public read models.
10. Retire Google Sheets/MySQL EAFC26 pipeline.
11. Add Stripe entitlement lifecycle.
12. Launch V2.0 as a staged beta league.

## Practical Non-Goals

Do not add Kubernetes, Kafka, microservices, or a separate API service now unless deployment constraints force them. A well-structured Next app, Supabase RPCs, and Python workers are enough for the current size of the platform.

