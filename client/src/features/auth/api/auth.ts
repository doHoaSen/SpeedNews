import { apiGet, apiPost, apiDelete } from '../../../shared/api/axiosInstance';

export type TokenRes = { 
  access: string; 
  refresh: string 
};

export type MeRes = {
  id: number;
  email: string;
  phone?: string;
  emailVerified: boolean;
  roles: string[];
};

export const AuthApi = {
  /** 회원가입 */
  register: (params: { name: string; email: string; password: string; phone?: string }) =>
    apiPost<void>("/api/auth/register", params),

  /** 이메일 인증 코드 입력 */
  verifyEmail: (token: string) =>
    apiPost<void>("/api/auth/verify-email", { token }),

  /** 이메일 인증 재발송 */
  resendVerification: (email: string) =>
    apiPost<void>("/api/auth/resend-verification", { email }),

  /** 로그인 */
  login: (email: string, password: string) =>
    apiPost<TokenRes>("/api/auth/login", { email, password }),

  /** 토큰 리프레시 */
  refresh: (refresh: string) =>
    apiPost<TokenRes>("/api/auth/refresh", { refresh }),

  /** 내 정보 */
  me: () => apiGet<MeRes>("/api/auth/me"),

  /** 비밀번호 재설정 요청 */
  requestReset: (email: string) =>
    apiPost<void>("/api/auth/request-reset", { email }),

  /** 비밀번호 재설정 */
  resetPassword: (token: string, newPassword: string) =>
    apiPost<void>("/api/auth/reset-password", { token, newPassword }),

  /** 회원 탈퇴 */
  deleteAccount: (password: string) =>
    apiDelete<void>("/api/auth/delete", { password }),
  
};
