// Vercel Serverless — OMA Predictions Intake
// POST /api/predictions — receives form, sends Telegram + confirmation email

const TELEGRAM_TOKEN = '7879687342:AAHTwjpMT3IRRfGPTD_c7CKEqVSmICdJXiM';
const FABIO_CHAT_ID = '8392126681';

// Gmail OAuth2 (atendimento@onemanarmy.com.br)
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function sendEmail(to, subject, htmlBody) {
  try {
    const accessToken = await getAccessToken();
    
    const raw = `From: OMA Predictions <atendimento@onemanarmy.com.br>\r\nTo: ${to}\r\nSubject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\nReply-To: atendimento@onemanarmy.com.br\r\n\r\n${htmlBody}`;
    
    const encoded = Buffer.from(raw).toString('base64url');
    
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encoded })
    });
    
    const result = await res.json();
    console.log('Email sent:', result.id);
    return true;
  } catch (e) {
    console.error('Email error:', e);
    return false;
  }
}

function buildConfirmationEmail(data) {
  const isScenario = data.type === 'scenario';
  const name = data.name || 'Cliente';
  
  let briefingSummary;
  if (isScenario) {
    briefingSummary = `
      <p><strong>Tipo:</strong> Cenário Livre</p>
      <p><strong>Contexto:</strong> ${(data.context || '').substring(0, 200)}...</p>
      <p><strong>Local:</strong> ${data.where || '-'}</p>
      <p><strong>O que prever:</strong> ${(data.question || '').substring(0, 200)}...</p>`;
  } else {
    briefingSummary = `
      <p><strong>Tipo:</strong> Análise de Negócio</p>
      <p><strong>Empresa:</strong> ${data.company || '-'}</p>
      <p><strong>Segmento:</strong> ${data.segment || '-'}</p>
      <p><strong>O que prever:</strong> ${(data.question || '').substring(0, 200)}...</p>`;
  }
  
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080808;color:#e4ddd3;">
  <div style="background:#0f0f0f;padding:32px;border-bottom:3px solid #e8703a;text-align:center;">
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#f5f0e8;margin:0;">🐟 OMA Predictions</h1>
    <p style="font-size:11px;color:#888;letter-spacing:2px;margin-top:6px;">RELATÓRIO PREDITIVO COM INTELIGÊNCIA ARTIFICIAL</p>
  </div>
  
  <div style="padding:32px;">
    <p style="font-size:15px;">Olá, <strong>${name}</strong>!</p>
    <p>Recebemos seu briefing e nosso algoritmo já está se preparando para a simulação.</p>
    
    <div style="background:#1a1a1a;border:1px solid #252525;padding:20px;margin:20px 0;">
      <h3 style="font-size:13px;color:#e8703a;margin:0 0 12px;letter-spacing:1px;">RESUMO DA SOLICITAÇÃO</h3>
      ${briefingSummary}
    </div>
    
    <div style="background:#1a1a1a;border:1px solid #252525;padding:20px;margin:20px 0;">
      <h3 style="font-size:13px;color:#e8703a;margin:0 0 12px;letter-spacing:1px;">O QUE VAI ACONTECER</h3>
      <p>1️⃣ <strong>43+ agentes autônomos</strong> com personalidades distintas serão criados</p>
      <p>2️⃣ Eles vão debater sobre o seu cenário em <strong>redes sociais simuladas</strong></p>
      <p>3️⃣ Um <strong>relatório completo</strong> com predições, objeções e recomendações será gerado</p>
      <p>4️⃣ Você recebe tudo por email em até <strong>24 horas úteis</strong></p>
    </div>
    
    <div style="background:#1a1a1a;border:1px solid #252525;padding:20px;margin:20px 0;">
      <h3 style="font-size:13px;color:#e8703a;margin:0 0 12px;letter-spacing:1px;">PRAZO DE ENTREGA</h3>
      <p>📅 Seu relatório será entregue em até <strong>24 horas úteis</strong> neste mesmo email.</p>
      <p>📊 Você receberá: relatório visual (HTML/PDF) + versão em texto para referência rápida.</p>
      <p>📱 A equipe OMA também entrará em contato pelo WhatsApp para confirmar o recebimento.</p>
    </div>
    
    <div style="background:#0f0f0f;border-left:3px solid #7a2204;padding:16px 20px;margin:24px 0;font-size:12px;color:#888;line-height:1.7;">
      <strong style="color:#e4ddd3;">⚠️ Aviso importante sobre o relatório:</strong><br><br>
      O OMA Predictions utiliza inteligência artificial e simulação computacional para gerar cenários preditivos. 
      Os resultados são <strong style="color:#e4ddd3;">projeções baseadas em modelos de IA</strong>, gerados a partir de agentes autônomos com personalidades simuladas 
      debatendo em ambientes controlados.<br><br>
      <strong style="color:#e4ddd3;">Estes resultados NÃO constituem garantia de resultados futuros.</strong> 
      Variáveis externas, decisões humanas, eventos imprevisíveis e condições de mercado podem alterar significativamente 
      os cenários reais em relação às projeções apresentadas.<br><br>
      Use este relatório como <strong style="color:#e4ddd3;">ferramenta complementar de apoio à decisão</strong>, 
      não como previsão determinística ou recomendação de investimento. 
      A OMA Project (Riva Labs Ltda) não se responsabiliza por decisões tomadas exclusivamente com base neste relatório.<br><br>
      <span style="color:#555;">Ao utilizar este serviço, você declara estar ciente destas limitações e concorda com nossos termos de uso.</span>
    </div>
    
    <p>Qualquer dúvida, responda este email ou fale com a gente pelo WhatsApp.</p>
    <p style="color:#e8703a;margin-top:20px;">— Equipe OMA Project 🦞</p>
  </div>
  
  <div style="background:#0f0f0f;padding:20px;text-align:center;border-top:1px solid #1a1a1a;">
    <p style="font-size:10px;color:#555;margin:0;">One Man Army Project · Riva Labs Ltda · CNPJ 65.452.151/0001-26</p>
    <p style="font-size:10px;color:#555;margin:4px 0 0;">
      <a href="https://onemanarmyproject.com.br/termos" style="color:#888;text-decoration:underline;">Termos de Uso</a> · 
      <a href="https://onemanarmyproject.com.br/privacidade" style="color:#888;text-decoration:underline;">Política de Privacidade</a>
    </p>
  </div>
</div>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') 
    // 3. Forward to Mac Mini for pipeline processing
    await fetch('https://alexa.pipeeyewear.com.br/predictions-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, prediction_id: id })
    }).catch(() => {});

    return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    const isScenario = data.type === 'scenario';
    const id = `pred_${Date.now().toString(36)}`;
    const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

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

    // 2. Send confirmation email
    const emailHtml = buildConfirmationEmail(data);
    const subject = `Recebemos seu briefing, ${data.name}! — OMA Predictions`;
    await sendEmail(data.email, subject, emailHtml);

    // 3. Also email Fabio
    const fabioSubject = `[PREDICTIONS] Nova solicitação — ${data.company || data.name}`;
    await sendEmail('fabio@onemanarmy.com.br', fabioSubject, emailHtml);

    return res.status(200).json({ success: true, id, message: 'Recebido!' });

  } catch (error) {
    console.error('Predictions error:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
