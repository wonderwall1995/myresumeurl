---
version: "alpha"
name: "Drill-Down Analytics"
description: "Drill-down analytics dashboard. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#1A1A1A"
  secondary: "#4A4A4A"
  tertiary: "#0066FF"
  neutral: "#FFFFFF"
typography:
  h1:
    fontFamily: System UI stack
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: System UI stack
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: System UI stack
    fontSize: 0.75rem
    fontWeight: 500
---

## Overview

Drill-down analytics dashboard. Ideal for landing pages, modern websites. AI-ready template. Before drill-down became a UX pattern, it was a database concept. OLAP cubes in the 90s let analysts slice multidimensional data — revenue by region, then by quarter, then by product line. The interaction was powerful but buried in enterprise tooling nobody outside of IT ever touched. The genius of modern drill-down is that it took that same hierarchical traversal and made it feel like browsing.

Tableau changed the game around 2013 by making this exploration visual and immediate. Click a bar, the chart redraws. Click again, deeper. Power BI followed suit. Suddenly, progressive disclosure wasn't just a UI trick for hiding complexity — it became the primary navigation model for data itself. The hierarchy IS the interface.

What we're designing now inherits all of that. Expandable rows, nested charts, breadcrumb trails back to the top level. The pattern works because it respects attention: show the summary first, let curiosity drive the depth. Not every user needs the granular view. Most don't. But the ones who do should never hit a wall.

- Density: 8/10 — Dense
- Variance: 4/10 — Moderate
- Motion: 6/10 — Expressive

- **Style:** BI/Analytics
- **Keywords:** Hierarchical data exploration, expandable sections, interactive drill-down paths, summary-to-detail flow, context preservation
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- Palette derived from style keywords and era context


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Drill-down expand animations, breadcrumb click transitions, smooth detail reveal, level change smooth, data reload animation

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 480ms ease-out. Staggered cascades for lists: 100ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 24px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Generously rounded (1.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Generously rounded (1.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Breadcrumbs clear
- Do Back navigation easy
- Do Expand animation smooth
- Do Context preserved
- Do Mobile drill works
- Do Deep links supported


## Use Case

Landing pages, Modern websites
