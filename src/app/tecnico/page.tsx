"use client";
import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, LayoutDashboard, X, Inbox, ListChecks, Timer, Coffee, CheckCircle2 } from 'lucide-react';
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
            setTickets({
                disponiveis: data.disponiveis || [],
                meusTrabalhos: data.meusTrabalhos || [],
                pausados: data.pausados || [],
                finalizados: data.finalizados || []
            });
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        fetchTickets();
        window.addEventListener('focus', fetchTickets);
        return () => window.removeEventListener('focus', fetchTickets);
    }, [fetchTickets]);

    const handleAction = async (ticketId: string, action: 'ASSUMIR') => {
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10">
            <div className="max-w-[1700px] mx-auto space-y-12">
                <header className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl"><LayoutDashboard size={28} /></div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Central de Chamados</h1>
                            <p className="text-slate-400 text-sm font-bold">Técnico: <span className="text-blue-600">{session?.user?.name}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                placeholder="Buscar chamado..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchTickets} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 rounded-2xl hover:text-blue-600">
                            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </header>

                <main className="space-y-16">
                    {/* GRID DE 4 COLUNAS PARA PC */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                        <TicketColumn title="Aguardando" icon={<ListChecks size={18}/>} color="amber" tickets={filterList(tickets.disponiveis)} onAction={handleAction} actionLabel="Assumir" />
                        <TicketColumn title="Em Andamento" icon={<Timer size={18}/>} color="blue" tickets={filterList(tickets.meusTrabalhos)} isMine />
                        <TicketColumn title="Pausados" icon={<Coffee size={18}/>} color="purple" tickets={filterList(tickets.pausados)} isMine />
                        <TicketColumn title="Concluídos" icon={<CheckCircle2 size={18}/>} color="slate" tickets={filterList(tickets.finalizados)} isDisabled />
                    </div>
                </main>
            </div>
        </div>
    );
}

function TicketColumn({ title, icon, color, tickets, onAction, actionLabel, isMine, isDisabled }: any) {
    const colors: any = {
        amber: 'text-amber-500 bg-amber-50',
        blue: 'text-blue-600 bg-blue-50',
        purple: 'text-purple-600 bg-purple-50',
        slate: 'text-slate-500 bg-slate-50'
    };

    return (
        <div className="flex flex-col h-full bg-slate-100/40 dark:bg-slate-900/40 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${colors[color]}`}>{icon}</div>
                    <h2 className="font-black uppercase text-xs tracking-widest text-slate-600">{title}</h2>
                </div>
                <span className="text-[10px] font-black bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm">{tickets.length}</span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                {tickets.length === 0 ? (
                    <div className="text-center py-10 opacity-30 font-black text-[10px] uppercase">Vazio</div>
                ) : (
                    tickets.map((t: any) => (
                        <TicketCard key={t.id} ticket={t} onAction={onAction} actionLabel={actionLabel} isMine={isMine} isDisabled={isDisabled} />
                    ))
                )}
            </div>
        </div>
    );
}