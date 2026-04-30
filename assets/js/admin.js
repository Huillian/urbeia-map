// Admin panel — requires authenticated Supabase session (same login as regular users)

const SUPABASE_URL     = 'https://eerqznktkxxuecbrsbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnF6bmt0a3h4dWVjYnJzYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc5NzYsImV4cCI6MjA5MjM3Mzk3Nn0.wvsMf8s0M9LeJHPUagI_sqcWzxFtmnpLIt7mggsAeLY';

const _db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

// ── Escape ─────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Auth ───────────────────────────────────────────────────────────
let _session = null;

async function checkSession() {
  const { data: { session } } = await _db.auth.getSession();
  _session = session;
  return session;
}

async function sendMagicLink(email) {
  // kept for compatibility — unused, login is via login.html
  const { error } = await _db.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  if (error) throw error;
}

async function signOut() {
  await _db.auth.signOut();
  window.location.reload();
}

// ── Data fetching ──────────────────────────────────────────────────
let _species = {};

async function loadSpecies() {
  const { data, error } = await _db.from('species').select('slug, name_pt, color_hex');
  if (error) return;
  _species = Object.fromEntries(data.map(s => [s.slug, s]));
}

async function loadHives(filter = 'pending') {
  let query = _db
    .from('hives')
    .select('id, public_slug, lat, lng, nickname, species_slug, is_urbeia_verified, approximate_location, owner_name, owner_email, note, installed_at, city, state, status, rejected_reason, created_at, photo_url, pending_photo_url')
    .order('created_at', { ascending: false });

  if (filter !== 'all') query = query.eq('status', filter);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function updateHive(id, patch) {
  const { error } = await _db.from('hives').update(patch).eq('id', id);
  if (error) throw error;
}

async function deleteHive(id) {
  const { error } = await _db.from('hives').delete().eq('id', id);
  if (error) throw error;
}

// ── Stats ──────────────────────────────────────────────────────────
async function loadStats() {
  const { data, error } = await _db
    .from('hives')
    .select('status, is_urbeia_verified');
  if (error) return;

  const total    = data.length;
  const pending  = data.filter(h => h.status === 'pending').length;
  const approved = data.filter(h => h.status === 'approved').length;
  const verified = data.filter(h => h.is_urbeia_verified).length;

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-pending').textContent  = pending;
  document.getElementById('stat-approved').textContent = approved;
  document.getElementById('stat-verified').textContent = verified;

  const badge = document.getElementById('pending-badge');
  if (badge) badge.textContent = pending > 0 ? pending : '';
}

// ── Render table ───────────────────────────────────────────────────
let _currentFilter = 'pending';
let _currentHives  = [];

function speciesTag(slug) {
  const s = _species[slug];
  if (!s) return `<span class="species-tag unknown">—</span>`;
  const color = esc(s.color_hex);
  const name  = esc(s.name_pt);
  return `<span class="species-tag" style="--species-color:${color}">${name}</span>`;
}

function statusBadge(status) {
  const map = {
    pending:  '<span class="badge badge-pending">pendente</span>',
    approved: '<span class="badge badge-approved">aprovada</span>',
    rejected: '<span class="badge badge-rejected">rejeitada</span>',
  };
  return map[status] || `<span class="badge">${esc(status)}</span>`;
}

function verifiedBadge(is_verified) {
  return is_verified
    ? '<span class="badge badge-verified">✦ Verified</span>'
    : '';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

async function getPhotoUrl(pathOrUrl) {
  if (!pathOrUrl) return null;

  let path = pathOrUrl;
  const marker = '/hive-photos/';
  if (pathOrUrl.startsWith('http') && pathOrUrl.includes(marker)) {
    path = decodeURIComponent(pathOrUrl.split(marker)[1]);
  } else if (pathOrUrl.startsWith('http')) {
    return pathOrUrl;
  }

  const { data, error } = await _db.storage.from('hive-photos').createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

function renderTable(hives) {
  _currentHives = hives;
  const tbody = document.getElementById('hives-tbody');
  const empty = document.getElementById('table-empty');

  if (!hives.length) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';

  tbody.innerHTML = hives.map(h => `
    <tr data-id="${esc(h.id)}">
      <td class="col-info">
        <div class="hive-name">${esc(h.nickname || '—')}</div>
        <div class="hive-meta">${esc(h.city || '—')} · ${formatDate(h.created_at)}</div>
        ${h.owner_email ? `<div class="hive-email">${esc(h.owner_email)}</div>` : ''}
      </td>
      <td class="col-species">${speciesTag(h.species_slug)}</td>
      <td class="col-status">
        ${statusBadge(h.status)}
        ${verifiedBadge(h.is_urbeia_verified)}
      </td>
      <td class="col-owner">${esc(h.owner_name || '—')}</td>
      <td class="col-actions">
        ${h.status === 'pending' ? `
          <button class="btn-action btn-approve" data-id="${esc(h.id)}" title="Aprovar">✓</button>
          <button class="btn-action btn-reject"  data-id="${esc(h.id)}" title="Rejeitar">✕</button>
        ` : ''}
        ${h.status === 'approved' && !h.is_urbeia_verified ? `
          <button class="btn-action btn-verify" data-id="${esc(h.id)}" title="Marcar como Urbeia Verified">✦</button>
        ` : ''}
        ${h.status === 'approved' && h.is_urbeia_verified ? `
          <button class="btn-action btn-unverify" data-id="${esc(h.id)}" title="Remover Verified">✦</button>
        ` : ''}
        <button class="btn-action btn-details" data-id="${esc(h.id)}" title="Ver detalhes">⋯</button>
        <button class="btn-action btn-delete"  data-id="${esc(h.id)}" title="Deletar">🗑</button>
      </td>
    </tr>
  `).join('');
}

// ── Detail modal ───────────────────────────────────────────────────
async function openDetail(id) {
  const h = _currentHives.find(x => x.id === id);
  if (!h) return;

  const s = _species[h.species_slug];

  document.getElementById('detail-nickname').textContent  = h.nickname || '—';
  document.getElementById('detail-species').textContent   = s ? `${s.name_pt}` : '—';
  document.getElementById('detail-status').innerHTML      = statusBadge(h.status) + verifiedBadge(h.is_urbeia_verified);
  document.getElementById('detail-owner').textContent     = h.owner_name || '—';
  document.getElementById('detail-email').textContent     = h.owner_email || '—';
  document.getElementById('detail-city').textContent      = `${h.city || '—'}, ${h.state || 'SC'}`;
  document.getElementById('detail-coords').textContent    = `${h.lat?.toFixed(5)}, ${h.lng?.toFixed(5)}`;
  document.getElementById('detail-installed').textContent = h.installed_at ? new Date(h.installed_at).toLocaleDateString('pt-BR') : '—';
  document.getElementById('detail-approx').textContent    = h.approximate_location ? 'Sim (deslocada ~200m)' : 'Não';
  document.getElementById('detail-note').textContent      = h.note || '—';
  document.getElementById('detail-created').textContent   = h.created_at ? new Date(h.created_at).toLocaleString('pt-BR') : '—';
  document.getElementById('detail-slug').textContent      = h.public_slug || '—';

  const photoEl = document.getElementById('detail-photo');
  const displayPhoto = h.pending_photo_url || h.photo_url;
  if (displayPhoto) {
    const signedUrl = await getPhotoUrl(displayPhoto);
    const label = h.pending_photo_url ? 'Foto pendente de aprovação' : 'Foto da caixa';
    photoEl.innerHTML = `<img src="${esc(signedUrl)}" alt="${label}" loading="lazy" />`;
  } else {
    photoEl.innerHTML = '<span class="no-photo">Sem foto</span>';
  }

  if (h.rejected_reason) {
    document.getElementById('detail-rejection').style.display = 'block';
    document.getElementById('detail-rejected-reason').textContent = h.rejected_reason;
  } else {
    document.getElementById('detail-rejection').style.display = 'none';
  }

  const modal = document.getElementById('detail-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('detail-close').focus();
}

function closeDetail() {
  const modal = document.getElementById('detail-modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

// ── Reject modal ───────────────────────────────────────────────────
let _rejectTargetId = null;

function openRejectModal(id) {
  _rejectTargetId = id;
  document.getElementById('reject-reason').value = '';
  const modal = document.getElementById('reject-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('reject-reason').focus();
}

function closeRejectModal() {
  _rejectTargetId = null;
  const modal = document.getElementById('reject-modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

// ── Toast ──────────────────────────────────────────────────────────
let _toastTimer = null;

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${type} visible`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

// ── Actions ────────────────────────────────────────────────────────
async function approve(id) {
  try {
    const hive = _currentHives.find(h => h.id === id);
    const patch = {
      status: 'approved',
      rejected_reason: null,
      ...(hive?.pending_photo_url && {
        photo_url: hive.pending_photo_url,
        pending_photo_url: null,
      }),
    };
    await updateHive(id, patch);
    showToast('Caixa aprovada.');
    await refresh();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

async function reject(id, reason) {
  try {
    await updateHive(id, { status: 'rejected', rejected_reason: reason || null, pending_photo_url: null });
    showToast('Caixa rejeitada.');
    await refresh();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

async function setVerified(id, value) {
  try {
    await updateHive(id, { is_urbeia_verified: value });
    showToast(value ? 'Marcada como Urbeia Verified.' : 'Verified removido.');
    await refresh();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

async function remove(id) {
  if (!confirm('Deletar esta caixa permanentemente?')) return;
  try {
    await deleteHive(id);
    showToast('Caixa deletada.');
    await refresh();
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  }
}

async function refresh() {
  await Promise.all([loadStats(), loadHives(_currentFilter)]).then(([, hives]) => renderTable(hives));
}

// ── Filter tabs ────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _currentFilter = btn.dataset.filter;
      const hives = await loadHives(_currentFilter);
      renderTable(hives);
    });
  });
}

// ── Event delegation ───────────────────────────────────────────────
function initTableEvents() {
  document.getElementById('hives-tbody').addEventListener('click', async e => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.classList.contains('btn-approve'))  { await approve(id); return; }
    if (btn.classList.contains('btn-reject'))   { openRejectModal(id); return; }
    if (btn.classList.contains('btn-verify'))   { await setVerified(id, true); return; }
    if (btn.classList.contains('btn-unverify')) { await setVerified(id, false); return; }
    if (btn.classList.contains('btn-details'))  { await openDetail(id); return; }
    if (btn.classList.contains('btn-delete'))   { await remove(id); return; }
  });
}

const ADMIN_EMAIL = 'huilliancomercial@gmail.com';

// ── Auth UI ────────────────────────────────────────────────────────
function showLoginScreen() {
  // Redirect to shared login page — admin uses the same account as regular users
  window.location.href = 'login.html?next=admin.html';
}

function showAdminPanel() {
  document.getElementById('admin-panel').style.display   = 'block';
  document.getElementById('access-denied').style.display = 'none';
}

function showAccessDenied() {
  document.getElementById('admin-panel').style.display   = 'none';
  document.getElementById('access-denied').style.display = 'flex';
}

// ── Init ───────────────────────────────────────────────────────────
async function init() {
  let _booted = false;

  // Register listener BEFORE getSession — catches magic link redirect token
  _db.auth.onAuthStateChange(async (event, newSession) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newSession && !_booted) {
      _booted = true;
      _session = newSession;
      if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname);
      }
      if (newSession.user.email !== ADMIN_EMAIL) {
        showAccessDenied(); return;
      }
      showAdminPanel();
      await bootPanel();
    } else if (event === 'SIGNED_OUT') {
      _booted = false;
      showLoginScreen();
    }
  });

  // Handle case where no session exists (fresh load, not a magic link redirect)
  const session = await checkSession();
  if (!session && !_booted) {
    showLoginScreen();
  }
}

async function bootPanel() {
  document.getElementById('admin-email').textContent = _session?.user?.email || '';

  await loadSpecies();
  await loadStats();
  const hives = await loadHives('pending');
  renderTable(hives);

  initTabs();
  initTableEvents();

  // Detail modal
  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDetail();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDetail(); closeRejectModal(); }
  });

  // Reject modal
  document.getElementById('reject-cancel').addEventListener('click', closeRejectModal);
  document.getElementById('reject-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeRejectModal();
  });
  document.getElementById('reject-confirm').addEventListener('click', async () => {
    const reason = document.getElementById('reject-reason').value.trim();
    closeRejectModal();
    if (_rejectTargetId) await reject(_rejectTargetId, reason);
    _rejectTargetId = null;
  });

  // Sign out
  document.getElementById('btn-signout').addEventListener('click', signOut);
}

document.addEventListener('DOMContentLoaded', init);
