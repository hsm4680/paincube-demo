import React from "react";
import MonitorPanel from "./MonitorPanel.jsx";
import TrendChart from "./TrendChart.jsx";
import PainGauge from "./PainGauge.jsx";
import CdssPanel from "./CdssPanel.jsx";
import EmrPanel from "./EmrPanel.jsx";
import useLiveReading from "./useLiveReading.js";

// 높이 예산은 PRD 5.1을 따른다.
// 좌우 열은 총높이만 같고(items-stretch), 열 내부 분할은 서로 독립이다.
// 행 단위 높이 일치: 행1 Trend = Pain Forecast, 행2 Monitor = AI-CDSS.
// 두 행은 26:30 비율로 남는 높이를 나눈다. 1024 이하 1열에서는 제약이 풀린다.
// 1024 이하에서 1열로 접히면 이 제약은 풀리고 각 카드는 콘텐츠 높이를 따른다.
export default function PatientDetail({ phase, metrics, trend, approvalState, dose, onApprove, onDismiss, onModify, dismissed }) {
  // 표시용 미세 변동. 색·임계 판정은 metrics(기준값)로만 한다.
  const live = useLiveReading(metrics, phase);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <EmrPanel phase={phase} metrics={metrics} dose={dose} />

      {/* 행 단위 높이 일치 — 좌우 카드의 상단선과 하단선이 모두 맞는다 (PRD 5.1) */}
      <div className="grid min-h-0 flex-[26] items-stretch gap-3 xl:grid-cols-[1.4fr_1fr]">
        <TrendChart trend={trend} metrics={metrics} live={live} />
        <PainGauge metrics={metrics} live={live} />
      </div>

      <div className="grid min-h-0 flex-[30] items-stretch gap-3 xl:grid-cols-[1.4fr_1fr]">
        <MonitorPanel phase={phase} metrics={metrics} live={live} />
        <CdssPanel
          phase={phase}
          metrics={metrics}
          live={live}
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
