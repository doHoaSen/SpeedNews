import type { News } from "../api/useSSE";

export function NewsCard({ n }: { n: News }) {
  return (
    <li className="card">
      <a href={n.link} target="_blank" rel="noreferrer" className="title">
        {n.title}
      </a>
      <div className="meta">
        {n.pubDateIso ? new Date(n.pubDateIso).toLocaleString() : ""} · {n.source} · {n.category}
      </div>
      {n.description && (
        <p
          className="desc"
          // RSS의 description은 HTML 포함 가능
          dangerouslySetInnerHTML={{ __html: n.description }}
        />
      )}
    </li>
  );
}
