import React from "react";
import { ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { bedLabel, patientIdLabel } from "../data/patients.js";
import { HORIZON_MIN, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 현재값과 예측값을 같은 크기로 대등하게 놓는다. 정렬 기준이 예측값이므로
// 그 값이 눈에 들어와야 "왜 이 순서인지"가 카드 안에서 설명된다.
// 타이포와 막대는 컨테이너 폭(cqw)에 연동되어 카드가 커지면 함께 커진다.
// 색 판정은 목표값 4.0 하나로만 갈라진다 (PRD 5.4-1).
export default function PatientCard({ patient, painScore, predicted, status, rank, onOpen }) {
  const breach = predicted >= THRESHOLD;
  const summary = `${bedLabel(patient)}, patient ${patientIdLabel(patient)}, Pain Score ${painScore.toFixed(1)} of ${SCALE_MAX}, predicted ${predicted.toFixed(1)} in ${HORIZON_MIN} min, status ${status.label}`;
  const Tag = onOpen ? "button" : "div";

  return (
    <Tag
      type={onOpen ? "button" : undefined}
      onClick={onOpen}
      aria-label={onOpen ? `Open ${summary}` : summary}
      className={`patient-card panel flex h-full w-full flex-col text-left ${breach ? "border-status-critical" : ""} ${
        onOpen ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel" : ""
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 ${breach ? "bg-status-critical text-white" : "bg-brand-navy text-white"}`}
        style={{ minHeight: "var(--section-head-h)" }}
      >
        <span className="text-[11px] font-bold tabular-nums text-white/60">{rank}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{bedLabel(patient)}</span>
        <span className="ml-auto text-[11px] font-medium tabular-nums text-white/65">{patientIdLabel(patient)}</span>
      </div>

      <div className={`flex flex-1 flex-col gap-3 px-4 py-3 ${breach ? "bg-status-critical-tint" : ""}`}>
        <div className="flex items-end justify-between gap-2">
          <Reading label="Now" value={painScore} breach={painScore >= THRESHOLD} />
          <ArrowRight className="card-arrow mb-2 shrink-0" aria-hidden="true" />
          <Reading label={`+${HORIZON_MIN} min`} value={predicted} breach={breach} align="right" />
        </div>

        <ForecastBar painScore={painScore} predicted={predicted} />

        <div className="mt-auto flex justify-end">
          <StatusBadge status={status} />
        </div>
      </div>
    </Tag>
  );
}

function Reading({ label, value, breach, align = "left" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : ""}`}>
      <div className="card-label">{label}</div>
      <div className={`card-value ${breach ? "text-status-critical" : "text-text-primary"}`}>{value.toFixed(1)}</div>
      <div className="card-unit">{`/ ${SCALE_MAX}`}</div>
    </div>
  );
}

// 0부터 현재값까지는 실선, 현재값에서 예측값까지는 빗금 연장 구간.
// 핸들이나 원형 마커를 얹지 않는다 — 빈 트랙 + 채움 + 핸들 조합이 슬라이더로 읽히게 만든다.
function ForecastBar({ painScore, predicted }) {
  const pos = (v) => (v / SCALE_MAX) * 100;
  const breach = predicted >= THRESHOLD;
  const from = Math.min(pos(painScore), pos(predicted));
  const to = Math.max(pos(painScore), pos(predicted));

  return (
    <div aria-hidden="true">
      <div className="card-bar">
        <div className={`bar-fill ${painScore >= THRESHOLD ? "bar-fill-breach" : ""}`} style={{ left: 0, width: `${pos(painScore)}%` }} />
        <div
          className={`bar-extend ${breach ? "bar-extend-breach" : ""}`}
          style={{ left: `${from}%`, width: `${Math.max(to - from, 0.8)}%` }}
        />
        <div className="bar-target" style={{ left: `${pos(THRESHOLD)}%` }} />
      </div>

      <div className="relative mt-2 h-3">
        <span className="card-scale absolute left-0">0</span>
        <span className="card-scale absolute -translate-x-1/2 font-semibold text-text-label" style={{ left: `${pos(THRESHOLD)}%` }}>
          {THRESHOLD.toFixed(1)}
        </span>
        <span className="card-scale absolute right-0">{SCALE_MAX}</span>
      </div>
    </div>
  );
}
