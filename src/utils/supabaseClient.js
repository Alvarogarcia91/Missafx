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
    return await res.json();
  } catch (err) {
    console.error('Error fetching events from Supabase:', err);
    return null;
  }
}

export function isVideoMedia(url) {
  if (!url) return false;
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.includes('/video/') || url.includes('.mp4');
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
  const validExts = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov'];
  const ext = validExts.includes(rawExt) ? rawExt : (isVideo ? 'mp4' : 'jpg');
  
  const fileName = `flyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/flyers/${fileName}`;

  let contentType = file.type;
  if (!contentType) {
    if (ext === 'mp4') contentType = 'video/mp4';
    else if (ext === 'webm') contentType = 'video/webm';
    else if (ext === 'mov') contentType = 'video/quicktime';
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

export async function createEventRecord({ title, date, venue, imageUrl, ticketUrl, statusBadge = 'none' }) {
  let cleanTicketUrl = getCleanTicketUrl(ticketUrl);
  if (statusBadge === 'sold_out') {
    cleanTicketUrl += '#status=sold_out';
  } else if (statusBadge === 'last_tickets') {
    cleanTicketUrl += '#status=last_tickets';
  }

  const basePayload = {
    title: title ? title.trim() : 'EXCLUSIVE DJ SET',
    date: date.trim(),
    venue: venue.trim(),
    image_url: imageUrl,
    ticket_url: cleanTicketUrl
  };

  // Try with status_badge column
  try {
    const resWithCol = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...basePayload,
        status_badge: statusBadge
      })
    });
    if (resWithCol.ok) {
      const data = await resWithCol.json();
      return Array.isArray(data) ? data[0] : data;
    }
  } catch (e) {
    // fallback
  }

  // Fallback without status_badge column (status preserved via ticket_url hash)
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

export async function updateEventRecord(id, { title, date, venue, imageUrl, ticketUrl, statusBadge = 'none' }) {
  let cleanTicketUrl = getCleanTicketUrl(ticketUrl);
  if (statusBadge === 'sold_out') {
    cleanTicketUrl += '#status=sold_out';
  } else if (statusBadge === 'last_tickets') {
    cleanTicketUrl += '#status=last_tickets';
  }

  const payload = {
    title: title ? title.trim() : 'EXCLUSIVE DJ SET',
    date: date.trim(),
    venue: venue.trim(),
    ticket_url: cleanTicketUrl
  };
  if (imageUrl) {
    payload.image_url = imageUrl;
  }

  // 1. Try PATCH with status_badge column
  try {
    const resWithBadge = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...payload,
        status_badge: statusBadge
      })
    });
    if (resWithBadge.ok) {
      const data = await resWithBadge.json();
      if (Array.isArray(data) && data.length > 0) return data[0];
    }
  } catch (e) {}

  // 2. Try PATCH without status_badge column
  try {
    const resPatch = await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (resPatch.ok) {
      const data = await resPatch.json();
      if (Array.isArray(data) && data.length > 0) return data[0];
    }
  } catch (e) {}

  // 3. Fallback: If PATCH is blocked by RLS policies (0 rows updated), perform Delete + Re-Insert
  await deleteEventRecord(id);
  return await createEventRecord({
    title: payload.title,
    date: payload.date,
    venue: payload.venue,
    imageUrl: payload.image_url || imageUrl,
    ticketUrl: payload.ticket_url,
    statusBadge
  });
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
