"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, PlayCircle, Clock, User, MessageCircle } from 'lucide-react';
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function PainelTecnicoPage() {
    const { data: session } = useSession();
    const [disponiveis, setDisponiveis] = useState([]);
    const [meusChamados, setMeusChamados] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            // Chamando a API que separa as listas
            const res = await fetch('/api/admin/tickets');
            const data = await res.json();
            setDisponiveis(data.disponiveis || []);
            setMeusChamados(data.meusTrabalhos || []);
        } catch (error) {
            console.error("Erro ao buscar tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const assumirChamado = async (ticketId: string) => {
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'ATENDIMENTO',
                assignedToId: (session?.user as any)?.id 
            })
        });

        if (res.ok) fetchTickets();
    };

    const finalizarChamado = async (ticketId: string) => {
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CONCLUIDO' })
        });

        if (res.ok) fetchTickets();
    };

    if (loading) return <div className="p-10 text-center text-gray-500 font-bold animate-pulse">Sincronizando fila de Brodowski...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            <div>
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Painel de Atendimento TI</h1>
                <p className="text-slate-500">Gestão de chamados e suporte técnico</p>
            </div>

            {/* SEÇÃO 1: DISPONÍVEIS */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
                    <h2 className="text-lg font-bold text-slate-700 uppercase tracking-tight">Aguardando Técnico ({disponiveis.length})</h2>
                </div>
                
                <div className="grid gap-4">
                    {disponiveis.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-medium">
                            Nenhum chamado novo na fila.
                        </div>
                    ) : (
                        disponiveis.map((ticket: any) => (
                            <TicketCard key={ticket.id} ticket={ticket} onAction={() => assumirChamado(ticket.id)} actionLabel="Assumir" actionColor="bg-blue-600" />
                        ))
                    )}
                </div>
            </section>

            {/* SEÇÃO 2: MEUS ATENDIMENTOS */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h2 className="text-lg font-bold text-slate-700 uppercase tracking-tight">Meus Atendimentos em Curso ({meusChamados.length})</h2>
                </div>

                <div className="grid gap-4">
                    {meusChamados.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-medium">
                            Você não assumiu nenhum chamado ainda.
                        </div>
                    ) : (
                        meusChamados.map((ticket: any) => (
                            <TicketCard 
                                key={ticket.id} 
                                ticket={ticket} 
                                onAction={() => finalizarChamado(ticket.id)} 
                                actionLabel="Finalizar" 
                                actionColor="bg-emerald-600"
                                isMine
                            />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

// Sub-componente para o Card
function TicketCard({ ticket, onAction, actionLabel, actionColor, isMine = false }: any) {
    return (
        <Card className={`p-5 transition-all hover:shadow-md border-l-4 ${isMine ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">{ticket.protocol}</span>
                        <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-800">{ticket.subject || ticket.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User size={14}/> {ticket.requester?.name}</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <Link 
                        href={`/meus-chamados/${ticket.id}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
                    >
                        <MessageCircle size={16}/> Detalhes / Chat
                    </Link>
                    <button 
                        onClick={onAction}
                        className={`flex-1 md:flex-none px-6 py-2 ${actionColor} text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all uppercase`}
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </Card>
    );
}