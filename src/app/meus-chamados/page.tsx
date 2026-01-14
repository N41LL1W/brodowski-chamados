"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, MessageSquare, AlertTriangle } from 'lucide-react';

export default function MeusChamadosPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tickets')
            .then(res => res.json())
            .then(data => {
                setTickets(data);
                setLoading(false);
            });
    }, []);

    const getPriorityColor = (prio: string) => {
        if (prio === 'alta' || prio === 'urgente') return 'bg-red-100 text-red-700';
        if (prio === 'normal') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    if (loading) return <p className="p-8 text-center">Carregando seus chamados...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Meus Chamados</h1>
            
            {tickets.length === 0 ? (
                <Card className="p-10 text-center text-gray-500">
                    Você ainda não abriu nenhum chamado.
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket: any) => (
                        <Card key={ticket.id} className="p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full uppercase">
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800">{ticket.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">{ticket.description}</p>
                                </div>
                                <div className="text-right text-xs text-gray-400">
                                    <div className="flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                    </div>
                                    <p className="mt-2 text-gray-500 font-medium">Cod: #{ticket.id}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}