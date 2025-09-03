import { useEffect, useRef, useState } from "react";
import { API } from "./config";

export type News = {
  source: string; category: string; title: string; link: string;
  description?: string; author?: string; pubDateIso?: string; thumbnail?: string;
};

export function useFeed(category: string) {
  const [items, setItems] = useState<News[]>([]);
  const esRef = useRef<EventSource | null>(null);

 // 1) 초기 로딩 (REST)
useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      const r = await fetch(`${API}/news?category=${encodeURIComponent(category)}`);
      if (!r.ok) throw new Error(`REST ${r.status}`);
      const data: News[] = await r.json();
      if (!cancelled) {
        console.log("INIT items:", data.length);
        setItems(data);
      }
    } catch (e) {
      console.error("INIT fetch failed", e);
    }
  })();
  return () => { cancelled = true; };
}, [category]);


  // 2) 실시간 (SSE)
  useEffect(() => {
  // ⬇︎ 프록시(/api/stream) 대신 직접 백엔드로
  const es = new EventSource(`${API}/stream?category=${encodeURIComponent(category)}`);
  esRef.current = es;
  const onNews = (ev: MessageEvent) => {
    try {
      const data: News = JSON.parse(ev.data);
      setItems(prev => (prev.some(p => p.link === data.link) ? prev : [data, ...prev]).slice(0, 400));
    } catch {}
  };
  es.addEventListener("news", onNews as any);
  es.addEventListener("ping", () => {});
  es.onerror = () => { /* 자동 재연결됨 */ };
  return () => { es.close(); };
}, [category]);

  return items;
}
