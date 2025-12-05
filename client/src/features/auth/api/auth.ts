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
    apiPost<void>("/auth/register", params),

  /** 이메일 인증 코드 입력 */
  verifyEmail: (token: string) =>
    apiPost<void>("/auth/verify-email", { token }),

  /** 이메일 인증 재발송 */
  resendVerification: (email: string) =>
    apiPost<void>("/auth/resend-verification", { email }),

  /** 로그인 */
  login: (email: string, password: string) =>
    apiPost<TokenRes>("/auth/login", { email, password }),

  /** 토큰 리프레시 */
  refresh: (refresh: string) =>
    apiPost<TokenRes>("/auth/refresh", { refresh }),

  /** 내 정보 */
  me: () => apiGet<MeRes>("/auth/me"),

  /** 비밀번호 재설정 요청 */
  requestReset: (email: string) =>
    apiPost<void>("/auth/request-reset", { email }),

  /** 비밀번호 재설정 */
  resetPassword: (token: string, newPassword: string) =>
    apiPost<void>("/auth/reset-password", { token, newPassword }),

  /** 회원 탈퇴 */
  deleteAccount: (password: string) =>
    apiDelete<void>("/auth/delete", { password }),
  
};
