import React from "react";
import { Gauge } from "lucide-react";
import { STATUS_CLASS, STATUS_ICON } from "./status.js";
import { BASELINE_WINDOW_H, HORIZON_MIN, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";

export default function PainGauge({ metrics }) {
  const status = STATUS_CLASS[metrics.status.color];
  const StatusIcon = STATUS_ICON[metrics.status.label];
  const breach = metrics.predicted >= THRESHOLD;
  const forecast = breach ? STATUS_CLASS["status-critical"] : STATUS_CLASS["status-stable"];
  const circumference = 2 * Math.PI * 56;
  const currentDash = circumference - (metrics.painScore / SCALE_MAX) * circumference;
  const predictedDash = circumference - (metrics.predicted / SCALE_MAX) * circumference;

  return (
    <section className="rounded-lg border border-hairline bg-card-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-panel">
            <Gauge className="h-4 w-4 text-brand-light" />
            Pain Score(CPI)
          </div>
          <h2 className="mt-1 text-xl font-semibold text-brand-navy">Pain forecast</h2>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${status.border} ${status.tint} ${status.text}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {metrics.status.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r="56" fill="none" className="stroke-hairline" strokeWidth="13" />
            <circle cx="70" cy="70" r="56" fill="none" className={forecast.stroke} strokeOpacity="0.35" strokeWidth="13" strokeDasharray={circumference} strokeDashoffset={predictedDash} strokeLinecap="round" />
            <circle cx="70" cy="70" r="56" fill="none" className={status.stroke} strokeWidth="13" strokeDasharray={circumference} strokeDashoffset={currentDash} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold tabular-nums text-text-primary">{metrics.painScore.toFixed(1)}</div>
            <div className="max-w-[88px] text-center text-[10px] uppercase leading-tight tracking-[0.06em] text-text-label">{`Pain Score(CPI) / ${SCALE_MAX}`}</div>
          </div>
        </div>

        <div className="grid gap-3">
          <MetricRow label={`Predicted · ${HORIZON_MIN} min`} value={metrics.predicted.toFixed(1)} valueClass={forecast.text} />
          <MetricRow label="Time to Threshold" value={formatTimeToThreshold(metrics.timeToThreshold)} valueClass={forecast.text} />
          <MetricRow label="Personal baseline" value={`${BASELINE_WINDOW_H}h adaptive`} valueClass="text-text-primary" />
        </div>
      </div>
    </section>
  );
}

function MetricRow({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-hairline bg-page-bg px-3 py-2">
      <span className="text-sm text-text-label">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}
