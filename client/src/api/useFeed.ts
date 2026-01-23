import { useEffect, useRef, useState } from "react";
import {apiUrl} from "./config.ts";


export type News = {
  source: string;
  category: string;
  title: string;
  link: string;
  description?: string;
  author?: string;
  pubDateIso?: string | null;   // ⬅ null 허용 (서버 현실 반영)
  receivedAt?: string;          // ⬅ 추가
  thumbnail?: string;
};

export function useFeed(category: string) {
  const [items, setItems] = useState<News[]>([]);
  const [error, setError] = useState(false);
  const [live, setLive] = useState(false);
  const esRef = useRef<EventSource | null>(null);

 // 1) 초기 로딩 (REST)
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      const r = await fetch(
  apiUrl(`/news?category=${encodeURIComponent(category)}`)
);
      if (!r.ok) throw new Error(`REST ${r.status}`);
      const data: News[] = await r.json();
      if (!cancelled) {
        console.log("INIT items:", data.length);
        setItems(data);
        setError(false);
      }
    } catch (e) {
      console.error("INIT fetch failed", e);
      if (!cancelled) setError(true);
    }
  })();
  return () => { cancelled = true; };
}, [category]);


  // 2) 실시간 (SSE)
  useEffect(() => {
  // ⬇︎ 프록시(/api/stream) 대신 직접 백엔드로
  const es = new EventSource(
  apiUrl(`/stream?category=${encodeURIComponent(category)}`)
);
  esRef.current = es;

  es.onopen = () => {setLive(true); setError(false); };

   // 기본 message도 받도록(onmessage) + 커스텀 'news' 이벤트 둘 다 처리
    const handle = (ev: MessageEvent) => {
      try {
        const data: News = JSON.parse(ev.data);
        setItems(prev =>
          (prev.some(p => p.link === data.link) ? prev : [data, ...prev]).slice(0, 400)
        );
        setError(false); // ✅ 메시지가 오면 에러 해제
      } catch {/* ignore */}
    };
    es.onmessage = handle;
    es.addEventListener("news", handle as any);
    es.addEventListener("ping", () => {});

    es.onerror = () => { setLive(false); /* 자동 재연결됨 */ };

    return () => { es.close(); };
  }, [category]);

  return { items, error, live };
}