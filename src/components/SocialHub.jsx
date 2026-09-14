import React from 'react';
import { ExternalLink, Play, Radio, Video, Instagram, MessageCircle, Music } from 'lucide-react';

const SOCIAL_CHANNELS = [
  {
    name: 'SoundCloud',
    tag: 'Sesiones & Tracks',
    handle: 'soundcloud.com/missael-arath',
    url: 'https://soundcloud.com/missael-arath',
    description: 'Escucha los últimos sets completos, mezclas exclusivas y tracks de Tech House.',
    color: '#FF5500',
    icon: Music,
    cta: 'Escuchar en SoundCloud'
  },
  {
    name: 'Kick Live Stream',
    tag: 'En Directo',
    handle: 'kick.com/7missa',
    url: 'https://kick.com/7missa',
    description: 'Transmisiones en vivo, sesiones espontáneas de mezcla y directos interactivos.',
    color: '#53FC18',
    icon: Radio,
    cta: 'Sintonizar Kick'
  },
  {
    name: 'Instagram',
    tag: 'Comunidad & Fechas',
    handle: '@missaa.fx',
    url: 'https://www.instagram.com/missaa.fx/',
    description: 'Sigue el día a día en cabina, backstages de toquines y anuncios oficiales.',
    color: '#E1306C',
    icon: Instagram,
    cta: 'Seguir en Instagram'
  },
  {
    name: 'YouTube',
    tag: 'Videos & Live Sets',
    handle: '@missaelarath6364',
    url: 'https://www.youtube.com/@missaelarath6364',
    description: 'Grabaciones de sets en vivo, videos de presentaciones y contenido audiovisual.',
    color: '#FF0000',
    icon: Video,
    cta: 'Ver Canal de YouTube'
  }
];

export default function SocialHub() {
  return (
    <section id="social-hub" style={{ padding: '90px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">ECOSISTEMA DIGITAL</span>
          <h2>REDES & CANALES OFICIALES</h2>
          <p>
            Sigue la actividad de Missafx en tiempo real a través de sus plataformas de streaming, música y contenido.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '24px'
          }}
        >
          {SOCIAL_CHANNELS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="glass-panel"
                style={{
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Accent top border highlight */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: item.color,
                    opacity: 0.85
                  }}
                />

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px'
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: item.color,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: `${item.color}10`,
                        border: `1px solid ${item.color}25`
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3
                    className="font-display"
                    style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '4px' }}
                  >
                    {item.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-dim)',
                      marginBottom: '14px',
                      fontFamily: 'monospace'
                    }}
                  >
                    {item.handle}
                  </p>

                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      marginBottom: '28px'
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    borderColor: `${item.color}30`
                  }}
                >
                  <span>{item.cta}</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
