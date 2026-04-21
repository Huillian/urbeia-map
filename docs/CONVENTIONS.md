# Convenções — Urbeia Map

## Naming

### Arquivos
- HTML: `kebab-case.html` (ex: `cadastrar.html`, `h.html`)
- CSS: `style.css` (arquivo único por enquanto)
- JS: `kebab-case.js` por responsabilidade (ex: `supabase-client.js`, `map.js`)
- SQL: `snake_case.sql`, migrations com prefixo numérico (`001_add_rejected_reason.sql`)

### JavaScript
- Variáveis e funções: `camelCase`
- Constantes globais: `UPPER_SNAKE_CASE`
- Namespaces globais: `window.urbeiaDB`, `window.urbeiaMap`
- Classes/construtores: `PascalCase` (raramente usados aqui)

### HTML
- IDs: `kebab-case` (ex: `id="filter-species"`, `id="hive-list"`)
- Classes CSS: BEM simplificado
  - Block: `.hive-card`
  - Element: `.hive-card__title`, `.hive-card__badge`
  - Modifier: `.hive-card--verified`, `.hive-card--pending`

### Banco de dados
- Tabelas: `snake_case` plural (`hives`, `species`)
- Colunas: `snake_case` (`is_urbeia_verified`, `owner_email`, `public_slug`)
- Slugs: `lowercase-kebab` (`jatai`, `huillian-cacador-01`)
- Enums/status: string lowercase (`pending`, `approved`, `rejected`)

### Branches e commits
- Branches: `feat/nome-curto`, `fix/nome-curto`, `chore/nome-curto`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/)

```
feat: adiciona filtro por espécie no mapa
fix: corrige popup fechando ao clicar no tile do mapa
chore: adiciona vercel.json com headers de segurança
style: ajusta espaçamento do bottom-sheet mobile
docs: atualiza SECURITY.md com política de storage
refactor: extrai getDisplayCoords para species.js
```

---

## Formatação (sem formatter automático — sem build step)

- **Indentação:** 2 espaços (HTML, CSS, JS, SQL)
- **Aspas:** simples em JS (`'string'`), duplas em HTML (`attr="valor"`)
- **Semicolons:** sempre em JS
- **Comprimento de linha:** máx 100 chars (preferência, não bloqueante)
- **Fim de arquivo:** linha em branco

Antes de commitar, revisar o diff manualmente com `git diff --staged`.

---

## Ordem de atributos HTML

1. `id`
2. `class`
3. `data-*`
4. `aria-*`
5. Demais atributos funcionais (`href`, `src`, `type`, etc.)

```html
<button id="btn-approve" class="btn btn--primary" data-hive-id="..." aria-label="Aprovar caixa">
  Aprovar
</button>
```

---

## Padrões de erro

```javascript
// CORRETO — propagar com contexto
async function approveHive(id) {
  const { error } = await supabase
    .from('hives')
    .update({ status: 'approved' })
    .eq('id', id);
  if (error) throw new Error(`approveHive(${id}): ${error.message}`);
}

// CORRETO — logar e mostrar mensagem genérica ao usuário
try {
  await approveHive(id);
  showToast('Caixa aprovada!');
} catch (err) {
  console.error(err);
  showToast('Erro ao aprovar caixa. Tente novamente.'); // genérico para o usuário
}

// ERRADO — silenciar
try { ... } catch(e) {}

// ERRADO — vazar detalhe técnico ao usuário
showToast(err.message);
```

---

## Padrões de async

- Sempre `async/await`, nunca `.then()` aninhado
- Sempre checar `error` do Supabase: `const { data, error } = await ...`
- Loading state: toda ação async que afeta UI deve ter indicador visual

```javascript
// Padrão de chamada Supabase
async function getApprovedHives() {
  const { data, error } = await supabase
    .from('hives')
    .select('id, public_slug, lat, lng, nickname, species_slug, is_urbeia_verified, approximate_location')
    .eq('status', 'approved');
  if (error) throw new Error(`getApprovedHives: ${error.message}`);
  return data;
}

// Padrão com loading state
async function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  try {
    await submitHive(formData);
    showSuccess();
  } catch (err) {
    console.error(err);
    showToast('Erro ao cadastrar. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Cadastrar caixa';
  }
}
```

---

## Tamanho e complexidade

- **Função:** máx ~40 linhas. Se passar, refatorar ou justificar em comentário.
- **Arquivo JS:** máx ~300 linhas. Se passar, considerar separar responsabilidades.
- **Indentação:** máx 3 níveis. Mais que isso = extrair função auxiliar.

---

## Comentários

Só escrever quando o **por quê** não é óbvio:

```javascript
// ÚTIL — explica restrição não óbvia
// Supabase retorna coords com 8 casas decimais; truncar pra 5 reduz tamanho da URL sem perder precisão relevante (~1m)
const lat = Math.round(hive.lat * 100000) / 100000;

// ÚTIL — explica comportamento surpreendente
// Leaflet não aceita update de LatLng direto — precisa remover e re-adicionar o marker
map.removeLayer(existingMarker);
const newMarker = L.marker([lat, lng]).addTo(map);

// DESNECESSÁRIO — o código já diz isso
// Verifica se é verificado
if (hive.is_urbeia_verified) { ... }
```

Não referenciar tarefas, issues ou PR no corpo de funções. Isso vai no commit message.

---

## Design intent (obrigatório em arquivos HTML com UI)

Todo arquivo HTML novo deve ter no `<head>` ou no topo do primeiro `<script>`:
```html
<!-- Design intent: dark map-first interface, scientific/natural aesthetic, orange trust signal for verified hives -->
```

Adaptar por página — não copiar cegamente o mesmo texto.
