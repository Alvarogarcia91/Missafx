import React, { useState, useEffect, useRef } from 'react';
import { Sliders, X, UserCheck, Activity, FileText, Radio, ExternalLink, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DjTools() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toolsList = [
    {
      id: 1,
      title: t.tools.tool1Title,
      desc: t.tools.tool1Desc,
      icon: UserCheck,
      url: '#' // Ready to assign URL
    },
    {
      id: 2,
      title: t.tools.tool2Title,
      desc: t.tools.tool2Desc,
      icon: Activity,
      url: '#' // Ready to assign URL
    },
    {
      id: 3,
      title: t.tools.tool3Title,
      desc: t.tools.tool3Desc,
      icon: FileText,
      url: '#' // Ready to assign URL
    },
    {
      id: 4,
      title: t.tools.tool4Title,
      desc: t.tools.tool4Desc,
      icon: Radio,
      url: '#' // Ready to assign URL
    }
  ];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: '22px',
        left: '22px',
        zIndex: 999
      }}
    >
      {/* Expanded Tools Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '0',
            width: '320px',
            maxWidth: 'calc(100vw - 44px)',
            padding: '20px',
            background: 'rgba(10, 10, 14, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 0, 60, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 0, 60, 0.15)',
            borderRadius: '18px',
            animation: 'fadeInTools 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-glass)'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: '#FF003C',
                  display: 'block'
                }}
              >
                {t.tools.title}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {t.tools.subtitle}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar herramientas"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* 4 Tool Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={(e) => {
                    e.preventDefault();
                    // Placeholders ready for upcoming URLs
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 0, 60, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 0, 60, 0.35)';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(255, 0, 60, 0.12)',
                        color: '#FF003C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block' }}>
                        {tool.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {tool.desc}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-muted)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {t.tools.statusPlaceholder}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Discrete Collapsed Trigger Button ("Bien Sordo") */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Herramientas DJ"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'rgba(10, 10, 14, 0.72)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '999px',
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: '0.76rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.25s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'rgba(255, 0, 60, 0.4)';
          e.currentTarget.style.background = 'rgba(16, 16, 22, 0.9)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 0, 60, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.background = 'rgba(10, 10, 14, 0.72)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
        }}
      >
        <Sliders size={14} color="#FF003C" />
        <span>{t.tools.trigger}</span>
        <ChevronUp
          size={13}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      <style>{`
        @keyframes fadeInTools {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
