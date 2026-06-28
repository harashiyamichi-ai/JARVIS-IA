// Vercel Serverless Function
// Endpoint: POST /api/chat

export default async function handler(req, res) {
  // Permite apenas requisições POST por segurança
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Alguns runtimes mandam body já parseado; outros mandam string.
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { mensagem } = body || {};

  // Pega a chave de ambiente configurada no painel da Vercel
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  if (!mensagem || typeof mensagem !== 'string' || !mensagem.trim()) {
    return res.status(400).json({ error: 'Mensagem inválida.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        `Content-Type': 'application/json`,
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: mensagem }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Groq API error:', response.status, data);
      return res.status(500).json({ error: 'Erro ao obter resposta da IA.' });
    }

    const resposta = data?.choices?.[0]?.message?.content;

    if (!resposta) {
      console.error('Resposta inválida da Groq:', data);
      return res.status(500).json({ error: 'Erro ao obter resposta da IA.' });
    }

    return res.status(200).json({ resposta });
  } catch (error) {
    console.error('Erro interno no servidor da Vercel:', error);
    return res.status(500).json({ error: 'Erro ao processar a requisição.' });
  }
}

