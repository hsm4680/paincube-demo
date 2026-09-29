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
    <div className="flex min-w-0 flex-col justify-center surface px-4">
      <span className="t-label truncate">{label}</span>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`t-figure ${small ? "text-[19px]" : "text-[26px]"} leading-tight ${valueClass}`}>{value}</span>
        {suffix && <span className="t-label">{suffix}</span>}
      </span>
    </div>
  );
}
