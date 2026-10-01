import React from "react";
import MonitorPanel from "./MonitorPanel.jsx";
import TrendChart from "./TrendChart.jsx";
import PainGauge from "./PainGauge.jsx";
import CdssPanel from "./CdssPanel.jsx";
import EmrPanel from "./EmrPanel.jsx";
import useLiveReading from "./useLiveReading.js";

// 높이 예산은 PRD 5.1을 따른다.
// 좌우 열은 총높이만 같고(items-stretch), 열 내부 분할은 서로 독립이다.
// 좌: Trend 26 : Monitor 30 비율 / 우: Pain Forecast 고정 204px + AI-CDSS가 잔여 흡수.
// 1024 이하에서 1열로 접히면 이 제약은 풀리고 각 카드는 콘텐츠 높이를 따른다.
export default function PatientDetail({ phase, metrics, trend, approvalState, dose, onApprove, onDismiss, onModify, dismissed }) {
  // 표시용 미세 변동. 색·임계 판정은 metrics(기준값)로만 한다.
  const live = useLiveReading(metrics, phase);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <EmrPanel phase={phase} metrics={metrics} dose={dose} />

      {/* 좌우 두 열은 총높이만 같다. 열 내부의 행 분할 비율은 서로 독립이다 (PRD 5.1). */}
      <div className="grid min-h-0 flex-1 items-stretch gap-3 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-h-0 flex-[26]">
            <TrendChart trend={trend} metrics={metrics} />
          </div>
          <div className="flex min-h-0 flex-[30]">
            <MonitorPanel phase={phase} metrics={metrics} live={live} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex shrink-0 xl:h-[204px]">
            <PainGauge metrics={metrics} live={live} />
          </div>
          <div className="flex min-h-0 flex-1">
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
      </div>
    </div>
  );
}
