// Bed 03 (#1468) 단계별 데이터 — PRD 6절. 화면에 보이는 모든 수치의 유일한 출처.

export const THRESHOLD = 5.0; // Pain Score(CPI) 위험 기준값 (PRD 2.3)
export const HORIZON_MIN = 15; // 예측 지평, 분 (PRD 2.2)
export const SCALE_MAX = 10; // Pain Score(CPI) 척도 상한 (0–10)
export const BASELINE_WINDOW_H = 24; // Personal baseline 산출 창, 시간 (PRD 2.2)

// 상태어 → 상태 계층 토큰 (PRD 2.5).
// 색은 ACTION REQUIRED에만 붙는다. 나머지는 중성 회색이다.
// 배지가 아이콘 + 텍스트를 함께 쓰므로 정보 손실은 없고, 전체 흐름에서 빨강이 권고 시점에
// 한 번만 등장해 시선이 흐려지지 않는다.
export const STATUS = {
  STABLE: { label: "STABLE", color: "status-nodata" },
  RISING: { label: "RISING", color: "status-nodata" },
  ACTION_REQUIRED: { label: "ACTION REQUIRED", color: "status-critical" },
  TREATING: { label: "TREATING", color: "status-nodata" },
  STABILIZED: { label: "STABILIZED", color: "status-nodata" }
};

// 데모 기준 시각 — Pain assessment 경과 시간과 감사추적이 같은 시계를 쓴다 (PRD 5.7)
export const DEMO_CLOCK = { now: "09:14", painAssessment: "08:40" };

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// "08:40 · 34 min ago" — 고정 문자열이 아니라 두 시각의 차이로 계산한다 (PRD 5.7)
export const formatAssessmentAge = (at, now = DEMO_CLOCK.now) => `${at} · ${toMinutes(now) - toMinutes(at)} min ago`;

// EMR 고정 항목 (PRD 5.7)
const EMR_BASE = {
  procedure: "CABG, POD 0",
  painAssessment: DEMO_CLOCK.painAssessment,
  activeMeds: "Propofol 35 mcg/kg/min, Cefazolin 1g q8h",
  sedation: "RASS −4 · unable to self-report",
  renal: "eGFR 74"
};

// timeToThreshold: 분 단위, 예측상 임계 도달이 없으면 null → "No breach predicted"
export const PHASES = {
  idle: {
    status: STATUS.STABLE,
    painScore: 1.4,
    predicted: 1.5,
    timeToThreshold: null,
    aiStatus: "Baseline locked",
    vitals: { hr: 72, bp: "118/72", spo2: 99, rr: 14, bis: 42, temp: 36.4 },
    emr: { ...EMR_BASE, lastAnalgesic: "Acetaminophen 1g IV, 08:10" }
  },
  warning: {
    status: STATUS.RISING,
    painScore: 1.8,
    predicted: 6.2,
    timeToThreshold: 12,
    aiStatus: "Rising sympathetic response",
    vitals: { hr: 88, bp: "142/86", spo2: 98, rr: 18, bis: 51, temp: 36.6 },
    emr: { ...EMR_BASE, lastAnalgesic: "Acetaminophen 1g IV, 08:10" }
  },
  recommendation: {
    status: STATUS.ACTION_REQUIRED,
    painScore: 2.6,
    predicted: 6.8,
    timeToThreshold: 8,
    aiStatus: "Intervention recommended",
    vitals: { hr: 93, bp: "150/91", spo2: 97, rr: 20, bis: 55, temp: 36.7 },
    emr: { ...EMR_BASE, lastAnalgesic: "Acetaminophen 1g IV, 08:10" }
  },
  administering: {
    status: STATUS.TREATING,
    painScore: 3.1,
    predicted: 3.6,
    timeToThreshold: null,
    aiStatus: "Medication response tracking",
    vitals: { hr: 86, bp: "136/82", spo2: 98, rr: 17, bis: 48, temp: 36.6 },
    emr: { ...EMR_BASE, lastAnalgesic: "Fentanyl 25 mcg IV, now" }
  },
  recovered: {
    status: STATUS.STABILIZED,
    painScore: 1.7,
    predicted: 1.6,
    timeToThreshold: null,
    aiStatus: "Pain response stabilized",
    vitals: { hr: 74, bp: "122/76", spo2: 99, rr: 14, bis: 43, temp: 36.4 },
    emr: { ...EMR_BASE, lastAnalgesic: "Fentanyl 25 mcg IV, 1 min ago" }
  }
};

// Bed 03 외 환자의 상세 화면 — idle 단계에 각자의 값·EMR·vitals를 얹는다 (PRD 4.4)
export const metricsForPatient = (patient) => ({
  ...PHASES.idle,
  painScore: patient.painScore,
  predicted: patient.predicted,
  vitals: patient.vitals,
  emr: {
    procedure: patient.procedure,
    painAssessment: patient.emr.assessmentAt,
    lastAnalgesic: patient.emr.lastAnalgesic,
    activeMeds: patient.emr.activeMeds,
    sedation: patient.emr.sedation,
    renal: patient.emr.renal
  }
});

// 권고 약물 — 이 하나만 쓴다 (CLAUDE.md 10절)
export const RECOMMENDATION = {
  drug: "Fentanyl",
  dose: 25,
  unit: "mcg",
  route: "IV Bolus"
};

// Modify 팝업 용량 선택지 (PRD 5.6)
export const DOSE_OPTIONS = [12.5, 25, 50];

// 안전성 뱃지 — RR·SpO2는 PHASES.recommendation.vitals에서 읽는다 (PRD 5.6)
export const SAFETY = {
  fentanyl24h: 25
};

// 감사추적 (PRD 5.6)
export const AUDIT = {
  approvedAt: "09:14:32",
  ackAt: "09:14:35",
  clinician: "Dr. J. Kim",
  clinicianId: 3391
};

// 승인 용량을 수정한 경우 투여 후 단계의 Last analgesic에 그 용량이 반영된다 (PRD 5.7)
export const lastAnalgesicFor = (phase, dose, current) => {
  if (phase === "administering") return `${RECOMMENDATION.drug} ${dose} ${RECOMMENDATION.unit} IV, now`;
  if (phase === "recovered") return `${RECOMMENDATION.drug} ${dose} ${RECOMMENDATION.unit} IV, 1 min ago`;
  return current;
};

export const formatTimeToThreshold = (minutes) =>
  minutes == null ? "No breach predicted" : `${minutes} min`;

// 모니터 바 전용 축약 표기 (PRD 3.3). 상단 KPI에서는 위의 전체 표기를 쓴다.
export const formatTimeToThresholdShort = (minutes) =>
  minutes == null ? "NO BREACH" : `${minutes} min`;
