"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { User, Calendar, Clock, CheckCircle } from "lucide-react";

export default function GestaoChamadosPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [resTickets, resUsers] = await Promise.all([
                fetch('/api/admin/tickets'),
                fetch('/api/admin/users') // Reutilizando a API de usuários
            ]);
            
            const ticketsData = await resTickets.json();
            const usersData = await resUsers.json();
            
            setTickets(ticketsData);
            // Filtra apenas quem é TECNICO ou MASTER para aparecer na lista de atribuição
            setTechnicians(usersData.filter((u: any) => u.role === 'TECNICO' || u.role === 'MASTER'));
            setLoading(false);
        }
        loadData();
    }, []);

    const handleAssign = async (ticketId: number, techId: string) => {
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}/assign`, {
                method: 'PATCH',
                body: JSON.stringify({ technicianId: techId || null }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                // Atualiza a lista localmente para refletir a mudança
                setTickets(tickets.map(t => 
                    t.id === ticketId 
                    ? { ...t, assignedToId: techId, status: techId ? "Em Atendimento" : "Aberto" } 
                    : t
                ));
            }
        } catch (error) {
            alert("Erro ao atribuir técnico");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Carregando gestão de chamados...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Painel de Atribuição</h1>
                <p className="text-gray-500 font-medium">Distribua as demandas para a equipe técnica.</p>
            </header>

            <div className="grid gap-6">
                {tickets.map((ticket) => (
                    <Card key={ticket.id} className="p-6 border-l-8 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                        ticket.status === 'Aberto' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                        ticket.status === 'Em Atendimento' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                        'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-gray-400 font-mono text-sm">ID: #{ticket.id}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
                                <p className="text-gray-600 text-sm italic">"{ticket.description}"</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg w-fit">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Solicitante: <span className="font-semibold text-gray-700">{ticket.user?.name}</span></span>
                                </div>
                            </div>

                            <div className="w-full lg:w-72 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">Responsável Técnico</label>
                                    <select 
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={ticket.assignedToId || ""}
                                        onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                    >
                                        <option value="">Aguardando Técnico...</option>
                                        {technicians.map(tech => (
                                            <option key={tech.id} value={tech.id}>{tech.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-center justify-end gap-2 text-[11px] text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}