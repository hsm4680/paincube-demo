import React from "react";
import MonitorPanel from "./MonitorPanel.jsx";
import TrendChart from "./TrendChart.jsx";
import PainGauge from "./PainGauge.jsx";
import CdssPanel from "./CdssPanel.jsx";
import EmrPanel from "./EmrPanel.jsx";
import KpiRow from "./KpiRow.jsx";
import StatusBadge from "./StatusBadge.jsx";

// 높이 예산 (PRD 5.1): 상태어+KPI 96 / 좌우 각 425 / EMR 96.
// 좌: 그래프 200 + 파형 225, 우: 게이지 180 + CDSS 245 — 두 열의 합을 같게 맞춘다.
export default function PatientDetail({ phase, metrics, trend, approvalState, dose, onApprove, onDismiss, onModify, dismissed }) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex h-24 flex-col gap-2">
        <div className="flex h-[30px] items-center">
          <StatusBadge status={metrics.status} />
        </div>
        <KpiRow metrics={metrics} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <TrendChart trend={trend} metrics={metrics} />
          <MonitorPanel phase={phase} metrics={metrics} />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <PainGauge metrics={metrics} />
          <CdssPanel
            phase={phase}
            metrics={metrics}
            approvalState={approvalState}
            dose={dose}
            dismissed={dismissed}
            onApprove={onApprove}
            onDismiss={onDismiss}
            onModify={onModify}
          />
        </div>
      </div>

      <EmrPanel phase={phase} metrics={metrics} dose={dose} />
    </div>
  );
}
