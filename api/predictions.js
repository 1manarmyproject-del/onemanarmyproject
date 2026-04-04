// Vercel Serverless — OMA Predictions Intake
// POST /api/predictions — receives form, sends Telegram + email confirmation

const TELEGRAM_TOKEN = '7879687342:AAHTwjpMT3IRRfGPTD_c7CKEqVSmICdJXiM';
const FABIO_CHAT_ID = '8392126681';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    const isScenario = data.type === 'scenario';
    const id = `pred_${Date.now().toString(36)}`;
    const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Validate
    if (!data.name || !data.email) {
      return res.status(400).json({ error: 'Nome e email obrigatórios' });
    }

    // 1. Telegram notification to Fabio
    let tgMsg;
    if (isScenario) {
      tgMsg = `🔮 *PREDICTIONS — Cenário Livre*\n\n*ID:* ${id}\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.whatsapp || '-'}\n\n📍 *Onde:* ${data.where || '-'}\n\n📋 *Contexto:*\n${(data.context || '').substring(0, 500)}\n\n🔮 *Prever:*\n${(data.question || '').substring(0, 300)}\n\n_${ts}_`;
    } else {
      tgMsg = `🔮 *PREDICTIONS — Negócio*\n\n*ID:* ${id}\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.whatsapp || '-'}\n🏢 ${data.company || '-'}\n📋 ${data.segment || '-'}\n\n*Negócio:*\n${(data.business || '').substring(0, 300)}\n\n*Dores:*\n${(data.pain_points || '').substring(0, 300)}\n\n🔮 *Prever:*\n${(data.question || '').substring(0, 300)}\n\n_${ts}_`;
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: FABIO_CHAT_ID, text: tgMsg, parse_mode: 'Markdown' })
    }).catch(() => {});

    // 2. Also forward to Mac Mini webhook for local processing
    await fetch('https://mcp.pipeeyewear.com.br/predictions-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, prediction_id: id })
    }).catch(() => {});

    // 3. Response
    return res.status(200).json({ success: true, id, message: 'Recebido!' });

  } catch (error) {
    console.error('Predictions error:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
