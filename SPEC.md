# 📐 Urbeia Map · Spec Técnico v0

> Documento de referência técnica pro MVP. Atualize conforme decisões mudam.

---

## 🎯 Objetivo do MVP

Lançar um **mapa público funcional** em 4 semanas que:

1. Mostra caixas de ASF em Caçador/SC
2. Desenha círculo de polinização por espécie
3. Aceita cadastros públicos com moderação
4. Permite admin gerenciar via painel
5. Diferencia visualmente **Urbeia Verified** vs **Community**

**Definição de "pronto pra lançar":**
- 10+ caixas cadastradas (tuas + amigos)
- Deploy funcionando em domínio customizado
- Zero erros críticos em mobile e desktop
- Lighthouse SEO 90+

---

## 👥 Personas

### 1. Visitante curioso (maioria)
Quem chega via share ou busca. Quer ver o mapa, explorar, entender. Não cadastra.

**O que precisa:**
- Mapa carregando rápido
- Info clara sobre as caixas (espécie, raio)
- CTA pra cadastrar se tiver caixa própria

### 2. Meliponicultor (cadastra)
Já tem caixa em casa, quer contribuir com o mapa.

**O que precisa:**
- Formulário simples (não pede cadastro)
- Feedback claro (caixa pendente, prazo de aprovação)
- Email de confirmação quando aprovado

### 3. Admin (Huillian)
Modera cadastros, adiciona caixas Urbeia, monitora crescimento.

**O que precisa:**
- Login rápido (magic link)
- Lista de pendentes com mini-mapa
- Ações one-click: aprovar, rejeitar, promover a verified

### 4. Investidor (futuro)
Quer ver tração real. Olha métricas de cobertura Urbeia.

**O que precisa:**
- Dashboard com stats Urbeia vs total
- Timeline de crescimento
- Exportação de dados

---

## 🗺️ Fluxos detalhados

### Fluxo A: Ver o mapa (público)

```
Usuário                    Cliente                     Supabase
  │                           │                           │
  │── Abre map.urbeia.com.br ─│                           │
  │                           │── getSpecies() ──────────→│
  │                           │←── [array de espécies] ───│
  │                           │── getApprovedHives() ────→│
  │                           │←── [array de caixas] ─────│
  │                           │                           │
  │                           ├─ Renderiza mapa Leaflet   │
  │                           ├─ Adiciona círculos + pins │
  │                           ├─ Preenche sidebar         │
  │                           │                           │
  │←── Mapa interativo ───────│                           │
  │                           │                           │
  │── Clica num pin ──────────│                           │
  │                           ├─ Abre popup com info      │
  │←── Popup renderizado ─────│                           │
  │                           │                           │
  │── Toggle filtro "Jataí" ──│                           │
  │                           ├─ Re-renderiza pins        │
  │                           │  (filtra espécie)         │
  │←── Mapa atualizado ───────│                           │
```

### Fluxo B: Cadastrar uma caixa (público)

```
Usuário                    Cliente                     Supabase
  │                           │                           │
  │── Clica "Cadastrar" ──────│                           │
  │                           │── Redirect /cadastrar ────│
  │                           │                           │
  │── Arrasta pin no mapa ────│                           │
  │── Preenche campos ────────│                           │
  │── Submit ─────────────────│                           │
  │                           │                           │
  │                           │── insert hive ───────────→│
  │                           │   {status: 'pending',     │
  │                           │    is_verified: false}    │
  │                           │←── ok ────────────────────│
  │                           │                           │
  │←── "Recebido, aprovação   │                           │
  │    em até 48h" ───────────│                           │
```

### Fluxo C: Moderar (admin)

```
Admin                      Cliente                     Supabase
  │                           │                           │
  │── Abre /admin ────────────│                           │
  │                           │── Pede magic link ───────→│
  │                           │                           │
  │←── Email com link ──────────────────────────────── Supabase Auth
  │                           │                           │
  │── Clica link no email ────│                           │
  │                           │── Autentica session ─────→│
  │                           │←── session token ─────────│
  │                           │                           │
  │                           │── listPending() ─────────→│
  │                           │←── [caixas pendentes] ────│
  │                           │                           │
  │── Clica "Aprovar" numa ───│                           │
  │                           │── update status ─────────→│
  │                           │   → 'approved'            │
  │                           │←── ok ────────────────────│
  │                           │                           │
  │── Clica "Marcar Verified"─│                           │
  │                           │── update is_verified ────→│
  │                           │←── ok ────────────────────│
```

---

## 📊 Schema completo do banco

Ver arquivo `supabase/schema.sql` pra DDL exato.

### Tabela `species`

| Campo | Tipo | Descrição |
|---|---|---|
| `slug` | TEXT PK | Identificador único (ex: `jatai`) |
| `name_pt` | TEXT | Nome popular (ex: `Jataí`) |
| `name_scientific` | TEXT | Nome científico |
| `pollination_radius_m` | INTEGER | Raio em metros |
| `size_mm` | TEXT | Tamanho (ex: `4-5`) |
| `honey_yield_l_year` | TEXT | Produção anual (ex: `0.5-1.5`) |
| `region_pt` | TEXT | Onde ocorre |
| `info_url` | TEXT | Link pra saber mais |
| `color_hex` | TEXT | Cor no mapa |

### Tabela `hives`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | |
| `public_slug` | TEXT UNIQUE | Pra URL pública (ex: `huillian-cacador-01`) |
| `species_slug` | TEXT FK | |
| `lat` / `lng` | DECIMAL | Coordenadas |
| `city` / `state` | TEXT | |
| `approximate_location` | BOOL | Se true, ofusca endereço |
| `nickname` | TEXT | Apelido da caixa |
| `installed_at` | DATE | |
| `owner_name` | TEXT | Visível no popup (opcional) |
| `owner_email` | TEXT | **Privado**, só admin |
| `note` | TEXT | Texto livre |
| `photo_url` | TEXT | |
| `is_urbeia_verified` | BOOL | **Só admin seta** |
| `status` | TEXT | `pending`/`approved`/`rejected` |
| `rejected_reason` | TEXT | Se rejeitada |
| `created_at` | TIMESTAMPTZ | |
| `approved_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | auto-update via trigger |

### RLS (Row Level Security)

| Operação | Público (anon) | Authenticated (admin) |
|---|---|---|
| SELECT species | ✅ Qualquer | ✅ Qualquer |
| SELECT hives | ✅ Só `approved` | ✅ Todas |
| INSERT hives | ✅ Só `status=pending` e `verified=false` | ✅ Qualquer |
| UPDATE hives | ❌ | ✅ |
| DELETE hives | ❌ | ✅ |

---

## 🎨 Design tokens

### Cores

```css
:root {
  /* Base */
  --bg: #0a0a0e;
  --bg-card: #14141a;
  --bg-elevated: #1c1c24;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.15);

  /* Texto */
  --text: #e5e5e5;
  --text-dim: #9ca3af;
  --text-muted: #6b7280;

  /* Brand Urbeia */
  --orange: #ff6b35;
  --orange-soft: rgba(255, 107, 53, 0.15);
  --green: #06d6a0;
  --green-soft: rgba(6, 214, 160, 0.15);

  /* Espécies */
  --species-purple: #a78bfa;
  --species-blue: #5b9eff;
  --species-yellow: #f5c518;
  --species-teal: #14b8a6;
  --species-pink: #ec4899;

  /* Estado */
  --success: #06d6a0;
  --warning: #f5c518;
  --danger: #ef4444;
}
```

### Tipografia

```css
:root {
  --font-sans: 'Geist', -apple-system, sans-serif;
  --font-mono: 'Geist Mono', monospace;
  --font-serif: 'Instrument Serif', serif;
}
```

### Espaçamento

- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `2xl`: 32px
- `3xl`: 48px

### Border radius

- `sm`: 8px
- `md`: 12px (padrão dos cards)
- `lg`: 14px
- `full`: 9999px (pills)

---

## 🔌 APIs e integrações

### Supabase JS SDK
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Cliente: `supabase.createClient(URL, ANON_KEY)`

### Leaflet.js
- CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
- JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

### CartoDB Dark Matter (tile)
- URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- Attribution: OSM + CARTO

### Google Fonts
- `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap`

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile: default */
/* Tablet: */ @media (min-width: 768px) { }
/* Desktop: */ @media (min-width: 1024px) { }
/* Large: */ @media (min-width: 1280px) { }
```

### Layout responsivo

**Desktop (≥1024px):**
- Topbar fixa no topo (altura ~60px)
- Sidebar esquerda fixa (largura ~320px)
- Mapa ocupa resto

**Tablet (768-1023px):**
- Topbar fixa
- Sidebar vira drawer escondido (toggle por botão)
- Mapa full-width

**Mobile (<768px):**
- Topbar compacta (só logo + botão menu)
- Sidebar vira bottom-sheet
- Mapa full-screen

---

## ♿ Acessibilidade

### Mínimos obrigatórios

- [ ] Todos os botões têm `aria-label` ou texto visível
- [ ] Contraste mínimo 4.5:1 pra texto normal, 3:1 pra grande
- [ ] Focus visible em todos os elementos interativos
- [ ] Formulário tem `<label>` associado a cada `<input>`
- [ ] Imagens têm `alt`
- [ ] Mapa tem alternativa textual (lista de caixas)

### Teclado

- `Tab` navega por controles na ordem lógica
- `Enter`/`Space` ativa botões
- `Esc` fecha modals/popups

---

## 🚦 Métricas de sucesso do MVP

### Técnicas
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility = 100
- [ ] Lighthouse SEO ≥ 95
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### De produto (primeiro mês)
- [ ] 10+ caixas cadastradas
- [ ] 3+ caixas são da comunidade (não só tuas)
- [ ] 2+ espécies diferentes representadas
- [ ] 0 rejeitos por spam

### De negócio
- [ ] Ao menos 1 lead (alguém pedindo pra Urbeia instalar)
- [ ] Aparição em 1 canal local (jornal, blog, Instagram)
- [ ] Contato feito com EPAGRI Caçador

---

## ⚠️ Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Spam no cadastro público | Alta | Médio | Moderação manual obrigatória + rate limit Supabase |
| Ninguém cadastra (produto vazio) | Alta | Alto | Começar com tuas próprias + 3-5 amigos antes de lançar |
| Raios de polinização incorretos | Média | Baixo | Disclaimer claro + fonte citada |
| Dados sensíveis (endereço residencial) | Média | Alto | Opção "approximate_location" ofusca |
| Supabase free tier estourado | Baixa | Médio | Monitor uso mensal; migrar se >80% |
| Alguém cadastrar caixa falsa | Média | Baixo | Moderação pega |

---

## 📅 Cronograma 4 semanas

### Semana 1 · Setup
- [x] Schema Supabase + seeds
- [x] Estrutura de arquivos
- [ ] `index.html` com Leaflet + tile dark
- [ ] Sua caixa de Jataí como primeiro pin (hardcoded)
- [ ] Deploy inicial Vercel

### Semana 2 · Cadastro
- [ ] `cadastrar.html` com form
- [ ] Integração Supabase (insert pending)
- [ ] Upload de foto opcional (Supabase Storage)
- [ ] `admin.html` com magic link login
- [ ] Moderação (aprovar/rejeitar/promover)

### Semana 3 · Polish
- [ ] Filtros (tipo, espécie)
- [ ] Popup detalhado
- [ ] Página pública `/h/:slug`
- [ ] Estilos coerentes com portfolio
- [ ] Responsivo completo

### Semana 4 · Launch
- [ ] Registro domínio `urbeia.com.br`
- [ ] Configurar subdomínio `map.urbeia.com.br`
- [ ] SEO completo (meta, OG, sitemap)
- [ ] Cadastrar tuas caixas + amigos
- [ ] Post de lançamento (LinkedIn, Twitter, grupos locais)
- [ ] Outreach EPAGRI Caçador

---

## 🔗 Referências

- [Leaflet docs](https://leafletjs.com/reference.html)
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript/introduction)
- [EPAGRI meliponicultura](https://ciram.epagri.sc.gov.br/apicultura/)
- [A.B.E.L.H.A.](https://abelha.org.br/)
- [Moure's Catalogue](https://moure.cria.org.br/)
