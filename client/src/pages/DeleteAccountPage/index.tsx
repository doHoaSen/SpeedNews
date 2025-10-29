import { useState } from "react";
import { AuthApi } from "../../features/auth/api/auth";
import { useAuth } from "../../state/AuthState";
import { useNavigate } from "react-router-dom";

export default function DeleteAccountPage() {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { logout } = useAuth();
  const nav = useNavigate();

  const onDelete = async () => {
    try {
      await AuthApi.deleteAccount(password);
      alert("계정이 삭제되었습니다. 이용해주셔서 감사합니다.");
      logout();
      nav("/login");
    } catch (e: any) {
      alert("회원탈퇴 실패: " + (e.response?.data?.message ?? e.message));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-red-600">회원탈퇴</h1>

      <label className="block mb-2 font-medium">탈퇴 사유</label>
      <select
        className="border p-2 w-full mb-4"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        <option value="">선택해주세요</option>
        <option value="불편한 UI">불편한 UI</option>
        <option value="서비스 이용 불만">서비스 이용 불만</option>
        <option value="재가입 예정">재가입 예정</option>
        <option value="기타">기타</option>
      </select>

      <label className="block mb-2 font-medium">비밀번호 확인</label>
      <input
        type="password"
        className="border p-2 w-full mb-4"
        placeholder="현재 비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-500 text-white px-4 py-2 rounded w-full"
        disabled={!password || !reason}
      >
        탈퇴하기
      </button>

      {/* 경고 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h2 className="text-lg font-bold mb-3 text-red-600">
              정말 회원탈퇴 하시겠습니까?
            </h2>
            <p className="text-gray-700 mb-4">
              사용자 정보는 즉시 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setShowConfirm(false)}
              >
                아니요
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={onDelete}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
