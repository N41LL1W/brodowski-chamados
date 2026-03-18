"use client";
import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, LayoutDashboard, ListChecks, Timer, Coffee, CheckCircle2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import TicketCard from '@/components/TicketCard';

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState({ disponiveis: [], meusTrabalhos: [], pausados: [], finalizados: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?t=${Date.now()}`);
            const data = await res.json();
            setTickets(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        fetchTickets();
        window.addEventListener('focus', fetchTickets);
        return () => window.removeEventListener('focus', fetchTickets);
    }, [fetchTickets]);

    // Aceita qualquer ação (ASSUMIR, RETOMAR, etc) enviada pelo Card
    const handleAction = async (ticketId: string, action: string) => {
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }) 
        });
        if (res.ok) fetchTickets();
    };

    const filterList = (list: any[]) => {
        if (!searchTerm.trim()) return list;
        const term = searchTerm.toLowerCase();
        return list.filter(t => t.protocol?.toLowerCase().includes(term) || t.subject?.toLowerCase().includes(term));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><LayoutDashboard size={24} /></div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">Painel de Chamados</h1>
                            <p className="text-slate-400 text-xs font-bold uppercase">Técnico: <span className="text-blue-600">{session?.user?.name}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border rounded-xl outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm"
                                placeholder="Buscar..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchTickets} className="p-3 bg-white dark:bg-slate-900 border rounded-xl hover:bg-slate-50 transition-colors">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </header>

                <main className="space-y-16">
                    {/* SEÇÃO AGUARDANDO: Botão ASSUMIR */}
                    <Section title="Aguardando" icon={<ListChecks size={20}/>} color="amber" 
                        tickets={filterList(tickets.disponiveis)} 
                        onAction={(id: string) => handleAction(id, 'ASSUMIR')} 
                        actionLabel="Assumir" />
                    
                    {/* SEÇÃO EM ANDAMENTO */}
                    <Section title="Em Atendimento" icon={<Timer size={20}/>} color="blue" 
                        tickets={filterList(tickets.meusTrabalhos)} isMine />

                    {/* SEÇÃO PAUSADOS: Botão RETOMAR */}
                    <Section title="Pausados" icon={<Coffee size={20}/>} color="purple" 
                        tickets={filterList(tickets.pausados)} 
                        onAction={(id: string) => handleAction(id, 'RETOMAR')} 
                        actionLabel="Retomar"
                        isMine />

                    {/* SEÇÃO CONCLUÍDOS */}
                    <Section title="Concluídos" icon={<CheckCircle2 size={20}/>} color="slate" 
                        tickets={filterList(tickets.finalizados)} isDisabled />
                </main>
            </div>
        </div>
    );
}

function Section({ title, icon, color, tickets, onAction, actionLabel, isMine, isDisabled }: any) {
    const colors: any = {
        amber: 'bg-amber-500 text-white',
        blue: 'bg-blue-600 text-white',
        purple: 'bg-purple-600 text-white',
        slate: 'bg-slate-500 text-white'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
                <h2 className="font-black uppercase text-sm tracking-widest">{title} <span className="ml-2 text-slate-400">({tickets.length})</span></h2>
            </div>

            {tickets.length === 0 ? (
                <div className="py-6 text-slate-400 font-bold text-xs uppercase italic text-center border-2 border-dashed border-slate-200 rounded-3xl">Nenhum chamado aqui</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((t: any) => (
                        <TicketCard key={t.id} ticket={t} onAction={onAction} actionLabel={actionLabel} isMine={isMine} isDisabled={isDisabled} />
                    ))}
                </div>
            )}
        </div>
    );
}