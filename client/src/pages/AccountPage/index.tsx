//import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
//import { AuthApi } from '../../features/auth/api/auth';
//import type { MeRes } from '../../features/auth/api/auth';
import { useAuth } from "../../state/AuthState";

export default function AccountPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  if (!user) return <div className="p-6">로그인이 필요합니다.</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">내 계정</h1>
      <p><strong>이메일:</strong> {user.email}</p>
      <p>
        <strong>이메일 인증:</strong>{" "}
        {user.emailVerified ? "✅ 완료" : "❌ 미인증"}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
        onClick={() => nav("/request-reset")}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
      >
        비밀번호 변경
      </button>
        <button
        className="bg-gray-400 text-white px-4 py-2 rounded mt-3"
        onClick={() => nav("/delete-account")}
      >
        회원탈퇴하기
      </button>
      </div>
    </div>
  );
}