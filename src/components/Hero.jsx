import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { InstagramIcon, WhatsAppIcon, KickIcon, YouTubeIcon, SoundCloudIcon } from './SocialIcons';

const HERO_PHOTOS = [
  { src: '/gallery/missa-01.jpg', tag: 'PIONEER CDJ BOOTH' },
  { src: '/gallery/missa-02.jpg', tag: 'CLUBBER ART' },
  { src: '/gallery/missa-03.png', tag: 'STUDIO BRANDING' },
  { src: '/gallery/missa-04.jpg', tag: 'CLUB RESIDENCY' },
  { src: '/gallery/missa-05.jpg', tag: 'STAGE LIGHTS' },
  { src: '/gallery/missa-06.jpg', tag: 'NIGHTCLUB CROWD' },
  { src: '/gallery/missa-07.jpg', tag: 'HEADLINER SET' },
  { src: '/gallery/missa-08.jpg', tag: 'PEAK TECH HOUSE' },
  { src: '/gallery/missa-09.jpg', tag: 'HARDWARE & FX' }
];

export default function Hero() {
  const { t } = useLanguage();
  const whatsappUrl = "https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento";

  const [photoIndex, setPhotoIndex] = useState(0);
  const [prevPhotoIndex, setPrevPhotoIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const heroShuffleDeck = useRef([...Array(HERO_PHOTOS.length).keys()].sort(() => Math.random() - 0.5));

  const getNextHeroIndex = useCallback((current) => {
    if (heroShuffleDeck.current.length === 0) {
      heroShuffleDeck.current = [...Array(HERO_PHOTOS.length).keys()].sort(() => Math.random() - 0.5);
    }
    if (heroShuffleDeck.current[0] === current && heroShuffleDeck.current.length > 1) {
      const temp = heroShuffleDeck.current.shift();
      heroShuffleDeck.current.push(temp);
    }
    return heroShuffleDeck.current.shift();
  }, []);

  const triggerHeroTransition = useCallback((nextIdx) => {
    if (nextIdx === photoIndex || isTransitioning) return;
    setPrevPhotoIndex(photoIndex);
    setPhotoIndex(nextIdx);
    setIsTransitioning(true);
    setProgressKey(Date.now());
    setTimeout(() => {
      setIsTransitioning(false);
      setPrevPhotoIndex(null);
    }, 750);
  }, [photoIndex, isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      triggerHeroTransition(getNextHeroIndex(photoIndex));
    }, 7000);
    return () => clearInterval(timer);
  }, [photoIndex, getNextHeroIndex, triggerHeroTransition]);

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
                <Flame size={14} color="#FF003C" /> {t.hero.badgeGenre}
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
                {t.hero.artist1}
              </span>
              <span
                style={{
                  color: '#FFFFFF'
                }}
              >
                {t.hero.artist2}
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
              {t.hero.desc}
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
                  href="https://www.instagram.com/missaa.fx/"
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
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>@missaa.fx</span>
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
                  href="https://kick.com/7missa"
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
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>/7missa</span>
                  </div>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@missaelarath6364"
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
                  href="https://soundcloud.com/missael-arath"
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
              <a
                href="#gallery"
                title="Ver galería en vivo completa"
                style={{
                  display: 'block',
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1/1.08',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {/* Laser scanline that sweeps across during transition */}
                {isTransitioning && <div className="carousel-laser-scan" />}

                {/* PREVIOUS SLIDE (glitch exit animation) */}
                {prevPhotoIndex !== null && isTransitioning && (
                  <img
                    key={`hero-prev-${prevPhotoIndex}`}
                    src={HERO_PHOTOS[prevPhotoIndex].src}
                    alt="DJ Missa en vivo"
                    className="carousel-slide-exit"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 20%'
                    }}
                  />
                )}

                {/* CURRENT ACTIVE SLIDE */}
                <img
                  key={`hero-curr-${photoIndex}-${progressKey}`}
                  src={HERO_PHOTOS[photoIndex].src}
                  alt={`DJ Missa - ${HERO_PHOTOS[photoIndex].tag}`}
                  className={isTransitioning ? 'carousel-slide-enter' : 'carousel-ken-burns'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    filter: 'contrast(1.08) brightness(0.95)'
                  }}
                />

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

                {/* Top REC Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(10, 10, 14, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 0, 60, 0.35)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 6
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#FF003C',
                      boxShadow: '0 0 8px #FF003C',
                      animation: 'pulseAnimation 1.5s infinite'
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FF003C', letterSpacing: '0.06em' }}>
                    7s LIVE SHUFFLE
                  </span>
                </div>

                {/* Live Performance Badge on Photo */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '18px',
                    left: '18px',
                    background: 'rgba(10, 10, 14, 0.90)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 6
                  }}
                >
                  <div className="eq-bars">
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {HERO_PHOTOS[photoIndex].tag}
                  </span>
                </div>
              </a>

              {/* 7-Second countdown bar */}
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
