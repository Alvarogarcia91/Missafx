import React from 'react';
import { Calendar, MapPin, Ticket, ExternalLink, Flame } from 'lucide-react';

const DATES = [
  {
    id: 1,
    day: '24',
    month: 'OCT',
    year: '2026',
    venue: 'Bar Americas / Main Room',
    city: 'Guadalajara, México',
    status: 'Tickets Disponibles',
    isSoldOut: false,
    ticketLink: '#booking'
  },
  {
    id: 2,
    day: '07',
    month: 'NOV',
    year: '2026',
    venue: 'Dystopia Warehouse Festival',
    city: 'Ciudad de México, México',
    status: 'Tickets Disponibles',
    isSoldOut: false,
    ticketLink: '#booking'
  },
  {
    id: 3,
    day: '21',
    month: 'NOV',
    year: '2026',
    venue: 'Club Social Underground',
    city: 'Monterrey, México',
    status: 'Últimos Boletos',
    isSoldOut: false,
    ticketLink: '#booking'
  },
  {
    id: 4,
    day: '05',
    month: 'DIC',
    year: '2026',
    venue: 'Mia Beach Club Sunset',
    city: 'Tulum, México',
    status: 'Sold Out',
    isSoldOut: true,
    ticketLink: '#booking'
  },
  {
    id: 5,
    day: '31',
    month: 'DIC',
    year: '2026',
    venue: 'NYE Electronic Countdown',
    city: 'Cancún, México',
    status: 'Fase 1 Abierta',
    isSoldOut: false,
    ticketLink: '#booking'
  }
];

export default function TourDates() {
  return (
    <section id="tour" style={{ padding: '100px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">GIRA & PRESENTACIONES</span>
          <h2>PRÓXIMAS FECHAS 2026</h2>
          <p>
            Acompaña a DJ Missa en la pista de baile. Consulta las fechas confirmadas y asegura tu acceso.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {DATES.map((show) => (
            <div
              key={show.id}
              className="glass-panel"
              style={{
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                opacity: show.isSoldOut ? 0.75 : 1
              }}
            >
              {/* Date Block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '14px',
                    padding: '12px 18px',
                    textAlign: 'center',
                    minWidth: '85px'
                  }}
                >
                  <span
                    className="font-display"
                    style={{
                      display: 'block',
                      fontSize: '1.7rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: '#fff'
                    }}
                  >
                    {show.day}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {show.month}
                  </span>
                </div>

                {/* Venue & Location */}
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '4px'
                    }}
                  >
                    {show.venue}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <MapPin size={15} color="var(--accent-pink)" />
                    <span>{show.city}</span>
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: show.isSoldOut ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: show.isSoldOut ? '#f87171' : '#4ade80',
                    border: `1px solid ${show.isSoldOut ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                  }}
                >
                  {show.status}
                </span>

                {show.isSoldOut ? (
                  <button
                    disabled
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    Sold Out
                  </button>
                ) : (
                  <a href={show.ticketLink} className="btn btn-primary btn-sm">
                    <Ticket size={16} /> Entradas
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
