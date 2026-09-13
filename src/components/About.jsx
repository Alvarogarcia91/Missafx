import React from 'react';
import { Sliders, Headphones, Download, Award, Music2, Radio } from 'lucide-react';

export default function About() {
  return (
    <section id="about" style={{ padding: '100px 0', position: 'relative' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '60px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Visual Highlights */}
          <div>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '30px' }}>
              <span className="section-tag">SOBRE EL ARTISTA</span>
              <h2>EL SONIDO DETRÁS DE LA ENERGÍA</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '20px', lineHeight: 1.8 }}>
              Con una visión clara de la música electrónica contemporánea, <strong style={{ color: '#fff' }}>DJ Missa</strong> ha consolidado
              su identidad a través de sesiones dinámicas caracterizadas por líneas de bajo profundas, percusiones envolventes y una selección
              precisa de ritmos Tech House y sonidos progresivos.
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '36px', lineHeight: 1.8 }}>
              Desde clubs íntimos underground hasta los festivales más vibrantes, cada una de sus presentaciones es un viaje diseñado para
              mantener a la audiencia conectada de principio a fin.
            </p>

            {/* Feature Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '36px'
              }}
            >
              <div className="glass-panel" style={{ padding: '18px 22px' }}>
                <Headphones size={24} color="var(--accent-cyan)" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>Mezcla Enérgica</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Transiciones fluidas y lectura impecable del público.</p>
              </div>

              <div className="glass-panel" style={{ padding: '18px 22px' }}>
                <Sliders size={24} color="var(--accent-purple)" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>Producción Propia</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Edits, bootlegs y tracks originales con sonido de vanguardia.</p>
              </div>
            </div>

            {/* Press Kit CTA */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="#booking"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                <Download size={18} /> Descargar Press Kit & Bio (PDF)
              </a>
            </div>
          </div>

          {/* Right Column: Technical Rider / Setup Card */}
          <div>
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(20, 19, 36, 0.9) 0%, rgba(10, 10, 18, 0.95) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                  }}
                >
                  <Sliders size={22} />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#fff' }}>
                    RIDER TÉCNICO BÁSICO
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Configuración de cabina para promotores</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  <strong>Reproductores:</strong> 2x Pioneer CDJ-3000 o CDJ-2000NXS2
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
                  <strong>Mixer:</strong> Pioneer DJM-A9 o DJM-900NXS2
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)' }} />
                  <strong>Monitoreo:</strong> 2x Monitores de cabina activos estéreo (Booth)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-violet)' }} />
                  <strong>Conectividad:</strong> Pro DJ Link Ethernet Switch & AC 110/220V
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
                  ¿Necesitas especificaciones técnicas completas o rider de hospitalidad?
                </span>
                <a
                  href="#booking"
                  style={{
                    display: 'block',
                    color: 'var(--accent-cyan)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginTop: '6px',
                    textDecoration: 'none'
                  }}
                >
                  Solicitar Rider Completo →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
