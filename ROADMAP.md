# 🗺️ Urbeia Map · Roadmap

> Plano de desenvolvimento em ondas. Atualize os checkboxes conforme executa.

---

## 🌊 Onda 1 — MVP v0 (abril/maio 2026)

**Meta:** Mapa público funcional com cadastro e moderação em 4 semanas.

### Setup · Semana 1
- [ ] Criar conta Supabase + projeto `urbeia-map`
- [ ] Registrar domínio `urbeia.com.br` no registro.br
- [ ] Aplicar `supabase/schema.sql`
- [ ] Aplicar `supabase/seed.sql` (7 espécies)
- [ ] Estrutura de arquivos (HTML + assets/)
- [ ] Git init + repo no GitHub
- [ ] CLAUDE.md + README.md

### Frontend mapa · Semana 1-2
- [ ] `index.html` com Leaflet 1.9.4
- [ ] Tile dark CartoDB
- [ ] Centralização em Caçador/SC
- [ ] Sidebar com stats + filtros
- [ ] Pins diferenciados (Verified vs Community)
- [ ] Círculo de polinização por espécie
- [ ] Popup ao clicar num pin
- [ ] Microanimação pin pulsa ao hover
- [ ] Responsivo mobile (drawer)

### Cadastro público · Semana 2
- [ ] `cadastrar.html` com formulário
- [ ] Pin arrastável no mapa de cadastro
- [ ] Validação frontend (campos obrigatórios)
- [ ] Upload foto via Supabase Storage
- [ ] Insert como `status=pending`
- [ ] Feedback pós-submit (mensagem + email)
- [ ] Rate limit por IP (Supabase Edge Function)

### Painel admin · Semana 2-3
- [ ] `admin.html` com auth magic link
- [ ] Lista de pendentes
- [ ] Ações: aprovar / rejeitar / promover a Verified
- [ ] Mini-mapa na lista
- [ ] Filtros (pending, approved, rejected)
- [ ] Exportar CSV

### Página pública de caixa · Semana 3
- [ ] `h.html?slug=xxx` mostra detalhes
- [ ] Share button (copia link)
- [ ] Meta OG dinâmico
- [ ] Botão "Voltar ao mapa"

### Polish & Deploy · Semana 3-4
- [ ] CSS caprichado (Geist + Instrument Serif)
- [ ] Favicon + OG image
- [ ] Sitemap.xml + robots.txt
- [ ] Vercel deploy
- [ ] Configurar `map.urbeia.com.br` como custom domain
- [ ] Lighthouse ≥ 90 em todas as métricas

### Launch · Semana 4
- [ ] Cadastrar tuas caixas (Jataí + outras)
- [ ] Convidar 3-5 meliponicultores amigos pra cadastrar
- [ ] Post LinkedIn (storytelling do projeto)
- [ ] Post Twitter/X
- [ ] Postar em grupos de meliponicultura SC (WhatsApp, Facebook)
- [ ] Email pro Prof. André Sezerino (EPAGRI Caçador)
- [ ] Submit no r/meliponicultura (se existir)

---

## 🌊 Onda 2 — Engajamento (junho/julho 2026)

**Meta:** Crescimento orgânico e retenção.

### Features principais
- [ ] Heatmap de cobertura (áreas quentes/frias)
- [ ] Filtros avançados (cidade, espécie, data)
- [ ] Notificação push (email): "Caixa nova a 500m da sua"
- [ ] Perfil público do criador (`/u/:username`)
- [ ] Badges: "Primeiro da rua", "10 caixas na cidade"
- [ ] Galeria de fotos das caixas
- [ ] Stats por cidade/bairro

### Dashboard Urbeia
- [ ] Página privada `/dashboard` só pra admin
- [ ] Gráfico de crescimento (caixas/mês)
- [ ] Mapa temporal (timeline animada)
- [ ] Stats pra investidor (cobertura, pipeline)
- [ ] Exportação completa (CSV, GeoJSON)

### Onboarding
- [ ] Tour guiado no primeiro acesso
- [ ] Página "Como funciona"
- [ ] FAQ

---

## 🌊 Onda 3 — Ecossistema (agosto-outubro 2026)

**Meta:** Virar referência e ter parcerias institucionais.

### Integração científica
- [ ] Calendário de floração por região
- [ ] Integração iNaturalist (plantas nativas)
- [ ] API pública read-only (endpoint `/api/v1/hives`)
- [ ] Documentação API (swagger ou similar)

### Parcerias institucionais
- [ ] Reunião com EPAGRI Caçador
- [ ] Parceria com IFSC Caçador (escolas adotam caixas)
- [ ] Reunião com FAASC (federação estadual)
- [ ] Dashboard branded pra universidades

### Novos formatos de pin
- [ ] Pin "educacional" (escolas com colmeias)
- [ ] Pin "pesquisa" (laboratórios)
- [ ] Pin "agrícola" (plantações dependentes)

---

## 🌊 Onda 4 — Monetização (final 2026)

**Meta:** Converter o mapa em funil de vendas da Urbeia.

### Conversão
- [ ] "Quanto custaria sua caixa?" (simulador)
- [ ] Contact form pro serviço Urbeia
- [ ] Landing `urbeia.com.br` com pitch comercial
- [ ] Integração com CRM (HubSpot / Pipedrive free)

### Modelo "Adote uma caixa"
- [ ] Stripe integration
- [ ] Apadrinhamento R$30/mês de caixa pública
- [ ] Lista de padrinhos visível no mapa
- [ ] Fotos mensais automáticas pra padrinhos

### Marketplace
- [ ] Meliponicultores vendem mel via plataforma
- [ ] Split de pagamento Urbeia (5% fee)
- [ ] Avaliações e reputação

---

## 🌊 Onda 5 — Escala nacional (2027+)

**Visão longa.**

- [ ] Expandir pra SP, RJ, MG, PR, RS
- [ ] App mobile React Native / Expo
- [ ] AI identification (foto da abelha → espécie)
- [ ] Sensores IoT integrados (temperatura, atividade)
- [ ] Parceria ministério do meio ambiente
- [ ] Internacionalização (ES, EN)

---

## 📊 KPIs por onda

### Onda 1 (MVP)
- 10+ caixas cadastradas
- 3+ pessoas além de você
- 2+ espécies representadas
- Site no ar em domínio custom

### Onda 2 (engajamento)
- 100+ caixas
- 50+ usuários únicos/mês
- 10+ cidades de SC
- 3+ posts orgânicos em redes

### Onda 3 (ecossistema)
- 500+ caixas
- 1+ parceria institucional formal
- 2+ aparições em imprensa
- API sendo consumida

### Onda 4 (monetização)
- R$ 5k+ MRR de apadrinhamentos
- 5+ clientes Urbeia via mapa
- Break-even operacional

---

## 🧠 Princípios ao longo do roadmap

1. **Dados primeiro** — cada caixa nova é um ponto de dado valioso
2. **Comunidade antes de monetização** — não enxotar colaboradores cedo
3. **Shipping > perfection** — v0 feio é melhor que v1 perfeito que nunca sai
4. **Parcerias locais valem mais que publicidade paga**
5. **Honestidade sobre estimativas** — raios de polinização são médias, nunca afirmar com certeza absoluta
