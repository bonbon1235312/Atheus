# Atheus — Design System

## Direction
Premium dark engineering brand. Near-black canvas, cool zinc neutrals, one amber signal accent. Feels closer to Linear / Vercel / Resend in quality, not imitation.

## Theme
Dark only for the company marketing site. Scene: a technical founder evaluating Atheus late at night on a laptop. Sharp, quiet, high contrast.

## Colour
| Token | Value | Use |
|-------|-------|-----|
| Background | `#0b0c0e` | Page |
| Elevated | `#121418` | Surfaces |
| Text | `#f4f5f7` | Primary type |
| Muted | `#9aa3b2` | Body |
| Dim | `#6b7380` | Meta |
| Accent | `#e8a23a` | CTA, signal, sparse highlights |
| Accent ink | `#140e05` | Text on accent buttons |
| Success | `#3dba84` | Live status |

Accent usage stays under ~10% of the surface.

## Typography
- Display / body: **Sora** (`--font-display`, `--font-body`)
- Mono (sparse labels only): **JetBrains Mono** (`--font-mono`)
- Large confident headings, comfortable reading widths (~62ch body)

## Shape
- Interactive radius: `10px`
- Surface radius: `14px`
- Borders: `rgba(255,255,255,0.08)` hairlines
- Elevation via border + soft tinted shadow, not heavy multi-layer glow

## Motion
Subtle only: hero grid drift, bar entrance, card hover lift, sticky header border. Honor `prefers-reduced-motion`.

## Components
Marketing primitives live in `components/marketing/` and `app/marketing.css`:
- Shell, header, footer
- Buttons, badges, product cards
- FAQ accordion, CTA band, tech chips

## Product pages
Shared template at `app/products/[slug]/page.tsx` driven by `lib/products.ts`.
Add a product by extending the catalog array.

## Out of scope for this system
Admin workspace and public league sites keep their existing visual systems (`globals.css`, `public.css`).
