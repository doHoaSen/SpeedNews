// src/components/CircularProgress.tsx
// import React from "react";

interface CircularProgressProps {
  progress: number; // 0~100
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgress({ progress, size = 100, strokeWidth = 10 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* 배경 원 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb" // bg-gray-200
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* 진행률 원 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#3b82f6" // blue-500
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.2s linear" }}
      />
      {/* 퍼센트 텍스트 */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-700 font-semibold"
      >
        {progress}%
      </text>
    </svg>
  );
}
