import React, { useState } from "react";
import { AlertTriangle, BrainCircuit, Check, FileCheck2, Loader2, ShieldCheck, X } from "lucide-react";
import { STATUS_CLASS } from "./status.js";
import {
  AUDIT,
  DOSE_OPTIONS,
  HORIZON_MIN,
  NEXT_ACTION,
  PHASES,
  RECOMMENDATION,
  SAFETY,
  SCALE_MAX,
  SEVERE,
  THRESHOLD,
  formatTimeToThreshold,
  signalChangeFor
} from "../data/phases.js";

// AI-CDSS — 위에서 아래로 5개 영역으로 고정한다 (PRD 5.6).
//   A 결론 블록(고정) / B CURRENT / C PREDICTED / D TIME TO THRESHOLD / E 동적 블록
//   B:C:D:E = 1:1:1:2. 이 비율은 다섯 단계 모두에서 같다 — 단계가 바뀌어도 영역이 튀지 않는다.
//   액션 푸터도 고정 높이로 자리를 비워 둔다. 그래야 각 영역의 절대 높이까지 같게 유지된다.
// 값 색은 게이지와 같은 밴드 규칙을 쓰고, 판정은 jitter 미적용 기준값으로 한다 (PRD 5.5-2).
const bandClass = (v) => (v >= SEVERE ? "text-status-critical" : v >= THRESHOLD ? "text-status-caution" : "text-status-stable");
const DIR_GLYPH = { up: "▲", down: "▼", flat: "—" };

export default function CdssPanel({ phase, metrics, live, approvalState, dose, dismissed, onApprove, onDismiss, onModify }) {
  const [doseOpen, setDoseOpen] = useState(false);
  const tone = STATUS_CLASS[metrics.status.color];
  const recommendation = `${RECOMMENDATION.drug} ${RECOMMENDATION.dose} ${RECOMMENDATION.unit} ${RECOMMENDATION.route}`;
  const approved = approvalState !== "ready";
  const showActions = phase === "recommendation" && !dismissed && !approved;
  const safetyVitals = PHASES.recommendation.vitals;
  const quiet = metrics.status.color !== "status-critical";
  // 한 화면 안에서 같은 지표가 다른 숫자로 보이면 안 된다 — 게이지·모니터·차트와 같은 표시값
  const shown = live ?? metrics;

  const chooseDose = (value) => {
    onModify(value);
    setDoseOpen(false);
    onApprove();
  };

  return (
    <section className="cdss-card panel relative flex h-full min-h-[320px] w-full flex-col border-cdss-border bg-cdss-surface xl:min-h-0">
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
          {/* A. 결론 블록 */}
          <div className={`shrink-0 px-3 py-1 ${quiet ? "" : tone.tint}`}>
            <Headline phase={phase} tone={tone} quiet={quiet} recommendation={recommendation} metrics={metrics} />
          </div>

          {/* B~E. 1:1:1:2 */}
          {/* 그리드의 내재 높이가 카드 높이를 밀어올리지 않도록 absolute로 띄운다.
              행 비율(1:1:1:2)은 단계와 무관하게 고정되고, 넘치는 내용은 각 행에서 잘린다. */}
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
            <MetricRow
              label="Current"
              value={shown.painScore.toFixed(1)}
              unit={`/ ${SCALE_MAX}`}
              valueClass={bandClass(metrics.painScore)}
            />
            <MetricRow
              label={`Predicted · ${HORIZON_MIN} min`}
              value={shown.predicted.toFixed(1)}
              unit={`/ ${SCALE_MAX}`}
              valueClass={bandClass(metrics.predicted)}
            />
            {/* 시간은 Pain Score 스케일이 아니므로 밴드 색을 적용하지 않는다 */}
            <MetricRow label="Time to Threshold" value={formatTimeToThreshold(metrics.timeToThreshold)} valueClass="text-text-primary" small />
              <DynamicBlock phase={phase} />
            </div>
          </div>

          {/* 액션 푸터 — 단계와 무관하게 높이를 유지한다 */}
          <div className="flex h-[64px] shrink-0 flex-col justify-end px-3 pb-1.5">
            {phase === "recommendation" && !approved && (
              <div className="cdss-meta mb-1 flex items-center gap-1.5 uppercase text-status-stable">
                <Check className="h-4 w-4 shrink-0" />
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

// 한 행을 통째로 쓰므로 숫자가 행의 주인공이다. 좌측 라벨 / 우측 값, 값 우측 끝선은 서로 맞는다.
function MetricRow({ label, value, unit, valueClass, small = false }) {
  return (
    <div className="flex min-h-0 items-center justify-between gap-3 overflow-hidden border-t border-hairline px-3">
      <span className="cdss-label truncate">{label}</span>
      <span className="flex items-baseline gap-1.5">
        <span className={`${small ? "cdss-row-value-sm" : "cdss-row-value"} ${valueClass}`}>{value}</span>
        {unit && <span className="cdss-row-unit">{unit}</span>}
      </span>
    </div>
  );
}

// E. 동적 블록 — idle/recovered는 한 줄 문장, 그 외는 셀 격자로 스캔되게 한다.
function DynamicBlock({ phase }) {
  const narrative = phase === "idle" || phase === "recovered";

  if (narrative) {
    return (
      <div className="min-h-0 overflow-hidden border-t border-hairline px-3 pt-1.5">
        <div className="cdss-label">Recommendation</div>
        <div className="cdss-body">
          {phase === "idle" ? "Continue monitoring; no opioid bolus indicated now" : "Response confirmed; continue current plan"}
        </div>
      </div>
    );
  }

  const cells = signalChangeFor(phase);

  return (
    <div className="grid min-h-0 grid-rows-2 overflow-hidden border-t border-hairline">
      <div className="flex min-h-0 items-center justify-between gap-3 overflow-hidden px-3">
        <span className="cdss-label shrink-0">Signal change</span>
        <div className="flex flex-wrap justify-end gap-1">
          {cells.map((c) => (
            <span key={c.label} className="signal-chip">
              <span className="font-semibold">{c.label}</span>
              <span className="tabular-nums">{c.delta}</span>
              <span aria-hidden="true">{DIR_GLYPH[c.dir]}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 items-center justify-between gap-3 overflow-hidden border-t border-hairline px-3">
        <span className="cdss-label shrink-0">Next action</span>
        <span className="cdss-next-action truncate">{NEXT_ACTION[phase]}</span>
      </div>
    </div>
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
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${
          quiet ? "bg-white/70 text-text-label" : `bg-card-surface ${tone.text}`
        }`}
      >
        <copy.Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className={`cdss-kicker ${quiet ? "text-text-label" : tone.text}`}>{copy.title}</div>
        <div className="cdss-headline">{copy.detail}</div>
      </div>
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
          <span className="t-label uppercase tracking-[0.06em]">{`Modify dose (${RECOMMENDATION.unit})`}</span>
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
              className="inset text-sm font-bold tabular-nums text-text-primary transition hover:text-brand-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
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
  return <div className="mt-1 line-clamp-2 text-[12px] leading-tight text-text-muted" title={text}>{text}</div>;
}
