export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.VENO_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'VENO_API_KEY não configurada' });

  try {
    const { amount, description, external_id, payer } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const payload = {
      amount: Math.round(amount), // centavos
      description: description || 'Pedido Panini FIFA World Cup 2026',
      external_id: external_id || `order-${Date.now()}`,
      callback_url: process.env.WEBHOOK_URL || undefined,
      payer: {
        name:     payer?.name     || 'Cliente',
        email:    payer?.email    || 'cliente@email.com',
        document: payer?.document || '00000000000',
        phone:    payer?.phone    || '11999999999',
        address:  payer?.address  || 'Rua Exemplo, 123',
        city:     payer?.city     || 'São Paulo',
        state:    payer?.state    || 'SP',
        zip_code: payer?.zip_code || '01001000',
      }
    };

    console.log('[PIX] Criando cobrança:', JSON.stringify(payload));

    const response = await fetch('https://beta.venopayments.com/api/v1/pix', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('[PIX] Resposta Veno:', response.status, JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.error || 'Erro ao criar PIX',
        debug: data,
      });
    }

    return res.status(201).json(data);

  } catch (err) {
    console.error('[PIX] Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno', debug: err.message });
  }
}
