# 📚 Urbeia Map · Documentação

Bem-vindo à documentação do projeto **Urbeia Map**. Esses arquivos são seus guias de referência durante todo o desenvolvimento e depois.

---

## 📁 Arquivos neste pacote

### Essenciais (colocar na raiz do repo)

| Arquivo | Propósito | Quando usar |
|---|---|---|
| **`README.md`** | Descrição pública do projeto | Na raiz do repo GitHub |
| **`CLAUDE.md`** | Contexto automático pro Claude Code | Lido toda sessão |
| **`.gitignore`** | Arquivos ignorados pelo git | Na raiz |

### Referência (podem ficar em `docs/`)

| Arquivo | Propósito | Quando usar |
|---|---|---|
| **`SPEC.md`** | Spec técnico detalhado | Consulta durante dev |
| **`ROADMAP.md`** | Plano de evolução em ondas | Revisar trimestralmente |
| **`SCHEMA.md`** | Scripts SQL + instruções Supabase | Setup inicial |
| **`SPECIES.md`** | Catálogo de espécies com fontes | Referência científica |
| **`LAUNCH.md`** | Estratégia de go-to-market | Semana 4 de dev |
| **`EXECUTION.md`** | Guia passo-a-passo de dev | Toda a jornada |

---

## 🗺️ Estrutura sugerida no repo

```
urbeia-map/
├── README.md              ← raiz
├── CLAUDE.md              ← raiz
├── .gitignore             ← raiz
├── index.html             ← código
├── cadastrar.html
├── admin.html
├── h.html
├── assets/
│   ├── css/
│   └── js/
├── supabase/
│   ├── schema.sql
│   └── seed.sql
└── docs/                  ← referência (opcional)
    ├── SPEC.md
    ├── ROADMAP.md
    ├── SCHEMA.md
    ├── SPECIES.md
    ├── LAUNCH.md
    └── EXECUTION.md
```

---

## 🎯 Como usar esta documentação

### Se você tá começando agora
1. Leia o **`README.md`** pra entender o escopo
2. Siga o **`EXECUTION.md`** passo-a-passo
3. Consulte **`SCHEMA.md`** quando configurar o Supabase

### Durante o desenvolvimento
- **`CLAUDE.md`** é lido automaticamente pelo Claude Code — não precisa abrir
- **`SPEC.md`** pra consultar detalhes técnicos
- **`SPECIES.md`** quando precisar dos dados científicos

### Antes de lançar
- Revise **`LAUNCH.md`** uma semana antes
- Prepare templates de comunicação antecipadamente

### Depois do lançamento
- Use **`ROADMAP.md`** pra planejar próximas ondas
- Atualize conforme aprende

---

## 🔄 Manutenção dos docs

Esses arquivos são **vivos**. Conforme o projeto evolui:

- ✏️ **Editar:** qualquer doc pode ser editado a qualquer momento
- 🔄 **Versionar:** `git commit -m "docs: update spec with X"`
- 📅 **Revisar:** mensalmente, passar os olhos em todos
- 🗑️ **Aposentar:** se algo não serve mais, move pra `docs/archive/`

---

## 💬 Dúvidas?

Se em algum ponto a documentação não responde:

1. Abre um issue no GitHub (`docs: question about X`)
2. Pergunta no Claude (com contexto dos docs)
3. Atualiza o doc depois com a resposta

---

**Boa construção! 🐝🚀**
