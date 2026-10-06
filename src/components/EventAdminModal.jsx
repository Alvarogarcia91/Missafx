import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  MapPin,
  Trash2,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import {
  fetchEvents,
  uploadFlyerImage,
  createEventRecord,
  deleteEventRecord
} from '../utils/supabaseClient';

const REQUIRED_PIN = '2305';

export default function EventAdminModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('missafx_admin_auth') === 'true';
  });
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Wizard form state
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'manage'
  const [flyerFile, setFlyerFile] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('SAN LUIS POTOSÍ • CLUB DOME');
  const [eventTitle, setEventTitle] = useState('EXCLUSIVE DJ SET');
  const [ticketUrl, setTicketUrl] = useState('https://wa.me/5214443570777');

  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(''); // 'success' | 'error' | ''
  const [statusMessage, setStatusMessage] = useState('');

  // Manage events list
  const [eventsList, setEventsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadManageList();
    }
  }, [isOpen, isAuthenticated]);

  const loadManageList = async () => {
    setLoadingList(true);
    try {
      const data = await fetchEvents();
      if (data) setEventsList(data);
    } catch (e) {
      console.warn('Error fetching events for manager:', e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleKeypadPress = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === REQUIRED_PIN) {
      setPinSuccess(true);
      setPinError(false);
      setTimeout(() => {
        setIsAuthenticated(true);
        sessionStorage.setItem('missafx_admin_auth', 'true');
        setPin('');
        loadManageList();
      }, 400);
    } else {
      setPinError(true);
      setPinSuccess(false);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerFile(file);
      const url = URL.createObjectURL(file);
      setFlyerPreview(url);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!flyerFile) {
      setPublishStatus('error');
      setStatusMessage('Por favor selecciona o sube una imagen de flyer');
      return;
    }
    if (!eventDate.trim() || !eventVenue.trim()) {
      setPublishStatus('error');
      setStatusMessage('La fecha y el lugar son obligatorios');
      return;
    }

    setPublishing(true);
    setPublishStatus('');
    setStatusMessage('');

    try {
      // 1. Upload flyer image to Supabase Storage
      const uploadedUrl = await uploadFlyerImage(flyerFile);

      // 2. Create event record in Supabase Database
      await createEventRecord({
        title: eventTitle || 'EXCLUSIVE DJ SET',
        date: eventDate,
        venue: eventVenue,
        imageUrl: uploadedUrl,
        ticketUrl: ticketUrl
      });

      setPublishStatus('success');
      setStatusMessage('¡Evento publicado con éxito en missafx.com!');

      // Reset form
      setFlyerFile(null);
      setFlyerPreview('');
      setEventDate('');

      // Notify parent component and reload list
      window.dispatchEvent(new CustomEvent('missafx-events-updated'));
      loadManageList();
    } catch (err) {
      console.error(err);
      setPublishStatus('error');
      setStatusMessage(err.message || 'Error al publicar el evento');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return;
    try {
      await deleteEventRecord(id);
      setEventsList((prev) => prev.filter((ev) => ev.id !== id));
      window.dispatchEvent(new CustomEvent('missafx-events-updated'));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isAuthenticated ? '680px' : '380px',
          maxHeight: '92vh',
          background: '#0c0c10',
          border: '1px solid rgba(255, 0, 60, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 0, 60, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 24px',
            background: 'rgba(18, 18, 24, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FF003C',
                boxShadow: '0 0 8px #FF003C'
              }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.08em'
              }}
            >
              {isAuthenticated ? 'MISSAFX // GESTOR DE EVENTOS' : 'ACCESO RESTRINGIDO // MISSA'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {!isAuthenticated ? (
            /* PIN Screen */
            <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255, 0, 60, 0.12)',
                  border: '1px solid rgba(255, 0, 60, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#FF003C'
                }}
              >
                <Lock size={26} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
                Ingresa el PIN
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
                Acceso exclusivo para Missa
              </p>

              {/* PIN Dots Display */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '14px',
                  marginBottom: '26px'
                }}
              >
                {[0, 1, 2, 3].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <div
                      key={index}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: pinError
                          ? '2px solid #ef4444'
                          : pinSuccess
                          ? '2px solid #22c55e'
                          : filled
                          ? '2px solid #FF003C'
                          : '2px solid rgba(255, 255, 255, 0.2)',
                        background: pinError
                          ? '#ef4444'
                          : pinSuccess
                          ? '#22c55e'
                          : filled
                          ? '#FF003C'
                          : 'transparent',
                        boxShadow: filled ? '0 0 10px #FF003C' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  );
                })}
              </div>

              {pinError && (
                <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 700, marginBottom: '14px' }}>
                  PIN INCORRECTO // REINTENTA
                </div>
              )}

              {pinSuccess && (
                <div style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 700, marginBottom: '14px' }}>
                  ACCESO AUTORIZADO...
                </div>
              )}

              {/* Numeric Keypad */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  maxWidth: '260px',
                  margin: '0 auto'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(String(num))}
                    style={{
                      height: '56px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.background = 'rgba(255, 0, 60, 0.25)'}
                    onMouseUp={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  style={{
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  BORRAR
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  style={{
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  0
                </button>
                <button
                  onClick={() => setPin('')}
                  style={{
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#FF003C',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  LIMPIAR
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Manager View */
            <div>
              {/* Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '4px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  onClick={() => setActiveTab('create')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'create' ? '#FF003C' : 'transparent',
                    color: activeTab === 'create' ? '#fff' : 'var(--text-muted, #94a3b8)',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={15} />
                  Publicar Nuevo Flyer
                </button>

                <button
                  onClick={() => setActiveTab('manage')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'manage' ? '#FF003C' : 'transparent',
                    color: activeTab === 'manage' ? '#fff' : 'var(--text-muted, #94a3b8)',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  Gestionar Eventos ({eventsList.length})
                </button>
              </div>

              {activeTab === 'create' ? (
                /* WIZARD FORM */
                <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Step 1: Upload Flyer */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                      1. SELECCIONA EL FLYER (FOTO)
                    </label>
                    <div
                      style={{
                        border: '2px dashed rgba(255, 0, 60, 0.35)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        background: 'rgba(255, 0, 60, 0.03)',
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />

                      {flyerPreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={flyerPreview}
                            alt="Preview"
                            style={{
                              maxHeight: '180px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              display: 'block'
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>
                            ✓ Flyer seleccionado (clic para cambiar)
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Upload size={32} color="#FF003C" />
                          <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#FFFFFF' }}>
                            Toca aquí para subir el flyer desde tu celular o PC
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            Acepta JPG, PNG, WEBP (Flyers generados con StoryCreator)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                      2. FECHA DEL EVENTO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. SÁBADO 14 NOV // 2026"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Step 3: Venue */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                      3. LUGAR / CIUDAD / CLUB
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. SAN LUIS POTOSÍ • CLUB DOME"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Step 4: Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                      4. TÍTULO DEL SET (OPCIONAL)
                    </label>
                    <input
                      type="text"
                      placeholder="EXCLUSIVE DJ SET"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Status alert */}
                  {publishStatus === 'error' && (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ef4444',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  {publishStatus === 'success' && (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#22c55e',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={publishing}
                    style={{
                      marginTop: '8px',
                      padding: '14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: publishing ? '#94a3b8' : '#FF003C',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: publishing ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      boxShadow: '0 6px 20px rgba(255, 0, 60, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {publishing ? 'PUBLICANDO EN LA NUBE...' : 'PUBLICAR EVENTO AHORA 🔥'}
                  </button>
                </form>
              ) : (
                /* MANAGE LIST */
                <div>
                  {loadingList ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                      Cargando eventos...
                    </div>
                  ) : eventsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      <p style={{ margin: '0 0 12px 0' }}>No hay eventos personalizados publicados todavía.</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: '#FF003C',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Publicar el primer flyer
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {eventsList.map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '12px 16px',
                            borderRadius: '12px'
                          }}
                        >
                          <img
                            src={ev.image_url}
                            alt=""
                            style={{
                              width: '46px',
                              height: '64px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ev.date}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ev.venue}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#FF003C', fontWeight: 700 }}>
                              {ev.title}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(ev.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              color: '#ef4444',
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}
                            title="Eliminar evento"
                          >
                            <Trash2 size={14} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
