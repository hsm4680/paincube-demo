import React, { useEffect, useMemo, useRef, useState } from "react";
import PatientCard from "./PatientCard.jsx";
import { HERO_BED, PAIN_JITTER, PATIENTS } from "../data/patients.js";
import { STATUS } from "../data/phases.js";

const GAP = 16; // px, 카드 간격
// 데스크톱(3열): 헤더 85 + 페이지 패딩 32 + 섹션 간격 16 = 133px를 뺀 높이를 쓰되
// 카드가 과하게 늘어나지 않도록 656px(카드 320px × 2행)에서 멈춘다. 1440x900 무스크롤.
const GRID_H = "min(calc(100vh - 133px), 640px)";
const CARD_H_SM = 200; // px, 2열·1열에서는 고정 높이 + 페이지 스크롤

// 카드 폭 = 열 폭이므로 translate의 100%는 한 칸 이동과 같다.
const columnsFor = (width) => (width >= 1024 ? 3 : width >= 640 ? 2 : 1);

function useColumns() {
  const [cols, setCols] = useState(() => (typeof window === "undefined" ? 3 : columnsFor(window.innerWidth)));
  useEffect(() => {
    const onResize = () => setCols(columnsFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
}

// 주인공 외 5명의 현재값만 ±0.3 변동한다. 예측값은 고정이라 정렬은 흔들리지 않는다 (PRD 4.6).
function useJitter(resetKey) {
  const [jitter, setJitter] = useState({});
  const ref = useRef({});
  useEffect(() => {
    ref.current = {};
    setJitter({});
    const id = setInterval(() => {
      const next = {};
      PATIENTS.forEach((p) => {
        if (p.bed === HERO_BED) return;
        const prev = ref.current[p.bed] ?? 0;
        const step = (Math.random() - 0.5) * 0.18;
        next[p.bed] = Math.max(-PAIN_JITTER, Math.min(PAIN_JITTER, prev + step));
      });
      ref.current = next;
      setJitter(next);
    }, 1400);
    return () => clearInterval(id);
  }, [resetKey]);
  return jitter;
}

export default function WardDashboard({ heroMetrics, onOpenPatient, resetKey }) {
  const cols = useColumns();
  const jitter = useJitter(resetKey);
  const rows = Math.ceil(PATIENTS.length / cols);
  const wide = cols === 3;
  const gridHeight = wide ? GRID_H : rows * CARD_H_SM + (rows - 1) * GAP;
  const cardHeight = wide ? `calc((100% - ${(rows - 1) * GAP}px) / ${rows})` : CARD_H_SM;

  const cards = useMemo(() => {
    const rowsData = PATIENTS.map((patient) => {
      const hero = patient.bed === HERO_BED;
      return {
        patient,
        painScore: hero ? heroMetrics.painScore : patient.painScore + (jitter[patient.bed] ?? 0),
        predicted: hero ? heroMetrics.predicted : patient.predicted,
        status: hero ? heroMetrics.status : STATUS.STABLE
      };
    });
    // 정렬 기준: 예측값 내림차순 (PRD 4.3)
    return rowsData.sort((a, b) => b.predicted - a.predicted);
  }, [heroMetrics, jitter]);

  return (
    <section className="flex flex-1 items-center" aria-label="ICU ward patient beds, sorted by predicted Pain Score">
      <div className="relative w-full" style={{ height: gridHeight }}>
      {cards.map((card, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return (
          <div
            key={card.patient.bed}
            className="ward-card absolute left-0 top-0"
            style={{
              width: `calc((100% - ${(cols - 1) * GAP}px) / ${cols})`,
              height: cardHeight,
              transform: `translate(calc(${col} * (100% + ${GAP}px)), calc(${row} * (100% + ${GAP}px)))`
            }}
          >
            <PatientCard
              patient={card.patient}
              painScore={card.painScore}
              predicted={card.predicted}
              status={card.status}
              rank={index + 1}
              onOpen={card.patient.bed === HERO_BED ? onOpenPatient : undefined}
            />
          </div>
        );
      })}
      </div>
    </section>
  );
}
