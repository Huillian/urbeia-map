-- =====================================================
-- SEED: espécies de abelhas sem ferrão (ASF)
-- Base: deep research sobre espécies brasileiras comuns
-- =====================================================

INSERT INTO species (
  slug, name_pt, name_scientific,
  pollination_radius_m, size_mm, honey_yield_l_year,
  region_pt, family_tribe, urban_indication, behavior,
  description, observations, nesting_type, key_plants,
  conservation_status, best_use, occurrence_regions, color_hex
) VALUES
  (
    'jatai', 'Jataí', 'Tetragonisca angustula',
    500, '4-5', '0.5-1.5',
    'Praticamente todas as regiões do Brasil; muito comum em áreas urbanas e rurais.',
    'Apidae / Meliponini', 'Muito alta',
    'Dócil; defesa organizada por guardas e uso de resina contra invasores.',
    'Uma das espécies mais criadas no Brasil. Adapta-se bem a cavidades artificiais, jardins, muros e quintais, sendo excelente para educação ambiental e polinização urbana.',
    'Mel valorizado, porém escasso. Boa espécie para iniciantes e projetos urbanos.',
    'Cavidades naturais e urbanas; tubo de entrada ceruminoso.',
    'Prosopis juliflora, Solanum spp., Lippia alba, Lantana camara, Cecropia pachystachya e flora urbana diversa.',
    'Comum, mas ainda sujeita a perda de habitat e manejo inadequado.',
    'Quintais, educação ambiental, urbanismo e polinização geral.',
    'Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
    '#f5c518'
  ),
  (
    'mandacaia', 'Mandaçaia', 'Melipona quadrifasciata',
    1400, '10-11', '2-3',
    'Ocorre no Nordeste, Centro-Oeste, Sudeste e Sul, incluindo áreas de Mata Atlântica e regiões de planalto.',
    'Apidae / Meliponini', 'Média',
    'Dócil; colônias médias e manejo mais exigente que espécies pequenas.',
    'Melipona robusta e importante para produção de mel e polinização dirigida. É citada em estudos com tomate, maçã e recursos florais nativos.',
    'Boa opção para meliponicultores com algum manejo. Evitar deslocamento para fora da ocorrência natural.',
    'Ocos de árvores; favos horizontais.',
    'Myrcia spp., Butia, Syagrus romanzoffiana, Tithonia diversifolia, Trema micrantha, tomate e maçã.',
    'Sem ameaça nacional consolidada na base usada; pode aparecer em listas estaduais.',
    'Mel, multiplicação e polinização agrícola.',
    'Nordeste, Centro-Oeste, Sudeste e Sul.',
    '#a78bfa'
  ),
  (
    'jandaira', 'Jandaíra', 'Melipona subnitida',
    1120, '9', '1-2',
    'Endêmica do Nordeste brasileiro, especialmente associada à Caatinga e ao semiárido.',
    'Apidae / Meliponini', 'Média',
    'Muito valorizada; boa adaptação ao semiárido quando manejada dentro da região de ocorrência.',
    'Espécie emblemática da meliponicultura nordestina. Nidifica em ocos de árvores e cupinzeiros arbóreos, com mel bastante valorizado.',
    'Espécie-chave da Caatinga. Exige atenção a seca, florada e conservação da vegetação nativa.',
    'Ocos de árvores e cupinzeiros arbóreos.',
    'Ipomoea spp., Mimosa caesalpiniifolia e flora da Caatinga.',
    'Alvo de ações regionais de conservação; pressionada por desmatamento e transporte indevido.',
    'Mel premium do semiárido e conservação regional.',
    'Nordeste.',
    '#eab308'
  ),
  (
    'urucu-nordestina', 'Uruçu-nordestina', 'Melipona scutellaris',
    1800, '10-12', '3-5',
    'Nordeste litorâneo e sublitorâneo, associada a remanescentes de mata úmida.',
    'Apidae / Meliponini', 'Baixa a média',
    'Dócil; colônias grandes e alto valor socioeconômico.',
    'Grande melípona nordestina, tradicionalmente criada por comunidades locais e ligada à Mata Atlântica nordestina.',
    'Espécie sensível à perda de habitat e comércio fora da área natural. Manejo deve ser conservador.',
    'Ocos de árvores; uso abundante de cerume, batume e geoprópolis.',
    'Flora arbórea da Mata Atlântica úmida nordestina.',
    'Tratada como ameaçada em fontes oficiais recentes.',
    'Mel, geoprópolis e conservação.',
    'Nordeste.',
    '#f97316'
  ),
  (
    'tiuba', 'Tiúba', 'Melipona fasciculata',
    1800, '10-12', '2.5-4',
    'Norte, Nordeste e Centro-Oeste, com importância na Amazônia oriental e Maranhão.',
    'Apidae / Meliponini', 'Baixa a média',
    'Dócil; boa produtora e tradicional em sistemas regionais.',
    'Grande melípona conhecida como uruçu-cinzenta em algumas regiões. É relevante para mel e polinização em sistemas amazônicos e maranhenses.',
    'Produtividade varia muito com florada, caixa, clima e manejo.',
    'Ocos de árvores; cerume escuro.',
    'Açaí, tomate, berinjela, urucum e flora nectarífera regional.',
    'Sem avaliação nacional consolidada na base usada.',
    'Mel e polinização regional.',
    'Norte, Nordeste e Centro-Oeste.',
    '#64748b'
  ),
  (
    'canudo', 'Canudo / Mandaguari', 'Scaptotrigona depilis',
    800, '5-7', '0.5-1.5',
    'Centro-Oeste, Sudeste e Sul.',
    'Apidae / Meliponini', 'Média, com cautela',
    'Mais defensiva; colônias populosas com milhares de indivíduos.',
    'Espécie rústica e útil para restauração e polinização. A entrada do ninho costuma ter formato de canudo.',
    'Larvas dependem de fungos simbiontes, tornando a espécie sensível a fungicidas.',
    'Ocos de árvores; entrada tipo canudo.',
    'Campomanesia aromatica, Eucalyptus spp., Myrcia spp. e Mimosa spp.',
    'Não listada como ameaçada na base usada, mas vulnerável a impacto de fungicidas.',
    'Rusticidade, restauração, polinização e mel.',
    'Centro-Oeste, Sudeste e Sul.',
    '#22c55e'
  ),
  (
    'irai', 'Iraí', 'Nannotrigona testaceicornis',
    800, '3-5', '<0.5',
    'Ocorre em várias regiões do Brasil e aparece com frequência em estudos urbanos.',
    'Apidae / Meliponini', 'Muito alta',
    'Dócil; entrada curta de cerume, frequentemente fechada à noite.',
    'Espécie pequena, frequente em ambientes urbanos, hortas e jardins. Boa para educação ambiental e polinização de baixo risco.',
    'Produz pouco mel, mas é excelente para quintais, hortas e uso didático.',
    'Ocos de árvores, paredes, mourões e pequenas cavidades.',
    'Polilética; citada como efetiva em pepino sob estufa.',
    'Não listada como ameaçada na base usada.',
    'Horta, estufa e uso urbano.',
    'Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
    '#06d6a0'
  ),
  (
    'mirim', 'Mirim', 'Plebeia droryana',
    500, '4', '<0.5',
    'Nordeste, Centro-Oeste, Sudeste e Sul.',
    'Apidae / Meliponini', 'Muito alta',
    'Muito dócil; colônias pequenas e discretas.',
    'Espécie pequena e indicada para jardins, varandas, quintais e educação ambiental. Mais importante como polinizadora e espécie didática do que como produtora de mel.',
    'Mel muito escasso. Boa opção para espaços pequenos e observação.',
    'Ocos de árvores e fendas rochosas; pequeno tubo de cerume.',
    'Lippia alba, Lantana camara, Cecropia pachystachya e Strelitzia reginae.',
    'Não listada como ameaçada na base usada.',
    'Educação ambiental e jardins.',
    'Nordeste, Centro-Oeste, Sudeste e Sul.',
    '#ff6b35'
  ),
  (
    'marmelada', 'Marmelada / Mocinha-branca', 'Frieseomelitta varia',
    600, '4-5', 'baixo',
    'Norte, Nordeste, Centro-Oeste e Sudeste.',
    'Apidae / Meliponini', 'Média',
    'Pouco agressiva; arquitetura de ninho peculiar.',
    'Espécie menos focada em mel e mais interessante para diversidade de produtos, conservação e estudo biológico.',
    'Destaque para potencial de própolis; cria em cachos, não em favos horizontais.',
    'Ocos de árvores; células de cria em cachos conectados por cabos de cerume.',
    'Listas florais detalhadas ainda são escassas nas fontes usadas.',
    'Não listada como ameaçada na base usada.',
    'Própolis, conservação e diversidade meliponícola.',
    'Norte, Nordeste, Centro-Oeste e Sudeste.',
    '#f59e0b'
  ),
  (
    'monduri', 'Monduri / Bugia', 'Melipona mondury',
    1600, '10-12', '2-4',
    'Mata Atlântica, com registros no Nordeste, Sudeste e Sul.',
    'Apidae / Meliponini', 'Baixa a média',
    'Dócil; generalista, mas sensível à fragmentação florestal.',
    'Grande Melipona da Mata Atlântica, produtora de mel e pólen, com forte ligação à conservação de habitats florestais.',
    'Dados produtivos são menos padronizados que para jataí, mandaçaia e jandaíra.',
    'Ocos de árvores; favos horizontais ou helicoidais.',
    'Vernonia westiniana; famílias Myrtaceae, Arecaceae, Asteraceae, Moraceae e Fabaceae.',
    'Ameaçada regionalmente em partes do Sul/Sudeste.',
    'Conservação e meliponicultura regional.',
    'Nordeste, Sudeste e Sul.',
    '#8b5cf6'
  )
ON CONFLICT (slug) DO UPDATE SET
  name_pt = EXCLUDED.name_pt,
  name_scientific = EXCLUDED.name_scientific,
  pollination_radius_m = EXCLUDED.pollination_radius_m,
  size_mm = EXCLUDED.size_mm,
  honey_yield_l_year = EXCLUDED.honey_yield_l_year,
  region_pt = EXCLUDED.region_pt,
  family_tribe = EXCLUDED.family_tribe,
  urban_indication = EXCLUDED.urban_indication,
  behavior = EXCLUDED.behavior,
  description = EXCLUDED.description,
  observations = EXCLUDED.observations,
  nesting_type = EXCLUDED.nesting_type,
  key_plants = EXCLUDED.key_plants,
  conservation_status = EXCLUDED.conservation_status,
  best_use = EXCLUDED.best_use,
  occurrence_regions = EXCLUDED.occurrence_regions,
  color_hex = EXCLUDED.color_hex;

DELETE FROM species
WHERE slug NOT IN (
  'jatai',
  'mandacaia',
  'jandaira',
  'urucu-nordestina',
  'tiuba',
  'canudo',
  'irai',
  'mirim',
  'marmelada',
  'monduri'
)
AND NOT EXISTS (
  SELECT 1 FROM hives WHERE hives.species_slug = species.slug
);
