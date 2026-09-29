import React from "react";
import { STATUS_CLASS, STATUS_ICON } from "./status.js";

// 상태는 색상만으로 전달하지 않는다 — 아이콘 + 텍스트 (CLAUDE.md 4절)
export default function StatusBadge({ status, size = "md" }) {
  const tone = STATUS_CLASS[status.color];
  const Icon = STATUS_ICON[status.label];
  const scale = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  const iconScale = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-control)] font-semibold uppercase tracking-[0.08em] ${scale} ${tone.tint} ${tone.text}`}>
      <Icon className={iconScale} />
      {status.label}
    </span>
  );
}
