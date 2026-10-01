import React from "react";
import { BASELINE_WINDOW_H, HORIZON_MIN, SCALE_MAX, SEVERE, THRESHOLD } from "../data/phases.js";

// Pain Forecast 카드 — 현재값·예측값을 각각 독립된 원형 게이지로, 세 번째 칸에 Time to Threshold.
// 하나의 호에 두 값을 겹쳐 그리던 방식(실선 + 점선 확장)은 버렸다. 두 값은 대등하다.
// 각 게이지는 자기 값으로 독립 판정한다. 색은 임상 NRS 밴드를 따른다 (PRD 5.5-2):
//   0–4 mild → stable / 4–7 moderate → caution / 7–10 severe → critical
// 트랙은 세 밴드의 tint로 분할하고, 값 호와 숫자는 해당 밴드의 solid 색을 쓴다.
// 4.0 tick은 두지 않는다 — 밴드 tint가 경계를 설명 없이 보여준다 (PRD 4.2-1).
// 이 색은 "값의 밴드"를 나타내는 데이터 인코딩이고, 상태 배지의 색 규칙과는 별개 계층이다.
// 판정은 jitter가 적용되지 않은 기준값으로 한다 — 경계에서 색이 깜빡이면 안 된다.
const CX = 60;
const CY = 60;
const R = 46;

const angleOf = (v) => (-90 + (v / SCALE_MAX) * 360) * (Math.PI / 180);
const polar = (v, r) => [CX + r * Math.cos(angleOf(v)), CY + r * Math.sin(angleOf(v))];
const fmt = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;

const BANDS = [
  { from: 0, to: THRESHOLD, arc: "stroke-status-stable", track: "stroke-status-stable-tint", text: "text-status-stable" },
  { from: THRESHOLD, to: SEVERE, arc: "stroke-status-caution", track: "stroke-status-caution-tint", text: "text-status-caution" },
  { from: SEVERE, to: SCALE_MAX, arc: "stroke-status-critical", track: "stroke-status-critical-tint", text: "text-status-critical" }
];

const bandOf = (v) => BANDS.find((b) => v < b.to) ?? BANDS[BANDS.length - 1];

const arc = (from, to) => {
  if (Math.abs(to - from) < 0.01) return "";
  const largeArc = Math.abs(to - from) / SCALE_MAX > 0.5 ? 1 : 0;
  return `M${fmt(polar(from, R))} A${R},${R} 0 ${largeArc} ${to > from ? 1 : 0} ${fmt(polar(to, R))}`;
};

export default function PainGauge({ metrics, live }) {
  const noBreach = metrics.timeToThreshold == null;

  return (
    <section className="panel flex h-full w-full min-h-0 flex-col">
      <div className="section-head">Pain forecast</div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-2 pt-1.5">
        <div className="grid flex-1 grid-cols-3">
          <Dial value={live ? live.painScore : metrics.painScore} base={metrics.painScore} label="Current Pain Score" />
          <Dial value={live ? live.predicted : metrics.predicted} base={metrics.predicted} label={`Predicted · ${HORIZON_MIN} min`} divided />
          <Figure
            primary={noBreach ? "No breach" : `${metrics.timeToThreshold}`}
            secondary={noBreach ? "predicted" : "min"}
            label="Time to Threshold"
            toneClass={noBreach ? "text-text-primary" : bandOf(metrics.predicted).text}
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
  const band = bandOf(base);
  return (
    <div className={`forecast-cell flex min-w-0 flex-col items-center justify-center gap-1.5 px-2 ${divided ? "rule-l" : ""}`}>
      <div className="forecast-label text-center">{label}</div>
      <div className="forecast-dial relative aspect-square">
        <svg viewBox="0 0 120 120" role="img" aria-label={`${label} ${value.toFixed(1)} of ${SCALE_MAX}`}>
          {/* 트랙 — 세 밴드를 각 tint로 분할한다 */}
          {BANDS.map((b) => (
            <path key={b.from} d={arc(b.from, b.to)} fill="none" className={b.track} strokeWidth="12" />
          ))}
          {/* 값 호 — 값이 속한 밴드의 solid 색 */}
          <path d={arc(0, value)} fill="none" className={band.arc} strokeWidth="12" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`forecast-value ${band.text}`}>{value.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

// Time to Threshold는 시각화하지 않는다. 수치만 게이지 숫자와 비슷한 비중으로 둔다.
function Figure({ primary, secondary, label, toneClass, text = false }) {
  return (
    <div className="forecast-cell rule-l flex min-w-0 flex-col items-center justify-center gap-1.5 px-2">
      <div className="forecast-label text-center">{label}</div>
      <div className="flex flex-col items-center">
        <span className={`${text ? "forecast-value-text" : "forecast-value"} ${toneClass}`}>{primary}</span>
        <span className="forecast-sub">{secondary}</span>
      </div>
    </div>
  );
}
