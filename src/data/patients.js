// ICU Ward A 6개 병상 — PRD 4.4. 합성 데이터.
// Bed 03(주인공)의 현재값·예측값은 phases.js 단계 데이터를 따른다. 여기 값은 idle 기준.

export const WARD = { name: "ICU Ward A", beds: 6 };

export const HERO_BED = "03";

// selfReport: false인 환자만 NRS 배지가 붙는다. Bed 03(삽관·RASS −4)이 그 경우다.
// emr / vitals는 상세 화면에서 그대로 쓰인다. Bed 03은 phases.js의 단계 데이터를 따른다.
export const PATIENTS = [
  {
    bed: "01", id: 1452, sex: "F", age: 58, procedure: "Mitral valve repair, POD 2",
    painScore: 2.1, predicted: 2.3, selfReport: true,
    emr: { assessmentAt: "09:05", lastAnalgesic: "Acetaminophen 1g IV, 08:25", activeMeds: "Dobutamine 3 mcg/kg/min, Cefazolin 1g q8h", sedation: "RASS 0 \u00b7 able to self-report", renal: "eGFR 88" },
    vitals: { hr: 78, bp: "128/74", spo2: 98, rr: 16, bis: 92, temp: 36.5 }
  },
  {
    bed: "02", id: 1455, sex: "M", age: 64, procedure: "VATS lobectomy, POD 1",
    painScore: 3.0, predicted: 2.8, selfReport: true,
    emr: { assessmentAt: "08:58", lastAnalgesic: "Hydromorphone 0.2 mg IV, 08:35", activeMeds: "Cefazolin 1g q8h", sedation: "RASS \u22121 \u00b7 able to self-report", renal: "eGFR 92" },
    vitals: { hr: 84, bp: "134/80", spo2: 96, rr: 18, bis: 89, temp: 36.8 }
  },
  {
    bed: "03", id: 1468, sex: "M", age: 69, procedure: "CABG, POD 0", airway: "Intubated", rass: -4,
    painScore: 1.4, predicted: 1.5, selfReport: false
  },
  {
    bed: "04", id: 1471, sex: "F", age: 41, procedure: "Craniotomy, tumor resection, POD 0",
    painScore: 4.2, predicted: 4.4, selfReport: true,
    emr: { assessmentAt: "09:00", lastAnalgesic: "Acetaminophen 1g IV, 08:05", activeMeds: "Levetiracetam 500 mg q12h, Dexamethasone 4 mg q6h", sedation: "RASS \u22121 \u00b7 able to self-report", renal: "eGFR 96" },
    vitals: { hr: 91, bp: "139/85", spo2: 97, rr: 19, bis: 87, temp: 37.0 }
  },
  {
    bed: "05", id: 1473, sex: "M", age: 55, procedure: "Aneurysm clipping (SAH), POD 1",
    painScore: 2.6, predicted: 2.9, selfReport: true,
    emr: { assessmentAt: "08:50", lastAnalgesic: "Acetaminophen 1g IV, 07:55", activeMeds: "Nimodipine 60 mg q4h", sedation: "RASS \u22121 \u00b7 able to self-report", renal: "eGFR 81" },
    vitals: { hr: 76, bp: "126/78", spo2: 98, rr: 15, bis: 90, temp: 36.6 }
  },
  {
    bed: "06", id: 1477, sex: "F", age: 47, procedure: "Posterior lumbar fusion, POD 1",
    painScore: 4.6, predicted: 4.3, selfReport: true,
    emr: { assessmentAt: "09:06", lastAnalgesic: "Oxycodone 5 mg PO, 08:20", activeMeds: "Cefazolin 1g q8h", sedation: "RASS 0 \u00b7 able to self-report", renal: "eGFR 78" },
    vitals: { hr: 88, bp: "141/84", spo2: 97, rr: 17, bis: 91, temp: 36.9 }
  }
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
