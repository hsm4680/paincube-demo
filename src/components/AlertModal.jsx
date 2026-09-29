import React, { useEffect, useRef } from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { HORIZON_MIN, THRESHOLD } from "../data/phases.js";
import { bedLabel, patientIdLabel } from "../data/patients.js";

// 화면 중앙 + 배경 60% Dim (PRD 8). 알람음 없음. 모든 수치는 metrics에서 읽는다.
export default function AlertModal({ metrics, patient, rank, actionLabel, onAction, onClose }) {
  const actionRef = useRef(null);

  useEffect(() => {
    actionRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="pre-pain-alert-title">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="relative w-[min(560px,100%)] rounded-[var(--radius-card)] bg-card-surface p-6 ring-2 ring-status-caution" style={{ boxShadow: "var(--shadow-modal)" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-text-label transition hover:bg-page-bg hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pr-12">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-status-caution-tint text-status-caution">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="pre-pain-alert-title" className="text-lg font-bold uppercase tracking-[0.06em] text-status-caution">
              Pre-pain alert
            </h2>
            <div className="text-sm font-semibold text-text-label">{`${bedLabel(patient)} \u00b7 ${patientIdLabel(patient)} \u00b7 now ranked #${rank}`}</div>
          </div>
        </div>

        <p className="mt-5 text-base leading-7 text-text-primary">
          {`Pain Score predicted to exceed ${THRESHOLD.toFixed(1)} within ${HORIZON_MIN} minutes`}
        </p>

        <div className="inset mt-5 flex items-center justify-between gap-4 px-4 py-3">
          <Figure label="Current" value={metrics.painScore.toFixed(1)} valueClass="text-text-primary" />
          <ArrowRight className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
          <Figure label={`Predicted · ${HORIZON_MIN} min`} value={metrics.predicted.toFixed(1)} valueClass="text-status-critical" align="right" />
        </div>

        <button
          ref={actionRef}
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-control)] bg-brand-panel px-4 text-sm font-semibold text-white transition hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function Figure({ label, value, valueClass, align = "left" }) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <div className="t-label">{label}</div>
      <div className={`mt-0.5 text-2xl font-bold tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}
