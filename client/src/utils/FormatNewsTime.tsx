export function formatNewsTime(pubDateIso?: string | null) {
  if (!pubDateIso) {
    return {
      label: "📰 최신 뉴스",
      isEstimated: true,
    };
  }

  const date = new Date(pubDateIso);
  const now = new Date();

  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) {
    return { label: "방금 전", isEstimated: false };
  }
  if (diffMin < 60) {
    return { label: `${diffMin}분 전`, isEstimated: false };
  }

  return {
    label: date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isEstimated: false,
  };
}
