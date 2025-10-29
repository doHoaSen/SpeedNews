// src/pages/LogoutAction.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthState";

export default function LogoutAction() {
  const { logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    logout();
    nav("/", { replace: true });
  }, [logout, nav]);

  return <p>로그아웃 중...</p>;
}
