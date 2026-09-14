import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, Sparkles } from 'lucide-react';

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
        background: isScrolled ? 'rgba(6, 6, 8, 0.88)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        padding: isScrolled ? '14px 0' : '22px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <a
          href="#home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none'
          }}
        >
          <img
            src="/missafx-logo.png"
            alt="MISSAFX"
            style={{
              height: '34px',
              width: 'auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
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
          <a href="#home" className="nav-link">Inicio</a>
          <a href="#social-hub" className="nav-link">Redes Oficiales</a>
          <a href="#music" className="nav-link">Música & Sets</a>
          <a href="#about" className="nav-link">Bio & Rider</a>
          <a href="#contact" className="nav-link">Contacto</a>
          <a
            href="https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
            style={{ gap: '8px' }}
          >
            <MessageCircle size={16} /> WhatsApp Directo
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
            background: 'rgba(8, 8, 12, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <a
            href="#home"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Inicio
          </a>
          <a
            href="#social-hub"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Redes Oficiales
          </a>
          <a
            href="#music"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Música & Sets
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Bio & Rider
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            Contacto Directo
          </a>
          <a
            href="https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            <MessageCircle size={18} /> Contactar por WhatsApp
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
      `}</style>
    </header>
  );
}
