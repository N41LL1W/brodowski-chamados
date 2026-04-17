"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
    ChevronDown, ChevronRight, MapPin, User, 
    Calendar, MessageSquare, Camera, CalendarClock,
    CheckCircle2, Clock, Wrench, PauseCircle
} from 'lucide-react';
import SLABadge from '@/components/SLABadge';

const STATUS_STYLE: Record<string, string> = {
    ABERTO:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    OPEN:         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    EM_PAUSA:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    CONCLUIDO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CONCLUDED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const STATUS_LABEL: Record<string, string> = {
    ABERTO: 'Aberto', OPEN: 'Aberto',
    EM_ANDAMENTO: 'Em andamento', IN_PROGRESS: 'Em andamento',
    EM_PAUSA: 'Pausado',
    CONCLUIDO: 'Concluído', CONCLUDED: 'Concluído',
};

export default function TabOperacional({ data }: any) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filtroStatus, setFiltroStatus] = useState('TODOS');

    const filtros = ['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'EM_PAUSA', 'CONCLUIDO'];

    const chamadosFiltrados = data.chamadosRecentes.filter((t: any) => {
        if (filtroStatus === 'TODOS') return true;
        if (filtroStatus === 'ABERTO') return ['ABERTO', 'OPEN'].includes(t.status);
        if (filtroStatus === 'EM_ANDAMENTO') return ['EM_ANDAMENTO', 'IN_PROGRESS'].includes(t.status);
        if (filtroStatus === 'CONCLUIDO') return ['CONCLUIDO', 'CONCLUDED'].includes(t.status);
        return t.status === filtroStatus;
    });

    return (
        <div className="space-y-6">

            {/* FILTROS */}
            <div className="flex gap-2 flex-wrap">
                {filtros.map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltroStatus(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filtroStatus === f
                                ? 'bg-primary text-white'
                                : 'bg-card border border-border text-muted hover:text-foreground'
                        }`}
                    >
                        {f === 'TODOS' ? 'Todos' :
                         f === 'ABERTO' ? 'Abertos' :
                         f === 'EM_ANDAMENTO' ? 'Em andamento' :
                         f === 'EM_PAUSA' ? 'Pausados' : 'Concluídos'}
                    </button>
                ))}
            </div>

            {/* LISTA DE CHAMADOS COM LOG */}
            <div className="space-y-3">
                {chamadosFiltrados.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl text-muted text-xs font-bold uppercase">
                        Nenhum chamado encontrado.
                    </div>
                )}

                {chamadosFiltrados.map((ticket: any) => {
                    const expanded = expandedId === ticket.id;
                    return (
                        <div key={ticket.id} className="bg-card border border-border rounded-3xl overflow-hidden">

                            {/* CABEÇALHO DO CHAMADO */}
                            <button
                                className="w-full p-5 flex items-center gap-4 hover:bg-background/50 transition-all text-left"
                                onClick={() => setExpandedId(expanded ? null : ticket.id)}
                            >
                                <div className="shrink-0">
                                    {expanded
                                        ? <ChevronDown size={18} className="text-muted" />
                                        : <ChevronRight size={18} className="text-muted" />
                                    }
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${STATUS_STYLE[ticket.status] || 'bg-card text-muted'}`}>
                                            {STATUS_LABEL[ticket.status] || ticket.status}
                                            <SLABadge ticketId={ticket.id} compact />
                                            <h1 className="text-sm font-bold text-foreground">TA AQUI O PROBLEMA</h1>
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-muted">#{ticket.protocol}</span>
                                    </div>
                                    <p className="font-black text-foreground uppercase text-sm truncate">{ticket.subject}</p>
                                    <div className="flex gap-3 flex-wrap text-[9px] font-bold text-muted uppercase">
                                        <span className="flex items-center gap-1"><User size={9}/> {ticket.requester?.name}</span>
                                        <span className="flex items-center gap-1"><MapPin size={9}/> {ticket.department?.name}</span>
                                        <span className="flex items-center gap-1"><Calendar size={9}/> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                                        {ticket.assignedTo && (
                                            <span className="flex items-center gap-1"><Wrench size={9}/> {ticket.assignedTo.name}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-[10px] font-black text-muted flex items-center gap-1 shrink-0">
                                    <MessageSquare size={12}/>
                                    {ticket.comments?.length || 0}
                                </div>
                            </button>

                            {/* LOG EXPANDIDO */}
                            {expanded && (
                                <div className="border-t border-border bg-background/30 p-5 space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-4">
                                        Log completo do chamado
                                    </p>

                                    {/* Evento de criação */}
                                    <LogItem
                                        icon={<Clock size={12}/>}
                                        color="bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                                        label="Chamado aberto"
                                        author={ticket.requester?.name}
                                        time={new Date(ticket.createdAt).toLocaleString('pt-BR')}
                                    />

                                    {/* Atribuição */}
                                    {ticket.assignedTo && (
                                        <LogItem
                                            icon={<Wrench size={12}/>}
                                            color="bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                            label={`Atribuído a ${ticket.assignedTo.name}`}
                                            time={new Date(ticket.updatedAt).toLocaleString('pt-BR')}
                                        />
                                    )}

                                    {/* Visita agendada */}
                                    {ticket.visitDate && (
                                        <LogItem
                                            icon={<CalendarClock size={12}/>}
                                            color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                                            label={`Visita agendada: ${new Date(ticket.visitDate).toLocaleString('pt-BR')}`}
                                            description={ticket.visitNote}
                                        />
                                    )}

                                    {/* Comentários */}
                                    {ticket.comments?.map((c: any) => {
                                        const isVisita   = c.content.startsWith('[VISITA]');
                                        const isInternal = c.content.includes('[INTERNO]');
                                        const hasPhoto   = !!c.proofImage;

                                        if (isVisita) return null;

                                        return (
                                            <LogItem
                                                key={c.id}
                                                icon={hasPhoto ? <Camera size={12}/> : <MessageSquare size={12}/>}
                                                color={
                                                    isInternal
                                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                                        : 'bg-card text-muted border border-border'
                                                }
                                                label={
                                                    hasPhoto ? 'Foto anexada' :
                                                    isInternal ? 'Nota interna' : 'Mensagem'
                                                }
                                                author={c.user?.name}
                                                description={!hasPhoto ? c.content.replace('[INTERNO] ', '') : undefined}
                                                time={new Date(c.createdAt).toLocaleString('pt-BR')}
                                            />
                                        );
                                    })}

                                    {/* Conclusão */}
                                    {['CONCLUIDO', 'CONCLUDED'].includes(ticket.status) && (
                                        <LogItem
                                            icon={<CheckCircle2 size={12}/>}
                                            color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                            label="Chamado concluído"
                                            time={new Date(ticket.updatedAt).toLocaleString('pt-BR')}
                                        />
                                    )}

                                    {/* Pausa */}
                                    {ticket.status === 'EM_PAUSA' && (
                                        <LogItem
                                            icon={<PauseCircle size={12}/>}
                                            color="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                                            label="Chamado pausado"
                                            time={new Date(ticket.updatedAt).toLocaleString('pt-BR')}
                                        />
                                    )}

                                    <div className="pt-2">
                                        <Link
                                            href={`/controlador/chamados/${ticket.id}`}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                        >
                                            Ver chamado completo →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LogItem({ icon, color, label, author, description, time }: {
    icon: React.ReactNode;
    color: string;
    label: string;
    author?: string;
    description?: string;
    time?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${color}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-foreground">{label}</span>
                    {author && (
                        <span className="text-[9px] font-bold text-muted">por {author}</span>
                    )}
                </div>
                {description && (
                    <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{description}</p>
                )}
                {time && (
                    <p className="text-[9px] text-muted mt-0.5">{time}</p>
                )}
            </div>
        </div>
    );
}