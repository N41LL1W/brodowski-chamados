"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Clock, AlertTriangle } from 'lucide-react';

export default function MeusChamadosPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tickets')
            .then(res => res.json())
            .then(data => {
                setTickets(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getPriorityStyle = (prio: string) => {
        switch(prio) {
            case 'alta': case 'urgente': return 'bg-red-100 text-red-700 border-red-200';
            case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-500">Carregando chamados...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Meus Chamados</h1>
                <p className="text-sm text-gray-500">{tickets.length} chamados encontrados</p>
            </div>
            
            {tickets.length === 0 ? (
                <Card className="p-16 text-center text-gray-500 border-dashed border-2">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-medium">Você ainda não abriu nenhum chamado.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket: any) => (
                        <Card key={ticket.id} className="p-5 hover:border-blue-300 transition-all shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 uppercase">
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{ticket.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1 italic">Aberto por: {ticket.user?.name || 'Sistema'}</p>
                                </div>
                                
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-0 pt-3 md:pt-0">
                                    <div className="flex items-center text-gray-400 text-xs gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                    </div>
                                    <span className="text-blue-600 font-mono text-sm font-bold md:mt-2">#{ticket.id}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}