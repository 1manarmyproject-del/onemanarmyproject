# OMA Site — Documento de Contexto
> Versão: abril/2026 | Para carregar em qualquer sessão de desenvolvimento do site

---

## Arquitetura Geral — Pós-Separação (08/04/2026)

O frontend OMA foi separado em **3 repositórios independentes**, cada um com seu próprio projeto Vercel e deploy isolado. Uma mudança em um não afeta os outros.

```
onemanarmyproject.com.br     → oma-site     (site público)
academy.onemanarmyproject.com.br → oma-academy (produto educacional)
hub.onemanarmyproject.com.br     → oma-hub     (painéis internos)
```

---

## Mapa de Repositórios

| Repo | GitHub | Vercel Project | Domínio | Deploy |
|------|--------|---------------|---------|--------|
| oma-site | `cwfrdpx-del/oma-site` | `oma-site` | `onemanarmyproject.com.br` | Push no main |
| oma-academy | `cwfrdpx-del/oma-academy` | `oma-academy` | `academy.onemanarmyproject.com.br` | Push no main |
| oma-hub | `cwfrdpx-del/oma-hub` | `oma-hub` | `hub.onemanarmyproject.com.br` | **Manual apenas** |

**Regra crítica do Hub:** nunca fazer push automático no `oma-hub`. Deploy sempre via comando explícito na sessão de dev.

---

## Caminhos Locais (Mac Mini georgejetson)

```
~/oma-site/      → site público
~/oma-academy/   → academy + checkout
~/oma-hub/       → hub + painéis internos
~/oma-project-site/  → repo ORIGINAL (ainda ativo — não deletar)
```

---

## Deploy por Repositório

```bash
# oma-site
cd ~/oma-site && git add -A && git commit -m "msg" && git push origin main
npx vercel --prod --yes --token <token> --scope 1manarmyproject-6412s-projects

# oma-academy
cd ~/oma-academy && git add -A && git commit -m "msg" && git push origin main
npx vercel --prod --yes --token <token> --scope 1manarmyproject-6412s-projects

# oma-hub (SEMPRE manual, nunca automático)
cd ~/oma-hub && git add -A && git commit -m "msg" && git push origin main
npx vercel --prod --yes --token <token> --scope 1manarmyproject-6412s-projects
```

**Token Vercel:** variável `VERCEL_TOKEN` no `.env` do NanoClaw

---

## DNS — Cloudflare (onemanarmyproject.com.br)

**Zone ID:** `2240ff4dfe6bf27d55a5977343271ff3`
**Token DNS:** variável `CF_DNS_TOKEN` no `.env` do NanoClaw (permissão `Zone:DNS:Edit`)

### Registros ativos

| Tipo | Nome | Destino | Proxy |
|------|------|---------|-------|
| A | `onemanarmyproject.com.br` | `216.198.79.1` | ✅ |
| CNAME | `www` | `ba97a2bdb9694111.vercel-dns-017.com` | ✅ |
| A | `api` | `204.168.168.61` (Hetzner) | ✅ |
| CNAME | `academy` | `cname.vercel-dns.com` | ✅ |
| CNAME | `hub` | `cname.vercel-dns.com` | ✅ |

### Como criar novo registro DNS via shell
```bash
CF_TOKEN=$(grep CF_DNS_TOKEN /Users/georgejetson/nanoclaw/.env | cut -d= -f2)
ZONE_ID="2240ff4dfe6bf27d55a5977343271ff3"

curl -s -X POST \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -d '{"type":"CNAME","name":"subdominio","content":"cname.vercel-dns.com","proxied":true}'
```

---

## Conteúdo por Repositório

### oma-site (site público)
```
index.html, index-v2.html   — home
solutions.html              — soluções / Hub Solutions
agentes.html                — página pública dos agentes
agent-*.html                — páginas individuais (george, bia, amanda, tiago, flavia, darwin)
links.html                  — bio link
demo.html                   — demonstração
privacidade.html, termos.html
webchat-widget.html
whatsapp-connect.html
blog/                       — 34 posts
manifest.json, sw.js
```

### oma-academy (produto educacional)
```
academy.html                — trilhas, módulos, checkout
academy-login.html          — login
portal.html                 — portal do aluno
roi.html                    — calculadora ROI
roadmap.html                — gerador de roadmap
predictions.html            — Predictions
scribe.html                 — OMA Scribe
onboarding-form.html        — formulário de onboarding
oma-checkout.js             — lógica de checkout (NÃO MEXER sem cuidado)
backup-pre-checkout-*.html  — backups de segurança do checkout
```

### oma-hub (painéis internos)
```
hub.html                    — shell principal com iframes
crm.html, listas.html, clientes.html
ops.html, ops-mentor.html, skills.html
agent-squad.html, agent-suporte.html
mkt-board.html, mkt-jobs.html, mkt-insights.html
onboarding.html, produtos.html, financeiro.html
war-room.html, audit.html, traffic.html
monitor.html, status.html, pmo.html
cadastro-cliente.html
hub-contexto.md             — contexto técnico do Hub
backup-status.json          — status do backup (atualizado a cada backup das 3h)
```

---

## Repo Original (oma-project-site)

O repositório `1manarmyproject-del/onemanarmyproject` **continua ativo** e serve `onemanarmyproject.com.br` enquanto o `oma-site` não for promovido ao domínio principal.

**Regra:** qualquer alteração urgente no site público ainda vai para `~/oma-project-site/` + deploy. A migração completa para `~/oma-site/` como fonte oficial é o próximo passo planejado.

**Não deletar** `~/oma-project-site/` até a migração estar validada.

---

## Redirects do Site Principal

`/academy` e `/academy/*` → `https://academy.onemanarmyproject.com.br`
`/hub` e `/hub/*` → `https://hub.onemanarmyproject.com.br`

Configurados no `vercel.json` do repo original.

---

## Backend Hetzner

- **API:** `https://api.onemanarmyproject.com.br` → `204.168.168.61:3000`
- **PM2:** `oma-clients-api`
- **Banco:** `/opt/oma-clients/oma.db` (SQLite)
- **SSH:** `ssh -i ~/.ssh/id_ed25519 root@204.168.168.61`
- **Backup server.js:** sempre criar `server.js.bak.$(date +%Y%m%d%H%M)` antes de editar
- **Ver hub-contexto.md** para detalhes completos de FKs, auth e histórico de bugs

---

## Regras Críticas

1. **Commit antes de deploy** — sempre. Nunca deploy sem commit.
2. **oma-hub deploy manual** — nunca automático, nunca via push de outro agente
3. **academy.html e oma-checkout.js** — máximo cuidado, não mexer sem ler o código
4. **DNS via token** — usar `CF_DNS_TOKEN` do `.env` para qualquer alteração DNS
5. **Separação de contexto** — alterações no site não vão para o hub e vice-versa
6. **Antes de editar server.js** — ler hub-contexto.md (seção Checklist de Edição)

---

## Histórico de Sessões

### 08/04/2026 — Separação de repositórios
- Criados 3 repos: `cwfrdpx-del/oma-site`, `oma-academy`, `oma-hub`
- Criados 3 projetos Vercel com subdomínios próprios
- Criado token Cloudflare DNS `CF_DNS_TOKEN` com permissão `Zone:DNS:Edit`
- Zone ID `2240ff4dfe6bf27d55a5977343271ff3` salvo no `.env`
- Redirects `/academy` e `/hub` configurados no site principal
- Root cause da instabilidade resolvida: deploys isolados por domínio

---

*Atualizado em 08/04/2026 — sessão de separação de repositórios*

---

### Sessão 08/04/2026 (tarde) — Pós-separação, ajustes

**Problemas encontrados e corrigidos após separação:**

1. **Academy 404** — rotas `/academy/*` hardcoded no HTML não estavam no vercel.json do oma-academy
   - Fix: adicionadas rotas `/academy`, `/academy/login`, `/academy/login/:path*` no vercel.json

2. **Hub Failed to fetch** — `hub.onemanarmyproject.com.br` não estava no CORS do Hetzner
   - Fix: adicionado ao array `allowed` no server.js + pm2 restart

3. **Imagens Academy quebradas** — assets (lobster-logo.png, favicon.png, etc.) não foram copiados na separação
   - Fix: copiados para `~/oma-academy/` e commitados
   - Cache bust adicionado nas referências: `?v=timestamp`

**Lição aprendida para separações futuras:**
Ao criar novo repo a partir de um existente, sempre verificar:
- [ ] Assets (*.png, *.svg, *.ico, *.jpg)
- [ ] Rotas internas hardcoded no HTML (`location.replace`, `href=`)
- [ ] CORS no Hetzner para o novo domínio
- [ ] vercel.json com todas as rotas que o HTML usa

**Pendente para próxima sessão:**
- Token CF com permissão Cache Purge (hoje só tem DNS Edit)
- Fix MKT Board, MKT Jobs e Produtos no oma-hub (auth x-api-key → getAuthHeaders)
