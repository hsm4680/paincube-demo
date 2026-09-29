// ICU Ward A 6개 병상 — PRD 4.4. 합성 데이터.
// Bed 03(주인공)의 현재값·예측값은 phases.js 단계 데이터를 따른다. 여기 값은 idle 기준.

export const WARD = { name: "ICU Ward A", beds: 6 };

export const HERO_BED = "03";

export const PATIENTS = [
  { bed: "01", id: 1452, sex: "F", age: 58, procedure: "Mitral valve repair, POD 2", painScore: 2.1, predicted: 2.3 },
  { bed: "02", id: 1455, sex: "M", age: 64, procedure: "VATS lobectomy, POD 1", painScore: 3.0, predicted: 2.8 },
  { bed: "03", id: 1468, sex: "M", age: 69, procedure: "CABG, POD 0", airway: "Intubated", rass: -4, painScore: 1.4, predicted: 1.5 },
  { bed: "04", id: 1471, sex: "F", age: 41, procedure: "Craniotomy, tumor resection, POD 0", painScore: 4.2, predicted: 4.4 },
  { bed: "05", id: 1473, sex: "M", age: 55, procedure: "Aneurysm clipping (SAH), POD 1", painScore: 2.6, predicted: 2.9 },
  { bed: "06", id: 1477, sex: "F", age: 47, procedure: "Posterior lumbar fusion, POD 1", painScore: 4.6, predicted: 4.3 }
];

// 나머지 5명 현재값 변동폭 (PRD 4.6). 예측값은 고정한다.
export const PAIN_JITTER = 0.3;

export const bedLabel = (p) => `ICU Bed ${p.bed}`;
export const patientIdLabel = (p) => `#${p.id}`;
export const profileLabel = (p) => `${p.sex} / ${p.age}`;

// 환자 헤더 2번째 줄 — "CABG · POD 0 · Intubated, RASS −4"
const rassLabel = (rass) => `RASS ${rass < 0 ? "\u2212" : ""}${Math.abs(rass)}`;
export const contextLine = (p) =>
  [p.procedure.replace(", ", " \u00b7 "), p.airway && `${p.airway}, ${rassLabel(p.rass)}`].filter(Boolean).join(" \u00b7 ");
