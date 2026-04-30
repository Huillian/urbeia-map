function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function formatArea(value) {
  return `${Math.round(value || 0).toLocaleString('pt-BR')} ha`;
}

function areaHa(radius) {
  return radius ? (Math.PI * radius * radius) / 10000 : 0;
}

function groupBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || 'Não informado';
    acc[key] = acc[key] || [];
    acc[key].push(row);
    return acc;
  }, {});
}

function renderMetric(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderBars(id, items, total) {
  const root = document.getElementById(id);
  if (!root) return;
  root.innerHTML = '';

  if (!items.length) {
    root.innerHTML = '<div class="impact-empty">Ainda não há dados aprovados para esta visão.</div>';
    return;
  }

  items.forEach(item => {
    const pct = total ? Math.round((item.count / total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'impact-bar-row';
    row.innerHTML = `
      <div class="impact-bar-head">
        <span>${item.label}</span>
        <strong>${item.count}</strong>
      </div>
      <div class="impact-bar-track" aria-hidden="true">
        <span style="width:${Math.max(pct, 4)}%"></span>
      </div>
      <div class="impact-bar-meta">${pct}% dos registros · ${formatArea(item.area)}</div>
    `;
    root.appendChild(row);
  });
}

async function initImpactPage() {
  const status = document.getElementById('impact-status');

  try {
    const [species, hives] = await Promise.all([
      window.urbeiaDB.getSpecies(),
      window.urbeiaDB.getApprovedHives(),
    ]);

    const speciesBySlug = Object.fromEntries(species.map(item => [item.slug, item]));
    const enriched = hives.map(hive => {
      const item = speciesBySlug[hive.species_slug] || {};
      const radius = Number(item.pollination_radius_m || 0);
      return {
        ...hive,
        species_name: item.name_pt || hive.species_slug || 'Não informado',
        radius,
        area: areaHa(radius),
      };
    });

    const total = enriched.length;
    const verified = enriched.filter(item => item.is_urbeia_verified).length;
    const community = total - verified;
    const cities = new Set(enriched.map(item => item.city).filter(Boolean)).size;
    const speciesCount = new Set(enriched.map(item => item.species_slug).filter(Boolean)).size;
    const totalArea = enriched.reduce((sum, item) => sum + item.area, 0);
    const avgRadius = total
      ? Math.round(enriched.reduce((sum, item) => sum + item.radius, 0) / total)
      : 0;

    renderMetric('metric-hives', formatNumber(total));
    renderMetric('metric-area', formatArea(totalArea));
    renderMetric('metric-species', formatNumber(speciesCount));
    renderMetric('metric-cities', formatNumber(cities));
    renderMetric('metric-verified', formatNumber(verified));
    renderMetric('metric-community', formatNumber(community));
    renderMetric('metric-radius', avgRadius ? `${avgRadius}m` : '—');
    renderMetric('metric-updated', new Date().toLocaleDateString('pt-BR'));

    const bySpecies = Object.entries(groupBy(enriched, item => item.species_name))
      .map(([label, rows]) => ({
        label,
        count: rows.length,
        area: rows.reduce((sum, item) => sum + item.area, 0),
      }))
      .sort((a, b) => b.count - a.count || b.area - a.area);

    const byCity = Object.entries(groupBy(enriched, item => item.city || item.state))
      .map(([label, rows]) => ({
        label,
        count: rows.length,
        area: rows.reduce((sum, item) => sum + item.area, 0),
      }))
      .sort((a, b) => b.count - a.count || b.area - a.area);

    renderBars('impact-species-bars', bySpecies.slice(0, 8), total);
    renderBars('impact-city-bars', byCity.slice(0, 8), total);

    if (status) status.textContent = 'Indicadores calculados a partir dos registros aprovados.';
  } catch (err) {
    console.error('Erro ao carregar impacto:', err);
    if (status) status.textContent = 'Não foi possível carregar os indicadores públicos.';
  }
}

document.addEventListener('DOMContentLoaded', initImpactPage);
