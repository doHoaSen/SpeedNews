import {create} from "zustand";
import { AuthApi } from "../features/auth/api/auth";

type User = {
  email: string;
  emailVerified: boolean;
  roles: string[];
};

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,

  /** ✅ 로그인 */
  login: async (email: string, password: string) => {
    const tokenRes = await AuthApi.login(email, password);
    localStorage.setItem("accessToken", tokenRes.access);
    localStorage.setItem("refreshToken", tokenRes.refresh);

    // 로그인 후 유저 정보 조회
    const me = await AuthApi.me();
    if (!me.emailVerified) {
      throw new Error("이메일 인증이 필요합니다.");
    }

    set({
      user: {
        email: me.email,
        emailVerified: me.emailVerified,
        roles: me.roles,
      },
    });
  },

  /** ✅ 유저 정보 새로고침 */
  fetchMe: async () => {
    try {
      const me = await AuthApi.me();
      set({
        user: {
          email: me.email,
          emailVerified: me.emailVerified,
          roles: me.roles,
        },
      });
    } catch {
      set({ user: null });
    }
  },

  /** ✅ 로그아웃 */
  logout: async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));