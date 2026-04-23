"use client";

import { useState } from 'react';
import { Download, FileText, Table2, Loader2 } from 'lucide-react';

export default function ExportarRelatorio() {
    const [open, setOpen] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [status, setStatus] = useState('TODOS');
    const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null);

    const buildQuery = () => {
        const params = new URLSearchParams();
        if (dataInicio) params.set('inicio', dataInicio);
        if (dataFim)    params.set('fim', dataFim);
        if (status !== 'TODOS') params.set('status', status);
        return params.toString();
    };

    const exportExcel = async () => {
        setLoading('excel');
        try {
            const res = await fetch(`/api/controlador/exportar?${buildQuery()}`);
            const tickets = await res.json();

            const headers = ['Protocolo', 'Assunto', 'Status', 'Prioridade', 'Categoria', 'Secretaria', 'Solicitante', 'Técnico', 'Criado em'];
            const rows = tickets.map((t: any) => [
                t.protocol,
                t.subject,
                t.status,
                t.priority,
                t.category?.name || '',
                t.department?.name || '',
                t.requester?.name || '',
                t.assignedTo?.name || 'Não atribuído',
                new Date(t.createdAt).toLocaleString('pt-BR'),
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chamados-${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setLoading(null);
        }
    };

    const exportPDF = async () => {
        setLoading('pdf');
        try {
            const res = await fetch(`/api/controlador/exportar?${buildQuery()}`);
            const tickets = await res.json();

            const dataStr = dataInicio && dataFim
                ? `${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}`
                : 'Todos os períodos';

            const rows = tickets.map((t: any) => `
                <tr>
                    <td>${t.protocol}</td>
                    <td>${t.subject}</td>
                    <td>${t.status.replace('_', ' ')}</td>
                    <td>${t.priority}</td>
                    <td>${t.department?.name || ''}</td>
                    <td>${t.assignedTo?.name || 'Não atribuído'}</td>
                    <td>${new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
            `).join('');

            const html = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Relatório de Chamados</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 24px; }
                        h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
                        .meta { color: #666; font-size: 10px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #111; color: white; padding: 8px 6px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; }
                        td { padding: 7px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
                        tr:nth-child(even) td { background: #f9f9f9; }
                        .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: center; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h1>Relatório de Chamados</h1>
                    <p class="meta">Período: ${dataStr} | Total: ${tickets.length} chamados | Gerado em ${new Date().toLocaleString('pt-BR')}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Protocolo</th>
                                <th>Assunto</th>
                                <th>Status</th>
                                <th>Prioridade</th>
                                <th>Secretaria</th>
                                <th>Técnico</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <p class="footer">Sistema de Chamados TI — Gerado automaticamente</p>
                </body>
                </html>
            `;

            const win = window.open('', '_blank');
            if (win) {
                win.document.write(html);
                win.document.close();
                win.focus();
                setTimeout(() => { win.print(); }, 500);
            }
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-2xl text-[11px] font-black uppercase text-muted hover:text-foreground hover:border-primary transition-all"
            >
                <Download size={16}/> Exportar
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-30 bg-card border border-border rounded-3xl p-6 shadow-2xl w-80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Exportar relatório</p>

                    {/* FILTROS */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-muted">De</label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={e => setDataInicio(e.target.value)}
                                    className="w-full p-2.5 bg-background border border-border rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-muted">Até</label>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={e => setDataFim(e.target.value)}
                                    className="w-full p-2.5 bg-background border border-border rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full p-2.5 bg-background border border-border rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary"
                            >
                                <option value="TODOS">Todos</option>
                                <option value="ABERTO">Abertos</option>
                                <option value="EM_ANDAMENTO">Em andamento</option>
                                <option value="CONCLUIDO">Concluídos</option>
                                <option value="EM_PAUSA">Pausados</option>
                            </select>
                        </div>
                    </div>

                    {/* BOTÕES */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={exportPDF}
                            disabled={!!loading}
                            className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {loading === 'pdf'
                                ? <Loader2 size={14} className="animate-spin"/>
                                : <FileText size={14}/>
                            }
                            PDF
                        </button>
                        <button
                            onClick={exportExcel}
                            disabled={!!loading}
                            className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {loading === 'excel'
                                ? <Loader2 size={14} className="animate-spin"/>
                                : <Table2 size={14}/>
                            }
                            Excel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}