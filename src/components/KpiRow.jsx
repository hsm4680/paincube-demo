import React from "react";
import { HORIZON_MIN, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";
import { STATUS_CLASS } from "./status.js";

// 상단 KPI 3칸 (PRD 5.2) — 카드 3개가 아니라 한 줄에 세로 구분선으로 나눈다.
export default function KpiRow({ metrics }) {
  const breach = metrics.predicted >= THRESHOLD;
  const forecast = STATUS_CLASS[breach ? "status-critical" : "status-stable"];

  return (
    <div className="panel grid flex-1 grid-cols-3">
      <Kpi label="Current Pain Score" value={metrics.painScore.toFixed(1)} unit={`/ ${SCALE_MAX}`} />
      <Kpi
        label={`Predicted · ${HORIZON_MIN} min`}
        value={metrics.predicted.toFixed(1)}
        valueClass={breach ? forecast.text : undefined}
        divided
      />
      <Kpi
        label="Time to Threshold"
        value={metrics.timeToThreshold == null ? "No breach" : `${metrics.timeToThreshold}`}
        unit={metrics.timeToThreshold == null ? "predicted" : "min"}
        valueClass={metrics.timeToThreshold == null ? undefined : forecast.text}
        small={metrics.timeToThreshold == null}
        divided
      />
    </div>
  );
}

function Kpi({ label, value, unit, valueClass, small = false, divided = false }) {
  return (
    <div className={`flex min-w-0 items-baseline gap-2 px-4 py-2 ${divided ? "rule-l" : ""}`}>
      <span className="t-label shrink-0">{label}</span>
      <span className="ml-auto flex items-baseline gap-1.5">
        <span className={`${small ? "t-primary" : "t-hero"} ${valueClass ?? ""}`}>{value}</span>
        {unit && <span className="t-unit">{unit}</span>}
      </span>
    </div>
  );
}
