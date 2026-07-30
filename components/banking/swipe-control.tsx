"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type SwipeControlProps = {
  onComplete: (duration: number, pathLength: number, swipeCurve: number) => void;
  onIncomplete?: (duration: number, pathLength: number, swipeCurve: number) => void;
  disabled?: boolean;
  onSwipeProgress?: (progress: number) => void;
};

type SwipePath = { x: number; y: number; t: number };

export default function SwipeControl({
  onComplete,
  onIncomplete,
  disabled = false,
  onSwipeProgress,
}: SwipeControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const pathRef = useRef<SwipePath[]>([]);
  const [offset, setOffset] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateMaxOffset = () => {
      if (!trackRef.current || !thumbRef.current) return;
      maxOffsetRef.current =
        trackRef.current.offsetWidth - thumbRef.current.offsetWidth - 12;
    };
    updateMaxOffset();
    window.addEventListener("resize", updateMaxOffset);
    return () => window.removeEventListener("resize", updateMaxOffset);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || completed) return;
      draggingRef.current = true;
      startXRef.current = e.clientX;
      startTimeRef.current = performance.now();
      currentOffsetRef.current = 0;
      pathRef.current = [{ x: e.clientX, y: e.clientY, t: startTimeRef.current }];
      if (thumbRef.current) {
        thumbRef.current.setPointerCapture(e.pointerId);
      }
    },
    [disabled, completed]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current || disabled || completed) return;
      const delta = e.clientX - startXRef.current;
      const clamped = Math.max(0, Math.min(delta, maxOffsetRef.current));
      currentOffsetRef.current = clamped;
      setOffset(clamped);
      const pct = maxOffsetRef.current > 0 ? (clamped / maxOffsetRef.current) * 100 : 0;
      setProgress(pct);
      onSwipeProgress?.(pct);
      pathRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    },
    [disabled, completed, onSwipeProgress]
  );

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const duration = performance.now() - startTimeRef.current;
    const path = pathRef.current;

    let pathLength = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }

    const directDistance = path.length >= 2
      ? Math.abs(path[path.length - 1].x - path[0].x)
      : 0;
    const swipeCurve = pathLength > 0 && directDistance > 0
      ? Number((pathLength / directDistance).toFixed(4))
      : 1;

    if (currentOffsetRef.current >= maxOffsetRef.current * 0.95) {
      setCompleted(true);
      setOffset(maxOffsetRef.current);
      setProgress(100);
      onComplete(duration, pathLength, swipeCurve);
    } else {
      setOffset(0);
      setProgress(0);
      onIncomplete?.(duration, pathLength, swipeCurve);
    }
  }, [onComplete, onIncomplete]);

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">Confirm transfer</p>
      <div
        ref={trackRef}
        className="relative h-[58px] overflow-hidden rounded-full border border-[rgba(57, 224, 255,0.14)] bg-white/[0.06]"
        style={{
          background: completed
            ? "linear-gradient(90deg, rgba(57, 224, 255,0.25), rgba(178, 123, 255,0.2))"
            : undefined,
        }}
      >
        <div
          className="absolute inset-0 transition-[width] duration-150"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, rgba(57, 224, 255,0.25), rgba(178, 123, 255,0.2))",
          }}
        />
        <div
          ref={thumbRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute left-[6px] top-[6px] flex h-[46px] w-[54px] cursor-grab touch-none select-none items-center justify-center rounded-[22px] bg-gradient-to-br from-[#39e0ff] to-[#b27bff] text-sm font-bold text-[#03040d] transition-transform active:cursor-grabbing"
          style={{
            transform: `translateX(${offset}px)`,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {completed ? "✓" : "→"}
        </div>
      </div>
      <p className="text-xs text-muted">
        {completed ? "Transfer confirmed" : "Drag the slider to complete the transfer."}
      </p>
    </div>
  );
}
