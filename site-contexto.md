# OMA Site — Documento de Contexto
> Versão: abril/2026 — atualizado pós-sessão IA Insights | Para carregar em qualquer sessão de desenvolvimento

---

## Arquitetura Geral

O frontend OMA está em **3 repositórios independentes**, cada um com seu próprio projeto Vercel.

```
onemanarmyproject.com.br         → oma-project-site  (site público — repo ativo)
academy.onemanarmyproject.com.br → oma-academy
hub.onemanarmyproject.com.br     → oma-hub
insights.onemanarmyproject.com.br → Hetzner :3093 (PM2 oma-ia-insights)
```

---

## Mapa de Repositórios

| Repo | GitHub | Domínio | Deploy |
|------|--------|---------|--------|
| oma-project-site | `1manarmyproject-del/onemanarmyproject` | `onemanarmyproject.com.br` | Push no main + vercel |
| oma-academy | `cwfrdpx-del/oma-academy` | `academy.onemanarmyproject.com.br` | Push no main |
| oma-hub | `cwfrdpx-del/oma-hub` | `hub.onemanarmyproject.com.br` | **Manual apenas** |
| oma-ia-insights | `/Users/georgejetson/oma-ia-insights-sandbox` | `insights.onemanarmyproject.com.br` | rsync → Hetzner + pm2 restart |

**Regra crítica do Hub:** nunca fazer push automático. Deploy sempre via comando explícito.
**Regra crítica do Insights:** alterações sempre via rsync do Mac Mini para o Hetzner.

---

## Caminhos Locais (Mac Mini georgejetson)

```
~/oma-project-site/   → site público (fonte de verdade para deploy)
~/oma-site/           → cópia de trabalho (editar aqui, copiar para oma-project-site)
~/oma-academy/        → academy + checkout
~/oma-hub/            → hub + painéis internos
~/oma-ia-insights-sandbox/  → OMA IA Insights (frontend + backend + engine)
```

---

## Deploy

```bash
# Site público
cd ~/oma-project-site && git add -A && git commit -m "msg" && git push origin main
npx vercel --prod --yes --token "vcp_****************************VERCEL_TOKEN_NO_ENV****" --scope 1manarmyproject-6412s-projects

# IA Insights (frontend)
rsync -az ~/oma-ia-insights-sandbox/src/frontend/index.html root@204.168.168.61:/opt/oma-ia-insights/src/frontend/index.html && ssh root@204.168.168.61 "pm2 restart oma-ia-insights"

# IA Insights (backend completo)
rsync -az --exclude='node_modules' --exclude='logs' --exclude='dist' ~/oma-ia-insights-sandbox/src/ root@204.168.168.61:/opt/oma-ia-insights/src/ && ssh root@204.168.168.61 "pm2 restart oma-ia-insights"
```

---

## DNS — Cloudflare

**Zone ID:** `2240ff4dfe6bf27d55a5977343271ff3`
**Token DNS:** `CF_DNS_TOKEN` no `.env` do NanoClaw

| Tipo | Nome | Destino | Proxy |
|------|------|---------|-------|
| A | `onemanarmyproject.com.br` | `216.198.79.1` | ✅ |
| CNAME | `www` | `ba97a2bdb9694111.vercel-dns-017.com` | ✅ |
| A | `api` | `204.168.168.61` (Hetzner) | ✅ |
| A | `insights` | `204.168.168.61` (Hetzner) | ❌ (direto) |
| CNAME | `academy` | `cname.vercel-dns.com` | ✅ |
| CNAME | `hub` | `cname.vercel-dns.com` | ✅ |

---

## Botão IA Insights no Nav

Adicionado em todas as páginas do site público (sessão abril/2026):
- `index.html` ✅
- `index-v2.html` ✅
- `agentes.html` ✅
- `solutions.html` ✅

**CSS padrão do badge:**
```css
.nav-insights {
  font-family: 'Space Mono', monospace;
  font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
  color: #e8703a; border: 1px solid rgba(232,112,58,.4);
  padding: 6px 12px; text-decoration: none; transition: all .2s;
}
.nav-insights:hover { background: rgba(232,112,58,.1); }
```

---

## OMA IA Insights — Design System Completo

### URLs
- **Produção:** `https://insights.onemanarmyproject.com.br`
- **Legacy:** `https://api.onemanarmyproject.com.br/ia-insights/`
- **Health:** `https://api.onemanarmyproject.com.br/ia-insights/health`

### Infraestrutura
- **Hetzner:** `root@204.168.168.61`, porta `3093`, PM2 `oma-ia-insights` (id 3)
- **Nginx:** `/etc/nginx/sites-enabled/oma-api`
- **Logs:** `/opt/oma-ia-insights/logs/interactions-YYYY-MM-DD.jsonl`
- **ENV:** `/opt/oma-ia-insights/.env` (ANTHROPIC_API_KEY, GROQ_API_KEY, PERPLEXITY_API_KEY)

### Paleta de Cores (tema creme — padrão atual)
```css
:root {
  --fire:   #c85820;   /* laranja OMA — ajustado para contraste no creme */
  --ember:  #a04010;
  --char:   #f5f0e8;   /* fundo base: creme quente */
  --coal:   #ede8df;   /* fundo cards */
  --iron:   #e8e2d8;   /* input box */
  --steel:  #cec8be;   /* bordas */
  --ash:    #7a7068;   /* texto desabilitado */
  --fog:    #5a5048;   /* texto secundário */
  --bone:   #2a2018;   /* texto principal: carvão quente */
  --white:  #1a1008;   /* texto máximo */
  --b1:     #ddd8ce;
  --b2:     #c8c2b8;
  --b3:     #b8b2a8;
}
```

**Nota:** o NAV usa cores hardcoded escuras independentes da paleta creme:
```css
nav { background: rgba(8,8,8,.96); }
.nav-links a { color: #999; }
.nav-logo { color: #e4ddd3; }
```

### Tipografia
| Uso | Fonte | Peso | Tamanho |
|-----|-------|------|---------|
| Headlines hero | Playfair Display | 900 | 72-96px |
| Labels/botões | Barlow Condensed | 900 | 10-13px |
| Corpo | Barlow | 300-400 | 14-17px |
| Mono/labels técnicos | Space Mono | 400 | 9-11px |

### Layout Principal
```
Grid: 1fr 220px (input col + preview col)
Max-width: 1280px
Padding: 0 48px
Breakpoint: 900px → 1fr (preview some)
```

### Componentes Chave

**Caixa de input:**
```css
.input-box {
  background: var(--iron);
  border: 1px solid rgba(255,255,255,.13);
  border-top: 3px solid var(--fire);  /* detalhe laranja no topo */
}
textarea { min-height: 224px; font-size: 17px; }
```

**Botão Perguntar (estado ativo):**
```css
background: #e8521a; color: #080808;
font-family: 'Barlow Condensed'; font-weight: 900;
letter-spacing: .12em; text-transform: uppercase;
padding: 12px 32px; border: none;
```

**Chips de exemplo:**
```css
.chip { font-size: 13px; font-weight: 300; color: rgba(42,32,24,.5); border: 1px solid rgba(42,32,24,.18); }
.chip-px { border-color: rgba(200,88,32,.25); }  /* chips que disparam Perplexity */
.chip-px::before { content: '⚡ '; }
```

**Preview card (índice lateral):**
```css
.pv-card { border-left: 2px solid rgba(200,88,32,.25); background: transparent; }
/* Blocos como linhas compactas — sem texto descritivo, só título + bullet */
```

**Botões de exportação (fim da resposta):**
```css
.btn-export { border: 1px solid var(--steel); font-family: 'Barlow Condensed'; font-size: 12px; font-weight: 700; letter-spacing: .12em; padding: 8px 16px; }
/* WhatsApp → wa.me/?text=... */
/* Email → clipboard copy com feedback visual "✓ Copiado!" */
```

### Motor (Backend)
```
Classificador → intent_primary + theme_primary + maturity_level
Router → route_type: oma_only | oma_plus_external | short_response | guardrail_exit
Composer → Claude Haiku 4.5 + Perplexity sonar (quando oma_plus_external)
```

**Quando Perplexity é chamado:**
- Tema `llm` ou `custos` + qualquer intenção
- Tema `stack` + intenção `practical/exploratory` + maturidade `intermediate/advanced`
- Custo médio: ~$0.007/query com Perplexity, ~$0.001 sem

**Chips que garantem Perplexity:**
- "⚡ Qual a diferença entre GPT-4, Claude e Gemini para atendimento?"
- "⚡ Quanto custa rodar um agente de IA por mês na prática?"

### API Endpoints
```
POST /v1/session         → cria sessão
POST /v1/query           → query principal
POST /v1/feedback        → thumbs up/down
POST /v1/cta-events      → rastreia cliques no CTA
POST /v1/audio/transcribe → Groq Whisper
```

---

## Próximos Passos Planejados

1. **Revisão paleta creme no site inteiro** — página por página, sandbox primeiro
2. **Link IA Insights no nav** — agent-*.html (páginas individuais dos agentes)
3. **Curadoria FAQs das verticais** — advocacia, clínica, ótica, condomínio, distribuidora
4. **Subdomínio próprio insights.*** — ✅ já feito

---

## NanoClaw — Regras de Build

**save-server (webchat da Bia):**
- Arquivo: `~/nanoclaw/src/save-server.js` (contém TypeScript apesar da extensão .js)
- Compilado para: `~/nanoclaw/dist/save-server.js`
- Launchctl usa: `dist/save-server.js` — **nunca** `src/save-server.js` diretamente
- Após qualquer edição: `cd ~/nanoclaw && npm run build`
- Reiniciar: `launchctl kickstart -k gui/$(id -u)/com.nanoclaw.save-server`
- Verificar: `curl http://localhost:3104/health`

Se o save-server cair (Bia não responde no webchat):
1. `tail -20 ~/nanoclaw/logs/save-server.error.log` — ver o erro
2. Se `SyntaxError` → esqueceram de buildar antes de reiniciar
3. Se `require is not defined` → versão antiga sem build no dist
4. Fix: `npm run build && launchctl kickstart -k gui/$(id -u)/com.nanoclaw.save-server`

---

## Regras Críticas

1. **Commit antes de deploy** — sempre
2. **oma-hub deploy manual** — nunca automático
3. **academy.html e oma-checkout.js** — não mexer sem ler o código
4. **DNS via CF_DNS_TOKEN** — qualquer alteração DNS
5. **Insights via rsync** — nunca editar diretamente no Hetzner
6. **Nav do Insights é hardcoded escuro** — independente da paleta da página

---

*Atualizado em abril/2026 — sessão OMA IA Insights (design, motor, deploy, URL, paleta creme)*
