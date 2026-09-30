import React, { useEffect, useMemo, useRef, useState } from "react";
import PatientCard from "./PatientCard.jsx";
import { HERO_BED, PAIN_JITTER, PATIENTS } from "../data/patients.js";
import { STATUS } from "../data/phases.js";

const GAP = 16; // px, 카드 간격
// 카드 하나가 잘림·줄바꿈 없이 들어가는 최소 폭. 열 수는 뷰포트가 아니라 이 값과
// 컨테이너 실제 폭으로 정한다. 내부 요소가 잘리면 그 열 수가 틀린 것이다.
const MIN_CARD_W = 268;
const MIN_CARD_H = 208; // px, 카드가 이보다 낮아지지 않는다
const CARD_H_SM = 196; // px, 3행 이상일 때는 고정 높이 + 페이지 스크롤

// 컨테이너 폭을 직접 재서 열 수를 정한다 (미디어 쿼리가 아니라 컨테이너 기준)
function useGridColumns(ref) {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = (width) => {
      if (!width) return;
      const fit = Math.floor((width + GAP) / (MIN_CARD_W + GAP));
      setCols(Math.max(1, Math.min(3, fit)));
    };
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(el);
    measure(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [ref]);
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
  const gridRef = useRef(null);
  const cols = useGridColumns(gridRef);
  const jitter = useJitter(resetKey);
  const rows = Math.ceil(PATIENTS.length / cols);
  // 2행 이하면 남는 세로 공간을 카드 높이가 흡수한다. 3행 이상은 고정 높이 + 페이지 스크롤.
  const fills = rows <= 2;
  const minHeight = rows * MIN_CARD_H + (rows - 1) * GAP;
  const gridHeight = fills ? `max(${minHeight}px, calc(100vh - 154px))` : rows * CARD_H_SM + (rows - 1) * GAP;
  const cardHeight = fills ? `calc((100% - ${(rows - 1) * GAP}px) / ${rows})` : CARD_H_SM;

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
    <section className="flex flex-1 flex-col" aria-label="ICU ward patient beds, sorted by predicted Pain Score">
      <div ref={gridRef} className="relative w-full" style={{ height: gridHeight }}>
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
              onOpen={() => onOpenPatient(card.patient.bed)}
            />
          </div>
        );
      })}
      </div>
    </section>
  );
}
