// Species utilities — expõe window.urbeiaSpecies

window.urbeiaSpecies = {
  _map: {},

  init(speciesArray) {
    this._map = Object.fromEntries(speciesArray.map(s => [s.slug, s]));
  },

  get(slug) {
    return this._map[slug] || null;
  },

  all() {
    return Object.values(this._map).sort((a, b) => a.name_pt.localeCompare(b.name_pt, 'pt'));
  },

  getColor(slug) {
    return this.get(slug)?.color_hex || '#06d6a0';
  },

  formatRadius(meters) {
    if (!meters) return '—';
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
  },
};
