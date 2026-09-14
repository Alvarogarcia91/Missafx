import React from 'react';
import { Play, MessageCircle, Flame, Music, Video } from 'lucide-react';

export default function Hero() {
  const whatsappUrl = "https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento";

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
          <div style={{ maxWidth: '580px', zIndex: 5 }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div className="badge">
                <Flame size={14} color="#FF003C" /> DJ & MUSIC PRODUCER
              </div>
              <a 
                href="https://kick.com/7missa" 
                target="_blank" 
                rel="noreferrer" 
                className="badge badge-live"
                style={{ textDecoration: 'none' }}
              >
                <span className="pulse-dot" /> KICK STREAM LIVE
              </a>
            </div>

            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}
            >
              FEEL THE <br />
              <span className="gradient-crimson-text">FREQUENCY.</span> <br />
              LIVE THE BEAT.
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                maxWidth: '500px',
                marginBottom: '32px',
                lineHeight: 1.7
              }}
            >
              Sets electrizantes de Tech House, basslines contundentes y atmósfera de club underground. 
              Explora la música, directos y booking directo de <strong>Missafx</strong>.
            </p>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ gap: '10px' }}
              >
                <MessageCircle size={18} /> Booking WhatsApp
              </a>
              <a
                href="https://soundcloud.com/missael-arath"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ gap: '10px' }}
              >
                <Music size={18} color="#FF003C" /> Escuchar Sets
              </a>
              <a
                href="https://kick.com/7missa"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ gap: '10px' }}
              >
                <Video size={18} color="#53fc18" /> Ver en Kick
              </a>
            </div>

            {/* Quick Links Indicator Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(130px, 1fr))',
                gap: '12px',
                maxWidth: '420px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-glass)'
              }}
            >
              <a
                href="https://www.instagram.com/missaa.fx/"
                target="_blank"
                rel="noreferrer"
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: '#fff',
                  borderRadius: '12px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E1306C' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block' }}>Instagram</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>@missaa.fx</span>
                </div>
              </a>

              <a
                href="https://www.youtube.com/@missaelarath6364"
                target="_blank"
                rel="noreferrer"
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  color: '#fff',
                  borderRadius: '12px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF0000' }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block' }}>YouTube</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Canal Oficial</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Visual with Repeating Background Typography & Missa DJ photo */}
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
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1/1.08',
                  overflow: 'hidden'
                }}
              >
                <img
                  src="/missa-capture.jpg"
                  alt="DJ Missa tocando en vivo"
                  style={{
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
                    pointerEvents: 'none'
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
                    pointerEvents: 'none'
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
                    pointerEvents: 'none'
                  }}
                />

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
                    gap: '10px'
                  }}
                >
                  <div className="eq-bars">
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    PIONEER DJ PRO SESSION
                  </span>
                </div>
              </div>
            </div>

            {/* FLOATING BADGE 1: SoundCloud */}
            <a
              href="https://soundcloud.com/missael-arath"
              target="_blank"
              rel="noreferrer"
              className="floating-badge float-anim-1"
              style={{
                top: '-15px',
                left: '-12px',
                background: 'rgba(18, 16, 22, 0.94)',
                border: '1px solid rgba(255, 85, 0, 0.45)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255, 85, 0, 0.2)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FF5500 0%, #FF3300 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Play size={18} fill="#fff" />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#ff7733', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                  SOUNDCLOUD
                </span>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fff' }}>
                  Escuchar Sesiones
                </span>
              </div>
            </a>

            {/* FLOATING BADGE 2: Kick Live */}
            <a
              href="https://kick.com/7missa"
              target="_blank"
              rel="noreferrer"
              className="floating-badge float-anim-2"
              style={{
                top: '25px',
                right: '-12px',
                background: 'rgba(14, 18, 14, 0.94)',
                border: '1px solid rgba(83, 252, 24, 0.4)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6), 0 0 20px rgba(83, 252, 24, 0.25)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span className="pulse-dot" style={{ backgroundColor: '#53fc18' }} />
              <div>
                <span style={{ fontSize: '0.74rem', color: '#53fc18', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                  KICK LIVE
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  kick.com/7missa
                </span>
              </div>
            </a>

            {/* FLOATING BADGE 3: WhatsApp Direct Booking */}
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
              <MessageCircle size={20} />
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', opacity: 0.9 }}>
                  DIRECT BOOKING
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
