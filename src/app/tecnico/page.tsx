"use client";

import { useEffect, useState, useCallback } from 'react';
import {
    Search, RefreshCw, LayoutDashboard,
    ListChecks, Timer, Coffee, CheckCircle2,
    TrendingUp, Clock, Zap
} from 'lucide-react';
import { useSession } from "next-auth/react";
import TicketCard from '@/components/TicketCard';

interface TicketData {
    disponiveis: any[];
    meusTrabalhos: any[];
    pausados: any[];
    finalizados: any[];
}

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<TicketData>({
        disponiveis: [], meusTrabalhos: [], pausados: [], finalizados: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?t=${Date.now()}`);
            if (res.ok) {
                setTickets(await res.json());
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Erro ao carregar chamados:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
        window.addEventListener('focus', fetchTickets);
        // Auto-refresh a cada 60 segundos
        const interval = setInterval(fetchTickets, 60000);
        return () => {
            window.removeEventListener('focus', fetchTickets);
            clearInterval(interval);
        };
    }, [fetchTickets]);

    const handleAction = async (ticketId: string, action: string) => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) fetchTickets();
        } catch (error) {
            console.error('Erro ao executar ação:', error);
        }
    };

    const filterList = (list: any[]) => {
        if (!searchTerm.trim()) return list;
        const term = searchTerm.toLowerCase();
        return list.filter(t =>
            t.protocol?.toLowerCase().includes(term) ||
            t.subject?.toLowerCase().includes(term) ||
            t.requester?.name?.toLowerCase().includes(term) ||
            t.department?.name?.toLowerCase().includes(term)
        );
    };

    const totalAtivo = tickets.meusTrabalhos.length + tickets.pausados.length;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 shrink-0">
                            <LayoutDashboard size={22}/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">
                                Central de Operações
                            </h1>
                            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                                {session?.user?.name || '...'} · Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15}/>
                            <input
                                className="w-full pl-10 pr-4 py-3 bg-card border border-border text-foreground rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-muted/50"
                                placeholder="Buscar por protocolo, assunto..."
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchTickets}
                            disabled={loading}
                            className="p-3 bg-card border border-border rounded-2xl hover:border-primary transition-all active:scale-95 text-muted hover:text-foreground shrink-0"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin text-primary' : ''}/>
                        </button>
                    </div>
                </header>

                {/* STATS RÁPIDOS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <QuickStat
                        label="Disponíveis"
                        value={filterList(tickets.disponiveis).length}
                        icon={<Zap size={16}/>}
                        color="text-amber-600"
                        bg="bg-amber-500/10"
                    />
                    <QuickStat
                        label="Ativos"
                        value={totalAtivo}
                        icon={<Timer size={16}/>}
                        color="text-blue-600"
                        bg="bg-blue-500/10"
                        highlight={totalAtivo > 0}
                    />
                    <QuickStat
                        label="Pausados"
                        value={filterList(tickets.pausados).length}
                        icon={<Coffee size={16}/>}
                        color="text-purple-600"
                        bg="bg-purple-500/10"
                    />
                    <QuickStat
                        label="Concluídos"
                        value={filterList(tickets.finalizados).length}
                        icon={<CheckCircle2 size={16}/>}
                        color="text-emerald-600"
                        bg="bg-emerald-500/10"
                    />
                </div>

                {/* SEÇÕES */}
                <div className="space-y-10">
                    <Section
                        title="Fila de espera"
                        subtitle="Chamados disponíveis para assumir"
                        icon={<ListChecks size={16}/>}
                        color="amber"
                        tickets={filterList(tickets.disponiveis)}
                        onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                        actionLabel="Assumir"
                        mode="disponivel"
                    />
                    <Section
                        title="Meus atendimentos"
                        subtitle="Em andamento agora"
                        icon={<Timer size={16}/>}
                        color="blue"
                        tickets={filterList(tickets.meusTrabalhos)}
                        mode="ativo"
                        isMine
                    />
                    <Section
                        title="Pausados"
                        subtitle="Aguardando retomada"
                        icon={<Coffee size={16}/>}
                        color="purple"
                        tickets={filterList(tickets.pausados)}
                        onAction={(id: string) => handleAction(id, 'RETOMAR')}
                        actionLabel="Retomar"
                        mode="pausado"
                        isMine
                    />
                    <Section
                        title="Concluídos recentemente"
                        subtitle="Histórico dos últimos atendimentos"
                        icon={<CheckCircle2 size={16}/>}
                        color="slate"
                        tickets={filterList(tickets.finalizados)}
                        mode="concluido"
                        isDisabled
                    />
                </div>
            </div>
        </div>
    );
}

function QuickStat({ label, value, icon, color, bg, highlight }: any) {
    return (
        <div className={`bg-card border rounded-2xl p-4 flex items-center gap-3 transition-all ${highlight ? 'border-primary shadow-sm shadow-primary/10' : 'border-border'}`}>
            <div className={`${bg} ${color} p-2.5 rounded-xl shrink-0`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-2xl font-black text-foreground tracking-tighter leading-none">{value}</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest truncate">{label}</p>
            </div>
        </div>
    );
}

function Section({ title, subtitle, icon, color, tickets, onAction, actionLabel, isMine, isDisabled, mode }: any) {
    const colorMap: Record<string, string> = {
        amber:  'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-200 dark:border-amber-900/30',
        blue:   'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-200 dark:border-blue-900/30',
        purple: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-200 dark:border-purple-900/30',
        slate:  'text-muted bg-border/30 border-border',
    };

    const dotMap: Record<string, string> = {
        amber: 'bg-amber-500', blue: 'bg-blue-500',
        purple: 'bg-purple-500', slate: 'bg-muted',
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>{icon}</div>
                    <div>
                        <h2 className="font-black uppercase text-sm tracking-tight text-foreground leading-none">{title}</h2>
                        <p className="text-[10px] font-bold text-muted mt-0.5">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {tickets.length > 0 && (
                        <span className="text-[10px] font-black text-muted uppercase">
                            {tickets.length} {tickets.length === 1 ? 'chamado' : 'chamados'}
                        </span>
                    )}
                    {tickets.length > 0 && (
                        <div className={`w-2 h-2 rounded-full ${dotMap[color]} ${color === 'amber' || color === 'blue' ? 'animate-pulse' : ''}`}/>
                    )}
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="py-8 flex items-center justify-center bg-card/50 border border-dashed border-border rounded-3xl">
                    <p className="text-muted font-black text-[10px] uppercase tracking-widest">Nenhum chamado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map((t: any) => (
                        <TicketCard
                            key={t.id}
                            ticket={t}
                            onAction={onAction}
                            actionLabel={actionLabel}
                            isMine={isMine}
                            isDisabled={isDisabled}
                            mode={mode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}