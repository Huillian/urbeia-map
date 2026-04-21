Execute a checklist pré-commit para o código modificado:

**1. Validação de sintaxe JS** — rode no terminal:
```bash
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
```

**2. Checklist de segurança**
- [ ] Nenhum `innerHTML` com dado não sanitizado
- [ ] Nenhum `service_role` key no diff
- [ ] RLS não foi alterada para `USING (true)`
- [ ] `owner_email` não aparece em query pública

**3. Checklist de qualidade**
- [ ] Sem `catch(e) {}` vazio
- [ ] Design intent declarado se UI foi modificada
- [ ] Sem `console.log` de debug esquecido

**4. Teste manual mínimo**
- [ ] Abriu http://localhost:8000 e testou o fluxo afetado
- [ ] Testou no mobile (Chrome DevTools → responsive mode)

Reporte o resultado de cada item. Se algum falhar, corrija antes de commitar.
