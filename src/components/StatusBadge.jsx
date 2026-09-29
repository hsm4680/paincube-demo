import React from "react";
import { STATUS_CLASS, STATUS_ICON } from "./status.js";

// 상태는 색상만으로 전달하지 않는다 — 아이콘 + 텍스트 (CLAUDE.md 4절).
// quiet: 평상시(STABLE) 표기는 색을 쓰지 않는다. 빨강이 떴을 때 확실히 보이게 하기 위해서다.
export default function StatusBadge({ status, quiet = false }) {
  const tone = STATUS_CLASS[status.color];
  const Icon = STATUS_ICON[status.label];
  const isStable = status.color === "status-stable";
  const muted = quiet && isStable;

  return (
    <span className={`chip ${muted ? "bg-page-bg text-text-label" : `${tone.tint} ${tone.text}`}`}>
      <Icon className="h-3 w-3" />
      {status.label}
    </span>
  );
}
