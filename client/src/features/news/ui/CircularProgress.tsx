// src/components/CircularProgress.tsx
interface CircularProgressProps {
  progress: number;      // 0~100
  size?: number;
  strokeWidth?: number;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
// 파랑(#3b82f6) → 초록(#22c55e) 보간
function colorByProgress(p: number) {
  const clamp = Math.max(0, Math.min(100, p)) / 100;
  const from = { r: 0x3b, g: 0x82, b: 0xf6 }; // blue-500
  const to   = { r: 0x22, g: 0xc5, b: 0x5e }; // green-500
  const r = Math.round(lerp(from.r, to.r, clamp));
  const g = Math.round(lerp(from.g, to.g, clamp));
  const b = Math.round(lerp(from.b, to.b, clamp));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function CircularProgress({ progress, size = 120, strokeWidth = 12 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const stroke = colorByProgress(progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={stroke} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.2s linear, stroke 0.2s linear" }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        className="fill-gray-700 font-semibold"
      >
        {Math.floor(progress)}%
      </text>
    </svg>
  );
}
