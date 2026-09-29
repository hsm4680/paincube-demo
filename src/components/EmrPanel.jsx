import React, { useEffect, useState } from "react";
import { Database } from "lucide-react";
import { formatAssessmentAge, lastAnalgesicFor } from "../data/phases.js";

// 안전성 검증에 실제로 쓰인 항목 — recommendation 단계에서 자동 강조된다 (PRD 5.7)
const SAFETY_KEYS = ["lastAnalgesic", "activeMeds", "renal"];

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
    <section className="flex h-24 flex-col surface px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 t-title">
          <Database className="h-3.5 w-3.5 text-brand-light" />
          EMR context — inputs to prediction and safety check
        </div>
        <span className="inset hidden whitespace-nowrap px-2 py-0.5 t-caption lg:inline">
          HL7 FHIR R4 · Epic / Cerner compatible
        </span>
      </div>

      <div className="mt-1.5 grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <EmrFact
            key={item.key}
            {...item}
            highlighted={(safetyActive && SAFETY_KEYS.includes(item.key)) || (justWritten && item.key === "lastAnalgesic")}
          />
        ))}
      </div>
    </section>
  );
}

function EmrFact({ label, value, role, highlighted }) {
  return (
    <div
      className={`emr-cell inset flex min-w-0 flex-col px-2.5 py-1.5 ${
        highlighted ? "bg-status-caution-tint ring-1 ring-status-caution" : ""
      }`}
    >
      <div className="t-label truncate">{label}</div>
      <div className="line-clamp-2 text-[12px] font-semibold leading-tight text-text-primary" title={value}>
        {value}
      </div>
      <div className="t-caption mt-auto truncate">{role}</div>
    </div>
  );
}
