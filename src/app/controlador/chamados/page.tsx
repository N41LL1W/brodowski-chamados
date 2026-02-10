"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { User, Calendar, ShieldCheck, ArrowRight, Hash, MapPin } from "lucide-react";

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
                    // Filtra técnicos conforme os enums do seu novo Schema
                    setTechnicians(usersData.filter((u: any) => u.role === 'TECNICO' || u.role === 'MASTER'));
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleAssign = async (ticketId: string, techId: string) => {
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}/assign`, {
                method: 'PATCH',
                body: JSON.stringify({ technicianId: techId || null }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setTickets(prev => prev.map(t => 
                    t.id === ticketId 
                    ? { ...t, assignedToId: techId, status: techId ? "EM_ANDAMENTO" : "ABERTO" } 
                    : t
                ));
            }
        } catch (error) {
            alert("Erro ao atribuir técnico.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Sincronizando Base...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="text-blue-600" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Controladoria</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase">
                        Gestão de <span className="text-blue-600">Fila</span>
                    </h1>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Chamados na Fila</p>
                    <p className="text-2xl font-black text-blue-600">{tickets.length}</p>
                </div>
            </header>

            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <div className="text-center py-32 border-4 border-dashed rounded-[3rem] border-slate-100 dark:border-slate-900">
                        <p className="text-slate-300 font-black uppercase tracking-widest italic text-sm">Nenhuma demanda pendente</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="p-0 overflow-hidden border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none group rounded-[2.5rem]">
                            <div className="flex flex-col lg:flex-row">
                                <div className="flex-1 p-8 lg:p-10 border-l-12 border-blue-600">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                            ticket.status === 'ABERTO' 
                                            ? 'bg-amber-100 text-amber-600' 
                                            : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-300 font-bold text-[10px] uppercase">
                                            <Hash size={12}/> {ticket.protocol}
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                                        {ticket.subject}
                                    </h2>
                                    
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed line-clamp-2">
                                        {ticket.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <Badge icon={<User size={14}/>} label={ticket.requester?.name || 'Sistema'} />
                                        <Badge icon={<MapPin size={14}/>} label={ticket.location || 'Não informado'} />
                                        <Badge icon={<Calendar size={14}/>} label={new Date(ticket.createdAt).toLocaleDateString('pt-BR')} />
                                    </div>
                                </div>

                                <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-800/50 p-8 lg:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                                        Atribuir Técnico <ArrowRight size={12} className="text-blue-600"/>
                                    </label>
                                    
                                    <select 
                                        className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-black shadow-sm outline-none focus:border-blue-600 transition-all cursor-pointer appearance-none"
                                        value={ticket.assignedToId || ""}
                                        onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                    >
                                        <option value="">Aguardando Fila...</option>
                                        {technicians.map(tech => (
                                            <option key={tech.id} value={tech.id}>{tech.name}</option>
                                        ))}
                                    </select>
                                    
                                    <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase text-center leading-tight">
                                        A alteração de responsável atualiza o status automaticamente para "Em Andamento".
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function Badge({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-tight">
            <span className="text-blue-600">{icon}</span>
            {label}
        </div>
    );
}