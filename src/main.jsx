import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { PHASES } from "./data/phases.js";
import { PATIENTS, HERO_BED } from "./data/patients.js";
import Header from "./components/Header.jsx";
import MonitorPanel from "./components/MonitorPanel.jsx";
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
  const timers = useRef([]);
  const metrics = PHASES[phase];
  const patient = PATIENTS.find((p) => p.bed === HERO_BED);

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
        <Header patient={patient} onStart={startDemo} onReset={resetDemo} demoRunning={demoRunning} />

        <section className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
          <MonitorPanel phase={phase} metrics={metrics} />

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
