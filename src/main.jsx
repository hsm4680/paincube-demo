import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { PHASES, RECOMMENDATION, metricsForPatient } from "./data/phases.js";
import { PATIENTS, HERO_BED } from "./data/patients.js";
import Header from "./components/Header.jsx";
import WardDashboard from "./components/WardDashboard.jsx";
import PatientDetail from "./components/PatientDetail.jsx";
import { usePainTrend } from "./components/TrendChart.jsx";
import AlertModal from "./components/AlertModal.jsx";
import "./styles.css";

function App() {
  const [screen, setScreen] = useState("ward"); // "ward" | "detail" — react-router 없이 상태로 전환한다
  const [selectedBed, setSelectedBed] = useState(HERO_BED);
  const [phase, setPhase] = useState("idle");
  const [modalOpen, setModalOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [approvalState, setApprovalState] = useState("ready");
  const [resetKey, setResetKey] = useState(0);
  const [dose, setDose] = useState(RECOMMENDATION.dose); // Modify로 바꾼 용량 (PRD 5.6)
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef([]);
  const heroMetrics = PHASES[phase];
  const hero = PATIENTS.find((p) => p.bed === HERO_BED);
  const patient = PATIENTS.find((p) => p.bed === selectedBed);
  const onHero = selectedBed === HERO_BED;
  const metrics = onHero ? heroMetrics : metricsForPatient(patient);
  // 주인공 추세는 화면 전환에도 이어진다. 다른 환자는 각자의 기준선으로 따로 흐른다.
  const heroTrend = usePainTrend(heroMetrics.painScore, resetKey);
  const otherTrend = usePainTrend(metrics.painScore, `${resetKey}:${selectedBed}`);
  const trend = onHero ? heroTrend : otherTrend;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const schedule = (fn, delay) => {
    timers.current.push(setTimeout(fn, delay));
  };

  // Reset: 어느 화면에서 눌러도 Ward Dashboard 초기 상태로 되돌린다 (CLAUDE.md 9절)
  const handleReset = () => {
    clearTimers();
    setScreen("ward");
    setSelectedBed(HERO_BED);
    setPhase("idle");
    setModalOpen(false);
    setDemoRunning(false);
    setApprovalState("ready");
    setDose(RECOMMENDATION.dose);
    setDismissed(false);
    setResetKey((k) => k + 1);
  };

  // PRD 7: 이미 진행 중이면 아무 것도 하지 않는다. 화면은 그대로 두고 흐름만 시작한다.
  const startDemo = () => {
    if (demoRunning) return;
    clearTimers();
    setPhase("idle");
    setModalOpen(false);
    setApprovalState("ready");
    setDismissed(false);
    setDose(RECOMMENDATION.dose);
    setDemoRunning(true);
    schedule(() => setPhase("warning"), 2000);
    schedule(() => setModalOpen(true), 3500);
  };

  const openPatient = (bed = HERO_BED) => {
    setSelectedBed(bed);
    setScreen("detail");
    // 주인공 화면에 들어갈 때만 동일 모달을 재표시한다 (PRD 7)
    if (bed === HERO_BED && phase === "warning") setModalOpen(true);
    else if (bed !== HERO_BED) setModalOpen(false);
  };

  // 타이머 기준점은 "모달을 닫는 시점"이다 (PRD 7)
  const closeModal = () => {
    setModalOpen(false);
    if (screen === "detail" && onHero && phase === "warning") {
      schedule(() => setPhase("recommendation"), 2000);
    }
  };

  const approveOrder = () => {
    if (approvalState !== "ready" || !onHero) return;
    setApprovalState("loading");
    setPhase("administering");
    schedule(() => {
      setApprovalState("done");
      setPhase("recovered");
      setDemoRunning(false);
    }, 2200);
  };

  useEffect(() => () => clearTimers(), []);

  const onDetail = screen === "detail";

  // 모달이 1번 카드를 가리므로 순위를 헤더에 넣는다. 정렬 결과에서 읽어온다 (하드코딩 금지).
  const heroRank = useMemo(() => {
    const ranked = PATIENTS.map((p) => ({ bed: p.bed, predicted: p.bed === HERO_BED ? heroMetrics.predicted : p.predicted }))
      .sort((a, b) => b.predicted - a.predicted);
    return ranked.findIndex((p) => p.bed === HERO_BED) + 1;
  }, [heroMetrics.predicted]);

  return (
    <main className="min-h-screen bg-page-bg text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col gap-4 px-3 py-3 sm:px-6">
        <Header
          patient={onDetail ? patient : null}
          onStart={startDemo}
          onReset={handleReset}
          onBack={onDetail ? () => setScreen("ward") : undefined}
          demoRunning={demoRunning}
        />

        {onDetail ? (
          <PatientDetail
            phase={onHero ? phase : "idle"}
            metrics={metrics}
            trend={trend}
            approvalState={approvalState}
            dose={dose}
            dismissed={dismissed}
            onApprove={approveOrder}
            onDismiss={() => setDismissed(true)}
            onModify={setDose}
          />
        ) : (
          <WardDashboard heroMetrics={heroMetrics} onOpenPatient={openPatient} resetKey={resetKey} />
        )}
      </div>

      {/* 우측 하단 고정 — 두 화면 모두 표시 (PRD 10.1) */}
      <div className="pointer-events-none fixed bottom-2 right-3 z-40 t-caption">
        For investigational use only — not for clinical decision-making
      </div>

      {modalOpen && (
        <AlertModal
          metrics={heroMetrics}
          patient={hero}
          rank={heroRank}
          actionLabel={onDetail && onHero ? "Continue" : "View patient"}
          onAction={onDetail && onHero ? closeModal : () => openPatient(HERO_BED)}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
