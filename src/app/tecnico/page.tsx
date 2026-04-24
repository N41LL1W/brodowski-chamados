"use client";

import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, LayoutDashboard, ListChecks, Timer, Coffee, CheckCircle2 } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?t=${Date.now()}`);
            if (res.ok) setTickets(await res.json());
        } catch (error) {
            console.error("Erro ao carregar chamados:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
        window.addEventListener('focus', fetchTickets);
        return () => window.removeEventListener('focus', fetchTickets);
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
            console.error("Erro ao executar ação:", error);
        }
    };

    const filterList = (list: any[]) => {
        if (!searchTerm.trim()) return list;
        const term = searchTerm.toLowerCase();
        return list.filter(t =>
            t.protocol?.toLowerCase().includes(term) ||
            t.subject?.toLowerCase().includes(term) ||
            t.requester?.name?.toLowerCase().includes(term)
        );
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto space-y-10">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                            <LayoutDashboard size={24}/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground">
                                Central de Operações
                            </h1>
                            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                                Operador: <span className="text-primary italic">{session?.user?.name || "..."}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16}/>
                            <input
                                className="w-full pl-11 pr-4 py-3 bg-card border border-border text-foreground rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-muted/60"
                                placeholder="Buscar por protocolo, assunto..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchTickets}
                            disabled={loading}
                            className="p-3 bg-card border border-border rounded-2xl hover:border-primary transition-all active:scale-95 text-muted hover:text-foreground"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin text-primary" : ""}/>
                        </button>
                    </div>
                </header>

                {/* SEÇÕES */}
                <div className="space-y-12">
                    <Section
                        title="Fila de espera"
                        icon={<ListChecks size={18}/>}
                        color="amber"
                        tickets={filterList(tickets.disponiveis)}
                        onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                        actionLabel="Assumir"
                    />
                    <Section
                        title="Meus atendimentos ativos"
                        icon={<Timer size={18}/>}
                        color="blue"
                        tickets={filterList(tickets.meusTrabalhos)}
                        isMine
                    />
                    <Section
                        title="Pausados / pendentes"
                        icon={<Coffee size={18}/>}
                        color="purple"
                        tickets={filterList(tickets.pausados)}
                        onAction={(id: string) => handleAction(id, 'RETOMAR')}
                        actionLabel="Retomar"
                        isMine
                    />
                    <Section
                        title="Concluídos recentemente"
                        icon={<CheckCircle2 size={18}/>}
                        color="slate"
                        tickets={filterList(tickets.finalizados)}
                        isDisabled
                    />
                </div>
            </div>
        </div>
    );
}

function Section({ title, icon, color, tickets, onAction, actionLabel, isMine, isDisabled }: any) {
    const colorMap: any = {
        amber:  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
        blue:   'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30',
        slate:  'bg-border/50 text-muted border-border',
    };

    const dotMap: any = {
        amber:  'bg-amber-500',
        blue:   'bg-blue-500',
        purple: 'bg-purple-500',
        slate:  'bg-muted',
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
                        {icon}
                    </div>
                    <div>
                        <h2 className="font-black uppercase text-base tracking-tight text-foreground">{title}</h2>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                            {tickets.length} {tickets.length === 1 ? 'chamado' : 'chamados'}
                        </p>
                    </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${dotMap[color]} ${tickets.length > 0 ? 'animate-pulse' : 'opacity-30'}`}/>
            </div>

            {tickets.length === 0 ? (
                <div className="py-10 flex items-center justify-center bg-card/50 border border-dashed border-border rounded-3xl">
                    <p className="text-muted font-black text-[10px] uppercase tracking-widest">Nenhum chamado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tickets.map((t: any) => (
                        <TicketCard
                            key={t.id}
                            ticket={t}
                            onAction={onAction}
                            actionLabel={actionLabel}
                            isMine={isMine}
                            isDisabled={isDisabled}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}