import React from "react";
import { Gauge } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { STATUS_CLASS } from "./status.js";
import { BASELINE_WINDOW_H, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 게이지 카드 180px (PRD 5.1). Predicted / Time to Threshold 줄은 KPI 3칸과 중복이라 삭제했다.
export default function PainGauge({ metrics }) {
  const status = STATUS_CLASS[metrics.status.color];
  const breach = metrics.predicted >= THRESHOLD;
  const forecast = STATUS_CLASS[breach ? "status-critical" : "status-stable"];
  const R = 46;
  const circumference = 2 * Math.PI * R;
  const currentDash = circumference - (metrics.painScore / SCALE_MAX) * circumference;
  const predictedDash = circumference - (metrics.predicted / SCALE_MAX) * circumference;

  return (
    <section className="flex h-[180px] flex-col rounded-lg border border-hairline bg-card-surface px-5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-brand-panel">
          <Gauge className="h-4 w-4 text-brand-light" />
          Pain forecast
        </div>
        <StatusBadge status={metrics.status} size="sm" />
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-[112px] w-[112px] shrink-0">
          <svg viewBox="0 0 112 112" className="-rotate-90">
            <circle cx="56" cy="56" r={R} fill="none" className="stroke-hairline" strokeWidth="11" />
            <circle cx="56" cy="56" r={R} fill="none" className={forecast.stroke} strokeOpacity="0.35" strokeWidth="11" strokeDasharray={circumference} strokeDashoffset={predictedDash} strokeLinecap="round" />
            <circle cx="56" cy="56" r={R} fill="none" className={status.stroke} strokeWidth="11" strokeDasharray={circumference} strokeDashoffset={currentDash} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tabular-nums text-text-primary">{metrics.painScore.toFixed(1)}</div>
            <div className="text-[10px] uppercase leading-tight tracking-[0.06em] text-text-label">{`/ ${SCALE_MAX}`}</div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-text-label">Pain Score(CPI)</div>
          <div className="mt-1 text-[15px] font-semibold text-text-primary">{metrics.aiStatus}</div>
          <div className="mt-3 rounded-md border border-hairline bg-page-bg px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-label">Personal baseline</div>
            <div className="text-[15px] font-semibold text-text-primary">{`${BASELINE_WINDOW_H}h adaptive`}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
