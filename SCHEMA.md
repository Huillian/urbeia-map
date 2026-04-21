# 🗄️ Schema SQL · Urbeia Map

> Cole estes arquivos no SQL Editor do Supabase na ordem: primeiro `schema.sql`, depois `seed.sql`.

---

## 📄 `supabase/schema.sql`

```sql
-- =====================================================
-- URBEIA MAP · SCHEMA v0
-- =====================================================

-- Espécies de abelhas sem ferrão (catálogo de referência)
CREATE TABLE IF NOT EXISTS species (
  slug TEXT PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_scientific TEXT NOT NULL,
  pollination_radius_m INTEGER NOT NULL,
  size_mm TEXT,
  honey_yield_l_year TEXT,
  region_pt TEXT,
  info_url TEXT,
  color_hex TEXT DEFAULT '#06d6a0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE species IS 'Espécies de abelhas sem ferrão com dados de polinização';

-- Caixas de abelha (hives)
CREATE TABLE IF NOT EXISTS hives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_slug TEXT UNIQUE,

  -- Relacionamentos
  species_slug TEXT REFERENCES species(slug) ON DELETE SET NULL,

  -- Localização
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'SC',
  approximate_location BOOLEAN DEFAULT true,

  -- Metadados da caixa
  nickname TEXT,
  installed_at DATE,
  owner_name TEXT,       -- Visível publicamente (opcional)
  owner_email TEXT,      -- PRIVADO — só admin vê
  note TEXT,
  photo_url TEXT,

  -- Tipo híbrido (core do produto)
  is_urbeia_verified BOOLEAN DEFAULT false,

  -- Moderação
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejected_reason TEXT,

  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE hives IS 'Caixas de abelhas sem ferrão mapeadas';
COMMENT ON COLUMN hives.is_urbeia_verified IS 'TRUE = instalada pela Urbeia. Só admin pode setar.';
COMMENT ON COLUMN hives.approximate_location IS 'TRUE = coordenadas podem ser ofuscadas em render';

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_hives_status ON hives(status);
CREATE INDEX IF NOT EXISTS idx_hives_approved ON hives(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_hives_species ON hives(species_slug);
CREATE INDEX IF NOT EXISTS idx_hives_verified ON hives(is_urbeia_verified) WHERE is_urbeia_verified = true;
CREATE INDEX IF NOT EXISTS idx_hives_city ON hives(city);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hives_updated_at ON hives;
CREATE TRIGGER update_hives_updated_at
  BEFORE UPDATE ON hives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set approved_at quando status vira 'approved'
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hives_approved_at ON hives;
CREATE TRIGGER set_hives_approved_at
  BEFORE UPDATE ON hives
  FOR EACH ROW
  EXECUTE FUNCTION set_approved_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;

-- Species: leitura pública
DROP POLICY IF EXISTS "Species readable by all" ON species;
CREATE POLICY "Species readable by all"
  ON species FOR SELECT
  USING (true);

-- Hives: leitura pública SÓ de aprovadas
DROP POLICY IF EXISTS "Approved hives readable by all" ON hives;
CREATE POLICY "Approved hives readable by all"
  ON hives FOR SELECT
  USING (status = 'approved');

-- Hives: inserção pública (mas sempre como pending e não-verified)
DROP POLICY IF EXISTS "Anyone can submit new hive" ON hives;
CREATE POLICY "Anyone can submit new hive"
  ON hives FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND is_urbeia_verified = false
  );

-- Hives: admin vê todas
DROP POLICY IF EXISTS "Authenticated users see all hives" ON hives;
CREATE POLICY "Authenticated users see all hives"
  ON hives FOR SELECT
  TO authenticated
  USING (true);

-- Hives: admin pode atualizar
DROP POLICY IF EXISTS "Authenticated users can update" ON hives;
CREATE POLICY "Authenticated users can update"
  ON hives FOR UPDATE
  TO authenticated
  USING (true);

-- Hives: admin pode deletar
DROP POLICY IF EXISTS "Authenticated users can delete" ON hives;
CREATE POLICY "Authenticated users can delete"
  ON hives FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- STORAGE BUCKET (para fotos das caixas)
-- =====================================================
-- Execute no painel Supabase → Storage → New bucket:
-- Nome: hive-photos
-- Público: YES (leitura)
-- Upload: authenticated + anon (policy manual)
```

---

## 📄 `supabase/seed.sql`

```sql
-- =====================================================
-- SEED: espécies iniciais de abelhas sem ferrão (ASF)
-- Foco: região Oeste de Santa Catarina
-- =====================================================

INSERT INTO species (
  slug, name_pt, name_scientific,
  pollination_radius_m, size_mm, honey_yield_l_year,
  region_pt, color_hex
) VALUES
(
  'jatai',
  'Jataí',
  'Tetragonisca angustula',
  500,
  '4-5',
  '0.5-1.5',
  'Ocorre em todo SC. Excelente para iniciantes e áreas urbanas.',
  '#f5c518'
),
(
  'irai',
  'Iraí',
  'Nannotrigona testaceicornis',
  400,
  '3-4',
  '0.3-0.8',
  'Recomendada para região Oeste de SC.',
  '#06d6a0'
),
(
  'mandacaia',
  'Mandaçaia',
  'Melipona quadrifasciata',
  900,
  '10-11',
  '3-6',
  'Ocorre no Oeste e Planalto Catarinense.',
  '#a78bfa'
),
(
  'bora',
  'Borá',
  'Tetragona clavipes',
  600,
  '8-9',
  '1-2',
  'Para espaços amplos, região Oeste.',
  '#5b9eff'
),
(
  'mirim',
  'Mirim',
  'Plebeia spp.',
  300,
  '3-4',
  '0.2-0.5',
  'Pequena, ideal para apartamentos e varandas.',
  '#ff6b35'
),
(
  'guaraipo',
  'Guaraipo',
  'Melipona bicolor',
  700,
  '8-9',
  '2-4',
  'Para lugares mais úmidos.',
  '#ec4899'
),
(
  'tubuna',
  'Tubuna',
  'Scaptotrigona bipunctata',
  700,
  '6-7',
  '1-3',
  'Para quintais maiores, ocorre em SC.',
  '#14b8a6'
)
ON CONFLICT (slug) DO UPDATE SET
  name_pt = EXCLUDED.name_pt,
  name_scientific = EXCLUDED.name_scientific,
  pollination_radius_m = EXCLUDED.pollination_radius_m,
  size_mm = EXCLUDED.size_mm,
  honey_yield_l_year = EXCLUDED.honey_yield_l_year,
  region_pt = EXCLUDED.region_pt,
  color_hex = EXCLUDED.color_hex;
```

---

## 🧪 Como aplicar

### Opção A — Via painel Supabase (mais fácil)

1. Vai em https://supabase.com/dashboard
2. Entra no projeto `urbeia-map`
3. Menu lateral: **SQL Editor**
4. Clica em **+ New query**
5. Cola o conteúdo de `schema.sql` → **Run** (botão verde ou Ctrl+Enter)
6. Aguarda "Success"
7. Cria outra query, cola `seed.sql` → **Run**
8. Valida: menu lateral **Table Editor** → deve ter tabelas `species` e `hives`, com `species` populada

### Opção B — Via Supabase CLI (pra quem prefere terminal)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
cd urbeia-map
supabase link --project-ref <seu-project-ref>

# Aplicar migrations
supabase db push

# Aplicar seed
psql $DATABASE_URL -f supabase/seed.sql
```

---

## ✅ Verificação

Depois de aplicar, roda no SQL Editor:

```sql
-- Deve retornar 7 linhas (as espécies)
SELECT slug, name_pt, pollination_radius_m FROM species ORDER BY slug;

-- Deve retornar 0 linhas (nenhuma caixa ainda)
SELECT COUNT(*) FROM hives;

-- Checar policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('species', 'hives');
```

Se aparecer 7 espécies + policies configuradas, **tá tudo pronto** pra começar a integrar o frontend.

---

## 🔧 Adicionar tua primeira caixa (Urbeia Verified)

Depois do MVP rodar, cadastra tua caixa de Jataí via SQL direto (pra ser Verified):

```sql
INSERT INTO hives (
  public_slug, species_slug, lat, lng, city, state,
  nickname, installed_at, owner_name, owner_email,
  note, is_urbeia_verified, status, approved_at
) VALUES (
  'urbeia-cacador-01',
  'jatai',
  -26.7749,   -- SUBSTITUA pelas coordenadas reais
  -51.0156,   -- SUBSTITUA pelas coordenadas reais
  'Caçador',
  'SC',
  'Primeira caixa Urbeia',
  '2024-06-01',   -- SUBSTITUA pela data real de instalação
  'Huillian Alves Machado',
  'seu@email.com',
  'Caixa firme e forte desde 2024. Prova de conceito do serviço Urbeia.',
  true,    -- Urbeia Verified
  'approved',
  NOW()
);
```

---

## ⚠️ Próximos passos de schema (backlog)

Futuras migrations vão adicionar:

- Tabela `users` (pra criadores terem perfil público)
- Tabela `sponsorships` (quando implementar apadrinhamento)
- Extensão PostGIS (pra queries "caixas num raio de X km")
- Tabela `events` (floração, manutenções, migrações)
- Tabela `cities` (metadata de cidades cobertas)
