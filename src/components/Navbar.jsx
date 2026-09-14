import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

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
        padding: isScrolled ? '14px 0' : '20px 0'
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
            gap: '26px'
          }}
          className="desktop-nav"
        >
          <a href="#home" className="nav-link">{t.nav.home}</a>
          <a href="#social-hub" className="nav-link">{t.nav.socials}</a>
          <a href="#music" className="nav-link">{t.nav.music}</a>
          <a href="#about" className="nav-link">{t.nav.about}</a>
          <a href="#contact" className="nav-link">{t.nav.contact}</a>

          {/* Language Selector Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '999px',
              padding: '3px',
              border: '1px solid var(--border-glass)',
              gap: '2px'
            }}
          >
            <button
              onClick={() => setLang('es')}
              aria-label="Cambiar a Español"
              style={{
                background: lang === 'es' ? '#FF003C' : 'transparent',
                color: lang === 'es' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              aria-label="Switch to English"
              style={{
                background: lang === 'en' ? '#FF003C' : 'transparent',
                color: lang === 'en' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              EN
            </button>
          </div>

          <a
            href="https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
            style={{ gap: '8px' }}
          >
            <MessageCircle size={16} /> {t.nav.whatsapp}
          </a>
        </nav>

        {/* Mobile Controls: Language + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mobile-toggle-group">
          {/* Mobile Language Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '999px',
              padding: '2px',
              border: '1px solid var(--border-glass)'
            }}
            className="mobile-lang-pill"
          >
            <button
              onClick={() => setLang('es')}
              style={{
                background: lang === 'es' ? '#FF003C' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                background: lang === 'en' ? '#FF003C' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              EN
            </button>
          </div>

          {/* Hamburger Toggle */}
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
            {t.nav.home}
          </a>
          <a
            href="#social-hub"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            {t.nav.socials}
          </a>
          <a
            href="#music"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            {t.nav.music}
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            {t.nav.about}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: '1.1rem' }}
          >
            {t.nav.contact}
          </a>
          <a
            href="https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            <MessageCircle size={18} /> {t.nav.whatsapp}
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
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle-group {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
