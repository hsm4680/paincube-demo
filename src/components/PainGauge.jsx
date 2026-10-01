import React from "react";
import { BASELINE_WINDOW_H, HORIZON_MIN, SCALE_MAX, THRESHOLD, formatTimeToThreshold } from "../data/phases.js";

// Pain Forecast 카드 — 현재값·예측값을 각각 독립된 원형 게이지로, 세 번째 칸에 Time to Threshold.
// 하나의 호에 두 값을 겹쳐 그리던 방식(실선 + 점선 확장)은 버렸다. 두 값은 대등하다.
// 각 게이지는 자기 값으로 색을 판정한다 — 4.0 이상이면 critical, 미만이면 중성 (PRD 5.4-1).
const CX = 60;
const CY = 60;
const R = 46;

const angleOf = (v) => (-90 + (v / SCALE_MAX) * 360) * (Math.PI / 180);
const polar = (v, r) => [CX + r * Math.cos(angleOf(v)), CY + r * Math.sin(angleOf(v))];
const fmt = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;

const arc = (from, to) => {
  if (Math.abs(to - from) < 0.01) return "";
  const largeArc = Math.abs(to - from) / SCALE_MAX > 0.5 ? 1 : 0;
  return `M${fmt(polar(from, R))} A${R},${R} 0 ${largeArc} ${to > from ? 1 : 0} ${fmt(polar(to, R))}`;
};

export default function PainGauge({ metrics, live }) {
  const noBreach = metrics.timeToThreshold == null;

  return (
    <section className="panel flex h-full flex-col">
      <div className="section-head">Pain forecast</div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-2">
        <div className="grid flex-1 grid-cols-3">
          <Dial value={live ? live.painScore : metrics.painScore} base={metrics.painScore} label="Current Pain Score" />
          <Dial value={live ? live.predicted : metrics.predicted} base={metrics.predicted} label={`Predicted · ${HORIZON_MIN} min`} divided />
          <Figure
            primary={noBreach ? "No breach" : `${metrics.timeToThreshold}`}
            secondary={noBreach ? "predicted" : "min"}
            label="Time to Threshold"
            breach={!noBreach}
            text={noBreach}
          />
        </div>

        {/* baseline은 환자마다 다르다는 것이 데모의 설명 포인트라 Target과 동급으로 둔다 */}
        <div className="mt-1 grid gap-0.5 border-t border-hairline pt-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="forecast-foot-label">Personal baseline</span>
            <span className="forecast-foot-value">{`${BASELINE_WINDOW_H}h adaptive`}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="forecast-foot-label">Target</span>
            <span className="forecast-foot-value">{`Pain Score < ${THRESHOLD.toFixed(1)}`}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// 색 판정은 기준값(base)으로 한다 — 표시값은 흔들려도 색은 깜빡이지 않는다
function Dial({ value, base, label, divided = false }) {
  const breach = base >= THRESHOLD;
  const stroke = breach ? "stroke-status-critical" : "stroke-text-muted";
  const [tickInner, tickOuter] = [polar(THRESHOLD, R - 9), polar(THRESHOLD, R + 9)];

  return (
    <div className={`forecast-cell flex min-w-0 flex-col items-center justify-center gap-2 px-2 ${divided ? "rule-l" : ""}`}>
      <div className="forecast-label text-center">{label}</div>
      <div className="forecast-dial relative aspect-square">
        <svg viewBox="0 0 120 120" role="img" aria-label={`${label} ${value.toFixed(1)} of ${SCALE_MAX}`}>
          <circle cx={CX} cy={CY} r={R} fill="none" className="stroke-hairline" strokeWidth="9" />
          <path d={arc(0, value)} fill="none" className={stroke} strokeWidth="9" />
          {/* 목표 4.0 눈금 */}
          <line
            x1={tickInner[0]}
            y1={tickInner[1]}
            x2={tickOuter[0]}
            y2={tickOuter[1]}
            className="stroke-text-primary"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`forecast-value ${breach ? "text-status-critical" : "text-text-primary"}`}>{value.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

// Time to Threshold는 시각화하지 않는다. 수치만 게이지 숫자와 비슷한 비중으로 둔다.
function Figure({ primary, secondary, label, breach, text = false }) {
  return (
    <div className="forecast-cell rule-l flex min-w-0 flex-col items-center justify-center gap-2 px-2">
      <div className="forecast-label text-center">{label}</div>
      <div className="flex flex-col items-center">
        <span className={`${text ? "forecast-value-text" : "forecast-value"} ${breach ? "text-status-critical" : "text-text-primary"}`}>{primary}</span>
        <span className="forecast-sub">{secondary}</span>
      </div>
    </div>
  );
}
