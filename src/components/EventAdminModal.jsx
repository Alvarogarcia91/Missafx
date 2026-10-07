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
  Edit2,
  Sparkles,
  ExternalLink,
  Plus,
  Tv,
  Play,
  Film,
  Video,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Shuffle,
  Ticket,
  MessageSquare,
  Phone,
  UserCheck,
  Globe,
  Wand2
} from 'lucide-react';
import {
  fetchEvents,
  sortEventsByDate,
  uploadFlyerImage,
  createEventRecord,
  updateEventRecord,
  deleteEventRecord,
  fetchSets,
  createSetRecord,
  deleteSetRecord,
  getYouTubeId,
  getEventStatus,
  getEventCoupon,
  extractEventDetails,
  buildEventTicketUrl,
  sanitizePhoneNumber,
  getCleanTicketUrl,
  getCleanTitle,
  isVideoMedia,
  fetchCarouselPhotos,
  fetchCarouselData,
  saveCarouselPhotos,
  saveCarouselRandom,
  resetCarouselPhotos,
  DEFAULT_CAROUSEL_PHOTOS
} from '../utils/supabaseClient';

const REQUIRED_PIN = '2305';

export default function EventAdminModal({ isOpen, onClose }) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('missafx_admin_auth') === 'true';
  });
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  // High level section: 'events' | 'sets' | 'carousel'
  const [adminSection, setAdminSection] = useState('events');

  // Events wizard form state
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'manage'
  const [editingEventId, setEditingEventId] = useState(null);
  const [flyerFile, setFlyerFile] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('SAN LUIS POTOSÍ • CLUB DOME');
  const [eventTitle, setEventTitle] = useState('EXCLUSIVE DJ SET');
  const [ticketUrl, setTicketUrl] = useState('https://wa.me/5214443570777');
  const [eventStatusBadge, setEventStatusBadge] = useState('none'); // 'none' | 'sold_out' | 'last_tickets'
  const [contactType, setContactType] = useState('missa'); // 'missa' | 'rp' | 'custom'
  const [rpPhone, setRpPhone] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState(''); // 'success' | 'error' | ''
  const [statusMessage, setStatusMessage] = useState('');

  // Manage events list
  const [eventsList, setEventsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Sets state
  const [activeSetsTab, setActiveSetsTab] = useState('add'); // 'add' | 'manage'
  const [setsList, setSetsList] = useState([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [setYoutubeUrl, setSetYoutubeUrl] = useState('');
  const [setTitle, setSetTitle] = useState('');
  const [setSubtitle, setSetSubtitle] = useState('TECH HOUSE // LIVE SET');
  const [savingSet, setSavingSet] = useState(false);
  const [setStatus, setSetStatus] = useState('');
  const [setStatusMsg, setSetStatusMsg] = useState('');

  // Carousel state
  const [carouselPhotos, setCarouselPhotos] = useState([]);
  const [carouselIsRandom, setCarouselIsRandom] = useState(false);
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const [carouselFile, setCarouselFile] = useState(null);
  const [carouselPreview, setCarouselPreview] = useState('');
  const [carouselStatus, setCarouselStatus] = useState('');
  const [carouselStatusMsg, setCarouselStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadManageList();
      loadSetsList();
      loadCarouselList();
    }
  }, [isOpen, isAuthenticated]);

  const loadManageList = async () => {
    setLoadingList(true);
    try {
      const data = await fetchEvents();
      if (data) setEventsList(sortEventsByDate(data));
    } catch (e) {
      console.warn('Error fetching events for manager:', e);
    } finally {
      setLoadingList(false);
    }
  };

  const loadSetsList = async () => {
    setLoadingSets(true);
    try {
      const data = await fetchSets();
      if (data) setSetsList(data);
    } catch (e) {
      console.warn('Error fetching sets for manager:', e);
    } finally {
      setLoadingSets(false);
    }
  };

  const loadCarouselList = async () => {
    setLoadingCarousel(true);
    try {
      const data = await fetchCarouselData();
      if (data && Array.isArray(data.photos)) {
        setCarouselPhotos(data.photos);
        setCarouselIsRandom(Boolean(data.isRandom));
      }
    } catch (e) {
      console.warn('Error fetching carousel data:', e);
    } finally {
      setLoadingCarousel(false);
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
        loadSetsList();
        loadCarouselList();
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

  const startEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setEventDate(ev.date || '');
    setEventVenue(ev.venue || '');
    setEventTitle(getCleanTitle(ev.title));

    const details = extractEventDetails(ev);
    setEventStatusBadge(details.status || 'none');
    setContactType(details.contactType || 'missa');
    setRpPhone(details.rpPhone || '');
    setCustomUrl(details.customUrl || '');
    setCustomWaMessage(details.customWaMessage || '');
    setCouponCode(details.coupon || '');

    setTicketUrl(getCleanTicketUrl(ev.ticket_url));
    setFlyerPreview(ev.image_url || '');
    setFlyerFile(null);
    setPublishStatus('');
    setStatusMessage('');
    setActiveTab('create');
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEventDate('');
    setEventVenue('SAN LUIS POTOSÍ • CLUB DOME');
    setEventTitle('EXCLUSIVE DJ SET');
    setTicketUrl('https://wa.me/5214443570777');
    setEventStatusBadge('none');
    setContactType('missa');
    setRpPhone('');
    setCustomUrl('');
    setCustomWaMessage('');
    setCouponCode('');
    setFlyerPreview('');
    setFlyerFile(null);
    setPublishStatus('');
    setStatusMessage('');
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!flyerFile && !flyerPreview) {
      setPublishStatus('error');
      setStatusMessage('Por favor selecciona o sube un flyer (foto o video MP4)');
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
      let finalMediaUrl = flyerPreview;
      if (flyerFile) {
        finalMediaUrl = await uploadFlyerImage(flyerFile);
      }

      const finalTicketUrl = buildEventTicketUrl({
        contactType,
        rpPhone,
        customUrl,
        customMessage: customWaMessage,
        eventTitle,
        eventVenue,
        couponCode,
        statusBadge: eventStatusBadge
      });

      if (editingEventId) {
        // UPDATE EVENT
        await updateEventRecord(editingEventId, {
          title: eventTitle || 'EXCLUSIVE DJ SET',
          date: eventDate,
          venue: eventVenue,
          imageUrl: finalMediaUrl,
          ticketUrl: finalTicketUrl,
          statusBadge: eventStatusBadge,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : ''
        });

        setPublishStatus('success');
        setStatusMessage('¡Evento actualizado con éxito en missafx.com!');
        setEditingEventId(null);
      } else {
        // CREATE EVENT
        await createEventRecord({
          title: eventTitle || 'EXCLUSIVE DJ SET',
          date: eventDate,
          venue: eventVenue,
          imageUrl: finalMediaUrl,
          ticketUrl: finalTicketUrl,
          statusBadge: eventStatusBadge,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : ''
        });

        setPublishStatus('success');
        setStatusMessage('¡Evento publicado con éxito en missafx.com!');
      }

      // Reset form
      setFlyerFile(null);
      setFlyerPreview('');
      setEventDate('');
      setEventStatusBadge('none');
      setContactType('missa');
      setRpPhone('');
      setCustomUrl('');
      setCustomWaMessage('');
      setCouponCode('');

      // Notify parent component and reload list
      window.dispatchEvent(new CustomEvent('missafx-events-updated'));
      loadManageList();
    } catch (err) {
      console.error(err);
      setPublishStatus('error');
      setStatusMessage(err.message || 'Error al guardar el evento');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento?')) return;
    try {
      await deleteEventRecord(id);
      setEventsList((prev) => prev.filter((ev) => ev.id !== id));
      if (editingEventId === id) cancelEditEvent();
      window.dispatchEvent(new CustomEvent('missafx-events-updated'));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleAddSet = async (e) => {
    e.preventDefault();
    const yId = getYouTubeId(setYoutubeUrl);
    if (!yId) {
      setSetStatus('error');
      setSetStatusMsg('Enlace de YouTube no válido. Asegúrate de pegar el link completo de YouTube');
      return;
    }

    setSavingSet(true);
    setSetStatus('');
    setSetStatusMsg('');

    try {
      await createSetRecord({
        youtubeUrl: setYoutubeUrl,
        title: setTitle.trim() || 'MISSAFX LIVE SET',
        subtitle: setSubtitle.trim() || 'LIVE DJ SET'
      });

      setSetStatus('success');
      setSetStatusMsg('¡Set de YouTube agregado con éxito!');
      setSetYoutubeUrl('');
      setSetTitle('');
      setSetSubtitle('TECH HOUSE // LIVE SET');

      window.dispatchEvent(new CustomEvent('missafx-sets-updated'));
      loadSetsList();
    } catch (err) {
      console.error(err);
      setSetStatus('error');
      setSetStatusMsg(err.message || 'Error al guardar el set');
    } finally {
      setSavingSet(false);
    }
  };

  const handleDeleteSet = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este set de YouTube?')) return;
    try {
      await deleteSetRecord(id);
      window.dispatchEvent(new CustomEvent('missafx-sets-updated'));
      loadSetsList();
    } catch (err) {
      alert('Error al eliminar set: ' + err.message);
    }
  };

  // Carousel handlers
  const handleCarouselFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarouselFile(file);
      const url = URL.createObjectURL(file);
      setCarouselPreview(url);
    }
  };

  const handleUploadCarouselPhoto = async (e) => {
    e.preventDefault();
    if (!carouselFile) {
      setCarouselStatus('error');
      setCarouselStatusMsg('Por favor selecciona una foto para subir');
      return;
    }

    setUploadingCarousel(true);
    setCarouselStatus('');
    setCarouselStatusMsg('');

    try {
      const uploadedUrl = await uploadFlyerImage(carouselFile);
      const updated = [...carouselPhotos, uploadedUrl];
      await saveCarouselPhotos(updated);
      setCarouselPhotos(updated);

      setCarouselStatus('success');
      setCarouselStatusMsg('¡Foto agregada al carrousel con éxito!');
      setCarouselFile(null);
      setCarouselPreview('');

      window.dispatchEvent(new CustomEvent('missafx-carousel-updated'));
    } catch (err) {
      console.error(err);
      setCarouselStatus('error');
      setCarouselStatusMsg(err.message || 'Error al subir foto');
    } finally {
      setUploadingCarousel(false);
    }
  };

  const handleDeleteCarouselPhoto = async (index) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta foto del carrousel?')) return;
    try {
      const updated = carouselPhotos.filter((_, i) => i !== index);
      await saveCarouselPhotos(updated);
      setCarouselPhotos(updated);
      window.dispatchEvent(new CustomEvent('missafx-carousel-updated'));
    } catch (err) {
      alert('Error al eliminar foto: ' + err.message);
    }
  };

  const handleMoveCarouselPhoto = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= carouselPhotos.length) return;
    const updated = [...carouselPhotos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    await saveCarouselPhotos(updated);
    setCarouselPhotos(updated);
    window.dispatchEvent(new CustomEvent('missafx-carousel-updated'));
  };

  const handleToggleCarouselRandom = async (checked) => {
    setCarouselIsRandom(checked);
    try {
      await saveCarouselRandom(checked);
      window.dispatchEvent(new CustomEvent('missafx-carousel-updated'));
    } catch (err) {
      console.error('Error saving carousel random config:', err);
    }
  };

  const handleResetCarousel = async () => {
    if (!window.confirm('¿Restablecer el carrousel a las 9 fotos oficiales originales?')) return;
    try {
      const def = await resetCarouselPhotos();
      setCarouselPhotos(def);
      setCarouselIsRandom(false);
      window.dispatchEvent(new CustomEvent('missafx-carousel-updated'));
    } catch (err) {
      alert('Error al restablecer: ' + err.message);
    }
  };

  if (!isOpen) return null;

  const detectedSetId = getYouTubeId(setYoutubeUrl);
  const isFlyerVideo = (flyerFile && flyerFile.type?.startsWith('video/')) || isVideoMedia(flyerPreview);

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
          maxWidth: isAuthenticated ? '760px' : '380px',
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
              {isAuthenticated ? 'MISSAFX // PANEL DE ADMINISTRACIÓN' : 'ACCESO RESTRINGIDO // MISSA'}
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
              {/* TOP LEVEL MODULE SELECTOR (3 MODULES) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  onClick={() => setAdminSection('events')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: adminSection === 'events' ? '1px solid rgba(255, 0, 60, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: adminSection === 'events' ? 'rgba(255, 0, 60, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    color: adminSection === 'events' ? '#FFFFFF' : 'var(--text-muted, #94a3b8)',
                    fontWeight: 800,
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: adminSection === 'events' ? '0 0 15px rgba(255, 0, 60, 0.2)' : 'none'
                  }}
                >
                  <Calendar size={15} color={adminSection === 'events' ? '#FF003C' : '#94a3b8'} />
                  <span>EVENTOS ({eventsList.length})</span>
                </button>

                <button
                  onClick={() => setAdminSection('sets')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: adminSection === 'sets' ? '1px solid rgba(255, 0, 60, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: adminSection === 'sets' ? 'rgba(255, 0, 60, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    color: adminSection === 'sets' ? '#FFFFFF' : 'var(--text-muted, #94a3b8)',
                    fontWeight: 800,
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: adminSection === 'sets' ? '0 0 15px rgba(255, 0, 60, 0.2)' : 'none'
                  }}
                >
                  <Tv size={15} color={adminSection === 'sets' ? '#FF003C' : '#94a3b8'} />
                  <span>SETS ({setsList.length})</span>
                </button>

                <button
                  onClick={() => setAdminSection('carousel')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: adminSection === 'carousel' ? '1px solid rgba(255, 0, 60, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: adminSection === 'carousel' ? 'rgba(255, 0, 60, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    color: adminSection === 'carousel' ? '#FFFFFF' : 'var(--text-muted, #94a3b8)',
                    fontWeight: 800,
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: adminSection === 'carousel' ? '0 0 15px rgba(255, 0, 60, 0.2)' : 'none'
                  }}
                >
                  <ImageIcon size={15} color={adminSection === 'carousel' ? '#FF003C' : '#94a3b8'} />
                  <span>CARROUSEL ({carouselPhotos.length})</span>
                </button>
              </div>

              {/* ======================================================== */}
              {/* SECTION 1: FLYERS & EVENTOS */}
              {/* ======================================================== */}
              {adminSection === 'events' && (
                <div>
                  {/* Tab Selector */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '22px',
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
                      {editingEventId ? <Edit2 size={15} /> : <Plus size={15} />}
                      {editingEventId ? 'Editando Evento' : 'Publicar Nuevo Flyer'}
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
                    /* FLYER WIZARD FORM (CREATE / EDIT) */
                    <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {/* Editing Banner */}
                      {editingEventId && (
                        <div
                          style={{
                            padding: '12px 16px',
                            background: 'rgba(255, 0, 60, 0.12)',
                            border: '1px solid rgba(255, 0, 60, 0.4)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Edit2 size={16} color="#FF003C" />
                            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF' }}>
                              MODO EDICIÓN DE EVENTO
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={cancelEditEvent}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#94a3b8',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar edición
                          </button>
                        </div>
                      )}

                      {/* Step 1: Upload Flyer (Photo or MP4 Video) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          1. SELECCIONA EL FLYER (FOTO O VIDEO MP4)
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
                            accept="image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime"
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
                              {isFlyerVideo ? (
                                <video
                                  src={flyerPreview}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{
                                    maxHeight: '190px',
                                    maxWidth: '100%',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    display: 'block'
                                  }}
                                />
                              ) : (
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
                              )}
                              <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>
                                ✓ Flyer {isFlyerVideo ? 'Video MP4' : 'Foto'} cargado (toca para cambiar)
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <Upload size={32} color="#FF003C" />
                              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#FFFFFF' }}>
                                Toca aquí para subir flyer o video desde tu celular o PC
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                                Acepta Fotos (JPG, PNG, WEBP) o Videos (MP4, WEBM)
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

                      {/* Step 5: Status Badge */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          5. ESTADO DE BOLETOS // MARCA DEL EVENTO
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setEventStatusBadge('none')}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '8px',
                              border: eventStatusBadge === 'none' ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: eventStatusBadge === 'none' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                              color: eventStatusBadge === 'none' ? '#22c55e' : '#94a3b8',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🟢 EN VENTA (NORMAL)
                          </button>

                          <button
                            type="button"
                            onClick={() => setEventStatusBadge('last_tickets')}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '8px',
                              border: eventStatusBadge === 'last_tickets' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: eventStatusBadge === 'last_tickets' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                              color: eventStatusBadge === 'last_tickets' ? '#fbbf24' : '#94a3b8',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            ⚡ ÚLTIMOS BOLETOS
                          </button>

                          <button
                            type="button"
                            onClick={() => setEventStatusBadge('sold_out')}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '8px',
                              border: eventStatusBadge === 'sold_out' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: eventStatusBadge === 'sold_out' ? 'rgba(239, 68, 68, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                              color: eventStatusBadge === 'sold_out' ? '#ef4444' : '#94a3b8',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🔴 SOLD OUT (AGOTADO)
                          </button>
                        </div>
                      </div>

                      {/* Step 6: Contact Destination (Missa WhatsApp, RP WhatsApp, or External URL) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          6. DESTINO DE RESERVACIÓN // WHATSAPP O ENLACE
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setContactType('missa')}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '8px',
                              border: contactType === 'missa' ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: contactType === 'missa' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                              color: contactType === 'missa' ? '#22c55e' : '#94a3b8',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              textAlign: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <UserCheck size={18} color={contactType === 'missa' ? '#22c55e' : '#94a3b8'} />
                            <span>WA OFICIAL MISSA</span>
                            <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>444 357 0777</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setContactType('rp')}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '8px',
                              border: contactType === 'rp' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: contactType === 'rp' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                              color: contactType === 'rp' ? '#38bdf8' : '#94a3b8',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              textAlign: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Phone size={18} color={contactType === 'rp' ? '#38bdf8' : '#94a3b8'} />
                            <span>WA DE RP / PROMOTOR</span>
                            <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>Número específico</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setContactType('custom')}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '8px',
                              border: contactType === 'custom' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: contactType === 'custom' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                              color: contactType === 'custom' ? '#c084fc' : '#94a3b8',
                              fontWeight: 800,
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              textAlign: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Globe size={18} color={contactType === 'custom' ? '#c084fc' : '#94a3b8'} />
                            <span>ENLACE EXTERNO</span>
                            <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>Boletia, Passline...</span>
                          </button>
                        </div>

                        {contactType === 'rp' && (
                          <div style={{ marginTop: '8px' }}>
                            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                              📱 NÚMERO DE WHATSAPP DEL RP / ORGANIZADOR (10 DÍGITOS O CON LADA)
                            </label>
                            <input
                              type="tel"
                              placeholder="Ej. 4441234567 o +52 1 444 123 4567"
                              value={rpPhone}
                              onChange={(e) => setRpPhone(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                background: 'rgba(56, 189, 248, 0.05)',
                                color: '#FFFFFF',
                                fontSize: '0.90rem',
                                fontWeight: 600,
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.70rem', color: '#64748b' }}>
                              Al dar clic en reservar, se abrirá WhatsApp directamente con este RP.
                            </p>
                          </div>
                        )}

                        {contactType === 'custom' && (
                          <div style={{ marginTop: '8px' }}>
                            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
                              🌐 ENLACE COMPLETO DE BOLETERA O PÁGINA EXTERNA
                            </label>
                            <input
                              type="url"
                              placeholder="https://boletia.com/eventos/..."
                              value={customUrl}
                              onChange={(e) => setCustomUrl(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                background: 'rgba(168, 85, 247, 0.05)',
                                color: '#FFFFFF',
                                fontSize: '0.90rem',
                                fontWeight: 600,
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Step 7: Pre-filled WhatsApp Message (Only if contact is WhatsApp) */}
                      {contactType !== 'custom' && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MessageSquare size={15} color="#22c55e" />
                              <span>7. MENSAJE PRE-ESCRITO DE WHATSAPP</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                let defaultMsg = '¡Hola! Vengo desde missafx.com y me gustaría información y accesos para el evento';
                                if (eventVenue && eventVenue.trim()) defaultMsg += ` en ${eventVenue.trim()}`;
                                defaultMsg += '.';
                                setCustomWaMessage(defaultMsg);
                              }}
                              style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                color: '#22c55e',
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Wand2 size={12} />
                              Mensaje sugerido
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            placeholder="Ej. ¡Hola! Vengo desde missafx.com y me gustaría información y accesos para el evento."
                            value={customWaMessage}
                            onChange={(e) => setCustomWaMessage(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#FFFFFF',
                              fontSize: '0.86rem',
                              fontFamily: 'inherit',
                              lineHeight: 1.4,
                              outline: 'none',
                              boxSizing: 'border-box',
                              resize: 'vertical'
                            }}
                          />
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.70rem', color: '#64748b' }}>
                            {couponCode.trim()
                              ? `💡 Al enviar, se agregará automáticamente al final: "Código de descuento / cortesía: ${couponCode.trim().toUpperCase()}".`
                              : '💡 Si dejas este campo vacío, se usará el mensaje profesional estándar de Missafx.'}
                          </p>
                        </div>
                      )}

                      {/* Step 8: Promo Code / Coupon (Optional) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Ticket size={15} color="#10b981" />
                            <span>8. CÓDIGO DE CUPÓN / PROMOCIÓN (OPCIONAL)</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. MISSA10, VIPGUEST, TECHNO20"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: couponCode.trim() ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                            background: couponCode.trim() ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                            color: couponCode.trim() ? '#34d399' : '#FFFFFF',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                        {couponCode.trim() ? (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1rem' }}>🎟️</span>
                              <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399' }}>
                                  VISTA PREVIA DEL DISTINTIVO:
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                                  El flyer mostrará la marca "RESERVA CON CUPÓN: {couponCode.trim().toUpperCase()}"
                                </div>
                              </div>
                            </div>
                            <span
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 900,
                                letterSpacing: '0.08em',
                                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                              }}
                            >
                              {couponCode.trim().toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.70rem', color: '#64748b' }}>
                            Si agregas un código, el flyer mostrará una etiqueta verde exclusiva y el botón dirá "RESERVAR CON CUPÓN".
                          </p>
                        )}
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
                        {publishing
                          ? 'GUARDANDO EN LA NUBE...'
                          : editingEventId
                          ? 'GUARDAR CAMBIOS // ACTUALIZAR EVENTO 💾'
                          : 'PUBLICAR EVENTO AHORA 🔥'}
                      </button>
                    </form>
                  ) : (
                    /* MANAGE EVENTS LIST */
                    <div>
                      {loadingList ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                          Cargando eventos...
                        </div>
                      ) : eventsList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                          <p style={{ margin: '0 0 12px 0' }}>No hay eventos publicados todavía.</p>
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
                          {eventsList.map((ev) => {
                            const status = getEventStatus(ev);
                            const isVid = isVideoMedia(ev.image_url);
                            const coupon = getEventCoupon(ev);
                            const details = extractEventDetails(ev);

                            return (
                              <div
                                key={ev.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '14px',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: status === 'sold_out'
                                    ? '1px solid rgba(239, 68, 68, 0.4)'
                                    : status === 'last_tickets'
                                    ? '1px solid rgba(245, 158, 11, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                  padding: '12px 16px',
                                  borderRadius: '12px'
                                }}
                              >
                                <div
                                  style={{
                                    width: '46px',
                                    height: '64px',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    background: '#000',
                                    flexShrink: 0,
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    position: 'relative'
                                  }}
                                >
                                  {isVid ? (
                                    <video
                                      src={ev.image_url}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <img
                                      src={ev.image_url}
                                      alt=""
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {ev.date}
                                    </div>
                                    {status === 'sold_out' && (
                                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                                        SOLD OUT
                                      </span>
                                    )}
                                    {status === 'last_tickets' && (
                                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(245,158,11,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                                        ÚLTIMOS BOLETOS
                                      </span>
                                    )}
                                    {isVid && (
                                      <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56,189,248,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                                        MP4
                                      </span>
                                    )}
                                    {coupon && (
                                      <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                                        🎟️ {coupon}
                                      </span>
                                    )}
                                    {details.contactType === 'rp' && (
                                      <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                                        RP {details.rpPhone ? `(${details.rpPhone})` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {ev.venue}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#FF003C', fontWeight: 700 }}>
                                    {getCleanTitle(ev.title)}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    onClick={() => startEditEvent(ev)}
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      border: '1px solid rgba(255, 255, 255, 0.15)',
                                      borderRadius: '8px',
                                      color: '#FFFFFF',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                      fontSize: '0.78rem'
                                    }}
                                    title="Editar evento"
                                  >
                                    <Edit2 size={14} color="#FF003C" />
                                    <span>Editar</span>
                                  </button>

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
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* SECTION 2: SETS DE YOUTUBE */}
              {/* ======================================================== */}
              {adminSection === 'sets' && (
                <div>
                  {/* Sets Tab Selector */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '22px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '4px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <button
                      onClick={() => setActiveSetsTab('add')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSetsTab === 'add' ? '#FF003C' : 'transparent',
                        color: activeSetsTab === 'add' ? '#fff' : 'var(--text-muted, #94a3b8)',
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
                      Agregar Set de YouTube
                    </button>

                    <button
                      onClick={() => setActiveSetsTab('manage')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSetsTab === 'manage' ? '#FF003C' : 'transparent',
                        color: activeSetsTab === 'manage' ? '#fff' : 'var(--text-muted, #94a3b8)',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      Gestionar Sets ({setsList.length})
                    </button>
                  </div>

                  {activeSetsTab === 'add' ? (
                    /* ADD SET FORM */
                    <form onSubmit={handleAddSet} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {/* Step 1: YouTube URL */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          1. ENLACE DE YOUTUBE (URL DEL SET)
                        </label>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={setYoutubeUrl}
                          onChange={(e) => setSetYoutubeUrl(e.target.value)}
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

                        {/* Real-time YouTube Preview */}
                        {detectedSetId && (
                          <div
                            style={{
                              marginTop: '12px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1px solid rgba(255, 0, 60, 0.4)',
                              background: '#060608',
                              maxWidth: '320px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
                              <img
                                src={`https://img.youtube.com/vi/${detectedSetId}/hqdefault.jpg`}
                                alt="Previsualización"
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
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  background: 'rgba(255, 0, 60, 0.90)',
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  boxShadow: '0 0 16px rgba(255, 0, 60, 0.6)'
                                }}
                              >
                                <Play size={20} fill="#fff" style={{ marginLeft: '2px' }} />
                              </div>
                            </div>
                            <div
                              style={{
                                padding: '8px 12px',
                                background: 'rgba(18, 18, 24, 0.95)',
                                fontSize: '0.74rem',
                                color: '#22c55e',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <CheckCircle size={14} />
                              <span>Video detectado (ID: {detectedSetId})</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 2: Title */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          2. TÍTULO DEL SET
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. WHITEBOX LAB SESSIONS #009 | MISSA B2B DANI TECH"
                          value={setTitle}
                          onChange={(e) => setSetTitle(e.target.value)}
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

                      {/* Step 3: Subtitle / Genre */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                          3. GÉNERO / ETIQUETA / SUBTÍTULO
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. TECH HOUSE // LIVE SET"
                          value={setSubtitle}
                          onChange={(e) => setSetSubtitle(e.target.value)}
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
                      {setStatus === 'error' && (
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
                          <span>{setStatusMsg}</span>
                        </div>
                      )}

                      {setStatus === 'success' && (
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
                          <span>{setStatusMsg}</span>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={savingSet}
                        style={{
                          marginTop: '8px',
                          padding: '14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: savingSet ? '#94a3b8' : '#FF003C',
                          color: '#FFFFFF',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          cursor: savingSet ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          boxShadow: '0 6px 20px rgba(255, 0, 60, 0.4)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {savingSet ? 'GUARDANDO SET...' : 'PUBLICAR SET EN LA WEB 🔥'}
                      </button>
                    </form>
                  ) : (
                    /* MANAGE SETS LIST */
                    <div>
                      {loadingSets ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                          Cargando sets...
                        </div>
                      ) : setsList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                          <p style={{ margin: '0 0 12px 0' }}>No hay sets de YouTube disponibles.</p>
                          <button
                            onClick={() => setActiveSetsTab('add')}
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
                            Agregar el primer set
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {setsList.map((item) => (
                            <div
                              key={item.id}
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
                              <div
                                style={{
                                  width: '90px',
                                  aspectRatio: '16 / 9',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  background: '#000',
                                  flexShrink: 0,
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  position: 'relative'
                                }}
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
                                  alt=""
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    color: '#fff',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {item.title}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#FF003C', fontWeight: 700 }}>
                                  {item.subtitle || 'LIVE SET'}
                                </div>
                                <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
                                  ID: {item.youtube_id}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <a
                                  href={`https://www.youtube.com/watch?v=${item.youtube_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none'
                                  }}
                                  title="Ver en YouTube"
                                >
                                  <ExternalLink size={14} />
                                </a>

                                <button
                                  onClick={() => handleDeleteSet(item.id)}
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
                                  title="Eliminar set"
                                >
                                  <Trash2 size={14} />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* SECTION 3: FOTOS DE CARROUSEL */}
              {/* ======================================================== */}
              {adminSection === 'carousel' && (
                <div>
                  {/* Top Info & Reset Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>
                        FOTOS ACTIVAS EN CARROUSEL: {carouselPhotos.length}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        Aparecen en el Hero principal y en la sección Bio & Rider.
                      </div>
                    </div>

                    <button
                      onClick={handleResetCarousel}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#94a3b8',
                        padding: '6px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Restablecer fotos oficiales"
                    >
                      <RotateCcw size={13} />
                      <span>Restablecer Originales</span>
                    </button>
                  </div>

                  {/* Carousel Mode Config: Random Shuffle vs Sequential Order */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      marginBottom: '20px',
                      background: carouselIsRandom
                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(255, 0, 60, 0.08) 100%)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: carouselIsRandom
                        ? '1px solid rgba(168, 85, 247, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, marginRight: '16px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: carouselIsRandom ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          color: carouselIsRandom ? '#c084fc' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Shuffle size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                            ORDEN ALEATORIO (SHUFFLE)
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: carouselIsRandom ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                              color: carouselIsRandom ? '#e9d5ff' : '#94a3b8',
                              border: carouselIsRandom ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            {carouselIsRandom ? 'ALEATORIO ON' : 'SECUENCIAL (#1, #2...)'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                          {carouselIsRandom
                            ? 'Las fotos rotan de forma aleatoria (sin repetirse seguidas).'
                            : 'Las fotos rotan en el orden estricto configurado abajo (#1, #2, #3...).'}
                        </div>
                      </div>
                    </div>

                    {/* Toggle switch checkbox */}
                    <label
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '48px',
                        height: '26px',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Activar o desactivar orden aleatorio"
                    >
                      <input
                        type="checkbox"
                        checked={carouselIsRandom}
                        onChange={(e) => handleToggleCarouselRandom(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          inset: 0,
                          backgroundColor: carouselIsRandom ? '#9333ea' : 'rgba(255, 255, 255, 0.15)',
                          transition: '0.25s',
                          borderRadius: '26px',
                          border: '1px solid ' + (carouselIsRandom ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.2)')
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            content: '""',
                            height: '18px',
                            width: '18px',
                            left: carouselIsRandom ? '25px' : '3px',
                            bottom: '3px',
                            backgroundColor: '#FFFFFF',
                            transition: '0.25s',
                            borderRadius: '50%',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}
                        />
                      </span>
                    </label>
                  </div>

                  {/* Upload New Photo Form */}
                  <form onSubmit={handleUploadCarouselPhoto} style={{ marginBottom: '28px' }}>
                    <div
                      style={{
                        border: '2px dashed rgba(255, 0, 60, 0.35)',
                        borderRadius: '12px',
                        padding: '20px',
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
                        onChange={handleCarouselFileChange}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />

                      {carouselPreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={carouselPreview}
                            alt="Preview"
                            style={{
                              maxHeight: '140px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              display: 'block'
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>
                            ✓ Foto seleccionada (toca para cambiar)
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <Upload size={28} color="#FF003C" />
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                            Toca aquí para subir una nueva foto al carrousel
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Acepta JPG, PNG, WEBP (se optimiza y sube a Supabase)
                          </div>
                        </div>
                      )}
                    </div>

                    {carouselStatus === 'error' && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#ef4444',
                          fontSize: '0.80rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <AlertCircle size={15} />
                        <span>{carouselStatusMsg}</span>
                      </div>
                    )}

                    {carouselStatus === 'success' && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          color: '#22c55e',
                          fontSize: '0.80rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle size={15} />
                        <span>{carouselStatusMsg}</span>
                      </div>
                    )}

                    {carouselPreview && (
                      <button
                        type="submit"
                        disabled={uploadingCarousel}
                        style={{
                          marginTop: '12px',
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: uploadingCarousel ? '#94a3b8' : '#FF003C',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          cursor: uploadingCarousel ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 15px rgba(255, 0, 60, 0.4)'
                        }}
                      >
                        {uploadingCarousel ? 'SUBIENDO A SUPABASE...' : 'AGREGAR ESTA FOTO AL CARROUSEL 🔥'}
                      </button>
                    )}
                  </form>

                  {/* List of Carousel Photos */}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
                      FOTOS ACTUALES (ORDEN DE REPRODUCCIÓN)
                    </div>

                    {loadingCarousel ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                        Cargando carrousel...
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {carouselPhotos.map((photoUrl, idx) => (
                          <div
                            key={photoUrl + idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '10px 14px',
                              borderRadius: '10px'
                            }}
                          >
                            {/* Position Number */}
                            <span
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: 'rgba(255, 0, 60, 0.15)',
                                color: '#FF003C',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.74rem',
                                fontWeight: 900,
                                fontFamily: 'monospace'
                              }}
                            >
                              {idx + 1}
                            </span>

                            {/* Thumbnail */}
                            <img
                              src={photoUrl}
                              alt=""
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            />

                            {/* Photo path / url preview */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.80rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                                {photoUrl.startsWith('http') ? 'Foto Subida (Supabase)' : photoUrl.replace('/gallery/', 'Oficial: ')}
                              </div>
                              <div style={{ fontSize: '0.70rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {photoUrl}
                              </div>
                            </div>

                            {/* Reorder and Delete Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => handleMoveCarouselPhoto(idx, -1)}
                                disabled={idx === 0}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: idx === 0 ? '#475569' : '#FFFFFF',
                                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Subir orden"
                              >
                                <ArrowUp size={14} />
                              </button>

                              <button
                                onClick={() => handleMoveCarouselPhoto(idx, 1)}
                                disabled={idx === carouselPhotos.length - 1}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  color: idx === carouselPhotos.length - 1 ? '#475569' : '#FFFFFF',
                                  cursor: idx === carouselPhotos.length - 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Bajar orden"
                              >
                                <ArrowDown size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteCarouselPhoto(idx)}
                                disabled={carouselPhotos.length <= 1}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: carouselPhotos.length <= 1 ? '#475569' : '#ef4444',
                                  cursor: carouselPhotos.length <= 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginLeft: '4px'
                                }}
                                title="Eliminar del carrousel"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
