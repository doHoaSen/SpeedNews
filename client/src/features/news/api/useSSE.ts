import { useEffect, useRef, useState } from "react";

export type News = {
  source: string;
  category: string;
  title: string;
  link: string;
  description?: string;
  author?: string;
  pubDateIso?: string;
  thumbnail?: string;
};

export function useSSE(category: string) {
  const [items, setItems] = useState<News[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/stream?category=${encodeURIComponent(category)}`);
    esRef.current = es;

    const onNews = (ev: MessageEvent) => {
      try {
        const data: News = JSON.parse(ev.data);
        setItems(prev => [data, ...prev].slice(0, 400)); // 최신 상단, 400개 보관
      } catch {
        // 문자열 이벤트면 필요시 처리
      }
    };

    es.addEventListener("news", onNews as any);
    es.addEventListener("ping", () => {}); // keep-alive

    es.onerror = () => {
      // 자동 재연결됨. 필요시 상태 표시 가능
    };

    return () => {
      es.close();
    };
  }, [category]);

  return items;
}
