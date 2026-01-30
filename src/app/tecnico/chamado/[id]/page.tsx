"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, Wrench, // Corrigido aqui
  Send, Camera, CheckCircle, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function DetalheChamadoPage({ params }: { params: { id: string } }) {
    const [ticket, setTicket] = useState<any>(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);

    // Busca os dados do chamado
    useEffect(() => {
        async function loadTicket() {
            const res = await fetch(`/api/tickets/${params.id}`);
            const data = await res.json();
            setTicket(data);
            setLoading(false);
        }
        loadTicket();
    }, [params.id]);

    const handleUpdateStatus = async (newStatus: string) => {
        // Lógica para mudar status ou adicionar comentário técnico
        alert(`Alterando para: ${newStatus}`);
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Carregando detalhes...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            {/* VOLTAR E AÇÕES RÁPIDAS */}
            <div className="flex justify-between items-center">
                <Link href="/tecnico" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-bold">
                    <ArrowLeft size={20} /> Painel Geral
                </Link>
                <div className="flex gap-2">
                    <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA DA ESQUERDA: INFO E RELATÓRIO */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-4">
                        <div className="border-b pb-4">
                            <span className="text-xs font-black text-blue-600 uppercase">Protocolo: {ticket.protocol}</span>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{ticket.subject}</h1>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-600">
                            "{ticket.description}"
                        </div>

                        {/* ATUALIZAÇÃO DO TÉCNICO */}
                        <div className="pt-4 space-y-3">
                            <label className="text-sm font-black uppercase text-slate-500 flex items-center gap-2">
                                <Wrench size={16}/> Diário de Bordo / Notas Técnicas
                            </label>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Descreva o que foi feito ou o motivo da pausa..."
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                            />
                            <div className="flex justify-between items-center">
                                <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:bg-slate-100 p-2 rounded-lg transition-all">
                                    <Camera size={20}/> Anexar Foto
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus('LOG')}
                                    className="bg-slate-800 text-white px-6 py-2 rounded-xl font-black text-xs uppercase hover:bg-slate-700 transition-all"
                                >
                                    Salvar Progresso
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* BOTÃO FINALIZAR SERVIÇO */}
                    <button 
                        onClick={() => handleUpdateStatus('CONCLUIDO')}
                        className="w-full bg-emerald-600 text-white p-5 rounded-3xl font-black text-lg uppercase shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <CheckCircle size={24}/> Finalizar Chamado
                    </button>
                </div>

                {/* COLUNA DA DIREITA: DADOS DO SOLICITANTE E LOCAL */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6 border-t-4 border-t-blue-500">
                        <h2 className="font-black text-slate-800 uppercase text-sm tracking-widest border-b pb-2">Solicitante</h2>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black">
                                {ticket.requester?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-black text-slate-800 leading-none">{ticket.requester?.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{ticket.requester?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <MapPin className="text-blue-500" size={18}/>
                                <div>
                                    <p className="font-black text-slate-800 leading-none">Localização</p>
                                    <p className="text-xs">{ticket.location || "Não informado"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Clock className="text-blue-500" size={18}/>
                                <div>
                                    <p className="font-black text-slate-800 leading-none">Aberto em</p>
                                    <p className="text-xs">{new Date(ticket.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* DICA DE SLA */}
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                        <AlertTriangle className="text-amber-600 shrink-0" size={20}/>
                        <p className="text-xs text-amber-800 font-medium">
                            Este chamado deve ser atendido em até 4h conforme o SLA da Secretaria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}