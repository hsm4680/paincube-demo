import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

// 상태어는 색만으로 전달하지 않는다 — 아이콘 + 텍스트 (PRD 2.5)
export const STATUS_ICON = {
  STABLE: CheckCircle2,
  RISING: TrendingUp,
  "ACTION REQUIRED": AlertTriangle,
  TREATING: Activity,
  STABILIZED: CheckCircle2
};

// Tailwind가 클래스를 추출할 수 있도록 전체 문자열로 둔다.
export const STATUS_CLASS = {
  "status-stable": { text: "text-status-stable", border: "border-status-stable", bg: "bg-status-stable", tint: "bg-status-stable-tint", stroke: "stroke-status-stable" },
  "status-caution": { text: "text-status-caution", border: "border-status-caution", bg: "bg-status-caution", tint: "bg-status-caution-tint", stroke: "stroke-status-caution" },
  "status-critical": { text: "text-status-critical", border: "border-status-critical", bg: "bg-status-critical", tint: "bg-status-critical-tint", stroke: "stroke-status-critical" }
};
