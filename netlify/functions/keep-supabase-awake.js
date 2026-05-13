const SUPABASE_URL = 'https://eerqznktkxxuecbrsbsn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnF6bmt0a3h4dWVjYnJzYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc5NzYsImV4cCI6MjA5MjM3Mzk3Nn0.wvsMf8s0M9LeJHPUagI_sqcWzxFtmnpLIt7mggsAeLY';

exports.handler = async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/species?select=slug&limit=1`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Supabase keep-awake failed:', res.status, body);
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, status: res.status }),
    };
  }

  const data = await res.json();
  console.log('Supabase keep-awake ok:', data.length);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, rows: data.length }),
  };
};
