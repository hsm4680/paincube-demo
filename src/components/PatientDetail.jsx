import React from "react";
import MonitorPanel from "./MonitorPanel.jsx";
import TrendChart from "./TrendChart.jsx";
import PainGauge from "./PainGauge.jsx";
import CdssPanel from "./CdssPanel.jsx";
import EmrPanel from "./EmrPanel.jsx";
import useLiveReading from "./useLiveReading.js";

// 높이 예산 (1440x900, PRD 5.1): 헤더 80 / EMR 96 / 행1 260 / 행2 300
// / 간격 4x12 / 페이지 패딩 24 ≈ 812.
// 각 행은 grid 기본 stretch로 좌우 높이가 같아진다. 남는 높이는 두 행이 260:280으로 나눠 갖는다.
export default function PatientDetail({ phase, metrics, trend, approvalState, dose, onApprove, onDismiss, onModify, dismissed }) {
  // 표시용 미세 변동. 색·임계 판정은 metrics(기준값)로만 한다.
  const live = useLiveReading(metrics, phase);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <EmrPanel phase={phase} metrics={metrics} dose={dose} />

      <div className="grid min-h-[260px] flex-[260] gap-3 xl:grid-cols-[1.4fr_1fr]">
        <TrendChart trend={trend} metrics={metrics} />
        <PainGauge metrics={metrics} live={live} />
      </div>

      <div className="grid min-h-[300px] flex-[300] gap-3 xl:grid-cols-[1.4fr_1fr]">
        <MonitorPanel phase={phase} metrics={metrics} live={live} />
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
  );
}
