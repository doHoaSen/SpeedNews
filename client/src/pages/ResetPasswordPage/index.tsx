import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthApi } from "../../features/auth/api/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async () => {
    if (!token) return alert("잘못된 접근입니다.");
    if (password !== confirm) return alert("비밀번호가 일치하지 않습니다.");

    try {
      setLoading(true);
      await AuthApi.resetPassword(token, password);
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      nav("/login");
    } catch (e: any) {
      alert("변경 실패: " + (e.response?.data?.error ?? e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">비밀번호 재설정</h1>
      <input
        type="password"
        className="border p-2 w-full mb-2"
        placeholder="새 비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-4"
        placeholder="비밀번호 확인"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "변경 중..." : "비밀번호 변경"}
      </button>
    </div>
  );
}
