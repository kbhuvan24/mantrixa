import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Footer = () => (
  <footer style={{
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border)',
    padding: '60px 24px 40px',
    marginTop: 'auto'
  }}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#0a0a0f', fontFamily: 'var(--font-mono)' }}>MX</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>Mantri<span style={{ color: 'var(--accent-green)' }}>xa</span></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            Transforming foundational knowledge into intelligent, scalable solutions — built by engineers, for engineers.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>Platform</h4>
          {[{ to: '/', label: 'Home' }, { to: '/learning-hub', label: 'Learning Hub' }, { to: '/auth?mode=register', label: 'Register' }, { to: '/about', label: 'About Us' }].map(({ to, label }) => (
            <div key={to} style={{ marginBottom: 10 }}>
              <Link to={to} style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent-green)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{label}</Link>
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>Courses</h4>
          {['DevOps Engineering', 'Site Reliability Engineering', 'Python for Industry', 'React.js Development'].map(c => (
            <div key={c} style={{ marginBottom: 10 }}>
              <Link to="/learning-hub" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none' }}>{c}</Link>
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>Connect</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>📧 hello@mantrixa.dev</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>🌐 Hyderabad, India</p>
          <p style={{ color: 'var(--accent-green)', fontSize: 13, fontFamily: 'var(--font-mono)', marginTop: 16 }}>Mantra × Systems = Mantrixa</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2024 Mantrixa. Crafted with ❤️ by Bhuvan & Tarun.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>v2.0.0</p>
      </div>
    </div>
  </footer>
);

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isPrivileged } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!user) return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;

  // adminOnly routes: accessible by both admin and co-admin
  if (adminOnly && !isPrivileged) return <Navigate to="/dashboard" replace />;

  // Student-only routes: privileged users redirect to /admin
  if (!adminOnly && isPrivileged) return <Navigate to="/admin" replace />;

  return children;
};
