import React from "react";
import { ArrowLeft, Circle, Play, RefreshCw } from "lucide-react";
import paincubeLogo from "../assets/paincube-logo.png";
import { WARD, bedLabel, contextLine, patientIdLabel, profileLabel } from "../data/patients.js";
import { HORIZON_MIN } from "../data/phases.js";

// 상단 바는 네이비 블록이다 — 화면의 구조를 만드는 첫 번째 요소 (Ref_05).
// 로고는 네이비 위에서 읽히지 않으므로 흰 판 위에 얹는다.
// patient가 없으면 Ward Dashboard 헤더, 있으면 Patient Detail 헤더다. 높이 84px (PRD 5.1 예산).
export default function Header({ patient, onStart, onReset, onBack, demoRunning }) {
  return (
    <header className="flex min-h-[84px] flex-col items-stretch overflow-hidden rounded-[var(--radius-card)] bg-brand-navy sm:h-[84px] sm:flex-row">
      <div className="flex shrink-0 items-center justify-center bg-card-surface px-4 py-2 sm:py-0">
        <img src={paincubeLogo} alt="PainCube" className="h-10 w-auto" />
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 px-4 py-2 sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-white/25 px-3 text-[13px] font-semibold text-white/85 transition hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Ward
          </button>
        )}

        {patient ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <div className="truncate text-[17px] font-semibold tracking-[-0.01em] text-white">
                {`${patientIdLabel(patient)} · ${profileLabel(patient)} · ${bedLabel(patient)}`}
              </div>
              <div className="mt-0.5 truncate text-[12px] text-white/70">{contextLine(patient)}</div>
            </div>
            {patient.selfReport === false && <NrsBadge />}
          </div>
        ) : (
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-white">{`${WARD.name} · ${WARD.beds} beds`}</h1>
            <div className="mt-0.5 truncate text-[12px] text-white/70">{`Sorted by predicted Pain Score · ${HORIZON_MIN} min horizon`}</div>
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] bg-white px-4 text-[13px] font-semibold text-brand-navy transition hover:bg-page-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Play className="h-4 w-4" />
            Demo Start
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset demo"
            title="Reset demo"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-white/25 text-white/85 transition hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <RefreshCw className={`h-4 w-4 ${demoRunning ? "animate-spin-slow" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

// 자가보고 불가는 이 환자의 상시 조건이다. 꺼진 LED(빈 원) + 회색, 애니메이션·토글 없음 (PRD 5.7).
function NrsBadge() {
  return (
    <span className="chip hidden shrink-0 border border-white/25 text-white/70 lg:inline-flex">
      <Circle className="h-3 w-3" strokeWidth={2} />
      NRS unavailable
    </span>
  );
}
