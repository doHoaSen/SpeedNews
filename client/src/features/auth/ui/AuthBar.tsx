// src/features/auth/ui/AuthBar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/AuthState";

export default function AuthBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user) {
    // 비회원 상태
    return (
      <div className="auth-buttons">
        <Link to="/login" className="btn primary">로그인</Link>
        <Link to="/signup" className="btn outline">회원가입</Link>
      </div>
    );
  }

  // 로그인 상태
  return (
    <div className="auth-buttons flex items-center gap-2">
      <span className="user-email text-gray-700">{user.email}</span>

      {user.emailVerified ? (
        <>
          <button className="btn outline" onClick={() => nav("/account")}>마이페이지</button>
          <button
            className="btn primary"
            onClick={async () => {
              await logout();
              alert("로그아웃 되었습니다.");
              nav("/", { replace: true });
            }}
          >
            로그아웃
          </button>
        </>
      ) : (
        <button
          className="btn warning"
          onClick={() => nav("/verify-email")}
        >
          이메일 인증 필요
        </button>
      )}
    </div>
  );
}