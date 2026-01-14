"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, PlayCircle, Clock, User, AlertCircle } from 'lucide-react';

export default function PainelTecnicoPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        const res = await fetch('/api/tickets');
        const data = await res.json();
        setTickets(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const updateStatus = async (ticketId: string, newStatus: string) => {
        // Vamos criar esta rota de update a seguir
        const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) fetchTickets(); // Recarrega a lista
    };

    const getPriorityStyle = (prio: string) => {
        switch(prio) {
            case 'alta': case 'urgente': return 'bg-red-600 text-white';
            case 'normal': return 'bg-blue-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">A carregar fila de chamados...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Painel de Atendimento</h1>
                    <p className="text-gray-500 text-sm">Gerencie todos os chamados da Prefeitura</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <span className="block text-xs text-blue-600 font-bold uppercase">Total na Fila</span>
                    <span className="text-2xl font-black text-blue-800">{tickets.length}</span>
                </div>
            </div>

            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <Card className="p-20 text-center text-gray-400">
                        Nenhum chamado pendente no momento.
                    </Card>
                ) : (
                    tickets.map((ticket: any) => (
                        <Card key={ticket.id} className="p-6 border-l-8 border-l-blue-600 shadow-sm">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                                        <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{ticket.title}</h2>
                                    <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded">{ticket.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-semibold">Solicitante:</span> {ticket.user?.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold">Status Atual:</span> 
                                            <span className="text-orange-600 font-bold">{ticket.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row lg:flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                                    <button 
                                        onClick={() => updateStatus(ticket.id, 'Em Atendimento')}
                                        className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        <PlayCircle className="w-4 h-4" /> Assumir
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(ticket.id, 'Concluído')}
                                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Finalizar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}