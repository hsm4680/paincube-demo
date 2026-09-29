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
          <span className={`t-primary text-[22px] ${forecastTone ? forecastTone.text : "text-text-label"}`}>{predicted.toFixed(1)}</span>
        </div>
      </div>
    </Tag>
  );
}

// 0–10 눈금자. 채움(progress) 대신 축선과 눈금만 쓴다 — 슬라이더가 아니라 계측기로 읽히게.
// 현재값은 채운 점, 예측값은 빈 마름모, 둘 사이는 점선.
function ThresholdBar({ painScore, predicted }) {
  const currentTone =
    painScore >= THRESHOLD
      ? STATUS_CLASS["status-critical"]
      : painScore >= NEAR_THRESHOLD
        ? STATUS_CLASS["status-caution"]
        : STATUS_CLASS["status-stable"];
  const breach = predicted >= THRESHOLD;
  const pos = (v) => (v / SCALE_MAX) * 100;
  const from = Math.min(pos(painScore), pos(predicted));
  const to = Math.max(pos(painScore), pos(predicted));

  return (
    <div aria-hidden="true">
      <div className="relative h-3">
        {/* 축선 */}
        <div className="axis-rule absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" />

        {/* 양 끝단 */}
        <div className="axis-cap absolute left-0 top-1/2 h-[5px] w-px -translate-y-1/2" />
        <div className="axis-cap absolute right-0 top-1/2 h-[5px] w-px -translate-y-1/2" />

        {/* 임계 5.0 눈금 — 축선보다 길고 진하다 */}
        <div className="absolute top-1/2 h-[11px] w-px -translate-x-1/2 -translate-y-1/2 bg-text-label" style={{ left: `${pos(THRESHOLD)}%` }} />

        {/* 현재값 → 예측값 */}
        <div
          className={`absolute top-1/2 h-0 -translate-y-1/2 border-t border-dashed ${breach ? "border-status-critical" : "border-text-muted"}`}
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />

        <div
          className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-card-surface ${
            breach ? "border-status-critical" : "border-text-muted"
          }`}
          style={{ left: `${pos(predicted)}%` }}
        />

        <div
          className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full ${currentTone.bg}`}
          style={{ left: `${pos(painScore)}%` }}
        />
      </div>

      <div className="relative mt-1 h-3">
        <span className="t-caption absolute left-0">0</span>
        <span className="t-caption absolute -translate-x-1/2 font-semibold text-text-label" style={{ left: `${pos(THRESHOLD)}%` }}>
          {THRESHOLD.toFixed(1)}
        </span>
        <span className="t-caption absolute right-0">{SCALE_MAX}</span>
      </div>
    </div>
  );
}
