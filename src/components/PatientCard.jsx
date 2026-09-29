import React from "react";
import { ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { STATUS_CLASS } from "./status.js";
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
      className={`flex h-full w-full flex-col justify-between rounded-lg border-2 px-5 py-4 text-left shadow-sm ${
        breach ? "border-status-critical bg-status-critical-tint" : "border-hairline bg-card-surface"
      } ${onOpen ? "cursor-pointer transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums text-text-label">{rank}</span>
          <span className="text-sm font-bold uppercase tracking-[0.06em] text-brand-navy">{bedLabel(patient)}</span>
        </span>
        <span className="text-sm font-semibold tabular-nums text-text-label">{patientIdLabel(patient)}</span>
      </div>

      <div className="flex items-baseline justify-center gap-1.5">
        <span className="text-5xl font-bold tabular-nums text-text-primary">{painScore.toFixed(1)}</span>
        <span className="text-base font-semibold text-text-label">{`/ ${SCALE_MAX}`}</span>
      </div>

      <ThresholdBar painScore={painScore} predicted={predicted} />

      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${STATUS_CLASS[breach ? "status-critical" : "status-stable"].text}`}>
          <ArrowRight className="h-4 w-4" />
          {`${predicted.toFixed(1)} in ${HORIZON_MIN} min`}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>
    </Tag>
  );
}

// 0–10 척도 위에서 현재값(채운 점) → 예측값(빈 마름모)을 함께 보여준다.
// 정렬 기준이 예측값이므로, 막대에도 예측값이 있어야 순서와 그림이 어긋나지 않는다.
function ThresholdBar({ painScore, predicted }) {
  const currentTone = STATUS_CLASS[painScore >= THRESHOLD ? "status-critical" : "status-stable"];
  const forecastTone = STATUS_CLASS[predicted >= THRESHOLD ? "status-critical" : "status-stable"];
  const pos = (v) => (v / SCALE_MAX) * 100;
  const from = Math.min(pos(painScore), pos(predicted));
  const to = Math.max(pos(painScore), pos(predicted));

  return (
    <div aria-hidden="true">
      <div className="relative h-2 w-full rounded-full bg-hairline">
        {/* 현재값까지 채운 구간 */}
        <div className={`absolute inset-y-0 left-0 rounded-full ${currentTone.bg}`} style={{ width: `${pos(painScore)}%` }} />

        {/* 현재값 → 예측값 구간: 점선 */}
        <div
          className={`absolute top-1/2 h-0 -translate-y-1/2 border-t-2 border-dashed ${forecastTone.border}`}
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />

        {/* 임계 5.0 눈금 */}
        <div className="absolute -top-1.5 bottom-[-6px] w-0.5 -translate-x-1/2 bg-text-label" style={{ left: `${pos(THRESHOLD)}%` }} />

        {/* 예측값: 빈 마름모 */}
        <div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 bg-card-surface ${forecastTone.border}`}
          style={{ left: `${pos(predicted)}%` }}
        />

        {/* 현재값: 채운 점 */}
        <div
          className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${currentTone.bg}`}
          style={{ left: `${pos(painScore)}%` }}
        />
      </div>

      <div className="relative mt-2 h-3">
        <span className="absolute left-0 text-[10px] tabular-nums text-text-muted">0</span>
        <span className="absolute -translate-x-1/2 text-[10px] font-semibold tabular-nums text-text-label" style={{ left: `${pos(THRESHOLD)}%` }}>
          {THRESHOLD.toFixed(1)}
        </span>
        <span className="absolute right-0 text-[10px] tabular-nums text-text-muted">{SCALE_MAX}</span>
      </div>
    </div>
  );
}
