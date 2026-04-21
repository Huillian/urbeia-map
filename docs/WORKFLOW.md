# Workflow — Urbeia Map

## Git flow

Projeto solo → **trunk-based simplificado**:
- Branch principal: `main` (sempre deployável, Vercel faz auto-deploy)
- Features em `feat/nome-curto` quando a mudança é grande ou experimental
- Commit direto em `main` para mudanças pequenas e seguras
- Sem `develop`, sem GitFlow completo

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona filtro por espécie no mapa
fix: corrige popup fechando ao clicar no tile
chore: adiciona vercel.json com headers de segurança
style: ajusta espaçamento do bottom-sheet mobile
docs: atualiza SECURITY.md com política de storage
refactor: extrai validação de foto para validatePhoto()
```

Commits atômicos — um assunto por commit. Sem commits "WIP" ou "vários ajustes".

## PR / revisão

Projeto solo — PRs são opcionais mas recomendados para:
- Alterações no schema SQL (migrations)
- Modificações em RLS policies
- Mudanças que tocam mais de 3 arquivos

**Checklist de PR** (mesmo que revisado pelo próprio autor):
- [ ] RLS não foi relaxada acidentalmente (revisar diff do schema.sql)
- [ ] Dados de usuário não exibidos via `innerHTML` sem sanitização
- [ ] `owner_email` não vaza em nenhuma query acessível ao anon
- [ ] `/design-check` rodado se houve mudança de UI
- [ ] Testado no mobile (Chrome DevTools responsive mode)
- [ ] Sem `console.log` de debug esquecido

## CI/CD

**MVP:** sem CI formal. Deploy automático via Vercel + GitHub.

```
git push main
  → Vercel detecta push
  → Build (estático, sem build step → deploy instantâneo)
  → Deploy em ~20-30s
```

**Preview URLs automáticas:** Vercel gera URL para cada branch/PR (`urbeia-map-git-<branch>-huillian.vercel.app`).

**Quando adicionar CI (v1):**
- Se houver mais de 1 colaborador
- Adicionar: htmlhint, validação JS, Lighthouse CI, Playwright E2E

## Deploy

### Staging
- Toda branch no GitHub recebe preview URL automática pela Vercel
- Testar sempre no preview antes de considerar pronto

### Produção
- Merge / push para `main` → Vercel deploy automático em ~30s
- Domínio: `map.urbeia.com.br` (configurar após registrar `urbeia.com.br`)
- Verificar após deploy: abrir URL de produção, checar mapa carrega, inspecionar aba Network sem erros 4xx/5xx

### Rollback
1. Dashboard Vercel → Deployments
2. Selecionar deploy anterior (stable)
3. Click em "Promote to Production"
4. Leva ~10s — sem downtime

### Headers de segurança
Manter `vercel.json` na raiz com os headers definidos em `docs/SECURITY.md`.

## Banco de dados (migrations)

Sem Supabase CLI configurado no MVP → alterações via SQL Editor do dashboard.

**Convenção de arquivos SQL:**
```
supabase/
  schema.sql          # DDL completo e atual (sempre atualizado)
  seed.sql            # 7 espécies iniciais
  migrations/
    001_initial.sql
    002_add_rejected_reason.sql
    003_add_photo_thumb_url.sql
```

**Regra inviolável:** nunca modificar migration já aplicada em produção. Criar nova migration.

**Após cada migration em produção:** atualizar `schema.sql` para refletir o estado atual.

## Variáveis de ambiente

- `SUPABASE_URL` e `SUPABASE_ANON_KEY` → hardcoded em `assets/js/supabase-client.js` (públicos, seguros)
- Se no futuro precisar de secrets server-side (Edge Functions): configurar no painel Vercel → Settings → Environment Variables, nunca no código

## Atualização do frontend-design skill

Re-baixar `.claude/skills/frontend-design/SKILL.md` da fonte oficial a cada ~3 meses para pegar atualizações da Anthropic:

```bash
curl -fsSL https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md \
  -o .claude/skills/frontend-design/SKILL.md
```

Verificar que o arquivo não está vazio e contém "frontend-design" no header antes de usar.
