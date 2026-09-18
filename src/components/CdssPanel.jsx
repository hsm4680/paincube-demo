import React from "react";
import { AlertTriangle, BrainCircuit, Check, FileCheck2, Loader2, Pill, ShieldCheck } from "lucide-react";
import { STATUS_CLASS } from "./status.js";
import { HORIZON_MIN, RECOMMENDATION, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";

export default function CdssPanel({ phase, metrics, approvalState, onApprove }) {
  // 블록 색은 현재 단계 상태어의 색을 따른다 (idle=stable, warning=caution, 이후 단계별)
  const tone = STATUS_CLASS[metrics.status.color];
  const painFact = `${metrics.painScore.toFixed(1)} / ${SCALE_MAX}, predicted ${metrics.predicted.toFixed(1)} in ${HORIZON_MIN} min`;
  const timeToThreshold = formatTimeToThreshold(metrics.timeToThreshold);
  const recommendation = `${RECOMMENDATION.drug} ${RECOMMENDATION.dose} ${RECOMMENDATION.unit} ${RECOMMENDATION.route}`;
  const showRecommendation = phase === "recommendation" || phase === "administering" || phase === "recovered";
  const safeMode = phase === "idle";
  const reviewMode = phase === "warning";

  return (
    <section className="flex min-h-[320px] flex-col rounded-lg border border-hairline bg-card-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-panel">
            <FileCheck2 className="h-4 w-4 text-brand-light" />
            AI-CDSS
          </div>
          <h2 className="mt-1 text-xl font-semibold text-brand-navy">Treatment recommendation</h2>
        </div>
        <ShieldCheck className="h-6 w-6 text-text-muted" />
      </div>

      {safeMode ? (
        <div className={`mt-5 flex flex-1 flex-col rounded-lg border ${tone.border} ${tone.tint} p-4`}>
          <div className="flex items-start gap-3">
            <div className={`rounded-md border ${tone.border} bg-card-surface p-2 ${tone.text}`}>
              <Check className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${tone.text}`}>Safe range recommendation</div>
              <div className="mt-1 text-lg font-semibold text-text-primary">Maintain current analgesic plan</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <DecisionFact tone={tone} label="Pain Score(CPI)" value={painFact} />
            <DecisionFact tone={tone} label="Time to Threshold" value={timeToThreshold} />
            <DecisionFact tone={tone} label="Recommendation" value="Continue monitoring; no opioid bolus indicated now" />
          </div>
        </div>
      ) : reviewMode ? (
        <div className={`mt-5 flex flex-1 flex-col rounded-lg border ${tone.border} ${tone.tint} p-4`}>
          <div className="flex items-start gap-3">
            <div className={`rounded-md border ${tone.border} bg-card-surface p-2 ${tone.text}`}>
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${tone.text}`}>Elevated risk under review</div>
              <div className="mt-1 text-lg font-semibold text-text-primary">Recalculating treatment window</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <DecisionFact tone={tone} label="Pain Score(CPI)" value={painFact} />
            <DecisionFact tone={tone} label="Signal change" value="EEG arousal burst + ECG rate variability + PPG amplitude shift" />
            <DecisionFact tone={tone} label="Next action" value="CDSS medication recommendation pending validation" />
          </div>
        </div>
      ) : (
        <div className={`mt-5 flex flex-1 flex-col rounded-lg border ${tone.border} ${tone.tint} p-4`}>
          <div className="flex items-start gap-3">
            <div className={`rounded-md border ${tone.border} bg-card-surface p-2 ${tone.text}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${tone.text}`}>Preemptive analgesic recommendation</div>
              <div className="mt-1 text-lg font-semibold text-text-primary">{recommendation}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <DecisionFact tone={tone} label="Trigger" value={`Predicted Pain Score(CPI) \u2265 ${THRESHOLD.toFixed(1)} within ${HORIZON_MIN} min`} />
            <DecisionFact tone={tone} label="Time to Threshold" value={timeToThreshold} />
            <DecisionFact tone={tone} label="Rationale" value="EEG arousal pattern + ECG/PPG sympathetic shift + EMR medication interval" />
          </div>

          <button
            type="button"
            onClick={onApprove}
            disabled={approvalState !== "ready"}
            className={`mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
              approvalState === "done"
                ? "bg-status-stable text-white"
                : approvalState === "loading"
                  ? "bg-brand-panel text-white"
                  : "bg-brand-navy text-white hover:bg-brand-panel"
            }`}
          >
            {approvalState === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {approvalState === "done" && <Check className="h-4 w-4" />}
            {approvalState === "ready" && <Pill className="h-4 w-4" />}
            {approvalState === "done" ? "Administration complete" : approvalState === "loading" ? "Approving order" : "Approve order"}
          </button>
        </div>
      )}
    </section>
  );
}

function DecisionFact({ label, value, tone }) {
  return (
    <div className={`rounded-md border bg-card-surface px-3 py-2 ${tone.border}`}>
      <div className="text-[11px] uppercase tracking-[0.12em] text-text-label">{label}</div>
      <div className="mt-1 text-text-primary">{value}</div>
    </div>
  );
}
