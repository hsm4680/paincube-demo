import React from "react";
import { AlertTriangle } from "lucide-react";
import { HORIZON_MIN, THRESHOLD } from "../data/phases.js";

// 1a: v1 WarningToast 그대로 이동. 중앙 모달화는 5단계에서.
// 1b: 확률 문구 제거, 수치는 phases.js에서 읽음. 토스트는 warning 단계에 뜨므로 caution 색.
export default function AlertModal() {
  return (
    <div className="fixed right-5 top-24 z-50 w-[min(430px,calc(100vw-40px))] rounded-lg border border-status-caution bg-card-surface p-4 shadow-xl">
      <div className="flex gap-3">
        <div className="rounded-md border border-status-caution bg-status-caution-tint p-2 text-status-caution">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-text-primary">[Warning] Pre-pain alert</div>
          <div className="mt-1 text-sm leading-6 text-text-label">{`Pain Score predicted to exceed ${THRESHOLD.toFixed(1)} within ${HORIZON_MIN} minutes`}</div>
        </div>
      </div>
    </div>
  );
}
