"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Tag, MapPin, Plus } from 'lucide-react';

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
        const s = status.toUpperCase();
        if (s === 'ABERTO') return 'bg-emerald-100 text-emerald-700';
        if (s === 'EM ATENDIMENTO' || s === 'ATENDIMENTO') return 'bg-amber-100 text-amber-700';
        return 'bg-blue-100 text-blue-700';
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Consultando base de Brodowski...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Meus Chamados</h1>
                    <p className="text-slate-400 font-medium">Acompanhe suas solicitações em tempo real.</p>
                </div>
                <Link href="/meus-chamados/create" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg active:scale-95 text-xs">
                    <Plus size={18} /> Novo Chamado
                </Link>
            </div>
            
            {tickets.length === 0 ? (
                <div className="p-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] text-slate-300">
                    <p className="font-bold italic">Nenhum chamado registrado no seu histórico.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {tickets.map((ticket: any) => (
                        <Link href={`/meus-chamados/${ticket.id}`} key={ticket.id}>
                            <div className="p-8 bg-white border border-slate-50 rounded-4xl shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">
                                                PROT: {ticket.protocol || ticket.id}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-black text-2xl text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                                            {ticket.subject || ticket.title}
                                        </h3>
                                        
                                        <div className="flex gap-6 text-slate-400">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                                                <Tag size={16} className="text-blue-500" /> {ticket.category?.name || 'Geral'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                                                <MapPin size={16} className="text-blue-500" /> {ticket.department?.name || 'Prefeitura'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            <Clock size={14} />
                                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="mt-8 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            Detalhes →
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