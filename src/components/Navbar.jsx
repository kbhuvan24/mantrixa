import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
      height: '80px',
      display: 'flex', alignItems: 'center'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#0a0a0f',
            fontFamily: 'var(--font-mono)'
          }}>MX</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Mantri<span style={{ color: 'var(--accent-green)' }}>xa</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {[
            { path: '/', label: 'Home' },
            { path: '/learning-hub', label: 'Learning Hub' },
            { path: '/about', label: 'About Us' },
          ].map(({ path, label }) => (
            <Link key={path} to={path} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive(path) ? 'var(--accent-green)' : 'var(--text-secondary)',
              background: isActive(path) ? 'rgba(0,255,136,0.08)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none'
            }}
            onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >{label}</Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: isActive('/admin') ? 'var(--accent-orange)' : 'var(--text-secondary)',
              background: isActive('/admin') ? 'rgba(255,107,53,0.1)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none'
            }}>Admin Panel</Link>
          )}
        </div>

        {/* Auth Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {!isAdmin && (
                <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: 14 }}>
                  Dashboard
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#0a0a0f'
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: 13 }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn btn-secondary" style={{ padding: '9px 18px', fontSize: 14 }}>Log in</Link>
              <Link to="/auth?mode=register" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 14 }}>Register</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(m => !m)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-primary)', display: 'none' }}
            className="hamburger"
          >
            <span style={{ fontSize: 18 }}>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 80, left: 0, right: 0,
          background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
          padding: 20, display: 'flex', flexDirection: 'column', gap: 8
        }}>
          {[{ path: '/', label: 'Home' }, { path: '/learning-hub', label: 'Learning Hub' }, { path: '/about', label: 'About Us' }].map(({ path, label }) => (
            <Link key={path} to={path} style={{ padding: '12px 16px', color: 'var(--text-primary)', borderRadius: 8, display: 'block' }}>{label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
