import { apiGet, apiPost } from '../../../shared/api/axiosInstance';

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
  
  register: (params: { name: string; email: string; password: string; phone?: string; }) =>
    apiPost<void>('/auth/register', params),

  verifyEmail: (token: string) =>
    apiPost<void>('/auth/verify-email', { token }),

  resendVerification: (email: string) =>
  apiPost<void>('/auth/resend-verification', { email }),


  login: (email: string, password: string) =>
    apiPost<TokenRes>('/auth/login', { email, password }),

  refresh: (refresh: string) =>
    apiPost<TokenRes>('/auth/refresh', { refresh }),

  me: () => apiGet<MeRes>('/auth/me'),

  requestReset: (email: string) =>
  apiPost<void>("/auth/request-reset", { email }),

resetPassword: (token: string, newPassword: string) =>
  apiPost<void>("/auth/reset-password", { token, newPassword }),

deleteAccount: (password: string) =>
  apiPost<void>("/auth/delete", {password}),


};
