# PRODUCT.md — PainCube ICU CDSS Demo

Product truth for this repository. Visual decisions live in DESIGN.md.
Authoritative specs remain `PRD.md` and `CLAUDE.md`; this file only restates durable product facts
for design tooling. Where they disagree, PRD.md and CLAUDE.md win.

Facts below are taken from PRD.md / CLAUDE.md (written by the product owner), not inferred.

## Platform

web — desktop/laptop first, optimized for a 1440×900 presentation laptop.

## What this is

An investor- and clinical-partner-facing **demo** of PainCube, a predictive pain AI for the ICU.
It is not medical device software. All data is synthetic. A permanent
`For investigational use only — not for clinical decision-making` notice stays on screen.

## Primary user (of the demo)

The presenter (founder) driving a scripted 60–90 second story in front of investors or
ICU clinicians. The audience is the real target: intensivists and ICU nurses who know what a
patient monitor looks like, and investors who do not.

## Job to be done

Show that PainCube predicts pain **before** it happens in a sedated, intubated patient who cannot
self-report, and that the prediction is actionable: monitor signals → pain forecast → CDSS
recommendation → clinician approval → EMR write-back.

## Meaningfully different mechanism

Continuous EEG/ECG/PPG-derived Pain Score with a 15-minute forecast and a `Time to Threshold`
figure, for patients where the standard measure (patient self-report, NRS 0–10) does not exist.
The demo's proof scene: the bed with the *lowest* current pain score sorts to the top of the ward
because its *predicted* score crosses the threshold.

## Surfaces

1. **Ward Dashboard** — 6 ICU beds, 3×2 cards, sorted by predicted Pain Score descending.
2. **Patient Detail** — trend + forecast chart, waveform monitor, pain gauge, AI-CDSS, EMR context.

Both are Operate-mode surfaces: a clinician scanning for who needs attention, then acting.

## Durable constraints (do not break)

- Patient Detail fits **1440×900 with no scrolling**. Current measured content height: 773px.
- Every number on screen comes from `src/data/patients.js` or `src/data/phases.js`. No numbers
  hardcoded into strings.
- All UI text is English. Korean appears only in code comments and docs.
- Status is never conveyed by color alone — always icon + text.
- No new dependencies (react, react-dom, vite, tailwindcss, lucide-react only). No chart library,
  no router, no animation library, no web fonts.
- No alarm sound.

## Terminology (fixed)

| Use | Never |
|---|---|
| `Pain Score(CPI)` | `CPI` alone, `Calculated Pain Index` |
| `PRED_15M` / `Predicted · 15 min` | any 30-minute horizon |
| `Time to Threshold` | `RISK %`, probability of any kind |
| `Threshold 5.0` | `7.0` |

## Clinical facts the demo asserts

- Hero patient: #1468, M/69, ICU Bed 03, CABG, POD 0, intubated, RASS −4, unable to self-report.
- Single medication recommendation: `Fentanyl 25 mcg IV Bolus` (12.5 / 25 / 50 mcg on Modify).
- Safety badge figures are read from the `recommendation` phase vitals.
- `Pain assessment` shows elapsed time since the last nurse observation, never a score.

## Accessibility commitments

- Keyboard reachable controls with a visible 2px focus ring.
- `prefers-reduced-motion` disables card re-sort motion and the trend interpolation.
- Waveform canvas, gauge, and cards carry text alternatives.
