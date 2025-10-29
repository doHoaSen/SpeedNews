// src/components/SquareNewsCard.tsx
import type { News } from "../../news/api/useFeed";

const catEmoji: Record<string, string> = {
  economy: "📈", politics: "🏛️", it: "💻", finance: "💹",
  realestate: "🏠", all: "📰"
};

export function SquareNewsCard({ n }: { n: News }) {
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
        {n.pubDateIso
    ? `${new Date(n.pubDateIso).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
      })} ${new Date(n.pubDateIso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`
    : ""}
</div>
    </a>
  );
}
