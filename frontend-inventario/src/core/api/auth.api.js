import { api } from './client';

const LOGIN_PATH = '/auth/login';

export async function loginRequest({ username, password }) {
  const res = await api.post(LOGIN_PATH, { username, password });
  const payload = res?.data;
  // Backend con TransformInterceptor: { ok: true, data: { user, token } }
  if (payload && payload.ok && payload.data) return payload.data;
  // Fallback por si no estuviera envuelto
  return payload;
}


