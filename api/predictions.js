// Vercel Serverless Function — OMA Predictions Intake
// POST /api/predictions — receives form data, sends to Telegram, creates PMO card

const TELEGRAM_BOT_TOKEN = '7879687342:AAHTwjpMT3IRRfGPTD_c7CKEqVSmICdJXiM';
const FABIO_CHAT_ID = '8392126681';
const PMO_API = 'https://api.onemanarmyproject.com.br';
const PMO_KEY = (sessionStorage.getItem('oma_api_key')||'');

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.name || !data.email || !data.company || !data.segment || !data.business || !data.pain_points || !data.question) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timestamp = new Date().toISOString();
    const id = `pred_${Date.now().toString(36)}`;

    // 1. Send Telegram notification to Fabio
    const tgMessage = `🔮 *NOVO PEDIDO — OMA Predictions*

*ID:* ${id}
*Nome:* ${data.name}
*Email:* ${data.email}
*WhatsApp:* ${data.whatsapp || 'não informado'}
*Empresa:* ${data.company}
*Segmento:* ${data.segment}
*Funcionários:* ${data.employees || '?'}
*Orçamento tech:* ${data.budget || '?'}

*Negócio:*
${data.business}

*Dores:*
${data.pain_points}

*Concorrentes:*
${data.competitors || 'não informado'}

*Pergunta central:*
${data.question}

_Recebido em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}_`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: FABIO_CHAT_ID,
        text: tgMessage,
        parse_mode: 'Markdown'
      })
    }).catch(e => console.error('Telegram error:', e));

    // 2. Create PMO card for tracking
    await fetch(`${PMO_API}/pmo`, {
      method: 'POST',
      headers: { 'x-api-key': PMO_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[PREDICTIONS] ${data.company} — ${data.segment}`,
        description: `Lead: ${data.name} (${data.email})\nEmpresa: ${data.company}\nSegmento: ${data.segment}\nPergunta: ${data.question}\n\nDores: ${data.pain_points}\n\nRecebido: ${timestamp}`,
        status: 'backlog',
        priority: 'high',
        agent: 'predictions'
      })
    }).catch(e => console.error('PMO error:', e));

    // 3. Create CRM lead
    await fetch(`${PMO_API}/crm`, {
      method: 'POST',
      headers: { 'x-api-key': PMO_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.whatsapp || '',
        company: data.company,
        segment: data.segment,
        source: 'predictions-form',
        status: 'new',
        notes: `Predictions request: ${data.question}`,
        metadata: {
          prediction_id: id,
          business: data.business,
          pain_points: data.pain_points,
          competitors: data.competitors,
          budget: data.budget,
          employees: data.employees
        }
      })
    }).catch(e => console.error('CRM error:', e));

    return res.status(200).json({ 
      success: true, 
      id,
      message: 'Pedido recebido! Seu relatório será gerado em até 24h úteis.' 
    });

  } catch (error) {
    console.error('Predictions API error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
