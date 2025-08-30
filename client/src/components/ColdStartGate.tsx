import { useEffect, useState } from "react";
import type { News } from "../api/useFeed";
import CircularProgress from "./CircularProgress";

export default function ColdStartGate({ children }: { children: (initItems: News[]) => React.ReactNode }) {
  const [warming, setWarming] = useState(true);
  const [failed, setFailed] = useState(false);
  const [initItems, setInitItems] = useState<News[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
  let cancelled = false;
  const start = Date.now();
  const maxDuration = 30000;

  const interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(95, Math.floor((elapsed / maxDuration) * 100));
    if (!cancelled) setProgress(pct);
  }, 200);

  (async () => {
    try {
      const ctl = new AbortController();
      const timeout = setTimeout(() => ctl.abort(), maxDuration);
      const res = await fetch("/api/news?category=hk-all", { signal: ctl.signal, cache: "no-store" });
      clearTimeout(timeout);

      if (!cancelled) {
        if (res.ok) {
          const data = await res.json();
          setInitItems(data);

          clearInterval(interval);  // ✅ 반드시 interval 정리
          setProgress(100);

          setTimeout(() => setWarming(false), 800);
        } else {
          clearInterval(interval);  // 실패 시도 정리
          setFailed(true);
          setWarming(false);
        }
      }
    } catch {
      if (!cancelled) {
        clearInterval(interval);  // 에러 시도 정리
        setFailed(true);
        setWarming(false);
      }
    }
  })();

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, []);


  if (warming) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <p className="text-gray-700">
          서버 깨우는 중… 처음 접속은 최대 30초 걸릴 수 있어요 ⏳
        </p>
        <CircularProgress progress={progress} size={120} strokeWidth={12} />
      </div>
    );
  }

  return (
    <>
      {failed && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-3 py-1 rounded">
          서버 응답이 느리거나 실패했어요. 새로고침으로 다시 시도해 주세요.
        </div>
      )}
      {children(initItems)}
    </>
  );
}
