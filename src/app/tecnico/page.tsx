"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, MessageCircle, CheckCheck, Search, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [disponiveis, setDisponiveis] = useState([]);
    const [meusChamados, setMeusChamados] = useState([]);
    const [finalizados, setFinalizados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para busca

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

    // Função de filtro para a busca
    const filterTickets = (list: any[]) => {
        return list.filter(t => 
            t.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.requester?.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (loading && disponiveis.length === 0) return <div className="p-10 text-center font-bold animate-pulse">Carregando central de comando...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* CABEÇALHO COM ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                        <LayoutDashboard className="text-blue-600" /> Painel Técnico
                    </h1>
                    <p className="text-slate-500">Olá, {session?.user?.name}. Você tem {meusChamados.length} chamados em aberto.</p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar protocolo ou nome..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchTickets} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* CARDS DE ESTATÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Aguardando" count={disponiveis.length} color="text-amber-600" bg="bg-amber-50" />
                <StatCard label="Meus Atendimentos" count={meusChamados.length} color="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Concluídos (Total)" count={finalizados.length} color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            {/* LISTAS FILTRADAS */}
            <div className="space-y-10">
                <TicketSection 
                    title="Fila de Espera" 
                    count={filterTickets(disponiveis).length} 
                    tickets={filterTickets(disponiveis)} 
                    onAction={assumirChamado}
                    actionLabel="Assumir"
                    color="amber"
                />

                <TicketSection 
                    title="Em Andamento" 
                    count={filterTickets(meusChamados).length} 
                    tickets={filterTickets(meusChamados)} 
                    onAction={finalizarChamado}
                    actionLabel="Finalizar"
                    color="blue"
                    isMine
                />

                <TicketSection 
                    title="Histórico Recente" 
                    count={filterTickets(finalizados).length} 
                    tickets={filterTickets(finalizados)} 
                    color="slate"
                    isDisabled
                />
            </div>
        </div>
    );
}

// Componentes Auxiliares (Sub-renderers)
function StatCard({ label, count, color, bg }: any) {
    return (
        <div className={`${bg} p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-all`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${color} opacity-80`}>{label}</p>
            <p className={`text-3xl font-black ${color}`}>{count}</p>
        </div>
    );
}

function TicketSection({ title, count, tickets, onAction, actionLabel, color, isMine, isDisabled }: any) {
    const dotColors: any = { amber: 'bg-amber-500', blue: 'bg-blue-500', slate: 'bg-slate-400' };
    
    return (
        <section>
            <div className="flex items-center gap-2 mb-4 border-l-4 border-slate-800 pl-3">
                <div className={`w-2 h-2 rounded-full ${dotColors[color]}`}></div>
                <h2 className="text-lg font-black text-slate-700 uppercase">{title} ({count})</h2>
            </div>
            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="p-8 border-2 border-dashed rounded-3xl text-center text-slate-400">Vazio</div>
                ) : (
                    tickets.map((t: any) => (
                        <TicketCard key={t.id} ticket={t} onAction={() => onAction?.(t.id)} actionLabel={actionLabel} isMine={isMine} isDisabled={isDisabled} />
                    ))
                )}
            </div>
        </section>
    );
}

function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    // Lógica de cor baseada na prioridade
    const priorityColor = ticket.priority === 'URGENTE' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100';

    return (
        <Card className={`p-5 hover:shadow-xl transition-all border-l-4 ${isMine ? 'border-l-blue-500 shadow-blue-50' : (isDisabled ? 'border-l-slate-300 grayscale-[0.5]' : 'border-l-amber-500')}`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-800 text-white rounded">{ticket.protocol}</span>
                        <Badge variant="priority" className={priorityColor} value={ticket.priority}>{ticket.priority}</Badge>
                        {isDisabled && <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><CheckCheck size={12}/> Finalizado</span>}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{ticket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium"><User size={14}/> {ticket.requester?.name}</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(ticket.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        {ticket.location && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold italic">📍 {ticket.location}</span>}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Link href={`/meus-chamados/${ticket.id}`} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all" title="Ver Detalhes">
                        <MessageCircle size={20}/>
                    </Link>
                    {!isDisabled && (
                        <button onClick={onAction} className={`px-6 py-2 rounded-xl font-black text-xs uppercase text-white transition-all shadow-lg ${isMine ? 'bg-emerald-500 shadow-emerald-100' : 'bg-blue-600 shadow-blue-100'}`}>
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}