import React, { useState } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { WhatsAppIcon, InstagramIcon } from './SocialIcons';

export default function Booking() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: 'club',
    date: '',
    location: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventName = t.booking.eventOptions[formData.eventType] || formData.eventType;
    const msg = encodeURIComponent(
      `Hola Missa! Mi nombre es ${formData.name || 'un organizador'}. Quisiera cotizar una fecha para: ${eventName} en ${formData.location || 'mi ciudad'}${formData.date ? ' el día ' + formData.date : ''}. Mensaje: ${formData.message || 'Contacto directo'}`
    );
    window.open(`https://wa.me/5214443570777?text=${msg}`, '_blank');
    setSubmitted(true);
  };

  const directWhatsappUrl = "https://wa.me/5214443570777?text=Hola%20Missa,%20me%20gustar%C3%ADa%20cotizar%20una%20fecha%20o%20evento";

  return (
    <section id="contact" style={{ padding: '90px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">{t.booking.tag}</span>
          <h2>{t.booking.title}</h2>
          <p>{t.booking.desc}</p>
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
            <h3 className="font-display" style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '14px' }}>
              {t.booking.channelsTitle}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>
              {t.booking.channelsDesc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {/* WhatsApp Card */}
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textDecoration: 'none',
                  borderColor: 'rgba(37, 211, 102, 0.3)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(37, 211, 102, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(37, 211, 102, 0.2)'
                  }}
                >
                  <WhatsAppIcon size={26} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                    {t.booking.whatsappOfficial}
                  </span>
                  <strong style={{ color: '#fff', fontSize: '1.1rem' }}>
                    +52 1 444 357 0777
                  </strong>
                </div>
              </a>

              {/* Instagram DM Card */}
              <a
                href="https://www.instagram.com/missaa.fx/"
                target="_blank"
                rel="noreferrer"
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textDecoration: 'none',
                  borderColor: 'rgba(225, 48, 108, 0.3)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(225, 48, 108, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(225, 48, 108, 0.2)'
                  }}
                >
                  <InstagramIcon size={26} color="gradient" />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                    {t.booking.instagramDirect}
                  </span>
                  <strong style={{ color: '#fff', fontSize: '1.1rem' }}>
                    @missaa.fx
                  </strong>
                </div>
              </a>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-glass)'
              }}
            >
              <h4 style={{ color: '#fff', fontSize: '0.92rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#FF003C" /> {t.booking.policyTitle}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {t.booking.policyDesc}
              </p>
            </div>
          </div>

          {/* Quick Cotizador WhatsApp Form */}
          <div
            className="glass-panel"
            style={{
              padding: '36px',
              border: '1px solid rgba(255, 0, 60, 0.25)',
              background: 'linear-gradient(180deg, rgba(20, 18, 24, 0.95) 0%, rgba(10, 10, 14, 0.98) 100%)'
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(37, 211, 102, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto',
                    color: '#25D366'
                  }}
                >
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
                  {t.booking.successTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.92rem' }}>
                  {t.booking.successDesc}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary btn-sm"
                >
                  {t.booking.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#fff' }}>
                  {t.booking.formTitle}
                </h3>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {t.booking.labelName}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.booking.placeholderName}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {t.booking.labelEventType}
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: '#161620',
                        border: '1px solid var(--border-glass)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      <option value="club">{t.booking.eventOptions.club}</option>
                      <option value="restaurantBar">{t.booking.eventOptions.restaurantBar}</option>
                      <option value="festival">{t.booking.eventOptions.festival}</option>
                      <option value="private">{t.booking.eventOptions.private}</option>
                      <option value="rave">{t.booking.eventOptions.rave}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {t.booking.labelLocation}
                    </label>
                    <input
                      type="text"
                      placeholder={t.booking.placeholderLocation}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-glass)',
                        color: '#fff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {t.booking.labelMessage}
                  </label>
                  <textarea
                    rows="3"
                    placeholder={t.booking.placeholderMessage}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      fontSize: '0.92rem',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '10px', marginTop: '6px' }}
                >
                  <WhatsAppIcon size={20} color="#FFFFFF" innerColor="#FF003C" /> {t.booking.submitBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
