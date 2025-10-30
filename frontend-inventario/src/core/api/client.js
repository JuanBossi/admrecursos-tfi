import axios from 'axios';
import { API_URL } from '../../config/env';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach Authorization from localStorage if not already set
api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  const hasAuth = !!config.headers.Authorization || !!config.headers.authorization;
  if (!hasAuth && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('inv_auth');
      if (saved) {
        const { token } = JSON.parse(saved);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || 'Error de red';
    console.error('[API ERROR]', msg);
    return Promise.reject(err);
  }
);

// Helper for fetch clients: returns headers including Authorization
export function authHeaders(extra = {}) {
  let auth = {};
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('inv_auth');
      if (saved) {
        const { token } = JSON.parse(saved);
        if (token) auth = { Authorization: `Bearer ${token}` };
      }
    } catch (_) {}
  }
  return { ...auth, ...extra };
}
