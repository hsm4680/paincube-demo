import React from "react";
import MonitorPanel from "./MonitorPanel.jsx";
import TrendChart from "./TrendChart.jsx";
import PainGauge from "./PainGauge.jsx";
import CdssPanel from "./CdssPanel.jsx";
import EmrPanel from "./EmrPanel.jsx";

// 6단계에서 레이아웃을 재구성한다. 지금은 3~5단계 화면 전환을 위한 분리만 한 상태다.
export default function PatientDetail({ phase, metrics, trend, approvalState, onApprove }) {
  return (
    <section className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
      <div className="flex min-w-0 flex-col gap-4">
        <TrendChart trend={trend} metrics={metrics} />
        <MonitorPanel phase={phase} metrics={metrics} />
      </div>

      <aside className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
        <PainGauge metrics={metrics} />
        <CdssPanel phase={phase} metrics={metrics} approvalState={approvalState} onApprove={onApprove} />
        <EmrPanel metrics={metrics} />
      </aside>
    </section>
  );
}
