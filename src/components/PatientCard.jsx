import React from "react";
import StatusBadge from "./StatusBadge.jsx";
import { STATUS_CLASS } from "./status.js";
import { bedLabel, patientIdLabel } from "../data/patients.js";
import { HORIZON_MIN, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 임계 근접 기준 — 이 아래로는 상태색을 쓰지 않는다. 빨강이 떴을 때만 눈에 띄게 하기 위해서다.
const NEAR_THRESHOLD = 4.0;

// 틴트·테두리는 예측값이 임계를 넘는 카드에만 적용한다. 전부 칠하면 구분 정보가 사라진다.
export default function PatientCard({ patient, painScore, predicted, status, rank, onOpen }) {
  const breach = predicted >= THRESHOLD;
  const near = !breach && Math.max(painScore, predicted) >= NEAR_THRESHOLD;
  const forecastTone = breach ? STATUS_CLASS["status-critical"] : near ? STATUS_CLASS["status-caution"] : null;
  const summary = `${bedLabel(patient)}, patient ${patientIdLabel(patient)}, Pain Score ${painScore.toFixed(1)} of ${SCALE_MAX}, predicted ${predicted.toFixed(1)} in ${HORIZON_MIN} min, status ${status.label}`;
  const Tag = onOpen ? "button" : "div";

  return (
    <Tag
      type={onOpen ? "button" : undefined}
      onClick={onOpen}
      aria-label={onOpen ? `Open ${summary}` : summary}
      className={`panel flex h-full w-full flex-col text-left ${breach ? "border-status-critical" : ""} ${
        onOpen ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel" : ""
      }`}
    >
      <div className={`flex items-center gap-2 px-3 ${breach ? "bg-status-critical text-white" : "bg-brand-navy text-white"}`} style={{ height: "var(--section-head-h)" }}>
        <span className="text-[11px] font-bold tabular-nums text-white/60">{rank}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{bedLabel(patient)}</span>
        <span className="ml-auto text-[11px] font-medium tabular-nums text-white/65">{patientIdLabel(patient)}</span>
      </div>

      <div className={`flex flex-1 flex-col justify-between gap-2 px-4 py-3 ${breach ? "bg-status-critical-tint" : ""}`}>
        <div className="flex items-end justify-between gap-3">
          <span className="flex items-baseline gap-1.5">
            <span className="t-hero">{painScore.toFixed(1)}</span>
            <span className="t-unit">{`/ ${SCALE_MAX}`}</span>
          </span>
          <StatusBadge status={status} quiet />
        </div>

        <ThresholdBar painScore={painScore} predicted={predicted} />

        <div className="flex items-baseline justify-between gap-2 border-t border-hairline pt-1.5">
          <span className="t-label">{`Predicted · ${HORIZON_MIN} min`}</span>
          <span className={`t-primary text-[22px] ${forecastTone ? forecastTone.text : ""}`}>{predicted.toFixed(1)}</span>
        </div>
      </div>
    </Tag>
  );
}

// 0–10 척도 위에서 현재값(채운 점) → 예측값(빈 마름모). 읽기 전용 계측이므로
// 슬라이더처럼 보이지 않게 트랙을 얇게 두고 손잡이 장식을 쓰지 않는다.
function ThresholdBar({ painScore, predicted }) {
  const currentTone = painScore >= THRESHOLD ? STATUS_CLASS["status-critical"] : STATUS_CLASS["status-stable"];
  const forecastTone = predicted >= THRESHOLD ? STATUS_CLASS["status-critical"] : STATUS_CLASS["status-stable"];
  const pos = (v) => (v / SCALE_MAX) * 100;
  const from = Math.min(pos(painScore), pos(predicted));
  const to = Math.max(pos(painScore), pos(predicted));

  return (
    <div aria-hidden="true">
      <div className="relative h-[3px] w-full bg-hairline">
        <div className={`absolute inset-y-0 left-0 ${currentTone.bg}`} style={{ width: `${pos(painScore)}%` }} />
        <div
          className={`absolute top-1/2 h-0 -translate-y-1/2 border-t border-dashed ${forecastTone.border}`}
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />
        <div className="absolute -top-[3px] bottom-[-3px] w-px -translate-x-1/2 bg-text-label" style={{ left: `${pos(THRESHOLD)}%` }} />
        <div
          className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-card-surface ${forecastTone.border}`}
          style={{ left: `${pos(predicted)}%` }}
        />
        <div
          className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 ${currentTone.bg}`}
          style={{ left: `${pos(painScore)}%` }}
        />
      </div>

      <div className="relative mt-1.5 h-3">
        <span className="t-caption absolute left-0">0</span>
        <span className="t-caption absolute -translate-x-1/2 font-semibold text-text-label" style={{ left: `${pos(THRESHOLD)}%` }}>
          {THRESHOLD.toFixed(1)}
        </span>
        <span className="t-caption absolute right-0">{SCALE_MAX}</span>
      </div>
    </div>
  );
}
