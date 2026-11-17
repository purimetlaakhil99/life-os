import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, GraduationCap, Languages } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, role, preferredLanguage: language });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Brand Banner */}
        <div style={styles.brand}>
          <div style={styles.logoBadge}>
            <Sparkles size={24} color="#818cf8" />
          </div>
          <h1 style={styles.title}>LIFE OS</h1>
          <p style={styles.subtitle}>Personal Digital Life & Student Life Operating System</p>
        </div>

        {/* Tab Switcher */}
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              ...styles.tab,
              ...(isLogin ? styles.tabActive : {}),
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.tabActive : {}),
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div>
              <label style={styles.label}>Full Name:</label>
              <div style={styles.inputWrap}>
                <User size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Akhil Purimetla"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={styles.label}>Email Address:</label>
            <div style={styles.inputWrap}>
              <Mail size={16} color="#64748b" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Password:</label>
            <div style={styles.inputWrap}>
              <Lock size={16} color="#64748b" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
                minLength={8}
              />
            </div>
          </div>

          {!isLogin && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Account Role:</label>
                <div style={styles.inputWrap}>
                  <GraduationCap size={16} color="#64748b" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={styles.select}
                  >
                    <option value="student">Student</option>
                    <option value="user">Personal User</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.label}>Preferred Language:</label>
                <div style={styles.inputWrap}>
                  <Languages size={16} color="#64748b" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={styles.select}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In to LIFE OS' : 'Create Free Account')}
          </button>
        </form>

        <div style={styles.footerNotice}>
          <span>🔒 Argon2id Cryptographic Security & Zero Token Leakage</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.15) 0%, var(--bg-primary) 70%)',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.6rem',
    color: '#f8fafc',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  tabs: {
    display: 'flex',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '0.25rem',
    marginBottom: '1.25rem',
  },
  tab: {
    flex: 1,
    padding: '0.55rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748b',
    textAlign: 'center',
  },
  tabActive: {
    background: 'var(--bg-surface)',
    color: '#f8fafc',
  },
  errorBox: {
    padding: '0.65rem 0.85rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#fca5a5',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.3rem',
    fontWeight: 500,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0 0.85rem',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '0.7rem 0',
    color: '#f8fafc',
    fontSize: '0.9rem',
    boxShadow: 'none',
  },
  select: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '0.7rem 0',
    color: '#f8fafc',
    fontSize: '0.85rem',
    boxShadow: 'none',
  },
  submitBtn: {
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  footerNotice: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#64748b',
  },
};
