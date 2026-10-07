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

export async function uploadFlyerImage(file) {
  const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const fileName = `flyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/flyers/${fileName}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type || 'image/jpeg'
    },
    body: file
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al subir imagen a Supabase: ${errText}`);
  }

  // Returns public CDN URL
  return `${SUPABASE_URL}/storage/v1/object/public/flyers/${fileName}`;
}

export async function createEventRecord({ title, date, venue, imageUrl, ticketUrl }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      title: title || 'EXCLUSIVE DJ SET',
      date: date.trim(),
      venue: venue.trim(),
      image_url: imageUrl,
      ticket_url: ticketUrl ? ticketUrl.trim() : 'https://wa.me/5214443570777'
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al guardar evento en Supabase: ${errText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
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
