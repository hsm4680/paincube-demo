import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { PHASES } from "./data/phases.js";
import { PATIENTS, HERO_BED } from "./data/patients.js";
import Header from "./components/Header.jsx";
import MonitorPanel from "./components/MonitorPanel.jsx";
import TrendChart, { usePainTrend } from "./components/TrendChart.jsx";
import PainGauge from "./components/PainGauge.jsx";
import CdssPanel from "./components/CdssPanel.jsx";
import EmrPanel from "./components/EmrPanel.jsx";
import AlertModal from "./components/AlertModal.jsx";
import "./styles.css";

function App() {
  const [phase, setPhase] = useState("idle");
  const [toast, setToast] = useState(false);
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
    const timer = setTimeout(fn, delay);
    timers.current.push(timer);
  };

  const resetDemo = () => {
    clearTimers();
    setPhase("idle");
    setToast(false);
    setDemoRunning(false);
    setApprovalState("ready");
  };

  // Reset 버튼 전용: 추세 이력까지 초기화 (Demo Start는 이력을 유지한 채 이어서 흐른다)
  const handleReset = () => {
    resetDemo();
    setResetKey((k) => k + 1);
  };

  const startDemo = () => {
    resetDemo();
    setDemoRunning(true);
    schedule(() => {
      setPhase("warning");
      setToast(true);
    }, 2200);
    schedule(() => setPhase("recommendation"), 4600);
    schedule(() => setToast(false), 8000);
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

  return (
    <main className="min-h-screen bg-page-bg text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col gap-4 px-3 py-3 sm:px-6 sm:py-4">
        <Header patient={patient} onStart={startDemo} onReset={handleReset} demoRunning={demoRunning} />

        <section className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
          {/* 2단계: 추세 그래프를 좌측 상단에 배치 (PRD 5.1). 전체 레이아웃 재구성은 6단계 */}
          <div className="flex min-w-0 flex-col gap-4">
            <TrendChart trend={trend} metrics={metrics} />
            <MonitorPanel phase={phase} metrics={metrics} />
          </div>

          <aside className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            <PainGauge metrics={metrics} />
            <CdssPanel phase={phase} metrics={metrics} approvalState={approvalState} onApprove={approveOrder} />
            <EmrPanel metrics={metrics} />
          </aside>
        </section>
      </div>

      {toast && <AlertModal />}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
