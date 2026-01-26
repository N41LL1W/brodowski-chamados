"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Search, RefreshCw, LayoutDashboard, X } from 'lucide-react';
import { useSession } from "next-auth/react";
import TicketCard from '@/components/TicketCard'; // Ajuste o caminho se necessário

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

    useEffect(() => { fetchTickets(); }, []);

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

    const assumirChamado = async (ticketId: string) => {
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ASSUMIR' }) 
        });
        if (res.ok) fetchTickets();
    };

    const finalizarChamado = async (ticketId: string) => {
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'FINALIZAR' })
        });
        if (res.ok) fetchTickets();
    };

    if (loading && disponiveis.length === 0) {
        return <div className="p-10 text-center font-bold animate-pulse text-slate-400 uppercase tracking-widest">Sincronizando Central...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                        <LayoutDashboard className="text-blue-600" size={32} /> Painel Técnico
                    </h1>
                    <p className="text-slate-500">Olá, <span className="font-bold text-slate-700">{session?.user?.name}</span></p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            placeholder="Buscar protocolo, nome ou local..."
                            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 p-1 rounded-full text-slate-500 hover:bg-slate-200">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button onClick={fetchTickets} className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl shadow-sm">
                        <RefreshCw size={22} className={loading ? "animate-spin text-blue-600" : ""} />
                    </button>
                </div>
            </div>

            {/* LISTAS FILTRADAS */}
            <div className="space-y-12">
                <TicketSection 
                    title="Fila de Espera" 
                    tickets={filterTickets(disponiveis)} 
                    onAction={assumirChamado}
                    actionLabel="Assumir"
                    color="amber"
                />

                <TicketSection 
                    title="Em Atendimento" 
                    tickets={filterTickets(meusChamados)} 
                    onAction={finalizarChamado}
                    actionLabel="Finalizar"
                    color="blue"
                    isMine
                />

                <TicketSection 
                    title="Histórico Recente" 
                    tickets={filterTickets(finalizados)} 
                    color="slate"
                    isDisabled
                />
            </div>
        </div>
    );
}

// Sub-componente de Seção para organizar o código
function TicketSection({ title, tickets, onAction, actionLabel, color, isMine, isDisabled }: any) {
    const dotColors: any = { amber: 'bg-amber-500', blue: 'bg-blue-500', slate: 'bg-slate-400' };
    return (
        <section>
            <div className="flex items-center gap-3 mb-6 border-l-4 border-slate-800 pl-4 font-black text-slate-800 uppercase tracking-tight text-xl">
                <div className={`w-3 h-3 rounded-full ${dotColors[color]}`}></div>
                {title} ({tickets.length})
            </div>
            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-4x1 text-center text-slate-400">Vazio</div>
                ) : (
                    tickets.map((t: any) => (
                        <TicketCard 
                            key={t.id} 
                            ticket={t} 
                            onAction={() => onAction?.(t.id)} 
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