import React from 'react';
import { Image as ImageIcon, QrCode, ArrowUpRight, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DjTools({ onOpenStoryCreator, onOpenCardCreator }) {
  const { t } = useLanguage();

  const toolsList = [
    {
      id: 1,
      title: t.tools.tool1Title,
      desc: t.tools.tool1Desc,
      icon: ImageIcon,
      isAvailable: true,
      status: t.tools.tool1Status,
      action: onOpenStoryCreator
    },
    {
      id: 2,
      title: t.tools.tool2Title,
      desc: t.tools.tool2Desc,
      icon: QrCode,
      isAvailable: true,
      status: t.tools.tool2Status,
      action: onOpenCardCreator
    }
  ];

  return (
    <section
      id="dj-tools"
      style={{
        padding: '80px 0 90px 0',
        position: 'relative',
        borderTop: '1px solid var(--border-glass)',
        background: 'linear-gradient(180deg, rgba(8, 8, 12, 0.4) 0%, rgba(5, 5, 8, 0.95) 100%)'
      }}
    >
      <div className="container">
        <div className="section-header">
          <span className="section-tag" style={{ gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
            <Wrench size={13} color="#FF003C" />
            {t.tools.tag}
          </span>
          <h2>{t.tools.title}</h2>
          <p>{t.tools.subtitle}</p>
        </div>

        {/* 2 Tool Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            maxWidth: '920px',
            margin: '0 auto'
          }}
        >
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="glass-panel"
                style={{
                  padding: '24px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 0, 60, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.6), 0 0 20px rgba(255, 0, 60, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '18px'
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(255, 0, 60, 0.12)',
                        border: '1px solid rgba(255, 0, 60, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF003C'
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: tool.isAvailable ? '#FF003C' : 'var(--text-dim)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: tool.isAvailable ? 'rgba(255, 0, 60, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                        border: tool.isAvailable ? '1px solid rgba(255, 0, 60, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      {tool.status}
                    </span>
                  </div>

                  <h3
                    className="font-display"
                    style={{
                      fontSize: '1.15rem',
                      color: '#fff',
                      marginBottom: '8px'
                    }}
                  >
                    {tool.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      marginBottom: '22px'
                    }}
                  >
                    {tool.desc}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (tool.action) {
                      tool.action();
                    }
                  }}
                  disabled={!tool.isAvailable}
                  className={`btn ${tool.isAvailable ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    cursor: tool.isAvailable ? 'pointer' : 'not-allowed',
                    opacity: tool.isAvailable ? 1 : 0.6
                  }}
                >
                  <span>{t.tools.openTool || 'Abrir Herramienta'}</span>
                  <ArrowUpRight size={15} color={tool.isAvailable ? '#fff' : '#FF003C'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
