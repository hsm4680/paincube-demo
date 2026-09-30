import React, { useState } from "react";
import { AlertTriangle, BrainCircuit, Check, FileCheck2, Loader2, ShieldCheck, X } from "lucide-react";
import { STATUS_CLASS } from "./status.js";
import { AUDIT, DOSE_OPTIONS, HORIZON_MIN, PHASES, RECOMMENDATION, SAFETY, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";

// AI-CDSS 카드 265px (게이지 160 + CDSS 265 = 좌측 열과 같은 425). 모든 수치는 PHASES·RECOMMENDATION에서 읽는다.
export default function CdssPanel({ phase, metrics, approvalState, dose, dismissed, onApprove, onDismiss, onModify }) {
  const [doseOpen, setDoseOpen] = useState(false);
  const tone = STATUS_CLASS[metrics.status.color];
  const painFact = `${metrics.painScore.toFixed(1)} / ${SCALE_MAX}, predicted ${metrics.predicted.toFixed(1)} in ${HORIZON_MIN} min`;
  const recommendation = `${RECOMMENDATION.drug} ${RECOMMENDATION.dose} ${RECOMMENDATION.unit} ${RECOMMENDATION.route}`;
  const approved = approvalState !== "ready";
  const showActions = phase === "recommendation" && !dismissed && !approved;
  // 안전성 뱃지의 RR·SpO2는 recommendation 단계 vitals에서 읽는다 (PRD 5.6)
  const safetyVitals = PHASES.recommendation.vitals;
  // 색은 ACTION REQUIRED에만 붙는다 (PRD 2.5)
  const quiet = metrics.status.color !== "status-critical";

  const chooseDose = (value) => {
    onModify(value);
    setDoseOpen(false);
    onApprove();
  };

  return (
    <section className="panel relative flex min-h-[265px] flex-1 flex-col">
      <div className="section-head justify-between">
        <span className="flex items-center gap-2">
          <FileCheck2 className="h-3.5 w-3.5" />
          AI-CDSS
        </span>
        <ShieldCheck className="h-3.5 w-3.5 text-white/55" />
      </div>

      {dismissed ? (
        <div className="flex flex-1 items-center justify-center px-4 text-[13px] font-semibold text-text-label">
          Recommendation dismissed
        </div>
      ) : (
        <div className={`flex flex-1 flex-col p-3 ${quiet ? "" : tone.tint}`}>
          <Headline phase={phase} tone={tone} quiet={quiet} recommendation={recommendation} metrics={metrics} />

          <div className="mt-2 grid flex-1 content-start gap-1.5">
            {phase === "idle" && (
              <>
                <Fact label="Pain Score(CPI)" value={painFact} />
                <Fact label="Time to Threshold" value={formatTimeToThreshold(metrics.timeToThreshold)} />
                <Fact label="Recommendation" value="Continue monitoring; no opioid bolus indicated now" />
              </>
            )}
            {phase === "warning" && (
              <>
                <Fact label="Pain Score(CPI)" value={painFact} />
                <Fact label="Signal change" value="EEG arousal burst + ECG rate variability + PPG amplitude shift" />
                <Fact label="Next action" value="CDSS medication recommendation pending validation" />
              </>
            )}
            {(phase === "recommendation" || phase === "administering" || phase === "recovered") && (
              <>
                <Fact label="Trigger" value={`Predicted Pain Score(CPI) ≥ ${THRESHOLD.toFixed(1)} within ${HORIZON_MIN} min`} />
                <Fact label="Rationale" value="EEG arousal + ECG/PPG sympathetic shift + EMR medication interval" />
              </>
            )}
          </div>

          {phase === "recommendation" && !approved && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-status-stable">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {`Safety check passed — RR ${safetyVitals.rr} · SpO₂ ${safetyVitals.spo2}% · 24h ${RECOMMENDATION.drug.toLowerCase()} ${SAFETY.fentanyl24h} ${RECOMMENDATION.unit}`}
              </span>
            </div>
          )}

          {showActions && (
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <ActionButton onClick={onDismiss} variant="ghost">Dismiss</ActionButton>
              <ActionButton onClick={() => setDoseOpen(true)} variant="ghost">Modify</ActionButton>
              <ActionButton onClick={onApprove} variant="primary">Approve</ActionButton>
            </div>
          )}

          {approved && (
            <div className="mt-1.5">
              <div className="flex h-8 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-navy text-xs font-semibold text-white" role="status" aria-live="polite" aria-busy={approvalState === "loading"}>
                {approvalState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {approvalState === "loading" ? "Approving order" : "Administration complete"}
              </div>
              {approvalState === "done" && <AuditTrail dose={dose} />}
            </div>
          )}
        </div>
      )}

      {doseOpen && <DosePicker onSelect={chooseDose} onClose={() => setDoseOpen(false)} />}
    </section>
  );
}

function Headline({ phase, tone, quiet, recommendation, metrics }) {
  const copy =
    phase === "idle"
      ? { Icon: Check, title: "Safe range", detail: "Maintain current analgesic plan" }
      : phase === "warning"
        ? { Icon: BrainCircuit, title: "Elevated risk under review", detail: "Recalculating treatment window" }
        : phase === "administering"
          ? { Icon: Loader2, title: "Order in progress", detail: metrics.aiStatus }
          : phase === "recovered"
            ? { Icon: Check, title: "Response confirmed", detail: metrics.aiStatus }
            : { Icon: AlertTriangle, title: "Preemptive analgesic recommendation", detail: recommendation };

  return (
    <div className="flex items-center gap-2.5">
      <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${quiet ? "bg-page-bg text-text-label" : `bg-card-surface ${tone.text}`}`}>
        <copy.Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className={`truncate text-[10px] font-semibold uppercase tracking-[0.08em] ${quiet ? "text-text-label" : tone.text}`}>{copy.title}</div>
        <div className="truncate text-[15px] font-bold tracking-[-0.01em] text-text-primary">{copy.detail}</div>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="border-t border-hairline pt-1">
      <div className="t-caption uppercase tracking-[0.06em]">{label}</div>
      <div className="t-value leading-snug">{value}</div>
    </div>
  );
}

function ActionButton({ children, onClick, variant }) {
  const style =
    variant === "primary"
      ? "bg-brand-navy text-white hover:bg-brand-panel"
      : "border border-hairline bg-card-surface text-text-label hover:text-brand-panel";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-[var(--radius-control)] text-[13px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel ${style}`}
    >
      {children}
    </button>
  );
}

// 용량 선택 팝업 (PRD 5.6). 권고 헤드라인은 25 mcg로 고정하고 선택값은 감사추적·EMR에 반영된다.
function DosePicker({ onSelect, onClose }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Modify dose">
      <div className="panel w-full p-3">
        <div className="flex items-center justify-between">
          <span className="t-label">{`Modify dose (${RECOMMENDATION.unit})`}</span>
          <button type="button" onClick={onClose} aria-label="Close dose picker" className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-text-label hover:bg-page-bg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {DOSE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className="inline-flex h-10 items-center justify-center inset text-sm font-bold tabular-nums text-text-primary transition hover:text-brand-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 감사추적 — AI 권고값과 임상의 결정값을 함께 남긴다 (PRD 5.6)
function AuditTrail({ dose }) {
  const modified = dose !== RECOMMENDATION.dose;
  const text = modified
    ? `${AUDIT.approvedAt} · Approved by ${AUDIT.clinician} (ID ${AUDIT.clinicianId}) · Recommended ${RECOMMENDATION.dose} ${RECOMMENDATION.unit} · Administered ${dose} ${RECOMMENDATION.unit} (modified)`
    : `${AUDIT.approvedAt} · Approved by ${AUDIT.clinician} (ID ${AUDIT.clinicianId}) · Sent to EMR — Ack ${AUDIT.ackAt}`;
  return <div className="t-caption mt-1.5 truncate" title={text}>{text}</div>;
}
