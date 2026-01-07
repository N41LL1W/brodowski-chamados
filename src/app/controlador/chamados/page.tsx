"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { TicketIcon, User, Calendar, Clock } from "lucide-react";

export default function GestaoChamadosPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/tickets')
            .then(res => res.json())
            .then(data => {
                setTickets(data);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Em Atendimento': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Concluído': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-10 text-center">A carregar chamados...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestão Geral de Chamados</h1>
                <p className="text-gray-500">Visualização completa de todos os pedidos da prefeitura.</p>
            </header>

            <div className="space-y-4">
                {tickets.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">Nenhum chamado encontrado.</p>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="p-6 hover:shadow-md transition-all border-l-4 border-l-blue-500">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-xs text-gray-400">#{ticket.id.slice(-5)}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
                                    <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                                </div>

                                <div className="flex flex-col justify-between items-end text-sm text-gray-500">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            <span>Solicitante: <strong>{ticket.user?.name}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1 text-blue-600">
                                            <Clock className="w-3 h-3" />
                                            <span>Técnico: <strong>{ticket.assignedTo?.name || "Não atribuído"}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-4">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}