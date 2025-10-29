import React from "react";
import type { News } from "../../features/news/api/useFeed";
import App from "../../app/App"; // 기존 메인 뉴스 UI를 그대로 쓰는 경우

type FeedPageProps = {
  initialItems: News[];
};

export default function FeedPage({ initialItems }: FeedPageProps) {
  return <App initialItems={initialItems} />;
}
