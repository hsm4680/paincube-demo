import { useEffect, useRef, useState } from "react";

// 표시용 미세 변동(jitter). 파형처럼 "살아있는 시스템"으로 보이게 하되 읽기를 방해하지 않는다.
//
// 규칙 (PRD 5.5-1):
// - 기준값은 phases.js 그대로 보존한다. 흔드는 것은 표시 레이어뿐이다.
// - 기준값 주변을 완만하게 왕복한다: 느린 사인파 + 작은 난수 오프셋, ±0.2로 clamp.
// - 단계가 바뀌면 오프셋을 0으로 리셋해 각 단계의 authored value가 그대로 읽히게 한다.
// - 색 판정과 임계 판정은 이 값을 쓰지 않는다. 기준값으로만 한다.
// - prefers-reduced-motion에서는 멈추고 기준값을 고정 표시한다.
const AMPLITUDE = 0.12; // 사인파 진폭
const NOISE = 0.05; // 난수 오프셋 최대치
const LIMIT = 0.2; // 기준값에서 벗어날 수 있는 절대 한계
const PERIOD_MS = 9000; // 왕복 주기
const TICK_MS = 2000; // 갱신 주기 — 매 프레임 갱신하지 않는다

const clamp = (v) => Math.max(-LIMIT, Math.min(LIMIT, v));

export default function useLiveReading(metrics, phase) {
  const [offsets, setOffsets] = useState({ painScore: 0, predicted: 0 });
  const startedAt = useRef(0);

  useEffect(() => {
    // 단계 전환 직후에는 오프셋 0에서 다시 시작한다
    setOffsets({ painScore: 0, predicted: 0 });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    startedAt.current = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - startedAt.current;
      const wave = (phaseShift) => Math.sin((2 * Math.PI * t) / PERIOD_MS + phaseShift);
      setOffsets({
        painScore: clamp(AMPLITUDE * wave(0) + (Math.random() - 0.5) * 2 * NOISE),
        predicted: clamp(AMPLITUDE * wave(Math.PI / 2) + (Math.random() - 0.5) * 2 * NOISE)
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [phase]);

  return {
    painScore: Math.max(0, metrics.painScore + offsets.painScore),
    predicted: Math.max(0, metrics.predicted + offsets.predicted)
  };
}
