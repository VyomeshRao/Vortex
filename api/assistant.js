const ALLOWED_ORIGINS = new Set([
  'https://vyomeshrao.github.io',
  ...(process.env.APP_ORIGIN ? [process.env.APP_ORIGIN.replace(/\/$/, '')] : [])
]);

const SYSTEM_INSTRUCTION = `You are Mesh Assistant, a helpful guide for the Merchant Mesh project, a demo concept for independent neighborhood shops. Explain how the interface works and give practical, concise advice. The site currently uses illustrative sample dashboard data and browser-local demo profiles and request notes; it does not connect real merchants, suppliers, inventory, ordering, or live demand feeds. Never present sample figures as real or claim that an action was completed. The request-category suggestion is a small on-device demo classifier. You may answer general questions using your general knowledge, but be clear when information may need checking. Do not ask users to share passwords, API keys, payment details, or private customer information. Keep answers friendly and straightforward.`;

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return send(res, 403, { error: 'Origin not allowed.' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
  if (!process.env.GEMINI_API_KEY) return send(res, 503, { error: 'Gemini is not configured on this deployment.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return send(res, 400, { error: 'Invalid JSON.' }); }
  }
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
  if (!messages.length || messages.length > 12) return send(res, 400, { error: 'Send up to 12 chat messages.' });
  if (messages.some(message => !['user', 'assistant'].includes(message?.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 1500)) {
    return send(res, 400, { error: 'Each message must contain a role and up to 1,500 characters.' });
  }
  const input = messages.map(message => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content.trim()}`).join('\n\n');
  try {
    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
        input,
        system_instruction: SYSTEM_INSTRUCTION,
        store: false,
        generation_config: { max_output_tokens: 450, temperature: 0.5 }
      }),
      signal: AbortSignal.timeout(25000)
    });
    if (!upstream.ok) {
      console.error('Gemini API returned status', upstream.status);
      return send(res, 502, { error: 'Gemini could not answer right now.' });
    }
    const result = await upstream.json();
    const reply = (result.steps || [])
      .filter(step => step.type === 'model_output')
      .flatMap(step => step.content || [])
      .filter(part => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('\n')
      .trim();
    if (!reply) return send(res, 502, { error: 'Gemini returned no text.' });
    return send(res, 200, { reply });
  } catch (error) {
    console.error('Gemini request failed:', error?.name || 'unknown');
    return send(res, 502, { error: 'Gemini is temporarily unavailable.' });
  }
};

