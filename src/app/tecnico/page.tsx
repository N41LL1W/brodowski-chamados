"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, MessageCircle, CheckCheck, Search, RefreshCw, LayoutDashboard, X } from 'lucide-react';
import { useSession } from "next-auth/react";
import Link from 'next/link';

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

    // Lógica de Busca: Se vazio, retorna a lista original. Filtra por Protocolo, Assunto, Requerente e Local.
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
        return <div className="p-10 text-center font-bold animate-pulse text-slate-400 uppercase tracking-widest">Sincronizando Central de Suporte...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            
            {/* HEADER COM BUSCA E REFRESH */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                        <LayoutDashboard className="text-blue-600" size={32} /> Painel de Atendimento
                    </h1>
                    <p className="text-slate-500 font-medium">Logado como: <span className="text-blue-600">{session?.user?.name}</span></p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            placeholder="Buscar por protocolo, nome ou local..."
                            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all shadow-slate-100"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={fetchTickets} 
                        className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-2xl transition-all shadow-sm active:scale-95"
                        title="Atualizar lista"
                    >
                        <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* CARDS DE RESUMO (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Disponíveis" count={disponiveis.length} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
                <StatCard label="Meus Atendimentos" count={meusChamados.length} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
                <StatCard label="Minhas Finalizações" count={finalizados.length} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
            </div>

            {/* SEÇÕES DE TICKETS */}
            <div className="space-y-12">
                <TicketSection 
                    title="Fila de Espera" 
                    count={filterTickets(disponiveis).length} 
                    tickets={filterTickets(disponiveis)} 
                    onAction={assumirChamado}
                    actionLabel="Assumir Chamado"
                    color="amber"
                />

                <TicketSection 
                    title="Atendimentos em Curso" 
                    count={filterTickets(meusChamados).length} 
                    tickets={filterTickets(meusChamados)} 
                    onAction={finalizarChamado}
                    actionLabel="Finalizar"
                    color="blue"
                    isMine
                />

                <TicketSection 
                    title="Histórico de Finalizados" 
                    count={filterTickets(finalizados).length} 
                    tickets={filterTickets(finalizados)} 
                    color="slate"
                    isDisabled
                />
            </div>
        </div>
    );
}

// --- SUB-COMPONENTES AUXILIARES ---

function StatCard({ label, count, color, bg, border }: any) {
    return (
        <div className={`${bg} ${border} p-6 rounded-3xl border-2 transition-all hover:shadow-lg hover:shadow-slate-100`}>
            <p className={`text-xs font-black uppercase tracking-widest ${color} opacity-70 mb-1`}>{label}</p>
            <p className={`text-4xl font-black ${color}`}>{count}</p>
        </div>
    );
}

function TicketSection({ title, count, tickets, onAction, actionLabel, color, isMine, isDisabled }: any) {
    const dotColors: any = { amber: 'bg-amber-500', blue: 'bg-blue-500', slate: 'bg-slate-400' };
    
    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dotColors[color]} ${color === 'amber' && count > 0 ? 'animate-pulse' : ''}`}></div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
                </div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{count} chamados</span>
            </div>
            
            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                        <p className="text-slate-400 font-medium">Nenhum chamado encontrado nesta categoria.</p>
                    </div>
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

function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    return (
        <Card className={`group p-5 transition-all hover:shadow-2xl border-l-[6px] ${isMine ? 'border-l-blue-500 bg-blue-50/30' : (isDisabled ? 'border-l-slate-300 grayscale-[0.4]' : 'border-l-amber-500')}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-sm">{ticket.protocol}</span>
                        <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                        {isDisabled && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase flex items-center gap-1 border border-emerald-100">
                                <CheckCheck size={14}/> Concluído
                            </span>
                        )}
                    </div>
                    
                    <h3 className="font-extrabold text-slate-800 text-xl tracking-tight group-hover:text-blue-700 transition-colors">
                        {ticket.subject}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700"><User size={16} className="text-slate-400"/> {ticket.requester?.name}</span>
                        <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400"/> {new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
                        {ticket.location && (
                            <span className="flex items-center gap-1.5 bg-blue-100/50 text-blue-800 px-3 py-1 rounded-full font-black text-[11px] uppercase tracking-wider">
                                📍 {ticket.location}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link 
                        href={`/meus-chamados/${ticket.id}`} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-700 rounded-2xl font-black text-xs uppercase transition-all"
                    >
                        <MessageCircle size={18}/> Detalhes
                    </Link>
                    {!isDisabled && (
                        <button 
                            onClick={onAction} 
                            className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-xs uppercase text-white transition-all shadow-lg active:scale-95 ${isMine ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}