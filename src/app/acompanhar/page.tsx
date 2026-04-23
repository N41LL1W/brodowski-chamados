"use client";

import { useState } from 'react';
import { Search, Clock, Wrench, CheckCircle2, MapPin, Tag, AlertCircle } from 'lucide-react';

export default function AcompanharPage() {
    const [protocolo, setProtocolo] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const buscar = async () => {
        if (!protocolo.trim()) return;
        setLoading(true);
        setNotFound(false);
        setTicket(null);
        try {
            const res = await fetch(`/api/acompanhar?protocolo=${encodeURIComponent(protocolo.trim())}`);
            if (res.ok) {
                setTicket(await res.json());
            } else {
                setNotFound(true);
            }
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = ['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'];
    const currentStep = ticket ? statusSteps.findIndex(s =>
        ['ABERTO', 'OPEN'].includes(ticket.status) ? s === 'ABERTO' :
        ['EM_ANDAMENTO', 'IN_PROGRESS'].includes(ticket.status) ? s === 'EM_ANDAMENTO' :
        s === 'CONCLUIDO'
    ) : -1;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* HEADER PÚBLICO */}
            <header className="border-b border-border bg-card px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xs">
                        TI
                    </div>
                    <div>
                        <p className="font-black text-foreground text-sm uppercase tracking-tight">TI Brodowski</p>
                        <p className="text-[9px] text-muted uppercase tracking-widest">Acompanhamento de chamados</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                        Acompanhe seu <span className="text-primary italic">chamado</span>
                    </h1>
                    <p className="text-muted text-sm">Digite o número do protocolo que você recebeu ao abrir o chamado.</p>
                </div>

                {/* BUSCA */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18}/>
                        <input
                            value={protocolo}
                            onChange={e => setProtocolo(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && buscar()}
                            placeholder="Ex: 20250101-1234"
                            className="w-full pl-12 pr-4 py-4 bg-card border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-foreground text-sm"
                        />
                    </div>
                    <button
                        onClick={buscar}
                        disabled={loading || !protocolo.trim()}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-sm hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {/* NÃO ENCONTRADO */}
                {notFound && (
                    <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl animate-in fade-in duration-300">
                        <AlertCircle size={24} className="text-red-500 flex-shrink-0"/>
                        <div>
                            <p className="font-black text-red-700 dark:text-red-400">Protocolo não encontrado</p>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Verifique o número e tente novamente.</p>
                        </div>
                    </div>
                )}

                {/* RESULTADO */}
                {ticket && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">

                        {/* HEADER DO CHAMADO */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Protocolo</p>
                            <h2 className="text-2xl font-mono font-bold">{ticket.protocol}</h2>
                            <p className="text-slate-300 font-bold mt-2 text-lg">{ticket.subject}</p>
                        </div>

                        {/* PROGRESSO */}
                        <div className="bg-card border border-border rounded-3xl p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-6">Status do atendimento</p>
                            <div className="flex justify-between relative">
                                {/* Linha de conexão */}
                                <div className="absolute top-7 left-7 right-7 h-0.5 bg-border -z-0"/>
                                <div
                                    className="absolute top-7 left-7 h-0.5 bg-primary transition-all -z-0"
                                    style={{ width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%' }}
                                />
                                {statusSteps.map((step, idx) => {
                                    const isActive = idx <= currentStep;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-3 z-10">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-card border-2 border-border text-muted'
                                            }`}>
                                                {idx === 0 && <Clock size={22}/>}
                                                {idx === 1 && <Wrench size={22}/>}
                                                {idx === 2 && <CheckCircle2 size={22}/>}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase ${isActive ? 'text-primary' : 'text-muted'}`}>
                                                {step === 'ABERTO' ? 'Aberto' :
                                                 step === 'EM_ANDAMENTO' ? 'Em atendimento' : 'Concluído'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* DETALHES */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Detalhes</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Tag size={16} className="text-primary flex-shrink-0"/>
                                        <div>
                                            <p className="text-[9px] font-black text-muted uppercase">Categoria</p>
                                            <p className="text-sm font-bold text-foreground">{ticket.category?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-primary flex-shrink-0"/>
                                        <div>
                                            <p className="text-[9px] font-black text-muted uppercase">Localização</p>
                                            <p className="text-sm font-bold text-foreground">{ticket.location || 'Não informada'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-primary flex-shrink-0"/>
                                        <div>
                                            <p className="text-[9px] font-black text-muted uppercase">Aberto em</p>
                                            <p className="text-sm font-bold text-foreground">
                                                {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Responsável</p>
                                {ticket.assignedTo ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg">
                                            {ticket.assignedTo.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground uppercase">{ticket.assignedTo.name}</p>
                                            <p className="text-[10px] text-muted uppercase font-bold">Técnico responsável</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-muted">
                                        <div className="w-12 h-12 rounded-2xl bg-border flex items-center justify-center">
                                            <Wrench size={20} className="text-muted"/>
                                        </div>
                                        <p className="text-sm font-bold">Aguardando atribuição</p>
                                    </div>
                                )}

                                {ticket.visitDate && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <p className="text-[9px] font-black text-muted uppercase mb-2">Visita agendada</p>
                                        <p className="text-sm font-bold text-primary">
                                            {new Date(ticket.visitDate).toLocaleString('pt-BR')}
                                        </p>
                                        {ticket.visitNote && (
                                            <p className="text-xs text-muted mt-1 italic">{ticket.visitNote}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-muted">
                            Para mais detalhes, acesse o sistema com seu login.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}