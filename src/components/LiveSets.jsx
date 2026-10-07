import React, { useState, useEffect } from 'react';
import { Play, X, ExternalLink, Radio, Tv, Sparkles } from 'lucide-react';
import { fetchSets, DEFAULT_SETS } from '../utils/supabaseClient';

export default function LiveSets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const loadSets = async () => {
    setLoading(true);
    try {
      const data = await fetchSets();
      if (data && data.length > 0) {
        setSets(data);
      } else {
        setSets(DEFAULT_SETS);
      }
    } catch (e) {
      console.warn('Error loading sets:', e);
      setSets(DEFAULT_SETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();

    const handleUpdate = () => loadSets();
    window.addEventListener('missafx-sets-updated', handleUpdate);
    return () => window.removeEventListener('missafx-sets-updated', handleUpdate);
  }, []);

  // Close cinema lightbox on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    if (activeVideo) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);

  if (!loading && sets.length === 0) {
    return null;
  }

  return (
    <section
      id="live-sets"
      style={{
        padding: '90px 0 80px 0',
        background: 'linear-gradient(180deg, rgba(8, 8, 12, 0.98) 0%, rgba(14, 14, 20, 0.98) 50%, rgba(8, 8, 12, 1) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Cyber Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 0, 60, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(255, 0, 60, 0.10)',
              border: '1px solid rgba(255, 0, 60, 0.35)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#FF003C',
              textTransform: 'uppercase',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(255, 0, 60, 0.15)'
            }}
          >
            <Radio size={14} color="#FF003C" />
            LIVE SESSIONS // CABINA & TOQUINES
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 900,
              fontFamily: '"Syne", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              margin: '0 0 14px 0',
              color: '#FFFFFF'
            }}
          >
            SESIONES & <span style={{ color: '#FF003C', textShadow: '0 0 24px rgba(255, 0, 60, 0.6)' }}>LIVE SETS</span>
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted, #94a3b8)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Grabaciones en vivo, back-to-backs y sesiones completas de Tech House y Melodic Techno. Selecciona cualquier set para reproducirlo en alta definición.
          </p>
        </div>

        {/* Video Sets Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            maxWidth: '1100px',
            margin: '0 auto'
          }}
        >
          {sets.map((item) => {
            const thumbUrl = `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`;
            const fallbackThumb = `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`;

            return (
              <div
                key={item.id}
                onClick={() => setActiveVideo(item)}
                style={{
                  background: 'rgba(18, 18, 24, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 0, 60, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(255, 0, 60, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
                }}
              >
                {/* 16:9 Thumbnail Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    background: '#060608',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={thumbUrl}
                    onError={(e) => {
                      // Fallback if maxresdefault doesn't exist on YouTube
                      if (e.target.src !== fallbackThumb) {
                        e.target.src = fallbackThumb;
                      }
                    }}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
                  />

                  {/* Dark Vignette Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(255, 0, 0, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '0.70rem',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.06em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>YOUTUBE // HD</span>
                  </div>

                  {item.subtitle && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {item.subtitle}
                    </div>
                  )}

                  {/* Glowing Play Icon Center */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(255, 0, 60, 0.90)',
                      boxShadow: '0 0 25px rgba(255, 0, 60, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transition: 'transform 0.25s ease, background 0.25s ease'
                    }}
                  >
                    <Play size={26} fill="#FFFFFF" style={{ marginLeft: '4px' }} />
                  </div>
                </div>

                {/* Card Meta Content */}
                <div
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    flex: 1,
                    justifyContent: 'space-between',
                    background: 'rgba(14, 14, 20, 0.98)'
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        fontFamily: '"Syne", sans-serif',
                        color: '#FFFFFF',
                        margin: '0 0 6px 0',
                        lineHeight: 1.4,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '0.80rem', color: '#94a3b8', fontWeight: 600 }}>
                      {item.subtitle || 'MISSAFX OFFICIAL SET'}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#FF003C'
                    }}
                  >
                    <span>Reproducir en Modo Cine</span>
                    <Play size={14} fill="#FF003C" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cinema Mode Lightbox (Only mounts iframe when user explicitly clicks a set) */}
      {activeVideo && (
        <div
          onClick={() => setActiveVideo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(16px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0c0c10',
              border: '1px solid rgba(255, 0, 60, 0.4)',
              boxShadow: '0 0 60px rgba(255, 0, 60, 0.3)'
            }}
          >
            {/* Lightbox Header Bar */}
            <div
              style={{
                padding: '14px 20px',
                background: 'rgba(18, 18, 24, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    fontFamily: '"Syne", sans-serif',
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {activeVideo.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  {activeVideo.subtitle || 'MISSAFX LIVE SESSION'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtube_id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Abrir en YouTube"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => setActiveVideo(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Responsive 16:9 Video Player */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 ratio
                background: '#000000'
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
