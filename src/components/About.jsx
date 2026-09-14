import React from 'react';
import { Sliders, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { WhatsAppIcon } from './SocialIcons';

export default function About() {
  const { t } = useLanguage();
  const whatsappUrl = "https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20solicitar%20el%20Press%20Kit%20completo%20y%20Rider";

  return (
    <section id="about" style={{ padding: '90px 0', position: 'relative' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Artist Bio */}
          <div>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '26px' }}>
              <span className="section-tag">{t.about.tag}</span>
              <h2>{t.about.title}</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '18px', lineHeight: 1.8 }}>
              {t.about.bio1}
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.8 }}>
              {t.about.bio2}
            </p>

            {/* Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
              }}
            >
              <div className="glass-panel" style={{ padding: '18px 20px' }}>
                <Headphones size={22} color="#FF003C" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>{t.about.highlight1Title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{t.about.highlight1Desc}</p>
              </div>

              <div className="glass-panel" style={{ padding: '18px 20px' }}>
                <Sliders size={22} color="#FF003C" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>{t.about.highlight2Title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{t.about.highlight2Desc}</p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ gap: '10px' }}
            >
              <WhatsAppIcon size={18} /> {t.about.pressKitBtn}
            </a>
          </div>

          {/* Right Column: Missa Photo & Technical Rider for Event Organizers */}
          <div>
            {/* Featured Photo: Capture2 Artwork */}
            <div
              className="glass-panel"
              style={{
                overflow: 'hidden',
                borderRadius: '20px',
                border: '1px solid rgba(255, 0, 60, 0.3)',
                position: 'relative',
                marginBottom: '28px',
                boxShadow: '0 20px 45px rgba(0,0,0,0.7)',
                background: 'linear-gradient(180deg, rgba(20, 18, 24, 0.9) 0%, rgba(10, 10, 14, 0.98) 100%)'
              }}
            >
              <img
                src="/missa-capture-2.jpg"
                alt="Missa DJ Live Set"
                style={{
                  width: '100%',
                  maxHeight: '340px',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                  filter: 'contrast(1.06) brightness(0.96)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  background: 'rgba(6, 6, 10, 0.88)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
                  MISSAFX • TECH HOUSE
                </span>
                <span style={{ fontSize: '0.74rem', color: '#FF003C', fontWeight: 700 }}>
                  CLUB SESSIONS ARCHIVE
                </span>
              </div>
            </div>
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(20, 18, 24, 0.95) 0%, rgba(10, 10, 14, 0.98) 100%)',
                border: '1px solid rgba(255, 0, 60, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255, 0, 60, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF003C'
                  }}
                >
                  <Sliders size={22} />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#fff' }}>
                    {t.about.riderTitle}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t.about.riderSubtitle}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '26px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF003C' }} />
                  {t.about.rider1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF003C' }} />
                  {t.about.rider2}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF003C' }} />
                  {t.about.rider3}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF003C' }} />
                  {t.about.rider4}
                </li>
              </ul>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t.about.riderQuestion}
                </span>
                <a
                  href="https://wa.me/5214443570777?text=Hola%20Missa,%20quisiera%20consultar%20detalles%20t%C3%A9cnicos%20para%20un%20evento"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    color: '#FF003C',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginTop: '6px',
                    textDecoration: 'none'
                  }}
                >
                  {t.about.riderAction}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
