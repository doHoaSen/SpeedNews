// src/components/ListNewsCard.tsx
import type { News } from "../api/useFeed";

export function ListNewsCard({ n }: { n: News }) {
  return (
    <li className="card">
      <a href={n.link} target="_blank" rel="noreferrer" className="title">
        {n.title}
      </a>
      <div className="meta">
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
    </li>
  );
}
