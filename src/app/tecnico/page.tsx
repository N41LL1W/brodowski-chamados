//src\app\tecnico\page.tsx

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
    const [tickets, setTickets] = useState<TicketData>({ disponiveis: [], meusTrabalhos: [], pausados: [], finalizados: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
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
        <div className="min-h-screen bg-background dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
                
                <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 dark:bg-blue-700 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                            <LayoutDashboard size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Central de Operações</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                Operador: <span className="text-blue-600 dark:text-blue-400 italic">{session?.user?.name || "Carregando..."}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-card dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-foreground dark:text-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all"
                                placeholder="Buscar por Protocolo, Assunto..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={fetchTickets} 
                            disabled={loading}
                            className="p-4 bg-card dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-background dark:hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <RefreshCw size={24} className={`${loading ? "animate-spin text-blue-600" : "text-slate-600 dark:text-slate-400"}`} />
                        </button>
                    </div>
                </header>

                <main className="space-y-20">
                    <Section title="Fila de Espera" icon={<ListChecks size={20}/>} color="amber" tickets={filterList(tickets.disponiveis)} onAction={(id: string) => handleAction(id, 'ASSUMIR')} actionLabel="Assumir" />
                    <Section title="Meus Atendimentos Ativos" icon={<Timer size={20}/>} color="blue" tickets={filterList(tickets.meusTrabalhos)} isMine />
                    <Section title="Pausados / Pendentes" icon={<Coffee size={20}/>} color="purple" tickets={filterList(tickets.pausados)} onAction={(id: string) => handleAction(id, 'RETOMAR')} actionLabel="Retomar" isMine />
                    <Section title="Concluídos Recentemente" icon={<CheckCircle2 size={20}/>} color="slate" tickets={filterList(tickets.finalizados)} isDisabled />
                </main>
            </div>
        </div>
    );
}

function Section({ title, icon, color, tickets, onAction, actionLabel, isMine, isDisabled }: any) {
    const colorVariants: any = {
        amber: 'bg-amber-500 text-white shadow-amber-500/20',
        blue: 'bg-blue-600 text-white shadow-blue-500/20',
        purple: 'bg-purple-600 text-white shadow-purple-500/20',
        slate: 'bg-background0 text-white shadow-slate-500/20'
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-900 pb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-lg ${colorVariants[color]}`}>{icon}</div>
                    <div>
                        <h2 className="font-black uppercase text-lg tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total: {tickets.length}</p>
                    </div>
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center bg-background/50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] opacity-60">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nenhum chamado encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tickets.map((t: any) => (
                        <TicketCard key={t.id} ticket={t} onAction={onAction} actionLabel={actionLabel} isMine={isMine} isDisabled={isDisabled} />
                    ))}
                </div>
            )}
        </div>
    );
}