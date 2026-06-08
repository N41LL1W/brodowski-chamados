"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Clock, Tag, Building2,
    MessageSquare, Send, Camera,
    CheckCircle2, X, User,
    Download, Calendar
} from 'lucide-react';
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
    ABERTO:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    OPEN:         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    EM_PAUSA:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    CONCLUIDO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CONCLUDED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const PRIORITY_STYLE: Record<string, string> = {
    URGENTE: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    ALTA:    'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    NORMAL:  'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    BAIXA:   'text-slate-500 bg-slate-50 dark:bg-slate-800',
};

export default function MeuChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const sysConfig = useSystemConfig(); // ← DENTRO do componente

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    const loadTicket = async () => {
        const res = await fetch(`/api/tickets/${id}`);
        if (res.ok) setTicket(await res.json());
        setLoading(false);
    };

    useEffect(() => { loadTicket(); }, [id]);

    const sendMessage = async () => {
        if (!message.trim() && !photo) return;
        setSending(true);
        try {
            await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message, proofImage: photo })
            });
            setMessage('');
            setPhoto(null);
            loadTicket();
        } finally { setSending(false); }
    };

    const isClosed = ticket && ['CONCLUIDO', 'CONCLUDED'].includes(ticket.status);

    const publicComments = ticket?.comments?.filter((c: any) =>
        !c.content.includes('[INTERNO]') && !c.content.startsWith('[VISITA]')
    ) || [];

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"/>
        </div>
    );

    if (!ticket) return (
        <div className="flex items-center justify-center h-[70vh]">
            <p className="text-muted font-bold">Chamado não encontrado.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-8">

            {/* VISUALIZADOR DE IMAGEM */}
            {selectedImg && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImg(null)}>
                    <img src={selectedImg} className="max-w-full max-h-full rounded-2xl" alt="Imagem"/>
                </div>
            )}

            {/* HEADER STICKY */}
            <div className="bg-card border-b border-border sticky top-0 z-30 px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link href="/meus-chamados"
                        className="p-2 hover:bg-background rounded-xl transition-colors text-foreground shrink-0">
                        <ArrowLeft size={20}/>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                            #{ticket.protocol}
                        </p>
                        <h1 className="text-sm font-black text-foreground uppercase truncate leading-tight">
                            {ticket.subject}
                        </h1>
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[ticket.status] || 'bg-border text-muted'}`}>
                        {STATUS_LABEL[ticket.status] || ticket.status}
                    </span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pt-5 space-y-4">

                {/* CARD INFO */}
                <div className="bg-card border border-border rounded-3xl p-5 space-y-4">

                    <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${STATUS_STYLE[ticket.status] || 'bg-border text-muted'}`}>
                            {STATUS_LABEL[ticket.status]}
                        </span>
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${PRIORITY_STYLE[ticket.priority] || 'bg-border text-muted'}`}>
                            {ticket.priority}
                        </span>
                    </div>

                    {ticket.description && (
                        <div className="p-4 bg-background rounded-2xl border border-border">
                            <p className="text-sm text-foreground leading-relaxed italic">
                                "{ticket.description}"
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoItem icon={<User size={14}/>}      label="Solicitante" value={ticket.requester?.name}/>
                        <InfoItem icon={<Building2 size={14}/>} label="Secretaria"  value={ticket.department?.name}/>
                        <InfoItem icon={<Tag size={14}/>}       label="Categoria"   value={ticket.category?.name}/>
                        <InfoItem icon={<Clock size={14}/>}     label="Aberto em"   value={new Date(ticket.createdAt).toLocaleString('pt-BR')}/>
                        {ticket.location && (
                            <InfoItem icon={<MapPin size={14}/>} label="Local" value={ticket.location}/>
                        )}
                        {ticket.assignedTo && (
                            <InfoItem icon={<User size={14}/>} label="Técnico" value={ticket.assignedTo.name}/>
                        )}
                    </div>

                    {ticket.visitDate && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <Calendar size={16} className="text-blue-600 shrink-0"/>
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Visita agendada</p>
                                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                    {new Date(ticket.visitDate).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    )}

                    {ticket.proofImage && (
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted mb-2 flex items-center gap-1">
                                <Camera size={11}/> Evidência
                            </p>
                            <img src={ticket.proofImage}
                                onClick={() => setSelectedImg(ticket.proofImage)}
                                className="w-full max-h-48 object-cover rounded-2xl cursor-pointer hover:opacity-90 border border-border"
                                alt="Evidência"/>
                        </div>
                    )}

                    {/* PDF — usa ticket (não createdTicket) */}
                    {(
                        <PDFDownloadLink
                            document={
                                <TicketPDF
                                    ticket={ticket}
                                    systemName={sysConfig.systemName}
                                    cityName={sysConfig.cityName}
                                />
                            }
                            fileName={`chamado-${ticket.protocol}.pdf`}
                            className="flex items-center justify-center gap-2 p-3 bg-foreground text-background rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all w-full"
                        >
                            {({ loading }) => (
                                <><Download size={15}/>{loading ? 'Preparando...' : 'Baixar comprovante PDF'}</>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>

                {/* HISTÓRICO */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-background/50">
                        <MessageSquare size={14} className="text-muted"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                            Histórico ({publicComments.length})
                        </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                        {publicComments.length === 0 && (
                            <p className="text-center text-muted text-[10px] py-8 font-bold uppercase">
                                Nenhuma mensagem ainda.
                            </p>
                        )}
                        {[...publicComments].reverse().map((c: any) => {
                            const isTecnico = ['TECNICO', 'ADMIN', 'MASTER'].includes(c.user?.role);
                            return (
                                <div key={c.id} className={`p-4 flex gap-3 ${isTecnico ? 'bg-slate-50 dark:bg-slate-900/30' : ''}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isTecnico ? 'bg-primary text-white' : 'bg-border text-foreground'}`}>
                                        {c.user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-[10px] font-black text-foreground">{c.user?.name}</span>
                                            {isTecnico && (
                                                <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                    Técnico
                                                </span>
                                            )}
                                            <span className="text-[9px] text-muted ml-auto">
                                                {new Date(c.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                                        {c.proofImage && (
                                            <img src={c.proofImage}
                                                onClick={() => setSelectedImg(c.proofImage)}
                                                className="mt-2 rounded-xl max-h-40 w-full object-cover cursor-pointer hover:opacity-90 border border-border"
                                                alt="Anexo"/>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* INPUT */}
                    {!isClosed && (
                        <div className="p-4 border-t border-border bg-background/50">
                            {photo && (
                                <div className="relative mb-3">
                                    <img src={photo} className="w-full max-h-32 object-cover rounded-xl border border-primary" alt="Preview"/>
                                    <button onClick={() => setPhoto(null)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                        <X size={12}/>
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Escreva uma mensagem..."
                                    className="flex-1 p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-medium text-foreground resize-none h-12 min-h-12 max-h-32 placeholder:text-muted/50 transition-all"
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                />
                                <div className="flex flex-col gap-2">
                                    <label className="p-3 bg-background border-2 border-border rounded-2xl text-muted hover:border-primary hover:text-primary transition-all cursor-pointer shrink-0">
                                        <Camera size={16}/>
                                        <input type="file" accept="image/*" className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onloadend = () => setPhoto(reader.result as string);
                                                reader.readAsDataURL(file);
                                                e.target.value = '';
                                            }}/>
                                    </label>
                                    <button
                                        onClick={sendMessage}
                                        disabled={sending || (!message.trim() && !photo)}
                                        className="p-3 bg-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
                                    >
                                        <Send size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: any) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-3 bg-background rounded-2xl border border-border">
            <div className="p-1.5 bg-card rounded-lg text-muted shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-foreground truncate">{value}</p>
            </div>
        </div>
    );
}