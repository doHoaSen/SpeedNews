import type { News } from "../api/useSSE";
import { formatNewsTime } from "../utils/FormatNewsTime";

export function NewsCard({ n }: { n: News }) {
  const time = formatNewsTime(n.pubDateIso);
  return (
    <li className="card">
      <a href={n.link} target="_blank" rel="noreferrer" className="title">
        {n.title}
      </a>
      <div className="meta">
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
        · {n.source} · {n.category}
      </div>
    </li>
  );
}
