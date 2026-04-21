# 🐝 Urbeia Map

> Mapeamento público de caixas de abelhas sem ferrão em Santa Catarina.

**Status:** v0 em desenvolvimento · **Região inicial:** Caçador/SC

---

## 🎯 O que é

**Urbeia Map** é uma plataforma web gratuita que mapeia caixas de abelhas sem ferrão (ASF) cadastradas por meliponicultores e pela empresa Urbeia, mostrando a **área de polinização estimada** de cada colmeia com base na espécie.

O produto nasceu como subproduto do negócio **Urbeia** — serviço de instalação e manutenção de colmeias residenciais e comerciais — e tem dois objetivos:

1. **Educação ambiental** — visualizar o impacto real das abelhas sem ferrão na polinização urbana
2. **Crescimento do negócio** — gerar leads, mostrar cobertura da Urbeia a investidores e virar funil de vendas

---

## 🏗️ Arquitetura híbrida

Duas camadas visuais no mesmo mapa:

| Tipo | Cor | Quem cadastra | Propósito |
|---|---|---|---|
| 🟠 **Urbeia Verified** | `#ff6b35` | Só admin (Urbeia) | Mostra caixas instaladas/mantidas pela empresa. Ativo comercial. |
| 🟢 **Community** | `#06d6a0` | Qualquer pessoa (com moderação) | Engajamento público, educação, funil de vendas passivo. |

---

## 🛠️ Stack técnica

- **Frontend:** HTML + JavaScript vanilla + [Leaflet.js](https://leafletjs.com/)
- **Banco & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Mapa base:** [CartoDB Dark Matter](https://carto.com/) (tiles gratuitos)
- **Deploy:** Vercel
- **Domínio:** `map.urbeia.com.br`

**Sem build step. Sem framework. Apenas web platform.**

---

## 📂 Estrutura de arquivos

```
urbeia-map/
├── index.html                 # Mapa público (principal)
├── cadastrar.html             # Formulário público de cadastro
├── admin.html                 # Painel de moderação (auth required)
├── h.html                     # Página pública de uma caixa única
├── assets/
│   ├── css/
│   │   └── style.css          # Estilos globais
│   └── js/
│       ├── supabase-client.js # Cliente Supabase + helpers
│       ├── map.js             # Leaflet + renderização de pins
│       ├── species.js         # Helpers de espécies
│       ├── form.js            # Lógica do cadastro
│       └── admin.js           # Lógica do painel admin
├── supabase/
│   ├── schema.sql             # Schema completo (tabelas, indexes, RLS)
│   └── seed.sql               # Espécies iniciais
├── CLAUDE.md                  # Contexto pro Claude Code
├── README.md                  # Esta docs
└── .gitignore
```

---

## 🚀 Rodar localmente

```bash
# Clonar
git clone https://github.com/Huillian/urbeia-map.git
cd urbeia-map

# Configurar Supabase (ver supabase/README.md)

# Servir
python3 -m http.server 8000

# Abrir
open http://localhost:8000
```

---

## 🐝 Espécies suportadas (seed inicial)

Focadas em ASF nativas da região Oeste de SC, onde Caçador está localizada:

| Espécie | Nome científico | Raio de polinização | Onde usar |
|---|---|---|---|
| Jataí | *Tetragonisca angustula* | 500m | Áreas urbanas, iniciantes |
| Iraí | *Nannotrigona testaceicornis* | 400m | Região Oeste |
| Mandaçaia | *Melipona quadrifasciata* | 900m | Oeste e Planalto |
| Borá | *Tetragona clavipes* | 600m | Espaços amplos |
| Mirim | *Plebeia spp.* | 300m | Apartamentos |
| Guaraipo | *Melipona bicolor* | 700m | Locais úmidos |
| Tubuna | *Scaptotrigona bipunctata* | 700m | Quintais maiores |

**Fonte dos raios:** literatura científica (EPAGRI, Embrapa, A.B.E.L.H.A.). Valores médios — condições reais variam com flora, clima e terreno.

---

## 📍 Roadmap

### v0 (em desenvolvimento — abril/maio 2026)
- [x] Schema Supabase + seed espécies
- [ ] Mapa público Leaflet
- [ ] Círculos de polinização por espécie
- [ ] Cadastro público com moderação
- [ ] Painel admin
- [ ] Deploy Vercel
- [ ] 10 primeiras caixas cadastradas

### v1 (junho/julho 2026)
- [ ] Filtros avançados (espécie, status, cidade)
- [ ] Perfil público do criador (`/h/:slug`)
- [ ] Sharable card (imagem OG dinâmica)
- [ ] Stats por cidade/região
- [ ] Integração com domínio `map.urbeia.com.br`

### v2 (depois)
- [ ] Heatmap de cobertura
- [ ] Calendário de floração por região
- [ ] API pública (read-only) pra pesquisadores
- [ ] Notificações por email
- [ ] "Adote uma caixa" (apadrinhamento)

---

## 🤝 Parcerias institucionais (metas)

Caçador é **polo catarinense de meliponicultura**. Parcerias-alvo:

- **EPAGRI Caçador** — Estação experimental com pesquisa ativa em ASF
- **IFSC Campus Caçador** — Tem projeto de meliponicultura
- **UNIARP** — Sediou o 37º Encontro Catarinense de Apicultores e Meliponicultores (2024)
- **FAASC** — Federação estadual do setor

---

## 🧠 Filosofia

1. **Open data por padrão** — dados de polinização viram bem público
2. **Honestidade sobre números** — raios de polinização são **estimativas**, não medições
3. **Comunidade primeiro** — qualquer pessoa pode contribuir antes de ser cliente
4. **Educação como marketing** — mostrar valor antes de vender serviço

---

## 👤 Sobre

Construído por **Huillian Alves Machado** ([@huilliandev](https://huillian.dev)) como parte do ecossistema **Urbeia** — negócio de meliponicultura urbana em desenvolvimento.

---

## 📄 Licença

MIT (código) · Dados abertos sob CC-BY 4.0

---

<sub>Made in Caçador/SC 🐝 · Dados de polinização baseados em literatura da EPAGRI, Embrapa e A.B.E.L.H.A.</sub>
