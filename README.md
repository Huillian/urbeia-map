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

### v0 · MVP (em andamento — abril/maio 2026)

**Semana 1 — Setup**
- [x] Schema Supabase + seed 7 espécies
- [x] Estrutura de arquivos + CI/CD Netlify

**Semana 2 — Core**
- [x] `index.html` — mapa público Leaflet com pins + círculos de polinização
- [x] Filtros por espécie e tipo (Verified / Community)
- [x] `cadastrar.html` — formulário público com pin no mapa, busca de endereço e geolocalização
- [x] `admin.html` — painel de moderação com magic link auth (aprovar / rejeitar / verificar)
- [x] Deploy em produção (`urbeia-map.netlify.app`)

**Semana 3 — Polish**
- [x] `h.html` — página pública de caixa individual (mini mapa + dados + foto)
- [x] `login.html` — autenticação com Google OAuth + e-mail/senha
- [x] `minhas-caixas.html` — painel do usuário para editar e deletar caixas
- [x] Cadastro de caixa exige login (user_id vinculado à caixa)
- [x] Admin protegido por allowlist de e-mail
- [ ] SEO completo (meta tags, Open Graph por caixa)
- [ ] Responsivo mobile completo
- [ ] 10 primeiras caixas cadastradas

**Semana 4 — Launch**
- [ ] Domínio `map.urbeia.com.br`
- [ ] Post de lançamento
- [ ] Outreach EPAGRI Caçador

### v1 (junho/julho 2026)
- [ ] Página pública de perfil do criador
- [ ] Sharable card (imagem OG dinâmica por caixa)
- [ ] Stats por cidade/região
- [ ] Servidor de coordenadas com offset server-side (privacidade melhorada)
- [ ] Notificação por e-mail ao criador quando aprovado

### v2 (depois)
- [ ] Heatmap de cobertura
- [ ] Calendário de floração por região
- [ ] API pública (read-only) pra pesquisadores
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
