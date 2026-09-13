import React, { useState, useEffect } from 'react';
import { Menu, X, Disc3, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: isScrolled ? 'rgba(7, 7, 11, 0.85)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        padding: isScrolled ? '14px 0' : '24px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <a
          href="#home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
            }}
          >
            <Disc3 size={22} color="#fff" style={{ animation: 'spin 12s linear infinite' }} />
          </div>
          <span
            className="font-display"
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '0.05em'
            }}
          >
            MISSA<span style={{ color: 'var(--accent-purple)' }}>.FX</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px'
          }}
          className="desktop-nav"
        >
          <a href="#music" className="nav-link">Música</a>
          <a href="#tour" className="nav-link">Tour / Fechas</a>
          <a href="#about" className="nav-link">Biografía</a>
          <a href="#booking" className="nav-link">Booking</a>
          <a href="#booking" className="btn btn-primary btn-sm">
            <Sparkles size={16} /> Contratar
          </a>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '8px'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'rgba(10, 10, 18, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <a
            href="#music"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Música
          </a>
          <a
            href="#tour"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Tour / Fechas
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Biografía
          </a>
          <a
            href="#booking"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Booking & Contacto
          </a>
          <a
            href="#booking"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            <Sparkles size={18} /> Contrataciones Directas
          </a>
        </div>
      )}

      <style>{`
        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: #fff;
        }
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
