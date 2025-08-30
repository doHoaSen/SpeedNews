// ColdStartGate.dummy.tsx
export default function ColdStartGate({ children }: { children: (initItems: any[]) => React.ReactNode }) {
  // 더미에서는 그냥 children을 빈 배열로 호출
  return <>{children([])}</>;
}
