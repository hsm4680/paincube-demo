import React from "react";
import { STATUS_CLASS, STATUS_ICON } from "./status.js";

// 상태는 색상만으로 전달하지 않는다 — 아이콘 + 텍스트 (CLAUDE.md 4절).
// 색은 ACTION REQUIRED에만 붙는다. 나머지 상태어는 중성 회색이다 (PRD 2.5).
export default function StatusBadge({ status }) {
  const tone = STATUS_CLASS[status.color];
  const Icon = STATUS_ICON[status.label];

  return (
    <span className={`chip ${tone.tint} ${tone.text}`}>
      <Icon className="h-3 w-3" />
      {status.label}
    </span>
  );
}
