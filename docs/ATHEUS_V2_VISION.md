# Atheus V2.0 Vision

## Positioning

**Atheus V2.0 - next-generation league infrastructure.**

Atheus should be positioned as the operating system for competitive online leagues. The current product already proves the direction: Discord ownership, multi-tenant league sites, EA FC result collection, fixture generation, stats, and bot automation exist in the codebase. V2.0 should unify those pieces into a platform that feels professional enough for league owners, managers, admins, players, and future clients.

The product should move away from "a Discord bot that also has a website" and toward "a league infrastructure platform with Discord automation built in."

## Core Promise

Atheus gives online leagues a complete, trustworthy operations layer:

- Run the league.
- Automate Discord.
- Verify results.
- Publish a real league site.
- Track players and teams.
- Reduce admin workload.
- Preserve an audit trail.
- Scale to multiple leagues and clients.

## Product Pillars

### 1. League OS

The League OS is the canonical operating layer.

Included:

- League creation and identity.
- Seasons and competitions.
- Divisions.
- Teams and clubs.
- Players and identities.
- Fixtures.
- Standings.
- Transfers, loans, releases, and suspensions.
- Match review.
- Staff roles.
- Audit logs.

Observed foundation:

- `leagues`, `seasons`, `competitions`, `teams`, `fixtures`, `matches`, `player_identities`, `audit_logs`.
- Admin pages under `app/admin/[leagueId]`.
- Bot roster operations in `cogs/transactions.py` and `database.py`.

V2.0 direction:

- Supabase canonical state should become the source of truth.
- Discord commands should read/write through platform APIs or service RPCs, not own core state forever.
- Every important action should have a visible audit trail.

### 2. Discord Automation

Discord remains where league communities live. Atheus should automate it without making Discord the only product.

Included:

- Bot install and guild binding.
- Role sync.
- Setup channels.
- Announcements.
- Match reminders.
- Result alerts.
- Manager/player commands.
- Staff commands.
- Transfer market workflows.

Observed foundation:

- `lib/discord.ts` verifies bot presence and guild permissions.
- `discord_jobs` and `atheus_tenant.cog` process setup jobs.
- Existing cogs handle transactions, public commands, moderation, welcome/goodbye, and roster sync.

V2.0 direction:

- Add a durable Discord automation dashboard.
- Make every automation idempotent and auditable.
- Let owners configure announcement channels and templates in the web UI.
- Keep the bot as the execution worker for Discord-specific effects.

### 3. Web Dashboard

The admin dashboard should become the control centre.

Included:

- Owner dashboard.
- League admin dashboard.
- Manager dashboard.
- Match reviewer queue.
- Fixture command centre.
- Collector operations.
- Staff and permissions.
- Player registry.
- Public-site controls.

Observed foundation:

- League workspace cards exist in `app/admin/[leagueId]/page.tsx`.
- Dedicated pages exist for setup, teams, divisions, fixtures, imports, collector, staff, players, and site access.

V2.0 direction:

- Replace card-only navigation with a dense operations shell.
- Surface alerts, blockers, recent audit entries, and next actions.
- Add manager/player scoped dashboards after canonical roster permissions are settled.

### 4. EA FC Integration

EA FC data should be treated as evidence that flows through review, not magic.

Included:

- EA club linking.
- Fixture-window collection.
- Score detection.
- Player stat ingestion.
- Confidence scoring.
- Admin approval.
- Manual corrections.
- EA 403 cooldown visibility.

Observed foundation:

- `lib/ea-clubs.ts` and `/api/leagues/[leagueId]/ea/clubs/search`.
- `atheus_collector` worker.
- `match_imports`, `match_import_player_rows`, `collector_runs`.
- Match review UI under `app/admin/[leagueId]/imports`.

V2.0 direction:

- Make a Match Evidence page for every imported result.
- Show raw payload metadata safely, confidence, compared teams, and player rows.
- Add replay/recheck controls with rate limits.
- Retire Google Sheets/MySQL stats once canonical collector is proven.

### 5. AI Operations Layer

AI should reduce admin workload without making irreversible decisions.

Included:

- AI admin assistant.
- Rule lookup.
- Match report drafts.
- Transfer summaries.
- Suspicious activity flags.
- Fixture suggestions.
- Support triage.

Constraints:

- AI should recommend and draft, not silently approve results or change data.
- AI output should cite source rows or audit entries where possible.
- Every AI-assisted action should be labeled and reviewable.

V2.0 direction:

- Start with low-risk assistant features: report drafts, summaries, rule lookup.
- Add flags after baseline audit data exists.
- Add role-gated AI actions with explicit confirmation.

### 6. Reliability Layer

Reliability should be visible and confidence-building.

Included:

- Health checks.
- Sentry.
- Discord dev alerts.
- Collector run telemetry.
- Audit logs.
- Backups.
- Incident notes.
- Recovery playbooks.
- Queue status.

Observed foundation:

- `app/api/health/route.ts`.
- `instrumentation.ts`, `sentry.*.config.ts`, `lib/monitoring.ts`.
- `collector_runs`.
- `discord_jobs`.
- Bot Sentry in `monitoring.py`.

V2.0 direction:

- Add an internal operations dashboard.
- Document backup/restore.
- Add queue failure visibility and retry controls.
- Add a public status page when productized.

### 7. Multi-League Platform

Atheus should support multiple independent leagues without data leaks.

Included:

- Multiple leagues per owner, based on entitlement.
- One or more Discord guild bindings.
- League-branded sites.
- Custom settings.
- Tiered plans.
- Future client support.

Observed foundation:

- Tenant slugs and wildcard subdomains.
- `league_memberships` and `league_discord_guilds`.
- Entitlements.
- League branding and settings.

V2.0 direction:

- Finish billing and entitlement lifecycle.
- Add league archive/suspend/transfer ownership workflows.
- Add cross-league owner dashboard.
- Add role and subscription policy tests.

### 8. Public League Sites

The public site is the product players and fans see.

Included:

- Home.
- Fixtures.
- Results.
- Tables.
- Stats.
- Club pages.
- Player profiles.
- Match centre.
- News or reports.
- Branded theme.

Observed foundation:

- `app/leagues/[leagueSlug]` pages.
- `app/leagues/[leagueSlug]/public.css`.
- Data-first sports design in `PRODUCT.md`.

V2.0 direction:

- Add a full match centre.
- Add match reports and news.
- Improve mobile fixture/stats browsing.
- Add public trust markers: verified result, manual correction, pending review.

## Audience

### League owners

Need:

- Confidence that the platform will not break their league.
- Control over setup, staff, branding, fixtures, public site, and billing.
- Clear diagnostics when automation fails.

### Admins and reviewers

Need:

- Fast review queues.
- Clear evidence.
- Safe correction workflows.
- Audit trail and reasons.

### Managers

Need:

- Roster state.
- Fixtures.
- Team stats.
- Availability/reminders.
- Transfers and loan workflows.

### Players

Need:

- Fixtures and results on mobile.
- Player profile and stats.
- Team page.
- Confidence that stats are verified.

### Future clients

Need:

- Professional onboarding.
- Clear product tiers.
- Reliability story.
- Support path.
- Data ownership and trust.

## Product Principles

1. Canonical over duplicated.
2. Evidence over hype.
3. Admin actions require reasons.
4. Automation is visible.
5. Discord is an integration, not the whole product.
6. Public pages should feel like sports media, not a settings dashboard.
7. AI assists humans; humans approve irreversible changes.
8. Multi-tenant safety is non-negotiable.
9. Every league has its own identity.
10. V2.0 should feel calmer, sharper, and more reliable than the current mixed tooling.

## V2.0 North Star

When a league owner logs in, they should see:

- Their league is live.
- Their next matchday is ready.
- Discord is connected.
- EA collection is healthy.
- Pending imports are waiting.
- Public pages are up to date.
- Staff roles are clear.
- Recent admin actions are audited.
- The platform knows exactly what needs attention next.

That experience is the leap from a bot to infrastructure.

