type Cat = { key: string; label: string };

const CATS: Cat[] = [
  { key: "all", label: "전체" },
  { key: "economy", label: "경제" },
  { key: "politics", label: "정치" },
  { key: "it", label: "IT" },
  { key: "finance", label: "증권" },
  { key: "realestate", label: "부동산" },
];

export function CategoryTabs({
  value, onChange,
}: { value: string; onChange: (k: string) => void }) {
  return (
    <div className="tabs">
      {CATS.map(c => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={`tab ${value === c.key ? "active" : ""}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
