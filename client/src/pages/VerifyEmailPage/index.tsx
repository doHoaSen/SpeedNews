import { useState } from "react";
import axios from "axios";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await axios.post("/api/auth/verify-email", { email, code });
      setStatus("success");
      setMessage("✅ 이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.");
    } catch (err) {
      setStatus("error");
      setMessage("❌ 인증 실패: 코드가 잘못되었거나 만료되었습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-xl font-semibold text-center mb-4 text-blue-700">
          이메일 코드 인증
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="가입 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="6자리 인증코드"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
          >
            {status === "loading" ? "인증 중..." : "인증하기"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              status === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}