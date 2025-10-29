import { useState } from "react";
import { AuthApi } from "../../features/auth/api/auth";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const register = async () => {
    if (!name || !email || !pw || !phone) {
      return alert("모든 필드를 입력하세요.");
    }
    if (!termsAgreed || !privacyAgreed) {
      return alert("이용약관 및 개인정보 처리방침에 동의해야 합니다.");
    }

    try {
      setLoading(true);
      await AuthApi.register({
        name,
        email,
        password: pw,
        phone,
        termsAgreed,
        privacyAgreed,
      });
      alert("회원가입 완료! 이메일 인증 후 로그인해주세요.");
      nav("/login");
    } catch (e: any) {
      alert("회원가입 실패: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">회원가입</h1>

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="비밀번호 (대/소문자, 숫자, 기호 조합 6자 이상)"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
      />
      <p className="text-sm text-gray-500 mb-3">
  비밀번호는 6자 이상이며, 문자·숫자와 기호를 포함해야 합니다.
</p>

      <input
        className="border p-2 w-full mb-2 rounded"
        placeholder="휴대폰 번호 (010-XXXX-XXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      <div className="mt-4 space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
          />
          이용약관에 동의합니다
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
          />
          개인정보 처리방침에 동의합니다
        </label>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4 disabled:opacity-50"
        onClick={register}
        disabled={loading}
      >
        {loading ? "가입 중…" : "회원가입"}
      </button>
    </div>
  );
}
