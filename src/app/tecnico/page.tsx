"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { ClipboardList, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export default function TecnicoPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMyTickets = async () => {
        try {
            const res = await fetch('/api/tecnico/tickets');
            if (res.ok) {
                const data = await res.json();
                // Filtramos para não mostrar os já concluídos nesta lista principal, se preferir
                setTickets(data.filter((t: any) => t.status !== "Concluído"));
            }
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyTickets();
    }, []);

    const handleComplete = async (id: number) => {
        if (!confirm("Deseja marcar este chamado como concluído?")) return;

        const res = await fetch(`/api/tecnico/tickets/${id}/complete`, {
            method: 'PATCH'
        });

        if (res.ok) {
            alert("Chamado concluído com sucesso!");
            loadMyTickets(); // Recarrega a lista
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando seus atendimentos...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="text-blue-600" /> Meus Atendimentos
                </h1>
                <p className="text-gray-500 font-medium">Chamados pendentes atribuídos a você.</p>
            </header>

            <div className="grid gap-6">
                {tickets.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Nenhum chamado pendente no momento.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} className="p-6 border-l-4 border-l-orange-400">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                            {ticket.status}
                                        </span>
                                        <span className="text-gray-400 text-xs font-mono">#{ticket.id}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
                                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                        "{ticket.description}"
                                    </p>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1"><User className="w-4 h-4" /> {ticket.user?.name}</div>
                                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(ticket.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <button 
                                        onClick={() => handleComplete(ticket.id)}
                                        className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Concluir
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