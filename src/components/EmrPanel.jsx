import React, { useEffect, useState } from "react";
import { formatAssessmentAge, lastAnalgesicFor } from "../data/phases.js";

// 안전성 검증에 실제로 참조된 항목 — recommendation 단계에서 자동 표시된다 (PRD 5.7).
// 이상치가 아니라 계산 입력이므로 상태색을 쓰지 않는다.
const SAFETY_KEYS = ["lastAnalgesic", "activeMeds", "renal"];

// 박스 6개가 아니라 표다 (Ref_05). 라벨 행은 네이비, 셀 구분은 세로선만.
// 열 폭은 값 길이에 맞춘다 — Active medication이 넘치지 않는다.
const COLUMNS = "1fr 1fr 1.25fr 1.7fr 1.3fr 0.7fr";

export default function EmrPanel({ phase, metrics, dose }) {
  const [justWritten, setJustWritten] = useState(false);

  // 승인 직후 Last analgesic이 바뀌며 1.5초간 강조된다 — 권고→승인→EMR 기록의 고리 (PRD 5.7)
  useEffect(() => {
    if (phase !== "administering") return undefined;
    setJustWritten(true);
    const id = setTimeout(() => setJustWritten(false), 1500);
    return () => clearTimeout(id);
  }, [phase]);

  const items = [
    { key: "procedure", label: "Procedure", value: metrics.emr.procedure, role: "prediction context" },
    { key: "painAssessment", label: "Pain assessment", value: formatAssessmentAge(metrics.emr.painAssessment), role: "last nurse observation" },
    { key: "lastAnalgesic", label: "Last analgesic", value: lastAnalgesicFor(phase, dose, metrics.emr.lastAnalgesic), role: "safety check" },
    { key: "activeMeds", label: "Active medication", value: metrics.emr.activeMeds, role: "safety check" },
    { key: "sedation", label: "Sedation", value: metrics.emr.sedation, role: "prediction input" },
    { key: "renal", label: "Renal function", value: metrics.emr.renal, role: "dose adjustment" }
  ];

  const safetyActive = phase === "recommendation";

  return (
    <section className="panel flex min-h-24 shrink-0 flex-col">
      <div className="section-head justify-between">
        <span>EMR context — inputs to prediction and safety check</span>
        <span className="hidden text-[9px] font-medium normal-case tracking-[0.04em] text-white/55 lg:inline">
          HL7 FHIR R4 · Epic / Cerner compatible
        </span>
      </div>

      <div className="emr-grid flex-1" style={{ "--emr-cols": COLUMNS }}>
        {items.map((item, index) => (
          <EmrCell
            key={item.key}
            {...item}
            divided={index > 0}
            highlighted={(safetyActive && SAFETY_KEYS.includes(item.key)) || (justWritten && item.key === "lastAnalgesic")}
          />
        ))}
      </div>
    </section>
  );
}

function EmrCell({ label, value, role, divided, highlighted }) {
  return (
    <div className={`emr-cell flex min-w-0 flex-col ${divided ? "rule-l" : ""}`}>
      <div className="label-band truncate px-2 py-[3px]">{label}</div>
      <div className={`flex min-w-0 flex-1 flex-col justify-center px-2 ${highlighted ? "emr-referenced" : ""}`}>
        <div className="t-value line-clamp-2" title={value}>
          {value}
        </div>
        <div className="t-caption truncate">{role}</div>
      </div>
    </div>
  );
}
