import React from "react";
import { ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { STATUS_CLASS } from "./status.js";
import { bedLabel, patientIdLabel } from "../data/patients.js";
import { HORIZON_MIN, SCALE_MAX } from "../data/phases.js";

// 카드 테두리·배경은 상태 계층을 따른다 (PRD 4.2). 수치는 전부 props로 받는다.
// onOpen이 없는 카드는 상세 데이터가 없는 병상이다. 클릭 대상으로 보이지 않게 둔다.
export default function PatientCard({ patient, painScore, predicted, status, onOpen }) {
  const tone = STATUS_CLASS[status.color];
  const summary = `${bedLabel(patient)}, patient ${patientIdLabel(patient)}, Pain Score ${painScore.toFixed(1)} of ${SCALE_MAX}, predicted ${predicted.toFixed(1)} in ${HORIZON_MIN} min, status ${status.label}`;
  const Tag = onOpen ? "button" : "div";

  return (
    <Tag
      type={onOpen ? "button" : undefined}
      onClick={onOpen}
      aria-label={onOpen ? `Open ${summary}` : summary}
      className={`flex h-full w-full flex-col justify-between rounded-lg border-2 p-6 text-left shadow-sm ${tone.border} ${tone.tint} ${onOpen ? "cursor-pointer transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-panel" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-bold uppercase tracking-[0.06em] text-brand-navy">{bedLabel(patient)}</span>
        <span className="text-sm font-semibold tabular-nums text-text-label">{patientIdLabel(patient)}</span>
      </div>

      <div className="flex items-baseline justify-center gap-1.5 py-2">
        <span className="text-5xl font-bold tabular-nums text-text-primary">{painScore.toFixed(1)}</span>
        <span className="text-base font-semibold text-text-label">{`/ ${SCALE_MAX}`}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${tone.text}`}>
          <ArrowRight className="h-4 w-4" />
          {`${predicted.toFixed(1)} in ${HORIZON_MIN} min`}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>
    </Tag>
  );
}
