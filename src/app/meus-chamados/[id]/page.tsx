"use client";

import { useState, useEffect, use } from 'react';
import Link from "next/link";
import { 
    Clock, Wrench, CheckCircle2, ArrowLeft, 
    Tag, MapPin, Send, MessageSquare, User
} from "lucide-react";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [ticket, setTicket] = useState<any>(null);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data);
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                setNewComment("");
                loadData();
            }
        } catch (err) {
            console.error("Erro no chat:", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest">Sincronizando Protocolo...</p>
            </div>
        </div>
    );

    if (!ticket) return (
        <div className="p-20 text-center">
            <h1 className="text-2xl font-black text-red-500 uppercase">Chamado não localizado</h1>
            <Link href="/meus-chamados" className="text-blue-600 font-bold hover:underline mt-4 block">Voltar à lista</Link>
        </div>
    );

    const statusSteps = ['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'];
    const currentStep = statusSteps.indexOf(ticket.status);

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-500">
            <Link href="/meus-chamados" className="group inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-all">
                <div className="p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                    <ArrowLeft size={20} />
                </div>
                Voltar para meus pedidos
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Coluna Principal: Detalhes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Protocolo Oficial</p>
                                <h1 className="text-3xl font-mono font-bold tracking-tighter">{ticket.protocol}</h1>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="bg-blue-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase shadow-xl shadow-blue-900/40">
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Barra de Progresso Customizada */}
                        <div className="p-10 bg-slate-50/50 border-b border-slate-100 relative">
                            <div className="absolute top-[50px] left-20 right-20 h-1 bg-slate-200 z-0 hidden md:block"></div>
                            <div className="flex justify-between relative z-10">
                                {statusSteps.map((step, idx) => {
                                    const isActive = idx <= currentStep;
                                    const isCurrent = idx === currentStep;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-3">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 ${
                                                isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : 'bg-white border-2 border-slate-200 text-slate-300'
                                            } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                                {idx === 0 && <Clock size={24} />}
                                                {idx === 1 && <Wrench size={24} />}
                                                {idx === 2 && <CheckCircle2 size={24} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {step.replace('_', ' ')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            <section>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assunto & Descrição</h2>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">{ticket.subject}</h3>
                                <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 text-slate-600 leading-relaxed italic text-lg">
                                    "{ticket.description}"
                                </div>
                            </section>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Tag size={24}/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</p>
                                        <p className="text-lg font-bold text-slate-700">{ticket.category?.name || "Geral"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><MapPin size={24}/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                                        <p className="text-lg font-bold text-slate-700">{ticket.location || "Não informada"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 p-8 bg-blue-600 text-white rounded-[2.5rem] md:col-span-2 shadow-2xl shadow-blue-200 overflow-hidden relative group">
                                    <div className="absolute right-0 top-0 opacity-10 group-hover:rotate-12 transition-transform">
                                        <User size={120} />
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md relative z-10"><Wrench size={28}/></div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-1">Especialista Atribuído</p>
                                        <p className="text-xl font-black italic">
                                            {ticket.assignedTo?.name || "Aguardando triagem técnica..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna lateral: Chat */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[750px]">
                        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="text-blue-400" size={20} />
                                <h2 className="text-xs font-black uppercase tracking-widest">Atendimento</h2>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                            {ticket.comments?.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma mensagem ainda.</p>
                                </div>
                            )}
                            {ticket.comments?.map((c: any) => {
                                const isMe = c.user?.role !== 'ADMIN' && c.user?.role !== 'TECNICO';
                                return (
                                    <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] p-5 rounded-3xl text-sm ${
                                            isMe ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100' 
                                                 : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                                        }`}>
                                            <p className={`text-[8px] font-black uppercase mb-2 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {c.user?.name}
                                            </p>
                                            <p className="font-semibold leading-relaxed">{c.content}</p>
                                        </div>
                                        <span className="text-[9px] text-slate-400 mt-2 font-black px-2 uppercase">
                                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100">
                            <div className="flex gap-3 bg-slate-50 p-2 rounded-4xl border-2 border-slate-100 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
                                <input 
                                    className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-slate-700"
                                    placeholder="Digite sua dúvida..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <button onClick={handleSendComment} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}