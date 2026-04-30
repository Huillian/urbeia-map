const SUPABASE_URL = 'https://eerqznktkxxuecbrsbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnF6bmt0a3h4dWVjYnJzYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc5NzYsImV4cCI6MjA5MjM3Mzk3Nn0.wvsMf8s0M9LeJHPUagI_sqcWzxFtmnpLIt7mggsAeLY';

function getSiteUrl(event) {
  const headers = event.headers || {};
  const host = headers.host || headers.Host || 'urbeia-map.netlify.app';
  const proto = headers['x-forwarded-proto'] || headers['X-Forwarded-Proto'] || 'https';
  return `${proto}://${host}`;
}

function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchOne(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/vnd.pgrst.object+json',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function html({ title, description, canonical, redirect, image, robots = 'index, follow' }) {
  const safeTitle = escapeHTML(title);
  const safeDescription = escapeHTML(description);
  const safeCanonical = escapeHTML(canonical);
  const safeRedirect = escapeHTML(redirect);
  const safeImage = escapeHTML(image);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="0; url=${safeRedirect}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${safeCanonical}" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <meta property="og:site_name" content="Urbeia Map" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${safeCanonical}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
  <script>location.replace(${JSON.stringify(redirect)});</script>
</head>
<body>
  <a href="${safeRedirect}">Abrir caixa no Urbeia Map</a>
</body>
</html>`;
}

exports.handler = async event => {
  const slug = event.queryStringParameters?.slug || '';
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const siteUrl = getSiteUrl(event);
  const defaultImage = `${siteUrl}/assets/img/og-cover.png`;

  if (!safeSlug) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
      body: html({
        title: 'Caixa não encontrada · Urbeia Map',
        description: 'Esta caixa não existe ou ainda não foi aprovada.',
        canonical: `${siteUrl}/h/`,
        redirect: `${siteUrl}/h.html`,
        image: defaultImage,
        robots: 'noindex, nofollow',
      }),
    };
  }

  const hive = await fetchOne(
    `hives?select=public_slug,nickname,species_slug,is_urbeia_verified,city,state&public_slug=eq.${encodeURIComponent(safeSlug)}&status=eq.approved`
  );

  if (!hive) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'text/html; charset=utf-8' },
      body: html({
        title: 'Caixa não encontrada · Urbeia Map',
        description: 'Esta caixa não existe ou ainda não foi aprovada.',
        canonical: `${siteUrl}/h/${safeSlug}/`,
        redirect: `${siteUrl}/h.html?slug=${encodeURIComponent(safeSlug)}`,
        image: defaultImage,
        robots: 'noindex, nofollow',
      }),
    };
  }

  const species = hive.species_slug
    ? await fetchOne(`species?select=name_pt,name_scientific&slug=eq.${encodeURIComponent(hive.species_slug)}`)
    : null;

  const title = `${hive.nickname || (hive.is_urbeia_verified ? 'Caixa Urbeia' : 'Caixa comunitária')} · Urbeia Map`;
  const speciesText = species?.name_pt ? ` de ${species.name_pt}` : '';
  const locationText = hive.city ? `${hive.city}, ${hive.state || 'SC'}` : 'Santa Catarina';
  const description = `Caixa${speciesText} em ${locationText}. Veja a cobertura estimada de polinização no Urbeia Map.`;

  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
    body: html({
      title,
      description,
      canonical: `${siteUrl}/h/${safeSlug}/`,
      redirect: `${siteUrl}/h.html?slug=${encodeURIComponent(safeSlug)}`,
      image: defaultImage,
    }),
  };
};
