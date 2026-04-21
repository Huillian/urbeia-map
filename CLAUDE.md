# Projeto: Urbeia Map

## O que é
Plataforma web pública que mapeia caixas de abelhas sem ferrão (ASF) em Santa Catarina, foco inicial em Caçador/SC. Diferencia **Urbeia Verified** (laranja, só admin) de **Community** (verde, cadastro público moderado). Subproduto do negócio de meliponicultura Urbeia — gera leads, demonstra cobertura geográfica e educa sobre polinização urbana.

**Produção:** `map.urbeia.com.br` | **Repo:** `github.com/Huillian/urbeia-map`

## Stack
- **Frontend:** HTML + JS vanilla (ES2021+, sem framework, sem build step)
- **Mapa:** Leaflet.js 1.9.4 via CDN
- **Tiles:** CartoDB Dark Matter (gratuito)
- **Backend:** Supabase (PostgreSQL + Auth + Storage) — SDK `@supabase/supabase-js@2.103.3` via CDN
- **Deploy:** Vercel (static)
- **Fontes:** Geist + Geist Mono + Instrument Serif (Google Fonts)

## Isolamento de projetos — CRÍTICO

> O usuário possui outros projetos Supabase na conta (`PXTLISTAS` / `PXT Financeiro` / `BuscadorPXT`).
> **NUNCA** usar, referenciar, modificar ou acessar qualquer recurso PXT neste projeto.
> O Supabase do Urbeia Map é um projeto próprio e separado — criar do zero quando necessário.

## Leia antes de codar
- `docs/ARCHITECTURE.md` para entender estrutura e decisões arquiteturais
- `docs/CONVENTIONS.md` para estilo, naming e padrões de código
- `docs/SECURITY.md` SEMPRE antes de qualquer RLS policy, form, query ou exibição de dado de usuário
- `docs/TESTING.md` para saber o que precisa ser testado antes de considerar pronto
- `.claude/skills/frontend-design/SKILL.md` SEMPRE antes de criar ou modificar qualquer UI, componente, página ou estilo

## Golden rules (não negociáveis)

1. **RLS nunca permissiva**: toda policy usa condição específica — `USING (true)` é proibido. Revisar `docs/SECURITY.md` antes de escrever qualquer policy.
2. **XSS zero-tolerance**: dados de usuário exibidos via `textContent` ou `createElement`. Nunca `innerHTML` com conteúdo não sanitizado. Se precisar de HTML rico, usar DOMPurify.
3. **`is_urbeia_verified` inviolável**: só admin autenticado pode setar `true`. Verificar via teste SQL na RLS antes de deploy.
4. **`owner_email` nunca público**: não entra em nenhuma query ou response acessível ao anon.
5. **Service role key nunca no cliente**: `anon_key` é pública e segura de commitar; `service_role` é proibida em `assets/js/`.
6. **Upload com restrições**: validar MIME type (`image/jpeg`, `image/png`, `image/webp`) e tamanho máximo (5MB) no `form.js` e nas regras do bucket Supabase Storage.
7. **Antes de qualquer UI**: reler `.claude/skills/frontend-design/SKILL.md` e declarar `<!-- Design intent: [direção em 1 frase] -->` no topo do arquivo HTML.
8. **Tarefa nova = plano primeiro**: listar passos antes de escrever código. Usar `/plan`.
9. **Mudança em >3 arquivos**: parar e confirmar com o usuário antes de executar.
10. **Erro nunca silenciado**: sem `catch(e) {}` vazio — logar ou propagar. Em produção, mensagem genérica ao usuário (nunca stack trace).
11. **Ler antes de modificar**: ler o arquivo inteiro + seus importadores antes de qualquer edição.
12. **Disclaimer nos raios de polinização**: toda exibição de `pollination_radius_m` inclui nota "estimativa baseada em literatura científica".

## Entry points
- `index.html` → mapa público principal
- `cadastrar.html` → formulário público de cadastro
- `admin.html` → painel de moderação (magic link auth)
- `h.html` → página pública de caixa individual
- `assets/js/supabase-client.js` → inicialização do SDK + `window.urbeiaDB` helpers

## Comandos úteis

```bash
# Servir local
python3 -m http.server 8000
# → http://localhost:8000

# Validar sintaxe JS inline antes de commit
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

# Supabase CLI (opcional, se precisar de migrations)
npx supabase init
npx supabase link --project-ref <project-ref>
npx supabase db push

# Lighthouse (instalar uma vez: npm i -g lighthouse)
lighthouse http://localhost:8000 --output html --view
```

## Slash commands disponíveis
- `/plan` — obriga planejar antes de codar tarefa nova
- `/security-review` — revisa arquivo contra docs/SECURITY.md
- `/test-coverage` — analisa o que falta testar no código atual
- `/pre-commit` — checklist de lint + segurança + qualidade antes de commitar
- `/design-check` — audita UI contra frontend-design/SKILL.md

## Referências científicas (raios de polinização)
Valores baseados em: EPAGRI, Embrapa, A.B.E.L.H.A., Moure's Bee Catalogue, Sezerino et al. 2022. Raios são médias — variam com flora, relevo, clima, tamanho da colônia.
