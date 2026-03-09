"use client";

import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, LayoutDashboard, X, Inbox } from 'lucide-react';
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
            // Adicionado timestamp para evitar cache e garantir atualização
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
        // Atualiza ao focar na aba (útil se o técnico mudar de status em outra aba)
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

    if (loading && tickets.disponiveis.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center space-y-4 px-6">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Sincronizando Central...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-12">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-blue-600 rounded-2xl md:rounded-3xl text-white shadow-xl shadow-blue-500/20">
                            <LayoutDashboard size={24} />
                        </div>
                        Central Técnica
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm md:text-lg">
                        Operador: <span className="text-blue-600 font-black italic">{session?.user?.name}</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            placeholder="Buscar chamado..."
                            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button onClick={fetchTickets} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:text-blue-600 transition-all">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            <main className="space-y-16">
                <TicketSection 
                    title="Aguardando" 
                    count={tickets.disponiveis.length}
                    tickets={filterList(tickets.disponiveis)} 
                    onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                    actionLabel="Assumir"
                    color="amber"
                />

                <TicketSection 
                    title="Em Atendimento" 
                    count={tickets.meusTrabalhos.length}
                    tickets={filterList(tickets.meusTrabalhos)} 
                    color="blue"
                    isMine
                />

                <TicketSection 
                    title="Concluídos" 
                    count={tickets.finalizados.length}
                    tickets={filterList(tickets.finalizados)} 
                    color="slate"
                    isDisabled
                />
            </main>
        </div>
    );
}

function TicketSection({ title, count, tickets, onAction, actionLabel, color, isMine, isDisabled }: any) {
    const bgBadge = {
        amber: 'bg-amber-500',
        blue: 'bg-blue-600',
        slate: 'bg-slate-400'
    }[color as 'amber' | 'blue' | 'slate'];

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className={`w-2 h-8 rounded-full ${bgBadge}`}></div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{title}</h2>
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-500">{count}</span>
            </div>
            
            {/* GRID RESPONSIVA: 1 col no mobile, 2 no tablet, 3 no desktop, 4 em telas ultra-wide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {tickets.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50/50 dark:bg-slate-900/20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                        <Inbox className="mx-auto text-slate-200 dark:text-slate-800 mb-2" size={40} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nenhum chamado nesta categoria</p>
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