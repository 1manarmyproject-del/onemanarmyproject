# OMA Site — Documento de Contexto
> Versão: abril/2026 — atualizado pós-sessão pré-lançamento mobile (14/04/2026)
> Para carregar em qualquer sessão de desenvolvimento

---

## 🚀 Sessão 14/04/2026 — Revisão pré-lançamento mobile

**Escopo:** 9 páginas + 1 relatório revisados com rigor cirúrgico pra lançamento oficial do AR.

### Padrão estabelecido
- **Hamburger mobile** 38×38px com 3 spans animando X, overlay fullscreen (`rgba(8,8,8,.98)` dark / `rgba(245,240,232,.98)` light), CSS scopado por página
- **SVGs Lucide style** (24×24 viewBox, stroke currentColor, width 2, linecap/linejoin round) em substituição a 80+ emojis
- **Paleta terracota light**: `--fire:#c85820 --ember:#a04010 --char:#f5f0e8 --coal:#ede8df --bone:#2a2018`
- **Paleta dark (hero)**: `--fire:#e8703a --char:#080808 --bone:#e4ddd3`
- **Texto legível em dark**: `#b5ada3` (corpo), `#9a9187` (metadata), `#7a7268` (dividers)
- **CSS variable scoping** bate `!important` pra overrides localizados
- **`.textContent` → `.innerHTML`** em JS pra swap de emoji→SVG em button states

### Páginas revisadas (produção)
| Página | Principais mudanças |
|---|---|
| `/` home | hamburger, 9 segments + 9 modules SVGs, ROI Magnet mobile, footer 2-col |
| `/agentes` | hamburger, remoção duplicate templates, proof-grid 5º card full-width |
| `/solutions` | hamburger, sara auto-open removido, AI products stack mobile, 20 emojis→SVG, light terracota wrapper |
| `/predictions` | hamburger, 8 emojis→SVG, mobile stacking full, Sara widget limpo adicionado, cores legíveis, bia lagosta IIFE removido |
| `/scribe` | hamburger, sara auto-open removido, plan cards mobile commercial (`.plan-period` removido, buttons edge-to-edge via padding nos filhos), 8 emojis→SVG |
| `/blog` index | fonts (Black Ops One + Playfair), paleta harmonizada, hero title em Playfair, hamburger, 3 auto-open removidos, 37 emojis→SVG |
| `/academy` | nav com links absolutos pro domínio principal, hamburger `#omaNavBurger` |
| `/ideias` (Hetzner) | hamburger light terracota, SANDBOX removido, clipboard SVG, card 5 STACK + 9 full-width, botão solid "Saber mais" |
| `/insights` (Hetzner) | hamburger light terracota, bolt data-URI SVG, 6 emojis→SVG, debug removido, `.powered` mobile fix, deploy via `pm2 restart` |

### `/reports/oma-case-study.html` — reescrita McKinsey-level
Arquivo completamente reescrito (899 linhas):
- Paleta terracota light + Playfair Display italic + Barlow Condensed + Space Mono
- **Cover**: 4 metrics (sem Custo R$1,50), Playfair 64px italic em accent terracota
- **Sumário executivo**: card destacado com 3 descobertas-chave (#1, 72%, 78→45%), label `RESUMO EXECUTIVO · NÃO EXAUSTIVO · PREVIEW PARA DEMONSTRAÇÃO`
- **§01 Adoção**: bar chart ranqueado 01–07, top 2 em destaque terracota, big-num callouts 40% e 12–18 meses, pull quote
- **CTA mid-report**: bloco gradient terracota→ember com botão branco → `/predictions#formulario`
- **§02 Competitivo**: timeline 3 colunas (Mês 1–2 / 3–4 / 5–6), big-num 72%, pull quote
- **§03 Percepção**: sentiment chart 3 períodos red→fire, 5 objeções grid 3-col, 55/45 split (Nunca Programei Nada)
- **§04 Opp & Crisis**: 2-col grid opp (fire) vs crisis (red), 4 cards cada
- **CTA final**: bloco gradient de conversão
- **Sara widget** contexto `predictions-report`
- **Mobile responsivo** completo em `@media(max-width:760px)`

### Segurança
- **Secrets em `.env`** (gitignored, chmod 600) — nunca passar token literal na CLI
  - `~/oma-project-site/.env` contém `VERCEL_TOKEN` e `VERCEL_ORG`
  - Template em `.env.example` (comitado) pra novos clones do repo
  - Deploy: `set -a && source .env && set +a && npx vercel --prod --yes --token "$VERCEL_TOKEN"`
- Token Vercel anterior (`vcp_7SEW...`) **revogado** no dashboard
- Token novo criado: referenciado como `$VERCEL_TOKEN` em docs — nunca comitar literal
- `git-filter-repo` usado pra purgar 3 commits que continham o token antigo
- 969 commits reescritos, force push no `origin/main`
- `.gitignore` expandido com `*.bak.*` pra não poluir repo com backups de patch

### Backups `.bak.*` (untracked, agora ignorados)
9 arquivos de backup criados ao longo da sessão, preservados localmente mas fora do repo:
`agentes.html.bak.pre-mobile-*`, `blog/index.html.bak.pre-mobile-*`, `index.html.bak.pre-mobile-menu-*`, `index.html.bak.pre-svg-icons-*`, `predictions.html.bak.pre-mobile-*`, `reports/oma-case-study.html.bak.pre-rewrite-*`, `scribe.html.bak.pre-mobile-*`, `solutions.html.bak.pre-mobile-*`

### Pendências pós-sessão
- **Blog individual articles** (34 arquivos em `~/oma-project-site/blog/*.html`) — aplicar mesmo tratamento: font fix, palette harmonization, emoji replacement
- **Checkouts** — revisão completa de todos os fluxos de checkout mencionada pelo Fabio
- **Tarball backup** `~/backups/oma-site-pre-launch-20260414.tar.gz` criado como rollback point do estado "pronto pro AR"

---

## Arquitetura Geral

O frontend OMA está em repositórios independentes, cada um com seu próprio projeto Vercel ou no Hetzner.

```
onemanarmyproject.com.br          → oma-project-site  (site público — repo ativo)
academy.onemanarmyproject.com.br  → oma-academy
hub.onemanarmyproject.com.br      → oma-hub
insights.onemanarmyproject.com.br → Hetzner :3093 (PM2 oma-ia-insights)
api.onemanarmyproject.com.br      → Hetzner :3000 (PM2 oma-clients-api) + rotas nginx
agents.onemanarmyproject.com.br   → Hetzner :3097 (PM2 oma-agent-manager) ← NOVO
```

---

## Mapa de Repositórios

| Repo | GitHub | Domínio | Deploy |
|------|--------|---------|--------|
| oma-project-site | `1manarmyproject-del/onemanarmyproject` | `onemanarmyproject.com.br` | git push main + vercel |
| oma-academy | `cwfrdpx-del/oma-academy` | `academy.onemanarmyproject.com.br` | git push main |
| oma-hub | `cwfrdpx-del/oma-hub` | `hub.onemanarmyproject.com.br` | **Manual apenas** |
| oma-ia-insights | `/Users/georgejetson/oma-ia-insights-sandbox` | `insights.onemanarmyproject.com.br` | rsync → Hetzner + pm2 restart |

**Regra crítica do Hub:** nunca fazer push automático.
**Regra crítica do Insights:** alterações sempre via rsync do Mac Mini para o Hetzner.

---

## Caminhos Locais (Mac Mini georgejetson)

```
~/oma-project-site/              → site público (fonte de verdade para deploy)
~/oma-site/                      → cópia de trabalho
~/oma-academy/                   → academy + checkout
~/oma-hub/                       → hub + painéis internos
~/oma-ia-insights-sandbox/       → OMA IA Insights (frontend + backend + engine)
~/nanoclaw/                      → NanoClaw — agentes, portal, webhooks
```

---

## OMA Ideias — Produto (NOVO — 12/04/2026)

### URLs
- **Landing:** `https://api.onemanarmyproject.com.br/oma-ideias/`
- **Página do cliente:** `https://api.onemanarmyproject.com.br/oma-ideias/start`
- **API:** `https://api.onemanarmyproject.com.br/ideias-api/`
- **Arquivos estáticos:** `/opt/oma-ideias-sandbox/public/`

### Infraestrutura (100% Hetzner)
- **Backend:** `/opt/oma-ideias/src/server.js` — PM2 `oma-ideias` (id 4), porta 3095
- **Banco:** `/opt/oma-ideias/oma-ideias.db` (SQLite)
- **PDFs gerados:** `/opt/oma-ideias/pdfs/{case_id}/`
- **Puppeteer + Chromium:** `/snap/bin/chromium`
- **ENV:** `/opt/oma-ideias/.env` (ANTHROPIC_AGENTS_KEY)
- **PDF generator:** `/opt/oma-ideias/src/pdf-generator.js`

### Agent Manager (NOVO)
- **URL pública:** `https://agents.onemanarmyproject.com.br/run`
- **URL interna:** `http://localhost:3097/run`
- **PM2:** `oma-agent-manager` (id 8), porta 3097
- **Código:** `/opt/oma-agent-manager/server.js`
- **Chave de serviço:** `oma-agent-manager-2026-e0bd41acabd76eeb`
- **CLAUDE.md dos agentes:** `/opt/oma-agent-manager/agents/{agent_id}/CLAUDE.md`
- **5 agentes:** oma-market, oma-competition, oma-product, oma-experience, oma-stack
- **Autenticação:** `Authorization: Bearer {AGENT_MANAGER_KEY}`

### Preço
- **Lançamento:** R$349,90
- **Preço cheio:** R$699,00
- **Parcelamento:** 2x no cartão (R$174,95/parcela — webhook detecta parcela 1)

### Fluxo do produto
```
Landing → CTA → /start (sem case_id)
→ Intake (texto ou áudio)
→ POST /cases/text-intake → cria case
→ Processing — briefing gerado (~25s)
→ Confirmação — cliente revisa e confirma
→ 5 agentes via Agent Manager em paralelo (~60-90s)
→ Consolidação — blueprint + score + SWOT + Porter + Jornada + Stack + Roadmap checklist
→ Delivered → 7 PDFs gerados automaticamente (~40s)
→ Tela de entrega: Resumo | Documentos | Continuidade
→ Downloads: .MD e .JSON disponíveis
```

### Entregáveis por case
- 9 deliverables consolidados
- 7 PDFs documentais (01-resumo com SWOT, 02-mercado, 03-concorrência com Porter 5 forças, 04-produto, 05-experiência com jornada visual, 06-stack com diagrama, 07-roadmap checklist)
- Fit Score (0-100) + label + rationale
- Tamanho de mercado + rationale
- blueprint.md (para uso em LLMs)
- blueprint.json (para build técnico)

### Webhook ASAAS → OMA Ideias
Implementado em dois lugares:
1. **oma-clients-api** (`/opt/oma-clients/server.js`) — detecta valor, cria case, envia email
2. **NanoClaw** (`~/nanoclaw/src/whatsapp/runner.ts`) — registra produto no portal do cliente

---

## Portal do Cliente

- **URL:** `https://onemanarmyproject.com.br/portal`
- **Frontend:** `~/oma-project-site/portal.html` (Vercel)
- **Backend:** `localhost:3000` no Mac Mini via NanoClaw (`src/whatsapp/runner.ts`)
- **Exposição:** Cloudflare Tunnel → `https://alexa.pipeeyewear.com.br`
- **Auth:** Magic Link por email → token 7 dias
- **Banco:** `~/nanoclaw/store/predictions.db` (tabelas: portal_clients, portal_products, portal_tokens)
- **Card OMA Ideias:** ícone 📐, `product_type: 'ideias'`, link para `?case_id=X`, score badge
- **ICONS mapa:** `{predictions:'🔮', scribe:'🎙️', recap:'📊', agentes:'🤖', ideias:'📐'}`

---

## DNS — Cloudflare

**Zone ID:** `2240ff4dfe6bf27d55a5977343271ff3`

| Tipo | Nome | Destino | Proxy |
|------|------|---------|-------|
| A | `onemanarmyproject.com.br` | `216.198.79.1` | ✅ |
| CNAME | `www` | Vercel | ✅ |
| A | `api` | `204.168.168.61` (Hetzner) | ✅ |
| A | `insights` | `204.168.168.61` (Hetzner) | ❌ |
| A | `agents` | `204.168.168.61` (Hetzner) | ❌ | ← NOVO
| CNAME | `academy` | Vercel | ✅ |
| CNAME | `hub` | Vercel | ✅ |

---

## Deploy

```bash
# Site público — load .env primeiro
cd ~/oma-project-site
set -a && source .env && set +a   # carrega VERCEL_TOKEN, VERCEL_ORG
git add -A && git commit -m "msg" && git push origin main
npx vercel --prod --yes --token "$VERCEL_TOKEN"

# IA Insights (frontend)
rsync -az ~/oma-ia-insights-sandbox/src/frontend/index.html root@204.168.168.61:/opt/oma-ia-insights/src/frontend/index.html && ssh root@204.168.168.61 "pm2 restart oma-ia-insights"

# OMA Ideias (editar direto no Hetzner via python patches ou scp)
ssh root@204.168.168.61 "pm2 restart oma-ideias"

# NanoClaw (após editar runner.ts ou qualquer src/)
cd ~/nanoclaw && npm run build && launchctl kickstart -k gui/$(id -u)/com.nanoclaw
```

---

## Regras Críticas

1. **Commit antes de deploy** — sempre
2. **oma-hub deploy manual** — nunca automático
3. **academy.html e oma-checkout.js** — não mexer sem ler o código
4. **DNS via CF_DNS_TOKEN** — qualquer alteração DNS
5. **Insights via rsync** — nunca editar diretamente no Hetzner
6. **Nav do Insights é hardcoded escuro** — independente da paleta da página
7. **OMA Ideias — 100% Hetzner** — Mac Mini não participa da produção
8. **Agent Manager chave de serviço** — `oma-agent-manager-2026-e0bd41acabd76eeb`

---

*Última atualização: 13/04/2026 — sessão OMA Ideias completa*

---

## Checkout OMA Ideias — Modelo Nativo (13/04/2026)

### Princípio
O checkout OMA Ideias segue o mesmo padrão do OMA Scribe: **100% dentro da experiência OMA**, sem redirecionar para o ASAAS em momento algum. O cliente paga sem sair da página.

### Componentes

**Frontend — `/opt/oma-ideias-sandbox/public/index.html`**

Variáveis de controle:
```js
var MODO_TESTE = true;  // false = produção R$349,90 | true = teste R$5
```

Fluxo do modal `.ck-overlay`:
1. Botão CTA → `openCheckout()` → modal abre com título e preço dinâmicos
2. Step 1 (dados): Nome + Email + CPF + WhatsApp → `ckContinuar()`
3. Step 2 (pagamento): tabs PIX / Cartão
   - **PIX**: `ckGerarPix()` → `POST /ideias/checkout/pix` → QR Code real → polling 3s → confirma
   - **Cartão**: `ckPagarCard()` → `POST /ideias/checkout/card` → aprovação imediata
4. Tela de sucesso → redirect automático após 2s para `start?email=X`

**Backend — `/opt/oma-clients/server.js`**

Rotas expostas (publicPaths):
```
POST /ideias/checkout/pix    → cria customer ASAAS + cobrança PIX + retorna QR Code
POST /ideias/checkout/card   → cria customer ASAAS + pagamento cartão direto
GET  /ideias/checkout/status/:paymentId → polling de confirmação (confirmed: true/false)
```

Lógica interna:
- `getOrCreateAsaasCustomer()` — busca cliente por email no ASAAS, cria se não existir
- Após aprovar pagamento → chama `POST /internal/authorize-email` no oma-ideias
- Valores: `IDEIAS_VALUE_PROD = 349.90` | `IDEIAS_VALUE_TESTE = 5.00`

**Backend — `/opt/oma-ideias/src/server.js`**

Rotas internas:
```
POST /internal/authorize-email   → grava email na tabela authorized_emails (chave protegida)
GET  /api/v1/auth/check?email=X  → verifica se email está autorizado + retorna case_id se existir
```

Tabela: `authorized_emails` em `/opt/oma-ideias/oma-ideias.db`
```sql
email, customer_name, payment_id, paid_at, case_id, modo_teste
```

**Frontend — `/opt/oma-ideias-sandbox/public/start.html`**

Parâmetro `?email=X` no init():
- Se email autorizado + sem case → intake com email pré-preenchido
- Se email autorizado + com case → vai direto para o case
- Se não autorizado → intake normal (sem restrição)

### Fluxo completo pós-pagamento

```
1. Cliente paga (PIX confirmado ou cartão aprovado)
2. Frontend detecta confirmação → mostra tela de sucesso
3. Após 2s → redireciona para start?email=X
4. start.html chama GET /api/v1/auth/check?email=X
5. Resposta: authorized=true, case_id=null (ainda sem case)
6. Cliente digita a ideia → POST /cases/text-intake com email pré-preenchido
7. Case criado → fluxo normal (briefing → agentes → blueprint)

Alternativo (via webhook ASAAS):
1. ASAAS confirma pagamento → webhook chama POST /ideias/checkout do oma-clients
2. oma-clients chama POST /internal/authorize-email no oma-ideias
3. Email registrado na tabela authorized_emails
4. Email enviado para cliente com link start?email=X
```

### Ativar produção

Para ativar R$349,90 (desligar modo teste):
1. `/opt/oma-ideias-sandbox/public/index.html` linha ~1291: `var MODO_TESTE = false;`
2. Verificar que webhook ASAAS em `/opt/oma-clients/server.js` detecta `value >= 349 && value <= 350`

### Links ASAAS criados via API (13/04/2026)
- Teste R$5: `https://www.asaas.com/c/xnx6pyj2zo2gr004`
- PIX R$349,90: `https://www.asaas.com/c/u5w9jrhdc20azcsp`
- Cartão R$349,90: `https://www.asaas.com/c/ifc2rr706g9fbs2m`
(Links de backup — não usados no checkout nativo, apenas como fallback)

---

## OMA Ideias — Fixes de UX (13/04/2026)

### 1. Áudio — transcrição na textarea
- **Antes:** parava a gravação → enviava direto para `audio-intake` sem mostrar o texto
- **Depois:** para → chama `POST /api/v1/transcribe` (Groq Whisper) → exibe na textarea → cliente revisa → clica enviar
- Fallback: se `/transcribe` falhar, envia via `audio-intake` direto (comportamento anterior)
- Endpoint novo: `POST /api/v1/transcribe` em `/opt/oma-ideias/src/server.js`

### 2. Confirmação do briefing — hint de UX
- Botão "Confirmar e iniciar análise" fica disabled até selecionar opção
- Adicionado hint abaixo: `"↑ Selecione uma opção acima para continuar"` (Space Mono, laranja suave)
- Hint desaparece (`opacity: 0`) quando cliente seleciona uma opção via `selectConf()`

### 3. Consolidação → auto-advance
- Poll acelerado para 1.5s quando `status === in_consolidation`
- Quando `delivered` detectado: `loadDeliveryScreen()` chamado automaticamente
- Sem necessidade de clique — transição automática

### 4. Botão "Quero validar com OMA Predictions"
- **Antes:** `href="#"` — levava ao topo da página
- **Depois:** `href="https://insights.onemanarmyproject.com.br/?utm_source=ideias&case_id=X"`
- Abre em `target="_blank"`, preenchido dinamicamente no `loadDeliveryScreen()`

---

## Segurança nos Checkouts — Padrão OMA (13/04/2026)

### Padrão implementado em todos os produtos com checkout

Todos os checkouts OMA exibem um rodapé de segurança com 4 elementos:

```
🔒 SSL Seguro   [PCI DSS] Nível 1   Cobrança por ASAAS (link)   Dados não armazenados pelo OMA
```

**Estilo:** `Space Mono`, 8-9px, uppercase, discreto. Cores: laranja `rgba(200,88,32,...)` para destaques, cinza/bone para texto. Borda superior separadora.

### Por produto

**OMA Ideias** (`/opt/oma-ideias-sandbox/public/index.html`)
- **Camada 1:** Rodapé do modal de checkout (`.ck-overlay`) — aparece em todas as etapas
- **Camada 2:** Abaixo do CTA na landing, após "Texto ou áudio. Sem briefing complexo." — linha com ícone de cadeado SVG + "Pagamento seguro via ASAAS · PCI DSS · Dados criptografados"

**OMA Scribe** (`/Users/georgejetson/oma-project-site/scribe.html`)
- Rodapé do modal `.co-security` — mesmo padrão 4 elementos
- Fundo escuro (tema Scribe): cores `rgba(228,221,211,...)` e `rgba(200,88,32,...)`

**OMA Predictions / demais produtos** (`/Users/georgejetson/oma-project-site/oma-checkout.js`)
- Componente compartilhado `.oma-co-sec` — mesmo padrão 4 elementos
- Aplica-se a: Predictions, ROI, e qualquer produto que use `oma-checkout.js`

### Por que ASAAS
- Processador oficial de todos os pagamentos OMA
- Certificação PCI DSS Nível 1 (mais alto nível)
- O OMA não armazena dados de cartão — processamento 100% via ASAAS
- Link sempre aponta para `https://www.asaas.com` com `target="_blank" rel="noopener"`
