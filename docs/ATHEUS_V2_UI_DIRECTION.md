# Atheus V2.0 UI / UX Direction

## Design Position

Atheus V2.0 should feel like premium sports operations software: sharp, fast, credible, and data-led. It should not look like a generic Discord bot dashboard, a startup SaaS template, or a neon esports toy.

The existing `PRODUCT.md` direction is good and should be preserved:

- Public league sites are the product players see.
- Data is the hero.
- League branding uses CSS variables.
- Avoid generic SaaS, cyberpunk, football cliches, and glassmorphism.

## Visual Language

Recommended style:

- Sports media plus operations command centre.
- Dense but readable.
- Strong typography.
- Crisp dividers.
- Tabular numbers.
- Minimal decoration.
- League accent colors used deliberately.
- Clear status states.

Avoid:

- Oversized marketing cards inside admin tools.
- Excessive gradients.
- Neon-on-black esports styling.
- Childish trophy/pitch motifs.
- Rounded pill overload.
- Vague "AI" decoration.

## Navigation Structure

### Public Atheus / owner area

- Home
- Platform
- Pricing
- Support
- Owner login

Decision needed:

The current `app/page.tsx` positions Atheus Industries broadly, while the V2.0 brief wants Atheus league infrastructure as the flagship. Decide whether `atheus.dev` is:

1. Atheus Industries studio with league platform as product, or
2. Atheus League OS product site.

For V2.0 launch, option 2 is clearer if the goal is productization.

### League owner account

- Leagues
- Billing
- New league
- Support
- Account

### League admin workspace

- Control Centre
- Setup
- Teams
- Divisions
- Fixtures
- Match Review
- Players
- Discord Automation
- Public Site
- Audit Log
- Settings

Role-specific hiding should keep the nav compact.

### Public league site

- Home
- Fixtures
- Table
- Stats
- Teams
- Players
- News/Reports
- Admin

## Homepage Structure

If the homepage becomes Atheus League OS:

1. Hero: "Atheus League OS" or "Atheus V2.0" as the product name.
2. Live product visual: real match centre/dashboard imagery or generated product mock, not abstract decoration.
3. Core promise: fixtures, Discord automation, verified results, public league sites.
4. Product pillars: League OS, Discord Automation, EA FC Verification, Public League Sites.
5. Trust section: audit logs, role checks, backups, review queues.
6. Public-site showcase: example league page, player profile, match centre.
7. Admin workflow: setup to matchday to results to reports.
8. Pricing/waitlist/contact.

Keep hero copy direct and short. The product UI should sell the platform.

## League Admin Control Centre

This should be the V2.0 flagship screen.

Layout:

- Top bar: league name, public URL, role, health status, sign out.
- Left navigation or compact top tabs depending viewport.
- Main summary band:
  - next matchday
  - pending imports
  - collector health
  - Discord status
  - public site status
- Operations grid:
  - Setup readiness
  - Fixture pipeline
  - Review queue
  - Roster sync
  - Discord jobs
  - Recent audit
- Alerts strip:
  - EA cooldown
  - failed job
  - missing EA links
  - no active season
  - public stats disabled

Interaction:

- Every panel should have a clear next action.
- Dangerous actions stay behind detail pages.
- The dashboard should prioritize what needs attention today.

## League Admin Panel Layout

### Setup

- One checklist per setup domain.
- Inline blockers.
- Preview of resulting public site and Discord effects.
- Save states that show "saved", "queued", "needs Discord".

### Teams

- Table/list hybrid.
- Columns: name, abbreviation, EA club, Discord role, division, status, last updated.
- Bulk import later.
- EA link panel should show verification snapshot and expiry.

### Divisions

- Drag or select team assignments if feasible.
- Show team count per division and fixture count estimate.
- Warn before changing division after fixtures exist.

### Fixtures

- Calendar/list toggle.
- Per-division tabs.
- Fixture generation preview.
- Published fixtures with status.
- Result controls in expandable detail rows.
- Strong confirmation for clearing/regenerating.

### Match Review

- Queue grouped by confidence and matchday.
- Review detail page:
  - detected match
  - fixture
  - score
  - player rows
  - diagnostics
  - raw metadata summary
  - approve/reject/correct
- Avoid hiding important evidence in tiny cards.

### Players

- Search-first registry.
- Identity panel with aliases and current club.
- Merge flow should show source/target consequences.
- Correction reasons remain required.

### Staff

- Role matrix at top.
- Current members table.
- Add staff form.
- Audit link per change.

## Manager Dashboard Layout

Future manager dashboard:

- Team header with record and next match.
- Roster health:
  - squad size
  - missing gamertags
  - active loans
  - suspensions if added
- Fixtures:
  - upcoming
  - recent
  - availability
- Transfers:
  - pending offers
  - budget
  - window status
- Team stats:
  - form
  - top performers
  - goals against/for

Manager dashboard should be mobile-first because managers often operate from Discord/mobile.

## Match Centre Layout

Public and admin versions should share a data model.

Public:

- Fixture header: teams, score/status, kickoff, competition.
- Verification badge:
  - scheduled
  - pending review
  - verified
  - manually corrected
- Timeline/report section.
- Player stats table.
- Team comparison.
- Related fixtures.

Admin:

- Everything public has, plus:
  - import evidence
  - raw payload metadata
  - diagnostics
  - audit history
  - correction actions

## Player Profile Layout

Sections:

- Hero: player name, current team, overall, positions.
- Summary metrics: apps, goals, assists, rating, tackles, saves, clean sheets.
- Form by match.
- Competition split.
- Team history.
- Alias/history notes for admins only.

Mobile:

- Put overall and team directly under name.
- Metrics in 2-column grid.
- Match table horizontally scrollable only where necessary.

## Mobile Considerations

Most player/fan use is mobile. Admin use is mixed.

Rules:

- Public fixtures must be readable at 360px width.
- Tables can scroll horizontally, but the first columns must remain meaningful.
- Admin action forms should avoid side-by-side required fields on small screens.
- Buttons must have stable sizes.
- Empty states must be compact and useful.
- Sticky public nav should not consume too much vertical space.

## Empty States

Current public empty states are a good base.

Recommended empty states:

- No fixtures: explain that fixtures appear after publishing.
- No stats: explain that approved results create stats.
- No teams: show setup next action for admins, neutral text publicly.
- No imports: show collector status and next fixture window.
- No audit entries: say no recorded actions yet.

Empty states should never pretend data exists.

## Loading States

Add:

- Skeleton rows for dashboard panels.
- Button pending states for server actions.
- Collector/review pages should show "refreshing" without layout shift.
- EA search should show rate-limit messages clearly.

## Error States

Add:

- Route-level friendly errors with retry/contact.
- Admin errors that include context but no secrets.
- Collector errors with last error and next retry.
- Discord job errors with retry action where safe.
- Public pages should distinguish unknown league from coming soon/inactive.

## Colour And Theme Suggestions

Core Atheus product:

- Ink: near black.
- Paper: off-white or cool neutral.
- Accent: strong blue or electric but restrained.
- Warning: amber.
- Danger: red.
- Success: green.

League themes:

- Keep `--league-primary`, `--league-secondary`, `--league-accent`, `--league-bg`, `--league-surface`, `--league-text`, `--league-muted`.
- Add contrast validation before save.
- Provide presets:
  - Broadcast Blue
  - Match Programme
  - Night League
  - Classic White
  - Club Dark

## Component Improvements

Build or standardize:

- Status chip
- Health indicator
- Audit row
- Fixture row
- Match evidence card
- Stat tile
- Role badge
- Confirmation form
- Empty state
- Error panel
- Queue row
- Team/player search result
- Division tab
- Public verification badge

## Current UI Strengths

- Public league CSS is already sports-media oriented.
- Public pages include home, fixtures, table, stats, teams, and players.
- Admin workflow cards cover the right modules.
- Responsive CSS exists for many surfaces.
- Empty states exist in public pages.

## Current UI Weaknesses

- Admin dashboard reads as navigation cards more than operations software.
- Global CSS is very large and mixes multiple product surfaces.
- Some buttons use text where icons or compact controls would improve scan speed.
- No unified audit/status surface.
- No clear productized billing/support experience.
- Public league pages need Match Centre depth.

## V2.0 UI North Star

The product should feel like this sentence:

"Atheus knows exactly what is happening in your league, what needs review, what is live, what is automated, and what changed."

