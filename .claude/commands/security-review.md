Revise o arquivo ou componente atual contra as regras de docs/SECURITY.md. Para cada item, responda SIM / NÃO / N.A.:

**RLS**
- [ ] Nenhuma policy usa `USING (true)` sem justificativa documentada
- [ ] `owner_email` não é retornado em query acessível pelo anon
- [ ] `is_urbeia_verified` não pode ser setado pelo anon

**XSS**
- [ ] Dados de usuário (`nickname`, `owner_name`, `note`, `city`) exibidos via `textContent` ou `createElement`, não `innerHTML`
- [ ] Se usa `innerHTML`, conteúdo foi sanitizado com DOMPurify antes

**Secrets**
- [ ] Nenhum `service_role` key presente no arquivo
- [ ] Nenhum `.env` ou credencial além de `anon_key`

**Upload (se aplicável)**
- [ ] Validação de MIME type presente
- [ ] Validação de tamanho máximo (5MB) presente

**Erros**
- [ ] Nenhum `catch(e) {}` vazio
- [ ] Mensagens de erro ao usuário são genéricas (não vazam stack trace ou SQL)

**Design**
- [ ] `owner_email` não aparece em nenhum elemento HTML visível ao usuário público

Para cada item com NÃO: aponte a linha exata e sugira a correção.
