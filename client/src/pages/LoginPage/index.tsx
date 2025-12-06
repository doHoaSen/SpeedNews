import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthApi } from '../../features/auth/api/auth';
import { useAuth } from "../../state/AuthState";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  // 환경 설정
  const ENV = import.meta.env.VITE_ENV;
  const skipVerification = ENV === "staging" || ENV === "prod";

  // 재전송 관련 상태 (local/dev 전용)
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const nav = useNavigate();

  /** 로그인 */
  const onLogin = async () => {
    try {
      setLoading(true);
      await login(email, pw);

      alert("로그인 성공!");
      nav("/");
    } catch (e: any) {
      // 이메일 인증 필요 메시지는 local/dev 에서만 노출
      if (!skipVerification && e?.message?.includes("이메일 인증")) {
        alert("⚠️ 이메일 인증 후 로그인 가능합니다.\n메일함을 확인해주세요.");
      } else {
        alert("로그인 실패: " + (e?.response?.data?.error ?? e?.message ?? "알 수 없는 오류"));
      }
    } finally {
      setLoading(false);
    }
  };

  /** 이메일 재전송 (local/dev 전용) */
  const resendVerification = async () => {
    if (!resendEmail) {
      alert("가입 시 사용한 이메일을 입력해주세요.");
      return;
    }

    try {
      setResendLoading(true);
      setMessage('');
      await AuthApi.resendVerification(resendEmail);
      setMessage("✅ 인증 메일을 다시 보냈습니다. 메일함을 확인해주세요!");
    } catch (err: any) {
      if (err.response?.status === 404) setMessage("❌ 등록되지 않은 이메일입니다.");
      else if (err.response?.status === 400) setMessage("❌ 이미 인증이 완료된 이메일입니다.");
      else setMessage("❌ 메일 재발송에 실패했습니다.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">로그인</h1>

      {/* ⛔ 인증 메일 재전송은 local/dev 에서만 보임 */}
      {!skipVerification && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-5">
          <p className="text-sm text-blue-700 mb-2 text-center">
            이메일 인증 메일을 받지 못하셨나요?
          </p>

          <input
            type="email"
            placeholder="가입 시 사용한 이메일"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={resendVerification}
            disabled={resendLoading}
            className="bg-blue-600 text-white text-sm px-3 py-2 w-full rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {resendLoading ? "재발송 중..." : "인증 메일 다시 보내기"}
          </button>

          {message && (
            <p className="mt-3 text-sm text-center text-gray-700 whitespace-pre-line">
              {message}
            </p>
          )}
        </div>
      )}

      {/* 로그인 섹션 */}
      <input
        className="border p-2 w-full mb-2"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="비밀번호"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        onClick={onLogin}
        disabled={loading}
      >
        {loading ? "로그인 중…" : "로그인"}
      </button>
    </div>
  );
}
