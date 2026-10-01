import React, { useState } from "react";
import { AlertTriangle, BrainCircuit, Check, FileCheck2, Loader2, ShieldCheck, X } from "lucide-react";
import { STATUS_CLASS } from "./status.js";
import { AUDIT, DOSE_OPTIONS, HORIZON_MIN, PHASES, RECOMMENDATION, SAFETY, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";

// AI-CDSS 카드 265px (게이지 160 + CDSS 265 = 좌측 열과 같은 425). 모든 수치는 PHASES·RECOMMENDATION에서 읽는다.
export default function CdssPanel({ phase, metrics, live, approvalState, dose, dismissed, onApprove, onDismiss, onModify }) {
  const [doseOpen, setDoseOpen] = useState(false);
  const tone = STATUS_CLASS[metrics.status.color];
  // 한 화면 안에서 같은 지표가 다른 숫자로 보이면 안 된다 — 게이지·모니터와 같은 표시값을 쓴다.
  // 임계·색 판정은 기존대로 기준값(metrics)으로 한다.
  const shown = live ?? metrics;
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
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-[15px] font-semibold text-text-label">
          Recommendation dismissed
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* 1) 결론 블록 — 이 카드의 결론. 아래 근거와 단차로 끊는다. */}
          <div className={`px-3 py-0.5 ${quiet ? "" : tone.tint}`}>
            <Headline phase={phase} tone={tone} quiet={quiet} recommendation={recommendation} metrics={metrics} />
          </div>

          {/* 2) 필드 그리드 — 지표는 각자 자기 칸을 갖는다 */}
          <div className="cdss-fields border-y border-cdss-border">
            <Field label="Current" value={shown.painScore.toFixed(1)} unit={`/ ${SCALE_MAX}`} />
            <Field label={`Predicted · ${HORIZON_MIN} min`} value={shown.predicted.toFixed(1)} unit={`/ ${SCALE_MAX}`} divided />
            <Field label="Time to Threshold" value={formatTimeToThreshold(metrics.timeToThreshold)} divided />
          </div>

          {/* 3) 서술 블록 */}
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-1 overflow-hidden px-3 py-1">
            {phase === "idle" && (
              <Narrative label="Recommendation" value="Continue monitoring; no opioid bolus indicated now" />
            )}
            {phase === "warning" && (
              <>
                <Narrative label="Signal change" value="EEG arousal burst + ECG rate variability + PPG amplitude shift" />
                <Narrative label="Next action" value="CDSS medication recommendation pending validation" />
              </>
            )}
            {(phase === "recommendation" || phase === "administering" || phase === "recovered") && (
              <>
                <Narrative label="Trigger" value={`Predicted Pain Score(CPI) ≥ ${THRESHOLD.toFixed(1)} within ${HORIZON_MIN} min`} />
                <Narrative label="Rationale" value="Intraoperative opioid offset · propofol provides sedation without analgesia · EEG arousal + ECG/PPG sympathetic shift" />
              </>
            )}
          </div>

          <div className="px-3 pb-1.5">
            {phase === "recommendation" && !approved && (
              <div className="cdss-meta mb-1 flex items-start gap-2 uppercase text-status-stable">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  {`Safety check passed — RR ${safetyVitals.rr} · SpO₂ ${safetyVitals.spo2}% · No opioid in past ${SAFETY.opioidFreeHours} h`}
                </span>
              </div>
            )}

            {showActions && (
              <div className="grid grid-cols-3 gap-2">
                <ActionButton onClick={onDismiss} variant="ghost">Dismiss</ActionButton>
                <ActionButton onClick={() => setDoseOpen(true)} variant="ghost">Modify</ActionButton>
                <ActionButton onClick={onApprove} variant="primary">Approve</ActionButton>
              </div>
            )}

            {approved && (
              <div>
                <div
                  className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand-navy text-[14px] font-semibold text-white"
                  role="status"
                  aria-live="polite"
                  aria-busy={approvalState === "loading"}
                >
                  {approvalState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {approvalState === "loading" ? "Approving order" : "Administration complete"}
                </div>
                {approvalState === "done" && <AuditTrail dose={dose} />}
              </div>
            )}
          </div>
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

function Field({ label, value, unit, divided = false, className = "" }) {
  return (
    <div className={`cdss-field ${divided ? "border-l border-cdss-border" : ""} ${className}`}>
      <span className="cdss-label truncate">{label}</span>
      <span className="flex items-baseline gap-1.5">
        <span className="cdss-field-value">{value}</span>
        {unit && <span className="cdss-field-unit">{unit}</span>}
      </span>
    </div>
  );
}

function Narrative({ label, value }) {
  return (
    <div>
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
      className={`inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel ${style}`}
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
  return <div className="mt-1 text-[12px] text-text-muted" title={text}>{text}</div>;
}
