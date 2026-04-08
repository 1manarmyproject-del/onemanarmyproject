# OMA Hub — Documento de Contexto
> Versão: abril/2026 | Para carregar em qualquer sessão de desenvolvimento

---

## Arquitetura Geral

O Hub (`/hub`) é um painel interno de operações do OMA Project. Funciona como um shell com iframes — cada aba carrega um arquivo HTML separado dentro de um `<iframe>`.

**Auth:** Login via `/auth` (JWT Bearer). Token salvo em `localStorage['oma_hub_token']` com expiração em `oma_hub_token_exp`. O Hub injeta o token nos iframes via `postMessage({type:'oma_auth', token: JWT})` no `onload` do iframe.

**Regra de ouro:** NUNCA usar `localStorage` como banco de dados. Todo dado persistente vai para o Hetzner via API ou para o NanoClaw via `alexa.pipeeyewear.com.br`.

---

## Mapa de Painéis

| Painel | Tab ID | Arquivo | API / Fonte de dados | Persistência |
|--------|--------|---------|----------------------|--------------|
| Status | status | inline (hub.html) | `/health`, `/pmo/agent/*` | Hetzner SQLite |
| Agent Squad | squad | agent-squad.html | `/pmo` (cards kanban) | Hetzner `pmo_cards` |
| Monitor | monitor | monitor.html | Local (renderList) | NanoClaw Mac Mini |
| CRM | crm | crm.html | `/leads` | Hetzner `leads` |
| MKT Board | mkt | mkt-board.html | `/mkt/cards` | Hetzner `mkt_cards` |
| MKT Jobs | mktjobs | mkt-jobs.html | `/mkt/jobs` | Hetzner `mkt_jobs` |
| MKT Insights | mktinsights | mkt-insights.html | `/mkt/insights` | Hetzner (calculado) |
| Onboarding | onboarding | onboarding.html | `/clientes`, `/onboarding/*` | Hetzner `clientes` + `onboarding_sessions` |
| Clientes | clientes | clientes.html | `/clientes` | Hetzner `clientes` |
| Suporte | suporte | agent-suporte.html | `/suporte/stats`, `/webchat/pending` | Hetzner `webchat_*` |
| Produtos | produtos | produtos.html | `/produtos`, `/acoes` | Hetzner `produtos` + `acoes` |
| Financeiro | financeiro | financeiro.html | Local | — |
| War Room | warroom | war-room.html | `/pmo`, `/mkt/cards` | Hetzner |
| OPS | ops | ops.html | `alexa.pipeeyewear.com.br/api/ops/*` | NanoClaw Mac Mini |
| Auditoria | audit | audit.html | `/audit-data.json` | Arquivo estático Vercel |
| Traffic | traffic | traffic.html | Local | — |
| Segurança | seguranca | inline (hub.html) | `/auth/change-password` | Hetzner |

---

## Infraestrutura

### Backend Hetzner (204.168.168.61)
- **API:** `api.onemanarmyproject.com.br` → porta 3000
- **PM2:** `oma-clients-api`
- **Banco:** `/opt/oma-clients/oma.db` (SQLite)
- **Backup:** `/opt/oma-clients/oma.db.bak.*`
- **Senha Hub:** `7CzNjGlqTuEw4MKC`
- **SSH:** `ssh -i ~/.ssh/id_ed25519 root@204.168.168.61` (chave george@nanoclaw)
- **Backups do server.js:** `/opt/oma-clients/server.js.bak.YYYYMMDDHHMM` — sempre criar antes de editar

### NanoClaw Mac Mini (georgejetson / 100.84.26.16)
- **URL pública:** `alexa.pipeeyewear.com.br`
- **Endpoints OPS:** `/api/ops/system`, `/api/ops/mentor`, `/api/ops/skills`, `/api/ops/hub-contexto`, `/api/ops/nanoclaw-contexto`
- **Skills:** `/Users/georgejetson/nanoclaw/skills/` (67 arquivos .md)
- **Banco:** `/Users/georgejetson/nanoclaw/store/messages.db`

### Frontend Vercel
- **Domínio:** `onemanarmyproject.com.br`
- **GitHub:** `1manarmyproject-del/onemanarmyproject`
- **Deploy:** `npx vercel --prod --yes --token <token>`
- **Token Vercel:** `<VERCEL_TOKEN>`

---

## Padrão de Auth nos Iframes

Todo iframe deve ter **exatamente uma vez** no início do primeiro `<script>`:

```javascript
function getToken(){var t=localStorage.getItem('oma_hub_token')||sessionStorage.getItem('oma_hub_token');var e=parseInt(localStorage.getItem('oma_hub_token_exp')||'0');if(!t||Date.now()>e)return null;return t;}
function getAuthHeaders(){var t=getToken();return t?{'Authorization':'Bearer '+t,'Content-Type':'application/json'}:{'Content-Type':'application/json'};}
function _omaShow(){['ls','login-screen'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display='none';});['app','main'].forEach(function(id){var el=document.getElementById(id);if(el){el.style.display='block';}});}
function _omaLoad(){_omaShow();if(typeof init==='function')init();else if(typeof load==='function')load();}
window.addEventListener('message',function(e){if(!e.data||e.data.type!=='oma_auth')return;var tok=e.data.token||e.data.oma_api_key||'';if(tok){localStorage.setItem('oma_hub_token',tok);localStorage.setItem('oma_hub_token_exp',String(Date.now()+28800000));}  _omaLoad();});
document.addEventListener('DOMContentLoaded',function(){if(getToken())_omaLoad();});
```

**Regras:**
- Nunca usar `OMA_TOKEN_KEY` (variável só existe no hub.html)
- Nunca usar `x-api-key: KEY` — sempre `getAuthHeaders()`
- Nunca usar `alexa.pipeeyewear.com.br` como API de dados (exceto OPS/Mentor/Skills/hub-contexto que são do NanoClaw)
- A função de carga deve se chamar `init()` ou ter um alias `function init(){load();}`

---

## URLs de API

| Endpoint | Fonte | Auth | Uso |
|----------|-------|------|-----|
| `https://api.onemanarmyproject.com.br` | Hetzner | JWT Bearer | Todos os dados do negócio |
| `https://alexa.pipeeyewear.com.br` | NanoClaw | Pública | OPS, Mentor, Skills, hub-contexto, nanoclaw-contexto |
| `https://webchat.pipeeyewear.com.br` | NanoClaw | Pública | Webchat Sara/Bia |
| `https://mcp.pipeeyewear.com.br` | NanoClaw | Pública | MCP server |

---

## Tabelas do Banco (Hetzner oma.db)

```
clientes          — carteira de clientes OMA
leads             — pipeline CRM
crm_regua         — régua de follow-up dos leads (FK: lead_id → leads.id)
events            — timeline de eventos por lead (lead_id sem FK formal)
pmo_cards         — kanban Agent Squad (FK: client_id → clientes.id, agent_id → agentes.id)
agentes           — agentes por cliente (FK: client_id → clientes.id)
agent_usage       — uso de tokens por agente/cliente
onboarding_sessions — onboarding de clientes (client_id sem FK formal)
priority_map_results — resultados Priority Map (client_id sem FK formal)
mkt_cards         — cards MKT Board
mkt_jobs          — jobs MKT
produtos          — catálogo de produtos (seed: 10 produtos)
acoes             — ações comerciais
scribe_instances  — usuários Scribe (phone único)
scribe_leads      — leads específicos do Scribe (phone único)
webchat_sessions  — sessões Sara/Bia
webchat_messages  — mensagens webchat
academy_users     — usuários Academy
roi_sessions      — sessões ROI Calculator
roadmap_results   — resultados Roadmap
workspaces        — workspaces CRM
```

### Foreign Keys ativas (better-sqlite3 habilita enforcement por padrão)
- `crm_regua.lead_id` → `leads.id` — DELETE em leads requer limpar crm_regua primeiro
- `agentes.client_id` → `clientes.id` — DELETE em clientes requer limpar agentes primeiro
- `pmo_cards.client_id` → `clientes.id` — DELETE em clientes requer limpar pmo_cards primeiro
- `pmo_cards.agent_id` → `agentes.id` — DELETE em agentes requer limpar pmo_cards primeiro

**⚠️ ATENÇÃO:** `agent_integracoes` NÃO tem coluna `client_id` — nunca incluir em DELETEs por client_id.

---

## Regras de Negócio Críticas

### Todo comprador de produto (free ou pago) vai para clientes E leads
- Fluxo `POST /scribe/signup` grava em: `scribe_instances` → `scribe_leads` → `clientes` → **`leads`**
- Webhook Asaas pagamento grava em: `scribe_instances` → `scribe_leads` → `clientes` → **`leads`**
- Se leads estiver faltando entrada, inserir manualmente com `status='cliente'` e `origem='scribe-free'` ou `'scribe-<plano>'`

---

## Problemas Conhecidos / Histórico

### Sessão 08/04/2026 — Correções múltiplas

**Backup HD Externo (messages.db.bak)**
- **Causa:** HD ExFAT não permite criar arquivo novo via `sqlite3 .backup` ou `cp` direto
- **Fix em:** `scripts/backup.sh` — rota via `/tmp`: `cp db /tmp/messages.db.bak && cp /tmp/... $HD && rm /tmp/...`

**Oracle SP aparecia como offline no backup-status.json**
- **Causa:** JSON era gerado antes da Camada 4 executar, com `ORACLE_STATUS="offline"` hardcoded
- **Fix em:** `scripts/backup.sh` — variáveis inicializadas antes das camadas, JSON gerado **após** Camadas 4 e 5. Hetzner agora tem `HETZNER_STATUS` próprio.

**Botão download hub-contexto.md no painel Status**
- Adicionado botão no topo do painel Status (hub.html)
- Endpoint criado em NanoClaw: `GET /api/ops/hub-contexto` — serve o arquivo com `Content-Disposition: attachment`
- Localização do arquivo servido: `~/oma-project-site/hub-contexto.md`

**Botão contexto ops.html abrindo página em vez de baixar**
- **Causa:** URL antiga `/hub/contexto` (inexistente) + `a.target='_blank'` impedindo download
- **Fix em:** `ops.html` — URL trocada para `/api/ops/hub-contexto`, substituído por `fetch + Blob`

**CRM: delete não persistia (erro 500)**
- **Causa 1:** `apiGet`/`apiPost` usavam `x-api-key` (padrão antigo) → retornava 401 silencioso
- **Causa 2:** `dL2()` usava ID local (`Date.now()`) em vez do `_apiId` do Hetzner
- **Causa 3:** `crm_regua` tem FK para `leads` — DELETE simples quebrava com FOREIGN KEY constraint
- **Fix em:** `crm.html` — todos os fetches trocados para `getAuthHeaders()`. `dL2()` usa `_apiId||l.id` com await
- **Fix em:** `server.js` Hetzner — `DELETE /leads/:id` agora usa transaction: `crm_regua` → `events` → `leads`

**Agent Squad: cards sumindo**
- **Causa:** Todos os fetches usavam `x-api-key: PMO_KEY` → 401 silencioso, caía no fallback `/pmo-data.json` (inexistente)
- **Fix em:** `agent-squad.html` — todos substituídos por `getAuthHeaders()`, `PMO_HDR` removido

**Aba Clientes: delete com erro 500**
- **Causa:** `agentes` e `pmo_cards` têm FK para `clientes(id)` — DELETE direto quebrava
- **Fix em:** `server.js` Hetzner — `DELETE /clientes/:id` usa transaction: `pmo_cards` → `agentes` → `onboarding_sessions` → `priority_map_results` → `agent_usage` → `clientes`
- **Descoberta:** `agent_integracoes` NÃO tem `client_id` — removida do transaction

**Scribe Free: usuários não apareciam no CRM**
- **Causa:** `POST /scribe/signup` gravava em `scribe_instances` + `scribe_leads` + `clientes`, mas **não em `leads`**
- **Fix em:** `server.js` Hetzner — adicionado bloco de INSERT em `leads` no signup e no webhook de pagamento
- **Migração:** Daniela Salerno (id 19) e Pedro Costa (id 20) inseridos manualmente em `leads`
- **Nota sobre Pedro Costa:** cadastrou-se duas vezes (`pedro@negocio.com` e `pedro2@negocio.com` / "Pedro Costa 2") — WhatsApp: 11933221100

**⚠️ Armadilha de escapamento em edições no server.js via Python**
- Strings Python com aspas simples não escapam corretamente `''` (duas aspas simples) dentro de queries SQL
- **Regra:** sempre usar aspas duplas na query SQL quando o valor contém aspas simples: `db.prepare("SELECT ... WHERE email!='' ...")`
- Edições via `scp` + `python3 script.py` no Hetzner são mais seguras que heredoc SSH
- Sempre validar sintaxe antes de restart: `node --input-type=module < /opt/oma-clients/server.js 2>&1 | head -5` (erro de módulo é normal, SyntaxError não é)

---

### Sessão 07/04/2026 — Grande recuperação do Hub
- **Root cause:** fixes de regex acumulados apagaram scripts principais dos iframes, deixando só 1.282 chars (bloco AUTH)
- **Sintoma:** API undefined, init undefined, dados somem
- **Diagnóstico:** `new Function(script.textContent)` → SyntaxError ou `scripts.length === 1 && sizes[0] === 1282`
- **Fix:** restaurar do git + injetar AUTH limpo + corrigir URL + alias init

### URLs antigas que causam 401/404
- `alexa.pipeeyewear.com.br` como API de dados → trocar por `api.onemanarmyproject.com.br`
- `oma-api.pipeeyewear.com.br` → trocar por `api.onemanarmyproject.com.br`
- `x-api-key: KEY` onde KEY vem de `oma_api_key` → trocar por `getAuthHeaders()`

### Produtos perdidos
- A tabela `produtos` foi criada zerada em 07/04/2026
- Dados anteriores estavam em localStorage (perdidos)
- 10 produtos recriados via INSERT direto no SQLite
- Usar sempre `INSERT OR IGNORE` com IDs fixos para seed

### CORS
- `api.onemanarmyproject.com.br` precisa estar na lista de origins permitidos do próprio backend
- Lista em `server.js` linha ~18: `const allowed = [...]`
- **Origins permitidas atualmente:** `onemanarmyproject.com.br`, `hub.onemanarmyproject.com.br`, `academy.onemanarmyproject.com.br`, `api.onemanarmyproject.com.br`, `webchat.pipeeyewear.com.br`, `alexa.pipeeyewear.com.br`, `mcp.pipeeyewear.com.br`, localhost:3000/3001/5173
- ⚠️ Ao adicionar novo subdomínio, sempre adicionar à lista de CORS antes de testar

---

## Checklist de Deploy

1. `cd /Users/georgejetson/oma-project-site`
2. Valida sintaxe JS crítica antes: `node --input-type=module < server.js 2>&1 | head -3` (no Hetzner)
3. `npx vercel --prod --yes --token <token>`
4. Verifica no browser com hard reload (Cmd+Shift+R)

## Checklist de Edição no server.js (Hetzner)

1. Criar backup: `cp server.js server.js.bak.$(date +%Y%m%d%H%M)`
2. Criar script Python local, enviar via `scp`, executar remotamente
3. Validar sintaxe: `node --input-type=module < /opt/oma-clients/server.js 2>&1 | head -5`
4. Se OK (só erro de módulo, sem SyntaxError): `pm2 restart oma-clients-api`
5. Aguardar 5s e testar: `curl https://api.onemanarmyproject.com.br/health`

---

### Sessão 08/04/2026 (fim) — Endpoints de contexto

**Botão ⬇ CONTEXTO no painel OPS**
- Estava baixando `hub-contexto.md` (errado — contexto técnico do Hub)
- Corrigido para baixar `session-context-latest.md` (contexto geral de sessão para Claude)
- Endpoint novo criado no NanoClaw: `GET /api/ops/nanoclaw-contexto`
  - Serve: `store/users/fabio/context/session-context-latest.md`
  - Nome do arquivo baixado: `nanoclaw-contexto-YYYY-MM-DD.md`
- `ops.html` atualizado — URL e nome do download corrigidos

**Separação final dos botões de contexto:**
| Botão | Painel | Arquivo baixado | Uso |
|-------|--------|----------------|-----|
| ⬇ hub-contexto.md | Status | `hub-contexto.md` | Contexto técnico do Hub para devs |
| ⬇ CONTEXTO | OPS | `nanoclaw-contexto-YYYY-MM-DD.md` | Contexto geral de sessão para abrir nova conversa no Claude |

---

*Atualizado em 08/04/2026 — fim da sessão*
