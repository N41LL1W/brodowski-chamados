"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { User, Calendar, Tag, ShieldCheck } from "lucide-react";

export default function GestaoChamadosPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // Busca chamados e usuários (técnicos) em paralelo
                const [resTickets, resUsers] = await Promise.all([
                    fetch('/api/admin/tickets'),
                    fetch('/api/admin/users')
                ]);

                // Proteção contra erro de JSON se não estiver logado
                if (!resTickets.ok || !resUsers.ok) {
                    console.error("Acesso negado. Redirecionando...");
                    return;
                }

                const ticketsData = await resTickets.json();
                const usersData = await resUsers.json();
                
                setTickets(ticketsData);
                // Filtra apenas MASTER e TECNICO para o select
                setTechnicians(usersData.filter((u: any) => u.role === 'TECNICO' || u.role === 'MASTER'));
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
            } finally {
                setLoading(false);
            }
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
                // Atualiza o estado local para refletir a mudança imediatamente
                setTickets(prev => prev.map(t => 
                    t.id === ticketId 
                    ? { ...t, assignedToId: techId, status: techId ? "Em Atendimento" : "Aberto" } 
                    : t
                ));
            }
        } catch (error) {
            alert("Erro ao atribuir técnico.");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Carregando painel de controle...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" /> Gestão de Atribuições
                </h1>
                <p className="text-gray-500">Distribua os chamados entre os técnicos disponíveis.</p>
            </header>

            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <p className="text-center text-gray-400 py-20 border-2 border-dashed rounded-xl">Nenhum chamado encontrado.</p>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="p-6 border-l-4 border-l-blue-500">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                            ticket.status === 'Aberto' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-gray-400 text-xs">#{ticket.id}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">{ticket.title}</h2>
                                    <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span>Solicitante: <strong>{ticket.user?.name || 'Sistema'}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Atribuir Técnico</label>
                                    <select 
                                        className="w-full p-2 border rounded bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={ticket.assignedToId || ""}
                                        onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                    >
                                        <option value="">Aguardando...</option>
                                        {technicians.map(tech => (
                                            <option key={tech.id} value={tech.id}>{tech.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}