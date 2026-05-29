/**
 * SaoBentoTest.tsx
 * Página de teste para raspagem de horários da Viação São Bento.
 *
 * Modos de operação:
 *  1. COM backend (Express + scraper.js): chama /api/horarios?origem=X&destino=Y
 *  2. SEM backend (MOCK_MODE=true): usa dados hardcoded para dev local
 *
 * Adicione ao seu router: <Route path="/teste-saobento" element={<SaoBentoTest />} />
 */

import React, { useState } from 'react';

// ── Tipos ────────────────────────────────────────────────────────────────
interface TimeEntry {
  time: string;
  tipo: 'rodoviaria' | 'ponto_especial' | 'normal';
}

interface DaySchedule {
  day: string;
  origin: string;
  dest: string;
  times: TimeEntry[];
}

interface ScraperResult {
  routeName: string;
  prices: Record<string, string>;
  schedules: DaySchedule[];
}

// ── Cidades disponíveis ───────────────────────────────────────────────────
const CITIES = [
  'Altinópolis',
  'Batatais',
  'Brodowski',
  'Cravinhos',
  'Jardinópolis',
  'Ribeirão Preto',
  'São Simão',
  'Serrana',
  'Sertãozinho',
];

// ── Dados mock para testar sem backend ────────────────────────────────────
const MOCK_MODE = false; // mude para true se não tiver o backend rodando

const MOCK_DATA: ScraperResult = {
  routeName: 'Ribeirão Preto X Brodowski',
  prices: { 'Comum/VT:': 'R$ 8,95', 'Estudante:': 'R$ 4,47' },
  schedules: [
    {
      day: 'Segunda a Sexta',
      origin: 'Saindo de Brodowski',
      dest: 'Ribeirão Preto',
      times: [
        { time: '05:00', tipo: 'ponto_especial' },
        { time: '05:56', tipo: 'ponto_especial' },
        { time: '05:57', tipo: 'rodoviaria' },
        { time: '06:50', tipo: 'ponto_especial' },
        { time: '07:10', tipo: 'ponto_especial' },
        { time: '08:00', tipo: 'ponto_especial' },
        { time: '09:00', tipo: 'ponto_especial' },
        { time: '10:45', tipo: 'ponto_especial' },
        { time: '12:00', tipo: 'ponto_especial' },
        { time: '13:15', tipo: 'rodoviaria' },
        { time: '15:00', tipo: 'ponto_especial' },
        { time: '16:00', tipo: 'ponto_especial' },
        { time: '17:00', tipo: 'ponto_especial' },
        { time: '18:20', tipo: 'rodoviaria' },
        { time: '20:30', tipo: 'rodoviaria' },
      ],
    },
    {
      day: 'Sábado',
      origin: 'Saindo de Brodowski',
      dest: 'Ribeirão Preto',
      times: [
        { time: '05:00', tipo: 'ponto_especial' },
        { time: '05:55', tipo: 'ponto_especial' },
        { time: '07:10', tipo: 'ponto_especial' },
        { time: '09:00', tipo: 'ponto_especial' },
        { time: '11:00', tipo: 'ponto_especial' },
        { time: '13:00', tipo: 'ponto_especial' },
        { time: '15:00', tipo: 'ponto_especial' },
        { time: '17:00', tipo: 'ponto_especial' },
        { time: '18:30', tipo: 'ponto_especial' },
        { time: '21:00', tipo: 'ponto_especial' },
      ],
    },
  ],
};

// ── Componente ────────────────────────────────────────────────────────────
export default function SaoBentoTest() {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScraperResult | null>(null);
  const [rawJson, setRawJson] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(0);

  const swap = () => {
    setOrigem(destino);
    setDestino(origem);
    setData(null);
  };

  const fetch_ = async () => {
    if (!origem || !destino) return;
    if (origem === destino) {
      setError('Origem e destino não podem ser iguais.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      if (MOCK_MODE) {
        await new Promise(r => setTimeout(r, 1200));
        setData(MOCK_DATA);
        setRawJson(JSON.stringify(MOCK_DATA, null, 2));
      } else {
        const params = new URLSearchParams({ origem, destino });
        const res = await fetch(`/api/horarios?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const json: ScraperResult = await res.json();
        setData(json);
        setRawJson(JSON.stringify(json, null, 2));
      }
      setActiveDay(0);
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Filtra os schedules pelo dia ativo
  const days = data
    ? [...new Set(data.schedules.map(s => s.day))]
    : [];
  const activeDaySchedules = data
    ? data.schedules.filter(s => s.day === days[activeDay])
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🚌 Teste — Viação São Bento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fonte:{' '}
            <a
              href="https://semiurbano.lovable.app/horarios"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              semiurbano.lovable.app/horarios
            </a>
            {MOCK_MODE && (
              <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
                MOCK MODE
              </span>
            )}
          </p>
        </div>

        {/* Seletor de rota */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <p className="text-sm font-medium text-gray-700">Selecione a rota</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Origem */}
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">📍 Origem</label>
              <select
                value={origem}
                onChange={e => { setOrigem(e.target.value); setData(null); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a origem...</option>
                {CITIES.map(c => (
                  <option key={c} value={c} disabled={c === destino}>{c}</option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <button
              onClick={swap}
              disabled={!origem || !destino}
              title="Inverter"
              className="shrink-0 rounded-full border border-blue-200 bg-white p-2.5 text-blue-600 hover:bg-blue-50 disabled:opacity-40 self-center sm:mb-0.5"
            >
              ⇄
            </button>

            {/* Destino */}
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">📍 Destino</label>
              <select
                value={destino}
                onChange={e => { setDestino(e.target.value); setData(null); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o destino...</option>
                {CITIES.map(c => (
                  <option key={c} value={c} disabled={c === origem}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetch_}
            disabled={!origem || !destino || loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Buscando horários...
              </>
            ) : (
              '🔍 Buscar horários'
            )}
          </button>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Resultados */}
        {data && (
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">

            {/* Cabeçalho da rota */}
            <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                🚌 {data.routeName}
              </div>
              <div className="ml-auto flex flex-wrap gap-4">
                {Object.entries(data.prices).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm">
                    <span className="text-gray-500">🎫 {label}</span>
                    <span className="font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs de dia */}
            {days.length > 0 && (
              <div className="flex border-b bg-gray-50">
                {days.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(i)}
                    className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                      activeDay === i
                        ? 'border-b-2 border-blue-600 bg-white text-blue-700'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {/* Tabela de horários */}
            <div className="p-4 space-y-5">
              {activeDaySchedules.map((sched, si) => (
                <div key={si}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {sched.origin} → {sched.dest}
                    <span className="ml-2 font-normal normal-case text-gray-400">
                      ({sched.times.length} horários)
                    </span>
                  </p>

                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50 text-xs text-gray-500">
                          <th className="px-4 py-2 text-left font-medium">Horário</th>
                          <th className="px-4 py-2 text-left font-medium">Tipo de saída</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sched.times.map((t, ti) => (
                          <tr
                            key={ti}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 font-mono font-semibold text-gray-900">
                              {t.time}
                            </td>
                            <td className="px-4 py-2">
                              {t.tipo === 'rodoviaria' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                  🏛 Rodoviária
                                </span>
                              ) : t.tipo === 'ponto_especial' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                  📍 Ponto especial
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 border-t bg-gray-50 px-5 py-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                Saída da Rodoviária
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                Passa por ponto especial
              </span>
            </div>
          </div>
        )}

        {/* JSON bruto (debug) */}
        {rawJson && (
          <div>
            <button
              onClick={() => setShowRaw(v => !v)}
              className="text-xs text-gray-400 underline"
            >
              {showRaw ? '▲ Ocultar' : '▼ Ver'} JSON bruto
            </button>
            {showRaw && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg border bg-gray-900 p-4 text-xs text-green-300">
                {rawJson}
              </pre>
            )}
          </div>
        )}

        {/* Instruções de setup */}
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600 space-y-2">
          <p className="font-medium text-gray-800">🛠 Como conectar ao backend</p>
          <p>No seu <code className="rounded bg-gray-100 px-1">server.js</code> (Express):</p>
          <pre className="overflow-auto rounded bg-gray-900 p-3 text-xs text-green-300">{`const { scrape } = require('./scraper');

app.get('/api/horarios', async (req, res) => {
  const { origem, destino } = req.query;
  try {
    const data = await scrape(origem, destino);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`}</pre>
          <p className="text-xs text-gray-400">
            Para testar sem backend, mude <code>MOCK_MODE = true</code> no topo de SaoBentoTest.tsx
          </p>
        </div>

      </div>
    </div>
  );
}
