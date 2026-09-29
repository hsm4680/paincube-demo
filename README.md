# PainCube Demo (v2)

Investor- and clinical-partner-facing demo of PainCube, a predictive pain AI and AI-CDSS concept
for the ICU.

All data is synthetic. This is not medical device software — the screen carries a permanent
`For investigational use only — not for clinical decision-making` notice.

## Screens

v2 has two screens, switched by React state (no router).

| Screen | What it shows |
|---|---|
| **Ward Dashboard** | 6 ICU beds as a 3 × 2 card grid, sorted by **predicted** Pain Score descending. Each card carries the current score, a 0–10 ruler with the 5.0 threshold, and the 15-minute prediction. |
| **Patient Detail** | Status word + 3 KPIs, the Pain Score(CPI) trend & forecast chart, the EEG/ECG/PPG waveform monitor with vitals, the Pain Forecast gauge, the AI-CDSS card, and the EMR context table. |

Every bed opens its own detail screen. Bed 03 (#1468, CABG POD 0, intubated, RASS −4) is the
patient the demo script follows.

## Running the demo

1. Start on the **Ward Dashboard**. Bed 03 sits last — it has the lowest current pain score.
2. Press **Demo Start**.
3. `+2s` — Bed 03 enters the `warning` phase and its card animates from 6th to 1st, because its
   *predicted* score (6.2) now exceeds the threshold of 5.0.
4. `+3.5s` — the **Pre-pain alert** modal appears, centered over a dimmed background, showing the
   current and predicted values and the bed's new rank.
5. Press **View patient** to enter Patient Detail. The same modal is shown again with a
   **Continue** button.
6. `2s after the modal closes` — the `recommendation` phase arrives: `Fentanyl 25 mcg IV Bolus`,
   a one-line safety check, and three actions.
   - **Dismiss** closes the recommendation (Reset to bring it back).
   - **Modify** offers 12.5 / 25 / 50 mcg, then follows the approval flow.
   - **Approve** runs a 2.2s order, then settles into `recovered` and writes an audit trail line.
   At the same moment, the three EMR cells the safety check actually referenced are marked, and
   after approval `Last analgesic` updates and flashes briefly.
7. **← Ward** returns to the dashboard with Bed 03's current values.
8. **Reset** returns to the Ward Dashboard initial state from either screen and clears every
   running timer. It is the only way to rewind mid-presentation.

`Demo Start` and `Reset` are present on both screens. There is no alarm sound.

Target presentation size is a **1440 × 900 laptop**; both screens fit without scrolling.

## Specification documents

These two files are the specification. Read them before changing anything.

- **`PRD.md`** — what to build: screens, phase data, the demo flow, the color system, the height
  budget, and the color-decision rule (§5.4-1).
- **`CLAUDE.md`** — the constraints that must not break: language, terminology, the three-layer
  color tokens, waveform buffer rules, layout and accessibility rules.

`PRODUCT.md` and `DESIGN.md` hold the product and visual context used by the design tooling.

## Stack

React · Vite · Tailwind CSS · lucide-react. No chart library, no router, no animation library —
the trend chart is hand-written SVG and the waveforms are canvas.

## Local development

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # serve the build output
```

## Deployment

Vercel — Framework Preset `Vite`, Build Command `npm run build`, Output Directory `dist`,
Install Command `npm install`.

## Notes

- `captures/` holds before/after screenshots used during design review. It is gitignored.
- The `impeccable` design tooling installs binaries into `.claude/`, `.agents/` and `.codex/`.
  Those are gitignored too; only `.impeccable/config.json` is committed.
