import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Ticket, Maximize2, X, ExternalLink, Sparkles, Play, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchEvents,
  sortEventsByDate,
  isVideoMedia,
  getEventStatus,
  getEventCoupon,
  getCleanTicketUrl,
  getCleanTitle
} from '../utils/supabaseClient';
import { WhatsAppIcon } from './SocialIcons';

export default function UpcomingEvents({ onOpenAdmin, onEventsChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFlyer, setActiveFlyer] = useState(null);
  const { lang, t } = useLanguage();
  const eText = t.events || {
    tag: 'TOUR DATES // FECHAS EN VIVO',
    title1: 'PRÓXIMOS',
    title2: 'EVENTOS',
    desc: 'Presentaciones en vivo, residencias y sesiones oficiales de Missafx. Selecciona cualquier flyer para verlo a pantalla completa o reservar tus accesos directos.',
    loading: 'CARGANDO FECHAS...',
    btnBook: 'Reservar // WhatsApp',
    btnBookWithCoupon: 'Reservar con Cupón // WhatsApp',
    btnSoldOut: 'EVENTO AGOTADO',
    btnLastTickets: 'ÚLTIMOS BOLETOS // WhatsApp',
    badgeLive: 'LIVE SET',
    badgeSoldOut: '🔴 AGOTADO // SOLD OUT',
    badgeLastTickets: '⚡ ÚLTIMOS BOLETOS',
    badgeCoupon: '🎟️ CUPÓN DISPONIBLE',
    badgeBookWithCoupon: '🎟️ RESERVA CON CUPÓN',
    promoCodeLabel: 'CÓDIGO PROMO:',
    lightboxBook: 'Reservar',
    lightboxBookWithCoupon: 'Reservar con Cupón',
    lightboxSoldOut: 'Agotado',
    videoBadge: 'VIDEO MP4'
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      const list = Array.isArray(data) ? sortEventsByDate(data) : [];
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

    // Listen to custom refresh event when Missa publishes, edits or deletes from the wizard
    const handleRefresh = () => loadEvents();
    window.addEventListener('missafx-events-updated', handleRefresh);
    return () => window.removeEventListener('missafx-events-updated', handleRefresh);
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveFlyer(null);
    };
    if (activeFlyer) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFlyer]);

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
            <span>{eText.tag}</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                title="Administrar eventos (PIN)"
                aria-label="Administrar eventos"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.35)',
                  cursor: 'pointer',
                  padding: '2px 0 2px 4px',
                  marginLeft: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FF003C';
                  e.currentTarget.style.transform = 'rotate(45deg) scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)';
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.0)';
                }}
              >
                <Settings size={13} />
              </button>
            )}
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
            {eText.title1} <span style={{ color: '#FF003C', textShadow: '0 0 24px rgba(255, 0, 60, 0.6)' }}>{eText.title2}</span>
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
            {eText.desc}
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
            {eText.loading}
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
            {events.map((event) => {
              const status = getEventStatus(event);
              const coupon = getEventCoupon(event);
              const isVideo = isVideoMedia(event.image_url);
              const cleanTitle = getCleanTitle(event.title);
              const cleanTicket = getCleanTicketUrl(event.ticket_url);

              return (
                <div
                  key={event.id}
                  style={{
                    background: 'rgba(15, 15, 20, 0.85)',
                    border: status === 'sold_out'
                      ? '1px solid rgba(239, 68, 68, 0.35)'
                      : status === 'last_tickets'
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : coupon
                      ? '1px solid rgba(16, 185, 129, 0.45)'
                      : '1px solid rgba(255, 255, 255, 0.10)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: status === 'sold_out'
                      ? '0 12px 30px rgba(239, 68, 68, 0.15)'
                      : status === 'last_tickets'
                      ? '0 12px 30px rgba(245, 158, 11, 0.18)'
                      : coupon
                      ? '0 12px 30px rgba(16, 185, 129, 0.18)'
                      : '0 12px 30px rgba(0, 0, 0, 0.45)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = status === 'sold_out'
                      ? 'rgba(239, 68, 68, 0.7)'
                      : status === 'last_tickets'
                      ? 'rgba(245, 158, 11, 0.8)'
                      : coupon
                      ? 'rgba(16, 185, 129, 0.8)'
                      : 'rgba(255, 0, 60, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = status === 'sold_out'
                      ? '0 18px 40px rgba(239, 68, 68, 0.3)'
                      : status === 'last_tickets'
                      ? '0 18px 40px rgba(245, 158, 11, 0.35)'
                      : coupon
                      ? '0 18px 40px rgba(16, 185, 129, 0.35)'
                      : '0 18px 40px rgba(255, 0, 60, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = status === 'sold_out'
                      ? 'rgba(239, 68, 68, 0.35)'
                      : status === 'last_tickets'
                      ? 'rgba(245, 158, 11, 0.4)'
                      : coupon
                      ? 'rgba(16, 185, 129, 0.45)'
                      : 'rgba(255, 255, 255, 0.10)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = coupon
                      ? '0 12px 30px rgba(16, 185, 129, 0.18)'
                      : '0 12px 30px rgba(0, 0, 0, 0.45)';
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

                      {/* Header Badge */}
                      {status === 'sold_out' ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            fontWeight: 800,
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)'
                          }}
                        >
                          {eText.badgeSoldOut}
                        </span>
                      ) : status === 'last_tickets' ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            fontWeight: 800,
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            boxShadow: '0 0 10px rgba(245, 158, 11, 0.25)'
                          }}
                        >
                          {eText.badgeLastTickets}
                        </span>
                      ) : coupon ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            fontWeight: 800,
                            border: '1px solid rgba(16, 185, 129, 0.5)',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Ticket size={11} />
                          <span>{coupon}</span>
                        </span>
                      ) : (
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
                          {eText.badgeLive}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <MapPin size={13} color="#94a3b8" />
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                        {event.venue}
                      </span>
                    </div>
                  </div>

                  {/* Vertical Flyer Container (9:14 aspect ratio) */}
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
                    {/* Status Badge Watermark on Top of Flyer */}
                    {status === 'sold_out' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '14px',
                          left: '14px',
                          background: 'rgba(220, 38, 38, 0.95)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          letterSpacing: '0.08em',
                          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.6)',
                          zIndex: 3
                        }}
                      >
                        {eText.badgeSoldOut}
                      </div>
                    )}

                    {status === 'last_tickets' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '14px',
                          left: '14px',
                          background: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          letterSpacing: '0.08em',
                          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.6)',
                          zIndex: 3
                        }}
                      >
                        {eText.badgeLastTickets}
                      </div>
                    )}

                    {status !== 'sold_out' && coupon && (
                      <div
                        style={{
                          position: 'absolute',
                          top: status === 'last_tickets' ? '46px' : '14px',
                          left: '14px',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          letterSpacing: '0.08em',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          zIndex: 3
                        }}
                      >
                        <Ticket size={12} />
                        <span>{eText.badgeBookWithCoupon || '🎟️ RESERVA CON CUPÓN'}: {coupon}</span>
                      </div>
                    )}

                    {/* Media: Video or Image */}
                    {isVideo ? (
                      <>
                        <video
                          src={event.image_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            color: '#FFFFFF',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 2
                          }}
                        >
                          <Play size={10} fill="#fff" />
                          <span>{eText.videoBadge}</span>
                        </div>
                      </>
                    ) : (
                      <img
                        src={event.image_url}
                        alt={cleanTitle}
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
                    )}

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
                        justifyContent: 'center',
                        zIndex: 3
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
                      {cleanTitle}
                    </div>

                    {/* Promo Coupon Callout Banner */}
                    {coupon && status !== 'sold_out' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.10)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          fontSize: '0.72rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 800 }}>
                          <Ticket size={13} />
                          <span>{eText.promoCodeLabel || 'CÓDIGO PROMO:'}</span>
                        </div>
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.22)',
                            color: '#34d399',
                            fontFamily: 'monospace',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '0.06em',
                            border: '1px dashed rgba(16, 185, 129, 0.5)'
                          }}
                        >
                          {coupon}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    {status === 'sold_out' ? (
                      <a
                        href={cleanTicket}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.16)',
                          border: '1px solid rgba(239, 68, 68, 0.45)',
                          color: '#ef4444',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          textDecoration: 'none',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.15)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                        <span>{eText.btnSoldOut}</span>
                      </a>
                    ) : coupon ? (
                      <a
                        href={cleanTicket}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #FF003C 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          textDecoration: 'none',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(16, 185, 129, 0.4)';
                        }}
                      >
                        <WhatsAppIcon size={16} color="#FFFFFF" />
                        <span>{eText.btnBookWithCoupon || 'Reservar con Cupón // WhatsApp'}</span>
                      </a>
                    ) : status === 'last_tickets' ? (
                      <a
                        href={cleanTicket}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #d97706 0%, #FF003C 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          textDecoration: 'none',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 18px rgba(217, 119, 6, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(217, 119, 6, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(217, 119, 6, 0.4)';
                        }}
                      >
                        <WhatsAppIcon size={16} color="#FFFFFF" />
                        <span>{eText.btnLastTickets}</span>
                      </a>
                    ) : (
                      <a
                        href={cleanTicket}
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
                        <span>{eText.btnBook}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal (Full HD Flyer / Video View) */}
      {activeFlyer && (
        <div
          onClick={() => setActiveFlyer(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(12px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0c0c10',
              border: getEventStatus(activeFlyer) === 'sold_out'
                ? '1px solid rgba(239, 68, 68, 0.5)'
                : '1px solid rgba(255, 0, 60, 0.35)',
              boxShadow: '0 0 60px rgba(0, 0, 0, 0.9)'
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

            {/* Media Content */}
            <div style={{ flex: 1, overflow: 'auto', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isVideoMedia(activeFlyer.image_url) ? (
                <video
                  src={activeFlyer.image_url}
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                  style={{ width: '100%', maxHeight: '74vh', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <img
                  src={activeFlyer.image_url}
                  alt={getCleanTitle(activeFlyer.title)}
                  style={{ width: '100%', height: 'auto', maxHeight: '74vh', objectFit: 'contain', display: 'block' }}
                />
              )}
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
                {getEventCoupon(activeFlyer) && getEventStatus(activeFlyer) !== 'sold_out' && (
                  <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Ticket size={12} />
                    <span>{eText.promoCodeLabel || 'CÓDIGO PROMO:'} <strong style={{ color: '#34d399' }}>{getEventCoupon(activeFlyer)}</strong></span>
                  </div>
                )}
              </div>

              <a
                href={getCleanTicketUrl(activeFlyer.ticket_url)}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: getEventStatus(activeFlyer) === 'sold_out'
                    ? '#ef4444'
                    : getEventCoupon(activeFlyer)
                    ? 'linear-gradient(135deg, #059669 0%, #10b981 60%, #FF003C 100%)'
                    : '#FF003C',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: getEventCoupon(activeFlyer) && getEventStatus(activeFlyer) !== 'sold_out'
                    ? '0 4px 18px rgba(16, 185, 129, 0.4)'
                    : 'none'
                }}
              >
                <span>
                  {getEventStatus(activeFlyer) === 'sold_out'
                    ? eText.lightboxSoldOut
                    : getEventCoupon(activeFlyer)
                    ? (eText.lightboxBookWithCoupon || 'Reservar con Cupón')
                    : eText.lightboxBook}
                </span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
