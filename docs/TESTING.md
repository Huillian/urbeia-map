# Testes — Urbeia Map

## Filosofia

Projeto solo, MVP de 4 semanas. **Testar apenas o crítico** — o que, se quebrar silenciosamente, causa dano real (exposição de dados, spam aprovado, XSS).

Sem framework de teste formal no MVP. Testes são:
1. **Manuais funcionais** — no browser antes de cada feature ser marcada como pronta
2. **Testes SQL de RLS** — executados no Supabase SQL Editor

Quando crescer para equipe: adicionar Playwright (E2E) e Supabase CLI para RLS tests em CI.

---

## OBRIGATÓRIO testar (antes de cada deploy)

### 1. RLS policies — segurança crítica

Executar no Supabase SQL Editor:

```sql
-- Como anon: ver apenas hives approved
SELECT id, status FROM hives;
-- Esperado: zero rows com status != 'approved'

-- Como anon: NÃO ver email
SELECT owner_email FROM hives;
-- Esperado: erro de permissão ou 0 rows

-- Como anon: NÃO poder setar verified=true
INSERT INTO hives (lat, lng, species_slug, status, is_urbeia_verified)
VALUES (-26.77, -51.01, 'jatai', 'pending', true);
-- Esperado: violação de RLS

-- Como anon: NÃO poder aprovar
UPDATE hives SET status = 'approved' WHERE id = '<qualquer-uuid>';
-- Esperado: 0 rows affected ou erro

-- Como authenticated (admin): ver tudo
SELECT id, status, owner_email FROM hives;
-- Esperado: todas as rows, todos os campos
```

### 2. Formulário de cadastro — validação de input

Checklist manual para `cadastrar.html`:
- [ ] Submit sem campos obrigatórios → mostra erro visível, não crasheia
- [ ] `nickname` com `<script>alert(1)</script>` → salvo como texto puro, não executa
- [ ] `nickname` com `<img src=x onerror=alert(1)>` → exibido no mapa como texto literal
- [ ] Foto `.exe` renomeada para `.jpg` → rejeitada (MIME type inválido, não extensão)
- [ ] Foto de 10MB → rejeitada antes do upload, mensagem clara ao usuário
- [ ] Coordenadas colocadas arrastando o pin → salvas corretamente (verificar no banco)
- [ ] `approximate_location = true` → pin no mapa aparece deslocado do ponto real

### 3. Mapa — funcionalidade core

Checklist manual para `index.html`:
- [ ] Caixas `approved` aparecem como pins no mapa
- [ ] Caixas `pending` **não** aparecem (verificar na aba Network: query não retorna pending)
- [ ] Círculo de polinização com raio correto por espécie (jataí = 500m)
- [ ] Hive Urbeia Verified → pin laranja (`#ff6b35`)
- [ ] Hive Community → pin verde (`#06d6a0`)
- [ ] Popup abre ao clicar no pin com dados corretos
- [ ] Popup não mostra `owner_email`
- [ ] Mobile: mapa ocupa tela cheia, sidebar como bottom-sheet

### 4. Admin — autenticação e moderação

Checklist manual para `admin.html`:
- [ ] Acessar sem login → ações bloqueadas (não mostra lista, ou mostra mas botões falham)
- [ ] Magic link enviado → chega no email e autentica
- [ ] Lista de pendentes carrega após login
- [ ] Botão "Aprovar" → caixa some da fila e aparece no mapa público
- [ ] Botão "Rejeitar" → caixa some da fila, não aparece no mapa
- [ ] Botão "Marcar Verified" → caixa fica com pin laranja no mapa
- [ ] Após logout → ações de moderação falham (sessão encerrada)

### 5. Página de caixa individual (`h.html`)

- [ ] URL com slug válido → exibe dados da caixa
- [ ] URL com slug inválido → mensagem de "não encontrado", não crasha
- [ ] Caixa `pending` → não acessível via URL pública (retorna 0 dados)

---

## OPCIONAL (pode ficar para depois)

- Wrappers simples sobre Supabase SDK sem lógica de negócio
- Funções de formatação de data (`formatDate()`, etc.)
- Animações e transições CSS
- SEO meta tags (verificar via `curl -s URL | grep -i og:`)

---

## Como rodar

```bash
# Servidor local
python3 -m http.server 8000
# → http://localhost:8000

# Validar sintaxe JS inline (antes de qualquer commit)
node -e "
const fs = require('fs');
['index.html','cadastrar.html','admin.html','h.html'].forEach(f => {
  if (!fs.existsSync(f)) return;
  const html = fs.readFileSync(f,'utf8');
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  scripts.forEach(s => {
    const body = s.replace(/<script[^>]*>|<\/script>/g,'');
    if (!body.trim()) return;
    try { new Function(body); console.log('ok', f); }
    catch(e) { console.error('ERRO', f, e.message); }
  });
});
"

# Lighthouse (instalar: npm i -g lighthouse)
lighthouse http://localhost:8000 --output html --view
# Metas: Performance ≥ 90 | Accessibility = 100 | SEO ≥ 95
```

---

## Política de teste com falha

Todos os testes são manuais no MVP. Se um teste falha de forma intermitente:
1. Investigar a causa antes de re-testar — nunca marcar como "passou" sem entender
2. Se for condição de rede/CDN → documentar como risco conhecido
3. Erro flaky é bug — não é normal

---

## Roadmap de testes (v1+)

Quando tiver mais de 1 colaborador:
- **Playwright** — E2E para fluxos críticos: ver mapa, cadastrar caixa, moderar como admin
- **Supabase CLI + pg_tap** — RLS policies testadas em CI com banco real (não mock)
- **Lighthouse CI** — Performance e acessibilidade automatizados no pipeline
