import React from "react";
import { HeartPulse } from "lucide-react";
import WaveformCanvas from "./WaveformCanvas.jsx";
import VitalsRail from "./VitalsRail.jsx";
import { HORIZON_MIN, THRESHOLD, formatTimeToThresholdShort } from "../data/phases.js";

// 모니터 패널 225px = 라벨 28 + 바 52 + 파형 본체 (PRD 5.1 예산). 파형은 추세 그래프 본체를 넘지 않는다.
export default function MonitorPanel({ phase, metrics }) {
  return (
    <section className="flex h-[225px] flex-col overflow-hidden rounded-lg border border-hairline bg-card-surface shadow-sm">
      <div className="flex h-7 shrink-0 items-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.06em] text-brand-panel">
        <HeartPulse className="h-4 w-4 text-brand-light" />
        Patient signal monitoring
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-monitor-bg lg:grid-cols-[1fr_140px]">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <MonitorBar metrics={metrics} />
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0"><WaveformCanvas phase={phase} /></div>
          </div>
        </div>
        <VitalsRail metrics={metrics} />
      </div>
    </section>
  );
}

function MonitorBar({ metrics }) {
  return (
    <div className="grid h-[56px] shrink-0 grid-cols-2 border-b border-monitor-grid bg-monitor-bar text-monitor-ink sm:grid-cols-[96px_96px_136px_minmax(160px,1fr)]">
      <MonitorMetric label="Pain score" value={metrics.painScore.toFixed(1)} />
      <MonitorMetric label={`PRED_${HORIZON_MIN}M`} value={metrics.predicted.toFixed(1)} alert={metrics.predicted >= THRESHOLD} />
      <MonitorMetric label="To threshold" value={formatTimeToThresholdShort(metrics.timeToThreshold)} />
      <MonitorMetric label="AI status" value={metrics.aiStatus} wide />
    </div>
  );
}

// alert: 임계 초과 시 --monitor-alert + ▲ (PRED 칸 전용, PRD 3.3)
function MonitorMetric({ label, value, wide = false, alert = false }) {
  return (
    <div className="flex min-w-0 flex-col justify-center border-r border-monitor-grid px-3 last:border-r-0">
      <div className="truncate text-[10px] font-bold uppercase tracking-[0.06em] text-monitor-ink-dim">{label}</div>
      <div className={`truncate font-bold tabular-nums ${wide ? "text-sm" : "text-lg"} ${alert ? "text-monitor-alert" : "text-monitor-ink"}`}>
        {value}
        {alert && (
          <span className="ml-1 text-sm" role="img" aria-label="Above threshold">▲</span>
        )}
      </div>
    </div>
  );
}
