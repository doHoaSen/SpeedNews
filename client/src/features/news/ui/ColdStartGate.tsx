// src/components/ColdStartGate.tsx
import { useEffect, useRef, useState } from "react";
import type { News } from "../api/useFeed";
import CircularProgress from "./CircularProgress";

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function ColdStartGate({
  children,
}: {
  children: (initItems: News[]) => React.ReactNode;
}) {
  const [warming, setWarming] = useState(true);
  const [visible, setVisible] = useState(false);
  const [, setFailed] = useState(false);   // ✅ 첫 요소 버림(에러 배너 안 씀)
  const [initItems, setInitItems] = useState<News[]>([]);
  const [progress, setProgress] = useState(0);

  const showDelayMs = 300;
  const minVisibleMs = 900;
  const completionHoldMs = 650;
  const maxDurationMs = 30000;

  const startedAtRef = useRef<number>(0);
  const visibleAtRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);
  const endTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    startedAtRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const t = Math.min(1, elapsed / maxDurationMs);
      const eased = easeInOutCubic(t);
      const pct = Math.min(95, Math.floor(eased * 100));
      setProgress(pct);
    }, 120);

    showTimerRef.current = window.setTimeout(() => {
      if (!cancelled) {
        setVisible(true);
        visibleAtRef.current = Date.now();
      }
    }, showDelayMs);

    (async () => {
      try {
        const ctl = new AbortController();
        const killer = window.setTimeout(() => ctl.abort(), maxDurationMs);
        const res = await fetch("/api/news?category=hk-all", {
          signal: ctl.signal,
          cache: "no-store",
        });
        window.clearTimeout(killer);

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setInitItems(data);

          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setProgress(100);

          const now = Date.now();
          const visibleFor = visible ? now - visibleAtRef.current : 0;
          const needMin = visible ? Math.max(0, minVisibleMs - visibleFor) : 0;
          const totalHold = needMin + completionHoldMs;

          endTimerRef.current = window.setTimeout(() => {
            setWarming(false);
          }, totalHold);
        } else {
          throw new Error(String(res.status));
        }
      } catch {
        if (cancelled) return;
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setFailed(true);       // 내부 상태만 기록(배너는 없음)
        setWarming(false);
      }
    })();

    return () => {
      cancelled = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!warming) {
    return <>{children(initItems)}</>;
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "16px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, color: "#374151" }}>
        서버 깨우는 중… 처음 접속은 최대 30초 걸릴 수 있어요 ⏳
      </p>
      <CircularProgress progress={progress} size={120} strokeWidth={12} />
    </div>
  );
}
