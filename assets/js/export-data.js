function csvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildExportRows(hives, speciesBySlug) {
  return hives.map(hive => {
    const species = speciesBySlug[hive.species_slug] || {};
    const precision = hive.approximate_location ? 'approximate' : 'exact';
    const coordDigits = hive.approximate_location ? 2 : 6;
    const latPublic = hive.lat === null || hive.lat === undefined ? '' : Number(hive.lat).toFixed(coordDigits);
    const lngPublic = hive.lng === null || hive.lng === undefined ? '' : Number(hive.lng).toFixed(coordDigits);
    return {
      public_slug: hive.public_slug || '',
      nickname: hive.nickname || '',
      species_slug: hive.species_slug || '',
      species_name: species.name_pt || '',
      species_scientific: species.name_scientific || '',
      city: hive.city || '',
      state: hive.state || 'SC',
      is_urbeia_verified: Boolean(hive.is_urbeia_verified),
      pollination_radius_m: species.pollination_radius_m || '',
      installed_at: hive.installed_at || '',
      approximate_location: Boolean(hive.approximate_location),
      coordinate_precision: precision,
      location_privacy_m: hive.approximate_location ? 1000 : 0,
      lat_public: latPublic,
      lng_public: lngPublic,
      public_url: hive.public_slug ? `${location.origin}/h.html?slug=${encodeURIComponent(hive.public_slug)}` : '',
    };
  });
}

function toCSV(rows) {
  const headers = [
    'public_slug',
    'nickname',
    'species_slug',
    'species_name',
    'species_scientific',
    'city',
    'state',
    'is_urbeia_verified',
    'pollination_radius_m',
    'installed_at',
    'approximate_location',
    'coordinate_precision',
    'location_privacy_m',
    'lat_public',
    'lng_public',
    'public_url',
  ];
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(header => csvValue(row[header])).join(',')),
  ];
  return lines.join('\n');
}

function renderPreview(rows) {
  const count = document.getElementById('data-count');
  const updated = document.getElementById('data-updated');
  const tbody = document.getElementById('data-preview-body');
  if (count) count.textContent = String(rows.length);
  if (updated) updated.textContent = new Date().toLocaleDateString('pt-BR');
  if (!tbody) return;

  tbody.innerHTML = '';
  rows.slice(0, 12).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${csvValue(row.nickname || row.public_slug)}</td>
      <td>${csvValue(row.species_name)}</td>
      <td>${csvValue(row.city || row.state)}</td>
      <td>${row.is_urbeia_verified ? 'Urbeia Verified' : 'Community'}</td>
      <td>${row.approximate_location ? 'aproximada' : 'exata'}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function initExportPage() {
  const status = document.getElementById('data-status');
  const btnCSV = document.getElementById('download-csv');
  const btnJSON = document.getElementById('download-json');

  try {
    const [species, hives] = await Promise.all([
      window.urbeiaDB.getSpecies(),
      window.urbeiaDB.getApprovedHives(),
    ]);
    const speciesBySlug = Object.fromEntries(species.map(item => [item.slug, item]));
    const rows = buildExportRows(hives, speciesBySlug);
    renderPreview(rows);

    btnCSV?.addEventListener('click', () => {
      downloadBlob('urbeia-map-caixas-aprovadas.csv', toCSV(rows), 'text/csv;charset=utf-8');
    });

    btnJSON?.addEventListener('click', () => {
      const payload = {
        dataset: 'Urbeia Map - caixas aprovadas',
        generated_at: new Date().toISOString(),
        license: 'CC-BY 4.0',
        privacy_note: 'Coordenadas públicas usam lat_public/lng_public. Quando approximate_location=true, os valores são arredondados para 2 casas decimais e coordinate_precision=approximate.',
        records: rows,
      };
      downloadBlob('urbeia-map-caixas-aprovadas.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    });

    if (status) status.textContent = 'Dados carregados.';
    btnCSV?.removeAttribute('disabled');
    btnJSON?.removeAttribute('disabled');
  } catch (err) {
    console.error('Erro ao carregar exportação:', err);
    if (status) status.textContent = 'Não foi possível carregar os dados públicos.';
  }
}

document.addEventListener('DOMContentLoaded', initExportPage);
