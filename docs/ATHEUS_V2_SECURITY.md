# Atheus V2.0 Security, Trust, And Reliability Review

## Security Posture Summary

The current security direction is stronger than a typical hobby Discord bot. The website keeps Supabase service-role access server-side, revokes browser grants on canonical tables, uses Discord OAuth for ownership, adds league-site credentials with scrypt hashes, uses RPC permission checks for many mutations, and records audit logs for major actions.

The main V2.0 risk is blast radius. Because the server and bot use service-role credentials, a missing route check, leaked env var, or overly broad utility can bypass RLS. V2.0 should keep the service-role architecture only with stronger tests, least-privilege worker separation, durable rate limits, and clearer operational controls.

## Discord OAuth

Observed:

- Website uses Auth.js Discord provider with `identify guilds`.
- Discord guild ownership/management is checked during onboarding.
- Bot presence is verified with bot token.
- Discord tokens are refreshed.

Strengths:

- Discord is a good ownership anchor for league creation.
- Bot and OAuth applications can be separate.
- Free league creation requires the server owner when not premium.

Risks:

- Token refresh failure handling mostly returns session errors; add more user-visible reconnect guidance.
- Discord OAuth is not enough for league-site admins, who use credentials.
- Guild ownership can change; periodic re-verification should exist for owner-only powers and billing.

Recommendations:

- Add owner recheck before billing, ownership transfer, destructive archive, and staff owner changes.
- Record Discord verification snapshots in audit logs.
- Add tests for expired Discord token and wrong-guild creation paths.

## Session Handling

Observed:

- Auth.js sessions include `authMethod`.
- League admin credentials clear Discord tokens from the JWT.
- Site credential sessions are invalidated when `password_changed_at` changes.
- Failed site login attempts lock for 15 minutes after 5 failures.

Strengths:

- Separation between Discord owner session and league-site admin session is clear.
- Site credential rotation invalidates existing sessions.

Risks:

- Credentials login is username/password only.
- Lockout state is per league credential, not necessarily per IP/user fingerprint.
- Recovery process for lost site credential is owner rotation only.

Recommendations:

- Add durable per-IP-hash and per-username login rate limits.
- Consider optional passkey or Discord staff login later.
- Add explicit session timeout policy in docs.
- Add tests for wrong league, stale credential version, and site admin trying owner-only actions.

## Environment Variables And Secrets

Observed:

- `.env.example` files are extensive.
- Website and bot require `SUPABASE_SERVICE_ROLE_KEY`.
- Bot stats reader can fall back to `SUPABASE_SERVICE_ROLE_KEY` when `SUPABASE_ANON_KEY` is missing.
- Sentry DSN fallback comments mention hardcoded fallback in config files.

Strengths:

- Secret names are documented.
- Service-role key is warned as server-only.

Risks:

- Too many processes share the same service-role key.
- Service role fallback in a read utility increases blast radius.
- Hardcoded DSN fallback should be reviewed to ensure it is not sensitive and is intended.

Recommendations:

- Remove service-role fallback from `supabase_stats.py`.
- Split service credentials by worker where Supabase supports it or by isolated deployment envs.
- Add env validation at startup for website, bot, collector, and tenant adapter.
- Add `.env.example` parity checks in CI.
- Never expose service role in `NEXT_PUBLIC_*` or bot logs.

## API Route Protection

Observed:

- EA club search route calls `requireLeagueAccess` with owner/admin.
- Health route exposes boolean config status.
- Public routes are server-rendered through service role.

Strengths:

- EA search has input validation and an in-memory rate limit.
- Public data comes from approved views.

Risks:

- In-memory rate limits reset on deploy and do not work across instances.
- Public routes depend on route code to filter active leagues and approved rows.
- Health route reveals config completeness, which is usually acceptable but should remain non-sensitive.

Recommendations:

- Move critical rate limits to DB-backed counters.
- Add route tests for public inactive/suspended leagues.
- Add tests for cross-league access on EA search.
- Add security headers review.

## Supabase RLS

Observed:

- RLS is enabled on canonical tables.
- Grants are revoked from `anon` and `authenticated` for canonical tables and read models.
- Functions are granted to `service_role`.
- Website uses `supabaseAdmin()` server-side.

Strengths:

- Direct browser access to canonical data is blocked.
- RPCs contain role checks and league checks.

Risks:

- RLS is not the primary enforcement mechanism for server actions because service role bypasses it.
- If a server action forgets role checks and writes directly, RLS will not save it.
- Live schema may have drift due to manual initial application.

Recommendations:

- Add an automated list of service-role direct writes and verify each has route/RPC checks.
- Prefer RPCs for all multi-row mutations.
- Add migration tests for grants/revokes.
- Verify production schema before V2.0 migrations.

## Admin And Manager Permissions

Observed roles:

- `owner`
- `admin`
- `reviewer`
- `fixture_manager`
- synthetic site admin membership via `site:<league_id>`

Strengths:

- Staff management is owner-only.
- Fixture and review roles are separated.
- Site admin cannot manage staff or billing if checks remain consistent.

Risks:

- No central human-readable permission matrix exists in the repo.
- Manager-facing canonical permissions are not fully built.
- Bot manager/co-manager permissions are still based on local SQLite/Discord roles in many flows.

Recommendations:

- Create a permission matrix and keep it in docs.
- Add tests by role for every admin action.
- Add manager role mapping to canonical state before launching manager dashboard.
- Add audit records for permission denials only where useful and rate-limited.

## Command Permissions

Observed:

- Bot admin access accepts administrator, manage server, manage roles, or owner.
- Staff access includes configured manager and co-manager roles.
- Transaction commands require management context.
- Destructive `/deleteteam` has a confirmation view.

Strengths:

- Bot commands generally have role gates.
- Persistent views check invoker or role in places.

Risks:

- `manage_roles` may be broader than intended for some league admin commands.
- DM role and purge commands need rate/cooldown scrutiny.
- Message content intent is enabled.

Recommendations:

- Review each bot command against the V2.0 permission matrix.
- Add cooldowns to mass-DM, purge, announcement, and destructive commands.
- Minimize privileged Discord intents if not required.
- Move high-impact admin changes toward web UI with audit reasons.

## Input Validation

Observed:

- Website validates slugs, hex colours, passwords, usernames, score ranges, fixture actions, and EA platform.
- Fixture generation validates timezone, dates, slots, team count, and plan limits.
- Collector parser handles variable EA payload shapes.
- RPCs validate roles, statuses, reasons, and league boundaries.

Strengths:

- Multiple layers of validation exist.
- Destructive website actions generally require reason/confirmation.

Risks:

- Large free-text fields need consistent length limits.
- Raw EA payload retention and display needs careful sanitization.
- Bot commands have many individual validation paths and should be reviewed command-by-command.

Recommendations:

- Add shared validation helpers for common limits.
- Add max lengths for reasons, notes, announcement content, and names.
- Escape or avoid displaying raw payload content directly.
- Add parser tests for malformed EA payloads.

## Audit Logs

Observed:

- Audit log table exists.
- Many RPCs insert audit entries.
- Site credential changes are audited.
- Fixture lifecycle, result overrides, player stat erasure, staff changes, team and setup actions are audited in migrations inspected.

Strengths:

- Audit-first direction is strong.

Risks:

- Audit UI is not yet central.
- Payload shape may differ across actions.
- Bot local operations may not all reach canonical audit logs yet.

Recommendations:

- Build a visible audit timeline in V2.0 Control Centre.
- Normalize `action`, `entity_type`, `entity_id`, `before_data`, `after_data`.
- Add bot-to-canonical audit coverage for roster/transfer operations.
- Include actor type: Discord owner, site admin, worker, AI assistant.

## Abuse Prevention

Observed:

- Free league anti-abuse hashes exist.
- Site credential lockout exists.
- EA search has an in-memory rate limit.
- Collector has EA 403 cooldown.

Recommendations:

- Move rate limits to durable storage.
- Add signup/onboarding abuse dashboard for operators.
- Record suspicious repeated league creation attempts using privacy-reduced signals.
- Add invite/support path for false positives.

## Destructive Actions

Observed:

- Website player-stat erasure requires `ERASE` and a reason.
- Clearing division fixtures requires `CLEAR`.
- Bot delete team requires confirmation.
- Fixture result overrides require reason.

Recommendations:

- Standardize all destructive confirmations:
  - preview impact
  - require typed confirmation
  - require reason
  - write audit log
  - revalidate affected public paths
- Add soft-delete/archive where possible.
- Add recovery notes to audit entries.

## Backups And Recovery

Observed:

- No full backup/restore runbook was found.
- Bot SQLite durability is good locally.
- Supabase migrations are documented, but live initial migration state may need verification.

Recommendations:

- Create a backup runbook for Supabase and SQLite.
- Test restore in staging.
- Document RPO/RTO targets.
- Add pre-migration backup checklist.
- Add bot host data directory documentation.
- Add incident checklist for EA outage, Discord outage, Supabase outage, and bad import.

## Security Priorities Before V2.0 Launch

1. Remove service-role fallback from `supabase_stats.py`.
2. Verify production Supabase grants/RLS/functions against local migrations.
3. Add permission matrix.
4. Add permission regression tests.
5. Add durable rate limits for site login and EA search.
6. Add audit timeline UI.
7. Add backup/restore runbook.
8. Review bot privileged intents and high-impact commands.
9. Add job/collector failure dashboard.
10. Add production secret inventory and rotation plan.

