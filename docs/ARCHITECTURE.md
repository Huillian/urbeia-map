# Arquitetura — Urbeia Map

## Visão geral

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (estático, sem build)                               │
│                                                              │
│  index.html   cadastrar.html   admin.html   h.html           │
│      │              │              │           │             │
│  ┌───▼──────────────▼──────────────▼───────────▼──────────┐  │
│  │  assets/js/                                            │  │
│  │  supabase-client.js  (window.supabase + window.urbeia  │  │
│  │  DB helpers compartilhados)                            │  │
│  │  map.js     form.js     admin.js     species.js        │  │
│  └────────────────────────────┬───────────────────────────┘  │
│                               │ Supabase JS SDK v2           │
└───────────────────────────────┼──────────────────────────────┘
                                │ HTTPS
               ┌────────────────▼──────────────────┐
               │  Supabase (hosted, free tier)      │
               │  ┌──────────────┐ ┌─────────────┐ │
               │  │  PostgreSQL  │ │    Auth     │ │
               │  │  + RLS       │ │  magic link │ │
               │  └──────────────┘ └─────────────┘ │
               │  ┌─────────────────────────────┐  │
               │  │  Storage (bucket: hive-      │  │
               │  │  photos, fotos das caixas)   │  │
               │  └─────────────────────────────┘  │
               └────────────────────────────────────┘

CDNs externos:
  unpkg.com      → Leaflet.js 1.9.4
  cdn.jsdelivr.net → @supabase/supabase-js@2
  basemaps.cartocdn.com → CartoDB Dark Matter tiles
  fonts.googleapis.com  → Geist, Geist Mono, Instrument Serif
```

## Camadas

### Frontend (estático, sem build)
Quatro páginas HTML independentes; sem roteamento SPA, sem framework.

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Mapa público principal com sidebar e pins |
| `cadastrar.html` | Formulário público — coloca caixa como `pending` |
| `admin.html` | Painel de moderação — requer autenticação admin |
| `h.html` | Página pública de uma caixa individual (`?slug=xxx`) |

### JS — um arquivo por responsabilidade

| Arquivo | Namespace global | O que faz |
|---|---|---|
| `supabase-client.js` | `window.supabase`, `window.urbeiaDB` | Cria cliente Supabase, expõe helpers de query |
| `map.js` | `window.urbeiaMap` | Instancia Leaflet, pins, círculos de polinização, filtros |
| `species.js` | — | Funções de formatação/display das espécies |
| `form.js` | — | Validação client-side, upload de foto, submit para Supabase |
| `admin.js` | — | Magic link auth, lista pendentes, ações de moderação |

**Regra:** lógica de autorização nunca fica no JS cliente. RLS é a única garantia de segurança.

### CSS
- Único arquivo: `assets/css/style.css`
- Todas as cores em CSS variables no `:root` (design tokens)
- BEM simplificado, mobile-first

### Backend (Supabase)
- Toda autorização via **Row Level Security (RLS)** no PostgreSQL
- Dois papéis: `anon` (público) e `authenticated` (admin via magic link)
- Nenhum servidor próprio — tudo em Supabase hosted

## Fluxo de dados

### Visitar o mapa
```
Browser → supabase.from('species').select()  → array de espécies
Browser → supabase.from('hives').select()
           .eq('status','approved')           → array de caixas approved
Browser → Leaflet renderiza pins + círculos
```

### Cadastrar uma caixa (público)
```
Browser → validação client-side
Browser → supabase.storage.upload(foto)       → URL da foto
Browser → supabase.from('hives').insert({
            status: 'pending',
            is_urbeia_verified: false,
            ...dados })                        → caixa salva como pending
```

### Moderar (admin)
```
Admin   → magic link email → Supabase Auth → session token
Admin   → supabase.from('hives').select().eq('status','pending')
Admin   → supabase.from('hives').update({status:'approved'}).eq('id',x)
Admin   → supabase.from('hives').update({is_urbeia_verified:true}).eq('id',x)
```

## Decisões arquiteturais (ADR-lite)

### ADR-1: Vanilla JS sem framework
**Contexto:** MVP solo, sem build step, deploy em Vercel static.
**Decisão:** HTML + JS puro, CDN para dependências.
**Consequência:** Zero configuração de toolchain. Sem type safety ou tree-shaking. Aceitável para dezenas/centenas de usuários simultâneos.

### ADR-2: Supabase como BaaS
**Contexto:** Precisa de banco, auth e storage sem operar servidor.
**Decisão:** Supabase free tier. RLS como única camada de autorização.
**Consequência:** `anon_key` exposta no cliente (aceitável — proteção via RLS). Toda segurança depende de policies corretas.

### ADR-3: Dois tipos de hive no mesmo mapa
**Contexto:** Diferenciação estratégica entre ativo comercial (Urbeia Verified) e engajamento público (Community).
**Decisão:** Flag `is_urbeia_verified` na tabela `hives`. Cor e ícone diferentes no mapa.
**Consequência:** Admin pode promover qualquer caixa. Público nunca pode setar `verified=true` (garantido por RLS).

### ADR-4: `approximate_location` para privacidade residencial
**Contexto:** Criadores residenciais não querem endereço exato público.
**Decisão:** Campo boolean; quando `true`, coordenadas são deslocadas antes de exibir.
**Consequência:** Coords reais ficam no banco (só admin vê). Deslocamento aplicado no JS cliente — em v1 migrar para view PostgreSQL com offset para garantia server-side.

### ADR-5: Leaflet 1.9.4 (não 2.0 alpha)
**Contexto:** Leaflet 2.0.0 alpha disponível desde 2025, ainda instável em abril/2026.
**Decisão:** Manter 1.9.4 estável para MVP.
**Consequência:** Migrar para 2.x quando estável (suporte ESM nativo, sem IE).

## Onde mora cada responsabilidade

| Responsabilidade | Onde |
|---|---|
| Autorização de dados | `supabase/schema.sql` (RLS policies) |
| Estado do mapa | `assets/js/map.js` (`window.urbeiaMap`) |
| Queries ao banco | `assets/js/supabase-client.js` (`window.urbeiaDB`) |
| Design tokens e estilos | `assets/css/style.css` (`:root` vars) |
| Schema do banco | `supabase/schema.sql` |
| Seed de espécies | `supabase/seed.sql` |
| Configuração de deploy | Vercel dashboard + `vercel.json` |
