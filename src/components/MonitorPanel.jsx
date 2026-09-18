import React from "react";
import { HeartPulse } from "lucide-react";
import WaveformCanvas from "./WaveformCanvas.jsx";
import VitalsRail from "./VitalsRail.jsx";
import { HORIZON_MIN, THRESHOLD, formatTimeToThresholdShort } from "../data/phases.js";

export default function MonitorPanel({ phase, metrics }) {
  return (
    <section className="overflow-hidden rounded-lg border border-hairline bg-card-surface shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-panel sm:text-xs">
            <HeartPulse className="h-4 w-4 text-brand-light" />
            Real-time multimodal monitoring
          </div>
          <h2 className="mt-1 text-xl font-bold text-brand-navy sm:text-2xl">Patient signal monitoring</h2>
        </div>
      </div>

      <div className="grid min-h-[320px] grid-cols-1 bg-monitor-bg sm:min-h-[420px] lg:grid-cols-[1fr_148px]">
        <div className="relative min-h-[250px] sm:min-h-[340px]">
          <MonitorFooter metrics={metrics} />
          <WaveformCanvas phase={phase} />
        </div>
        <VitalsRail metrics={metrics} />
      </div>
    </section>
  );
}

function MonitorFooter({ metrics }) {
  return (
    <div className="grid grid-cols-2 border-b border-monitor-grid bg-monitor-bar text-monitor-ink sm:grid-cols-[104px_104px_152px_minmax(200px,1fr)]">
      <MonitorMetric label="Pain score" value={metrics.painScore.toFixed(1)} />
      <MonitorMetric label={`PRED_${HORIZON_MIN}M`} value={metrics.predicted.toFixed(1)} alert={metrics.predicted >= THRESHOLD} />
      <MonitorMetric label="Time to threshold" value={formatTimeToThresholdShort(metrics.timeToThreshold)} />
      <MonitorMetric label="AI status" value={metrics.aiStatus} wide />
    </div>
  );
}

// alert: 임계 초과 시 --monitor-alert + ▲ (PRED 칸 전용, PRD 3.3)
function MonitorMetric({ label, value, wide = false, alert = false }) {
  return (
    <div className="min-w-0 border-r border-monitor-grid px-3 py-2 last:border-r-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-monitor-ink-dim">{label}</div>
      <div className={`${wide ? "whitespace-normal text-sm leading-5 sm:text-base sm:leading-6" : "truncate text-lg sm:text-xl"} font-bold tabular-nums ${alert ? "text-monitor-alert" : "text-monitor-ink"}`}>
        {value}
        {alert && (
          <span className="ml-1 text-sm" role="img" aria-label="Above threshold">▲</span>
        )}
      </div>
    </div>
  );
}
