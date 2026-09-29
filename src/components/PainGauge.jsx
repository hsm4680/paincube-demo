import React from "react";
import { STATUS_CLASS } from "./status.js";
import { BASELINE_WINDOW_H, HORIZON_MIN, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 게이지 카드 160px. Predicted / Time to Threshold 줄과 상태 배지는 KPI·상태어와 중복이라 뺐다.
// 링 구조 (PRD 5.5): 현재값은 실선 호, 현재값 끝점에서 예측값까지는 점선 확장 호 + 화살표.
// 두 호를 이어 그린다. v1처럼 같은 반지름에 겹쳐 그려 덮이게 하지 않는다.
const CX = 60;
const CY = 60;
const R = 46;

const angleOf = (v) => (-90 + (v / SCALE_MAX) * 360) * (Math.PI / 180);
const point = (v) => [CX + R * Math.cos(angleOf(v)), CY + R * Math.sin(angleOf(v))];
const fmt = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;

const arc = (from, to) => {
  if (Math.abs(to - from) < 0.01) return "";
  const sweep = to > from ? 1 : 0;
  const largeArc = Math.abs(to - from) / SCALE_MAX > 0.5 ? 1 : 0;
  return `M${fmt(point(from))} A${R},${R} 0 ${largeArc} ${sweep} ${fmt(point(to))}`;
};

// 확장 호 끝의 화살촉 — 진행 방향(접선)을 향한다
const arrowHead = (at, forward) => {
  const a = angleOf(at);
  const tangent = a + (forward ? Math.PI / 2 : -Math.PI / 2);
  const base = [CX + R * Math.cos(a), CY + R * Math.sin(a)];
  const tip = [base[0] + 8 * Math.cos(tangent), base[1] + 8 * Math.sin(tangent)];
  const left = [base[0] + 5 * Math.cos(a), base[1] + 5 * Math.sin(a)];
  const right = [base[0] - 5 * Math.cos(a), base[1] - 5 * Math.sin(a)];
  return `${fmt(tip)} ${fmt(left)} ${fmt(right)}`;
};

export default function PainGauge({ metrics }) {
  const status = STATUS_CLASS[metrics.status.color];
  const breach = metrics.predicted >= THRESHOLD;
  const forecast = STATUS_CLASS[breach ? "status-critical" : "status-stable"];
  const forward = metrics.predicted >= metrics.painScore;
  const quiet = metrics.status.color === "status-stable";

  return (
    <section className="panel flex h-[160px] flex-col">
      <div className="section-head">Pain forecast</div>

      <div className="flex flex-1 items-center gap-4 px-4">
        <div className="relative h-[108px] w-[108px] shrink-0">
          <svg
            viewBox="0 0 120 120"
            role="img"
            aria-label={`Pain Score(CPI) ${metrics.painScore.toFixed(1)} of ${SCALE_MAX}, predicted ${metrics.predicted.toFixed(1)} in ${HORIZON_MIN} min`}
          >
            <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-hairline" strokeWidth="9" />
            <path
              d={arc(0, metrics.painScore)}
              fill="none"
              className={quiet ? "stroke-chart-observed" : status.stroke}
              strokeWidth="9"
            />
            <path
              d={arc(metrics.painScore, metrics.predicted)}
              fill="none"
              className={forecast.stroke}
              strokeWidth="5"
              strokeDasharray="4 4"
            />
            <polygon points={arrowHead(metrics.predicted, forward)} className={`${forecast.stroke} fill-current`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="t-primary">{metrics.painScore.toFixed(1)}</div>
            <div className="t-caption mt-0.5">{`/ ${SCALE_MAX}`}</div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="t-label">Pain Score(CPI)</div>
          <div className="t-value mt-0.5">{metrics.aiStatus}</div>
          <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-hairline pt-2">
            <span className="t-label">Personal baseline</span>
            <span className="t-value">{`${BASELINE_WINDOW_H}h adaptive`}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
