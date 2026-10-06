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
