import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthApi } from '../features/auth/api/auth';

export type Me = {
  id: number;
  email: string;
  phone?: string;
  emailVerified: boolean;
  roles: string[];
};

type AuthCtx = {
  user: Me | null;
  loading: boolean;
  signInWithTokens: (access: string, refresh: string) => Promise<void>;
  signOut: () => void;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthProvider missing');
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      setLoading(true);
      const me = await AuthApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const acc = localStorage.getItem('accessToken');
    if (acc) refreshMe().catch(() => setLoading(false));
    else setLoading(false);
  }, []);

  const signInWithTokens = async (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    await refreshMe();
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, signInWithTokens, signOut, refreshMe }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
