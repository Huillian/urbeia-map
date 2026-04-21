// Design intent: dark scientific map, orange trust signal for verified hives, data-viz aesthetic

const CACADOR = [-26.7749, -51.0156];

const _state = {
  allHives: [],
  activeVerified: true,
  activeCommunity: true,
  activeSpecies: new Set(),
  map: null,
  hivesLayer: null,
};

// Offset coords for privacy when approximate_location=true (~200m random shift)
function computeDisplayCoords(hive) {
  if (!hive.approximate_location) return [hive.lat, hive.lng];
  const offsetLat = (Math.random() - 0.5) * 0.004;
  const offsetLng = (Math.random() - 0.5) * 0.004;
  return [hive.lat + offsetLat, hive.lng + offsetLng];
}

// Safe escaping for user-supplied fields used in innerHTML
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
}

function buildPopup(hive, species) {
  const nickname   = esc(hive.nickname) || (hive.is_urbeia_verified ? 'Caixa Urbeia' : 'Caixa comunitária');
  const ownerName  = esc(hive.owner_name);
  const note       = esc(hive.note);
  const city       = esc(hive.city);
  const slug       = hive.public_slug ? encodeURIComponent(hive.public_slug) : null;

  const badgeClass = hive.is_urbeia_verified ? 'badge-verified' : 'badge-community';
  const badgeText  = hive.is_urbeia_verified ? '🟠 Urbeia Verified' : '🟢 Community';
  const radius     = species?.pollination_radius_m;

  return `
    <div class="hive-popup">
      <span class="badge ${badgeClass}">${badgeText}</span>
      <h3>${nickname}</h3>
      ${species ? `<div class="species">${species.name_scientific}</div>` : ''}

      ${species ? `
      <div class="meta-row">
        <span class="label">Espécie</span>
        <span class="value">${species.name_pt}</span>
      </div>` : ''}

      ${radius ? `
      <div class="meta-row">
        <span class="label">Raio polinização</span>
        <span class="value orange">${radius}m <small style="color:var(--text-muted);font-size:10px;font-weight:400">est.</small></span>
      </div>` : ''}

      ${ownerName ? `
      <div class="meta-row">
        <span class="label">Criador</span>
        <span class="value">${ownerName}</span>
      </div>` : ''}

      ${hive.installed_at ? `
      <div class="meta-row">
        <span class="label">Instalada</span>
        <span class="value">${formatDate(hive.installed_at)}</span>
      </div>` : ''}

      ${city ? `
      <div class="meta-row">
        <span class="label">Cidade</span>
        <span class="value">${city}</span>
      </div>` : ''}

      ${note ? `<div class="note">"${note}"</div>` : ''}

      ${hive.approximate_location ? `
      <div class="approx-notice" title="A localização exata foi ocultada para proteger a privacidade do criador">
        <span aria-hidden="true">◎</span>
        <span>Localização aproximada · ±200m por privacidade</span>
      </div>` : ''}

      ${slug ? `
      <div style="margin-top:12px;">
        <a href="h.html?slug=${slug}" style="font-family:'Geist Mono',monospace;font-size:10px;color:var(--orange);text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,107,53,0.3);padding-bottom:2px;">
          Ver página completa →
        </a>
      </div>` : ''}
    </div>
  `;
}

function getVisible() {
  return _state.allHives.filter(h => {
    const typeOk    = (h.is_urbeia_verified && _state.activeVerified) || (!h.is_urbeia_verified && _state.activeCommunity);
    const speciesOk = _state.activeSpecies.has(h.species_slug);
    return typeOk && speciesOk;
  });
}

function renderHives() {
  _state.hivesLayer.clearLayers();
  const visible = getVisible();

  visible.forEach(hive => {
    const species = window.urbeiaSpecies.get(hive.species_slug);
    const color   = hive.is_urbeia_verified ? '#ff6b35' : '#06d6a0';
    const [lat, lng] = hive._displayCoords;

    // Pollination circle
    L.circle([lat, lng], {
      radius:      species?.pollination_radius_m || 500,
      color,
      fillColor:   color,
      fillOpacity: 0.06,
      weight:      1.5,
      opacity:     0.35,
      dashArray:   hive.is_urbeia_verified ? null : '5 5',
    }).addTo(_state.hivesLayer);

    // Custom pin
    const pinHtml = hive.is_urbeia_verified
      ? `<div class="custom-pin-wrapper"><div class="pin-pulse"></div><div class="custom-pin verified"></div></div>`
      : `<div class="custom-pin community"></div>`;

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ html: pinHtml, className: 'custom-pin-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    }).addTo(_state.hivesLayer);

    marker.bindPopup(buildPopup(hive, species), { closeButton: true, autoClose: true, maxWidth: 280 });
  });

  updateStats(visible);
}

function updateStats(visible) {
  const total    = visible.length;
  const verified = visible.filter(h => h.is_urbeia_verified).length;
  const species  = new Set(visible.map(h => h.species_slug)).size;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-total',   total);
  set('stat-verified', verified);
  set('stat-species', species);
}

function renderTypeFilterCounts() {
  const verified  = _state.allHives.filter(h => h.is_urbeia_verified).length;
  const community = _state.allHives.filter(h => !h.is_urbeia_verified).length;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('count-verified',  verified);
  set('count-community', community);
}

function renderSpeciesFilters() {
  const container = document.getElementById('species-filters');
  if (!container) return;
  container.innerHTML = '';

  window.urbeiaSpecies.all().forEach(s => {
    const label = document.createElement('label');
    label.className = 'species-chip active';
    label.setAttribute('aria-label', `Filtrar ${s.name_pt}`);

    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.value   = s.slug;
    cb.checked = true;

    const dot  = document.createElement('span');
    dot.className = 'color-dot';
    dot.style.background = s.color_hex;

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = s.name_pt;

    const radius = document.createElement('span');
    radius.className = 'radius';
    radius.textContent = `${s.pollination_radius_m}m`;

    label.append(cb, dot, name, radius);

    cb.addEventListener('change', e => {
      if (e.target.checked) { _state.activeSpecies.add(s.slug); label.classList.add('active'); }
      else                  { _state.activeSpecies.delete(s.slug); label.classList.remove('active'); }
      renderHives();
    });

    container.appendChild(label);
  });
}

function showLoadingState(visible) {
  const overlay = document.getElementById('map-loading');
  if (overlay) overlay.style.display = visible ? 'flex' : 'none';
}

function showErrorToast(msg) {
  const el = document.getElementById('map-error');
  if (el) { el.textContent = msg; el.style.display = 'flex'; }
}

async function initMap() {
  _state.map = L.map('map', { center: CACADOR, zoom: 14, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(_state.map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom:     19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains:  'abcd',
  }).addTo(_state.map);

  _state.hivesLayer = L.layerGroup().addTo(_state.map);

  showLoadingState(true);

  try {
    const [species, hives] = await Promise.all([
      window.urbeiaDB.getSpecies(),
      window.urbeiaDB.getApprovedHives(),
    ]);

    window.urbeiaSpecies.init(species);

    _state.allHives = hives.map(h => ({
      ...h,
      _displayCoords: computeDisplayCoords(h),
    }));

    species.forEach(s => _state.activeSpecies.add(s.slug));

    renderTypeFilterCounts();
    renderSpeciesFilters();
    renderHives();

  } catch (err) {
    console.error('Erro ao carregar dados do mapa:', err);
    showErrorToast('Erro ao carregar o mapa. Recarregue a página.');
  } finally {
    showLoadingState(false);
  }
}

// Wire up type filters
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filter-verified')?.addEventListener('change', e => {
    _state.activeVerified = e.target.checked;
    renderHives();
  });
  document.getElementById('filter-community')?.addEventListener('change', e => {
    _state.activeCommunity = e.target.checked;
    renderHives();
  });

  initMap();
});
