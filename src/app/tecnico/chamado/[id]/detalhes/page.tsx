"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, MapPin, User, Clock, Tag,
    Building2, MessageSquare, Camera,
    CalendarClock, CheckCircle2, AlertTriangle,
    Navigation, Wrench, ArrowRight, Download 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import SLABadge from '@/components/SLABadge';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TicketPDF } from '@/components/TicketPDF';
import { useSystemConfig } from '@/components/SystemConfigProvider';

const STATUS_LABEL: Record<string, string> = {
    ABERTO: 'Aberto', OPEN: 'Aberto',
    EM_ANDAMENTO: 'Em andamento', IN_PROGRESS: 'Em andamento',
    EM_PAUSA: 'Pausado',
    CONCLUIDO: 'Concluído', CONCLUDED: 'Concluído',
};

const STATUS_STYLE: Record<string, string> = {
    ABERTO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    EM_PAUSA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    CONCLUIDO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CONCLUDED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const sysConfig = useSystemConfig();

export default function DetalhesReadOnlyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [assuming, setAssuming] = useState(false);

    useEffect(() => {
        fetch(`/api/tickets/${id}`)
            .then(r => r.json())
            .then(setTicket)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleAssume = async () => {
        if (!confirm('Deseja assumir este chamado?')) return;
        setAssuming(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'ASSUMIR' })
            });
            if (res.ok) {
                router.push(`/tecnico/chamado/${id}`);
            }
        } finally {
            setAssuming(false);
        }
    };

    const isConcluido = ticket && ['CONCLUIDO', 'CONCLUDED'].includes(ticket.status);
    const isDisponivel = ticket && ['ABERTO', 'OPEN'].includes(ticket.status) && !ticket.assignedToId;

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"/>
                <p className="text-muted text-[10px] font-black uppercase tracking-widest">Carregando chamado...</p>
            </div>
        </div>
    );

    if (!ticket) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-muted font-bold">Chamado não encontrado.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-12">

            {/* HEADER */}
            <div className="bg-card border-b border-border sticky top-0 z-30 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/tecnico"
                            className="p-2 hover:bg-background rounded-xl transition-colors text-foreground"
                        >
                            <ArrowLeft size={20}/>
                        </Link>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                                #{ticket.protocol}
                            </p>
                            <h1 className="text-sm font-black text-foreground uppercase truncate max-w-[200px] md:max-w-none">
                                {ticket.subject}
                            </h1>
                        </div>
                    </div>

                    {/* AÇÃO PRINCIPAL */}
                    {isDisponivel && (
                        <button
                            onClick={handleAssume}
                            disabled={assuming}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-black uppercase text-[10px] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                        >
                            <ArrowRight size={15}/>
                            {assuming ? 'Assumindo...' : 'Assumir chamado'}
                        </button>
                    )}

                    {isConcluido && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase">
                            <CheckCircle2 size={14}/> Concluído
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">

                {/* AVISO READ-ONLY para disponível */}
                {isDisponivel && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0"/>
                        <div>
                            <p className="text-sm font-black text-amber-700 dark:text-amber-400">Chamado disponível</p>
                            <p className="text-[11px] text-amber-600/80 dark:text-amber-500">
                                Você está visualizando os detalhes. Clique em "Assumir chamado" para começar o atendimento.
                            </p>
                        </div>
                    </div>
                )}

                {/* STATUS + PRIORIDADE */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${STATUS_STYLE[ticket.status] || 'bg-card text-muted'}`}>
                        {STATUS_LABEL[ticket.status] || ticket.status}
                    </span>
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                    <SLABadge ticketId={id} compact/>
                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {/* COLUNA PRINCIPAL */}
                    <div className="md:col-span-2 space-y-5">

                        {/* DESCRIÇÃO */}
                        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted">Descrição do problema</h2>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{ticket.subject}</h3>
                            <div className="p-4 bg-background rounded-2xl border border-border">
                                <p className="text-sm text-foreground leading-relaxed font-medium italic">
                                    "{ticket.description}"
                                </p>
                            </div>
                        </div>

                        {/* INFORMAÇÕES */}
                        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted">Informações</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem icon={<User size={15}/>} label="Solicitante" value={ticket.requester?.name}/>
                                <InfoItem icon={<Building2 size={15}/>} label="Secretaria" value={ticket.department?.name}/>
                                <InfoItem icon={<Tag size={15}/>} label="Categoria" value={ticket.category?.name}/>
                                <InfoItem icon={<Clock size={15}/>} label="Aberto em" value={new Date(ticket.createdAt).toLocaleString('pt-BR')}/>
                            </div>
                        </div>

                        {/* LOCALIZAÇÃO */}
                        {ticket.location && (
                            <div className="bg-card border border-border rounded-3xl p-6">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">Localização</h2>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                            <MapPin size={16} className="text-emerald-600"/>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">{ticket.location}</p>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.location)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-[10px] font-black uppercase text-muted hover:text-primary hover:border-primary transition-all"
                                    >
                                        <Navigation size={12}/> Maps
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* VISITA AGENDADA */}
                        {ticket.visitDate && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-6">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Visita agendada</h2>
                                <div className="flex items-center gap-3">
                                    <CalendarClock size={18} className="text-blue-600"/>
                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                        {new Date(ticket.visitDate).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                {ticket.visitNote && (
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2 italic">{ticket.visitNote}</p>
                                )}
                            </div>
                        )}

                        {/* FOTO DE CONCLUSÃO */}
                        {ticket.proofImage && (
                            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                    <Camera size={12}/> Evidência de conclusão
                                </h2>
                                <img
                                    src={ticket.proofImage}
                                    className="w-full rounded-2xl border border-border"
                                    alt="Foto de conclusão"
                                />
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-5">

                        {/* TÉCNICO */}
                        <div className="bg-card border border-border rounded-3xl p-5 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Técnico</p>
                            {ticket.assignedTo ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                        {ticket.assignedTo.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-foreground text-sm uppercase">{ticket.assignedTo.name}</p>
                                        <p className="text-[9px] text-muted uppercase font-bold">Responsável</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-muted">
                                    <div className="w-10 h-10 rounded-2xl bg-border flex items-center justify-center">
                                        <Wrench size={16}/>
                                    </div>
                                    <p className="text-sm font-bold">Sem responsável</p>
                                </div>
                            )}
                        </div>

                        {/* HISTÓRICO DE COMENTÁRIOS (read-only) */}
                        <div className="bg-card border border-border rounded-3xl overflow-hidden">
                            <div className="p-5 border-b border-border flex items-center gap-2">
                                <MessageSquare size={14} className="text-muted"/>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                                    Histórico ({ticket.comments?.length || 0})
                                </p>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {ticket.comments?.length === 0 && (
                                    <p className="text-center text-muted text-[10px] py-6 font-bold uppercase">Sem mensagens.</p>
                                )}
                                {ticket.comments?.map((c: any) => {
                                    const isVisita  = c.content.startsWith('[VISITA]');
                                    const isInterno = c.content.includes('[INTERNO]');
                                    if (isVisita) return null;
                                    return (
                                        <div key={c.id} className="p-4 border-b border-border/50 last:border-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-foreground">{c.user?.name}</span>
                                                {isInterno && (
                                                    <span className="text-[8px] font-black uppercase bg-amber-100 dark:bg-amber-900/20 text-amber-600 px-1.5 py-0.5 rounded">
                                                        Interno
                                                    </span>
                                                )}
                                                <span className="text-[9px] text-muted ml-auto">
                                                    {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted leading-relaxed">
                                                {c.content.replace('[INTERNO] ', '')}
                                            </p>
                                            {c.proofImage && (
                                                <img
                                                    src={c.proofImage}
                                                    className="mt-2 rounded-lg w-full cursor-pointer hover:opacity-90"
                                                    alt="Anexo"
                                                    onClick={() => window.open(c.proofImage, '_blank')}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* BOTÃO ASSUMIR (sidebar) */}
                        {isDisponivel && (
                            <button
                                onClick={handleAssume}
                                disabled={assuming}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                            >
                                <ArrowRight size={15}/>
                                {assuming ? 'Assumindo...' : 'Assumir e iniciar atendimento'}
                            </button>
                        )}

                        {/* BOTÃO PDF — disponível para todos os chamados */}
                        <PDFDownloadLink
                            document={
                                <TicketPDF
                                    ticket={ticket}
                                    systemName={sysConfig.systemName}
                                    cityName={sysConfig.cityName}
                                />
                            }
                            fileName={`chamado-${ticket.protocol}.pdf`}
                            className="w-full flex items-center justify-center gap-2 p-4 bg-card border-2 border-border text-foreground rounded-2xl font-black uppercase text-[11px] hover:bg-background transition-all"
                        >
                        {({ loading }) => (
                            <><Download size={15}/>{loading ? 'Gerando...' : 'Baixar PDF do chamado'}</>
                        )}
                    </PDFDownloadLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: any) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-2 bg-background rounded-xl text-muted shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-foreground truncate">{value || '—'}</p>
            </div>
        </div>
    );
}