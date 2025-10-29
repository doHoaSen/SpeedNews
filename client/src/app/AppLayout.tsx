import { Outlet } from "react-router-dom";
import AuthBar from "../features/auth/ui/AuthBar";
import "../app/styles/index.css";

export default function AppLayout() {
  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <div className="logo-section">
            <h1 className="logo">SpeedNews</h1>
            <p className="subtitle">한국경제/연합뉴스 RSS를 실시간으로 모아보는 가벼운 피드</p>
            <p className="subtitle">본 페이지는 개인 개발 학습용이며, 클릭 시 원문 기사로 이동합니다.</p>
          </div>
          <AuthBar />
        </div>
      </header>

      {/* ✅ 하위 페이지가 여기서 렌더링됨 */}
      <Outlet />
    </div>
  );
}
