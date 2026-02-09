"use client";

import { useEffect, useState } from 'react';
import { Search, RefreshCw, LayoutDashboard, X, Inbox, Filter } from 'lucide-react';
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
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                        <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-full"></div>
                    </div>
                    <p className="font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Central</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-12">
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 border-b border-slate-100 pb-12">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-200">
                            <LayoutDashboard size={32} />
                        </div>
                        Central Técnica
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">
                        Operador: <span className="text-blue-600 font-black italic">{session?.user?.name}</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            placeholder="Buscar protocolo ou solicitante..."
                            className="w-full pl-14 pr-12 py-5 bg-white border-2 border-slate-100 rounded-4xl text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none shadow-sm transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-5 top-1/2 -translate-y-1/2 bg-slate-100 p-1.5 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button onClick={fetchTickets} className="p-5 bg-white border-2 border-slate-100 hover:border-blue-500 hover:text-blue-600 rounded-3xl shadow-sm transition-all active:scale-95">
                        <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            <main className="grid gap-16">
                <TicketSection 
                    title="Chamados em Aberto" 
                    count={tickets.disponiveis.length}
                    tickets={filterList(tickets.disponiveis)} 
                    onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                    actionLabel="Assumir Chamado"
                    color="amber"
                />

                <TicketSection 
                    title="Meus Atendimentos" 
                    count={tickets.meusTrabalhos.length}
                    tickets={filterList(tickets.meusTrabalhos)} 
                    color="blue"
                    isMine
                />

                <TicketSection 
                    title="Concluídos Hoje" 
                    count={tickets.finalizados.length}
                    tickets={filterList(tickets.finalizados)} 
                    color="slate"
                    isDisabled
                />
            </main>
        </div>
    );
}

// Subcomponente de Seção para Organização
function TicketSection({ title, count, tickets, onAction, actionLabel, color, isMine, isDisabled }: any) {
    const theme = {
        amber: 'bg-amber-500 text-amber-500 border-amber-100',
        blue: 'bg-blue-600 text-blue-600 border-blue-100',
        slate: 'bg-slate-400 text-slate-400 border-slate-100'
    }[color as 'amber' | 'blue' | 'slate'];

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-10 rounded-full ${theme.split(' ')[0]}`}></div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{title}</h2>
                </div>
                <div className={`px-6 py-2 rounded-full border-2 font-black text-xs uppercase tracking-widest ${theme.split(' ').slice(1).join(' ')}`}>
                    {count} registros
                </div>
            </div>
            
            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <div className="py-24 border-4 border-dashed border-slate-100 rounded-[4rem] text-center bg-slate-50/30">
                        <Inbox className="mx-auto text-slate-200 mb-6" size={64} strokeWidth={1} />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Fila de processamento vazia</p>
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