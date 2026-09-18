import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LineChart } from "lucide-react";
import { STATUS_CLASS } from "./status.js";
import { HORIZON_MIN, PHASES, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 추세·예측 그래프 — PRD 5.3
// 시간 압축: 실제 1초 = 차트 1분. 시작 시 과거 60분이 이미 채워져 있다.

const PAST_MIN = 60;
const TICK_MS = 1000; // 실제 1초
const X_TICKS = [-60, -45, -30, -15, 0, 15];
const Y_TICKS = [0, 2, 4, 6, 8, 10];
const PLOT_H = 232;
const M = { top: 14, right: 52, bottom: 30, left: 40 };

const clamp = (v) => Math.min(SCALE_MAX, Math.max(0, v));
// 결정적 잡음 — 리셋할 때마다 같은 과거 곡선이 나온다
const jitter = (m) => 0.07 * Math.sin(m * 1.73) + 0.04 * Math.sin(m * 0.41 + 1.2);

// 한 차트-분 진행: 현재 단계 Pain Score로 수렴 (warning 진입 시점부터 상승이 시작된다)
const stepToward = (v, target, m) => clamp(v + (target - v) * 0.45 + jitter(m) * 0.6);

const seedHistory = () => {
  const base = PHASES.idle.painScore; // 개인 기준선 근처에서 평탄
  return Array.from({ length: PAST_MIN + 1 }, (_, i) => clamp(base + jitter(i - PAST_MIN)));
};

const initTrend = (target) => {
  const history = seedHistory();
  return { minute: 0, history, next: stepToward(history[history.length - 1], target, 1), tickAt: performance.now() };
};

// App 수준에서 소유 — 화면 전환으로 차트가 재마운트돼도 이력이 유지된다
export function usePainTrend(target, resetKey) {
  const targetRef = useRef(target);
  targetRef.current = target;
  const [trend, setTrend] = useState(() => initTrend(target));

  useEffect(() => {
    setTrend(initTrend(targetRef.current));
    const id = setInterval(() => {
      setTrend((s) => {
        const minute = s.minute + 1;
        const history = [...s.history, s.next].slice(-(PAST_MIN + 2));
        return { minute, history, next: stepToward(s.next, targetRef.current, minute + 1), tickAt: performance.now() };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [resetKey]);

  return trend;
}

// 예측 곡선: f(0)=현재값, f(15)=예측값. Time to Threshold가 있으면 그 시점에 정확히 5.0을 지나도록 곡률을 맞춘다.
const forecastCurve = (v0, predicted, timeToThreshold) => {
  let k = 1.6;
  if (timeToThreshold != null && predicted > THRESHOLD && v0 < THRESHOLD) {
    const r = (THRESHOLD - v0) / (predicted - v0);
    const k2 = Math.log(r) / Math.log(timeToThreshold / HORIZON_MIN);
    if (Number.isFinite(k2) && k2 > 0.3 && k2 < 4) k = k2;
  }
  return (tau) => v0 + (predicted - v0) * Math.pow(tau / HORIZON_MIN, k);
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
};

export default function TrendChart({ trend, metrics }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [frac, setFrac] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // 1초 틱 사이를 보간해 좌측으로 부드럽게 흐르게 한다 (모션 축소 설정 시 틱 단위로만 이동)
  useEffect(() => {
    if (reducedMotion) {
      setFrac(0);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      setFrac(Math.min(1, Math.max(0, (performance.now() - trend.tickAt) / TICK_MS)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [trend.tickAt, reducedMotion]);

  const breach = metrics.predicted >= THRESHOLD;
  const forecastTone = STATUS_CLASS[breach ? "status-critical" : "status-stable"];

  const H = M.top + PLOT_H + M.bottom;
  const plotW = Math.max(0, width - M.left - M.right);
  const ppm = plotW / (PAST_MIN + HORIZON_MIN); // px per chart-minute
  const xNow = M.left + PAST_MIN * ppm;
  const x = (rel) => xNow + rel * ppm; // rel: Now 기준 상대 분
  const y = (v) => M.top + (1 - v / SCALE_MAX) * PLOT_H;

  const { history, next, minute } = trend;
  const last = history[history.length - 1];
  const head = last + (next - last) * frac; // Now 시점의 값
  const nowMinute = minute + frac;

  const observed = history.map((v, i) => {
    const m = minute - (history.length - 1 - i);
    return [x(m - nowMinute), y(v)];
  });
  observed.push([xNow, y(head)]);
  const observedPath = observed.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");

  const f = forecastCurve(head, metrics.predicted, metrics.timeToThreshold);
  const forecastPts = [];
  for (let t = 0; t <= HORIZON_MIN; t += 0.5) forecastPts.push([x(t), y(clamp(f(t)))]);
  const forecastPath = forecastPts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
  const [endX, endY] = forecastPts[forecastPts.length - 1];

  const ariaLabel = `Pain Score(CPI) trend, past ${PAST_MIN} min and ${HORIZON_MIN} min forecast. Current ${metrics.painScore.toFixed(1)} / ${SCALE_MAX}, predicted ${metrics.predicted.toFixed(1)} in ${HORIZON_MIN} min.`;

  return (
    <section className="rounded-lg border border-hairline bg-card-surface px-5 pb-3 pt-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-panel">
        <LineChart className="h-4 w-4 text-brand-light" />
        Pain Score(CPI) Trend &amp; Forecast
      </div>

      <div ref={wrapRef} className="mt-2 w-full">
        {width > 0 && (
          <svg width={width} height={H} role="img" aria-label={ariaLabel} className="block">
            <defs>
              <clipPath id="trend-plot">
                <rect x={M.left} y={0} width={plotW} height={H} />
              </clipPath>
            </defs>

            {/* 예측 구간 배경 — 구조 표시용 */}
            <rect x={xNow} y={M.top} width={HORIZON_MIN * ppm} height={PLOT_H} className="fill-page-bg" />

            {Y_TICKS.map((v) => (
              <g key={`y${v}`}>
                <line x1={M.left} x2={M.left + plotW} y1={y(v)} y2={y(v)} className="stroke-chart-grid" strokeWidth="1" />
                <text x={M.left - 10} y={y(v)} dy="0.35em" textAnchor="end" className="fill-text-label text-[12px] tabular-nums">
                  {v}
                </text>
              </g>
            ))}

            {X_TICKS.map((t) => (
              <g key={`x${t}`}>
                {t !== 0 && <line x1={x(t)} x2={x(t)} y1={M.top} y2={M.top + PLOT_H} className="stroke-chart-grid" strokeWidth="1" />}
                <text
                  x={x(t)}
                  y={M.top + PLOT_H + 20}
                  textAnchor={t === -PAST_MIN ? "start" : t === HORIZON_MIN ? "end" : "middle"}
                  className={`text-[12px] tabular-nums ${t === 0 ? "fill-text-primary font-semibold" : "fill-text-label"}`}
                >
                  {t === 0 ? "Now" : `${t > 0 ? "+" : "−"}${Math.abs(t)} min`}
                </text>
              </g>
            ))}

            <g clipPath="url(#trend-plot)">
              <path d={observedPath} fill="none" className="stroke-chart-observed" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </g>

            <line x1={xNow} x2={xNow} y1={M.top} y2={M.top + PLOT_H} className="stroke-chart-now" strokeWidth="1.5" />

            <path d={forecastPath} fill="none" className={forecastTone.stroke} strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" />

            <circle cx={xNow} cy={y(head)} r="5" className="fill-chart-observed stroke-white" strokeWidth="2" />
            <circle cx={endX} cy={endY} r="5" className={`fill-white ${forecastTone.stroke}`} strokeWidth="2.5" />
            <text x={endX + 9} y={endY} dy="0.35em" className={`text-[15px] font-bold tabular-nums ${breach ? "fill-status-critical" : "fill-status-stable"}`}>
              {metrics.predicted.toFixed(1)}
            </text>
          </svg>
        )}
      </div>
    </section>
  );
}
