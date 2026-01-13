// src/api/axiosInstance.ts
import axios, { type AxiosError } from 'axios';
import { API, apiUrl } from './config';

// baseURL은 API로, 경로는 apiUrl(path)로 항상 붙여 사용
const http = axios.create({ baseURL: API });

// 요청 인터셉터: 토큰 자동 첨부
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    // 타입 충돌 방지용 any 캐스팅 (axios v1 헤더 타입이 까다로움)
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 → 1회 자동 리프레시 후 원요청 재시도
let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as any; // (내부 타입과 충돌 방지)
    if (err.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (isRefreshing) {
        const newToken = await new Promise<string | null>((resolve) => queue.push(resolve));
        if (newToken) {
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${newToken}`;
        }
        return http(original);
      }

      try {
        isRefreshing = true;
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) throw new Error('no refresh token');

        // refresh는 baseURL 영향 안 받도록 절대 URL로 호출
        const { data } = await axios.post(apiUrl('/auth/refresh'), { refresh });
        const newAccess = (data as any)?.access as string | undefined;
        if (!newAccess) throw new Error('no access token');

        localStorage.setItem('accessToken', newAccess);
        queue.forEach((fn) => fn(newAccess));
        queue = [];

        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newAccess}`;
        return http(original);
      } catch (e) {
        queue.forEach((fn) => fn(null));
        queue = [];
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw err;
  }
);

// ✅ 항상 .data만 반환해서 호출부에서 data.access로 바로 접근 가능
export const apiGet = <T>(path: string, params?: any): Promise<T> =>
  http.get<T>(apiUrl(path), { params }).then(r => r.data);

export const apiPost = <T>(path: string, body?: any): Promise<T> =>
  http.post<T>(apiUrl(path), body).then(r => r.data);

export const apiDelete = <T>(path: string, data?: any) => 
  http.delete<T>(path, {data});

export const api = http;
export default http;
