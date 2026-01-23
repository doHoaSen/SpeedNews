// src/components/ListNewsCard.tsx
import type { News } from "../api/useFeed";
import { formatNewsTime } from "../utils/FormatNewsTime";

export function ListNewsCard({ n }: { n: News }) {
  const time = formatNewsTime(n.pubDateIso);

  return (
    <li className="card">
      <a href={n.link} target="_blank" rel="noreferrer" className="title">
        {n.title}
      </a>
      <div className="meta">
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
    </li>
  );
}
