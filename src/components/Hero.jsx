import React from 'react';
import { Play, Calendar, Sparkles, Volume2, Flame } from 'lucide-react';

export default function Hero() {
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
      {/* Background Ambient Glows */}
      <div
        className="ambient-glow"
        style={{
          width: '550px',
          height: '550px',
          background: 'rgba(168, 85, 247, 0.18)',
          top: '10%',
          left: '-10%'
        }}
      />
      <div
        className="ambient-glow"
        style={{
          width: '600px',
          height: '600px',
          background: 'rgba(6, 182, 212, 0.15)',
          bottom: '10%',
          right: '-5%'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '60px'
          }}
        >
          {/* Left Text Column */}
          <div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div className="badge">
                <Flame size={14} color="var(--accent-pink)" /> DJ & Music Producer
              </div>
              <div className="badge badge-live">
                <span className="pulse-dot" /> EN TOUR 2026
              </div>
            </div>

            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}
            >
              FEEL THE <br />
              <span className="gradient-text">ENERGY.</span> <br />
              LIVE THE BEAT.
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                maxWidth: '540px',
                marginBottom: '36px'
              }}
            >
              DJ Missa lleva cada escenario a otro nivel con sets electrizantes de Tech House, 
              melodic techno y beats contundentes. Una experiencia sonora inmersiva diseñada para la pista de baile.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#music" className="btn btn-primary">
                <Play size={18} fill="#fff" /> Escuchar Sets
              </a>
              <a href="#tour" className="btn btn-secondary">
                <Calendar size={18} /> Ver Fechas
              </a>
              <a href="#booking" className="btn btn-secondary">
                <Sparkles size={18} color="var(--accent-cyan)" /> Booking
              </a>
            </div>

            {/* Micro Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid var(--border-glass)'
              }}
            >
              <div>
                <span className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                  +120K
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Streams Totales
                </p>
              </div>
              <div>
                <span className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  +50
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Shows & Clubs
                </p>
              </div>
              <div>
                <span className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-pink)' }}>
                  100%
                </span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Energía Pura
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Deck Card */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              className="glass-panel"
              style={{
                padding: '30px',
                width: '100%',
                maxWidth: '460px',
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(26, 24, 45, 0.8) 0%, rgba(13, 12, 24, 0.95) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(168, 85, 247, 0.15)'
              }}
            >
              {/* Vinyl Graphic with Glowing Center */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #1a1a2e 0%, #0c0b14 70%, #050508 100%)',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(6, 182, 212, 0.2)',
                  border: '8px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  margin: '0 auto 24px auto',
                  overflow: 'hidden'
                }}
              >
                {/* Vinyl Grooves */}
                <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.04)' }} />
                <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.04)' }} />
                <div style={{ position: 'absolute', inset: '45%', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.04)' }} />

                {/* Vinyl Center Label */}
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(236, 72, 153, 0.5)',
                    textAlign: 'center',
                    padding: '8px'
                  }}
                >
                  <span className="font-display" style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>
                    MISSA FX
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    TECH HOUSE
                  </span>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#050508', marginTop: '4px' }} />
                </div>
              </div>

              {/* Now Playing Widget */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                    }}
                  >
                    <Volume2 size={20} color="#fff" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'block', color: '#fff' }}>
                      Midnight Velocity (Original Mix)
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                      DJ Missa • 126 BPM • F# Minor
                    </span>
                  </div>
                </div>

                <div className="eq-bars">
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
