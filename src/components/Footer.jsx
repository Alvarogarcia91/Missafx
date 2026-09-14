import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { InstagramIcon, WhatsAppIcon, KickIcon, YouTubeIcon, SoundCloudIcon } from './SocialIcons';

export default function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(5, 5, 8, 0.98)',
        padding: '60px 0 26px 0',
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
              {t.footer.tagline}
            </span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { name: 'Instagram', url: 'https://www.instagram.com/missaa.fx/', color: '#E1306C', icon: InstagramIcon },
              { name: 'WhatsApp', url: 'https://wa.me/5214443570777', color: '#25D366', icon: WhatsAppIcon },
              { name: 'Kick', url: 'https://kick.com/7missa', color: '#53FC18', icon: KickIcon },
              { name: 'YouTube', url: 'https://www.youtube.com/@missaelarath6364', color: '#FF0000', icon: YouTubeIcon },
              { name: 'SoundCloud', url: 'https://soundcloud.com/missael-arath', color: '#FF5500', icon: SoundCloudIcon }
            ].map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.82rem',
                    padding: '8px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Icon size={16} color={social.name === 'Instagram' ? 'gradient' : (social.name === 'WhatsApp' ? '#25D366' : (social.name === 'SoundCloud' ? '#FF5500' : undefined))} />
                  <span>{social.name}</span>
                </a>
              );
            })}
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

        {/* Legal & Booking bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-dim)',
            gap: '12px'
          }}
        >
          <p>© {new Date().getFullYear()} {t.footer.rights}</p>
          <p>
            {t.footer.bookingContact} <a href="tel:+5214443570777" style={{ color: '#FF003C', textDecoration: 'none' }}>+52 1 444 357 0777</a>
          </p>
        </div>

        {/* Discreet Credit Bar: "bn sordo By Nexora IT LLC www.itnexora.com" */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            paddingTop: '16px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '0.74rem',
            color: 'rgba(255, 255, 255, 0.30)',
            letterSpacing: '0.04em'
          }}
        >
          <span>
            By{' '}
            <a
              href="https://www.itnexora.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#FF003C'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.45)'}
            >
              Nexora IT LLC
            </a>
            {' '}—{' '}
            <a
              href="https://www.itnexora.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.32)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.32)'}
            >
              www.itnexora.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
