// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { useFeed } from "./api/useFeed";
import type { News } from "./api/useFeed";
import { SquareNewsCard } from "./components/SquareNewsCard";
import { ListNewsCard } from "./components/ListNewsCard";
import "./index.css";

type SourceKey = "hk" | "yna";
type ViewMode = "tile" | "list";

const SOURCES: Record<
  SourceKey,
  {
    label: string;
    cats: Record<string, { label: string; feedKey: string }>;
    defaultCat: string;
  }
> = {
  hk: {
    label: "한국경제",
    cats: {
      all: { label: "전체", feedKey: "hk-all" },
      economy: { label: "경제", feedKey: "hk-economy" },
      politics: { label: "정치", feedKey: "hk-politics" },
      it: { label: "IT", feedKey: "hk-it" },
      finance: { label: "증권", feedKey: "hk-finance" },
    },
    defaultCat: "all",
  },
  yna: {
    label: "연합뉴스",
    cats: {
      latest: { label: "전체", feedKey: "yna-latest" },
      politics: { label: "정치", feedKey: "yna-politics" },
      economy: { label: "경제", feedKey: "yna-economy" },
      industry: { label: "산업", feedKey: "yna-industry" },
      society: { label: "사회", feedKey: "yna-society" },
      world: { label: "세계", feedKey: "yna-world" },
    },
    defaultCat: "latest",
  },
};

// 링크 기준 중복 제거 유틸
const dedupeByLink = (arr: News[]) => {
  const seen = new Set<string>();
  const out: News[] = [];
  for (const n of arr) {
    const key = n.link ?? "";
    if (!seen.has(key)) {
      seen.add(key);
      out.push(n);
    }
  }
  return out;
};

export default function App({ initialItems = [] }: { initialItems?: News[] }) {
  const [source, setSource] = useState<SourceKey>(
    () => (localStorage.getItem("src") as SourceKey) || "hk"
  );
  const [cat, setCat] = useState<string>(() => {
    const initSrc = (localStorage.getItem("src") as SourceKey) || "hk";
    return localStorage.getItem("cat") || SOURCES[initSrc].defaultCat;
  });
  const [q, setQ] = useState("");
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem("view-mode") as ViewMode) || "tile"
  );

  // 현재 선택된 feedKey
  const feedKey =
    SOURCES[source].cats[cat]?.feedKey ??
    SOURCES[source].cats[SOURCES[source].defaultCat].feedKey;

  // 저장
  useEffect(() => {
    localStorage.setItem("src", source);
  }, [source]);
  useEffect(() => {
    localStorage.setItem("cat", cat);
  }, [cat]);
  useEffect(() => {
    localStorage.setItem("view-mode", view);
  }, [view]);

  // 데이터 로딩 (오류 포함)
  const { items, error } = useFeed(feedKey);

  // hk-all에서만 ColdStartGate의 초기 데이터와 병합(중복 제거)
  const hydratedItems = useMemo(() => {
    if (feedKey !== "hk-all") return items;
    // useFeed가 아직 비어있으면 initialItems만 먼저 노출
    if (!items || items.length === 0) return initialItems;
    // 둘 다 있을 때 병합 + dedupe
    return dedupeByLink([...initialItems, ...items]);
  }, [feedKey, items, initialItems]);

  // 검색 필터
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return hydratedItems;
    return hydratedItems.filter((n) =>
      [n.title, n.description ?? ""].some((t) => t?.toLowerCase().includes(k))
    );
  }, [hydratedItems, q]);

  // 소스 변경 시 카테고리 기본값으로 리셋
  useEffect(() => {
    if (!SOURCES[source].cats[cat]) {
      setCat(SOURCES[source].defaultCat);
    }
  }, [source]); // eslint-disable-line

  // 배너 노출 조건: 아직 아무 아이템도 없고 error일 때만
  const showErrorBanner = error && (items?.length ?? 0) === 0 && (initialItems?.length ?? 0) === 0;

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>SpeedNews</h1>
        <p className="subtitle">한국경제/연합뉴스 RSS를 실시간으로 모아보는 가벼운 피드</p>
        <p className="subtitle">본 페이지는 개인 개발 학습용이며, 클릭 시 원문 기사로 이동합니다.</p>
        </div>

        {/* 에러 배너 */}
        {showErrorBanner && (
          <div
            className="banner"
            role="status"
            aria-live="polite"
            style={{
              marginTop: "8px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#fff4f4",
              color: "#b00020",
              fontSize: "14px",
            }}
          >
            서버 응답이 느리거나 실패했어요. 잠시 후 새로고침해 주세요.
          </div>
        )}

        {/* 1단 탭: 언론사 */}
        <div className="tabs">
          {(Object.keys(SOURCES) as SourceKey[]).map((s) => (
            <button
              key={s}
              className={`tab ${source === s ? "active" : ""}`}
              onClick={() => setSource(s)}
            >
              {SOURCES[s].label}
            </button>
          ))}
        </div>

        {/* 2단: 카테고리(좌) + 검색/토글(우) */}
        <div className="cats-row">
          <div className="tabs">
            {Object.entries(SOURCES[source].cats).map(([k, v]) => (
              <button
                key={k}
                className={`tab ${cat === k ? "active" : ""}`}
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="검색"
            />
            <div className="view-toggle" role="group" aria-label="보기 전환">
              <button
                className={`toggle-btn ${view === "tile" ? "on" : ""}`}
                onClick={() => setView("tile")}
                aria-pressed={view === "tile"}
                title="타일형"
              >
                ■
              </button>
              <button
                className={`toggle-btn ${view === "list" ? "on" : ""}`}
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                title="리스트형"
              >
                ≡
              </button>
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
