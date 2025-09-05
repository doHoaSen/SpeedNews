export const API = import.meta.env.VITE_API_URL;

export const apiUrl = (path: string) =>
  `${API}${path.startsWith('/') ? '' : '/'}${path}`;