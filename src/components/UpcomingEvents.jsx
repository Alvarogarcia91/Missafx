import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket, Maximize2, X, ExternalLink, Sparkles } from 'lucide-react';
import { fetchEvents } from '../utils/supabaseClient';
import { WhatsAppIcon } from './SocialIcons';

export default function UpcomingEvents({ onOpenAdmin, onEventsChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFlyer, setActiveFlyer] = useState(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      const list = Array.isArray(data) ? data : [];
      setEvents(list);
      if (onEventsChange) onEventsChange(list.length);
    } catch (e) {
      console.warn('Error fetching events:', e);
      setEvents([]);
      if (onEventsChange) onEventsChange(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Listen to custom refresh event when Missa publishes or deletes from the wizard
    const handleRefresh = () => loadEvents();
    window.addEventListener('missafx-events-updated', handleRefresh);
    return () => window.removeEventListener('missafx-events-updated', handleRefresh);
  }, []);

  // When there are no events, hide the entire module completely so no fake events are displayed
  if (events.length === 0) {
    return null;
  }

  return (
    <section
      id="upcoming-events"
      style={{
        padding: '90px 0 80px 0',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(6, 6, 8, 0.98) 0%, rgba(12, 12, 16, 0.98) 50%, rgba(6, 6, 8, 1) 100%)',
        borderTop: '1px solid rgba(255, 0, 60, 0.15)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden'
      }}
    >
      {/* Background Cyber Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 0, 60, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
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
              boxShadow: '0 0 20px rgba(255, 0, 60, 0.2)'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#FF003C',
                boxShadow: '0 0 8px #FF003C',
                display: 'inline-block'
              }}
            />
            TOUR DATES // FECHAS EN VIVO
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
            PRÓXIMOS <span style={{ color: '#FF003C', textShadow: '0 0 24px rgba(255, 0, 60, 0.6)' }}>EVENTOS</span>
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
            Presentaciones en vivo, residencias y sesiones oficiales de Missafx. Selecciona cualquier flyer para verlo a pantalla completa o reservar tus accesos directos.
          </p>
        </div>

        {/* Grid of Event Flyers */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '60px 0',
              color: '#94a3b8',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255, 0, 60, 0.3)',
                borderTopColor: '#FF003C',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            CARGANDO FECHAS DE TOQUINES...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 360px))',
              justifyContent: 'center',
              gap: '32px'
            }}
          >
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(15, 15, 20, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 0, 60, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(255, 0, 60, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.45)';
                }}
              >
                {/* HUD Header Bar: Fecha y Lugar */}
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(20, 20, 28, 0.95)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.86rem',
                        fontWeight: 900,
                        fontFamily: '"Outfit", sans-serif',
                        color: '#FFFFFF',
                        letterSpacing: '0.04em'
                      }}
                    >
                      <Calendar size={14} color="#FF003C" />
                      {event.date}
                    </span>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'monospace',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 0, 60, 0.15)',
                        color: '#FF003C',
                        fontWeight: 700,
                        border: '1px solid rgba(255, 0, 60, 0.3)'
                      }}
                    >
                      LIVE SET
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <MapPin size={13} color="#94a3b8" />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      {event.venue}
                    </span>
                  </div>
                </div>

                {/* Vertical Flyer Container (9:16 aspect ratio) */}
                <div
                  onClick={() => setActiveFlyer(event)}
                  style={{
                    position: 'relative',
                    aspectRatio: '9 / 14',
                    width: '100%',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#060608'
                  }}
                >
                  <img
                    src={event.image_url}
                    alt={event.title || 'Flyer Missafx'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
                  />

                  {/* Hover Overlay Hint */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '6px',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Ver a pantalla completa"
                  >
                    <Maximize2 size={14} />
                  </div>
                </div>

                {/* Footer Bar: Title & Booking Button */}
                <div
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'rgba(12, 12, 16, 0.98)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      fontFamily: '"Syne", sans-serif',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {event.title || 'EXCLUSIVE DJ SET'}
                  </div>

                  <a
                    href={event.ticket_url || 'https://wa.me/5214443570777'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#FF003C',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(255, 0, 60, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ff1a4f';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 60, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FF003C';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 60, 0.3)';
                    }}
                  >
                    <WhatsAppIcon size={16} color="#FFFFFF" />
                    <span>Reservar // WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal (Full HD Flyer View) */}
      {activeFlyer && (
        <div
          onClick={() => setActiveFlyer(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0c0c10',
              border: '1px solid rgba(255, 0, 60, 0.35)',
              boxShadow: '0 0 50px rgba(255, 0, 60, 0.25)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveFlyer(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            {/* Flyer Image */}
            <div style={{ flex: 1, overflow: 'auto', background: '#000000' }}>
              <img
                src={activeFlyer.image_url}
                alt={activeFlyer.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Lightbox Footer */}
            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(15, 15, 22, 0.98)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {activeFlyer.date}
                </div>
                <div style={{ fontSize: '0.80rem', color: '#94a3b8' }}>
                  {activeFlyer.venue}
                </div>
              </div>

              <a
                href={activeFlyer.ticket_url || 'https://wa.me/5214443570777'}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#FF003C',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Reservar</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
