# OMA OS — Sistema Operacional de Execução
> Versão 1.2 · Atualizado: 13/04/2026
> Guardião: Fabio Xavier
> Atualizado por: Claude (sessão OMA Ideias 12–13/04/2026)

---

## REGRA ZERO

Toda sessão que toca em produção começa com três perguntas:
1. O que exatamente vou mudar?
2. O backup está confirmado?
3. Qual é o rollback se der errado?

---

## NÍVEIS DE SESSÃO

| Nível | Quando usar | Brief obrigatório |
|-------|-------------|-------------------|
| 1 — Enxuto | Exploração, análise, conteúdo, sandbox | Objetivo + o que não tocar |
| 2 — Padrão | Novo recurso, integração, nova página | Template completo + staging |
| 3 — Crítico | Produção, Hetzner, DNS, cliente real | Template + checklist + validação manual |

---

## PRODUTOS ATIVOS

### OMA Ideias (LANÇADO 13/04/2026)
- **Produto:** Blueprint de produto com 5 agentes especializados
- **Preço:** R$349,90 lançamento / R$699,00 cheio
- **Pagamento:** PIX ou cartão 2x (R$174,95/parcela)
- **Landing:** `https://api.onemanarmyproject.com.br/oma-ideias/`
- **Entrega:** 9 deliverables + 7 PDFs + .MD + .JSON + Fit Score
- **Custo por case:** ~R$2,55 (99,1% margem bruta)
- **Capacidade atual:** ~15 cases/hora (1 chave Anthropic Tier 2)
- **Status:** ATIVO em produção, 100% Hetzner

### OMA IA Insights
- **URL:** `https://insights.onemanarmyproject.com.br`
- **Status:** ATIVO

### OMA Scribe
- **Status:** ATIVO (Mac Mini, migração Hetzner pendente)

### OMA Predictions
- **Status:** ATIVO

---

## INFRA — ESTADO ATUAL (13/04/2026)

### Hetzner CX22 (204.168.168.61)

| PM2 ID | Nome | Porta | Serviço |
|--------|------|-------|---------|
| 0 | oma-clients-api | 3000 | CRM, portal backend proxy, webhooks ASAAS |
| 3 | oma-ia-insights | 3093 | OMA IA Insights |
| 4 | oma-ideias | 3095 | OMA Ideias — motor completo |
| 7/8 | oma-agent-manager | 3097 | Agent Manager — 5 agentes especializados |

**Nginx rotas principais:**
```
/oma-ideias/          → static /opt/oma-ideias-sandbox/public/index.html
/oma-ideias/start     → static /opt/oma-ideias-sandbox/public/start.html
/ideias-api/          → proxy localhost:3095
/ia-insights          → proxy localhost:3093
/agents.*             → proxy localhost:3097 (subdomínio agents.onemanarmyproject.com.br)
/                     → proxy localhost:3093 (fallback)
```

### Mac Mini (georgejetson — 100.84.26.16 Tailscale)
- NanoClaw porta 3000 exposto via Cloudflare Tunnel como `alexa.pipeeyewear.com.br`
- Portal do cliente: `runner.ts` em `~/nanoclaw/src/whatsapp/runner.ts`
- Banco portal: `~/nanoclaw/store/predictions.db`
- Evolution API (Docker): WhatsApp Business

### Agent Manager
- **URL pública:** `https://agents.onemanarmyproject.com.br/run`
- **Chave:** `oma-agent-manager-2026-e0bd41acabd76eeb`
- **CLAUDE.md custom por agente:** `/opt/oma-agent-manager/agents/{id}/CLAUDE.md`
- **Fallback automático:** se Agent Manager offline → chamada direta Anthropic

---

## CHAVES E CREDENCIAIS

| Serviço | Chave/Referência |
|---------|-----------------|
| Anthropic (OMA Ideias) | `sk-ant-api03-Kua-...YGreaQAA` — workspace "OMA IDEIAS" |
| Agent Manager service key | `oma-agent-manager-2026-e0bd41acabd76eeb` |
| Vercel token | `$VERCEL_TOKEN` |
| OMA API key (PMO etc) | `354496182871fba394e09cfbb8d699f1bc6859f4e3417f84b0993ee36bcd0273` |
| Cloudflare Zone ID | `2240ff4dfe6bf27d55a5977343271ff3` |

---

## CUSTO API ANTHROPIC — HISTÓRICO

| Data | Consumo | Cases | Observação |
|------|---------|-------|------------|
| 12/04/2026 | ~$0,65 | ~3-4 cases | Testes e desenvolvimento |
| 13/04/2026 | ~$0,25 | ~1-2 cases | Continuação |
| **Custo produção por case** | **~$0,44 = R$2,55** | 1 | 7 chamadas Sonnet |
| **Margem bruta** | **99,1%** | — | Sobre R$349,90 |

**Escala:**
- Atual (1 chave): ~15 cases/hora
- Com upgrade Tier 4: ~50 cases/hora  
- Com 3 chaves rotativas: ~45 cases/hora (solução mais simples)

---

## ROADMAP — PRÓXIMAS SESSÕES

### PENDENTE — OMA Ideias

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 1 | **Teste ponta a ponta real** — da landing até PDFs com dados reais | 🔴 Alta |
| 2 | **Portal backend** — confirmar que `portal_products` registra `ideias` ao pagar | 🔴 Alta |
| 3 | **Checkout ASAAS real** — substituir bypass por oma-checkout.js + ASAAS | 🟡 Média |
| 4 | **Email de entrega** — validar que chega após pagamento | 🟡 Média |
| 5 | **CLAUDE.md por agente** — carregar prompts especializados em `/opt/oma-agent-manager/agents/` | 🟡 Média |
| 6 | **Observação MD/JSON produtos físicos** — texto explicativo na tela de entrega | 🟢 Baixa |
| 7 | **Painel operacional** — ver todos os cases, status, flags | 🟢 Baixa |

### PENDENTE — Infra

| # | Tarefa | Prioridade |
|---|--------|-----------|
| 8 | Migrar Evolution API para Hetzner | 🟡 Média |
| 9 | Migrar Scribe para Hetzner | 🟡 Média |
| 10 | Upgrade Hetzner CX22 → CX32 (8GB RAM) | 🟡 Média |
| 11 | Migrar domínios pipeeyewear → onemanarmy | 🟢 Baixa |

---

## SESSÃO MAIS RECENTE: 12–13/04/2026 — OMA Ideias Completo

### Entregue nesta sessão

**Produto OMA Ideias — do zero ao ar:**
- Motor completo: intake texto/áudio → briefing → clarificação → 5 agentes → consolidação → entrega
- Agent Manager em `https://agents.onemanarmyproject.com.br` (HTTPS, PM2, Hetzner)
- 7 PDFs documentais com Puppeteer + Chromium
- Fit Score (0-100) + Tamanho de Mercado no Resumo Executivo
- Export blueprint.md e blueprint.json
- SWOT 2x2 no PDF 01
- 5 Forças de Porter no PDF 03
- Jornada visual com steps no PDF 05
- Diagrama de stack em camadas no PDF 06
- Roadmap como checklist por fase no PDF 07
- Webhook ASAAS — PIX R$349,90 + cartão 2x R$174,95
- Email de entrega via Gmail API
- Portal do cliente — card OMA Ideias com score e link para blueprint
- DNS agents.onemanarmyproject.com.br + SSL certbot
- Polling robusto com check imediato e aceleração durante consolidação
- Preço: R$349,90 lançamento / R$699,00 cheio

---

*Atualizado em 13/04/2026 — sessão OMA Ideias*
