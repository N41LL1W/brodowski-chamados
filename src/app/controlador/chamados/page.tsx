"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { User, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

export default function GestaoChamadosPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [resTickets, resUsers] = await Promise.all([
                    fetch('/api/admin/tickets'),
                    fetch('/api/admin/users')
                ]);

                if (resTickets.ok && resUsers.ok) {
                    const ticketsData = await resTickets.json();
                    const usersData = await resUsers.json();
                    setTickets(ticketsData);
                    setTechnicians(usersData.filter((u: any) => u.role === 'TECNICO' || u.role === 'MASTER'));
                }
            } catch (err) {
                console.error("Erro:", err);
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

    if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Sincronizando base de dados...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                    <ShieldCheck className="text-blue-600" size={40} /> GESTÃO DE FILA
                </h1>
                <p className="text-gray-500 font-medium">Distribua a demanda entre os técnicos da prefeitura.</p>
            </header>

            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-gray-50">
                        <p className="text-gray-400 font-bold italic">Nenhum chamado pendente na fila.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="p-0 overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-6 border-l-8 border-blue-500 bg-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                                            ticket.status === 'Aberto' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-gray-300 font-mono text-xs">ID #{ticket.id}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{ticket.title}</h2>
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 italic">"{ticket.description}"</p>
                                    
                                    <div className="flex flex-wrap gap-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
                                            <User size={14} className="text-blue-500" />
                                            <span>{ticket.user?.name || 'Sistema'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
                                            <Calendar size={14} className="text-blue-500" />
                                            <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-72 bg-gray-50 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
                                    <label className="text-[10px] font-black text-blue-600 uppercase mb-3 flex items-center gap-1">
                                        Responsável Técnico <ArrowRight size={12}/>
                                    </label>
                                    <select 
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        value={ticket.assignedToId || ""}
                                        onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                    >
                                        <option value="">Aguardando Fila...</option>
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