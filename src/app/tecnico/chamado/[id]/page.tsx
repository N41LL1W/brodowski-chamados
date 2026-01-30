"use client";

import { useState, useEffect, use } from 'react'; // Adicionei 'use'
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, Wrench, 
  CheckCircle, AlertTriangle, Loader2 
} from 'lucide-react';
import Link from 'next/link';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    // No Next.js 15, os params devem ser tratados como Promise no lado do cliente também
    const resolvedParams = use(params); 
    const id = resolvedParams.id;

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadTicket() {
            if (!id) return;
            
            try {
                setLoading(true);
                const res = await fetch(`/api/tickets/${id}`);
                
                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Erro da API:", errorData);
                    throw new Error("Falha ao carregar");
                }
                
                const data = await res.json();
                setTicket(data);
            } catch (err) {
                console.error("Erro no fetch:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        loadTicket();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="font-black text-slate-400 uppercase tracking-[0.2em]">Buscando dados no servidor...</p>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <AlertTriangle className="mx-auto text-red-500" size={64} />
                    <h2 className="text-2xl font-black text-slate-800 uppercase">Chamado não encontrado</h2>
                    <p className="text-slate-500">O ID do chamado <b>{id}</b> pode estar incorreto ou foi removido.</p>
                    <Link href="/tecnico" className="block w-full bg-slate-800 text-white py-3 rounded-xl font-bold uppercase text-sm">
                        Voltar ao Painel Técnico
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            {/* CABEÇALHO */}
            <div className="flex justify-between items-center">
                <Link href="/tecnico" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-xs tracking-widest">
                    <ArrowLeft size={16} /> Voltar para a Fila
                </Link>
                <div className="flex gap-2">
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                    <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONTEÚDO PRINCIPAL */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 space-y-6 shadow-xl border-none ring-1 ring-slate-200">
                        <header className="border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[11px] font-black bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-100 uppercase">
                                    {ticket.protocol || 'SEM PROTOCOLO'}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-[0.9] uppercase">
                                {ticket.subject || ticket.title}
                            </h1>
                        </header>
                        
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Relato do Solicitante</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl text-slate-700 leading-relaxed text-lg italic border border-slate-100 shadow-inner">
                                "{ticket.description || "O solicitante não forneceu detalhes adicionais."}"
                            </div>
                        </div>

                        {/* DIÁRIO DE BORDO */}
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                                <Wrench size={16} className="text-blue-600"/> Atualizar Andamento Técnico
                            </label>
                            <textarea 
                                placeholder="O que você está fazendo? Ex: Substituí a memória RAM, aguardando teste de estresse."
                                className="w-full p-6 bg-white border border-slate-200 rounded-4x1 min-h-min-h-40 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 shadow-sm"
                            />
                            <div className="flex justify-end">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-blue-100 active:scale-95">
                                    Registrar Atividade
                                </button>
                            </div>
                        </div>
                    </Card>

                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-8 rounded-[2.5rem] font-black text-2xl uppercase shadow-2xl shadow-emerald-200 transition-all flex items-center justify-center gap-4 group">
                        <CheckCircle size={32} className="group-hover:scale-110 transition-transform"/> Finalizar Chamado
                    </button>
                </div>

                {/* INFO LATERAL */}
                <aside className="space-y-6">
                    <Card className="p-8 border-none ring-1 ring-slate-200 bg-white shadow-lg rounded-[2.5rem]">
                        <h2 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-8 border-b border-slate-50 pb-2">Detalhes da Origem</h2>
                        
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                    {ticket.requester?.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-base">{ticket.requester?.name || "Usuário"}</p>
                                    <p className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{ticket.requester?.email || "E-mail indisponível"}</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <InfoItem icon={<MapPin size={20}/>} label="Unidade / Setor" value={ticket.location || "Não Informado"} />
                                <InfoItem icon={<Clock size={20}/>} label="Aberto em" value={new Date(ticket.createdAt).toLocaleString('pt-BR')} />
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                         <div className="relative z-10 space-y-2">
                             <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Dica Técnica</p>
                             <p className="text-sm font-bold leading-relaxed">Não esqueça de pedir para o solicitante testar o equipamento antes de você sair do local.</p>
                         </div>
                         <Wrench className="absolute -right-4 -bottom-4 text-blue-500 opacity-20 group-hover:rotate-45 transition-transform duration-500" size={120} />
                    </div>
                </aside>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-blue-600">
                {icon}
            </div>
            <div>
                <p className="font-black text-slate-800 text-[10px] uppercase tracking-tighter opacity-40">{label}</p>
                <p className="text-sm text-slate-600 font-bold">{value}</p>
            </div>
        </div>
    );
}