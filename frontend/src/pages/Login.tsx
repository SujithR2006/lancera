import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useSurgeryStore } from '../store/useSurgeryStore';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useSurgeryStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      localStorage.setItem('lancera_token', data.token);
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,245,212,0.04) 1px, transparent 0),
        radial-gradient(ellipse at 50% 50%, rgba(0,245,212,0.03) 0%, transparent 60%)`,
      backgroundSize: '28px 28px, 100% 100%',
    }}>
      {/* Ambient glow effects */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,245,212,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,45,85,0.04) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        width: 460, padding: '48px 44px',
        background: 'var(--panel)',
        border: '1px solid var(--border2)',
        boxShadow: '0 0 60px rgba(0,245,212,0.06), 0 40px 80px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        {/* Corner accents */}
        <div style={{ position:'absolute', top:0, left:0, width:24, height:24, borderTop:'2px solid var(--cyan)', borderLeft:'2px solid var(--cyan)' }} />
        <div style={{ position:'absolute', top:0, right:0, width:24, height:24, borderTop:'2px solid var(--cyan)', borderRight:'2px solid var(--cyan)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:24, height:24, borderBottom:'2px solid var(--cyan)', borderLeft:'2px solid var(--cyan)' }} />
        <div style={{ position:'absolute', bottom:0, right:0, width:24, height:24, borderBottom:'2px solid var(--cyan)', borderRight:'2px solid var(--cyan)' }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: 44, fontWeight: 900,
            color: 'var(--cyan)', letterSpacing: 6,
            textShadow: '0 0 30px rgba(0,245,212,0.5), 0 0 60px rgba(0,245,212,0.2)',
            lineHeight: 1.1,
          }}>
            LANCERA
          </div>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
            color: 'var(--muted)', letterSpacing: 3, marginTop: 8,
            textTransform: 'uppercase',
          }}>
            Coronary Artery Bypass Simulation System v2.1
          </div>
          <div style={{ marginTop: 12, height: 1, background: 'linear-gradient(to right, transparent, var(--border2), transparent)' }} />
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', marginBottom: 32, border: '1px solid var(--border2)' }}>
          {(['login', 'register'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px 0',
                background: mode === m ? 'rgba(0,245,212,0.1)' : 'transparent',
                border: 'none',
                borderBottom: mode === m ? '2px solid var(--cyan)' : '2px solid transparent',
                color: mode === m ? 'var(--cyan)' : 'var(--muted)',
                fontFamily: 'Orbitron, monospace', fontSize: 10,
                letterSpacing: 2, cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
              {m === 'login' ? 'LOGIN' : 'REGISTER'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>
                FULL NAME
              </label>
              <input
                className="input-cyber"
                type="text"
                placeholder="Dr. Alex Mercer"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              className="input-cyber"
              type="email"
              placeholder="surgeon@lancera.med"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: mode === 'register' ? 24 : 36 }}>
            <label style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              className="input-cyber"
              type="password"
              placeholder="••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 36 }}>
              <label style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>
                ROLE
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{
                  width: '100%', background: 'var(--panel2)', border: '1px solid var(--border2)',
                  color: 'var(--text)', fontFamily: 'Share Tech Mono,monospace', fontSize: 13,
                  padding: '10px 12px', outline: 'none',
                }}>
                <option value="student">Student Surgeon</option>
                <option value="surgeon">Attending Surgeon</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px',
              background: 'rgba(255,45,85,0.08)', border: '1px solid var(--red)',
              fontFamily: 'Share Tech Mono,monospace', fontSize: 12, color: 'var(--red)',
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cyan"
            style={{
              width: '100%', padding: '14px 0',
              fontSize: 13, letterSpacing: 2,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'CONNECTING...' : (mode === 'login' ? 'INITIALIZE SESSION' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: 'var(--muted)' }}>
          {mode === 'login' ? (
            <>New operative? <span onClick={() => setMode('register')} style={{ color: 'var(--cyan)', cursor: 'pointer', textDecoration: 'underline' }}>REGISTER ACCESS</span></>
          ) : (
            <>Already registered? <span onClick={() => setMode('login')} style={{ color: 'var(--cyan)', cursor: 'pointer', textDecoration: 'underline' }}>LOGIN</span></>
          )}
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center', fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>
          LANCERA SURGICAL SIMULATION // CLASSIFIED SYSTEM // AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  );
}
