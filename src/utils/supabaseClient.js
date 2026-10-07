/**
 * Supabase Client for Missafx Events
 * Lightweight native fetch implementation - zero heavy dependencies
 */

const SUPABASE_URL = 'https://vkmdafhbofuppkcfidjc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YEQkWriuA38eTz7YM84Inw_yfcblhiT';

const defaultHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const monthMap = {
  ene: 0, enero: 0, jan: 0, january: 0,
  feb: 1, febrero: 1, february: 1,
  mar: 2, marzo: 2, march: 2,
  abr: 3, abril: 3, apr: 3, april: 3,
  may: 4, mayo: 4,
  jun: 5, junio: 5, june: 5,
  jul: 6, julio: 6, july: 6,
  ago: 7, agosto: 7, aug: 7, august: 7,
  sep: 8, sept: 8, septiembre: 8, september: 8,
  oct: 9, octubre: 9, october: 9,
  nov: 10, noviembre: 10, november: 10,
  dic: 11, diciembre: 11, dec: 11, december: 11
};

export function parseEventDate(str) {
  if (!str) return 9999999999999;
  const s = String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const direct = Date.parse(str);
  if (!isNaN(direct) && str.includes('-') && str.length >= 8) {
    return direct;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const yearMatch = s.match(/\b(202\d)\b/);
  let year = yearMatch ? parseInt(yearMatch[1], 10) : currentYear;

  let month = -1;
  for (const [key, val] of Object.entries(monthMap)) {
    const regex = new RegExp('\\b' + key, 'i');
    if (regex.test(s)) {
      month = val;
      break;
    }
  }

  const cleanStr = yearMatch ? s.replace(yearMatch[1], '') : s;
  const dayMatch = cleanStr.match(/\b([0-2]?\d|3[01])\b/);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;

  if (month !== -1) {
    if (!yearMatch && month < currentMonth - 1) {
      year = currentYear + 1;
    }
    return new Date(year, month, day).getTime();
  }

  return 9999999999999;
}

export function sortEventsByDate(events) {
  if (!Array.isArray(events)) return [];
  return [...events].sort((a, b) => {
    const timeA = parseEventDate(a?.date);
    const timeB = parseEventDate(b?.date);
    if (timeA !== timeB) return timeA - timeB;
    return new Date(a?.created_at || 0) - new Date(b?.created_at || 0);
  });
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*&order=created_at.desc`, {
      headers: defaultHeaders
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('Supabase fetchEvents error:', err);
      return null;
    }
    const data = await res.json();
    return sortEventsByDate(data);
  } catch (err) {
    console.error('Error fetching events from Supabase:', err);
    return null;
  }
}

export function isVideoMedia(url) {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('#')[0].split('?')[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|mkv|avi|ogv)$/i.test(cleanUrl) || cleanUrl.includes('/video/') || url.includes('.mp4');
}

export function checkIsVideo(file, url = '') {
  if (file) {
    const rawExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
    if (['mp4', 'webm', 'mov', 'm4v', 'mkv', 'avi', 'ogv'].includes(rawExt)) return true;
    if (file.type && file.type.toLowerCase().startsWith('video/')) return true;
  }
  if (url) {
    return isVideoMedia(url);
  }
  return false;
}

export function formatVideoTime(sec = 0) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function parseCarouselItemMeta(url) {
  if (!url || typeof url !== 'string') {
    return { cleanUrl: '', hasAudio: false, volume: 50, isHidden: false, fit: 'cover', pos: 'center', startTime: 0, endTime: 0 };
  }
  const parts = url.split('#');
  const cleanUrl = parts[0];
  const hash = parts.slice(1).join('#');

  const hasAudio = hash.includes('audio=true') || hash.includes('audio=1');
  const isHidden = hash.includes('hidden=true') || hash.includes('active=false');

  let volume = 50;
  const volMatch = hash.match(/vol(?:ume)?=([0-9]+)/i);
  if (volMatch) {
    volume = Math.max(0, Math.min(100, parseInt(volMatch[1], 10)));
  }

  let fit = 'cover';
  if (hash.includes('fit=contain')) fit = 'contain';

  let pos = 'center';
  const posMatch = hash.match(/pos=([a-zA-Z0-9_%-]+)/i);
  if (posMatch) {
    pos = posMatch[1].toLowerCase();
  }

  let startTime = 0;
  const startMatch = hash.match(/start=([0-9.]+)/i);
  if (startMatch) {
    startTime = Math.max(0, parseFloat(startMatch[1]));
  }

  let endTime = 0;
  const endMatch = hash.match(/end=([0-9.]+)/i);
  if (endMatch) {
    endTime = Math.max(0, parseFloat(endMatch[1]));
  }

  return { cleanUrl, hasAudio, volume, isHidden, fit, pos, startTime, endTime };
}

export function buildCarouselItemMetaUrl(url, { hasAudio = false, volume = 50, isHidden = false, fit = 'cover', pos = 'center', startTime = 0, endTime = 0 } = {}) {
  if (!url) return '';
  const clean = url.split('#')[0];
  const tags = [];
  if (hasAudio) {
    tags.push('audio=true');
    const safeVol = typeof volume === 'number' ? Math.max(0, Math.min(100, Math.round(volume))) : 50;
    tags.push(`vol=${safeVol}`);
  }
  if (isHidden) tags.push('hidden=true');
  if (fit && fit !== 'cover') tags.push(`fit=${fit}`);
  if (pos && pos !== 'center') tags.push(`pos=${pos}`);
  if (startTime > 0) tags.push(`start=${Math.round(startTime * 10) / 10}`);
  if (endTime > 0) tags.push(`end=${Math.round(endTime * 10) / 10}`);
  return tags.length > 0 ? `${clean}#${tags.join('&')}` : clean;
}

export function getObjectPositionCss(pos) {
  if (!pos) return 'center center';
  const s = String(pos).trim().toLowerCase();
  if (s === 'top') return 'center top';
  if (s === 'bottom') return 'center bottom';
  if (s === 'center') return 'center center';
  if (s === 'left') return 'left center';
  if (s === 'right') return 'right center';

  // Support numeric percentage, e.g. "35" or "35%" -> "center 35%"
  if (/^\d+(%)?$/.test(s)) {
    const num = Math.max(0, Math.min(100, parseInt(s, 10)));
    return `center ${num}%`;
  }

  // Support "x_y" format, e.g. "50_35" -> "50% 35%"
  if (/^\d+_\d+$/.test(s)) {
    const [x, y] = s.split('_');
    const xNum = Math.max(0, Math.min(100, parseInt(x, 10)));
    const yNum = Math.max(0, Math.min(100, parseInt(y, 10)));
    return `${xNum}% ${yNum}%`;
  }

  if (s.includes('%') || s.includes('px')) {
    return s;
  }

  return 'center center';
}

export function getPosPercentY(pos) {
  if (!pos || pos === 'center') return 50;
  if (pos === 'top') return 0;
  if (pos === 'bottom') return 100;
  const s = String(pos).trim().toLowerCase();
  if (/^\d+(%)?$/.test(s)) {
    return Math.max(0, Math.min(100, parseInt(s, 10)));
  }
  if (/^\d+_\d+$/.test(s)) {
    const [, y] = s.split('_');
    return Math.max(0, Math.min(100, parseInt(y, 10)));
  }
  return 50;
}

export function getPosPercentX(pos) {
  if (!pos || pos === 'center' || pos === 'top' || pos === 'bottom') return 50;
  if (pos === 'left') return 0;
  if (pos === 'right') return 100;
  const s = String(pos).trim().toLowerCase();
  if (/^\d+_\d+$/.test(s)) {
    const [x] = s.split('_');
    return Math.max(0, Math.min(100, parseInt(x, 10)));
  }
  return 50;
}

export function getCarouselItemAudio(url) {
  if (!url) return false;
  return parseCarouselItemMeta(url).hasAudio;
}

export function getCarouselItemVolume(url) {
  if (!url) return 50;
  return parseCarouselItemMeta(url).volume ?? 50;
}

export function getCarouselItemHidden(url) {
  if (!url) return false;
  return parseCarouselItemMeta(url).isHidden;
}

export function getCarouselItemFit(url) {
  if (!url) return 'cover';
  return parseCarouselItemMeta(url).fit;
}

export function getCarouselItemPos(url) {
  if (!url) return 'center';
  return parseCarouselItemMeta(url).pos;
}

export function buildCarouselItemUrl(url, hasAudio = false) {
  if (!url) return '';
  const meta = parseCarouselItemMeta(url);
  return buildCarouselItemMetaUrl(url, { ...meta, hasAudio });
}

export function getCleanCarouselUrl(url) {
  if (!url) return '';
  return url.split('#')[0];
}

export function getEventStatus(event) {
  if (!event) return 'none';
  if (event.status_badge && event.status_badge !== 'none') {
    return event.status_badge;
  }
  const tUrl = event.ticket_url || '';
  if (tUrl.includes('#status=sold_out') || tUrl.includes('#sold_out')) return 'sold_out';
  if (tUrl.includes('#status=last_tickets') || tUrl.includes('#last_tickets')) return 'last_tickets';

  const title = event.title || '';
  if (title.includes('[SOLD_OUT]') || title.includes('[AGOTADO]')) return 'sold_out';
  if (title.includes('[LAST_TICKETS]') || title.includes('[ULTIMOS_BOLETOS]')) return 'last_tickets';

  return 'none';
}

export function getEventCoupon(event) {
  if (!event) return '';
  if (event.coupon_code && event.coupon_code.trim()) {
    return event.coupon_code.trim().toUpperCase();
  }
  const tUrl = event.ticket_url || '';
  if (tUrl.includes('#')) {
    const hash = tUrl.split('#')[1] || '';
    const params = new URLSearchParams(hash);
    const c = params.get('coupon');
    if (c) return c.trim().toUpperCase();
  }
  return '';
}

export function sanitizePhoneNumber(phone) {
  if (!phone) return '5214443570777';
  let clean = String(phone).replace(/[^\d]/g, '');
  if (clean.length === 10) clean = '521' + clean;
  return clean || '5214443570777';
}

export function extractEventDetails(event) {
  const url = event?.ticket_url || '';
  const [clean, hash = ''] = url.split('#');
  const params = new URLSearchParams(hash);

  const status = event?.status_badge && event.status_badge !== 'none'
    ? event.status_badge
    : (params.get('status') || 'none');

  const coupon = (event?.coupon_code || params.get('coupon') || '').trim().toUpperCase();

  let contactType = params.get('contact') || '';
  let rpPhone = params.get('rp_phone') || '';
  let customUrl = '';
  let customWaMessage = '';

  if (clean.includes('wa.me') || clean.includes('whatsapp.com')) {
    try {
      const parsedUrl = new URL(clean);
      const textParam = parsedUrl.searchParams.get('text');
      if (textParam) customWaMessage = textParam;

      const pathSegments = parsedUrl.pathname.replace(/^\//, '').split('/');
      const phoneInPath = pathSegments[0] || '';
      if (!contactType) {
        if (phoneInPath.includes('5214443570777') || phoneInPath.includes('4443570777')) {
          contactType = 'missa';
        } else if (phoneInPath) {
          contactType = 'rp';
          if (!rpPhone) rpPhone = phoneInPath;
        } else {
          contactType = 'missa';
        }
      }
    } catch (e) {
      if (!contactType) contactType = 'missa';
    }
  } else {
    contactType = 'custom';
    customUrl = clean;
  }

  if (!contactType) contactType = 'missa';

  return {
    status,
    coupon,
    contactType,
    rpPhone,
    customUrl,
    customWaMessage
  };
}

export function buildEventTicketUrl({
  contactType = 'missa',
  rpPhone = '',
  customUrl = '',
  customMessage = '',
  eventTitle = '',
  eventVenue = '',
  couponCode = '',
  statusBadge = 'none'
}) {
  let baseTarget = '';
  const cleanCoupon = (couponCode || '').trim().toUpperCase();

  if (contactType === 'custom' && customUrl.trim()) {
    baseTarget = customUrl.trim();
  } else {
    const targetPhone = contactType === 'rp' ? sanitizePhoneNumber(rpPhone) : '5214443570777';
    let text = (customMessage || '').trim();
    if (!text) {
      text = '¡Hola! Vengo desde missafx.com y me gustaría reservar mis accesos para ' + (eventTitle.trim() || 'el evento');
      if (eventVenue.trim()) text += ' en ' + eventVenue.trim();
      text += '.';
    }
    if (cleanCoupon && !text.toUpperCase().includes(cleanCoupon)) {
      text += ' Código de descuento / cortesía: ' + cleanCoupon;
    }
    baseTarget = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  }

  const hashParams = new URLSearchParams();
  if (statusBadge && statusBadge !== 'none') hashParams.set('status', statusBadge);
  if (cleanCoupon) hashParams.set('coupon', cleanCoupon);
  if (contactType === 'rp') {
    hashParams.set('contact', 'rp');
    if (rpPhone.trim()) hashParams.set('rp_phone', sanitizePhoneNumber(rpPhone));
  } else if (contactType === 'custom') {
    hashParams.set('contact', 'custom');
  }

  const hashStr = hashParams.toString();
  return hashStr ? `${baseTarget}#${hashStr}` : baseTarget;
}

export function getCleanTicketUrl(url) {
  if (!url) return 'https://wa.me/5214443570777';
  return url.split('#')[0];
}

export function getCleanTitle(title) {
  if (!title) return 'EXCLUSIVE DJ SET';
  return title.replace(/\[(SOLD_OUT|AGOTADO|LAST_TICKETS|ULTIMOS_BOLETOS)\]/gi, '').trim();
}

export async function uploadFlyerImage(file) {
  const rawExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
  const isVideo = ['mp4', 'webm', 'mov'].includes(rawExt) || (file.type && file.type.startsWith('video/'));
  const validExts = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'ico', 'mp4', 'webm', 'mov'];
  const ext = validExts.includes(rawExt) ? rawExt : (isVideo ? 'mp4' : 'jpg');
  
  const fileName = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/flyers/${fileName}`;

  let contentType = file.type;
  if (!contentType) {
    if (ext === 'mp4') contentType = 'video/mp4';
    else if (ext === 'webm') contentType = 'video/webm';
    else if (ext === 'mov') contentType = 'video/quicktime';
    else if (ext === 'svg') contentType = 'image/svg+xml';
    else if (ext === 'ico') contentType = 'image/x-icon';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';
    else contentType = 'image/jpeg';
  }

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType
    },
    body: file
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al subir archivo a Supabase: ${errText}`);
  }

  // Returns public CDN URL
  return `${SUPABASE_URL}/storage/v1/object/public/flyers/${fileName}`;
}

export const uploadMediaFile = uploadFlyerImage;

export async function createEventRecord({ title, date, venue, imageUrl, ticketUrl, statusBadge = 'none', couponCode = '' }) {
  let finalTicketUrl = ticketUrl || 'https://wa.me/5214443570777';
  const [clean, hash = ''] = finalTicketUrl.split('#');
  const params = new URLSearchParams(hash);
  if (statusBadge && statusBadge !== 'none' && !params.has('status')) {
    params.set('status', statusBadge);
  }
  if (couponCode && couponCode.trim() && !params.has('coupon')) {
    params.set('coupon', couponCode.trim().toUpperCase());
  }
  const hashStr = params.toString();
  finalTicketUrl = hashStr ? `${clean}#${hashStr}` : clean;

  const basePayload = {
    title: title ? title.trim() : 'EXCLUSIVE DJ SET',
    date: date.trim(),
    venue: venue.trim(),
    image_url: imageUrl,
    ticket_url: finalTicketUrl
  };

  // Try with status_badge and coupon_code columns
  try {
    const resWithCol = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...basePayload,
        status_badge: statusBadge,
        coupon_code: couponCode ? couponCode.trim().toUpperCase() : null
      })
    });
    if (resWithCol.ok) {
      const data = await resWithCol.json();
      return Array.isArray(data) ? data[0] : data;
    }
  } catch (e) {}

  // Fallback without extra columns (metadata preserved via ticket_url hash)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Prefer: 'return=representation'
    },
    body: JSON.stringify(basePayload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al guardar evento en Supabase: ${errText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function updateEventRecord(id, { title, date, venue, imageUrl, ticketUrl, statusBadge = 'none', couponCode = '' }) {
  let finalTicketUrl = ticketUrl || 'https://wa.me/5214443570777';
  const [clean, hash = ''] = finalTicketUrl.split('#');
  const params = new URLSearchParams(hash);
  if (statusBadge && statusBadge !== 'none') {
    params.set('status', statusBadge);
  } else {
    params.delete('status');
  }
  if (couponCode && couponCode.trim()) {
    params.set('coupon', couponCode.trim().toUpperCase());
  } else {
    params.delete('coupon');
  }
  const hashStr = params.toString();
  finalTicketUrl = hashStr ? `${clean}#${hashStr}` : clean;

  const payload = {
    title: title ? title.trim() : 'EXCLUSIVE DJ SET',
    date: date.trim(),
    venue: venue.trim(),
    ticket_url: finalTicketUrl
  };
  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  // 1. Try PATCH with status_badge and coupon_code
  try {
    const resWithBadge = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...payload,
        status_badge: statusBadge,
        coupon_code: couponCode ? couponCode.trim().toUpperCase() : null
      })
    });
    if (resWithBadge.ok) {
      const data = await resWithBadge.json();
      if (Array.isArray(data) && data.length > 0) return data[0];
    }
  } catch (e) {}

  // 2. Fallback PATCH without extra columns (metadata preserved via ticket_url hash)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data[0];
    }
  } catch (e) {}

  // 3. Fallback: If PATCH is blocked by RLS policies (0 rows updated), perform Delete + Re-Insert
  try {
    await deleteEventRecord(id);
    return await createEventRecord({
      title: payload.title,
      date: payload.date,
      venue: payload.venue,
      imageUrl: payload.image_url || imageUrl,
      ticketUrl: finalTicketUrl,
      statusBadge,
      couponCode
    });
  } catch (err) {
    throw new Error(`Error al actualizar evento: ${err.message}`);
  }
}

export async function deleteEventRecord(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al eliminar evento: ${errText}`);
  }

  return true;
}

export function getYouTubeId(url) {
  if (!url) return '';
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

export const DEFAULT_SETS = [
  {
    id: 'default-set-1',
    youtube_url: 'https://www.youtube.com/watch?v=lWYhmS5dDQU',
    youtube_id: 'lWYhmS5dDQU',
    title: 'WHITEBOX LAB SESSIONS #009 | MISSA B2B DANI TECH',
    subtitle: 'TECH HOUSE // B2B SESSION',
    is_default: true
  },
  {
    id: 'default-set-2',
    youtube_url: 'https://www.youtube.com/watch?v=XrPWh7Jbypo',
    youtube_id: 'XrPWh7Jbypo',
    title: 'Forgotten Rhythm °Set melodyc techno',
    subtitle: 'MELODIC TECHNO // LIVE SET',
    is_default: true
  }
];

export async function fetchSets() {
  let cloudSets = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/sets?select=*&order=created_at.desc`, {
      headers: defaultHeaders
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) cloudSets = data;
    }
  } catch (err) {
    console.warn('Supabase sets fetch failed, checking local:', err);
  }

  // Local storage fallback / overlay
  let localSets = [];
  try {
    const saved = localStorage.getItem('missafx_custom_sets');
    if (saved) localSets = JSON.parse(saved);
  } catch (e) {
    // ignore
  }

  let deletedDefaults = [];
  try {
    const deleted = localStorage.getItem('missafx_deleted_defaults');
    if (deleted) deletedDefaults = JSON.parse(deleted);
  } catch (e) {}

  // If cloud has sets, prioritize cloud sets, plus local sets not in cloud
  let combined = [...cloudSets, ...localSets.filter(ls => !cloudSets.some(cs => cs.id === ls.id))];

  // If combined is empty, use DEFAULT_SETS (excluding any deleted defaults)
  if (combined.length === 0) {
    combined = DEFAULT_SETS.filter(ds => !deletedDefaults.includes(ds.id));
  } else {
    // Also include default sets if not explicitly deleted and not already in combined
    const defaultsToAdd = DEFAULT_SETS.filter(ds => 
      !deletedDefaults.includes(ds.id) && 
      !combined.some(c => c.youtube_id === ds.youtube_id)
    );
    combined = [...combined, ...defaultsToAdd];
  }

  return combined;
}

export async function createSetRecord({ youtubeUrl, title, subtitle }) {
  const yId = getYouTubeId(youtubeUrl);
  if (!yId) throw new Error('Enlace de YouTube no válido (verifica el link)');

  const newSet = {
    id: 'set_' + Date.now(),
    youtube_url: youtubeUrl.trim(),
    youtube_id: yId,
    title: title ? title.trim() : 'MISSAFX LIVE SET',
    subtitle: subtitle ? subtitle.trim() : 'LIVE DJ SET',
    created_at: new Date().toISOString()
  };

  // Try Supabase
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/sets`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        youtube_url: newSet.youtube_url,
        youtube_id: newSet.youtube_id,
        title: newSet.title,
        subtitle: newSet.subtitle
      })
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    }
  } catch (err) {
    console.warn('Could not save to Supabase sets, saving to local fallback:', err);
  }

  // Fallback to localStorage
  try {
    const current = JSON.parse(localStorage.getItem('missafx_custom_sets') || '[]');
    current.unshift(newSet);
    localStorage.setItem('missafx_custom_sets', JSON.stringify(current));
  } catch (e) {}

  return newSet;
}

export async function deleteSetRecord(id) {
  // If default set, record in deletedDefaults
  if (String(id).startsWith('default-')) {
    try {
      const deleted = JSON.parse(localStorage.getItem('missafx_deleted_defaults') || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('missafx_deleted_defaults', JSON.stringify(deleted));
      }
    } catch (e) {}
    return true;
  }

  // Try delete from Supabase
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/sets?id=eq.${id}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
  } catch (err) {
    console.warn('Supabase delete failed:', err);
  }

  // Also remove from localStorage if present
  try {
    const current = JSON.parse(localStorage.getItem('missafx_custom_sets') || '[]');
    const filtered = current.filter(item => item.id !== id);
    localStorage.setItem('missafx_custom_sets', JSON.stringify(filtered));
  } catch (e) {}

  return true;
}

export const DEFAULT_CAROUSEL_PHOTOS = [
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-01.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-02.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-03.png',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-04.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-05.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-06.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-07.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-08.jpg',
  'https://vkmdafhbofuppkcfidjc.supabase.co/storage/v1/object/public/flyers/gallery_missa-09.jpg'
];

export function getStoredCarouselRandom() {
  try {
    const val = localStorage.getItem('missafx_carousel_random');
    if (val !== null) return val === 'true';
  } catch (e) {}
  return false;
}

export async function fetchCarouselData() {
  let cloudPhotos = [];
  let isRandom = getStoredCarouselRandom();

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/carousel?select=*&order=display_order.asc,created_at.asc`, {
      headers: defaultHeaders
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const configRow = data.find(item => item.image_url && item.image_url.startsWith('__config:random_order='));
        if (configRow) {
          isRandom = configRow.image_url === '__config:random_order=true';
          try {
            localStorage.setItem('missafx_carousel_random', isRandom ? 'true' : 'false');
          } catch (e) {}
        }
        cloudPhotos = data
          .filter(item => item.image_url && !item.image_url.startsWith('__config:'))
          .map(item => item.image_url);
      }
    }
  } catch (err) {
    console.warn('Supabase carousel fetch error, falling back:', err);
  }

  if (cloudPhotos.length === 0) {
    // Check localStorage
    try {
      const saved = localStorage.getItem('missafx_carousel_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cloudPhotos = parsed;
        }
      }
    } catch (e) {}
  }

  if (cloudPhotos.length === 0) {
    cloudPhotos = DEFAULT_CAROUSEL_PHOTOS;
  }

  const activePhotos = cloudPhotos.filter(url => !getCarouselItemHidden(url));
  const finalPhotos = activePhotos.length > 0 ? activePhotos : cloudPhotos;

  return { photos: finalPhotos, allPhotos: cloudPhotos, isRandom };
}

export async function fetchCarouselPhotos() {
  const data = await fetchCarouselData();
  return data.photos;
}

export async function fetchAllCarouselPhotos() {
  const data = await fetchCarouselData();
  return data.allPhotos || data.photos;
}

export async function fetchCarouselRandom() {
  const data = await fetchCarouselData();
  return data.isRandom;
}

export async function saveCarouselRandom(isRandom) {
  const valStr = isRandom ? 'true' : 'false';
  try {
    localStorage.setItem('missafx_carousel_random', valStr);
  } catch (e) {}

  try {
    // Delete existing config row
    await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=like.__config:random_order*%25`, {
      method: 'DELETE',
      headers: defaultHeaders
    });

    // Insert new config row
    await fetch(`${SUPABASE_URL}/rest/v1/carousel`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify([{
        image_url: `__config:random_order=${valStr}`,
        display_order: -1
      }])
    });
  } catch (err) {
    console.warn('Error saving carousel random config to Supabase:', err);
  }

  return isRandom;
}

export async function saveCarouselPhotos(photosList) {
  const cleanList = Array.isArray(photosList) ? photosList.filter(Boolean) : DEFAULT_CAROUSEL_PHOTOS;

  // 1. Save to localStorage immediately
  try {
    localStorage.setItem('missafx_carousel_photos', JSON.stringify(cleanList));
  } catch (e) {}

  // 2. Try to sync to Supabase if table exists
  try {
    // Only delete media rows, preserving all __config rows (random_order, general_settings, etc.)
    await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=not.like.__config:%25`, {
      method: 'DELETE',
      headers: defaultHeaders
    });

    // Insert photo rows
    const rows = cleanList.map((url, idx) => ({
      image_url: url,
      display_order: idx
    }));

    await fetch(`${SUPABASE_URL}/rest/v1/carousel`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(rows)
    });
  } catch (e) {
    console.warn('Could not sync carousel to Supabase table:', e);
  }

  return cleanList;
}

export async function resetCarouselPhotos() {
  try {
    localStorage.removeItem('missafx_carousel_photos');
    localStorage.setItem('missafx_carousel_random', 'false');
  } catch (e) {}

  try {
    // Only delete media rows, preserving config rows
    await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=not.like.__config:%25`, {
      method: 'DELETE',
      headers: defaultHeaders
    });

    const rows = DEFAULT_CAROUSEL_PHOTOS.map((url, idx) => ({
      image_url: url,
      display_order: idx
    }));

    await fetch(`${SUPABASE_URL}/rest/v1/carousel`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(rows)
    });
  } catch (e) {}

  return DEFAULT_CAROUSEL_PHOTOS;
}

/**
 * ----------------------------------------------------
 * GENERAL SITE BRANDING & TEXTS CONFIGURATION
 * ----------------------------------------------------
 */
export const DEFAULT_GENERAL_SETTINGS = {
  logoUrl: '/missafx-logo.png',
  faviconUrl: '/favicon.png',
  tabTitle: 'MISSAFX | DJ & Electronic Music Producer',
  artistName1: 'MISSA',
  artistName2: 'FX',
  heroBadgeGenre: 'TECH HOUSE',
  heroDescription: 'DJ & Productor de música electrónica y Tech House. Sets en vivo con mezclas contundentes, transmisiones interactivas y booking directo.',
  locationBase: 'SAN LUIS POTOSÍ, MÉXICO',
  footerTagline: 'OFFICIAL DJ & PRODUCER EXPERIENCE',
  bookingPhone: '5214443570777',
  kickChannel: '7missa',
  instagramUser: 'missaa.fx',
  youtubeUrl: 'https://www.youtube.com/@missaelarath6364',
  soundcloudUrl: 'https://soundcloud.com/missael-arath',
  aboutBio1: 'Con una identidad sonora potente y enfocada en la pista de baile, Missafx fusiona lo mejor del Tech House contemporáneo con líneas de bajo contundentes y percusiones dinámicas.',
  aboutBio2: 'Sus sets están diseñados para generar alta energía en clubs y escenarios, respaldados por una comunidad activa en plataformas de streaming como Kick, YouTube y SoundCloud.'
};

export function applyPageTitle(tabTitle) {
  if (!tabTitle || typeof document === 'undefined') return;
  try {
    document.title = tabTitle;
  } catch (e) {
    console.warn('Could not apply document title to DOM:', e);
  }
}

export function applyFavicon(faviconUrl) {
  if (!faviconUrl || typeof document === 'undefined') return;
  try {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  } catch (e) {
    console.warn('Could not apply favicon to DOM:', e);
  }
}

export async function fetchGeneralSettings() {
  let cloudSettings = null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=like.__config:general_settings*%25&select=*`, {
      headers: defaultHeaders
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].image_url) {
        const rawJson = data[0].image_url.replace('__config:general_settings=', '');
        cloudSettings = JSON.parse(rawJson);
        try {
          localStorage.setItem('missafx_general_settings', JSON.stringify(cloudSettings));
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Supabase general settings fetch failed:', err);
  }

  let localSettings = {};
  try {
    const saved = localStorage.getItem('missafx_general_settings');
    if (saved) localSettings = JSON.parse(saved);
  } catch (e) {}

  const merged = {
    ...DEFAULT_GENERAL_SETTINGS,
    ...localSettings,
    ...(cloudSettings || {})
  };

  return merged;
}

export async function saveGeneralSettings(newSettings) {
  const merged = {
    ...DEFAULT_GENERAL_SETTINGS,
    ...newSettings
  };

  // 1. Save to local storage
  try {
    localStorage.setItem('missafx_general_settings', JSON.stringify(merged));
  } catch (e) {}

  // 2. Apply favicon and page title immediately
  if (merged.faviconUrl) {
    applyFavicon(merged.faviconUrl);
  }
  if (merged.tabTitle) {
    applyPageTitle(merged.tabTitle);
  }

  // 3. Sync to Supabase config row
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=like.__config:general_settings*%25`, {
      method: 'DELETE',
      headers: defaultHeaders
    });

    await fetch(`${SUPABASE_URL}/rest/v1/carousel`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify([{
        image_url: `__config:general_settings=${JSON.stringify(merged)}`,
        display_order: -2
      }])
    });
  } catch (err) {
    console.warn('Error saving general settings to Supabase:', err);
  }

  // 4. Notify live components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('missafx-config-updated', { detail: merged }));
  }

  return merged;
}

export async function resetGeneralSettings() {
  try {
    localStorage.removeItem('missafx_general_settings');
  } catch (e) {}

  return await saveGeneralSettings(DEFAULT_GENERAL_SETTINGS);
}

/**
 * Download helper for photos and videos to local device (PC / Mobile)
 */
export async function downloadMediaFile(url, preferredName = '') {
  if (!url) return;
  const cleanUrl = url.split('#')[0];
  const isVid = isVideoMedia(cleanUrl);
  const defaultExt = isVid ? '.mp4' : '.jpg';
  
  const extMatch = cleanUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/i);
  const ext = extMatch ? `.${extMatch[1]}` : defaultExt;

  let baseName = preferredName;
  if (!baseName) {
    const rawName = cleanUrl.split('/').pop().split('?')[0];
    baseName = rawName || `missafx_${isVid ? 'video' : 'foto'}_${Date.now()}`;
  }
  if (!baseName.includes('.')) {
    baseName = `${baseName}${ext}`;
  }

  try {
    const res = await fetch(cleanUrl);
    if (!res.ok) throw new Error('Fetch failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = baseName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  } catch (err) {
    console.warn('Direct blob download error, triggering fallback:', err);
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.download = baseName;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * ----------------------------------------------------
 * SITE TRAFFIC & BOOKING ANALYTICS (INTERNAL ADMIN ONLY)
 * ----------------------------------------------------
 */
export const DEFAULT_ANALYTICS = {
  totalVisits: 0,
  uniqueVisitors: 0,
  todayVisits: 0,
  todayDate: '',
  whatsappClicks: 0,
  nexoraClicks: 0,
  mobileVisits: 0,
  desktopVisits: 0,
  lastVisitAt: null,
  eventClicks: {},
  eventDetails: {}
};

export async function fetchSiteAnalytics() {
  let cloudAnalytics = null;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=like.__config:analytics*%25&select=*&order=created_at.desc`, {
      headers: defaultHeaders
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].image_url) {
        const rawJson = data[0].image_url.replace('__config:analytics=', '');
        cloudAnalytics = JSON.parse(rawJson);
        try {
          localStorage.setItem('missafx_site_analytics', JSON.stringify(cloudAnalytics));
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Supabase analytics fetch failed:', err);
  }

  let localAnalytics = {};
  try {
    const saved = localStorage.getItem('missafx_site_analytics');
    if (saved) localAnalytics = JSON.parse(saved);
  } catch (e) {}

  const merged = {
    ...DEFAULT_ANALYTICS,
    ...localAnalytics,
    ...(cloudAnalytics || {})
  };

  return merged;
}

export async function saveSiteAnalytics(newAnalytics) {
  const merged = {
    ...DEFAULT_ANALYTICS,
    ...newAnalytics
  };

  try {
    localStorage.setItem('missafx_site_analytics', JSON.stringify(merged));
  } catch (e) {}

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/carousel?image_url=like.__config:analytics*%25`, {
      method: 'DELETE',
      headers: defaultHeaders
    });

    await fetch(`${SUPABASE_URL}/rest/v1/carousel`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify([{
        image_url: `__config:analytics=${JSON.stringify(merged)}`,
        display_order: -3
      }])
    });
  } catch (err) {
    console.warn('Error saving analytics to Supabase:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('missafx-analytics-updated', { detail: merged }));
  }

  return merged;
}

export async function recordSiteVisit() {
  if (typeof window === 'undefined') return DEFAULT_ANALYTICS;

  const now = Date.now();
  const lastRecordedTime = sessionStorage.getItem('missafx_session_visit_at');
  const fifteenMinutes = 15 * 60 * 1000;
  const isExistingRecentSession = lastRecordedTime && (now - parseInt(lastRecordedTime, 10) < fifteenMinutes);

  let visitorUuid = localStorage.getItem('missafx_visitor_uuid');
  let isNewUnique = false;
  if (!visitorUuid) {
    visitorUuid = 'v_' + now + '_' + Math.random().toString(36).substring(2, 9);
    try {
      localStorage.setItem('missafx_visitor_uuid', visitorUuid);
    } catch (e) {}
    isNewUnique = true;
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
  const todayStr = new Date().toISOString().split('T')[0];

  if (isExistingRecentSession) {
    return await fetchSiteAnalytics();
  }

  try {
    sessionStorage.setItem('missafx_session_visit_at', String(now));
  } catch (e) {}

  try {
    const current = await fetchSiteAnalytics();
    const isSameDay = current.todayDate === todayStr;
    const updatedTodayVisits = isSameDay ? (current.todayVisits || 0) + 1 : 1;

    const updated = {
      ...current,
      totalVisits: (current.totalVisits || 0) + 1,
      uniqueVisitors: isNewUnique ? (current.uniqueVisitors || 0) + 1 : Math.max(1, current.uniqueVisitors || 1),
      todayVisits: updatedTodayVisits,
      todayDate: todayStr,
      mobileVisits: isMobile ? (current.mobileVisits || 0) + 1 : (current.mobileVisits || 0),
      desktopVisits: !isMobile ? (current.desktopVisits || 0) + 1 : (current.desktopVisits || 0),
      lastVisitAt: new Date().toISOString()
    };

    return await saveSiteAnalytics(updated);
  } catch (err) {
    console.warn('Error recording site visit:', err);
    return DEFAULT_ANALYTICS;
  }
}

export async function recordWhatsAppClick() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const lastWa = sessionStorage.getItem('missafx_last_wa_click');
  if (lastWa && (now - parseInt(lastWa, 10) < 2500)) {
    return;
  }
  try {
    sessionStorage.setItem('missafx_last_wa_click', String(now));
  } catch (e) {}

  try {
    const current = await fetchSiteAnalytics();
    const updated = {
      ...current,
      whatsappClicks: (current.whatsappClicks || 0) + 1,
      lastVisitAt: new Date().toISOString()
    };
    return await saveSiteAnalytics(updated);
  } catch (err) {
    console.warn('Error recording WhatsApp click:', err);
  }
}

export async function recordNexoraClick() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const lastNexora = sessionStorage.getItem('missafx_last_nexora_click');
  if (lastNexora && (now - parseInt(lastNexora, 10) < 2500)) {
    return;
  }
  try {
    sessionStorage.setItem('missafx_last_nexora_click', String(now));
  } catch (e) {}

  try {
    const current = await fetchSiteAnalytics();
    const updated = {
      ...current,
      nexoraClicks: (current.nexoraClicks || 0) + 1,
      lastVisitAt: new Date().toISOString()
    };
    return await saveSiteAnalytics(updated);
  } catch (err) {
    console.warn('Error recording Nexora click:', err);
  }
}

export async function resetSiteAnalytics() {
  try {
    localStorage.removeItem('missafx_site_analytics');
    sessionStorage.removeItem('missafx_session_visit_at');
  } catch (e) {}

  return await saveSiteAnalytics({
    ...DEFAULT_ANALYTICS,
    todayDate: new Date().toISOString().split('T')[0]
  });
}

export async function recordEventClick(eventId, eventData = {}) {
  if (!eventId || typeof window === 'undefined') return;

  const now = Date.now();
  const sessionKey = `missafx_last_ev_click_${eventId}`;
  const lastClick = sessionStorage.getItem(sessionKey);
  if (lastClick && (now - parseInt(lastClick, 10) < 2000)) {
    return;
  }
  try {
    sessionStorage.setItem(sessionKey, String(now));
  } catch (e) {}

  try {
    const current = await fetchSiteAnalytics();
    const eventClicks = { ...(current.eventClicks || {}) };
    const eventDetails = { ...(current.eventDetails || {}) };

    const currentCount = (eventClicks[eventId] || 0) + 1;
    eventClicks[eventId] = currentCount;

    eventDetails[eventId] = {
      id: eventId,
      title: eventData.title || eventDetails[eventId]?.title || 'Evento',
      venue: eventData.venue || eventDetails[eventId]?.venue || '',
      date: eventData.date || eventDetails[eventId]?.date || '',
      clicks: currentCount,
      lastClickAt: new Date().toISOString()
    };

    const updated = {
      ...current,
      eventClicks,
      eventDetails,
      whatsappClicks: (current.whatsappClicks || 0) + 1,
      lastVisitAt: new Date().toISOString()
    };

    return await saveSiteAnalytics(updated);
  } catch (err) {
    console.warn('Error recording event click:', err);
  }
}

export async function resetEventClicks(eventId) {
  if (!eventId) return;
  try {
    const current = await fetchSiteAnalytics();
    const eventClicks = { ...(current.eventClicks || {}) };
    const eventDetails = { ...(current.eventDetails || {}) };

    eventClicks[eventId] = 0;
    if (eventDetails[eventId]) {
      eventDetails[eventId] = {
        ...eventDetails[eventId],
        clicks: 0,
        lastClickAt: null
      };
    }

    const updated = {
      ...current,
      eventClicks,
      eventDetails
    };

    return await saveSiteAnalytics(updated);
  } catch (err) {
    console.warn('Error resetting event clicks:', err);
  }
}




