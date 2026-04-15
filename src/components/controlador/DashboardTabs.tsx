"use client";

import { useEffect, useState } from 'react';
import { BarChart3, Activity, Users, TrendingUp } from 'lucide-react';
import TabExecutivo from './TabExecutivo';
import TabOperacional from './TabOperacional';

const TABS = [
    { id: 'executivo',   label: 'Executivo',   icon: TrendingUp },
    { id: 'operacional', label: 'Operacional',  icon: Activity },
    { id: 'tecnicos',    label: 'Técnicos',     icon: Users },
];

export default function DashboardTabs() {
    const [activeTab, setActiveTab] = useState('executivo');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/controlador/dashboard')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="text-center text-muted py-20">Erro ao carregar dados.</div>
    );

    return (
        <div className="space-y-6">
            {/* ABAS */}
            <div className="flex gap-2 bg-card border border-border p-1.5 rounded-2xl w-fit">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                active 
                                    ? 'bg-primary text-white shadow-lg' 
                                    : 'text-muted hover:text-foreground'
                            }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* CONTEÚDO */}
            {activeTab === 'executivo'   && <TabExecutivo data={data} />}
            {activeTab === 'operacional' && <TabOperacional data={data} />}
            {activeTab === 'tecnicos'    && <TabTecnicos data={data} />}
        </div>
    );
}

function TabTecnicos({ data }: any) {
    return (
        <div className="space-y-4">
            {data.tecnicos.length === 0 ? (
                <div className="text-center text-muted py-20 border-2 border-dashed border-border rounded-3xl">
                    Nenhum técnico cadastrado.
                </div>
            ) : (
                data.tecnicos
                    .sort((a: any, b: any) => b.concluidos - a.concluidos)
                    .map((t: any, i: number) => (
                        <div key={t.id} className="bg-card border border-border rounded-3xl p-6 flex items-center gap-6">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-foreground uppercase tracking-tight truncate">{t.name}</p>
                                <div className="flex gap-4 mt-2">
                                    <span className="text-[10px] font-black text-blue-600 uppercase">
                                        {t.ativos} ativos
                                    </span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">
                                        {t.concluidos} concluídos
                                    </span>
                                    <span className="text-[10px] font-black text-muted uppercase">
                                        {t.total} total
                                    </span>
                                </div>
                            </div>
                            {/* Barra de progresso */}
                            <div className="w-32 hidden md:block">
                                <div className="h-2 bg-border rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: t.total > 0 ? `${Math.round((t.concluidos / t.total) * 100)}%` : '0%' }}
                                    />
                                </div>
                                <p className="text-[9px] text-muted mt-1 text-right font-bold">
                                    {t.total > 0 ? Math.round((t.concluidos / t.total) * 100) : 0}% concluído
                                </p>
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}