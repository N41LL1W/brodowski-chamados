"use client";

import { useEffect, useState } from 'react';
import { Search, RefreshCw, LayoutDashboard, X, Inbox } from 'lucide-react';
import { useSession } from "next-auth/react";
import TicketCard from '@/components/TicketCard';

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [disponiveis, setDisponiveis] = useState([]);
    const [meusChamados, setMeusChamados] = useState([]);
    const [finalizados, setFinalizados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/tickets');
            const data = await res.json();
            setDisponiveis(data.disponiveis || []);
            setMeusChamados(data.meusTrabalhos || []);
            setFinalizados(data.finalizados || []); 
        } catch (error) {
            console.error("Erro ao buscar tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchTickets(); 
    }, []);

    const filterTickets = (list: any[]) => {
        if (!searchTerm.trim()) return list;
        const term = searchTerm.toLowerCase();
        return list.filter(t => 
            t.protocol?.toLowerCase().includes(term) ||
            t.subject?.toLowerCase().includes(term) ||
            t.requester?.name?.toLowerCase().includes(term) ||
            t.location?.toLowerCase().includes(term)
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

    if (loading && disponiveis.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Central...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            {/* CABEÇALHO */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <LayoutDashboard size={28} />
                        </div>
                        Painel Técnico
                    </h1>
                    <p className="text-slate-500 mt-2 italic">
                        Bem-vindo, <span className="font-bold text-blue-600 not-italic">{session?.user?.name}</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            placeholder="Buscar protocolo, nome ou local..."
                            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-100 p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={fetchTickets} 
                        className="p-4 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-2xl shadow-sm transition-all active:scale-95 group"
                    >
                        <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                    </button>
                </div>
            </header>

            {/* SEÇÕES */}
            <main className="space-y-16">
                {/* 1. CHAMADOS LIVRES */}
                <TicketSection 
                    title="Aguardando Atendimento" 
                    tickets={filterTickets(disponiveis)} 
                    onAction={(id: string) => handleAction(id, 'ASSUMIR')}
                    actionLabel="Assumir Chamado"
                    color="amber"
                />

                {/* 2. MEUS CHAMADOS - Sem onAction pois a finalização é interna */}
                <TicketSection 
                    title="Meus Chamados em Curso" 
                    tickets={filterTickets(meusChamados)} 
                    color="blue"
                    isMine
                />

                {/* 3. HISTÓRICO DE HOJE */}
                <TicketSection 
                    title="Histórico de Hoje" 
                    tickets={filterTickets(finalizados)} 
                    color="slate"
                    isDisabled
                />
            </main>
        </div>
    );
}

interface TicketSectionProps {
    title: string;
    tickets: any[];
    onAction?: (id: string) => void;
    actionLabel?: string;
    color: 'amber' | 'blue' | 'slate';
    isMine?: boolean;
    isDisabled?: boolean;
}

function TicketSection({ title, tickets, onAction, actionLabel, color, isMine, isDisabled }: TicketSectionProps) {
    const colors = { 
        amber: 'bg-amber-500', 
        blue: 'bg-blue-600', 
        slate: 'bg-slate-400' 
    };

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${colors[color]}`}></div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
                </div>
                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {tickets.length} chamados
                </span>
            </div>
            
            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <div className="py-20 border-2 border-dashed border-slate-200 rounded-[3rem] text-center bg-slate-50/50">
                        <Inbox className="mx-auto text-slate-300 mb-4" size={48} strokeWidth={1} />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Nenhum registro encontrado</p>
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