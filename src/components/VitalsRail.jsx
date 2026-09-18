import React from "react";

export default function VitalsRail({ metrics }) {
  const vitals = [
    { label: "HR", value: metrics.vitals.hr, color: "text-signal-ecg" },
    { label: "NIBP", value: metrics.vitals.bp, color: "text-monitor-ink" },
    { label: "SpO2", value: metrics.vitals.spo2, color: "text-signal-ppg" },
    { label: "RR", value: metrics.vitals.rr, color: "text-monitor-ink" },
    { label: "BIS", value: metrics.vitals.bis, color: "text-signal-eeg" },
    { label: "BT", value: metrics.vitals.temp.toFixed(1), color: "text-monitor-ink" }
  ];

  return (
    <div className="grid grid-cols-3 gap-px border-t border-monitor-grid bg-monitor-grid p-px sm:grid-cols-6 lg:block lg:border-l lg:border-t-0">
      {vitals.map((item) => (
        <div key={item.label} className="bg-monitor-bar px-3 py-2 lg:border-b lg:border-monitor-grid lg:py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-monitor-ink-dim">{item.label}</div>
          <div className={`mt-1 text-xl font-bold tabular-nums lg:text-2xl ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
