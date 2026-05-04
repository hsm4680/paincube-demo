import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BrainCircuit,
  Check,
  Database,
  FileCheck2,
  Gauge,
  HeartPulse,
  Loader2,
  Pill,
  Play,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import paincubeLogo from "./assets/paincube-logo.png";
import stellarCubeLogo from "./assets/stellar-cube-usa.png";
import "./styles.css";

const PHASES = {
  idle: {
    label: "Monitoring",
    currentCpi: 1.2,
    predictedCpi: 2.1,
    risk: 12,
    aiStatus: "Baseline locked",
    vitals: { hr: 72, bp: "118/72", spo2: 99, rr: 14, bis: 48, temp: 36.4 },
    emr: {
      procedure: "Laparoscopic colectomy, POD 0",
      nrs: "Unable to self-report",
      lastAnalgesic: "Acetaminophen 1g IV, 08:10",
      activeMeds: "Propofol 35 mcg/kg/min, Cefazolin 1g q8h",
      sedation: "RASS -2",
      renal: "eGFR 74"
    }
  },
  warning: {
    label: "Pre-pain alert",
    currentCpi: 1.8,
    predictedCpi: 7.4,
    risk: 89,
    aiStatus: "Rising sympathetic response",
    vitals: { hr: 88, bp: "142/86", spo2: 98, rr: 18, bis: 55, temp: 36.6 },
    emr: {
      procedure: "Laparoscopic colectomy, POD 0",
      nrs: "Unable to self-report",
      lastAnalgesic: "Fentanyl 25mcg IV, 06:45",
      activeMeds: "Propofol 30 mcg/kg/min, Cefazolin 1g q8h",
      sedation: "RASS -1",
      renal: "eGFR 74"
    }
  },
  recommendation: {
    label: "CDSS ready",
    currentCpi: 3.5,
    predictedCpi: 7.8,
    risk: 91,
    aiStatus: "Intervention recommended",
    vitals: { hr: 93, bp: "150/91", spo2: 97, rr: 20, bis: 58, temp: 36.7 },
    emr: {
      procedure: "Laparoscopic colectomy, POD 0",
      nrs: "Unable to self-report",
      lastAnalgesic: "Fentanyl 25mcg IV, 06:45",
      activeMeds: "Propofol 30 mcg/kg/min, Cefazolin 1g q8h",
      sedation: "RASS -1",
      renal: "eGFR 74"
    }
  },
  administering: {
    label: "Order processing",
    currentCpi: 4.0,
    predictedCpi: 4.8,
    risk: 42,
    aiStatus: "Medication response tracking",
    vitals: { hr: 86, bp: "136/82", spo2: 98, rr: 17, bis: 52, temp: 36.6 },
    emr: {
      procedure: "Laparoscopic colectomy, POD 0",
      nrs: "Unable to self-report",
      lastAnalgesic: "Fentanyl 25mcg IV, now",
      activeMeds: "Propofol 32 mcg/kg/min, Cefazolin 1g q8h",
      sedation: "RASS -2",
      renal: "eGFR 74"
    }
  },
  recovered: {
    label: "Stabilized",
    currentCpi: 1.5,
    predictedCpi: 2.0,
    risk: 9,
    aiStatus: "Pain response stabilized",
    vitals: { hr: 74, bp: "122/76", spo2: 99, rr: 14, bis: 46, temp: 36.4 },
    emr: {
      procedure: "Laparoscopic colectomy, POD 0",
      nrs: "Unable to self-report",
      lastAnalgesic: "Fentanyl 25mcg IV, 1 min ago",
      activeMeds: "Propofol 34 mcg/kg/min, Cefazolin 1g q8h",
      sedation: "RASS -2",
      renal: "eGFR 74"
    }
  }
};

const traces = [
  { key: "eeg", label: "EEG", unit: "uV", color: "#8B5CF6" },
  { key: "ecg", label: "ECG", unit: "mV", color: "#48B83E" },
  { key: "ppg", label: "PPG", unit: "a.u.", color: "#2E86C1" }
];

function App() {
  const [phase, setPhase] = useState("idle");
  const [toast, setToast] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [approvalState, setApprovalState] = useState("ready");
  const timers = useRef([]);
  const metrics = PHASES[phase];

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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col gap-4 px-4 py-4 sm:px-6">
        <Header onStart={startDemo} onReset={resetDemo} demoRunning={demoRunning} />

        <section className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
          <MonitorPanel phase={phase} metrics={metrics} />

          <aside className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            <PainIndexPanel metrics={metrics} phase={phase} />
            <CdssPanel phase={phase} approvalState={approvalState} onApprove={approveOrder} />
            <EmrPanel metrics={metrics} />
          </aside>
        </section>
      </div>

      {toast && <WarningToast />}
    </main>
  );
}

function Header({ onStart, onReset, demoRunning }) {
  return (
    <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-4">
          <img src={paincubeLogo} alt="PainCube" className="h-12 w-auto" />
          <div className="h-10 w-px bg-slate-200" />
          <img src={stellarCubeLogo} alt="StellarCube USA" className="h-10 w-auto" />
        </div>
        <div className="min-w-[220px] border-l border-slate-200 pl-4 max-sm:border-l-0 max-sm:pl-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            <BrainCircuit className="h-4 w-4" />
            Predictive Pain AI
          </div>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">ICU PainCube CDSS Demo</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-sm">
          <PatientStat label="Patient" value="#1468" />
          <PatientStat label="Profile" value="M / 69" />
          <PatientStat label="Location" value="ICU Bed 03" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            <Play className="h-4 w-4" />
            Demo Start
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset demo"
            title="Reset demo"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            <RefreshCw className={`h-4 w-4 ${demoRunning ? "animate-spin-slow" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

function PatientStat({ label, value }) {
  return (
    <div className="border-r border-slate-200 px-4 py-2 last:border-r-0">
      <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-0.5 whitespace-nowrap font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function MonitorPanel({ phase, metrics }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            <HeartPulse className="h-4 w-4" />
            Real-time multimodal monitoring
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Patient signal monitoring</h2>
        </div>
      </div>

      <div className="grid min-h-[460px] grid-cols-1 bg-[#161818] lg:grid-cols-[1fr_148px]">
        <div className="relative min-h-[360px]">
          <WaveformCanvas phase={phase} />
          <MonitorFooter metrics={metrics} />
        </div>
        <VitalsRail metrics={metrics} />
      </div>
    </section>
  );
}

function WaveformCanvas({ phase }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let tick = 0;
    let lastSampleAt = 0;
    const buffers = new Map();
    const states = new Map();

    const makeState = (key) => ({
      phase: key === "eeg" ? 0.27 : key === "ecg" ? 0.08 : 0.18,
      baseline: 0,
      amp: 1,
      event: 0,
      lastEventAt: 0,
      lastPhase: "idle",
      transition: 0
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sampleCount = Math.max(260, Math.floor(rect.width / 2));
      traces.forEach((trace) => {
        if (!buffers.has(trace.key)) buffers.set(trace.key, Array(sampleCount).fill(0));
        if (!states.has(trace.key)) states.set(trace.key, makeState(trace.key));
        const buffer = buffers.get(trace.key);
        if (buffer.length !== sampleCount) {
          const next = Array(sampleCount).fill(0);
          const copy = buffer.slice(-sampleCount);
          next.splice(sampleCount - copy.length, copy.length, ...copy);
          buffers.set(trace.key, next);
        }
      });
    };

    const noise = (x, seed) => {
      const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    const qrs = (p) => {
      const q = -0.28 * Math.exp(-Math.pow((p - 0.115) / 0.012, 2));
      const r = 1.35 * Math.exp(-Math.pow((p - 0.14) / 0.007, 2));
      const s = -0.38 * Math.exp(-Math.pow((p - 0.165) / 0.011, 2));
      const t = 0.28 * Math.exp(-Math.pow((p - 0.36) / 0.075, 2));
      return q + r + s + t;
    };

    const ppg = (p) => {
      const upstroke = Math.exp(-Math.pow((p - 0.18) / 0.055, 2));
      const notch = -0.16 * Math.exp(-Math.pow((p - 0.38) / 0.025, 2));
      const decay = 0.36 * Math.exp(-Math.pow((p - 0.52) / 0.16, 2));
      return upstroke + notch + decay;
    };

    const maybeStartEvent = (state, key, active) => {
      const interval = key === "ecg" ? 130 : key === "ppg" ? 95 : 80;
      const probability = active === "warning" || active === "recommendation" ? 0.45 : 0.2;
      const dice = noise(tick * 0.017 + key.length, key.length * 11);
      if (tick - state.lastEventAt > interval && dice < probability) {
        state.event = key === "ecg" ? 18 : key === "ppg" ? 24 : 16;
        state.lastEventAt = tick;
      }
    };

    const nextSample = (trace) => {
      const active = phaseRef.current;
      const state = states.get(trace.key);
      if (state.lastPhase !== active) {
        state.transition = active === "warning" || active === "recommendation" ? 110 : 58;
        state.event = trace.key === "ppg" ? 34 : trace.key === "ecg" ? 26 : 30;
        state.lastEventAt = tick;
        state.lastPhase = active;
      }

      const strain = active === "warning" ? 1.32 : active === "recommendation" ? 1.58 : active === "administering" ? 1.16 : active === "recovered" ? 0.88 : 1;
      const transitionBoost = state.transition > 0 ? state.transition / 110 : 0;
      state.baseline = state.baseline * 0.985 + (noise(tick * 0.01, trace.key.length) - 0.5) * (0.3 + transitionBoost * 0.55);
      state.amp = state.amp * 0.989 + (0.9 + noise(tick * 0.006, trace.key.length + 9) * (0.22 + transitionBoost * 0.28)) * 0.011;
      maybeStartEvent(state, trace.key, active);

      if (trace.key === "ecg") {
        const rate = active === "idle" || active === "recovered" ? 0.021 : active === "warning" ? 0.026 : active === "recommendation" ? 0.029 : 0.024;
        state.phase = (state.phase + rate * (0.92 + noise(tick * 0.03, 4) * 0.18)) % 1;
        const ectopic = state.event > 0 ? Math.sin(state.event * 0.8) * Math.exp(-state.event / 8) * (11 + transitionBoost * 22) : 0;
        state.event = Math.max(0, state.event - 1);
        state.transition = Math.max(0, state.transition - 1);
        return qrs(state.phase) * 44 * strain * state.amp + state.baseline * 8 + ectopic + (noise(tick * 0.31, 1) - 0.5) * (2.4 + transitionBoost * 4);
      }

      if (trace.key === "ppg") {
        const rate = active === "idle" || active === "recovered" ? 0.018 : active === "warning" ? 0.022 : active === "recommendation" ? 0.024 : 0.02;
        state.phase = (state.phase + rate * (0.94 + noise(tick * 0.025, 6) * 0.16)) % 1;
        const motion = state.event > 0 ? Math.sin(state.event * 0.42) * Math.exp(-state.event / 18) * (18 + transitionBoost * 30) : 0;
        state.event = Math.max(0, state.event - 1);
        state.transition = Math.max(0, state.transition - 1);
        return -ppg(state.phase) * 48 * strain * state.amp + state.baseline * 10 + motion + (noise(tick * 0.19, 2) - 0.5) * (2.1 + transitionBoost * 4);
      }

      const arousal = state.event > 0 ? Math.sin(state.event * 1.3) * Math.exp(-state.event / 12) * (active === "idle" || active === "recovered" ? 8 : 24 + transitionBoost * 24) : 0;
      state.event = Math.max(0, state.event - 1);
      state.phase += 0.035;
      state.transition = Math.max(0, state.transition - 1);
      return Math.sin(state.phase * 5.7) * 8 * strain + Math.sin(state.phase * 18.5) * 3.8 + state.baseline * 9 + arousal + (noise(tick * 0.77, 5) - 0.5) * (8 + transitionBoost * 8) * strain;
    };

    const appendSamples = () => {
      traces.forEach((trace) => {
        const buffer = buffers.get(trace.key);
        buffer.shift();
        buffer.push(nextSample(trace));
      });
      tick += 1;
    };

    const drawGrid = (width, height) => {
      ctx.fillStyle = "#161818";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255,255,255,0.055)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 44) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 38) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawTrace = (trace, rowIndex, width, rowHeight) => {
      const top = rowIndex * rowHeight;
      const yBase = top + rowHeight * 0.53;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.moveTo(0, top);
      ctx.lineTo(width, top);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "600 10px Inter, system-ui, sans-serif";
      ctx.fillText(`${trace.label}_${trace.unit}`, 10, top + 18);

      const buffer = buffers.get(trace.key) || [];
      const xStep = width / Math.max(1, buffer.length - 1);
      ctx.beginPath();
      for (let i = 0; i < buffer.length; i += 1) {
        const x = i * xStep;
        const y = yBase + buffer[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = trace.color;
      ctx.lineWidth = trace.key === "eeg" ? 1.2 : 1.55;
      ctx.stroke();
    };

    const render = (now) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const rowHeight = height / traces.length;
      if (!lastSampleAt) lastSampleAt = now;
      if (now - lastSampleAt > 48) {
        appendSamples();
        lastSampleAt = now;
      }
      drawGrid(width, height);
      traces.forEach((trace, index) => drawTrace(trace, index, width, rowHeight));
      raf = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full min-h-[360px] w-full" />;
}

function MonitorFooter({ metrics }) {
  return (
    <div className="grid border-t border-white/10 bg-[#1B1D1D] text-white sm:grid-cols-[88px_112px_88px_minmax(220px,1fr)]">
      <MonitorMetric label="CPI" value={metrics.currentCpi.toFixed(1)} color="text-cyan-300" />
      <MonitorMetric label="PRED_30M" value={metrics.predictedCpi.toFixed(1)} color={metrics.predictedCpi >= 7 ? "text-red-400" : "text-cyan-300"} />
      <MonitorMetric label="RISK" value={`${metrics.risk}%`} color={metrics.risk > 80 ? "text-amber-300" : "text-emerald-300"} />
      <MonitorMetric label="AI status" value={metrics.aiStatus} color="text-slate-100" wide />
    </div>
  );
}

function MonitorMetric({ label, value, color, wide = false }) {
  return (
    <div className="min-w-0 border-r border-white/10 px-3 py-2 last:border-r-0">
      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">{label}</div>
      <div className={`${wide ? "whitespace-normal text-base leading-6" : "truncate text-lg"} font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function VitalsRail({ metrics }) {
  const vitals = [
    { label: "HR", value: metrics.vitals.hr, color: "text-[#69F24C]" },
    { label: "NIBP", value: metrics.vitals.bp, color: "text-red-400" },
    { label: "SpO2", value: metrics.vitals.spo2, color: "text-sky-300" },
    { label: "RR", value: metrics.vitals.rr, color: "text-yellow-300" },
    { label: "BIS", value: metrics.vitals.bis, color: "text-purple-300" },
    { label: "BT", value: metrics.vitals.temp.toFixed(1), color: "text-orange-200" }
  ];

  return (
    <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 p-px lg:block lg:border-l lg:border-t-0">
      {vitals.map((item) => (
        <div key={item.label} className="bg-[#1B1D1D] px-3 py-3 lg:border-b lg:border-white/10">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">{item.label}</div>
          <div className={`mt-1 text-2xl font-semibold tabular-nums ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function PainIndexPanel({ metrics, phase }) {
  const isAlert = metrics.risk > 80;
  const color = phase === "recovered" || phase === "idle" ? "#10B981" : isAlert ? "#F59E0B" : "#06B6D4";
  const circumference = 2 * Math.PI * 56;
  const currentDash = circumference - (metrics.currentCpi / 10) * circumference;
  const predictedDash = circumference - (metrics.predictedCpi / 10) * circumference;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            <Gauge className="h-4 w-4" />
            Calculated Pain Index
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Pain forecast</h2>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${isAlert ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
          {metrics.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r="56" fill="none" stroke="#E2E8F0" strokeWidth="13" />
            <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="13" strokeDasharray={circumference} strokeDashoffset={predictedDash} strokeLinecap="round" />
            <circle cx="70" cy="70" r="56" fill="none" stroke={color} strokeWidth="13" strokeDasharray={circumference} strokeDashoffset={currentDash} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold tabular-nums text-slate-950">{metrics.currentCpi.toFixed(1)}</div>
            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">CPI / 10</div>
          </div>
        </div>

        <div className="grid gap-3">
          <MetricRow label="Predicted CPI in 30 min" value={metrics.predictedCpi.toFixed(1)} tone={metrics.predictedCpi >= 7 ? "danger" : "cyan"} />
          <MetricRow label="Pain probability" value={`${metrics.risk}%`} tone={metrics.risk > 80 ? "warning" : "success"} />
          <MetricRow label="Personal baseline" value="24h adaptive" tone="cyan" />
        </div>
      </div>
    </section>
  );
}

function MetricRow({ label, value, tone }) {
  const toneClass = {
    danger: "text-red-600",
    warning: "text-amber-600",
    success: "text-emerald-600",
    cyan: "text-cyan-700"
  }[tone];

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}

function CdssPanel({ phase, approvalState, onApprove }) {
  const showRecommendation = phase === "recommendation" || phase === "administering" || phase === "recovered";
  const safeMode = phase === "idle";
  const reviewMode = phase === "warning";

  return (
    <section className="flex min-h-[320px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            <FileCheck2 className="h-4 w-4" />
            AI-CDSS
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Treatment recommendation</h2>
        </div>
        <ShieldCheck className="h-6 w-6 text-slate-400" />
      </div>

      {safeMode ? (
        <div className="mt-5 flex flex-1 flex-col rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-800">Safe range recommendation</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">Maintain current analgesic plan</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <DecisionFact tone="safe" label="Calculated Pain Index" value="CPI 1.2 / 10, predicted 2.1 in 30 min" />
            <DecisionFact tone="safe" label="Risk tier" value="Low probability of severe pain, 12%" />
            <DecisionFact tone="safe" label="Recommendation" value="Continue monitoring; no opioid bolus indicated now" />
          </div>
        </div>
      ) : reviewMode ? (
        <div className="mt-5 flex flex-1 flex-col rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-cyan-100 p-2 text-cyan-700">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-cyan-800">Elevated risk under review</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">Recalculating treatment window</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <DecisionFact tone="review" label="Calculated Pain Index" value="CPI 1.8 / 10, predicted 7.4 in 30 min" />
            <DecisionFact tone="review" label="Signal change" value="EEG arousal burst + ECG rate variability + PPG amplitude shift" />
            <DecisionFact tone="review" label="Next action" value="CDSS medication recommendation pending validation" />
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-1 flex-col rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-amber-100 p-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-800">Preemptive analgesic recommendation</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">Fentanyl 25 mcg IV Bolus</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <DecisionFact label="Trigger" value="Predicted CPI >= 7.0 within 30 min" />
            <DecisionFact label="Confidence" value="89% probability of severe pain" />
            <DecisionFact label="Rationale" value="EEG arousal pattern + ECG/PPG sympathetic shift + EMR medication interval" />
          </div>

          <button
            type="button"
            onClick={onApprove}
            disabled={approvalState !== "ready"}
            className={`mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
              approvalState === "done"
                ? "bg-emerald-600 text-white"
                : approvalState === "loading"
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
          >
            {approvalState === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {approvalState === "done" && <Check className="h-4 w-4" />}
            {approvalState === "ready" && <Pill className="h-4 w-4" />}
            {approvalState === "done" ? "Administration complete" : approvalState === "loading" ? "Approving order" : "Approve order"}
          </button>
        </div>
      )}
    </section>
  );
}

function DecisionFact({ label, value, tone = "warning" }) {
  const safe = tone === "safe";
  const review = tone === "review";
  return (
    <div className={`rounded-md border bg-white px-3 py-2 ${safe ? "border-emerald-200" : review ? "border-cyan-200" : "border-amber-200"}`}>
      <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-1 text-slate-800">{value}</div>
    </div>
  );
}

function EmrPanel({ metrics }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 xl:col-span-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
        <Database className="h-4 w-4" />
        EMR context
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <EmrFact label="Procedure" value={metrics.emr.procedure} />
        <EmrFact label="Pain report" value={metrics.emr.nrs} />
        <EmrFact label="Last analgesic" value={metrics.emr.lastAnalgesic} />
        <EmrFact label="Active medication" value={metrics.emr.activeMeds} />
        <EmrFact label="Sedation" value={metrics.emr.sedation} />
        <EmrFact label="Renal function" value={metrics.emr.renal} />
      </div>
    </section>
  );
}

function EmrFact({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function WarningToast() {
  return (
    <div className="fixed right-5 top-24 z-50 w-[min(430px,calc(100vw-40px))] rounded-lg border border-amber-200 bg-white p-4 shadow-xl">
      <div className="flex gap-3">
        <div className="rounded-md bg-amber-100 p-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-slate-950">[Warning] Pre-pain alert</div>
          <div className="mt-1 text-sm leading-6 text-slate-600">89% probability of CPI rising above 7 within 30 minutes</div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
