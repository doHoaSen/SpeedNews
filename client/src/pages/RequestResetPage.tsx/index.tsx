import { useState } from "react";
import { AuthApi } from "../../features/auth/api/auth";

export default function RequestResetPage() {
  const ENV = import.meta.env.VITE_ENV;
  const SKIP_EMAIL = ENV === "staging" || ENV === "production";

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async () => {
    if (!email) return alert("이메일을 입력해주세요.");
    setLoading(true);
    setMsg("");

    // staging / production → 이메일 발송 스킵
    if (SKIP_EMAIL) {
      setMsg("⚠️ 이 환경에서는 이메일 기반 재설정을 사용할 수 없습니다.");
      setLoading(false);
      return;
    }

    try {
      await AuthApi.requestReset(email);
      setMsg("✅ 비밀번호 재설정 메일을 보냈습니다.");
    } catch {
      setMsg("❌ 등록되지 않은 이메일입니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-3">비밀번호 재설정</h1>
      <input
        className="border p-2 w-full mb-2"
        placeholder="가입 시 이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={requestReset}
        disabled={loading}
      >
        {loading ? "메일 전송 중…" : "메일로 재설정 링크 받기"}
      </button>
      {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
    </div>
  );
}
