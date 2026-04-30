const CACADOR = [-26.7749, -51.0156];

function getSpeciesSlug() {
  if (window.URBEIA_SPECIES_SLUG) return window.URBEIA_SPECIES_SLUG;
  const params = new URLSearchParams(location.search);
  if (params.get('slug')) return params.get('slug');
  const parts = location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1]?.replace(/\.html$/, '') || '';
}

function getTileUrl(theme) {
  return theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
}

function computeDisplayCoords(hive) {
  if (!hive.approximate_location) return [parseFloat(hive.lat), parseFloat(hive.lng)];
  const offsetLat = (Math.random() - 0.5) * 0.004;
  const offsetLng = (Math.random() - 0.5) * 0.004;
  return [parseFloat(hive.lat) + offsetLat, parseFloat(hive.lng) + offsetLng];
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

async function createHiveCard(hive) {
  const card = document.createElement('article');
  card.className = 'hive-card';

  if (hive.photo_url) {
    const img = document.createElement('img');
    img.src = await window.urbeiaDB.getPhotoUrl(hive.photo_url);
    img.alt = hive.nickname ? `Foto de ${hive.nickname}` : 'Foto da caixa';
    img.loading = 'lazy';
    card.appendChild(img);
  }

  const body = document.createElement('div');
  body.className = 'hive-card-body';

  const title = document.createElement('div');
  title.className = 'hive-card-title';
  title.textContent = hive.nickname || (hive.is_urbeia_verified ? 'Caixa Urbeia' : 'Caixa comunitária');

  const meta = document.createElement('div');
  meta.className = 'hive-card-meta';
  meta.textContent = hive.city ? `${hive.city}, ${hive.state || 'SC'}` : 'Santa Catarina';

  const link = document.createElement('a');
  link.className = 'hive-card-link';
  link.href = window.urbeiaSEO?.hiveUrl(hive.public_slug) || `/h.html?slug=${encodeURIComponent(hive.public_slug)}`;
  link.textContent = 'Ver caixa';

  body.append(title, meta, link);
  card.appendChild(body);
  return card;
}

async function initSpeciesPage() {
  const slug = getSpeciesSlug();
  const map = L.map('species-map', { center: CACADOR, zoom: 13, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  let tileLayer = L.tileLayer(getTileUrl(window.urbeiaTheme?.current() || 'dark'), {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  }).addTo(map);

  document.addEventListener('urbeia:themechange', e => {
    map.removeLayer(tileLayer);
    tileLayer = L.tileLayer(getTileUrl(e.detail.theme), {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }).addTo(map);
  });

  try {
    const speciesList = await window.urbeiaDB.getSpecies();
    const species = speciesList.find(s => s.slug === slug);
    if (!species) {
      document.getElementById('species-notfound').style.display = 'block';
      return;
    }

    const hives = await window.urbeiaDB.getApprovedHivesBySpecies(slug);
    const speciesPath = `/especies/${slug}/`;
    const description = `${species.name_pt} (${species.name_scientific}) no Urbeia Map: raio de polinização, indicação urbana e caixas aprovadas.`;
    window.urbeiaSEO?.setPageMeta({
      title: species.name_pt,
      description,
      path: speciesPath,
      image: 'assets/img/og-cover.png',
      type: 'article',
    });
    window.urbeiaSEO?.setJSONLD('species-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${species.name_pt} no Urbeia Map`,
      description,
      url: window.urbeiaSEO.absoluteUrl(speciesPath),
      image: window.urbeiaSEO.DEFAULT_IMAGE,
      inLanguage: 'pt-BR',
      about: {
        '@type': 'Taxon',
        name: species.name_pt,
        alternateName: species.name_scientific,
      },
    });

    document.getElementById('species-dot').style.background = species.color_hex;
    setText('species-title', species.name_pt);
    setText('species-scientific', species.name_scientific);
    setText('info-radius', `${species.pollination_radius_m}m`);
    setText('info-hives', String(hives.length));
    setText('info-size', species.size_mm ? `${species.size_mm}mm` : '—');
    setText('info-honey', species.honey_yield_l_year ? `${species.honey_yield_l_year}L` : '—');
    setText('species-region', `${species.urban_indication ? `${species.urban_indication}. ` : ''}${species.region_pt || ''}`);
    setText('species-behavior', species.behavior || species.description);
    setText('species-observations', species.observations || species.description);
    setText('species-nesting', [species.nesting_type, species.key_plants].filter(Boolean).join(' Recursos florais: '));
    setText('species-conservation', [species.conservation_status, species.best_use].filter(Boolean).join(' Melhor uso: '));

    const layer = L.layerGroup().addTo(map);
    const bounds = [];
    hives.forEach(hive => {
      const coords = computeDisplayCoords(hive);
      bounds.push(coords);
      L.circle(coords, {
        radius: species.pollination_radius_m || 500,
        color: species.color_hex,
        fillColor: species.color_hex,
        fillOpacity: 0.07,
        weight: 1.5,
        opacity: 0.45,
      }).addTo(layer);
      L.marker(coords, {
        icon: L.divIcon({
          html: `<div style="width:18px;height:18px;background:${species.color_hex};border-radius:50%;border:2.5px solid #0a0a0e;box-shadow:0 0 0 2px ${species.color_hex}44,0 0 14px ${species.color_hex}88;"></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(layer);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });

    const grid = document.getElementById('hive-grid');
    if (!hives.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Ainda não há caixas aprovadas desta espécie.</div>';
    } else {
      for (const hive of hives) grid.appendChild(await createHiveCard(hive));
    }

    document.getElementById('species-content').style.display = 'block';
    map.invalidateSize();
  } catch (err) {
    console.error('Erro ao carregar espécie:', err);
    document.getElementById('species-notfound').style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', initSpeciesPage);
