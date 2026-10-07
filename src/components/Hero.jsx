import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { InstagramIcon, WhatsAppIcon, KickIcon, YouTubeIcon, SoundCloudIcon } from './SocialIcons';
import { PhotoQueueManager } from '../utils/shuffleQueue';
import {
  fetchCarouselData,
  DEFAULT_CAROUSEL_PHOTOS,
  isVideoMedia,
  parseCarouselItemMeta,
  getObjectPositionCss,
  getCleanCarouselUrl
} from '../utils/supabaseClient';

export default function Hero() {
  const { t } = useLanguage();
  const { config } = useSiteConfig();
  const bookingPhone = config.bookingPhone || '5214443570777';
  const whatsappUrl = `https://wa.me/${bookingPhone}?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento`;
  const instagramUser = config.instagramUser || 'missaa.fx';
  const kickChannel = config.kickChannel || '7missa';
  const youtubeUrl = config.youtubeUrl || 'https://www.youtube.com/@missaelarath6364';
  const soundcloudUrl = config.soundcloudUrl || 'https://soundcloud.com/missael-arath';

  const [photos, setPhotos] = useState(DEFAULT_CAROUSEL_PHOTOS);
  const [isRandom, setIsRandom] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [prevPhotoIndex, setPrevPhotoIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [userMuted, setUserMuted] = useState(true); // Default to muted so video never sounds automatically
  const [heroVolume, setHeroVolume] = useState(50);

  const videoRef = useRef(null);
  const queueManager = useRef(null);
  const currentIdxRef = useRef(0);
  currentIdxRef.current = photoIndex;

  const currentItem = photos[photoIndex % photos.length] || photos[0];
  const currentMeta = parseCarouselItemMeta(currentItem);
  const isCurrentVideo = isVideoMedia(currentMeta.cleanUrl);
  const hasAudioConfig = currentMeta.hasAudio;

  const prevItem = prevPhotoIndex !== null && photos[prevPhotoIndex] ? photos[prevPhotoIndex] : null;
  const prevMeta = prevItem ? parseCarouselItemMeta(prevItem) : null;
  const isPrevVideo = prevMeta ? isVideoMedia(prevMeta.cleanUrl) : false;

  const loadPhotos = async () => {
    try {
      const data = await fetchCarouselData();
      if (data && Array.isArray(data.photos) && data.photos.length > 0) {
        setPhotos(data.photos);
        setIsRandom(Boolean(data.isRandom));
        queueManager.current = new PhotoQueueManager(data.photos.length, 0);
      }
    } catch (e) {
      console.warn('Error loading carousel photos in Hero:', e);
    }
  };

  useEffect(() => {
    loadPhotos();

    const handleUpdate = () => loadPhotos();
    window.addEventListener('missafx-carousel-updated', handleUpdate);
    return () => window.removeEventListener('missafx-carousel-updated', handleUpdate);
  }, []);

  if (!queueManager.current) {
    queueManager.current = new PhotoQueueManager(photos.length, 0);
  }

  const triggerHeroTransition = useCallback((nextIdx) => {
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
          triggerHeroTransition(nextIdx);
        }
      } else {
        const nextIdx = (currentIdxRef.current + 1) % photos.length;
        triggerHeroTransition(nextIdx);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [photos, isRandom, triggerHeroTransition]);

  useEffect(() => {
    setUserMuted(true);
    if (currentMeta && currentMeta.volume !== undefined) {
      setHeroVolume(currentMeta.volume);
    }
  }, [photoIndex, currentMeta?.volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrentVideo) {
      const activeVolume = typeof heroVolume === 'number' ? heroVolume / 100 : ((currentMeta.volume ?? 50) / 100);
      video.volume = Math.max(0, Math.min(1, activeVolume));
      if (hasAudioConfig && !userMuted) {
        video.muted = false;
      } else {
        video.muted = true;
      }

      // Seek to custom start time
      const startTime = currentMeta.startTime || 0;
      const endTime = currentMeta.endTime || 0;

      if (startTime > 0) {
        try {
          video.currentTime = startTime;
        } catch (e) {}
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy blocked unmuted autoplay, fallback to muted
          video.muted = true;
          video.play().catch(() => {});
        });
      }

      const handleTimeUpdate = () => {
        if (endTime > 0 && video.currentTime >= endTime) {
          video.pause();
          video.currentTime = endTime;
        }
      };

      const handleEnded = () => {
        video.pause();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.pause();
        video.muted = true;
      };
    }

    return () => {
      if (video) {
        video.pause();
        video.muted = true;
      }
    };
  }, [photoIndex, photos, isCurrentVideo, hasAudioConfig, userMuted, heroVolume, currentMeta.volume, currentMeta.startTime, currentMeta.endTime]);

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '120px',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Red Glows */}
      <div
        className="ambient-glow"
        style={{
          width: '520px',
          height: '520px',
          background: 'rgba(255, 0, 60, 0.16)',
          top: '10%',
          right: '5%'
        }}
      />
      <div
        className="ambient-glow"
        style={{
          width: '440px',
          height: '440px',
          background: 'rgba(255, 0, 60, 0.09)',
          bottom: '5%',
          left: '-5%'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '40px'
          }}
        >
          {/* Left Column: Headlines & Action CTAs */}
          <div style={{ maxWidth: '600px', zIndex: 5 }}>
            {/* Top Badges */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
              <div
                className="badge"
                style={{
                  background: 'rgba(255, 0, 60, 0.18)',
                  borderColor: 'rgba(255, 0, 60, 0.45)',
                  color: '#FF003C',
                  fontWeight: 800,
                  letterSpacing: '0.08em'
                }}
              >
                <Flame size={14} color="#FF003C" /> {config.heroBadgeGenre || t.hero.badgeGenre}
              </div>
              <div className="badge">
                {t.hero.badgePresskit}
              </div>
              <a 
                href="https://kick.com/7missa" 
                target="_blank" 
                rel="noreferrer" 
                className="badge badge-live"
                style={{ textDecoration: 'none' }}
              >
                <span className="pulse-dot" /> {t.hero.badgeLive}
              </a>
            </div>

            {/* Option 1 Brutalist Headline styled like official Logo */}
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(3.8rem, 8.8vw, 6.6rem)',
                fontWeight: 950,
                lineHeight: 0.90,
                letterSpacing: '-0.04em',
                marginBottom: '20px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'baseline',
                gap: '2px'
              }}
            >
              <span
                style={{
                  color: '#FF003C',
                  textShadow: '0 0 45px rgba(255, 0, 60, 0.45)'
                }}
              >
                {config.artistName1 || t.hero.artist1}
              </span>
              <span
                style={{
                  color: '#FFFFFF'
                }}
              >
                {config.artistName2 !== undefined ? config.artistName2 : t.hero.artist2}
              </span>
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(1.02rem, 1.7vw, 1.18rem)',
                maxWidth: '520px',
                marginBottom: '32px',
                lineHeight: 1.7
              }}
            >
              {config.heroDescription || t.hero.desc}
            </p>

            {/* Main Action Button: WhatsApp Direct Booking */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '30px' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ gap: '10px', padding: '14px 28px', fontSize: '1rem' }}
              >
                <WhatsAppIcon size={22} color="#FFFFFF" innerColor="#FF003C" /> {t.hero.btnBooking}
              </a>
            </div>

            {/* EXPOSED SOCIAL NETWORKS DOCK: All 5 networks with official icons */}
            <div
              style={{
                paddingTop: '24px',
                borderTop: '1px solid var(--border-glass)',
                maxWidth: '540px'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                  textTransform: 'uppercase'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF003C' }} />
                {t.hero.quickSocialsTitle}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px'
                }}
              >
                {/* Instagram */}
                <a
                  href={`https://www.instagram.com/${instagramUser}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    border: '1px solid rgba(225, 48, 108, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <InstagramIcon size={22} color="gradient" />
                  <div>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-dim)', display: 'block' }}>Instagram</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>@{instagramUser}</span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <WhatsAppIcon size={22} />
                  <div>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-dim)', display: 'block' }}>WhatsApp</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Direct Chat</span>
                  </div>
                </a>

                {/* Kick */}
                <a
                  href={`https://kick.com/${kickChannel}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    border: '1px solid rgba(83, 252, 24, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <KickIcon size={22} />
                  <div>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-dim)', display: 'block' }}>Kick Live</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>/{kickChannel}</span>
                  </div>
                </a>

                {/* YouTube */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <YouTubeIcon size={22} />
                  <div>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-dim)', display: 'block' }}>YouTube</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Canal Oficial</span>
                  </div>
                </a>

                {/* SoundCloud */}
                <a
                  href={soundcloudUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 85, 0, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <SoundCloudIcon size={22} color="gradient" />
                  <div>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-dim)', display: 'block' }}>SoundCloud</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Sets & Mixes</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual with Photo Switcher, Repeating Background Typography & Missa DJ photo */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '520px'
            }}
          >
            {/* Giant Repeated Background Outline Watermark Typography */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '52%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                opacity: 0.85,
                pointerEvents: 'none'
              }}
            >
              <span className="outline-text" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.2rem)' }}>
                MISSAFX
              </span>
              <span className="outline-text solid-red" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.2rem)' }}>
                MISSAFX
              </span>
              <span className="outline-text" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.2rem)' }}>
                MISSAFX
              </span>
              <span className="outline-text" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.2rem)', opacity: 0.5 }}>
                MISSAFX
              </span>
            </div>

            {/* Main Stage Card with Missa at Pioneer CDJs */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                width: '100%',
                maxWidth: '430px',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(18, 18, 24, 0.4) 0%, rgba(6, 6, 8, 0.95) 100%)',
                border: '1px solid rgba(255, 0, 60, 0.3)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(255, 0, 60, 0.18)'
              }}
            >
              {/* Photo Frame */}
              <div
                style={{
                  display: 'block',
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1/1.08',
                  overflow: 'hidden'
                }}
              >
                {/* Laser scanline that sweeps across during transition */}
                {isTransitioning && <div className="carousel-laser-scan" />}

                {/* Cinema Fit Mode: Ambient Blur Backdrop */}
                {currentMeta.fit === 'contain' && (
                  <div style={{ position: 'absolute', inset: -15, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
                    {isCurrentVideo ? (
                      <video
                        src={currentMeta.cleanUrl}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'blur(28px) brightness(0.42) saturate(1.4)',
                          transform: 'scale(1.2)'
                        }}
                      />
                    ) : (
                      <img
                        src={currentMeta.cleanUrl}
                        alt=""
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
                      key={`hero-prev-${prevPhotoIndex}`}
                      src={prevMeta.cleanUrl}
                      autoPlay
                      loop
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
                        zIndex: 2
                      }}
                    />
                  ) : (
                    <img
                      key={`hero-prev-${prevPhotoIndex}`}
                      src={prevMeta.cleanUrl}
                      alt="DJ Missa en vivo"
                      className="carousel-slide-exit"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: prevMeta.fit,
                        objectPosition: getObjectPositionCss(prevMeta.pos),
                        zIndex: 2
                      }}
                    />
                  )
                )}

                {/* CURRENT ACTIVE SLIDE */}
                {isCurrentVideo ? (
                  <video
                    ref={videoRef}
                    key={`hero-curr-${photoIndex}-${progressKey}`}
                    src={currentMeta.cleanUrl}
                    autoPlay
                    playsInline
                    muted={!hasAudioConfig || userMuted}
                    className={isTransitioning ? 'carousel-slide-enter' : (currentMeta.fit === 'contain' ? '' : 'carousel-ken-burns')}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: currentMeta.fit,
                      objectPosition: getObjectPositionCss(currentMeta.pos),
                      filter: currentMeta.fit === 'contain'
                        ? 'contrast(1.06) brightness(0.98) drop-shadow(0 15px 35px rgba(0,0,0,0.9))'
                        : 'contrast(1.08) brightness(0.95)',
                      zIndex: 3
                    }}
                  />
                ) : (
                  <img
                    key={`hero-curr-${photoIndex}-${progressKey}`}
                    src={currentMeta.cleanUrl}
                    alt="DJ Missa en vivo"
                    className={isTransitioning ? 'carousel-slide-enter' : (currentMeta.fit === 'contain' ? '' : 'carousel-ken-burns')}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: currentMeta.fit,
                      objectPosition: getObjectPositionCss(currentMeta.pos),
                      filter: currentMeta.fit === 'contain'
                        ? 'contrast(1.06) brightness(0.98) drop-shadow(0 15px 35px rgba(0,0,0,0.9))'
                        : 'contrast(1.08) brightness(0.95)',
                      zIndex: 3
                    }}
                  />
                )}

                {/* Floating audio toggle & volume potency controller for videos */}
                {isCurrentVideo && hasAudioConfig && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 10,
                      background: 'rgba(0, 0, 0, 0.78)',
                      backdropFilter: 'blur(10px)',
                      border: !userMuted ? '1px solid rgba(34, 197, 94, 0.45)' : '1px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '24px',
                      padding: '5px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: !userMuted ? '0 4px 18px rgba(34, 197, 94, 0.25)' : '0 4px 15px rgba(0,0,0,0.5)',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserMuted((prev) => {
                          const next = !prev;
                          if (videoRef.current) {
                            videoRef.current.volume = (heroVolume || 50) / 100;
                            videoRef.current.muted = next;
                            if (!next) videoRef.current.play().catch(() => {});
                          }
                          return next;
                        });
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: !userMuted ? '#22c55e' : '#94a3b8',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 0
                      }}
                      title={userMuted ? 'Toca para activar audio' : 'Toca para silenciar'}
                    >
                      {!userMuted ? (
                        <>
                          <Volume2 size={15} color="#22c55e" />
                          <span style={{ color: '#22c55e' }}>{heroVolume}%</span>
                        </>
                      ) : (
                        <>
                          <VolumeX size={15} color="#94a3b8" />
                          <span style={{ color: '#94a3b8' }}>MUTE</span>
                        </>
                      )}
                    </button>

                    {!userMuted && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={heroVolume}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          const vol = parseInt(e.target.value, 10);
                          setHeroVolume(vol);
                          if (videoRef.current) {
                            videoRef.current.volume = vol / 100;
                            if (vol === 0) {
                              videoRef.current.muted = true;
                              setUserMuted(true);
                            } else {
                              videoRef.current.muted = false;
                            }
                          }
                        }}
                        style={{
                          width: '64px',
                          accentColor: '#22c55e',
                          cursor: 'pointer'
                        }}
                        title={`Potencia de volumen: ${heroVolume}%`}
                      />
                    )}
                  </div>
                )}

                {/* Vignette Gradients */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, #060608 8%, transparent 55%), radial-gradient(circle at 50% 10%, transparent 40%, rgba(6,6,8,0.65) 100%)',
                    pointerEvents: 'none',
                    zIndex: 4
                  }}
                />

                {/* Corner accent lines */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    width: '28px',
                    height: '28px',
                    borderTop: '2px solid #FF003C',
                    borderLeft: '2px solid #FF003C',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '16px',
                    width: '28px',
                    height: '28px',
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
                  key={`hero-progress-${photoIndex}-${progressKey}`}
                  className="carousel-countdown-bar running"
                />
              </div>
            </div>

            {/* FLOATING BADGE: WhatsApp Direct Booking */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="floating-badge float-anim-3"
              style={{
                bottom: '-20px',
                right: '-10px',
                background: 'linear-gradient(135deg, #FF003C 0%, #B80028 100%)',
                boxShadow: '0 14px 35px rgba(255, 0, 60, 0.45)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                borderRadius: '9999px'
              }}
            >
              <WhatsAppIcon size={24} color="#FFFFFF" innerColor="#FF003C" />
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', opacity: 0.9 }}>
                  {t.hero.directBookingTag}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                  +52 1 444 357 0777
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
