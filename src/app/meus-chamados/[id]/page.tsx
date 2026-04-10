//src\app\meus-chamados\[id]\page.tsx

"use client";

import { useState, useEffect, use } from 'react';
import Link from "next/link";
import { 
    Clock, Wrench, CheckCircle2, ArrowLeft, 
    Tag, MapPin, Send, MessageSquare, User, Lock, Download 
} from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TicketPDF } from '@/components/TicketPDF';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [ticket, setTicket] = useState<any>(null);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTicket(data);
            } else {
                setErrorStatus(res.status);
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
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-950">
            <div className="text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sincronizando Protocolo...</p>
            </div>
        </div>
    );

    if (errorStatus === 403) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background dark:bg-slate-950">
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-full mb-6">
                <Lock size={64} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Acesso Restrito</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md italic">Este chamado não pertence a você.</p>
            <Link href="/meus-chamados" className="mt-8 bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                Voltar aos meus pedidos
            </Link>
        </div>
    );

    const statusSteps = ['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'];
    const currentStep = statusSteps.indexOf(ticket.status);

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-500">
            <Link href="/meus-chamados" className="group inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all font-bold mb-8">
                <div className="p-2 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <ArrowLeft size={20} />
                </div>
                Voltar para meus pedidos
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                        
                        <div className="bg-slate-900 dark:bg-slate-950 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div>
                                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Protocolo Oficial</p>
                                    <h1 className="text-3xl font-mono font-bold tracking-tighter">{ticket.protocol}</h1>
                                </div>
                                <PDFDownloadLink 
                                    document={<TicketPDF ticket={ticket} />} 
                                    fileName={`comprovante-${ticket.protocol}.pdf`}
                                    className="flex items-center gap-2 bg-slate-800 dark:bg-slate-800/50 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-black uppercase mt-2 md:mt-6"
                                >
                                    {({ loading }) => loading ? '...' : <><Download size={14} /> PDF</>}
                                </PDFDownloadLink>
                            </div>
                            <span className="bg-blue-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase">{ticket.status.replace('_', ' ')}</span>
                        </div>

                        <div className="p-10 bg-background/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between relative z-10">
                                {statusSteps.map((step, idx) => {
                                    const isActive = idx <= currentStep;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-3">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                                isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none scale-110' : 'bg-card dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-300'
                                            }`}>
                                                {idx === 0 && <Clock size={24} />}
                                                {idx === 1 && <Wrench size={24} />}
                                                {idx === 2 && <CheckCircle2 size={24} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.replace('_', ' ')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            <section>
                                <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Assunto & Descrição</h2>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">{ticket.subject}</h3>
                                <div className="bg-background dark:bg-slate-800/50 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 italic text-lg">
                                    "{ticket.description}"
                                </div>
                            </section>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-6 bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><Tag size={24}/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</p>
                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{ticket.category?.name || "Geral"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-card dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl"><MapPin size={24}/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{ticket.location || "Não informada"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[750px]">
                        <div className="p-8 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="text-blue-400" size={20} />
                                <h2 className="text-xs font-black uppercase tracking-widest">Atendimento</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-background/30 dark:bg-slate-950/20">
                            {ticket.comments?.map((c: any) => {
                                const isMe = c.userId === ticket.requesterId;
                                return (
                                    <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] p-5 rounded-3xl text-sm ${
                                            isMe ? 'bg-blue-600 text-white rounded-tr-none' 
                                                 : 'bg-card dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                                        }`}>
                                            <p className={`text-[8px] font-black uppercase mb-2 ${isMe ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>{c.user?.name}</p>
                                            <p className="font-semibold">{c.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-card dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex gap-3 bg-background dark:bg-slate-800 p-2 rounded-4xl border-2 border-slate-100 dark:border-slate-700 focus-within:border-blue-500 transition-all">
                                <input 
                                    className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
                                    placeholder="Digite sua dúvida..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <button onClick={handleSendComment} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-95 transition-all">
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