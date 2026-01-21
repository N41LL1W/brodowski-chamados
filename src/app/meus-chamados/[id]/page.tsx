"use client";

import { useState, useEffect, use } from 'react';
import Link from "next/link";
import { 
    Clock, Wrench, CheckCircle2, ArrowLeft, 
    Calendar, Tag, MapPin, Send, MessageSquare 
} from "lucide-react";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [ticket, setTicket] = useState<any>(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    // Carrega dados do ticket e comentários
    const loadData = async () => {
        try {
            const [tRes, cRes] = await Promise.all([
                fetch(`/api/tickets/${id}`),
                fetch(`/api/tickets/${id}/comments`)
            ]);
            if (tRes.ok) setTicket(await tRes.json());
            if (cRes.ok) setComments(await cRes.json());
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        const res = await fetch(`/api/tickets/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newComment })
        });
        if (res.ok) {
            setNewComment("");
            loadData(); // Atualiza o chat
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">CARREGANDO RASTREAMENTO...</div>;
    if (!ticket) return <div className="p-20 text-center font-bold">Chamado não encontrado.</div>;

    const statusSteps = ['ABERTO', 'ATENDIMENTO', 'CONCLUIDO'];
    const currentStep = statusSteps.indexOf(ticket.status);

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            {/* Botão Voltar */}
            <Link href="/meus-chamados" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition-colors">
                <ArrowLeft size={20} /> Voltar para meus pedidos
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* COLUNA DA ESQUERDA: DETALHES E RASTREIO (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        
                        {/* Cabeçalho */}
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <div>
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Protocolo</p>
                                <h1 className="text-2xl font-mono font-bold tracking-tighter">{ticket.protocol}</h1>
                            </div>
                            <span className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-900/20">
                                {ticket.status}
                            </span>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="p-10 bg-slate-50/50 border-b border-slate-100 relative">
                            <div className="absolute top-1/2 left-16 right-16 h-1 bg-slate-200 z-0"></div>
                            <div className="flex justify-between relative z-10">
                                {statusSteps.map((step, idx) => {
                                    const isActive = idx <= currentStep;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' : 'bg-white border-2 border-slate-200 text-slate-300'
                                            }`}>
                                                {idx === 0 && <Clock size={24} />}
                                                {idx === 1 && <Wrench size={24} />}
                                                {idx === 2 && <CheckCircle2 size={24} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {step === 'ATENDIMENTO' ? 'EM CURSO' : step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Informações */}
                        <div className="p-8 space-y-8">
                            <div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Descrição do Problema</h2>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{ticket.subject}</h3>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-600 leading-relaxed italic">
                                    "{ticket.description}"
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Tag size={20}/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Categoria</p>
                                        <p className="text-sm font-bold text-slate-700">{ticket.category?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><MapPin size={20}/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Localização Exata</p>
                                        <p className="text-sm font-bold text-slate-700">{ticket.location || "Não informado"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA DA DIREITA: CHAT DE INTERAÇÃO (1/3) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                            <MessageSquare className="text-blue-600" size={20} />
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">Conversa com TI</h2>
                        </div>

                        {/* Área de Mensagens */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                            {comments.length === 0 && (
                                <p className="text-center text-slate-400 text-xs mt-10">Nenhuma mensagem ainda.</p>
                            )}
                            {comments.map((c: any) => (
                                <div key={c.id} className={`flex flex-col ${c.user.role === 'USER' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[90%] p-4 rounded-2xl text-sm shadow-sm ${
                                        c.user.role === 'USER' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                    }`}>
                                        <p className="text-[9px] font-black uppercase opacity-70 mb-1">
                                            {c.user.role === 'USER' ? 'Você' : 'Técnico: ' + c.user.name}
                                        </p>
                                        {c.content}
                                    </div>
                                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-bold">
                                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Input do Chat */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 focus-within:border-blue-500 transition-all">
                                <input 
                                    className="flex-1 bg-transparent p-2 outline-none text-sm font-medium"
                                    placeholder="Escreva para o TI..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <button 
                                    onClick={handleSendComment}
                                    disabled={!newComment.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
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