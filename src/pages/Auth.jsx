import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const PASS_RULES = [
  { re: /.{8,}/, label: 'At least 8 characters' },
  { re: /[A-Z]/, label: 'One uppercase letter' },
  { re: /[0-9]/, label: 'One number' },
  { re: /[^A-Za-z0-9]/, label: 'One special character' },
];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const passed = PASS_RULES.filter(r => r.re.test(password));
  const pct = (passed.length / PASS_RULES.length) * 100;
  const color = pct <= 25 ? '#ff3b3b' : pct <= 50 ? 'var(--accent-orange)' : pct <= 75 ? '#ffd700' : 'var(--accent-green)';
  const label = pct <= 25 ? 'Weak' : pct <= 50 ? 'Fair' : pct <= 75 ? 'Good' : 'Strong';
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {PASS_RULES.filter(r => !r.re.test(password)).map(r => r.label).join(' · ')}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
      </div>
    </div>
  );
};

const Auth = () => {
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'login';
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'coadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, from, navigate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (isRegister) {
      if (!form.name.trim()) {
        toast('Please enter your full name', 'error');
        setLoading(false);
        return;
      }
      if (form.name.trim().length < 2) {
        toast('Name must be at least 2 characters', 'error');
        setLoading(false);
        return;
      }
      if (form.password !== form.confirm) {
        toast('Passwords do not match', 'error');
        setLoading(false);
        return;
      }
      if (form.password.length < 8) {
        toast('Password must be at least 8 characters', 'error');
        setLoading(false);
        return;
      }

      const res = await register(form.name.trim(), form.email.trim(), form.password);
      if (res.error) {
        toast(res.error, 'error');
        setLoading(false);
        return;
      }
      toast('🎉 Account created! A welcome email has been sent.', 'success');
    } else {
      const res = login(form.email.trim(), form.password);
      if (res.error) {
        toast(res.error, 'error');
        setLoading(false);
        return;
      }
      toast('Welcome back!', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 'clamp(16px, 4vw, 24px)'
    }}>
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 6vw, 40px)' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 10px)', textDecoration: 'none' }}>
            <div style={{
              width: 'clamp(36px, 8vw, 44px)', height: 'clamp(36px, 8vw, 44px)', borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 900, color: '#0a0a0f', fontFamily: 'var(--font-mono)'
            }}>MX</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 800 }}>
              Mantri<span style={{ color: 'var(--accent-green)' }}>xa</span>
            </span>
          </Link>
        </div>

        <div className="card" style={{ border: '1px solid var(--border-active)', maxWidth: 440, margin: '0 auto', width: '100%' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 'clamp(24px, 5vw, 32px)', background: 'var(--bg-elevated)', borderRadius: 10, padding: 4 }}>
            {[['login', 'Log In'], ['register', 'Register']].map(([m, label]) => (
              <Link key={m} to={`/auth?mode=${m}`} replace style={{
                flex: 1, textAlign: 'center', padding: 'clamp(8px, 2vw, 10px) 0',
                borderRadius: 8, fontSize: 'clamp(13px, 2vw, 14px)', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? 'var(--shadow)' : 'none'
              }}>{label}</Link>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: 8 }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 2vw, 14px)', marginBottom: 'clamp(20px, 5vw, 28px)' }}>
            {isRegister ? 'Join 600+ students learning industrial tech' : 'Continue your learning journey'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 18px)' }}>
            {isRegister && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  name="name" className="input"
                  placeholder="e.g. Rahul Kumar"
                  value={form.name} onChange={handleChange}
                  autoComplete="name" required
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                name="email" type="email" className="input"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email" required
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Password
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                name="password" type={showPw ? 'text' : 'password'} className="input"
                placeholder="••••••••" value={form.password} onChange={handleChange}
                autoComplete={isRegister ? 'new-password' : 'current-password'} required
              />
              {isRegister && <PasswordStrength password={form.password} />}
            </div>

            {isRegister && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  name="confirm" type={showPw ? 'text' : 'password'} className="input"
                  placeholder="••••••••" value={form.confirm} onChange={handleChange}
                  autoComplete="new-password" required
                />
                {form.confirm && form.password !== form.confirm && (
                  <div style={{ fontSize: 12, color: '#ff3b3b', marginTop: 4 }}>Passwords do not match</div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 'clamp(8px, 2vw, 8px)', padding: 'clamp(11px, 2.5vw, 14px)' }}>
              {loading
                ? <><div className="spinner" />{isRegister ? 'Creating account...' : 'Logging in...'}</>
                : (isRegister ? 'Create Account →' : 'Log In →')
              }
            </button>
          </form>

          {isRegister && (
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              By registering you agree to our Terms of Service. A welcome email will be sent to the address provided.
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 'clamp(16px, 4vw, 20px)', color: 'var(--text-muted)', fontSize: 'clamp(13px, 2vw, 14px)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={`/auth?mode=${isRegister ? 'login' : 'register'}`} style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            {isRegister ? 'Log in' : 'Register free'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
