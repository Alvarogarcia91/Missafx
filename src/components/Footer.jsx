import React from 'react';
import { ArrowUp, Music, Instagram, Video, Radio, MessageCircle } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(5, 5, 8, 0.98)',
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
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/missafx-logo.png"
              alt="MISSAFX"
              style={{ height: '32px', width: 'auto', display: 'block' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', borderLeft: '1px solid var(--border-glass)', paddingLeft: '14px' }}>
              DJ & Electronic Music Producer
            </span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { name: 'Instagram', url: 'https://www.instagram.com/missaa.fx/', color: '#E1306C' },
              { name: 'SoundCloud', url: 'https://soundcloud.com/missael-arath', color: '#FF5500' },
              { name: 'Kick', url: 'https://kick.com/7missa', color: '#53FC18' },
              { name: 'YouTube', url: 'https://www.youtube.com/@missaelarath6364', color: '#FF0000' },
              { name: 'WhatsApp', url: 'https://wa.me/5214443570777', color: '#25D366' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: social.color, display: 'inline-block' }} />
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
          <p>© {new Date().getFullYear()} Missafx. Sitio Oficial Representativo.</p>
          <p>
            Contacto directo de booking: <a href="tel:+5214443570777" style={{ color: '#FF003C', textDecoration: 'none' }}>+52 1 444 357 0777</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
