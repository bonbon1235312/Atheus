# Legacy: Atheus League Platform

This directory documents the original Atheus product — a SaaS platform for EA FC Pro Clubs leagues.

## What it was

A fully deployed multi-tenant web application for managing EA FC Pro Clubs communities.

**Features:**
- Multi-tenant architecture — each league got a subdomain (`{slug}.atheus.dev`)
- Discord OAuth authentication
- Automated EA FC Pro Clubs API result detection and admin approval flow
- Live player statistics, standings, and club profiles
- Fixture generation and season management
- Discord bot operations scoped per-guild

**Technical stack:** Next.js 16 (App Router), React 19, TypeScript strict, Supabase (PostgreSQL), Auth.js v5, Sentry

**Status:** Platform still running at `/admin`. Reframed as a case study within the Atheus Industries portfolio.

## Why the rebrand

Atheus Industries is a broader technology and engineering studio. The league platform is one project, not the entire company.
