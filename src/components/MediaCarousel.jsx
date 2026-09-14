import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shuffle,
  Maximize2,
  X,
  Sparkles,
  Camera,
  Layers,
  Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const GALLERY_PHOTOS = [
  {
    id: 1,
    src: '/gallery/missa-01.jpg',
    title: 'PIONEER CDJ-3000 BOOTH',
    subtitle: 'Live mixing session & master cue control',
    tag: 'BOOTH ACTION',
    cam: 'CAM-01',
    shutter: '1/250s',
    iso: 'ISO 800'
  },
  {
    id: 2,
    src: '/gallery/missa-02.jpg',
    title: 'DARK CLUBBER ART',
    subtitle: 'Underground Tech House visual identity',
    tag: 'PORTRAIT',
    cam: 'CAM-02',
    shutter: '1/320s',
    iso: 'ISO 1200'
  },
  {
    id: 3,
    src: '/gallery/missa-03.png',
    title: 'MISSAFX STUDIO BRANDING',
    subtitle: 'Electronic music production & stage visual artwork',
    tag: 'STAGE ART',
    cam: 'CAM-03',
    shutter: '1/500s',
    iso: 'ISO 400'
  },
  {
    id: 4,
    src: '/gallery/missa-04.jpg',
    title: 'CLUB RESIDENCY & ENERGY',
    subtitle: 'Peak time club floor reading and driving basslines',
    tag: 'CLUB NIGHT',
    cam: 'CAM-04',
    shutter: '1/200s',
    iso: 'ISO 1600'
  },
  {
    id: 5,
    src: '/gallery/missa-05.jpg',
    title: 'STAGE LIGHTS & CROWD',
    subtitle: 'Hypnotic Tech House grooves & live transitions',
    tag: 'LIVE STAGE',
    cam: 'CAM-05',
    shutter: '1/250s',
    iso: 'ISO 1000'
  },
  {
    id: 6,
    src: '/gallery/missa-06.jpg',
    title: 'VIP BOOTH PERSPECTIVE',
    subtitle: 'Exclusive dancefloor connection & booth atmosphere',
    tag: 'NIGHTCLUB',
    cam: 'CAM-06',
    shutter: '1/160s',
    iso: 'ISO 2000'
  },
  {
    id: 7,
    src: '/gallery/missa-07.jpg',
    title: 'HEADLINER PERFORMANCE',
    subtitle: 'Driving basslines and crisp live percussion delivery',
    tag: 'MAIN STAGE',
    cam: 'CAM-07',
    shutter: '1/320s',
    iso: 'ISO 800'
  },
  {
    id: 8,
    src: '/gallery/missa-08.jpg',
    title: 'PEAK MOMENT // TECH HOUSE',
    subtitle: 'Crowd reaction during extended festival set',
    tag: 'PEAK TIME',
    cam: 'CAM-08',
    shutter: '1/250s',
    iso: 'ISO 1250'
  },
  {
    id: 9,
    src: '/gallery/missa-09.jpg',
    title: 'DECKS & FX PROCESSING',
    subtitle: 'Real-time roll, slip loops and filter build-ups',
    tag: 'HARDWARE',
    cam: 'CAM-09',
    shutter: '1/400s',
    iso: 'ISO 640'
  }
];

export default function MediaCarousel() {
  const { t } = useLanguage();
  const cT = t.gallery || {
    tag: 'LIVE ARCHIVE // VISUAL FEED',
    title: 'CABINA & ESCENARIOS EN VIVO',
    desc: 'Sesiones en vivo, energía de club y atmósfera de cabina en alta resolución. Rotación aleatoria cada 7 segundos.',
    camLive: 'EN VIVO',
    shutterLabel: 'OBTURACIÓN',
    audioLink: 'PRO DJ LINK • 48kHz',
    photoCounter: 'FOTO',
    pauseHint: 'Pausar rotación',
    playHint: 'Reanudar rotación (7s)',
    shuffleHint: 'Foto aleatoria'
  };

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Smart non-repeating shuffle deck
  const unplayedRef = useRef([...Array(GALLERY_PHOTOS.length).keys()].sort(() => Math.random() - 0.5));

  const getNextRandomIndex = useCallback((currentIdx) => {
    if (unplayedRef.current.length === 0) {
      unplayedRef.current = [...Array(GALLERY_PHOTOS.length).keys()].sort(() => Math.random() - 0.5);
    }
    if (unplayedRef.current[0] === currentIdx && unplayedRef.current.length > 1) {
      const temp = unplayedRef.current.shift();
      unplayedRef.current.push(temp);
    }
    return unplayedRef.current.shift();
  }, []);

  // Trigger transition with "transición bien perra"
  const triggerTransition = useCallback((nextIdx) => {
    if (nextIdx === currentIndex || isTransitioning) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(nextIdx);
    setIsTransitioning(true);
    setProgressKey(Date.now());

    setTimeout(() => {
      setIsTransitioning(false);
      setPrevIndex(null);
    }, 750);
  }, [currentIndex, isTransitioning]);

  // 7-second timer for random rotation
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      triggerTransition(getNextRandomIndex(currentIndex));
    }, 7000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, getNextRandomIndex, triggerTransition]);

  // Navigation handlers
  const handleNext = () => {
    triggerTransition(getNextRandomIndex(currentIndex));
  };

  const handlePrev = () => {
    const prev = currentIndex === 0 ? GALLERY_PHOTOS.length - 1 : currentIndex - 1;
    triggerTransition(prev);
  };

  const handleShuffle = () => {
    triggerTransition(getNextRandomIndex(currentIndex));
  };

  const currentPhoto = GALLERY_PHOTOS[currentIndex];
  const prevPhoto = prevIndex !== null ? GALLERY_PHOTOS[prevIndex] : null;

  return (
    <section id="gallery" style={{ position: 'relative', padding: '100px 0 90px', overflow: 'hidden' }}>
      {/* Background ambient red glow */}
      <div
        className="ambient-glow"
        style={{
          top: '30%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'rgba(255, 0, 60, 0.08)'
        }}
      />
      <div
        className="ambient-glow"
        style={{
          bottom: '10%',
          left: '5%',
          width: '450px',
          height: '450px',
          background: 'rgba(0, 240, 255, 0.04)'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={14} color="#FF003C" className="pulse-dot" />
            {cT.tag}
          </span>
          <h2>
            {cT.title}
          </h2>
          <p>
            {cT.desc}
          </p>
        </div>

        {/* Cyberpunk Main Carousel Card */}
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 0, 60, 0.35)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(255, 0, 60, 0.15)',
            background: 'linear-gradient(180deg, rgba(16, 16, 22, 0.7) 0%, rgba(6, 6, 8, 0.98) 100%)'
          }}
        >
          {/* Top Cyberpunk Toolbar */}
          <div
            style={{
              padding: '14px 22px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(10, 10, 14, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Left: REC Tag & Cam metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 0, 60, 0.15)',
                  border: '1px solid rgba(255, 0, 60, 0.4)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  color: '#FF003C',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#FF003C',
                    boxShadow: '0 0 8px #FF003C',
                    animation: 'pulseAnimation 1.5s infinite'
                  }}
                />
                <span>REC // {currentPhoto.cam}</span>
              </div>

              <span
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-dim)',
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}
              >
                {currentPhoto.shutter} • {currentPhoto.iso}
              </span>
            </div>

            {/* Center: Live 7s Audio / Sync Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="eq-bars" style={{ height: '14px' }}>
                <span className="eq-bar" />
                <span className="eq-bar" />
                <span className="eq-bar" />
                <span className="eq-bar" />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#E2E8F0',
                  fontFamily: 'monospace',
                  letterSpacing: '0.06em',
                  fontWeight: 700
                }}
              >
                [ 0{currentPhoto.id} / 0{GALLERY_PHOTOS.length} ]
              </span>
            </div>

            {/* Right: Quick Action Controls (Shuffle, Pause/Play, Maximize) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleShuffle}
                title={cT.shuffleHint}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: '#FF003C',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                <Shuffle size={14} />
                <span>RANDOM</span>
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? cT.playHint : cT.pauseHint}
                style={{
                  background: isPaused ? 'rgba(83, 252, 24, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: isPaused ? '1px solid #53FC18' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: isPaused ? '#53FC18' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease'
                }}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{isPaused ? 'PLAY (7s)' : 'PAUSA'}</span>
              </button>

              <button
                onClick={() => setLightboxPhoto(currentPhoto)}
                title="Ver en pantalla completa"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Photo Display Stage */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              minHeight: '360px',
              maxHeight: '620px',
              overflow: 'hidden',
              background: '#060608',
              cursor: 'pointer'
            }}
            onClick={() => setLightboxPhoto(currentPhoto)}
          >
            {/* Laser scanline that sweeps across during transition */}
            {isTransitioning && <div className="carousel-laser-scan" />}

            {/* PREVIOUS SLIDE (glitch exit animation) */}
            {prevPhoto && isTransitioning && (
              <img
                key={`prev-${prevPhoto.id}`}
                src={prevPhoto.src}
                alt={prevPhoto.title}
                className="carousel-slide-exit"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 25%'
                }}
              />
            )}

            {/* CURRENT ACTIVE SLIDE */}
            <img
              key={`curr-${currentPhoto.id}-${progressKey}`}
              src={currentPhoto.src}
              alt={currentPhoto.title}
              className={isTransitioning ? 'carousel-slide-enter' : 'carousel-ken-burns'}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 25%',
                filter: 'contrast(1.06) brightness(0.96)'
              }}
            />

            {/* Cinematic Vignette Overlays */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(6, 6, 8, 0.95) 0%, rgba(6, 6, 8, 0.2) 40%, transparent 60%), linear-gradient(to bottom, rgba(6, 6, 8, 0.7) 0%, transparent 35%)',
                pointerEvents: 'none',
                zIndex: 4
              }}
            />

            {/* Cyberpunk Crosshairs */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '24px',
                height: '24px',
                borderTop: '2px solid #FF003C',
                borderLeft: '2px solid #FF003C',
                pointerEvents: 'none',
                zIndex: 5
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: '24px',
                height: '24px',
                borderBottom: '2px solid #FF003C',
                borderRight: '2px solid #FF003C',
                pointerEvents: 'none',
                zIndex: 5
              }}
            />

            {/* Navigation Arrows on Left & Right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Foto anterior"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 8,
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(10, 10, 14, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF003C';
                e.currentTarget.style.color = '#FF003C';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(255,0,60,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Siguiente foto"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 8,
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(10, 10, 14, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF003C';
                e.currentTarget.style.color = '#FF003C';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(255,0,60,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
              }}
            >
              <ChevronRight size={22} />
            </button>

            {/* Bottom Caption Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                zIndex: 6,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                pointerEvents: 'none'
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    background: 'rgba(255, 0, 60, 0.2)',
                    border: '1px solid rgba(255, 0, 60, 0.4)',
                    color: '#FF003C',
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    marginBottom: '6px'
                  }}
                >
                  {currentPhoto.tag}
                </span>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 'clamp(1.2rem, 2.8vw, 1.8rem)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    marginBottom: '4px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                  }}
                >
                  {currentPhoto.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: '#CBD5E1',
                    margin: 0,
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                  }}
                >
                  {currentPhoto.subtitle}
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(10, 10, 14, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={14} color="#FF003C" />
                <span style={{ fontSize: '0.74rem', color: '#fff', fontWeight: 600 }}>
                  Click para zoom HD
                </span>
              </div>
            </div>
          </div>

          {/* 7-SECOND PROGRESS BAR */}
          <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.08)' }}>
            <div
              key={`progress-${currentIndex}-${progressKey}`}
              className={`carousel-countdown-bar ${isPaused ? '' : 'running'}`}
              style={{
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            />
          </div>

          {/* Thumbnail Strip Dock */}
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(10, 10, 14, 0.95)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {GALLERY_PHOTOS.map((photo, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={photo.id}
                  onClick={() => triggerTransition(idx)}
                  style={{
                    position: 'relative',
                    flexShrink: 0,
                    width: '74px',
                    height: '52px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: isSelected
                      ? '2px solid #FF003C'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isSelected
                      ? '0 0 14px rgba(255, 0, 60, 0.6)'
                      : 'none',
                    background: '#060608',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isSelected ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '3px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontSize: '0.62rem',
                      color: isSelected ? '#FF003C' : '#fff',
                      fontWeight: 800,
                      fontFamily: 'monospace'
                    }}
                  >
                    0{idx + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(4, 4, 6, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setLightboxPhoto(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxPhoto(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={20} />
          </button>

          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 0, 60, 0.4)',
              boxShadow: '0 0 60px rgba(255, 0, 60, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.src}
              alt={lightboxPhoto.title}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '16px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>
                  {lightboxPhoto.title}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
                  {lightboxPhoto.subtitle}
                </p>
              </div>
              <span style={{ color: '#FF003C', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace' }}>
                {lightboxPhoto.cam} • {lightboxPhoto.shutter}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
