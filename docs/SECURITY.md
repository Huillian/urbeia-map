# Segurança — Urbeia Map

> Leia este arquivo ANTES de escrever qualquer RLS policy, formulário, query ou código que exiba dado de usuário.

## 1. Autenticação e autorização

**Método:** Supabase Auth — magic link (email) apenas para admin.
**Papel admin:** `authenticated` no Supabase. Não criar outros usuários sem intenção explícita.
**Público (anon):** sem login. Acesso controlado exclusivamente por RLS.

### Como testar autenticação
```bash
# Acessar /admin.html sem autenticação → deve bloquear ou redirecionar
# Magic link: testar com email real antes de considerar pronto
# Após sessão expirar: ações de moderação devem falhar com 401/403
```

---

## 2. Row Level Security (RLS) — crítico

**Risco documentado:** AI-generated code frequentemente usa `USING (true)`, expondo todos os dados a qualquer requisição anon. Verificar sempre.

### Policies obrigatórias

| Tabela | Operação | Papel | Condição correta |
|---|---|---|---|
| `species` | SELECT | anon | `true` (catálogo público, sem dados sensíveis) |
| `hives` | SELECT | anon | `status = 'approved'` |
| `hives` | INSERT | anon | `status = 'pending' AND is_urbeia_verified = false` |
| `hives` | SELECT | authenticated | `true` |
| `hives` | UPDATE | authenticated | `true` |
| `hives` | DELETE | authenticated | `true` |

### Checklist de verificação (executar no SQL Editor do Supabase antes de qualquer deploy)

```sql
-- 1. Anon vê apenas hives approved
SET LOCAL role = anon;
SELECT id, status FROM hives;
-- Esperado: apenas rows com status='approved'

-- 2. Anon NÃO consegue ver email
SELECT owner_email FROM hives;
-- Esperado: 0 rows ou erro de permissão

-- 3. Anon NÃO pode setar is_urbeia_verified=true
INSERT INTO hives (lat, lng, species_slug, status, is_urbeia_verified)
VALUES (-26.77, -51.01, 'jatai', 'pending', true);
-- Esperado: erro de RLS

-- 4. Anon NÃO pode aprovar
UPDATE hives SET status = 'approved' WHERE id = '<uuid>';
-- Esperado: erro de RLS ou 0 rows affected

-- 5. Admin vê tudo (inclusive pending e rejected)
SET LOCAL role = authenticated;
SELECT id, status, owner_email FROM hives;
-- Esperado: todas as rows
```

---

## 3. XSS — exibição de dados do usuário

**Vetor:** campos `nickname`, `owner_name`, `note` contêm input de usuário não controlado. Se injetados via `innerHTML`, permitem execução de scripts.

### Regra

```javascript
// CORRETO — textContent trata como texto puro
const el = document.createElement('p');
el.textContent = hive.nickname;

// CORRETO — construção por createElement
const link = document.createElement('a');
link.href = `/h.html?slug=${encodeURIComponent(hive.public_slug)}`;
link.textContent = hive.nickname;

// PERIGOSO — nunca com dado de usuário não sanitizado
container.innerHTML = `<p>${hive.nickname}</p>`;

// SE precisar de HTML rico (ex: markdown): sanitizar antes
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.mjs';
container.innerHTML = DOMPurify.sanitize(userContent);
```

**Campos de risco** (input de usuário): `nickname`, `owner_name`, `note`, `rejected_reason`, `city`.
**Campos seguros** (controlados pelo sistema): `id`, `status`, `is_urbeia_verified`, `created_at`, `species_slug`.

### Teste manual de XSS
Inserir via painel Supabase uma caixa com:
```
nickname = <img src=x onerror=alert('xss')>
```
Verificar que o mapa exibe o texto literal, sem executar o alert.

---

## 4. Gestão de secrets

| Secret | Localização | Pode commitar? |
|---|---|---|
| `SUPABASE_URL` | `assets/js/supabase-client.js` | ✅ Sim (público por design) |
| `SUPABASE_ANON_KEY` | `assets/js/supabase-client.js` | ✅ Sim (proteção real é RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nunca no cliente** | ❌ Jamais |
| Senha do banco PostgreSQL | **Nunca no código** | ❌ Jamais |
| Arquivo `.env` | `.gitignore` | ❌ Jamais |

**Se `service_role` vazar:** revogar imediatamente no dashboard Supabase → Settings → API → regenerar service_role key. Isso é prioridade máxima antes de qualquer outro commit.

---

## 5. Upload de fotos (Supabase Storage)

**Riscos:** upload de executáveis, arquivos gigantes, path traversal.

### Validação obrigatória no cliente (`form.js`)

```javascript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function validatePhoto(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG ou WebP.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }
}
```

### Configuração obrigatória no Supabase Storage

Bucket `hive-photos`:
- `allowed_mime_types`: `['image/jpeg', 'image/png', 'image/webp']`
- `file_size_limit`: `5242880` (5MB em bytes)
- Acesso: **privado** — URLs assinadas (`createSignedUrl`), não URLs públicas diretas
- Policy Storage:
  - Anon pode `INSERT` (upload de foto ao cadastrar)
  - Authenticated pode `DELETE` (admin remove foto de caixa rejeitada)

---

## 6. Privacidade de localização

**Campo `approximate_location`:**
- Quando `true`, a UI deve deslocar as coordenadas exibidas (~200–500m aleatórios)
- As coordenadas reais no banco são retornadas para anon na query SELECT atual — isso é um risco
- **Mitigação MVP:** deslocamento no JS cliente ao renderizar o pin
- **Mitigação v1 (preferida):** criar uma view `public_hives` no PostgreSQL que aplica offset nas coords via função quando `approximate_location = true`; query do mapa usa a view, não a tabela direta

```javascript
// Deslocamento client-side (MVP)
function getDisplayCoords(hive) {
  if (!hive.approximate_location) return [hive.lat, hive.lng];
  const offsetLat = (Math.random() - 0.5) * 0.004; // ~200m
  const offsetLng = (Math.random() - 0.5) * 0.004;
  return [hive.lat + offsetLat, hive.lng + offsetLng];
}
```

---

## 7. Rate limiting e spam

**Risco:** bot submete centenas de caixas pending, entulha banco e fila de moderação.

**Mitigação atual (MVP):**
- Supabase free tier tem rate limiting nativo (500 req/hora por IP por padrão)
- Moderação manual filtra spam antes de approve
- Opção futura: honeypot field no form (campo oculto — bot preenche, humano não) ou hCaptcha (free)

---

## 8. Headers de segurança

Criar `vercel.json` na raiz com:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(self), camera=()" }
      ]
    }
  ]
}
```

Note: CSP (Content-Security-Policy) é complexo com múltiplos CDNs (Leaflet, Supabase, CartoDB, Google Fonts). Configurar após MVP estabilizar.

---

## 9. Logs: o que registrar e o que nunca registrar

**Pode logar (console.error em dev, error tracking em prod):**
- Tipo de erro do Supabase (ex: `"RLS violation"`, `"network error"`)
- ID da caixa que causou erro
- Status HTTP de respostas com falha

**NUNCA logar:**
- `owner_email` ou qualquer campo PII
- Tokens de sessão Supabase (`session.access_token`)
- Conteúdo completo do objeto `session` ou `user`
- Payload completo de requests com dados de formulário

---

## 10. Dependências e supply chain

Projeto usa CDNs — sem `package.json` auditável. Riscos mitigados por:

| Dependência | CDN | Versão | Risco |
|---|---|---|---|
| Leaflet.js | unpkg.com | `@1.9.4` (exata) | Baixo |
| Supabase JS SDK | jsdelivr | `@2` (major) | Médio — pode pegar patch não testado |
| CartoDB tiles | basemaps.cartocdn.com | — (tile service) | Baixo |

**Ação pós-MVP:** mover Supabase SDK para versão exata (`@2.103.3`) e adicionar Subresource Integrity (SRI hash) nas tags `<script>`.
