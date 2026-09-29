import React from "react";
import StatusBadge from "./StatusBadge.jsx";
import { bedLabel, patientIdLabel } from "../data/patients.js";
import { HORIZON_MIN, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 틴트·테두리는 예측값이 임계를 넘는 카드에만 적용한다. 전부 칠하면 구분 정보가 사라진다.
export default function PatientCard({ patient, painScore, predicted, status, rank, onOpen }) {
  const breach = predicted >= THRESHOLD;
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
          <span className={`t-primary text-[22px] ${breach ? "text-status-critical" : "text-text-label"}`}>{predicted.toFixed(1)}</span>
        </div>
      </div>
    </Tag>
  );
}

// 0–10 눈금자. 채움(progress) 대신 축선과 눈금만 쓴다 — 슬라이더가 아니라 계측기로 읽히게.
// 색 판정은 임계 5.0 하나로만 갈라진다. 현재값을 그리는 요소는 현재값으로,
// 예측값을 그리는 요소는 예측값으로 판정한다. 임계 근접은 눈금 위의 위치가 이미 말한다.
const MIN_MARKER_GAP = 4; // %, 두 마커가 한 덩어리로 보이지 않게 하는 최소 간격

function ThresholdBar({ painScore, predicted }) {
  const currentBreach = painScore >= THRESHOLD;
  const forecastBreach = predicted >= THRESHOLD;
  const pos = (v) => (v / SCALE_MAX) * 100;
  const currentAt = pos(painScore);
  // 값이 가까울 때만 예측 마커를 살짝 밀어 두 점 인코딩을 유지한다. 정확한 값은 카드 하단에 있다.
  const rawGap = pos(predicted) - currentAt;
  const forecastAt =
    Math.abs(rawGap) >= MIN_MARKER_GAP ? pos(predicted) : currentAt + MIN_MARKER_GAP * (rawGap < 0 ? -1 : 1);
  const from = Math.min(currentAt, forecastAt);
  const to = Math.max(currentAt, forecastAt);

  return (
    <div aria-hidden="true">
      <div className="relative h-3">
        {/* 축선 */}
        <div className="axis-rule absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" />

        {/* 양 끝단 */}
        <div className="axis-cap absolute left-0 top-1/2 h-[9px] w-[1.5px] -translate-y-1/2" />
        <div className="axis-cap absolute right-0 top-1/2 h-[9px] w-[1.5px] -translate-y-1/2" />

        {/* 임계 5.0 눈금 — 축선보다 길고 진하다 */}
        <div className="absolute top-1/2 h-[11px] w-px -translate-x-1/2 -translate-y-1/2 bg-text-label" style={{ left: `${pos(THRESHOLD)}%` }} />

        {/* 현재값 → 예측값 */}
        <div
          className={`absolute top-1/2 h-0 -translate-y-1/2 border-t border-dashed ${forecastBreach ? "border-status-critical" : "border-text-muted"}`}
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />

        <div
          className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 border bg-card-surface ${
            forecastBreach ? "border-status-critical" : "border-text-muted"
          }`}
          style={{ left: `${forecastAt}%` }}
        />

        <div
          className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
            currentBreach ? "bg-status-critical" : "bg-text-muted"
          }`}
          style={{ left: `${currentAt}%` }}
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
