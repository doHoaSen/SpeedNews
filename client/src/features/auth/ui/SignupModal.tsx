// src/components/SignupModal.tsx
import { useState } from 'react';
import { AuthApi } from '../api/auth';

type Props = { open: boolean; onClose: () => void };

export default function SignupModal({ open, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  // ✅ 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const [busy, setBusy] = useState(false);
  if (!open) return null;

 

  

  const passwordOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*(\d|\W)).{6,}$/.test(pw);
  const canRegister = !!email && !!pw && passwordOk && termsAgreed && privacyAgreed;

  const register = async () => {
    try {
      if (!canRegister) { alert('필수 항목을 확인해 주세요.'); return; }
      setBusy(true);
      await AuthApi.register({
        name, email, password: pw, phone, 
      });
      alert('회원가입 완료! 이메일에서 인증 링크를 열어 주세요.');
      onClose();
    } catch (e: any) {
      alert('회원가입 실패: ' + (e?.response?.data?.error ?? e?.message ?? '알 수 없는 오류'));
    } finally { setBusy(false); }
  };

  const closeIfIdle = () => { if (!busy) onClose(); };

  return (
    <div className="modal-backdrop" onClick={closeIfIdle}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>회원가입</h3>

        {step === 1 && (
          <>
            <input className="input" placeholder="휴대폰 번호 (예: +8210xxxx...)"
                   value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <div className="modal-actions">
              <button className="btn" onClick={closeIfIdle} disabled={busy}>취소</button>
              
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted">전화번호: {phone}</p>
            <input className="input" placeholder="전송된 OTP 입력"
                   value={otp} onChange={(e)=>setOtp(e.target.value)} />
            <div className="modal-actions">
              <button className="btn" onClick={()=>setStep(1)} disabled={busy}>이전</button>

            </div>
          </>
        )}

        {step === 3 && (
          <>
            <input className="input" placeholder="이메일"
                   value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input" placeholder="비밀번호 (6자+ 대/소문자/숫자·기호 3종)"
                   type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />

            <div style={{ textAlign: 'left', marginTop: 8 }}>
              <label style={{ display:'block', marginBottom:4 }}>
                <input type="checkbox" checked={termsAgreed}
                       onChange={(e)=>setTermsAgreed(e.target.checked)} />
                <span style={{ marginLeft:8 }}>(필수) 이용약관에 동의합니다</span>
              </label>
              <label style={{ display:'block', marginBottom:4 }}>
                <input type="checkbox" checked={privacyAgreed}
                       onChange={(e)=>setPrivacyAgreed(e.target.checked)} />
                <span style={{ marginLeft:8 }}>(필수) 개인정보 처리방침에 동의합니다</span>
              </label>
              <label style={{ display:'block' }}>
                <input type="checkbox" checked={marketingAgreed}
                       onChange={(e)=>setMarketingAgreed(e.target.checked)} />
                <span style={{ marginLeft:8 }}>(선택) 마케팅 정보 수신에 동의합니다</span>
              </label>
            </div>

            <div className="modal-actions" style={{ marginTop: 10 }}>
              <button className="btn" onClick={closeIfIdle} disabled={busy}>취소</button>
              <button className="btn primary" onClick={register} disabled={busy || !canRegister}>
                {busy ? '가입 중…' : '회원가입'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
