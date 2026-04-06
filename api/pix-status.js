export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID não informado' });

  const API_KEY = process.env.VENO_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'VENO_API_KEY não configurada' });

  try {
    const response = await fetch(`https://beta.venopayments.com/api/v1/pix/${id}/status`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    const data = await response.json();
    console.log('[PIX STATUS]', id, response.status, data?.status);

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.message || 'Erro ao consultar', debug: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('[PIX STATUS] Erro:', err);
    return res.status(500).json({ error: 'Erro interno', debug: err.message });
  }
}
