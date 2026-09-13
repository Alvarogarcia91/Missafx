import React from 'react';
import { Disc3, Heart, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(5, 5, 8, 0.95)',
        padding: '60px 0 30px 0',
        position: 'relative'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '40px'
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--gradient-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Disc3 size={20} color="#fff" />
            </div>
            <div>
              <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
                MISSA<span style={{ color: 'var(--accent-purple)' }}>.FX</span>
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Official Electronic Music & DJ Landing Page
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { name: 'Instagram', url: 'https://instagram.com' },
              { name: 'Spotify', url: 'https://spotify.com' },
              { name: 'SoundCloud', url: 'https://soundcloud.com' },
              { name: 'YouTube', url: 'https://youtube.com' },
              { name: 'Beatport', url: 'https://beatport.com' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                {social.name}
              </a>
            ))}
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="btn btn-secondary"
            style={{
              width: '42px',
              height: '42px',
              padding: 0,
              borderRadius: '50%'
            }}
            aria-label="Volver arriba"
          >
            <ArrowUp size={18} />
          </button>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-dim)',
            gap: '12px'
          }}
        >
          <p>© {new Date().getFullYear()} DJ Missa (Missafx). Todos los derechos reservados.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Diseñado y optimizado para alto rendimiento en Docker & DigitalOcean.
          </p>
        </div>
      </div>
    </footer>
  );
}
