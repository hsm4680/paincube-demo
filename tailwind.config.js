/** @type {import('tailwindcss').Config} */

// src/styles.css의 CSS 토큰을 그대로 노출한다. (예: bg-page-bg, text-status-critical)
// theme.colors를 통째로 교체해 Tailwind 기본 팔레트(slate, cyan, emerald...)를 쓸 수 없게 막는다.
// white / black / transparent / current / inherit 는 남긴다 (CLAUDE.md 4절).
const tokens = [
  "brand-navy",
  "brand-panel",
  "brand-light",
  "page-bg",
  "card-surface",
  "hairline",
  "text-primary",
  "text-label",
  "text-muted",
  "status-stable",
  "status-caution",
  "status-critical",
  "status-nodata",
  "status-stable-tint",
  "status-caution-tint",
  "status-critical-tint",
  "signal-eeg",
  "signal-ecg",
  "signal-ppg",
  "monitor-bg",
  "monitor-grid",
  "monitor-bar",
  "monitor-ink",
  "monitor-ink-dim",
  "monitor-alert",
  "chart-observed",
  "chart-now",
  "chart-grid"
];

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    colors: {
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      ...Object.fromEntries(tokens.map((t) => [t, `var(--${t})`]))
    },
    extend: {}
  },
  plugins: []
};
