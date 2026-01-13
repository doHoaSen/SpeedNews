import { useEffect, useMemo, useState } from "react";
//import {Link} from "react-router-dom";
import { useFeed } from "../features/news/api/useFeed";
import type { News } from "../features/news/api/useFeed";
import { SquareNewsCard } from "../features/news/ui/SquareNewsCard";
import { ListNewsCard } from "../features/news/ui/ListNewsCard";

import "./styles/index.css";
//import AuthBar from "../features/auth/ui/AuthBar";

type SourceKey = 
  "hk" 
  | "yna" 
  | "asiae"
  | "fn"
  | "herald"
  | "mk";

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

  asiae: {
    label: "아시아경제",
    cats: {
      all: { label: "전체", feedKey: "asiae-all" },
      economy: { label: "경제", feedKey: "asiae-economy" },
      stock: { label: "증권", feedKey: "asiae-stock" },
      it: { label: "산업·IT", feedKey: "asiae-it" },
      politics: { label: "정치", feedKey: "asiae-politics" },
      world: { label: "국제", feedKey: "asiae-world" },
    },
    defaultCat: "all",
  },

  fn: {
    label: "파이낸셜뉴스",
    cats: {
      all: { label: "전체", feedKey: "fn-all" },
      economy: { label: "경제", feedKey: "fn-economy" },
      stock: { label: "증권", feedKey: "fn-stock" },
      it: { label: "IT", feedKey: "fn-it" },
      world: { label: "국제", feedKey: "fn-world" },
      estate: { label: "부동산", feedKey: "fn-estate" },
      industry: { label: "산업", feedKey: "fn-industry" },
      medical: { label: "의학·과학", feedKey: "fn-medical" },
    },
    defaultCat: "all",
  },

  herald: {
    label: "헤럴드경제",
    cats: {
      all: { label: "전체", feedKey: "herald-all" },
      economy: { label: "경제", feedKey: "herald-economy" },
      finance: { label: "증권", feedKey: "herald-finance" },
      estate: { label: "부동산", feedKey: "herald-estate" },
      industry: { label: "산업", feedKey: "herald-industry" },
      politics: { label: "정치", feedKey: "herald-politics" },
      it: { label: "IT", feedKey: "herald-it" },
    },
    defaultCat: "all",
  },

  mk: {
    label: "매일경제",
    cats: {
      headline: { label: "헤드라인", feedKey: "mk-headline" },
      all: { label: "전체", feedKey: "mk-all" },
      economy: { label: "경제", feedKey: "mk-economy" },
      stock: { label: "증권", feedKey: "mk-stock" },
      management: { label: "기업·경영", feedKey: "mk-management" },
      science: { label: "IT·과학", feedKey: "mk-science" },
    },
    defaultCat: "headline",
  },
};


// 링크 기준 중복 제거
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
  const [view] = useState<ViewMode>(
    () => (localStorage.getItem("view-mode") as ViewMode) || "tile"
  );

  const feedKey =
    SOURCES[source].cats[cat]?.feedKey ??
    SOURCES[source].cats[SOURCES[source].defaultCat].feedKey;

  useEffect(() => { localStorage.setItem("src", source); }, [source]);
  useEffect(() => { localStorage.setItem("cat", cat); }, [cat]);
  useEffect(() => { localStorage.setItem("view-mode", view); }, [view]);

  const { items } = useFeed(feedKey);

  const hydratedItems = useMemo(() => {
    if (feedKey !== "hk-all") return items;
    if (!items || items.length === 0) return initialItems;
    return dedupeByLink([...initialItems, ...items]);
  }, [feedKey, items, initialItems]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return hydratedItems;
    return hydratedItems.filter((n) =>
      [n.title, n.description ?? ""].some((t) => t?.toLowerCase().includes(k))
    );
  }, [hydratedItems, q]);

  useEffect(() => {
    if (!SOURCES[source].cats[cat]) {
      setCat(SOURCES[source].defaultCat);
    }
  }, [source]); // eslint-disable-line

  // const showErrorBanner =
  //   error &&
  //   (items?.length ?? 0) === 0 &&
  //   (initialItems?.length ?? 0) === 0;

  return (
    <>
      {/* 2단: 언론사 탭 */}
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

      {/* 3단: 카테고리 + 검색 */}
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
          />
        </div>
      </div>

      {/* 뉴스 카드 렌더링 */}
      {view === "tile" ? (
        <div className="grid">
          {filtered.map((n, i) => (
            <SquareNewsCard key={(n.link ?? "") + "_" + i} n={n} />
          ))}
        </div>
      ) : (
        <ul className="list">
          {filtered.map((n, i) => (
            <ListNewsCard key={(n.link ?? "") + "_" + i} n={n} />
          ))}
        </ul>
      )}
    </>
  );
}