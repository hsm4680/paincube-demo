# DESIGN.md — PainCube ICU CDSS Demo

Visual system for stage 11 (visual polish). Product truth is in `PRODUCT.md`;
binding specs are `PRD.md` and `CLAUDE.md`.

## Scope of stage 11

CSS, typography, spacing, shadows, radii, texture. **Nothing else.**
No changes to features, layout structure, component boundaries, or data.

## Invariants — do not flag, do not "improve"

These are deliberate, verified decisions. Treat any suggestion to change them as out of scope.

### Color — not defined here, on purpose

The palette has a single source: **PRD.md §3 and CLAUDE.md §4**, implemented as CSS custom
properties in `src/styles.css` and exposed through `tailwind.config.js`.
It was extracted from the PainCube logo and passed color-vision-deficiency contrast verification.

- Three layers that never mix: **brand/structure**, **status**, **signal/waveform**.
- `--status-stable` is `#118C6E`, not a pure green. Pure green fails CVD separation against orange
  (ΔE 2.9). Do not propose `green-500`, `emerald-*`, or any pure green as a status color.
- `--brand-light` `#77A0D5` is icon/accent only. Never a status or data color, never body text
  (2.7:1).
- Inside the navy monitor region only two levels exist: `--monitor-ink` and `--monitor-alert`
  (with a ▲ glyph). The three status colors are for white card surfaces only.
- Components use tokens. No hex literals in components, no Tailwind arbitrary colors.

**This file intentionally has no palette section. Do not add one.**

### Typography

System sans-serif stack only. No Google Fonts, no web font loading, no font pairing proposals.

### Terminology

`Pain Score(CPI)`, `PRED_15M` / `Predicted · 15 min`, `Time to Threshold`, `Threshold 5.0`.
Never `CPI` alone, never a 30-minute horizon, never probability.

### Data

All displayed values come from `src/data/patients.js` and `src/data/phases.js`.

### Height budget

Patient Detail fits 1440×900 without scrolling (PRD §5.1): header 84 / status + KPI 96 /
columns 425 each (+12 inner gap) / EMR 96. Trend plot must never be shorter than the waveform body.

### State communication

Never color alone. Status always renders icon + text.

## What stage 11 changes

Current symptoms: every element carries the same border, radius and shadow; labels are uniformly
uppercase in one gray at one tracking; spacing repeats 12/16px mechanically; large and small
numbers share one weight.

### Type scale — four steps, each differing in size, weight and color

| Step | Role | Spec |
|---|---|---|
| Title | card and section names | 12–13px, 600, `--brand-panel`, uppercase, tracking 0.06em |
| Value | the number or fact being read | 15–48px, 700, `--text-primary`, `tabular-nums` |
| Label | what a value is | 11px, 500–600, `--text-label`, sentence case where it is not a code-like token |
| Caption | provenance, role tags, audit trail | 10px, 400, `--text-muted` |

Large figures (ward card score, KPI, gauge center) take a heavier weight and tighter tracking than
supporting numbers; supporting numbers stay 600 and never compete.

### Spacing — 4px scale with deliberate steps

`4 / 8 / 12 / 16 / 24`. Card padding varies by importance rather than repeating one value:
primary cards 16–20px, dense strips 8–12px. Related items sit at 4–8px; separate groups at 16–24px.

### Surfaces — tone and spacing over borders

Cards read as surfaces on the `--page-bg` field: a white surface, a hairline only where two
surfaces meet without a spacing break, and a shadow small enough to be felt rather than seen.
Status tint and status border stay reserved for cards that genuinely carry a status.

### Radii

Two steps: 10px for cards and panels, 6px for controls and inline chips. No third value.

### Shadows

At most one soft, low-opacity elevation for cards; modals may use one step more.
No glow, no colored shadows.
