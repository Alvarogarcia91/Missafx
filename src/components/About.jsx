import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sliders, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { WhatsAppIcon } from './SocialIcons';
import { PhotoQueueManager } from '../utils/shuffleQueue';
import {
  fetchCarouselData,
  DEFAULT_CAROUSEL_PHOTOS,
  isVideoMedia,
  parseCarouselItemMeta,
  getObjectPositionCss,
  getCleanCarouselUrl,
  preloadCarouselMedia
} from '../utils/supabaseClient';

export default function About() {
  const { t } = useLanguage();
  const { config } = useSiteConfig();
  const bookingPhone = config.bookingPhone || '5214443570777';
  const whatsappUrl = `https://wa.me/${bookingPhone}?text=Hola%20Missa,%20me%20gustar%C3%ADa%20solicitar%20el%20Press%20Kit%20completo%20y%20Rider`;

  const [photos, setPhotos] = useState(DEFAULT_CAROUSEL_PHOTOS);
  const [isRandom, setIsRandom] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(3);
  const [prevPhotoIndex, setPrevPhotoIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  const queueManager = useRef(null);
  const currentIdxRef = useRef(3);
  currentIdxRef.current = photoIndex;

  const currentItem = photos[photoIndex % photos.length] || photos[0];
  const currentMeta = parseCarouselItemMeta(currentItem);
  const isCurrentVideo = isVideoMedia(currentMeta.cleanUrl);

  const prevItem = prevPhotoIndex !== null && photos[prevPhotoIndex] ? photos[prevPhotoIndex] : null;
  const prevMeta = prevItem ? parseCarouselItemMeta(prevItem) : null;
  const isPrevVideo = prevMeta ? isVideoMedia(prevMeta.cleanUrl) : false;

  const loadPhotos = async () => {
    try {
      const data = await fetchCarouselData();
      if (data && Array.isArray(data.photos) && data.photos.length > 0) {
        setPhotos(data.photos);
        setIsRandom(Boolean(data.isRandom));
        queueManager.current = new PhotoQueueManager(data.photos.length, Math.min(3, data.photos.length - 1));
      }
    } catch (e) {
      console.warn('Error loading carousel photos in About:', e);
    }
  };

  useEffect(() => {
    loadPhotos();

    const handleUpdate = () => loadPhotos();
    window.addEventListener('missafx-carousel-updated', handleUpdate);
    return () => window.removeEventListener('missafx-carousel-updated', handleUpdate);
  }, []);

  if (!queueManager.current) {
    queueManager.current = new PhotoQueueManager(photos.length, Math.min(3, photos.length - 1));
  }

  const triggerAboutTransition = useCallback((nextIdx) => {
    setPhotoIndex((currentIdx) => {
      if (nextIdx === currentIdx) return currentIdx;
      setPrevPhotoIndex(currentIdx);
      setIsTransitioning(true);
      setProgressKey(Date.now());
      setTimeout(() => {
        setIsTransitioning(false);
        setPrevPhotoIndex(null);
      }, 750);
      return nextIdx;
    });
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      if (isRandom) {
        if (queueManager.current) {
          const nextIdx = queueManager.current.next();
          triggerAboutTransition(nextIdx);
        }
      } else {
        const nextIdx = (currentIdxRef.current + 1) % photos.length;
        triggerAboutTransition(nextIdx);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [photos, isRandom, triggerAboutTransition]);

  // Preload upcoming slides and manage smooth loading state
  useEffect(() => {
    setIsMediaLoading(true);
    if (!photos || photos.length === 0) return;
    const next1 = photos[(photoIndex + 1) % photos.length];
    const next2 = photos[(photoIndex + 2) % photos.length];
    preloadCarouselMedia([next1, next2]);
  }, [photos, photoIndex, progressKey]);

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
              <h2>{config.artistName1 ? `${config.artistName1}${config.artistName2 || ''} / BIO & TRAYECTORIA` : t.about.title}</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '18px', lineHeight: 1.8 }}>
              {config.aboutBio1 || t.about.bio1}
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.8 }}>
              {config.aboutBio2 || t.about.bio2}
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
            {/* Featured Carousel: 10s Random Clean Photo Showcase */}
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
              <div
                style={{
                  display: 'block',
                  position: 'relative',
                  width: '100%',
                  height: '340px',
                  overflow: 'hidden'
                }}
              >
                {/* Laser scanline that sweeps across during transition */}
                {isTransitioning && <div className="carousel-laser-scan" />}

                {/* Cinema Fit Mode: Ambient Blur Backdrop */}
                {currentMeta.fit === 'contain' && (
                  <div style={{ position: 'absolute', inset: -15, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
                    {isCurrentVideo ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'radial-gradient(circle at center, rgba(255, 0, 60, 0.3) 0%, rgba(14, 14, 20, 0.96) 75%)',
                          filter: 'blur(20px)'
                        }}
                      />
                    ) : (
                      <img
                        src={currentMeta.cleanUrl}
                        alt=""
                        loading="eager"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'blur(28px) brightness(0.42) saturate(1.4)',
                          transform: 'scale(1.2)'
                        }}
                      />
                    )}
                  </div>
                )}

                {/* PREVIOUS SLIDE (glitch exit animation) */}
                {prevPhotoIndex !== null && isTransitioning && prevMeta && (
                  isPrevVideo ? (
                    <video
                      key={`about-prev-${prevPhotoIndex}`}
                      src={prevMeta.cleanUrl}
                      muted
                      playsInline
                      className="carousel-slide-exit"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: prevMeta.fit,
                        objectPosition: getObjectPositionCss(prevMeta.pos),
                        zIndex: 2,
                        pointerEvents: 'none'
                      }}
                    />
                  ) : (
                    <img
                      key={`about-prev-${prevPhotoIndex}`}
                      src={prevMeta.cleanUrl}
                      alt="DJ Missa"
                      loading="eager"
                      decoding="async"
                      className="carousel-slide-exit"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: prevMeta.fit,
                        objectPosition: getObjectPositionCss(prevMeta.pos),
                        zIndex: 2,
                        pointerEvents: 'none'
                      }}
                    />
                  )
                )}

                {/* CURRENT ACTIVE SLIDE */}
                {isCurrentVideo ? (
                  <video
                    key={`about-curr-${photoIndex}-${progressKey}`}
                    src={currentMeta.cleanUrl}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onCanPlay={() => setIsMediaLoading(false)}
                    onLoadedData={() => setIsMediaLoading(false)}
                    onWaiting={() => setIsMediaLoading(true)}
                    onError={() => setIsMediaLoading(false)}
                    onLoadedMetadata={(e) => {
                      if (currentMeta.startTime && currentMeta.startTime > 0) {
                        try { e.target.currentTime = currentMeta.startTime; } catch (err) {}
                      }
                    }}
                    onTimeUpdate={(e) => {
                      if (currentMeta.endTime && currentMeta.endTime > 0 && e.target.currentTime >= currentMeta.endTime) {
                        e.target.pause();
                        e.target.currentTime = currentMeta.endTime;
                      }
                    }}
                    onEnded={(e) => e.target.pause()}
                    className={isTransitioning ? 'carousel-slide-enter' : (currentMeta.fit === 'contain' ? '' : 'carousel-ken-burns')}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: currentMeta.fit,
                      objectPosition: getObjectPositionCss(currentMeta.pos),
                      filter: currentMeta.fit === 'contain'
                        ? 'contrast(1.06) brightness(0.98) drop-shadow(0 15px 30px rgba(0,0,0,0.85))'
                        : 'contrast(1.08) brightness(0.96)',
                      zIndex: 3
                    }}
                  />
                ) : (
                  <img
                    key={`about-curr-${photoIndex}-${progressKey}`}
                    src={currentMeta.cleanUrl}
                    alt="DJ Missa"
                    loading="eager"
                    decoding="async"
                    onLoad={() => setIsMediaLoading(false)}
                    onError={(e) => {
                      setIsMediaLoading(false);
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_CAROUSEL_PHOTOS[0];
                    }}
                    className={isTransitioning ? 'carousel-slide-enter' : (currentMeta.fit === 'contain' ? '' : 'carousel-ken-burns')}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: currentMeta.fit,
                      objectPosition: getObjectPositionCss(currentMeta.pos),
                      filter: currentMeta.fit === 'contain'
                        ? 'contrast(1.06) brightness(0.98) drop-shadow(0 15px 30px rgba(0,0,0,0.85))'
                        : 'contrast(1.08) brightness(0.96)',
                      zIndex: 3
                    }}
                  />
                )}

                {/* Subtle Cyber Loading Spinner Overlay */}
                {isMediaLoading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 4,
                      pointerEvents: 'none',
                      background: 'rgba(6, 6, 8, 0.45)',
                      backdropFilter: 'blur(3px)',
                      transition: 'opacity 0.25s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '3px solid rgba(255, 0, 60, 0.25)',
                        borderTopColor: '#FF003C',
                        animation: 'spinAnim 0.75s linear infinite'
                      }}
                    />
                  </div>
                )}

                {/* Vignette Gradients */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(6,6,8,0.75) 0%, transparent 45%), radial-gradient(circle at 50% 20%, transparent 45%, rgba(6,6,8,0.5) 100%)',
                    pointerEvents: 'none',
                    zIndex: 4
                  }}
                />

                {/* Corner accent lines */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '22px',
                    height: '22px',
                    borderTop: '2px solid #FF003C',
                    borderLeft: '2px solid #FF003C',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '22px',
                    height: '22px',
                    borderBottom: '2px solid #FF003C',
                    borderRight: '2px solid #FF003C',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
              </div>

              {/* 10-Second countdown bar */}
              <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.08)' }}>
                <div
                  key={`about-progress-${photoIndex}-${progressKey}`}
                  className="carousel-countdown-bar running"
                />
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
                  href={`https://wa.me/${bookingPhone}?text=Hola%20Missa,%20quisiera%20consultar%20detalles%20t%C3%A9cnicos%20para%20un%20evento`}
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
