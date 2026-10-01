import React from "react";
import { STATUS_CLASS, STATUS_ICON } from "./status.js";
import { bedLabel, patientIdLabel, profileLabel } from "../data/patients.js";
import { HORIZON_MIN, SCALE_MAX, THRESHOLD } from "../data/phases.js";

// 현재값과 예측값을 한 줄 막대에 겹쳐 담으면 읽히지 않는다. 두 줄로 나눠
// 같은 트랙 위에 놓으면 길이 차이로 바로 비교된다.
// 타이포·막대·chip은 컨테이너 폭(cqw)에 연동되어 카드가 커지면 함께 커진다.
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

      <div className={`flex flex-1 flex-col justify-between gap-3 px-4 py-3 ${breach ? "bg-status-critical-tint" : ""}`}>
        <div className="card-context truncate">{`${profileLabel(patient)} · ${patient.procedure}`}</div>

        <div className="flex items-end justify-between gap-3">
          <span className="flex items-baseline gap-1.5">
            <span className={`card-value ${painScore >= THRESHOLD ? "text-status-critical" : "text-text-primary"}`}>
              {painScore.toFixed(1)}
            </span>
            <span className="card-unit">{`/ ${SCALE_MAX}`}</span>
          </span>
          <CardStatusChip status={status} />
        </div>

        <DualBar painScore={painScore} predicted={predicted} />

        <div className="flex items-baseline justify-between gap-3 border-t border-hairline pt-2">
          <span className="card-label">{`Predicted · ${HORIZON_MIN} min`}</span>
          <span className={`card-forecast ${breach ? "text-status-critical" : "text-text-primary"}`}>{predicted.toFixed(1)}</span>
        </div>
      </div>
    </Tag>
  );
}

// 카드 안에서는 상태를 더 크게 보여준다. 색 규칙은 공통이다 (ACTION REQUIRED만 색).
function CardStatusChip({ status }) {
  const tone = STATUS_CLASS[status.color];
  const Icon = STATUS_ICON[status.label];
  return (
    <span className={`card-chip shrink-0 ${tone.tint} ${tone.text}`}>
      <Icon className="card-chip-icon" />
      {status.label}
    </span>
  );
}

// 두 막대는 같은 트랙과 같은 축을 공유한다. 눈금과 목표선은 아래에 한 번만 그린다.
// 핸들이나 원형 마커는 얹지 않는다 — 그 조합이 슬라이더로 읽히게 만든다.
function DualBar({ painScore, predicted }) {
  const pos = (v) => `${(v / SCALE_MAX) * 100}%`;

  return (
    <div aria-hidden="true">
      {/* 목표선은 각 막대에서 위아래로 3px씩 튀어나와 두 줄을 가로지르는 한 선으로 읽힌다 */}
      <div className="flex flex-col gap-[clamp(5px,1.8cqh,12px)]">
        <BarRow label="Now" value={painScore} />
        <BarRow label={`+${HORIZON_MIN}m`} value={predicted} />
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <span className="bar-row-label shrink-0" aria-hidden="true" />
        <div className="relative h-3 flex-1">
          <span className="card-scale absolute left-0">0</span>
          <span className="card-scale absolute -translate-x-1/2 font-semibold text-text-label" style={{ left: pos(THRESHOLD) }}>
            {THRESHOLD.toFixed(1)}
          </span>
          <span className="card-scale absolute right-0">{SCALE_MAX}</span>
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, value }) {
  const breach = value >= THRESHOLD;
  return (
    <div className="flex items-center gap-2">
      <span className="bar-row-label shrink-0">{label}</span>
      <div className="card-bar flex-1">
        <div className={`bar-fill ${breach ? "bar-fill-breach" : ""}`} style={{ width: `${(value / SCALE_MAX) * 100}%` }} />
        <div className="bar-target" style={{ left: `${(THRESHOLD / SCALE_MAX) * 100}%` }} />
      </div>
    </div>
  );
}
