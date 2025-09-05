import { useEffect, useRef, useState } from "react";
import type { News } from "../api/useFeed";
import CircularProgress from "./CircularProgress";

// 부드러운 진행률 곡선 (0~1 입력 → 0~1 출력)
function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export default function ColdStartGate({
  children,
}: {
  children: (initItems: News[]) => React.ReactNode;
}) {
  const [warming, setWarming] = useState(true);   // 게이트 on/off
  const [visible, setVisible] = useState(false);  // 로더 표시 여부(지연 후 표시)
  const [failed, setFailed] = useState(false);
  const [initItems, setInitItems] = useState<News[]>([]);
  const [progress, setProgress] = useState(0);

  // ===== 튜닝 파라미터 =====
  const showDelayMs   = 300;   // 이 시간 이전에 끝나면 로더 아예 안 보여줌(깜빡임 방지)
  const minVisibleMs  = 900;   // 로더가 일단 뜨면 최소 표시 시간을 보장
  const completionHoldMs = 650;// 100%가 된 뒤 유지(“완료” 맛)
  const maxDurationMs = 30000; // 안전 타임아웃(30초)
  // ========================

  const startedAtRef = useRef<number>(0);
  const visibleAtRef = useRef<number>(0);
  const intervalRef  = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);
  const endTimerRef  = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    startedAtRef.current = Date.now();

    // 1) 진행률 타이머 (Easing + 95% 캡)
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const t = Math.min(1, elapsed / maxDurationMs);
      const eased = easeInOutCubic(t);         // 0→1 사이 부드러운 증가
      const pct = Math.min(95, Math.floor(eased * 100));
      setProgress(pct);
    }, 120);

    // 2) 지연 후에 로더 표시(깜빡임 방지)
    showTimerRef.current = window.setTimeout(() => {
      if (!cancelled) {
        setVisible(true);
        visibleAtRef.current = Date.now();
      }
    }, showDelayMs);

    // 3) 실제 데이터 요청
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

          // 진행률 100% 고정 및 타이머 정리
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setProgress(100);

          // 로더가 이미 떠 있다면: 최소 표시시간 + 완료 홀드 보장
          const now = Date.now();
          const visibleFor = visible ? now - visibleAtRef.current : 0;
          const needMin = visible ? Math.max(0, minVisibleMs - visibleFor) : 0;

          const totalHold = needMin + completionHoldMs;

          // 로더를 아직 안 띄웠는데 응답이 끝난 경우:
          // - showDelay 전에 끝났다면 로더를 아예 안 보여주고 즉시 종료
          // - showDelay를 넘긴 직후라면 totalHold로 아주 짧게 100%를 보여주고 종료
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
        setFailed(true);
        setWarming(false);
      }
    })();

    // 정리
    return () => {
      cancelled = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 게이트 종료 → 실제 앱 렌더
  if (!warming) {
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

  // 게이트 중인데 아직 표시 지연 시간 이전 → 아무것도 안 보여줌(깜빡임 방지)
  if (!visible) return null;

  // 로더 표시
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,   // 뷰포트 꽉 채우기
        zIndex: 9999,                           // 위로 올리기
        background: "#fff",                     // 필요 없으면 지워도 됨 (반투명 원하면 'rgba(255,255,255,.85)')
        display: "flex",
        flexDirection: "column",
        alignItems: "center",                   // 가로 중앙
        justifyContent: "center",               // 세로 중앙
        gap: "12px",                            // 문구-로더 간격
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
