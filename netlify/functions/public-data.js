const SUPABASE_URL = 'https://eerqznktkxxuecbrsbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnF6bmt0a3h4dWVjYnJzYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc5NzYsImV4cCI6MjA5MjM3Mzk3Nn0.wvsMf8s0M9LeJHPUagI_sqcWzxFtmnpLIt7mggsAeLY';

const SPECIES_SELECT = 'slug,name_pt,name_scientific,pollination_radius_m,color_hex,size_mm,honey_yield_l_year,region_pt,family_tribe,urban_indication,behavior,description,observations,nesting_type,key_plants,conservation_status,best_use,occurrence_regions';
const HIVE_SELECT = 'id,public_slug,lat,lng,nickname,species_slug,is_urbeia_verified,approximate_location,owner_name,note,installed_at,city,state';
const HIVE_DETAIL_SELECT = `${HIVE_SELECT},photo_url`;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60',
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

async function fetchSupabase(path, object = false) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: object ? 'application/vnd.pgrst.object+json' : 'application/json',
    },
  });

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = payload?.message || payload?.hint || `Supabase request failed with ${res.status}`;
    throw new Error(message);
  }

  return payload;
}

function cleanSlug(value) {
  return String(value || '').replace(/[^a-z0-9-]/gi, '').toLowerCase();
}

exports.handler = async event => {
  const params = event.queryStringParameters || {};
  const resource = params.resource || '';

  try {
    if (resource === 'species') {
      const data = await fetchSupabase(`species?select=${SPECIES_SELECT}&order=name_pt.asc`);
      return json(200, data);
    }

    if (resource === 'map') {
      const [species, hives] = await Promise.all([
        fetchSupabase(`species?select=${SPECIES_SELECT}&order=name_pt.asc`),
        fetchSupabase(`hives?select=${HIVE_SELECT}&status=eq.approved`),
      ]);
      return json(200, { species, hives });
    }

    if (resource === 'hives') {
      const data = await fetchSupabase(`hives?select=${HIVE_SELECT}&status=eq.approved`);
      return json(200, data);
    }

    if (resource === 'hives-by-species') {
      const slug = cleanSlug(params.species);
      if (!slug) return json(400, { error: 'Missing species' });

      const data = await fetchSupabase(
        `hives?select=${HIVE_DETAIL_SELECT}&status=eq.approved&species_slug=eq.${encodeURIComponent(slug)}`
      );
      return json(200, data);
    }

    if (resource === 'hive') {
      const slug = cleanSlug(params.slug);
      if (!slug) return json(400, { error: 'Missing slug' });

      const data = await fetchSupabase(
        `hives?select=${HIVE_DETAIL_SELECT}&public_slug=eq.${encodeURIComponent(slug)}&status=eq.approved`,
        true
      );
      return json(200, data);
    }

    return json(404, { error: 'Unknown resource' });
  } catch (err) {
    console.error('public-data error:', err);
    return json(502, { error: err.message || 'Public data unavailable' });
  }
};
