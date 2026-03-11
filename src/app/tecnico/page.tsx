"use client";

import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, LayoutDashboard, X, Inbox, ListChecks, Timer, CheckCircle2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import TicketCard from '@/components/TicketCard';

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState({ disponiveis: [], meusTrabalhos: [], finalizados: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?t=${Date.now()}`);
            const data = await res.json();
            setTickets({
                disponiveis: data.disponiveis || [],
                meusTrabalhos: data.meusTrabalhos || [],
                finalizados: data.finalizados || []
            });
        } catch (error) {
            console.error("Erro na sincronização:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchTickets();
        window.addEventListener('focus', fetchTickets);
        return () => window.removeEventListener('focus', fetchTickets);
    }, [fetchTickets]);

    const filterList = (list: any[]) => {
        if (!searchTerm.trim()) return list;
        const term = searchTerm.toLowerCase();
        return list.filter(t => 
            t.protocol?.toLowerCase().includes(term) ||
            t.subject?.toLowerCase().includes(term) ||
            t.requester?.name?.toLowerCase().includes(term)
        );
    };

    const handleAction = async (ticketId: string, action: 'ASSUMIR') => {
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }) 
        });
        if (res.ok) fetchTickets();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12">
            <div className="max-w-[1600px] mx-auto space-y-10">
                
                {/* HEADER COM DASHBOARD STATS (O que dá pra implementar a mais) */}
                <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-500/40">
                                <LayoutDashboard size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Central Técnica</h1>
                                <p className="text-slate-500 font-bold italic">Operador: {session?.user?.name}</p>
                            </div>
                        </div>
                        
                        {/* Mini Stats Cards - Novo */}
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                                <ListChecks size={16} className="text-amber-500" />
                                <span className="text-xs font-black uppercase text-slate-500">{tickets.disponiveis.length} Novos</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                                <Timer size={16} className="text-blue-500" />
                                <span className="text-xs font-black uppercase text-slate-500">{tickets.meusTrabalhos.length} Ativos</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-[450px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                placeholder="Buscar por protocolo, assunto ou solicitante..."
                                className="w-full pl-12 pr-12 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <button onClick={fetchTickets} className="p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:text-blue-600 active:scale-95 transition-all">
                            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </header>

                <main className="space-y-20">
                    <TicketSection 
                        title="Fila de Espera" 
                        icon={<ListChecks size={20}/>}
                        count={tickets.disponiveis.length}
                        tickets={filterList(tickets.disponiveis)} 
                        onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                        actionLabel="Assumir Chamado"
                        color="amber"
                    />

                    <TicketSection 
                        title="Meus Atendimentos" 
                        icon={<Timer size={20}/>}
                        count={tickets.meusTrabalhos.length}
                        tickets={filterList(tickets.meusTrabalhos)} 
                        color="blue"
                        isMine
                    />

                    <TicketSection 
                        title="Histórico de Hoje" 
                        icon={<CheckCircle2 size={20}/>}
                        count={tickets.finalizados.length}
                        tickets={filterList(tickets.finalizados)} 
                        color="slate"
                        isDisabled
                    />
                </main>
            </div>
        </div>
    );
}

function TicketSection({ title, icon, count, tickets, onAction, actionLabel, color, isMine, isDisabled }: any) {
    const colorMap = {
        amber: 'bg-amber-500 text-amber-500 border-amber-100',
        blue: 'bg-blue-600 text-blue-600 border-blue-100',
        slate: 'bg-slate-400 text-slate-400 border-slate-100'
    }[color as 'amber' | 'blue' | 'slate'];

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-opacity-10 ${colorMap.split(' ')[0]} ${colorMap.split(' ')[1]}`}>
                        {icon}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {title}
                    </h2>
                </div>
                <div className="h-0.5 flex-1 mx-8 bg-slate-200 dark:bg-slate-800 hidden lg:block" />
                <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 shadow-sm">
                    {count}
                </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {tickets.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-4xl">
                        <Inbox className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={56} />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sem chamados por aqui</p>
                    </div>
                ) : (
                    tickets.map((t: any) => (
                        <TicketCard 
                            key={t.id} 
                            ticket={t} 
                            onAction={onAction} 
                            actionLabel={actionLabel} 
                            isMine={isMine} 
                            isDisabled={isDisabled} 
                        />
                    ))
                )}
            </div>
        </section>
    );
}