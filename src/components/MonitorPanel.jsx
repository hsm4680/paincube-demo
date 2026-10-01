import React from "react";
import { HeartPulse } from "lucide-react";
import WaveformCanvas from "./WaveformCanvas.jsx";
import VitalsRail from "./VitalsRail.jsx";
import { HORIZON_MIN, THRESHOLD, formatTimeToThresholdShort } from "../data/phases.js";

// 모니터 패널 225px = 라벨 28 + 바 52 + 파형 본체 (PRD 5.1 예산). 파형은 추세 그래프 본체를 넘지 않는다.
export default function MonitorPanel({ phase, metrics, live }) {
  return (
    <section className="panel flex h-full min-h-0 flex-col">
      <div className="section-head shrink-0">
        <HeartPulse className="h-3.5 w-3.5" />
        Patient signal monitoring
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-monitor-bg lg:grid-cols-[1fr_140px]">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <MonitorBar metrics={metrics} live={live} />
          <div className="relative min-h-[150px] flex-1">
            <div className="absolute inset-0"><WaveformCanvas phase={phase} /></div>
          </div>
        </div>
        <VitalsRail metrics={metrics} />
      </div>
    </section>
  );
}

function MonitorBar({ metrics, live }) {
  return (
    <div className="monitor-bar-grid shrink-0 border-b border-monitor-grid bg-monitor-bar text-monitor-ink">
      <MonitorMetric label="Pain score" value={(live ? live.painScore : metrics.painScore).toFixed(1)} />
      <MonitorMetric label={`PRED_${HORIZON_MIN}M`} value={(live ? live.predicted : metrics.predicted).toFixed(1)} alert={metrics.predicted >= THRESHOLD} />
      <MonitorMetric label="To threshold" value={formatTimeToThresholdShort(metrics.timeToThreshold)} />
      <MonitorMetric label="AI status" value={metrics.aiStatus} wide />
    </div>
  );
}

// alert: 임계 초과 시 --monitor-alert + ▲ (PRED 칸 전용, PRD 3.3)
function MonitorMetric({ label, value, wide = false, alert = false }) {
  return (
    <div className={`flex min-h-[52px] min-w-0 flex-col justify-center border-r border-monitor-grid px-3 last:border-r-0 ${wide ? "bar-wide" : ""}`}>
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-monitor-ink-dim">{label}</div>
      <div className={`truncate tabular-nums ${wide ? "text-sm font-semibold" : "text-lg font-bold tracking-[-0.02em]"} ${alert ? "text-monitor-alert" : "text-monitor-ink"}`}>
        {value}
        {alert && (
          <span className="ml-1 text-sm" role="img" aria-label="Above threshold">▲</span>
        )}
      </div>
    </div>
  );
}
