// Design intent: guided registration flow, map-first pin placement, honest feedback

const CACADOR        = [-26.7749, -51.0156];
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ADMIN_EMAIL    = 'huilliancomercial@gmail.com';

let _map     = null;
let _marker  = null;
let _coords  = null; // { lat, lng } set when user places pin
let _isAdmin = false;

// ── Slug generation ───────────────────────────────────────────────
function generateSlug(ownerName, city) {
  const base = `${ownerName || 'comunidade'}-${city || 'sc'}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 28);
  return `${base}-${Date.now().toString(36)}`;
}

// ── Geocoding (Nominatim) ─────────────────────────────────────────
let _searchTimer = null;

async function searchAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=br&addressdetails=1&email=map.urbeia.com.br`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('Nominatim error');
  return res.json();
}

function initSearch() {
  const input    = document.getElementById('search-address');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    clearTimeout(_searchTimer);
    const q = input.value.trim();
    if (q.length < 3) { closeDropdown(); return; }

    _searchTimer = setTimeout(async () => {
      try {
        const results = await searchAddress(q);
        renderDropdown(results);
      } catch { closeDropdown(); }
    }, 500); // respeita limite 1 req/s do Nominatim
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDropdown();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-container')) closeDropdown();
  });
}

function renderDropdown(results) {
  const dropdown = document.getElementById('search-dropdown');
  dropdown.innerHTML = '';

  if (!results.length) {
    const empty = document.createElement('div');
    empty.className = 'search-result-empty';
    empty.textContent = 'Nenhum resultado encontrado.';
    dropdown.appendChild(empty);
    dropdown.style.display = 'block';
    return;
  }

  results.forEach(r => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'search-result-item';

    const name = document.createElement('span');
    name.className = 'result-name';
    // Nominatim result — safe to use textContent
    name.textContent = r.display_name.split(',').slice(0, 3).join(',');

    const sub = document.createElement('span');
    sub.className = 'result-sub';
    sub.textContent = r.display_name.split(',').slice(3).join(',').trim();

    item.append(name, sub);

    item.addEventListener('click', () => {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      _map.setView([lat, lng], 17);
      placePinAt(lat, lng);
      document.getElementById('search-address').value = r.display_name.split(',')[0];
      closeDropdown();
    });

    dropdown.appendChild(item);
  });

  dropdown.style.display = 'block';
}

function closeDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

// ── Geolocation ───────────────────────────────────────────────────
function initGeolocation() {
  const btn = document.getElementById('btn-geolocate');
  if (!btn) return;

  if (!navigator.geolocation) {
    btn.style.display = 'none';
    return;
  }

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = '<span class="geo-spinner" aria-hidden="true"></span>';

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        _map.setView([lat, lng], 17);
        placePinAt(lat, lng);
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
        btn.innerHTML = '📍';
        btn.title = 'Localização usada!';
      },
      err => {
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
        btn.innerHTML = '📍';
        if (err.code === err.PERMISSION_DENIED) {
          btn.title = 'Permissão de localização negada.';
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}

// ── Map init ──────────────────────────────────────────────────────
let _tileLayer = null;

function getTileUrl(theme) {
  return theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
}

function swapTileLayer(theme) {
  if (_tileLayer) _map.removeLayer(_tileLayer);
  _tileLayer = L.tileLayer(getTileUrl(theme), {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  }).addTo(_map);
}

function initMap() {
  _map = L.map('form-map', { center: CACADOR, zoom: 14, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(_map);

  swapTileLayer(window.urbeiaTheme?.current() || 'dark');

  // Click on map to place pin
  _map.on('click', e => placePinAt(e.latlng.lat, e.latlng.lng));
}

document.addEventListener('urbeia:themechange', e => {
  if (_map) swapTileLayer(e.detail.theme);
});

function placePinAt(lat, lng) {
  _coords = { lat, lng };

  if (_marker) {
    _marker.setLatLng([lat, lng]);
  } else {
    _marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        html: `<div class="hive-box-pin form"><img src="assets/img/hive-box-icon.png" alt="" width="30"></div>`,
        className: 'custom-pin-icon',
        iconSize: [30, 38],
        iconAnchor: [15, 35],
      }),
    }).addTo(_map);

    _marker.on('dragend', () => {
      const pos = _marker.getLatLng();
      _coords = { lat: pos.lat, lng: pos.lng };
      updatePinHint(true);
    });
  }

  updatePinHint(true);
  document.getElementById('btn-submit').disabled = false;
}

function updatePinHint(placed) {
  const hint = document.getElementById('pin-hint');
  if (!hint) return;
  if (placed) {
    hint.textContent = 'Arraste o pin para ajustar a posição exata.';
    hint.classList.add('placed');
  } else {
    hint.textContent = 'Clique no mapa para marcar onde fica a caixa.';
    hint.classList.remove('placed');
  }
}

// ── Photo validation ──────────────────────────────────────────────
function validatePhoto(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG ou WebP.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }
}

// ── Photo preview ─────────────────────────────────────────────────
function setupPhotoPreview() {
  const input   = document.getElementById('field-photo');
  const preview = document.getElementById('photo-preview');
  const error   = document.getElementById('photo-error');

  if (!input) return;

  input.addEventListener('change', () => {
    error.textContent = '';
    preview.innerHTML = '';
    const file = input.files[0];
    if (!file) return;

    try {
      validatePhoto(file);
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = 'Preview da foto';
      preview.appendChild(img);
    } catch (err) {
      error.textContent = err.message;
      input.value = '';
    }
  });
}

// ── Admin mode UI ─────────────────────────────────────────────────
function applyAdminMode(session) {
  _isAdmin = true;

  const subtitle = document.getElementById('form-subtitle');
  if (subtitle) subtitle.textContent = 'Modo admin · caixa aprovada diretamente.';

  const emailGroup = document.getElementById('field-email')?.closest('.field-group');
  if (emailGroup) emailGroup.style.display = 'none';
  const emailInput = document.getElementById('field-email');
  if (emailInput) emailInput.value = session.user.email;

  const nameInput = document.getElementById('field-owner');
  if (nameInput && !nameInput.value) {
    const raw = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
    if (raw) nameInput.value = raw;
  }

  const verifiedGroup = document.getElementById('admin-verified-group');
  if (verifiedGroup) verifiedGroup.style.display = 'block';

  const btnText = document.getElementById('btn-text');
  if (btnText && btnText.textContent !== 'Marque a localização no mapa') {
    btnText.textContent = 'Cadastrar e aprovar';
  }
}

// ── UI helpers ────────────────────────────────────────────────────
function setLoading(loading) {
  const btn  = document.getElementById('btn-submit');
  const text = document.getElementById('btn-text');
  const spin = document.getElementById('btn-spinner');
  btn.disabled  = loading || !_coords;
  text.textContent = loading ? 'Enviando...' : (_isAdmin ? 'Cadastrar e aprovar' : 'Enviar para aprovação');
  spin.style.display = loading ? 'inline-block' : 'none';
}

function showSuccess() {
  document.getElementById('form-card').style.display = 'none';
  document.getElementById('success-card').style.display = 'flex';
  if (_isAdmin) {
    const title = document.getElementById('success-title');
    const text  = document.getElementById('success-text');
    if (title) title.innerHTML = 'Caixa <em>publicada!</em>';
    if (text)  text.textContent = 'A caixa foi aprovada e já aparece no mapa.';
  }
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

// ── Form submit ───────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  if (!_coords) {
    updatePinHint(false);
    document.getElementById('form-map').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const speciesSlug = document.getElementById('field-species').value;
  if (!speciesSlug) {
    showFieldError('error-species', 'Selecione a espécie.');
    return;
  }

  const ownerEmail = document.getElementById('field-email').value.trim();
  if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    showFieldError('error-email', 'E-mail inválido.');
    return;
  }

  const ownerName      = document.getElementById('field-owner').value.trim();
  const nickname       = document.getElementById('field-nickname').value.trim();
  const installedAt    = document.getElementById('field-installed').value || null;
  const note           = document.getElementById('field-note').value.trim();
  const city           = document.getElementById('field-city').value.trim() || 'Caçador';
  const approxLocation = document.getElementById('field-approx').checked;
  const photoFile      = document.getElementById('field-photo').files[0] || null;

  setLoading(true);

  try {
    let photoUrl = null;

    if (photoFile) {
      try {
        validatePhoto(photoFile);
        photoUrl = await window.urbeiaDB.uploadPhoto(photoFile);
      } catch (err) {
        // Upload failure is non-blocking — proceed without photo
        console.error('Upload de foto falhou:', err);
      }
    }

    const session = await window.urbeiaDB.getSession();
    if (!session) { location.replace('login.html?next=cadastrar.html'); return; }

    const hiveData = {
      public_slug:          generateSlug(ownerName, city),
      species_slug:         speciesSlug,
      lat:                  _coords.lat,
      lng:                  _coords.lng,
      city:                 city || null,
      state:                'SC',
      approximate_location: approxLocation,
      nickname:             nickname || null,
      installed_at:         installedAt,
      owner_name:           ownerName || null,
      owner_email:          ownerEmail || null,
      note:                 note || null,
      user_id:              session.user.id,
    };

    if (_isAdmin) {
      hiveData.photo_url = photoUrl;
      hiveData.photo_review_status = photoUrl ? 'approved' : 'none';
      hiveData.data_quality_status = 'verified';
      const isVerified = document.getElementById('field-verified')?.checked ?? true;
      await window.urbeiaDB.submitHiveAdmin(hiveData, isVerified);
    } else {
      hiveData.pending_photo_url = photoUrl;
      hiveData.photo_review_status = photoUrl ? 'pending' : 'none';
      hiveData.data_quality_status = 'needs_review';
      await window.urbeiaDB.submitHive(hiveData);
    }
    showSuccess();

  } catch (err) {
    console.error('Erro ao cadastrar caixa:', err);
    showFieldError('error-submit', 'Erro ao enviar. Tente novamente.');
  } finally {
    setLoading(false);
  }
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  // Auth guard — redirect to login if not authenticated
  const session = await window.urbeiaDB.getSession();
  if (!session) {
    location.replace('login.html?next=cadastrar.html');
    return;
  }

  if (session.user.email === ADMIN_EMAIL) applyAdminMode(session);

  initMap();
  initSearch();
  initGeolocation();
  setupPhotoPreview();

  // Populate species select
  try {
    const species = await window.urbeiaDB.getSpecies();
    const select  = document.getElementById('field-species');
    species.forEach(s => {
      const opt    = document.createElement('option');
      opt.value    = s.slug;
      opt.textContent = `${s.name_pt} — ${s.name_scientific}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Erro ao carregar espécies:', err);
  }

  document.getElementById('cadastro-form').addEventListener('submit', handleSubmit);
}

document.addEventListener('DOMContentLoaded', init);
