/**
 * server.js — Bridge entre o React e o scraper Playwright
 *
 * Instalar dependências:
 *   npm install express cors playwright
 *   npx playwright install chromium
 *
 * Rodar: node server.js
 * Porta: 3001 (configure proxy no vite.config.ts ou CRA)
 */

const express = require('express');
const cors = require('cors');
const { scrape } = require('./scraper');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── GET /api/horarios?origem=Brodowski&destino=Ribeirão+Preto ─────────────
app.get('/api/horarios', async (req, res) => {
  const { origem, destino } = req.query;

  if (!origem || !destino) {
    return res.status(400).json({ error: 'Parâmetros origem e destino são obrigatórios.' });
  }

  if (origem === destino) {
    return res.status(400).json({ error: 'Origem e destino não podem ser iguais.' });
  }

  console.log(`📥 Requisição: ${origem} → ${destino}`);

  try {
    const data = await scrape(String(origem), String(destino));
    console.log(`✅ Sucesso: ${data.schedules.length} blocos de horário extraídos`);
    res.json(data);
  } catch (err) {
    console.error('❌ Erro no scraper:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/cidades — lista de cidades disponíveis ───────────────────────
app.get('/api/cidades', (_req, res) => {
  res.json([
    'Altinópolis',
    'Batatais',
    'Brodowski',
    'Cravinhos',
    'Jardinópolis',
    'Ribeirão Preto',
    'São Simão',
    'Serrana',
    'Sertãozinho',
  ]);
});

app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  console.log(`   GET /api/horarios?origem=Brodowski&destino=Ribeir%C3%A3o+Preto`);
  console.log(`   GET /api/cidades`);
});
