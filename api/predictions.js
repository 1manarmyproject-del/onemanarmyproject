const TELEGRAM_TOKEN = '7879687342:AAHTwjpMT3IRRfGPTD_c7CKEqVSmICdJXiM';
const FABIO_CHAT_ID = '8392126681';
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

async function getAccessToken() {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: GMAIL_CLIENT_ID, client_secret: GMAIL_CLIENT_SECRET, refresh_token: GMAIL_REFRESH_TOKEN, grant_type: 'refresh_token' })
  });
  return (await r.json()).access_token;
}

async function sendEmail(to, subject, html) {
  const token = await getAccessToken();
  const raw = `From: OMA Predictions <atendimento@onemanarmy.com.br>\r\nTo: ${to}\r\nSubject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
  await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') })
  });
}

function buildEmail(data) {
  const n = data.name||'Cliente', s = data.type==='scenario';
  const sum = s ? `<p><b>Tipo:</b> Cenário Livre</p><p><b>Contexto:</b> ${(data.context||'').substring(0,200)}...</p><p><b>Local:</b> ${data.where||'-'}</p><p><b>Prever:</b> ${(data.question||'').substring(0,200)}...</p>` : `<p><b>Tipo:</b> Negócio</p><p><b>Empresa:</b> ${data.company||'-'}</p><p><b>Segmento:</b> ${data.segment||'-'}</p><p><b>Prever:</b> ${(data.question||'').substring(0,200)}...</p>`;
  return `<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#080808;color:#e4ddd3"><div style="background:#0f0f0f;padding:32px;border-bottom:3px solid #e8703a;text-align:center"><h1 style="font-family:Georgia;font-size:22px;color:#f5f0e8;margin:0">🐟 OMA Predictions</h1><p style="font-size:11px;color:#888;letter-spacing:2px;margin-top:6px">RELATÓRIO PREDITIVO COM IA</p></div><div style="padding:32px"><p>Olá, <b>${n}</b>!</p><p>Recebemos seu briefing.</p><div style="background:#1a1a1a;border:1px solid #252525;padding:20px;margin:20px 0"><h3 style="font-size:13px;color:#e8703a;margin:0 0 12px">RESUMO</h3>${sum}</div><div style="background:#1a1a1a;padding:20px;margin:20px 0"><p>1️⃣ <b>43+ agentes</b> serão criados</p><p>2️⃣ Debate em <b>redes sociais simuladas</b></p><p>3️⃣ <b>Relatório completo</b> em até <b>24h úteis</b></p></div><div style="background:#0f0f0f;border-left:3px solid #7a2204;padding:16px 20px;margin:24px 0;font-size:12px;color:#888;line-height:1.7"><b style="color:#e4ddd3">⚠️ Aviso:</b> Resultados são projeções de IA, não garantias. Use como ferramenta de apoio à decisão.</div><p style="color:#e8703a">— Equipe OMA 🦞</p></div><div style="background:#0f0f0f;padding:16px;text-align:center"><p style="font-size:10px;color:#555">Riva Labs Ltda · CNPJ 65.452.151/0001-26</p></div></div>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body;
  if (!data || !data.name || !data.email) return res.status(400).json({ error: 'Nome e email obrigatórios' });

  const id = `pred_${Date.now().toString(36)}`;
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const isScenario = data.type === 'scenario';

  // 1. Forward to Mac Mini FIRST (fast — ~500ms)
  try {
    await fetch('https://alexa.pipeeyewear.com.br/predictions-intake', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, prediction_id: id, submitted_at: ts }),
      signal: AbortSignal.timeout(3000)
    });
  } catch(e) { console.error('Forward error:', e); }

  // 2. Telegram (fast — ~500ms)
  const tgMsg = isScenario
    ? `🔮 *PREDICTIONS — Cenário Livre*\n\n*ID:* ${id}\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.whatsapp||'-'}\n📍 *Onde:* ${data.where||'-'}\n\n📋 *Contexto:*\n${(data.context||'').substring(0,500)}\n\n🔮 *Prever:*\n${(data.question||'').substring(0,300)}\n\n_${ts}_`
    : `🔮 *PREDICTIONS — Negócio*\n\n*ID:* ${id}\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.whatsapp||'-'}\n🏢 ${data.company||'-'}\n📋 ${data.segment||'-'}\n\n*Negócio:*\n${(data.business||'').substring(0,300)}\n\n🔮 *Prever:*\n${(data.question||'').substring(0,300)}\n\n_${ts}_`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: FABIO_CHAT_ID, text: tgMsg, parse_mode: 'Markdown' }),
      signal: AbortSignal.timeout(3000)
    });
  } catch(e) { console.error('Telegram error:', e); }

  // 3. Email (slow — 2-4s, but still within 10s limit)
  try {
    const html = buildEmail(data);
    await sendEmail(data.email, `Recebemos seu briefing, ${data.name}! — OMA Predictions`, html);
    await sendEmail('fabio@onemanarmy.com.br', `[PREDICTIONS] ${data.company||data.name}`, html);
  } catch(e) { console.error('Email error:', e); }

  // 4. Respond
  return res.status(200).json({ success: true, id });
}
