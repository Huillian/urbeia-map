# 🚀 Urbeia Map · Estratégia de Lançamento

> Plano de go-to-market pra quando o MVP estiver pronto.

---

## 🎯 Objetivo do launch

Em **30 dias pós-lançamento:**
- 20+ caixas cadastradas (mix Verified + Community)
- 1+ aparição em imprensa local
- 1+ parceria institucional iniciada
- 3+ leads de potenciais clientes Urbeia

---

## 📅 Plano de 30 dias

### Pré-lançamento (T-7 dias)

#### Setup final
- [ ] Domínio `urbeia.com.br` configurado
- [ ] Subdomínio `map.urbeia.com.br` apontando
- [ ] Lighthouse ≥ 90 em todas métricas
- [ ] Cadastrar tuas 2-3 caixas como **Urbeia Verified** (marcar teu Jataí primeiro)
- [ ] Email pré-escritos em drafts (veja seção abaixo)
- [ ] Instagram @urbeia.map criado (mesmo que vazio)

#### Seed inicial
- [ ] Convidar 3-5 meliponicultores conhecidos pra cadastrar **antes** do lançamento público
- [ ] Meta: mapa ter ao menos 5-8 pins antes do primeiro post

**Por quê?** "Mapa vazio" é problema psicológico. Ninguém quer ser o primeiro. Seu pin + amigos preenchem o gap.

---

### Dia 0 — Lançamento oficial

#### Manhã (9h)
- [ ] Post no LinkedIn (template abaixo)
- [ ] Thread no Twitter/X (template abaixo)
- [ ] Story no Instagram pessoal
- [ ] Mensagem no WhatsApp pra 10 amigos mais próximos pedindo compartilhamento

#### Tarde (14h)
- [ ] Post em grupos específicos:
  - [ ] WhatsApp: grupos de meliponicultura SC
  - [ ] Facebook: "Abelhas sem ferrão Santa Catarina"
  - [ ] Facebook: "Meliponicultura Brasil"
  - [ ] Reddit: r/meliponicultura (se existir) ou r/beekeeping
- [ ] Email pro Prof. André Sezerino (EPAGRI Caçador) — template abaixo
- [ ] Email pra FAASC — template abaixo

#### Noite (19h)
- [ ] Responder comentários e DMs
- [ ] Aprovar caixas que foram cadastradas durante o dia
- [ ] Post de follow-up: "Primeiras X caixas cadastradas hoje"

---

### Semana 1 (dias 1-7)

**Foco:** Engajamento e moderação ativa.

- [ ] Aprovação diária de cadastros novos (máx 24h)
- [ ] Email personalizado de "boas vindas" pra cada criador aprovado
- [ ] Post diário com stats crescendo ("já são X caixas!")
- [ ] Responder 100% dos comentários
- [ ] Montar primeira versão da lista de padrinhos interessados

---

### Semana 2 (dias 8-14)

**Foco:** Conteúdo educativo.

- [ ] Post: "Por que abelhas sem ferrão são melhores pra área urbana"
- [ ] Post: "Cadastre sua caixa em 2 minutos" (tutorial)
- [ ] Post: "Espécie em destaque: Jataí" (mini doc)
- [ ] Mandar release pra imprensa local (Caçador SC):
  - Jornal Diário do Iguaçu
  - Rádio Pérola FM
  - Portal Caçador Online
- [ ] Contato com UNIARP (universidade local)

---

### Semana 3 (dias 15-21)

**Foco:** Parcerias e validação.

- [ ] Reunião presencial ou online com EPAGRI Caçador
- [ ] Proposta formal: mapa institucional pra EPAGRI
- [ ] Contato com Frente Parlamentar de Meliponicultura SC
- [ ] Primeiro email marketing (newsletter) pra cadastrados

---

### Semana 4 (dias 22-30)

**Foco:** Consolidação e análise.

- [ ] Post: "1 mês de Urbeia Map — lições e números"
- [ ] Pesquisa com cadastrados (5 perguntas): o que melhorar
- [ ] Definir roadmap próxima onda baseado em feedback
- [ ] Setup de analytics decente (Plausible / Umami)

---

## 📝 Templates de comunicação

### Template 1 — Post LinkedIn de lançamento

```
🐝 Lancei hoje o Urbeia Map.

É uma plataforma gratuita que mapeia caixas de abelhas sem ferrão em
Santa Catarina, mostrando a área de polinização estimada de cada
colmeia com base na espécie.

Comecei pela minha cidade, Caçador — que por acaso é uma das capitais
catarinenses de meliponicultura (EPAGRI tem estação experimental aqui
e a UNIARP sediou o 37º Encontro Catarinense de Apicultores em 2024).

Por que fiz isso?

1️⃣ Porque tenho minha caixa de Jataí e queria ver ela no mapa.
2️⃣ Porque meliponicultores fazem um serviço ambiental INVISÍVEL —
   e visível é a primeira forma de valorizar.
3️⃣ Porque no futuro, como parte do negócio Urbeia, quero instalar
   caixas em residências e empresas. O mapa mostra nossa cobertura.

Construído em vanilla JS + Leaflet + Supabase. Sem framework,
sem build, sem bloat. Um fim de semana por semana, nas horas livres.

Tem uma caixa de abelhas sem ferrão? Cadastra lá 👇
🔗 map.urbeia.com.br

#meliponicultura #abelhas #santacatarina #indiehacker
```

---

### Template 2 — Thread Twitter

```
🐝 Acabei de lançar o Urbeia Map.

Mapa interativo de abelhas sem ferrão em SC, com raio de polinização
estimado por espécie.

Começa em Caçador/SC. Expande conforme a comunidade cadastra. 1/7
```

```
2/ Por que isso importa?

No Brasil temos ~250 espécies de abelhas sem ferrão (ASF). Cada uma
poliniza uma área diferente. Jataí: ~500m. Mandaçaia: ~900m.

Mapear isso mostra a cobertura REAL de polinização urbana/rural.
```

```
3/ Como funciona:

🟠 Pins laranja = caixas da Urbeia (empresa)
🟢 Pins verde = cadastradas pela comunidade

Cada pin desenha um círculo mostrando a área polinizada pela
espécie daquela caixa.
```

```
4/ Stack:
- HTML + JS vanilla (sem framework)
- Leaflet.js pro mapa
- Supabase pro backend
- Vercel pra deploy

Zero build step. Um arquivo HTML por página.
Build em fim de semana por semana.
```

```
5/ A parte comercial:

Urbeia é um negócio que quero construir: instalação e manutenção
de colmeias de ASF em residências e empresas (tipo as empresas
americanas de hive rental, mas com abelhas nativas brasileiras).

O mapa é a vitrine e o funil.
```

```
6/ Tem uma caixa? Cadastra:
🔗 map.urbeia.com.br/cadastrar

Se tá em SC especialmente, quero conhecer sua caixa.

Se tá fora de SC, segue que em breve expandimos.
```

```
7/ Build in public, feito com carinho em Caçador, SC.

Em 30 dias volto aqui com números.

Eu: @huilliandev
```

---

### Template 3 — Email pro Prof. André Sezerino (EPAGRI Caçador)

```
Assunto: Urbeia Map · Ferramenta gratuita de mapeamento de ASF

Prof. André, boa tarde.

Sou o Huillian Alves Machado, morador de Caçador e entusiasta de
meliponicultura. Tenho uma caixa de Jataí em casa e acompanho os
trabalhos do senhor na Estação Experimental da EPAGRI.

Acabei de lançar um projeto que acredito ter valor pra pesquisa e
educação da região:

🔗 map.urbeia.com.br

É uma plataforma gratuita e aberta que mapeia caixas de abelhas sem
ferrão, mostrando a área estimada de polinização com base na espécie.
Comecei pela nossa região (Caçador e arredores) e pretendo expandir
pra SC inteiro.

Por que estou te escrevendo:

Gostaria de oferecer a ferramenta pra EPAGRI. Pesquisadores podem
cadastrar os meliponários experimentais e acompanhar a cobertura
de polinização da região. Se quiser, posso adicionar uma "camada
institucional" com destaque pras caixas da Estação.

Os dados ficam abertos sob CC-BY, podem ser exportados em CSV/GeoJSON
a qualquer momento.

Posso apresentar o projeto em reunião online de 20 min quando for
conveniente?

Abraços,
Huillian Alves Machado
huillian.dev
```

---

### Template 4 — Release pra imprensa local

```
TÍTULO:
Morador de Caçador lança mapa gratuito de abelhas sem ferrão em SC

SUBTÍTULO:
Plataforma Urbeia Map mostra caixas cadastradas por meliponicultores
e área de polinização por espécie

CORPO:

Caçador (SC) — Começou a funcionar esta semana o Urbeia Map
(map.urbeia.com.br), uma plataforma online gratuita que mapeia caixas
de abelhas sem ferrão em Santa Catarina.

A ferramenta foi desenvolvida por Huillian Alves Machado, desenvolvedor
e estudante de desenvolvimento de sistemas, morador de Caçador. O
projeto é parte do ecossistema Urbeia, um negócio em desenvolvimento
focado em instalar e manter colmeias de abelhas sem ferrão em
residências e empresas.

"Caçador é uma das capitais catarinenses de meliponicultura. Temos a
Estação Experimental da EPAGRI, o Campus do IFSC, a UNIARP sediou o
37º Encontro Catarinense de Apicultores em 2024. A região tem tudo
pra se destacar nacionalmente", afirma Huillian.

O mapa funciona de forma colaborativa: qualquer pessoa pode cadastrar
sua caixa de abelhas sem ferrão preenchendo um formulário simples.
As caixas são visualizadas com um círculo representando a área de
polinização estimada — que varia por espécie (de 300m para Mirim a
900m para Mandaçaia).

Santa Catarina tem 35 espécies catalogadas de abelhas sem ferrão.
Todas são nativas do Brasil e, por não terem ferrão funcional,
oferecem risco quase zero a crianças, idosos e animais de estimação.

O projeto é gratuito, open data (CC-BY 4.0) e não tem publicidade.

🔗 map.urbeia.com.br

CONTATO:
Huillian Alves Machado
[email]
huillian.dev
```

---

## 🎯 Métricas pra acompanhar

### Diárias (primeira semana)
- Caixas cadastradas
- Caixas aprovadas vs rejeitadas
- Visitas únicas ao mapa
- Tempo médio na página

### Semanais
- Taxa de conversão (visita → cadastro)
- Novos criadores (emails únicos)
- Compartilhamentos em redes sociais
- Emails de contato recebidos

### Mensais
- Total de caixas e crescimento
- Diversidade de espécies representadas
- Cobertura geográfica (cidades)
- Menções em mídia
- Leads Urbeia (pessoas pedindo serviço)

---

## 💡 Ideias bônus de tração

### Low effort, high impact

- **Instagram de "caixa da semana"** — foto + história do criador
- **Newsletter mensal** "Urbeia Report" — stats + espécie em destaque
- **Desafio #30diasdeabelhas** — cadastre 1 caixa por dia, viralize
- **QR code pra brindar meliponicultores** — adesivo "Esta caixa tá no Urbeia Map"

### Médio esforço

- **Workshop grátis de meliponicultura** em Caçador
- **Parceria com escolas** (estudantes cadastram caixas da escola)
- **Clube de apadrinhamento local** — pessoas pagam R$30/mês pra apadrinhar caixas públicas

### Alto esforço

- **Documentário curto (YouTube)** sobre meliponicultura em Caçador
- **Aplicativo mobile** pra cadastro com foto e GPS automático
- **Integração com prefeituras** — "Cidade Amiga das Abelhas"

---

## 🚨 O que NÃO fazer

- ❌ **Anúncios pagos antes de ter produto validado** — queima dinheiro
- ❌ **Monetizar muito cedo** (apadrinhamento só depois de 100+ caixas)
- ❌ **Postar fotos de caixas sem consentimento** — sempre pedir
- ❌ **Vender email dos cadastrados** — suicídio de marca
- ❌ **Prometer o que não entrega** — raio é estimativa, sempre com disclaimer
- ❌ **Responder grosso a crítica** — até quem critica vira promoter se for bem tratado

---

## 🎬 Resumo do approach

**Construir em público + parcerias locais + dados abertos = credibilidade + tração orgânica**

Não precisa de orçamento de marketing. Precisa de:

1. Produto funcional (semanas 1-4)
2. Storytelling honesto (posts semanais)
3. Outreach direto (EPAGRI, FAASC, imprensa)
4. Paciência (tração orgânica leva 3-6 meses pra compor)

**Lembre:** o Urbeia Map não precisa viralizar. Precisa virar **referência local em Caçador** primeiro. Depois SC inteiro. Depois BR.
