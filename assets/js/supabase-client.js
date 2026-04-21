// Supabase client — anon_key é pública e segura de commitar (proteção real via RLS)
// NUNCA adicionar service_role key aqui

const SUPABASE_URL = 'https://eerqznktkxxuecbrsbsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcnF6bmt0a3h4dWVjYnJzYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTc5NzYsImV4cCI6MjA5MjM3Mzk3Nn0.wvsMf8s0M9LeJHPUagI_sqcWzxFtmnpLIt7mggsAeLY';

const _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.urbeiaDB = {
  async getSpecies() {
    const { data, error } = await _client
      .from('species')
      .select('slug, name_pt, name_scientific, pollination_radius_m, color_hex, size_mm, honey_yield_l_year, region_pt')
      .order('name_pt');
    if (error) throw new Error(`getSpecies: ${error.message}`);
    return data;
  },

  // owner_email excluído intencionalmente — nunca deve ser retornado ao cliente público
  async getApprovedHives() {
    const { data, error } = await _client
      .from('hives')
      .select('id, public_slug, lat, lng, nickname, species_slug, is_urbeia_verified, approximate_location, owner_name, note, installed_at, city')
      .eq('status', 'approved');
    if (error) throw new Error(`getApprovedHives: ${error.message}`);
    return data;
  },

  async submitHive(hiveData) {
    const { data, error } = await _client
      .from('hives')
      .insert({ ...hiveData, status: 'pending', is_urbeia_verified: false })
      .select('id, public_slug')
      .single();
    if (error) throw new Error(`submitHive: ${error.message}`);
    return data;
  },

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
};
