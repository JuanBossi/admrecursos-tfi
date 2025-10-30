import { api } from './client';

// Ajusta el path si tu backend expone otro endpoint
const LOGIN_PATH = '/auth/login';

export async function loginRequest({ username, password }) {
  const { data } = await api.post(LOGIN_PATH, { username, password });
  // Se espera { user, token }
  return data;
}


