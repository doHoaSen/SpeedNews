// 1) Vite env 읽기
const RAW = (import.meta.env.VITE_API_URL ?? '').trim();

// 2) 끝 슬래시 제거 (…/api/ → …/api)
const normalize = (s: string) => s.replace(/\/+$/, '');

// 3) 최종 BASE URL
export const API = RAW ? normalize(RAW) : `${window.location.origin}/api`;

// 4) 경로 붙이는 헬퍼 (중복/누락 슬래시 방지)
export const apiUrl = (path: string) =>
  `${API}${path.startsWith('/') ? '' : '/'}${path}`;

if (!RAW) {
  // 개발/로컬 등에서 env가 비어 있으면 동일 출처 /api로 사용
  console.warn('[API] VITE_API_URL not set. Using same-origin /api');
}