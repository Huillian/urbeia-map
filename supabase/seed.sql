-- =====================================================
-- SEED: espécies de abelhas sem ferrão (ASF)
-- Foco: região Oeste de Santa Catarina
-- =====================================================

INSERT INTO species (
  slug, name_pt, name_scientific,
  pollination_radius_m, size_mm, honey_yield_l_year,
  region_pt, color_hex
) VALUES
  ('jatai',     'Jataí',     'Tetragonisca angustula',      500, '4-5',   '0.5-1.5', 'Ocorre em todo SC. Excelente para iniciantes e áreas urbanas.', '#f5c518'),
  ('irai',      'Iraí',      'Nannotrigona testaceicornis',  400, '3-4',   '0.3-0.8', 'Recomendada para região Oeste de SC.',                          '#06d6a0'),
  ('mandacaia', 'Mandaçaia', 'Melipona quadrifasciata',      900, '10-11', '3-6',     'Ocorre no Oeste e Planalto Catarinense.',                       '#a78bfa'),
  ('bora',      'Borá',      'Tetragona clavipes',           600, '8-9',   '1-2',     'Para espaços amplos, região Oeste.',                            '#5b9eff'),
  ('mirim',     'Mirim',     'Plebeia spp.',                 300, '3-4',   '0.2-0.5', 'Pequena, ideal para apartamentos e varandas.',                  '#ff6b35'),
  ('guaraipo',  'Guaraipo',  'Melipona bicolor',             700, '8-9',   '2-4',     'Para lugares mais úmidos.',                                     '#ec4899'),
  ('tubuna',    'Tubuna',    'Scaptotrigona bipunctata',     700, '6-7',   '1-3',     'Para quintais maiores, ocorre em SC.',                          '#14b8a6')
ON CONFLICT (slug) DO UPDATE SET
  name_pt               = EXCLUDED.name_pt,
  name_scientific       = EXCLUDED.name_scientific,
  pollination_radius_m  = EXCLUDED.pollination_radius_m,
  size_mm               = EXCLUDED.size_mm,
  honey_yield_l_year    = EXCLUDED.honey_yield_l_year,
  region_pt             = EXCLUDED.region_pt,
  color_hex             = EXCLUDED.color_hex;
