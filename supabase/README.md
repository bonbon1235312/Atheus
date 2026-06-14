# Atheus Supabase

The migrations in this directory define the canonical multi-tenant database shared by
the Atheus website and the existing Atheus League Bot.

## Safety

- Migrations are additive.
- Existing `league_bot_*` compatibility tables are not dropped or altered.
- New canonical tables use UUID primary keys and explicit `league_id` scoping.
- Composite foreign keys prevent cross-league team, fixture and player references.
- Row-level security is enabled with no browser policies by default.
- Website mutations run server-side after Discord permission checks.

## Applied state

The initial schema was applied manually in the Supabase SQL Editor on 2026-06-08.
The follow-up migrations are recorded through the Supabase migration API:

- `20260608203000_onboarding_and_hardening.sql`
- `20260608211500_season_foundation.sql`
- `20260608213000_fix_onboarding_defaults.sql`
- `20260609103000_team_ea_linking.sql`
- `20260609130000_fixture_plan_publishing.sql`
- `20260609131500_fixture_plan_idempotency_hardening.sql`
- `20260609190000_entitlements_and_activation.sql`
- `20260609193000_staff_permissions.sql`
- `20260609203000_match_import_review.sql`

Do not re-run the initial migration blindly against production. Verify the live schema
first because its original application predates the remote migration ledger.

## Verify

After applying, confirm these views exist:

- `atheus_public_fixtures`
- `atheus_standings`
- `atheus_player_totals`

Creating a draft league through the website onboarding flow automatically creates:

- its default branding row;
- its default settings row;
- its owner membership row.

The database functions were integration-tested inside a rolled-back transaction,
including league creation, branding, owner membership, league and cup competitions,
multiple schedule slots, team creation, EA relinking history, and unlinking.

Fixture publishing was also tested against the live schema inside rolled-back
transactions. The checks covered atomic inserts, exact idempotent retries, changed-plan
rejection, duplicate-key rejection and unauthorized-role rejection.

## Compatibility

The old `league_bot_*` tables remain available while the Python bot is moved behind
league-aware repository adapters. They are not the final source of truth.

# Legacy VXN beta import

The migration `20260614160000_legacy_vxn_canonical_import.sql` installs a
service-role-only, transactional importer for the legacy VXN `league_*` tables.
It does not update or delete any legacy rows.

After applying the migration, validate the source without writing:

```powershell
npm run beta:vxn:dry-run
```

To perform the live import, provide the real VXN headquarters guild ID and owner
Discord user ID through `ATHEUS_VXN_DISCORD_GUILD_ID` and
`ATHEUS_VXN_OWNER_DISCORD_USER_ID`, then run:

```powershell
npm run beta:vxn:apply
```

The importer is idempotent and reconciles teams, fixtures, approved results,
player identities, and per-match player stats into the canonical Atheus schema.
