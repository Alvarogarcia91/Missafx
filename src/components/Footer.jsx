import React from 'react';
import { ArrowUp, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { InstagramIcon, WhatsAppIcon, KickIcon, YouTubeIcon, SoundCloudIcon } from './SocialIcons';
import { recordNexoraClick } from '../utils/supabaseClient';

export default function Footer({ onOpenAdmin }) {
  const { t } = useLanguage();
  const { config } = useSiteConfig();

  const logoSrc = config.logoUrl || '/missafx-logo.png';
  const brandName = `${config.artistName1 || 'MISSA'}${config.artistName2 || 'FX'}`;
  const tagline = config.footerTagline || t.footer.tagline;
  const bookingPhone = config.bookingPhone || '5214443570777';
  const instagramUrl = `https://www.instagram.com/${config.instagramUser || 'missaa.fx'}/`;
  const kickUrl = `https://kick.com/${config.kickChannel || '7missa'}`;
  const youtubeUrl = config.youtubeUrl || 'https://www.youtube.com/@missaelarath6364';
  const soundcloudUrl = config.soundcloudUrl || 'https://soundcloud.com/missael-arath';

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
              src={logoSrc}
              alt={brandName}
              style={{ height: '32px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', borderLeft: '1px solid var(--border-glass)', paddingLeft: '14px' }}>
              {tagline}
            </span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { name: 'Instagram', url: instagramUrl, color: '#E1306C', icon: InstagramIcon },
              { name: 'WhatsApp', url: `https://wa.me/${bookingPhone}`, color: '#25D366', icon: WhatsAppIcon },
              { name: 'Kick', url: kickUrl, color: '#53FC18', icon: KickIcon },
              { name: 'YouTube', url: youtubeUrl, color: '#FF0000', icon: YouTubeIcon },
              { name: 'SoundCloud', url: soundcloudUrl, color: '#FF5500', icon: SoundCloudIcon }
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

        {/* Discreet Credit Bar: "bn sordo By Nexora IT LLC itnexora.com" + Admin Gear */}
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
            letterSpacing: '0.04em',
            position: 'relative'
          }}
        >
          <span>
            By{' '}
            <a
              href="https://itnexora.com/"
              target="_blank"
              rel="noreferrer"
              onClick={() => recordNexoraClick()}
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
              href="https://itnexora.com/"
              target="_blank"
              rel="noreferrer"
              onClick={() => recordNexoraClick()}
              style={{
                color: 'rgba(255, 255, 255, 0.32)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.32)'}
            >
              itnexora.com
            </a>
          </span>

          {/* Discreet Admin Gear for Missa */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              aria-label="Gestor de Eventos"
              title="Administración de Eventos // Missafx"
              style={{
                position: 'absolute',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.20)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF003C';
                e.currentTarget.style.transform = 'rotate(45deg) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.20)';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1.0)';
              }}
            >
              <Settings size={15} />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
