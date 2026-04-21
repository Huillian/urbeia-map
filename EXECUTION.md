# 🚀 Urbeia Map · Guia de Execução

> Passo a passo pra sair do zero ao MVP deployado.

---

## ✅ Pré-requisitos

Antes de começar, garanta que você tem:

- [ ] Node.js instalado (`node --version` ≥ 18)
- [ ] Git configurado (`git config user.name` e `user.email`)
- [ ] Conta no GitHub
- [ ] Conta no Supabase (https://supabase.com)
- [ ] Conta no Vercel (https://vercel.com)
- [ ] Claude Code instalado (`curl -fsSL https://claude.ai/install.sh | bash`)
- [ ] Editor de código (VS Code recomendado)

---

## 📅 Cronograma resumido

| Fase | Tempo | O que acontece |
|---|---|---|
| **Setup** | 2-3h | Contas, repo, Supabase, domínio |
| **Fase 1** | 1 semana | Schema + estrutura + mapa básico |
| **Fase 2** | 1 semana | Cadastro + admin |
| **Fase 3** | 1 semana | Polish + deploy + SEO |
| **Fase 4** | 1 semana | Launch + conteúdo + parcerias |

---

## 🏁 FASE 0 — SETUP (2-3 horas)

### Passo 1: Criar repositório GitHub

```bash
# No GitHub.com, cria repo novo:
# Nome: urbeia-map
# Descrição: Mapeamento público de abelhas sem ferrão em SC
# Público: YES
# License: MIT
# NÃO adicionar README/gitignore (vamos criar)

# Clona localmente
cd ~/projetos
git clone https://github.com/Huillian/urbeia-map.git
cd urbeia-map
```

### Passo 2: Criar projeto Supabase

1. https://supabase.com/dashboard → **New project**
2. Preencha:
   - **Name:** `urbeia-map`
   - **Database password:** (gere uma forte, salve num gerenciador)
   - **Region:** `South America (São Paulo) sa-east-1`
   - **Pricing plan:** Free
3. Aguarde ~2 min pro projeto provisionar
4. Menu lateral → **Settings** → **API**
5. Copie e salve em um arquivo local (não commitar):
   ```
   URL: https://xxxxxxx.supabase.co
   anon public key: eyJhbGci....
   ```

### Passo 3: Aplicar schema

1. No Supabase, menu lateral → **SQL Editor**
2. Clica **+ New query**
3. Cola o conteúdo de `SCHEMA.md` (seção `schema.sql`)
4. Clica **Run** ou `Ctrl+Enter`
5. Aguarda "Success"
6. Nova query → cola `seed.sql` → Run
7. Valida: menu lateral **Table Editor** → tabelas `species` (com 7 linhas) e `hives` (vazia)

### Passo 4: Registrar domínio

1. https://registro.br → cria conta se não tiver
2. Procura `urbeia.com.br`
3. Registra (R$ 40/ano)
4. **Anote pra configurar DNS depois**

> **Opcional:** se quiser expandir pra fora do BR depois, registra `urbeia.com` também (~R$ 60/ano no Cloudflare Registrar).

### Passo 5: Setup Claude Code no projeto

```bash
cd urbeia-map

# Inicializa Git
git init
git branch -M main

# Primeiro commit
echo "# urbeia-map" > README.md
git add README.md
git commit -m "chore: initial commit"
git remote add origin https://github.com/Huillian/urbeia-map.git
git push -u origin main

# Abre Claude Code
claude
```

---

## 🏗️ FASE 1 — ESTRUTURA BASE + MAPA BÁSICO (Semana 1)

### Dia 1-2: Estrutura de arquivos

**No Claude Code, cola este prompt:**

```
Cria a estrutura base do projeto Urbeia Map conforme descrito no CLAUDE.md
(que eu vou colar depois). Por enquanto, cria:

1. Estrutura de diretórios:
   - assets/css/
   - assets/js/
   - supabase/

2. Arquivos stub (vazios ou com estrutura mínima):
   - index.html
   - cadastrar.html
   - admin.html
   - h.html
   - assets/css/style.css
   - assets/js/supabase-client.js
   - assets/js/map.js
   - assets/js/species.js
   - assets/js/form.js
   - assets/js/admin.js
   - supabase/schema.sql (já existente)
   - supabase/seed.sql (já existente)
   - .gitignore (node_modules, .env, .DS_Store, *.log)

3. Preenche o CLAUDE.md com o conteúdo que vou colar [cole aqui o CLAUDE.md completo]

4. Preenche README.md com stub simples

Depois faz commit: "feat: initial project structure".
```

Cola em seguida o conteúdo do arquivo `CLAUDE.md` (do arquivo que criamos).

### Dia 3-4: Mapa Leaflet básico

**Prompt:**

```
Agora vamos implementar o mapa básico em index.html e assets/js/map.js.

REQUISITOS:

1. index.html:
   - Head com meta tags SEO básico
   - Fonts: Geist, Geist Mono, Instrument Serif (Google Fonts)
   - Leaflet 1.9.4 (CSS e JS via CDN)
   - Supabase JS SDK via CDN
   - Body com topbar, sidebar e main#map

2. assets/css/style.css:
   - Reset básico
   - Variáveis CSS conforme CLAUDE.md (cores, fonts)
   - Layout: topbar fixa topo, sidebar fixa esquerda, map full
   - Sidebar com backdrop-filter blur, semi-transparente
   - Mobile responsive (sidebar vira drawer)

3. assets/js/supabase-client.js:
   - Inicializa Supabase client com URL e ANON_KEY (placeholder)
   - Expõe window.urbeiaDB com métodos: getSpecies, getApprovedHives, getHiveStats

4. assets/js/map.js:
   - Inicializa Leaflet centralizado em Caçador (-26.7749, -51.0156)
   - Tile CartoDB Dark Matter
   - Carrega species + hives aprovadas
   - Renderiza pins (Verified laranja, Community verde)
   - Desenha círculo de polinização por espécie
   - Popup ao clicar com info da caixa
   - Filtros por tipo (Verified/Community) e espécie

IMPORTANTE:
- Mantém coerência visual com portfolio huillian.dev (mesmo design system)
- Código vanilla JS, sem framework
- Fully accessible (ARIA, keyboard nav, focus visible)

Depois de criar:
1. Pede pra eu colar SUPABASE_URL e ANON_KEY reais
2. Rode python3 -m http.server 8000 pra testar
3. Commit: "feat(map): public map with Leaflet and Supabase"
```

### Dia 5: Primeira caixa hardcoded pra testar

Adiciona tua caixa de Jataí no Supabase via SQL Editor (ver seção no `SCHEMA.md` sobre "Adicionar tua primeira caixa").

Abre `http://localhost:8000` e valida:

- [ ] Mapa aparece
- [ ] Sua caixa aparece como pin laranja (Urbeia Verified)
- [ ] Círculo de 500m ao redor
- [ ] Clique no pin abre popup
- [ ] Sidebar mostra stats (1 caixa, 1 verified, 1 espécie)
- [ ] Filtros funcionam

### Dia 6-7: Deploy inicial

```bash
# Commit tudo
git add .
git commit -m "feat: MVP map working locally"
git push

# Conectar Vercel
# 1. https://vercel.com → Add New → Project
# 2. Import Git Repository: urbeia-map
# 3. Framework Preset: "Other"
# 4. Deixa todos os comandos vazios (é estático)
# 5. Deploy!

# Vai gerar URL: urbeia-map-xxxx.vercel.app
```

**Valida na URL de produção:** mapa funciona, pin aparece, popup abre.

---

## 🧩 FASE 2 — CADASTRO + ADMIN (Semana 2)

### Dia 1-3: Formulário público

**Prompt:**

```
Agora vamos implementar o formulário de cadastro público em cadastrar.html
e assets/js/form.js.

REQUISITOS:

cadastrar.html:
- Mesmo layout visual (topbar + main)
- Dois painéis side-by-side:
  * Esquerda: mini-mapa Leaflet com pin arrastável
  * Direita: formulário

Campos do formulário:
- Espécie (select com dados de species)
- Apelido da caixa (text, opcional)
- Data de instalação (date, opcional)
- Nome do criador (text, opcional — visível público)
- Email (email, obrigatório — privado)
- Cidade (text, pré-preenchido "Caçador" se clicar perto)
- Nota/observação (textarea, opcional)
- Foto (file input, opcional)
- Checkbox: "Ofuscar localização exata" (approximate_location)
- Checkbox: "Concordo com termos de uso e dados abertos"

form.js:
- Valida campos obrigatórios
- Insere em Supabase via RLS (status=pending, is_urbeia_verified=false)
- Upload foto pro Supabase Storage se houver
- Feedback pós-submit: "Cadastro recebido, aprovação em até 48h"
- Mandar pra página de sucesso

Estilização:
- Inputs com foco visível (ring laranja)
- Botão de submit grande, laranja Urbeia
- Responsivo

Commit: "feat(form): public hive submission form"
```

### Dia 4-5: Painel admin

**Prompt:**

```
Implementa o painel admin em admin.html e assets/js/admin.js.

REQUISITOS:

admin.html:
- Se não autenticado, mostra tela de login com magic link
- Se autenticado, mostra dashboard com:
  * Tabs: Pendentes / Aprovadas / Rejeitadas
  * Lista de caixas com mini-mapa thumb
  * Ações por caixa: Aprovar / Rejeitar / Marcar como Urbeia Verified
  * Campo rejected_reason ao rejeitar

admin.js:
- signInWithMagicLink(email) via Supabase Auth
- Carrega caixas filtradas por status
- Ações de admin (update status, update is_urbeia_verified)
- Realtime subscription pra atualizar lista automaticamente

Segurança:
- RLS já garante que só authenticated users podem update/delete
- Frontend só redireciona se sessão não for autenticada

Commit: "feat(admin): moderation panel with magic link auth"
```

### Dia 6-7: Testes + seed real

- Cadastrar 3-5 caixas fake pra testar fluxo
- Aprovar, rejeitar, promover a Verified
- Validar em mobile
- Fix bugs que aparecerem

---

## ✨ FASE 3 — POLISH + DEPLOY (Semana 3)

### Dia 1-2: Página pública de 1 caixa

**Prompt:**

```
Implementa h.html — página pública individual de cada caixa.

URL: /h.html?slug=xxx

REQUISITOS:
- Busca hive por public_slug
- Mostra: mapa centralizado na caixa + raio + info completa + fotos
- Botão "Compartilhar" (copia link pra clipboard)
- Meta OG tags dinâmicos pra share bonito
- Botão "Voltar ao mapa"

Commit: "feat: public page per hive with share"
```

### Dia 3-4: SEO completo

**Prompt:**

```
Implementa SEO completo:

1. meta tags em todas as páginas:
   - title dinâmico
   - description
   - og:title, og:description, og:image
   - twitter:card

2. sitemap.xml (estático)
3. robots.txt (permitir tudo)
4. favicon (gera um SVG de abelha 🐝)
5. manifest.json (PWA-ready mesmo não sendo PWA)

Commit: "feat: complete SEO setup"
```

### Dia 5: Estilos finais

**Prompt:**

```
Review completo do CSS:

- Garantir todas as cores seguem design tokens
- Microanimações (pin hover pulsa, popup fade-in)
- Loading states (skeleton pra mapa carregando)
- Empty states (mapa vazio: "Seja o primeiro a cadastrar")
- Mobile responsivo impecável
- Touch targets ≥ 44px

Roda Lighthouse e fix o que estiver abaixo de 90.

Commit: "style: polish CSS for production"
```

### Dia 6: Configurar domínio

1. Vercel → Settings → Domains → Add `map.urbeia.com.br`
2. Vercel te dá CNAME pra configurar
3. No registro.br → DNS → adiciona CNAME apontando pro Vercel
4. Aguarda propagação (até 48h)
5. SSL automático

### Dia 7: Tua primeira caixa + amigos

- Cadastra 2-3 caixas reais tuas como Urbeia Verified
- Manda pra 3-5 amigos meliponicultores: "Cadastra tua caixa aí, meu irmão"
- Valida que tudo funciona em produção

---

## 🎬 FASE 4 — LAUNCH (Semana 4)

Segue o plano completo em `LAUNCH.md`:

- [ ] Dia 1: Launch (post LinkedIn, Twitter, grupos)
- [ ] Dias 2-7: Engajamento ativo
- [ ] Dias 8-14: Conteúdo educativo
- [ ] Dias 15-21: Parcerias (EPAGRI, FAASC, imprensa)
- [ ] Dias 22-30: Análise e v0.1

---

## 🐛 Troubleshooting comum

### "Mapa não carrega"
- Abre DevTools Console (F12) — ver erro
- Verifica se Leaflet CSS foi carregado (F12 → Network)
- Confere placeholder `COLE_AQUI` ainda no código

### "Caixa não aparece no mapa"
- Verifica `status='approved'` no Supabase
- Confere RLS policies ativas
- Testa query direto: `supabase.from('hives').select('*').eq('status', 'approved')`

### "Cadastro público não funciona"
- RLS bloqueando? confere INSERT policy
- Verificar Network tab → request falhando?
- Supabase logs → Settings → Logs

### "Magic link não chega"
- Supabase → Authentication → Templates → customiza
- Verifica spam
- Em dev: Supabase → Auth → Users → pode clicar "Invite" manualmente

---

## 📊 Como medir sucesso

Após 30 dias:

| Métrica | Meta mínima | Meta ideal |
|---|---|---|
| Caixas cadastradas | 10 | 30 |
| Criadores únicos | 5 | 15 |
| Cidades representadas | 2 | 5 |
| Aparições em mídia | 0 | 2 |
| Leads pro negócio Urbeia | 1 | 5 |

Se bater as metas mínimas → iterar v0.1 com melhorias.
Se não bater → revisar estratégia de distribuição (não é o produto que é ruim, é o funil).

---

## 💡 Últimas dicas

1. **Build in public** — posta stuff toda semana, mesmo feio. Documenta a jornada.

2. **Responde TODOS os comentários e DMs** no primeiro mês — isso cria comunidade.

3. **Primeira parceria é a mais difícil** — quando conseguir EPAGRI, conseguir as próximas fica fácil.

4. **Não adie o launch** — "está 80% pronto" é melhor que "vou polir mais 2 semanas".

5. **Compartilha progresso com este chat** — posso te ajudar a ajustar texto, resolver bug, sugerir features.

---

Boa sorte! 🐝🚀
