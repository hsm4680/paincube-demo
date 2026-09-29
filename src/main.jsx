import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { PHASES } from "./data/phases.js";
import { PATIENTS, HERO_BED } from "./data/patients.js";
import Header from "./components/Header.jsx";
import WardDashboard from "./components/WardDashboard.jsx";
import PatientDetail from "./components/PatientDetail.jsx";
import { usePainTrend } from "./components/TrendChart.jsx";
import AlertModal from "./components/AlertModal.jsx";
import "./styles.css";

function App() {
  const [screen, setScreen] = useState("ward"); // "ward" | "detail" — react-router 없이 상태로 전환한다
  const [phase, setPhase] = useState("idle");
  const [modalOpen, setModalOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [approvalState, setApprovalState] = useState("ready");
  const [resetKey, setResetKey] = useState(0);
  const timers = useRef([]);
  const metrics = PHASES[phase];
  const patient = PATIENTS.find((p) => p.bed === HERO_BED);
  const trend = usePainTrend(metrics.painScore, resetKey);

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
    setPhase("idle");
    setModalOpen(false);
    setDemoRunning(false);
    setApprovalState("ready");
    setResetKey((k) => k + 1);
  };

  // PRD 7: 이미 진행 중이면 아무 것도 하지 않는다. 화면은 그대로 두고 흐름만 시작한다.
  const startDemo = () => {
    if (demoRunning) return;
    clearTimers();
    setPhase("idle");
    setModalOpen(false);
    setApprovalState("ready");
    setDemoRunning(true);
    schedule(() => setPhase("warning"), 2000);
    schedule(() => setModalOpen(true), 3500);
  };

  const openPatient = () => {
    setScreen("detail");
    if (phase === "warning") setModalOpen(true); // 진입 즉시 동일 모달 재표시 (PRD 7)
  };

  // 타이머 기준점은 "모달을 닫는 시점"이다 (PRD 7)
  const closeModal = () => {
    setModalOpen(false);
    if (screen === "detail" && phase === "warning") {
      schedule(() => setPhase("recommendation"), 2000);
    }
  };

  const approveOrder = () => {
    if (approvalState !== "ready") return;
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

  return (
    <main className="min-h-screen bg-page-bg text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col gap-4 px-3 py-3 sm:px-6 sm:py-4">
        <Header
          patient={onDetail ? patient : null}
          onStart={startDemo}
          onReset={handleReset}
          onBack={onDetail ? () => setScreen("ward") : undefined}
          demoRunning={demoRunning}
        />

        {onDetail ? (
          <PatientDetail
            phase={phase}
            metrics={metrics}
            trend={trend}
            approvalState={approvalState}
            onApprove={approveOrder}
          />
        ) : (
          <WardDashboard heroMetrics={metrics} onOpenPatient={openPatient} resetKey={resetKey} />
        )}
      </div>

      {modalOpen && (
        <AlertModal
          metrics={metrics}
          patient={patient}
          actionLabel={onDetail ? "Continue" : "View patient"}
          onAction={onDetail ? closeModal : openPatient}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
