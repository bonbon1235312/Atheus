# Atheus League Platform

Greenfield multi-league website for EA FC community leagues.

The website shares Supabase with the existing League Bot. It will manage league
onboarding, branding, teams, EA club links, schedules, fixtures, match approvals,
standings and player statistics.

## Local development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and add the real deployment secrets. Never commit
the Supabase service-role key or Discord OAuth secret.

## Current milestone

The clean foundation, league onboarding, fixture generation and automated
collection slices are complete:

- Discord OAuth with refreshed guild access;
- one salted, server-only site administrator credential per league;
- league-scoped username/password sessions with lockout protection;
- owner-only credential rotation without exposing stored passwords;
- manager-only Discord guild selection;
- operational bot-presence detection;
- league identity, timezone, EA platform and theme controls;
- atomic Supabase creation of the league, owner, guild binding, settings and branding;
- season, competition and match-window setup;
- protected team creation with optional Discord role and colour metadata;
- server-side EA club search with throttling, caching and signed selections;
- historically safe EA link, relink and unlink operations with audit logs;
- protected league workspace and team management routes;
- deterministic round-robin generation with odd-team byes and repeat meetings;
- timezone-aware UTC kickoffs from league-local schedule slots;
- blackout dates, fixture limits, full preview and completion summaries;
- signed preview plans and atomic, idempotent Supabase publishing.
- audited reschedule, postpone, cancellation and restore controls;
- manual score correction, forfeit results and safe player-stat erasure;
- lifetime free-league entitlements bound to Discord user identity;
- owner-only free onboarding with account/server age checks and hashed abuse signals;
- transactional readiness validation and league activation.
- owner-controlled, audited staff role management.
- transactional match-import approval and rejection with player identity aggregation.
- service-role-only collector target discovery using league-local fixture windows;
- historically correct EA club links at each fixture kickoff;
- idempotent score and player-row ingestion into the website review queue;
- collector run telemetry, EA access-denied cooldowns and an owner/admin master switch;
- a protected operations dashboard at `/admin/[leagueId]/collector`.
- league-branded public home pages at `/leagues/[leagueSlug]`;
- clean league subdomains such as `vxn.atheus.dev`, with legacy path URLs
  redirected to the tenant domain;
- approved-only fixture and result archives with season, competition and club filters;
- full zero-game-safe standings, club pages and consolidated player profiles;
- multi-position leaderboards with attacking, defensive, goalkeeping and overall sorts;
- dynamic public sitemap entries for every active league.

The next controlled module is the production Discord and staging-league pilot.
Stripe checkout and webhook processing will later be the only writer of premium
entitlement state. Cup bracket generation remains a later fixture extension. EA search
may receive an Akamai `403` from some hosts; the worker
backs off instead of repeatedly retrying, while the operations page exposes the
cooldown and latest error.

The public routes require the real server-only Supabase environment variables. The
canonical project currently has no active league row, so the first full visual data
pilot happens as part of staging league activation.

The previous Atheus website was removed intentionally; its Git history remains
available on earlier commits.

The Discord OAuth application and operational Discord bot can be separate
applications. Set `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` for website login and
`ATHEUS_BOT_CLIENT_ID` / `ATHEUS_DISCORD_BOT_TOKEN` for the bot that league owners
install.

Discord remains the only ownership identity. A league site credential receives an
isolated `admin` membership for its own league and cannot activate the league,
change billing, or manage owner/staff access.

## League subdomains

Add `*.atheus.dev` to the same Vercel project as `atheus.dev` and configure the
wildcard DNS record Vercel provides. Set `ATHEUS_ROOT_DOMAIN=atheus.dev` in the
Production environment. League creation reserves the chosen slug as a subdomain
and displays the final customer URL immediately after the workspace is created.

`atheus.dev/admin` is the Discord-owned account surface for billing, entitlement,
league creation and league-site credential rotation. Operational controls live at
`<league>.atheus.dev/admin` and require that league's separate site username and
password. Tenant sessions are bound to one league and cannot access another
league's control room.
