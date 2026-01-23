// src/components/SquareNewsCard.tsx
import type { News } from "../api/useFeed";
import { formatNewsTime } from "../utils/FormatNewsTime";

const catEmoji: Record<string, string> = {
  economy: "📈", politics: "🏛️", it: "💻", finance: "💹",
  realestate: "🏠", all: "📰"
};

export function SquareNewsCard({ n }: { n: News }) {
  const time = formatNewsTime(n.pubDateIso);
  const emoji = catEmoji[n.category] ?? "📰";

  return (
    <a href={n.link} target="_blank" rel="noreferrer" className="tile title-first" title={n.title}>
      <div className="tile-head">
        <span className="tile-emoji">{emoji}</span>
      </div>

      {/* ⬇️ 제목만 크게, 2줄 고정 */}
      <h3 className="tile-title">{n.title}</h3>

      {/* ⬇️ 아주 작은 메타 */}
      <div className="tile-meta-small">
        {n.source ?? "한국경제"} | {n.category}

        <span
          className={`time-badge ${time.isEstimated ? "estimated" : "exact"}`}
          title={
            time.isEstimated
              ? "발행 시각 정보가 제공되지 않은 기사입니다"
              : undefined
          }
        >
          {!time.isEstimated && "🕒 "}
          {time.label}
        </span>
      </div>
    </a>
  );
}
