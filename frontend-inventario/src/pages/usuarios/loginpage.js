import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { loginRequest } from '../../core/api/auth.api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginRequest, { username, password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error de inicio de sesión';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f9fafb' }}>
      <form onSubmit={onSubmit} style={{ width: 340, background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'grid', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, textAlign: 'center' }}>Iniciar sesión</h1>
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '8px 10px', borderRadius: 6, fontSize: 14 }}>
            {error}
          </div>
        )}
        <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
          <span>Usuario o email</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="usuario" required style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
          <span>Contraseña</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }} />
        </label>
        <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

