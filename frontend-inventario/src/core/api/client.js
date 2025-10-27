import axios from 'axios';
import { API_URL } from '../../config/env';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || 'Error de red';
    console.error('[API ERROR]', msg);
    return Promise.reject(err);
  }
);
