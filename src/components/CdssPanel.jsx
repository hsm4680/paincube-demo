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
    <section className="cdss-card panel relative flex h-full min-h-0 w-full flex-col border-cdss-border bg-cdss-surface">
      <div className="section-head justify-between">
        <span className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4" />
          AI-CDSS
        </span>
        <ShieldCheck className="h-3.5 w-3.5 text-white/55" />
      </div>

      {dismissed ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-[18px] font-semibold text-text-label">
          Recommendation dismissed
        </div>
      ) : (
        <div className={`flex min-h-0 flex-1 flex-col p-3 ${quiet ? "" : `${tone.tint} rounded-[var(--radius-control)]`}`}>
          <Headline phase={phase} tone={tone} quiet={quiet} recommendation={recommendation} metrics={metrics} />

          <div className="mt-2 grid min-h-0 flex-1 content-evenly gap-1 overflow-hidden">
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
                <Fact label="Rationale" value="Intraoperative opioid offset · propofol provides sedation without analgesia · EEG arousal + ECG/PPG sympathetic shift" />
              </>
            )}
          </div>

          {phase === "recommendation" && !approved && (
            <div className="cdss-meta mt-2 flex items-start gap-2 uppercase text-status-stable">
              <Check className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="min-w-0">
                {`Safety check passed — RR ${safetyVitals.rr} · SpO₂ ${safetyVitals.spo2}% · No opioid in past ${SAFETY.opioidFreeHours} h`}
              </span>
            </div>
          )}

          {showActions && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <ActionButton onClick={onDismiss} variant="ghost">Dismiss</ActionButton>
              <ActionButton onClick={() => setDoseOpen(true)} variant="ghost">Modify</ActionButton>
              <ActionButton onClick={onApprove} variant="primary">Approve</ActionButton>
            </div>
          )}

          {approved && (
            <div className="mt-1.5">
              <div className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-navy text-[15px] font-semibold text-white" role="status" aria-live="polite" aria-busy={approvalState === "loading"}>
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
    <div className="flex items-start gap-3">
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${quiet ? "bg-white/70 text-text-label" : `bg-card-surface ${tone.text}`}`}>
        <copy.Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className={`cdss-kicker ${quiet ? "text-text-label" : tone.text}`}>{copy.title}</div>
        <div className="cdss-headline">{copy.detail}</div>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="border-t border-hairline pt-2">
      <div className="cdss-label">{label}</div>
      <div className="cdss-body">{value}</div>
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
      className={`inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel ${style}`}
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
  return <div className="mt-2 text-[12px] text-text-muted" title={text}>{text}</div>;
}
