// Supabase client — anon_key é pública e segura de commitar (proteção real via RLS)
// NUNCA adicionar service_role key aqui

const SUPABASE_URL     = 'https://eerqznktkxxuecbrsbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnF6bmt0a3h4dWVjYnJzYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc5NzYsImV4cCI6MjA5MjM3Mzk3Nn0.wvsMf8s0M9LeJHPUagI_sqcWzxFtmnpLIt7mggsAeLY';

const _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

// Exposed for auth.js and other modules that need the raw client
window._urbeiaClient = _client;

window.urbeiaDB = {

  // ── Species ──────────────────────────────────────────────────────
  async getSpecies() {
    const { data, error } = await _client
      .from('species')
      .select('slug, name_pt, name_scientific, pollination_radius_m, color_hex, size_mm, honey_yield_l_year, region_pt')
      .order('name_pt');
    if (error) throw new Error(`getSpecies: ${error.message}`);
    return data;
  },

  // ── Public hive queries ───────────────────────────────────────────
  // owner_email excluído intencionalmente — nunca retornado ao cliente público
  async getApprovedHives() {
    const { data, error } = await _client
      .from('hives')
      .select('id, public_slug, lat, lng, nickname, species_slug, is_urbeia_verified, approximate_location, owner_name, note, installed_at, city')
      .eq('status', 'approved');
    if (error) throw new Error(`getApprovedHives: ${error.message}`);
    return data;
  },

  async getHiveBySlug(slug) {
    const { data, error } = await _client
      .from('hives')
      .select('id, public_slug, lat, lng, nickname, species_slug, is_urbeia_verified, approximate_location, owner_name, note, installed_at, city, state, photo_url')
      .eq('public_slug', slug)
      .eq('status', 'approved')
      .single();
    if (error) throw new Error(`getHiveBySlug: ${error.message}`);
    return data;
  },

  // ── User hive management ──────────────────────────────────────────
  async getUserHives() {
    const { data: { user } } = await _client.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await _client
      .from('hives')
      .select('id, public_slug, lat, lng, nickname, species_slug, is_urbeia_verified, approximate_location, owner_name, note, installed_at, city, state, status, rejected_reason, created_at, photo_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`getUserHives: ${error.message}`);
    return data;
  },

  async updateHive(id, patch) {
    const { error } = await _client
      .from('hives')
      .update({ ...patch, status: 'pending', is_urbeia_verified: false })
      .eq('id', id);
    if (error) throw new Error(`updateHive: ${error.message}`);
  },

  async deleteHive(id) {
    const { error } = await _client.from('hives').delete().eq('id', id);
    if (error) throw new Error(`deleteHive: ${error.message}`);
  },

  // ── Submit (insert) ───────────────────────────────────────────────
  async submitHive(hiveData) {
    const { error } = await _client
      .from('hives')
      .insert({ ...hiveData, status: 'pending', is_urbeia_verified: false });
    if (error) throw new Error(`submitHive: ${error.message}`);
  },

  // ── Storage ───────────────────────────────────────────────────────
  async uploadPhoto(file) {
    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await _client.storage
      .from('hive-photos')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`uploadPhoto: ${error.message}`);
    const { data: urlData } = _client.storage.from('hive-photos').getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  // ── Auth ──────────────────────────────────────────────────────────
  async getSession() {
    const { data: { session } } = await _client.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await _client.auth.getUser();
    return user;
  },

  async signInWithGoogle(redirectTo) {
    const { error } = await _client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo || `${location.origin}/index.html` },
    });
    if (error) throw error;
  },

  async signInWithEmail(email, password) {
    const { error } = await _client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signUp(email, password) {
    const { error } = await _client.auth.signUp({ email, password });
    if (error) throw error;
  },

  async signOut() {
    await _client.auth.signOut();
  },

  onAuthChange(cb) {
    return _client.auth.onAuthStateChange(cb);
  },
};
