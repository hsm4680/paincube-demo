import React from "react";
import { ArrowLeft, BrainCircuit, Circle, Play, RefreshCw } from "lucide-react";
import paincubeLogo from "../assets/paincube-logo.png";
import { WARD, bedLabel, contextLine, patientIdLabel, profileLabel } from "../data/patients.js";

// patient가 없으면 Ward Dashboard 헤더, 있으면 Patient Detail 헤더다. 높이 84px (PRD 5.1 예산).
export default function Header({ patient, onStart, onReset, onBack, demoRunning }) {
  return (
    <header className="flex h-[84px] items-center gap-4 rounded-lg border border-hairline bg-card-surface px-4 shadow-sm">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-hairline px-3 text-sm font-semibold text-text-label transition hover:border-brand-light hover:text-brand-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          <ArrowLeft className="h-4 w-4" />
          Ward
        </button>
      )}

      <img src={paincubeLogo} alt="PainCube" className="h-11 w-auto shrink-0" />

      {patient ? (
        <div className="flex min-w-0 items-center gap-3 border-l border-hairline pl-4">
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-brand-navy">
              {`${patientIdLabel(patient)} · ${profileLabel(patient)} · ${bedLabel(patient)}`}
            </div>
            <div className="truncate text-sm text-text-label">{contextLine(patient)}</div>
          </div>
          <NrsBadge />
        </div>
      ) : (
        <div className="min-w-0 border-l border-hairline pl-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-brand-panel">
            <BrainCircuit className="h-4 w-4 text-brand-light" />
            Predictive Pain AI
          </div>
          <h1 className="mt-1 truncate text-xl font-bold text-brand-navy">{`${WARD.name} · ${WARD.beds} beds`}</h1>
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-panel px-4 text-sm font-semibold text-white transition hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
        >
          <Play className="h-4 w-4" />
          Demo Start
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset demo"
          title="Reset demo"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-hairline bg-card-surface text-text-label transition hover:border-brand-light hover:text-brand-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel"
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
