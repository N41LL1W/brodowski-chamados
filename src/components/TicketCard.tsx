"use client";

import Link from "next/link";
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    CheckCheck, MapPin, Wrench, Eye,
    Clock, ArrowRight, Play, AlertTriangle,
    Calendar
} from 'lucide-react';
import SLABadge from '@/components/SLABadge';

type Mode = 'disponivel' | 'ativo' | 'pausado' | 'concluido';

interface TicketCardProps {
    ticket: any;
    onAction?: (id: string) => void;
    actionLabel?: string;
    isMine?: boolean;
    isDisabled?: boolean;
    mode?: Mode;
}

const PRIORITY_DOT: Record<string, string> = {
    URGENTE: 'bg-red-500',
    ALTA:    'bg-amber-500',
    NORMAL:  'bg-blue-500',
    BAIXA:   'bg-slate-400',
};

export default function TicketCard({
    ticket, onAction, actionLabel, isMine, isDisabled, mode = 'disponivel'
}: TicketCardProps) {

    // Rota de destino depende do modo
    const detailHref = mode === 'ativo' || mode === 'pausado'
        ? `/tecnico/chamado/${ticket.id}`           // tela de trabalho
        : `/tecnico/chamado/${ticket.id}/detalhes`; // tela read-only

    const borderColor =
        isDisabled ? 'border-l-border opacity-70' :
        mode === 'ativo' ? 'border-l-primary' :
        mode === 'pausado' ? 'border-l-purple-500' :
        'border-l-amber-500';

    const createdAt = new Date(ticket.createdAt);
    const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / 3600000);

    return (
        <Card className={`group relative p-5 flex flex-col h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-l-4 bg-card ${borderColor}`}>

            {/* URGENTE badge piscando */}
            {ticket.priority === 'URGENTE' && !isDisabled && (
                <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-[9px] font-black text-red-600 dark:text-red-400 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"/>
                        Urgente
                    </span>
                </div>
            )}

            <div className="flex-1 space-y-3">
                {/* PROTOCOLO + PRIORIDADE */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[ticket.priority] || 'bg-slate-400'}`}/>
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                            #{ticket.protocol}
                        </span>
                    </div>
                    <Badge variant="priority" value={ticket.priority}>
                        {ticket.priority}
                    </Badge>
                </div>

                {/* TÍTULO */}
                <h3 className="font-black text-foreground text-sm leading-snug uppercase group-hover:text-primary transition-colors line-clamp-2">
                    {ticket.subject}
                </h3>

                {/* SLA */}
                {!isDisabled && <SLABadge ticketId={ticket.id} compact/>}

                {/* META */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                            {ticket.requester?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-foreground truncate">{ticket.requester?.name}</span>
                    </div>

                    {ticket.location && (
                        <div className="flex items-center gap-2 text-[10px] text-muted">
                            <MapPin size={11} className="shrink-0"/>
                            <span className="truncate">{ticket.location}</span>
                        </div>
                    )}

                    {ticket.department?.name && (
                        <div className="flex items-center gap-2 text-[10px] text-muted">
                            <span className="w-2 h-2 rounded-sm bg-border shrink-0"/>
                            <span className="truncate">{ticket.department.name}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-muted">
                        <Clock size={11} className="shrink-0"/>
                        <span>
                            {hoursAgo === 0 ? 'Agora mesmo' :
                             hoursAgo < 24 ? `Há ${hoursAgo}h` :
                             createdAt.toLocaleDateString('pt-BR')}
                        </span>
                    </div>

                    {ticket.visitDate && (
                        <div className="flex items-center gap-2 text-[10px] text-primary">
                            <Calendar size={11} className="shrink-0"/>
                            <span>Visita: {new Date(ticket.visitDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-4">
                {isDisabled ? (
                    <Link
                        href={`/tecnico/chamado/${ticket.id}/detalhes`}
                        className="flex items-center justify-center gap-2 py-2.5 bg-background border border-border rounded-xl text-[10px] font-black text-muted uppercase hover:border-primary hover:text-primary transition-all w-full"
                    >
                        <CheckCheck size={13} className="text-emerald-500"/> Ver chamado concluído
                    </Link>
                ) : (
                    <>
                        <Link
                            href={detailHref}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all w-full ${
                                mode === 'ativo'
                                    ? 'bg-primary text-white hover:opacity-90'
                                    : mode === 'pausado'
                                        ? 'bg-purple-600 text-white hover:opacity-90'
                                        : 'bg-foreground text-background hover:opacity-90'
                            }`}
                        >
                            {mode === 'ativo'   ? <><Wrench size={13}/> Trabalhar</> :
                            mode === 'pausado' ? <><Eye size={13}/> Ver chamado</> :
                                                <><Eye size={13}/> Ver detalhes</>}
                        </Link>

                        {onAction && actionLabel && mode !== 'ativo' && (
                            <button
                                onClick={() => onAction(ticket.id)}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all w-full border-2 mt-2 ${
                                    mode === 'pausado'
                                        ? 'border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white'
                                        : 'border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white'
                                }`}
                            >
                                {actionLabel === 'Retomar' ? <Play size={13}/> : <ArrowRight size={13}/>}
                                {actionLabel}
                            </button>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}