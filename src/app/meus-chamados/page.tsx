"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Adicionado Link
import { Clock, Tag, MapPin } from 'lucide-react';

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

    const getStatusColor = (status: string) => {
        if (status === 'ABERTO') return 'bg-emerald-100 text-emerald-700';
        if (status === 'ATENDIMENTO') return 'bg-amber-100 text-amber-700';
        return 'bg-blue-100 text-blue-700';
    };

    if (loading) return <p className="p-8 text-center font-bold text-slate-500">Buscando chamados em Brodowski...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Meus Chamados</h1>
                <Link href="/chamados/novo" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-all">
                    Novo Chamado
                </Link>
            </div>
            
            {tickets.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                    Nenhum chamado encontrado.
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket: any) => (
                        <Link href={`/meus-chamados/${ticket.id}`} key={ticket.id}>
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                                                {ticket.protocol}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {ticket.subject}
                                        </h3>
                                        
                                        <div className="flex gap-4 text-slate-400">
                                            <div className="flex items-center gap-1 text-[11px] font-medium">
                                                <Tag size={14} /> {ticket.category?.name || 'Geral'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-medium">
                                                <MapPin size={14} /> {ticket.department?.name || 'Prefeitura'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                                            <Clock size={12} />
                                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="mt-4 text-blue-600 font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                            VER DETALHES →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}