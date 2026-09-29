import React from "react";
import { HORIZON_MIN, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";
import { STATUS_CLASS } from "./status.js";

// 상단 KPI 3칸 (PRD 5.2). 수치는 전부 PHASES에서 온다.
export default function KpiRow({ metrics }) {
  const breach = metrics.predicted >= THRESHOLD;
  const forecast = STATUS_CLASS[breach ? "status-critical" : "status-stable"];

  return (
    <div className="grid flex-1 grid-cols-3 gap-2">
      <Kpi label="Current Pain Score" value={metrics.painScore.toFixed(1)} suffix={`/ ${SCALE_MAX}`} />
      <Kpi label={`Predicted · ${HORIZON_MIN} min`} value={metrics.predicted.toFixed(1)} valueClass={forecast.text} />
      <Kpi label="Time to Threshold" value={formatTimeToThreshold(metrics.timeToThreshold)} valueClass={metrics.timeToThreshold == null ? "text-text-primary" : forecast.text} small />
    </div>
  );
}

function Kpi({ label, value, suffix, valueClass = "text-text-primary", small = false }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg border border-hairline bg-card-surface px-4 shadow-sm">
      <span className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-text-label">{label}</span>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-xl" : "text-2xl"} font-bold leading-tight tabular-nums ${valueClass}`}>{value}</span>
        {suffix && <span className="text-sm font-semibold text-text-label">{suffix}</span>}
      </span>
    </div>
  );
}
