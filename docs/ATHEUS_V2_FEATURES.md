# Atheus V2.0 Feature Recommendations

## A. Must-Have Launch Features

### League OS Control Centre

- What: A single operations dashboard for setup readiness, fixtures, imports, collector, Discord jobs, roster sync, audit activity, and public-site status.
- Why it matters: It makes Atheus feel like infrastructure, not scattered tools.
- Difficulty: High.
- Dependencies: canonical data loaders, audit timeline, job status queries.
- Likely files: `app/admin/[leagueId]/page.tsx`, `app/admin/[leagueId]/collector/page.tsx`, `app/admin/[leagueId]/imports/page.tsx`, `lib/league-access.ts`, new admin data module.
- Approach: Build read-only dashboard first, then add actions.
- Risks: Too much data can become noisy without role-based prioritization.

### Permission Matrix And Route Tests

- What: A formal map of owner/admin/reviewer/fixture_manager/site-admin permissions plus tests.
- Why it matters: The platform uses service-role server access, so route checks are the safety layer.
- Difficulty: Medium.
- Dependencies: test tooling decision.
- Likely files: `auth.ts`, `lib/league-access.ts`, `app/admin/[leagueId]/*/actions.ts`, Supabase RPC migrations.
- Approach: Document matrix, then test route/action/RPC behavior.
- Risks: Existing implicit behavior may need small refactors.

### Match Import Review 2.0

- What: Improved review queue with match evidence, confidence, player rows, duplicate warnings, and corrections.
- Why it matters: Result trust is central to competitive leagues.
- Difficulty: High.
- Dependencies: collector diagnostics, match import schema.
- Likely files: `app/admin/[leagueId]/imports`, `atheus_collector`, `supabase/migrations/*collector*`.
- Approach: Add details page per import before changing ingestion.
- Risks: Raw EA payloads may contain noisy or unexpected fields.

### Canonical Roster Status

- What: Show whether roster, finances, loans, and transfer state are canonical, synced, queued, or still SQLite-only.
- Why it matters: Admins need to know which data source is authoritative.
- Difficulty: Medium.
- Dependencies: canonical outbox status and guild binding.
- Likely files: `database.py`, `atheus_tenant/cog.py`, `app/admin/[leagueId]/page.tsx`.
- Approach: expose outbox and snapshot status read models.
- Risks: Requires careful migration messaging.

### Discord Automation Settings

- What: Web-configured channels, reminders, announcements, setup repair, and role sync.
- Why it matters: Moves automation control out of slash-command memory.
- Difficulty: High.
- Dependencies: `discord_jobs`, bot worker job handling.
- Likely files: `lib/discord-jobs.ts`, `atheus_tenant/cog.py`, new settings migrations and UI.
- Approach: Start with channel/template config and job visibility.
- Risks: Discord permissions and missing channels can cause partial failures.

### Billing/Entitlement Completion

- What: Stripe checkout, webhook processing, billing portal, and plan enforcement.
- Why it matters: Productization requires trustworthy premium state.
- Difficulty: High.
- Dependencies: Stripe integration, `platform_entitlements`.
- Likely files: new API routes, `app/upgrade/page.tsx`, `app/admin/page.tsx`, Supabase migrations.
- Approach: Make Stripe the only writer of premium entitlement state.
- Risks: Incorrect webhook handling can overgrant or revoke access.

## B. High-Impact Wow Features

### Public Match Centre

- What: A public page for each fixture with kickoff, teams, score, status, player stats, evidence state, and match report.
- Why it matters: It is the most shareable product surface.
- Difficulty: High.
- Dependencies: fixtures, matches, player stats, match imports.
- Likely files: new `app/leagues/[leagueSlug]/matches/[fixtureId]/page.tsx`, `lib/public-league-data.ts`, `public.css`.
- Approach: Start with approved data, then add pending/verified labels.
- Risks: URL model and SEO need care.

### Auto-Generated Match Reports

- What: Human-reviewable summaries generated after match approval.
- Why it matters: Gives leagues sports-media output with low admin effort.
- Difficulty: Medium-high.
- Dependencies: approved match data, player stats, AI logging.
- Likely files: new `match_reports` table, imports approval flow, public match centre.
- Approach: Generate draft after approval, let reviewer publish/edit.
- Risks: AI must not invent events not in data.

### Branded League Launch Kit

- What: Logo/theme preview, public URL, Discord setup checklist, share cards, and announcement templates.
- Why it matters: Makes new leagues feel onboarded professionally.
- Difficulty: Medium.
- Dependencies: branding, Discord jobs.
- Likely files: onboarding form, site access, Discord job handling, public CSS.
- Approach: Add post-creation launch page.
- Risks: Branding controls can create unreadable themes unless contrast checks are added.

### Live Matchday Mode

- What: Dashboard and public page optimized for today's fixtures, pending results, and collector state.
- Why it matters: Matchday is when users care most.
- Difficulty: High.
- Dependencies: fixtures, collector, imports, Discord reminders.
- Likely files: admin dashboard, public league home, collector service.
- Approach: Build from existing current-date logic in public league home.
- Risks: Real-time expectations may exceed current polling.

## C. Admin Quality-Of-Life Features

### Audit Timeline

- What: Searchable timeline of setup, staff changes, fixture changes, imports, corrections, and credential rotations.
- Why: Builds trust and helps resolve disputes.
- Difficulty: Medium.
- Dependencies: `audit_logs`.
- Files: admin dashboard, new audit UI, maybe view migration.
- Approach: Create a query/view and UI first.
- Risks: Existing audit payloads may need normalization.

### Setup Checklist With Repair Actions

- What: Guided checklist for Discord home, season, slots, teams, EA links, divisions, fixtures, collector.
- Why: Reduces support load.
- Difficulty: Medium.
- Dependencies: readiness queries.
- Files: `app/admin/[leagueId]/page.tsx`.
- Approach: Expand existing readiness block.
- Risks: Checklist must not block advanced users.

### Safe Bulk Actions

- What: Bulk team import, bulk fixture edits, bulk player alias corrections, with previews.
- Why: Admins hate repetitive setup.
- Difficulty: High.
- Dependencies: validation and rollback.
- Files: teams, fixtures, players pages; RPCs.
- Approach: preview first, publish atomically.
- Risks: Bulk mistakes can be destructive.

### Replay Collector For Fixture

- What: Admin-triggered recheck for a fixture within rate limits.
- Why: Fixes missed EA matches without operator intervention.
- Difficulty: Medium-high.
- Dependencies: collector jobs.
- Files: collector, imports, `atheus_collector`.
- Approach: queue job, worker performs replay.
- Risks: EA rate limits/403.

## D. Player-Facing Features

### Player Profile 2.0

- What: Current team, history, match logs, form, positions, top metrics, aliases.
- Why: Players care about their identity and performance.
- Difficulty: Medium.
- Dependencies: player totals/history.
- Files: `app/leagues/[leagueSlug]/players/[playerId]/page.tsx`, public CSS.
- Approach: Extend existing page.
- Risks: Incorrect identity merges can undermine trust.

### Verified Player Cards

- What: Shareable profile cards or images.
- Why: Social sharing and league pride.
- Difficulty: Medium.
- Dependencies: graphics or image generation.
- Files: bot graphics, public profile route.
- Approach: start with server-rendered Open Graph images later.
- Risks: Rendering pipeline complexity.

### Player Claim / Discord Link

- What: Players connect Discord identity to canonical player identity.
- Why: Enables manager dashboards and notifications.
- Difficulty: High.
- Dependencies: auth model and player identities.
- Files: Auth.js, player identity UI, bot gamertag linking.
- Approach: begin as admin-approved claim.
- Risks: impersonation and duplicate identities.

## E. Manager-Facing Features

### Manager Dashboard

- What: Team fixtures, roster, loans, transfers, missing gamertags, team stats.
- Why: Managers are daily operators.
- Difficulty: High.
- Dependencies: canonical roster permissions.
- Files: new tenant/admin manager section, bot canonical reads.
- Approach: add read-only dashboard first.
- Risks: Need robust mapping from Discord user to team/manager status.

### Availability And Reminders

- What: Players declare availability; reminders post to Discord before fixtures.
- Why: Common league workflow.
- Difficulty: High.
- Dependencies: player identities, Discord jobs.
- Files: new schema, manager dashboard, bot jobs.
- Approach: start with simple availability per fixture.
- Risks: Notification spam.

### Transfer Window Controls

- What: Configurable transfer window, budget, approvals, and audit.
- Why: Current bot transfer flows are valuable but Discord-heavy.
- Difficulty: High.
- Dependencies: canonical transfer events.
- Files: `cogs/transactions.py`, canonical transfer migrations, manager dashboard.
- Approach: expose current state first, then move writes.
- Risks: Migration from SQLite must be exact.

## F. AI Features

### AI Admin Assistant

- What: A chat/help surface that answers "what needs attention?" and explains league state.
- Why: Reduces admin confusion.
- Difficulty: Medium-high.
- Dependencies: dashboard data, docs/rules.
- Files: new assistant route/components.
- Approach: read-only assistant first.
- Risks: Must not leak cross-league data.

### AI Rule Lookup

- What: Search and answer league rules with citations.
- Why: Useful and low risk.
- Difficulty: Medium.
- Dependencies: rule document storage.
- Files: new docs table/UI.
- Approach: upload or paste rules, retrieval, cited answers.
- Risks: stale rules if not maintained.

### Suspicious Activity Flags

- What: Flags unusual scorelines, duplicate imports, impossible stats, roster conflicts.
- Why: Makes Atheus feel smart and trustworthy.
- Difficulty: High.
- Dependencies: deterministic rules first.
- Files: collector, imports, dashboard.
- Approach: build deterministic flags before AI commentary.
- Risks: False positives can annoy admins.

### Transfer And Match Summaries

- What: Generated weekly summaries and match reports.
- Why: High perceived value.
- Difficulty: Medium.
- Dependencies: canonical stats and transfer events.
- Files: public league, Discord announcements.
- Approach: draft then approve.
- Risks: hallucinated phrasing without evidence constraints.

## G. Reliability/Security Features

### Operations Health Dashboard

- What: Internal view of website, Supabase, bot, collector, jobs, imports, Sentry linkouts.
- Why: Supports real clients.
- Difficulty: Medium.
- Dependencies: telemetry.
- Files: health route, collector runs, discord jobs, monitoring modules.
- Approach: read-only operator page.
- Risks: operator-only access must be strict.

### Backup And Restore Runbook

- What: Documented and tested backup/restore for Supabase and SQLite.
- Why: Trust.
- Difficulty: Medium.
- Dependencies: deployment access.
- Files: docs, scripts if added.
- Approach: create runbook and test in staging.
- Risks: cannot fully verify without credentials.

### Durable Rate Limits

- What: DB-backed rate limits for login, EA search, replay, announcements.
- Why: Multi-instance reliability and abuse prevention.
- Difficulty: Medium.
- Dependencies: schema.
- Files: Auth.js credentials provider, EA search API, Discord jobs.
- Approach: add rate limit table/RPC.
- Risks: lockout tuning.

### Permission Regression Tests

- What: Automated tests for every protected action.
- Why: Prevents cross-league leaks.
- Difficulty: Medium-high.
- Dependencies: test harness.
- Files: route/actions/RPC tests.
- Approach: seed fake league state and assert deny/allow.
- Risks: test setup time.

## H. Future / Experimental

### Multi-Game League Support

- What: Support games beyond EA FC.
- Why: Platform expansion.
- Difficulty: Very high.
- Dependencies: abstract match/stat models.
- Risks: Can dilute focus too early.

### Public API For Leagues

- What: API keys/webhooks for league data.
- Why: Future client integrations.
- Difficulty: High.
- Dependencies: auth, rate limits.
- Risks: security and support burden.

### Mobile App

- What: Native or PWA player/manager experience.
- Why: Players are mobile-first.
- Difficulty: High.
- Dependencies: stable web flows.
- Risks: too early before dashboard/product fit.

### Advanced Analytics

- What: team/player trends, expected outcomes, form, match predictions.
- Why: Premium feature potential.
- Difficulty: High.
- Dependencies: reliable stats history.
- Risks: weak if data quality varies.

