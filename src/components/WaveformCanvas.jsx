import React, { useEffect, useRef } from "react";

const traces = [
  { key: "eeg", label: "EEG", unit: "uV", color: "--signal-eeg" },
  { key: "ecg", label: "ECG", unit: "mV", color: "--signal-ecg" },
  { key: "ppg", label: "PPG", unit: "a.u.", color: "--signal-ppg" }
];

// 캔버스는 CSS 클래스를 못 쓰므로 styles.css 토큰 값을 런타임에 읽는다.
const readToken = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default function WaveformCanvas({ phase }) {
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const colors = {
      bg: readToken("--monitor-bg"),
      grid: readToken("--monitor-grid"),
      label: readToken("--monitor-ink-dim"),
      trace: Object.fromEntries(traces.map((t) => [t.key, readToken(t.color)]))
    };
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
        if (!states.has(trace.key)) states.set(trace.key, makeState(trace.key));
      });

      if (!buffers.has(traces[0].key)) {
        // 최초 마운트: 0으로 채우면 화면 전환 직후 평탄선이 보인다 (PRD 5.4).
        // nextSample()을 버퍼 길이만큼 미리 돌려 생리학적 파형으로 채운 상태에서 시작한다.
        const seeded = prefill(sampleCount);
        traces.forEach((trace) => buffers.set(trace.key, seeded.get(trace.key)));
        return;
      }

      const current = buffers.get(traces[0].key);
      if (current.length === sampleCount) return;
      const missing = sampleCount - current.length;
      // 넓어진 경우 부족한 앞부분도 0이 아닌 파형으로 채운다.
      const seeded = missing > 0 ? prefill(missing) : null;
      traces.forEach((trace) => {
        const buffer = buffers.get(trace.key);
        buffers.set(trace.key, seeded ? seeded.get(trace.key).concat(buffer) : buffer.slice(-sampleCount));
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
      const eventChance = active === "warning" || active === "recommendation" ? 0.45 : 0.2;
      const dice = noise(tick * 0.017 + key.length, key.length * 11);
      if (tick - state.lastEventAt > interval && dice < eventChance) {
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

    // 버퍼를 생리학적 파형으로 미리 채운다. appendSamples()와 동일하게
    // 한 tick마다 3개 trace를 함께 진행시켜 위상이 어긋나지 않게 한다.
    const prefill = (count) => {
      const seeded = new Map(traces.map((trace) => [trace.key, []]));
      for (let i = 0; i < count; i += 1) {
        traces.forEach((trace) => seeded.get(trace.key).push(nextSample(trace)));
        tick += 1;
      }
      return seeded;
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
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = colors.grid;
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
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(0, top);
      ctx.lineTo(width, top);
      ctx.stroke();

      ctx.fillStyle = colors.label;
      ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
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
      ctx.strokeStyle = colors.trace[trace.key];
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

  return <canvas ref={canvasRef} className="h-[220px] w-full sm:h-[300px] lg:h-[372px]" />;
}
