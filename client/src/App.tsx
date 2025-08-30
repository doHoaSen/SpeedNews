// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { useFeed } from "./api/useFeed";
import type { News } from "./api/useFeed";
import { SquareNewsCard } from "./components/SquareNewsCard";
import { ListNewsCard } from "./components/ListNewsCard";
import "./index.css";

// 언론사/카테고리 정의
type SourceKey = "hk" | "yna";
type ViewMode = "tile" | "list";

const SOURCES: Record<SourceKey, {
  label: string;
  // category key -> {label, feedKey}
  cats: Record<string, { label: string; feedKey: string }>;
  defaultCat: string;
}> = {
  hk: {
    label: "한국경제",
    cats: {
      all:       { label: "전체",  feedKey: "hk-all" },
      economy:   { label: "경제",  feedKey: "hk-economy" },
      politics:  { label: "정치",  feedKey: "hk-politics" },
      it:        { label: "IT",    feedKey: "hk-it" },
      finance:   { label: "증권",  feedKey: "hk-finance" },
    },
    defaultCat: "all",
  },
  yna: {
    label: "연합뉴스",
    cats: {
      latest:     { label: "전체",  feedKey: "yna-latest" }, // ‘전체’ = latest
      politics:   { label: "정치",  feedKey: "yna-politics" },
      economy:    { label: "경제",  feedKey: "yna-economy" },
      industry:   { label: "산업",  feedKey: "yna-industry" },
      society:    { label: "사회",  feedKey: "yna-society" },
      world:      { label: "세계",  feedKey: "yna-world" },
    },
    defaultCat: "latest",
  },
};

export default function App({ initialItems = [] }: { initialItems?: News[] }) {
  const [source, setSource] = useState<SourceKey>(() => (localStorage.getItem("src") as SourceKey) || "hk");
  const [cat, setCat] = useState<string>(() => {
    const initSrc = (localStorage.getItem("src") as SourceKey) || "hk";
    return localStorage.getItem("cat") || SOURCES[initSrc].defaultCat;
  });
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem("view-mode") as ViewMode) || "tile");

  // 현재 선택된 feedKey
  const feedKey = SOURCES[source].cats[cat]?.feedKey ?? SOURCES[source].cats[SOURCES[source].defaultCat].feedKey;

  
  // 저장
  useEffect(() => { localStorage.setItem("src", source); }, [source]);
  useEffect(() => { localStorage.setItem("cat", cat); }, [cat]);
  useEffect(() => { localStorage.setItem("view-mode", view); }, [view]);

  // 데이터 로딩
  const items = useFeed(feedKey); // ⬅️ 기존엔 category 문자열이었는데, 이제 feedKey를 그대로 넘겨서 백엔드 키와 1:1
  // const allItems = initialItems.length > 0 && feedKey === "hk-all"
  //   ? [...initialItems, ...items]
  //   : items;
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter(n =>
      [n.title, n.description ?? ""].some(t => t?.toLowerCase().includes(k))
    );
  }, [items, q]);

  // 소스 변경 시 카테고리 기본값으로 리셋
  useEffect(() => {
    if (!SOURCES[source].cats[cat]) {
      setCat(SOURCES[source].defaultCat);
    }
  }, [source]); // eslint-disable-line

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>SpeedNews</h1>
          <p className="subtitle">한국경제/연합뉴스 RSS를 실시간으로 모아보는 가벼운 피드</p>
          <p className="subtitle">본 페이지는 개인 개발 학습용이며, 클릭 시 원문 기사로 이동합니다.</p>
        </div>

        {/* 1단 탭: 언론사 */}
        <div className="tabs">
          {(Object.keys(SOURCES) as SourceKey[]).map((s) => (
            <button
              key={s}
              className={`tab ${source===s ? "active" : ""}`}
              onClick={() => setSource(s)}
            >
              {SOURCES[s].label}
            </button>
          ))}
        </div>

        {/* 2단: 카테고리(좌) + 검색/토글(우) 한 줄 */}
<div className="cats-row">
  <div className="tabs">
    {Object.entries(SOURCES[source].cats).map(([k, v]) => (
      <button
        key={k}
        className={`tab ${cat===k ? "active" : ""}`}
        onClick={() => setCat(k)}
      >
        {v.label}
      </button>
    ))}
  </div>

  <div className="header-actions">
    <input
      className="search"
      placeholder="검색(제목/본문)…"
      value={q} onChange={(e)=>setQ(e.target.value)}
      aria-label="검색"
    />
    <div className="view-toggle" role="group" aria-label="보기 전환">
      <button
        className={`toggle-btn ${view==='tile'?'on':''}`}
        onClick={()=>setView("tile")}
        aria-pressed={view==='tile'}
        title="타일형"
      >■</button>
      <button
        className={`toggle-btn ${view==='list'?'on':''}`}
        onClick={()=>setView("list")}
        aria-pressed={view==='list'}
        title="리스트형"
      >≡</button>
    </div>
  </div>
</div>

      </header>

      {view === "tile" ? (
        <div className="grid">
          {filtered.map((n: News, i) => (
            <SquareNewsCard key={(n.link ?? "") + "_" + i} n={n} />
          ))}
        </div>
      ) : (
        <ul className="list">
          {filtered.map((n: News, i) => (
            <ListNewsCard key={(n.link ?? "") + "_" + i} n={n} />
          ))}
        </ul>
      )}
    </div>
  );
}
