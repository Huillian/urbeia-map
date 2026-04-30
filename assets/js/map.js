// Design intent: dark scientific map, orange trust signal for verified hives, data-viz aesthetic

const CACADOR = [-26.7749, -51.0156];

const _state = {
  allHives: [],
  activeVerified: true,
  activeCommunity: true,
  activeSpecies: new Set(),
  map: null,
  hivesLayer: null,
  tileLayer: null,
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
        <a href="${window.urbeiaSEO?.hiveUrl(hive.public_slug) || `h.html?slug=${slug}`}" style="font-family:'Geist Mono',monospace;font-size:10px;color:var(--orange);text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,107,53,0.3);padding-bottom:2px;">
          Ver página completa →
        </a>
      </div>` : ''}
    </div>
  `;
}

function groupKey(hive) {
  const latKey = Number(hive.lat).toFixed(4);
  const lngKey = Number(hive.lng).toFixed(4);
  const ownerKey = (hive.owner_name || '').trim().toLowerCase();
  const ownerScope = ownerKey || `hive:${hive.public_slug || hive.id}`;
  const cityKey = (hive.city || '').trim().toLowerCase();
  return [latKey, lngKey, ownerScope, cityKey].join('|');
}

function buildSiteGroups(hives) {
  const byKey = new Map();
  hives.forEach(hive => {
    const key = groupKey(hive);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(hive);
  });

  return Array.from(byKey.values()).map(items => {
    const representative = items[0];
    const speciesCounts = items.reduce((acc, hive) => {
      const species = window.urbeiaSpecies.get(hive.species_slug);
      const name = species?.name_pt || hive.species_slug || 'Espécie não informada';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const radii = items
      .map(hive => window.urbeiaSpecies.get(hive.species_slug)?.pollination_radius_m)
      .filter(Boolean);
    const hasVerified = items.some(hive => hive.is_urbeia_verified);
    const hasCommunity = items.some(hive => !hive.is_urbeia_verified);
    const maxRadius = radii.length ? Math.max(...radii) : 500;
    return {
      hives: items,
      representative,
      coords: representative._displayCoords,
      speciesCounts,
      maxRadius,
      hasVerified,
      hasCommunity,
      isMixed: hasVerified && hasCommunity,
      isAggregate: items.length > 1,
    };
  });
}

function siteTitle(group) {
  if (!group.isAggregate) {
    const hive = group.representative;
    return esc(hive.nickname) || (hive.is_urbeia_verified ? 'Caixa Urbeia' : 'Caixa comunitária');
  }
  if (group.representative.owner_name) return 'Local com múltiplas caixas';
  return 'Ponto com múltiplas caixas';
}

function buildSitePopup(group) {
  if (!group.isAggregate) {
    const hive = group.representative;
    return buildPopup(hive, window.urbeiaSpecies.get(hive.species_slug));
  }

  const hives = group.hives;
  const city = esc(group.representative.city);
  const ownerName = esc(group.representative.owner_name);
  const speciesTotal = Object.keys(group.speciesCounts).length;
  const badgeClass = group.isMixed ? 'badge-mixed' : (group.hasVerified ? 'badge-verified' : 'badge-community');
  const badgeText = group.isMixed ? 'Misto' : (group.hasVerified ? 'Urbeia Verified' : 'Community');
  const speciesRows = Object.entries(group.speciesCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .map(([name, count]) => `
      <div class="meta-row">
        <span class="label">${esc(name)}</span>
        <span class="value">${count} ${count === 1 ? 'caixa' : 'caixas'}</span>
      </div>
    `).join('');
  const firstSlug = hives[0]?.public_slug ? encodeURIComponent(hives[0].public_slug) : null;

  return `
    <div class="hive-popup site-popup">
      <span class="badge ${badgeClass}">${badgeText}</span>
      <h3>${siteTitle(group)}</h3>
      <div class="species">${hives.length} caixas · ${speciesTotal} ${speciesTotal === 1 ? 'espécie' : 'espécies'}</div>

      <div class="meta-row">
        <span class="label">Raio máximo</span>
        <span class="value orange">${group.maxRadius}m <small style="color:var(--text-muted);font-size:10px;font-weight:400">est.</small></span>
      </div>

      ${city ? `
      <div class="meta-row">
        <span class="label">Cidade</span>
        <span class="value">${city}</span>
      </div>` : ''}

      ${ownerName ? `
      <div class="meta-row">
        <span class="label">Criador</span>
        <span class="value">${ownerName}</span>
      </div>` : ''}

      <div class="site-species-list">${speciesRows}</div>

      ${group.representative.approximate_location ? `
      <div class="approx-notice" title="A localização exata foi ocultada para proteger a privacidade do criador">
        <span aria-hidden="true">◎</span>
        <span>Localização aproximada · privacidade preservada</span>
      </div>` : ''}

      ${firstSlug ? `
      <div style="margin-top:12px;">
        <a href="${window.urbeiaSEO?.hiveUrl(hives[0].public_slug) || `h.html?slug=${firstSlug}`}" style="font-family:'Geist Mono',monospace;font-size:10px;color:var(--orange);text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;border-bottom:1px solid rgba(255,107,53,0.3);padding-bottom:2px;">
          Ver primeira caixa →
        </a>
      </div>` : ''}
    </div>
  `;
}

function isMobileMap() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function showMobileHiveSheet(contentHTML) {
  const sheet = document.getElementById('mobile-hive-sheet');
  const content = document.getElementById('mobile-hive-content');
  const filterSheet = document.querySelector('.sidebar');
  if (!sheet || !content) return;

  content.innerHTML = contentHTML;
  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  document.body.classList.add('mobile-detail-open');
  document.body.classList.remove('mobile-filter-open');
  filterSheet?.classList.remove('is-expanded');
  document.getElementById('sheet-toggle')?.setAttribute('aria-expanded', 'false');
}

function hideMobileHiveSheet() {
  const sheet = document.getElementById('mobile-hive-sheet');
  if (!sheet) return;
  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('mobile-detail-open');
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
  const groups = buildSiteGroups(visible);

  groups.forEach(group => {
    const color = group.isMixed ? '#f5c518' : (group.hasVerified ? '#ff6b35' : '#06d6a0');
    const [lat, lng] = group.coords;

    // Pollination circle
    L.circle([lat, lng], {
      radius:      group.maxRadius,
      color,
      fillColor:   color,
      fillOpacity: 0.06,
      weight:      1.5,
      opacity:     0.35,
      dashArray:   group.hasVerified ? null : '5 5',
    }).addTo(_state.hivesLayer);

    // Custom pin
    const pinHtml = group.isAggregate
      ? `<div class="site-pin ${group.isMixed ? 'mixed' : (group.hasVerified ? 'verified' : 'community')}">${group.hives.length}</div>`
      : (group.hasVerified
          ? `<div class="custom-pin-wrapper"><div class="pin-pulse"></div><div class="custom-pin verified"></div></div>`
          : `<div class="custom-pin community"></div>`);
    const iconSize = group.isAggregate ? [34, 34] : [24, 24];
    const iconAnchor = group.isAggregate ? [17, 17] : [12, 12];

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ html: pinHtml, className: 'custom-pin-icon', iconSize, iconAnchor }),
    }).addTo(_state.hivesLayer);

    const popupHTML = buildSitePopup(group);
    marker.bindPopup(popupHTML, { closeButton: true, autoClose: true, maxWidth: 300 });
    marker.on('click', e => {
      if (isMobileMap()) {
        if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
        _state.map.closePopup();
        showMobileHiveSheet(popupHTML);
      }
    });
  });

  updateStats(visible);
}

function updateStats(visible) {
  const total    = visible.length;
  const verified = visible.filter(h => h.is_urbeia_verified).length;
  const species  = new Set(visible.map(h => h.species_slug)).size;
  const cities   = new Set(visible.map(h => h.city).filter(Boolean)).size;
  const radii    = visible
    .map(h => window.urbeiaSpecies.get(h.species_slug)?.pollination_radius_m)
    .filter(Boolean);
  const totalAreaHa = radii.reduce((sum, radius) => sum + (Math.PI * radius * radius) / 10000, 0);
  const avgRadius = radii.length
    ? Math.round(radii.reduce((sum, radius) => sum + radius, 0) / radii.length)
    : 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-total',   total);
  set('stat-verified', verified);
  set('stat-species', species);
  set('stat-area', totalAreaHa ? Math.round(totalAreaHa).toLocaleString('pt-BR') : '0');
  set('stat-cities', cities);
  set('stat-radius', avgRadius ? `${avgRadius}m` : '—');
}

function renderTypeFilterCounts() {
  const verified  = _state.allHives.filter(h => h.is_urbeia_verified).length;
  const community = _state.allHives.filter(h => !h.is_urbeia_verified).length;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('count-verified',  verified);
  set('count-community', community);
}

function renderSpeciesFilters(hiveCounts = {}) {
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

    const count = document.createElement('span');
    count.className = 'hive-count';
    count.textContent = hiveCounts[s.slug] ? `${hiveCounts[s.slug]}` : '0';

    label.append(cb, dot, name, count);

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

function getTileUrl(theme) {
  return theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
}

function swapTileLayer(theme) {
  if (_state.tileLayer) _state.map.removeLayer(_state.tileLayer);
  _state.tileLayer = L.tileLayer(getTileUrl(theme), {
    maxZoom:     19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains:  'abcd',
  }).addTo(_state.map);
}

async function initMap() {
  _state.map = L.map('map', { center: CACADOR, zoom: 14, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(_state.map);
  initMobileSheets();

  swapTileLayer(window.urbeiaTheme?.current() || 'dark');

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

    const hiveCounts = {};
    _state.allHives.forEach(h => {
      hiveCounts[h.species_slug] = (hiveCounts[h.species_slug] || 0) + 1;
    });

    renderTypeFilterCounts();
    renderSpeciesFilters(hiveCounts);
    renderHives();

  } catch (err) {
    console.error('Erro ao carregar dados do mapa:', err);
    showErrorToast('Erro ao carregar o mapa. Recarregue a página.');
  } finally {
    showLoadingState(false);
  }
}

function initMobileSheets() {
  const filterSheet = document.querySelector('.sidebar');
  const toggle = document.getElementById('sheet-toggle');
  const mobileHiveClose = document.getElementById('mobile-hive-close');

  toggle?.addEventListener('click', () => {
    const expanded = filterSheet?.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(Boolean(expanded)));
    document.body.classList.toggle('mobile-filter-open', Boolean(expanded));
    hideMobileHiveSheet();
  });

  mobileHiveClose?.addEventListener('click', hideMobileHiveSheet);

  _state.map.on('click dragstart zoomstart', () => {
    hideMobileHiveSheet();
    if (filterSheet?.classList.contains('is-expanded')) {
      filterSheet.classList.remove('is-expanded');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-filter-open');
    }
  });
}

// Wire up theme changes to swap map tiles
document.addEventListener('urbeia:themechange', e => {
  if (_state.map) swapTileLayer(e.detail.theme);
});

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
