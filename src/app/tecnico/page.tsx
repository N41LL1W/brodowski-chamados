"use client";

import { useEffect, useState } from 'react';
import { Search, RefreshCw, LayoutDashboard, X, Inbox } from 'lucide-react';
import { useSession } from "next-auth/react";
import TicketCard from '@/components/TicketCard';

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState({ disponiveis: [], meusTrabalhos: [], finalizados: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/tickets');
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
    };

    useEffect(() => { fetchTickets(); }, []);

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
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
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

            <main className="space-y-12 md:space-y-20">
                <TicketSection 
                    title="Aguardando" 
                    count={tickets.disponiveis.length}
                    tickets={filterList(tickets.disponiveis)} 
                    onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                    actionLabel="Assumir"
                    color="amber"
                />

                <TicketSection 
                    title="Em Andamento" 
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
    const colors = {
        amber: 'bg-amber-500 text-amber-600',
        blue: 'bg-blue-600 text-blue-600',
        slate: 'bg-slate-400 text-slate-500'
    }[color as 'amber' | 'blue' | 'slate'];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-6 rounded-full ${colors.split(' ')[0]}`}></div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-500">
                    {count} chamados
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {tickets.length === 0 ? (
                    <div className="md:col-span-full py-12 text-center bg-slate-50/50 dark:bg-slate-900/20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-4xl">
                        <Inbox className="mx-auto text-slate-200 dark:text-slate-800 mb-2" size={40} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vazio</p>
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