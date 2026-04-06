export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { cep } = req.query;
  if (!cep) return res.status(400).json({ error: 'CEP não informado' });

  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return res.status(400).json({ error: 'CEP inválido' });

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await response.json();

    if (data.erro) return res.status(404).json({ error: 'CEP não encontrado' });

    return res.status(200).json({
      street:       data.logradouro,
      neighborhood: data.bairro,
      city:         data.localidade,
      state:        data.uf,
      zip_code:     clean,
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar CEP', debug: err.message });
  }
}
