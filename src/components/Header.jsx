import React from "react";
import { ArrowLeft, Circle, Play, RefreshCw } from "lucide-react";
import paincubeLogo from "../assets/paincube-logo.png";
import { WARD, bedLabel, contextLine, patientIdLabel, profileLabel } from "../data/patients.js";
import { HORIZON_MIN } from "../data/phases.js";

// patient가 없으면 Ward Dashboard 헤더, 있으면 Patient Detail 헤더다. 높이 84px (PRD 5.1 예산).
export default function Header({ patient, onStart, onReset, onBack, demoRunning }) {
  return (
    <header className="flex h-[84px] items-center gap-4 surface px-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 shrink-0 items-center gap-2 inset rounded-[var(--radius-control)] px-3 text-sm font-semibold text-text-label transition hover:text-brand-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          <ArrowLeft className="h-4 w-4" />
          Ward
        </button>
      )}

      <img src={paincubeLogo} alt="PainCube" className="h-11 w-auto shrink-0" />

      {patient ? (
        <div className="flex min-w-0 items-center gap-3 border-l border-hairline pl-4">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold tracking-[-0.01em] text-brand-navy">
              {`${patientIdLabel(patient)} · ${profileLabel(patient)} · ${bedLabel(patient)}`}
            </div>
            <div className="mt-0.5 truncate text-[13px] text-text-label">{contextLine(patient)}</div>
          </div>
          {patient.selfReport === false && <NrsBadge />}
        </div>
      ) : (
        <div className="min-w-0 border-l border-hairline pl-4">
          <h1 className="truncate text-xl font-semibold tracking-[-0.01em] text-brand-navy">{`${WARD.name} \u00b7 ${WARD.beds} beds`}</h1>
        </div>
      )}

      {!patient && (
        <span className="ml-auto hidden text-xs font-medium text-text-label lg:inline">
          {`sorted by predicted Pain Score (${HORIZON_MIN} min)`}
        </span>
      )}

      <div className={`flex shrink-0 items-center gap-2 ${patient ? "ml-auto" : "ml-4"}`}>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] bg-brand-panel px-4 text-sm font-semibold text-white transition hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          <Play className="h-4 w-4" />
          Demo Start
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset demo"
          title="Reset demo"
          className="inset inline-flex h-10 w-10 items-center justify-center text-text-label transition hover:text-brand-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          <RefreshCw className={`h-4 w-4 ${demoRunning ? "animate-spin-slow" : ""}`} />
        </button>
      </div>
    </header>
  );
}

// 자가보고 불가는 이 환자의 상시 조건이다. 꺼진 LED(빈 원) + 회색, 애니메이션·토글 없음 (PRD 5.7).
function NrsBadge() {
  return (
    <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline bg-page-bg px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-status-nodata lg:inline-flex">
      <Circle className="h-3 w-3" strokeWidth={2} />
      NRS unavailable
    </span>
  );
}
