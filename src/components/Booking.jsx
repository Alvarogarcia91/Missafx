import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, CheckCircle, MessageSquare, Sparkles } from 'lucide-react';

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Festival / Gran Escenario',
    date: '',
    location: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simula envío del formulario
    setSubmitted(true);
    setTimeout(() => {
      // Dejar mensaje de confirmación
    }, 4000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola! Quisiera cotizar una fecha para DJ Missa para el evento: ${formData.eventType || 'Evento'} en ${formData.location || 'mi ciudad'}.`
  );

  return (
    <section id="booking" style={{ padding: '100px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">CONTRATACIONES & FECHAS</span>
          <h2>RESERVA A DJ MISSA</h2>
          <p>
            Disponible para festivales nacionales e internacionales, clubs de primer nivel y eventos exclusivos.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          {/* Direct Contacts Column */}
          <div>
            <h3 className="font-display" style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '16px' }}>
              INFORMACIÓN DIRECTA DE BOOKING
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.7 }}>
              Para cotizaciones urgentes, confirmación de disponibilidad inmediata o consultas de prensa y patrocinio, 
              puedes contactar a nuestro equipo de management directamente.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
              <div
                className="glass-panel"
                style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-purple)'
                  }}
                >
                  <Mail size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Correo de Management
                  </span>
                  <a
                    href="mailto:booking@missafx.com"
                    style={{ display: 'block', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}
                  >
                    booking@missafx.com
                  </a>
                </div>
              </div>

              <div
                className="glass-panel"
                style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4ade80'
                  }}
                >
                  <Phone size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    WhatsApp Directo
                  </span>
                  <a
                    href={`https://wa.me/5211234567890?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}
                  >
                    +52 (1) 123 456 7890 (Chat de Booking)
                  </a>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-glass)'
              }}
            >
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent-cyan)" /> Política de Fechas
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                Se requiere un anticipo del 50% para bloquear la fecha en calendario oficial. Se incluye rider técnico y hospitalidad estándar.
              </p>
            </div>
          </div>

          {/* Booking Form Card */}
          <div
            className="glass-panel"
            style={{
              padding: '36px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              background: 'linear-gradient(180deg, rgba(20, 19, 36, 0.8) 0%, rgba(10, 10, 18, 0.95) 100%)'
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    color: '#4ade80'
                  }}
                >
                  <CheckCircle size={36} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>
                  ¡Solicitud Recibida!
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  El equipo de booking de DJ Missa se comunicará contigo en menos de 24 horas para coordinar detalles y disponibilidad.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Nombre del Promotor o Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Producciones Beat Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="promotor@evento.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+52 123 456 7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Tipo de Evento
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Festival / Gran Escenario">Festival / Escenario</option>
                      <option value="Club / Discoteca">Club / Discoteca</option>
                      <option value="Fiesta Privada / VIP">Fiesta Privada / VIP</option>
                      <option value="Evento Corporativo">Evento Corporativo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Fecha Estimada
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Ciudad / Lugar del Evento
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Cancún, México (Beach Club)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Detalles Adicionales o Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Duración del set requerida, horario tentativo, capacidad del venue..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  <Send size={18} /> Enviar Solicitud de Booking
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(10, 10, 18, 0.8)',
  border: '1px solid var(--border-glass)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s ease'
};
