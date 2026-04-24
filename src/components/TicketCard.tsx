"use client";

import Link from "next/link";
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCheck, MapPin, Wrench, Eye, Clock, ArrowRight, Play } from 'lucide-react';
import SLABadge from '@/components/SLABadge';

export default function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    const detailHref = `/tecnico/chamado/${ticket.id}`;

    return (
        <Card className={`group relative p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl border-l-4 bg-card ${
            isDisabled
                ? 'border-l-border opacity-60'
                : isMine
                    ? 'border-l-primary'
                    : 'border-l-amber-500'
        }`}>
            <div className="flex-1 space-y-4">

                {/* TOPO */}
                <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-foreground text-background rounded-lg uppercase tracking-wide">
                        {ticket.protocol}
                    </span>
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                </div>

                {/* TÍTULO */}
                <h3 className="font-black text-foreground text-base leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2">
                    {ticket.subject}
                </h3>

                {/* SLA */}
                <SLABadge ticketId={ticket.id} compact />

                {/* META */}
                <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                            {ticket.requester?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-black text-muted leading-none">Solicitante</p>
                            <p className="text-xs font-bold text-foreground truncate">{ticket.requester?.name}</p>
                        </div>
                    </div>

                    {ticket.location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-muted shrink-0"/>
                            <p className="text-xs font-bold text-muted truncate">{ticket.location}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-muted shrink-0"/>
                        <p className="text-xs font-bold text-muted">
                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-5">
                {isDisabled ? (
                    <div className="flex items-center justify-center gap-2 py-3 bg-background border border-border rounded-2xl text-[10px] font-black text-muted uppercase">
                        <CheckCheck size={14} className="text-emerald-500"/> Finalizado
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            href={detailHref}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${
                                isMine
                                    ? 'bg-primary text-white hover:opacity-90'
                                    : 'bg-foreground text-background hover:opacity-90'
                            }`}
                        >
                            {isMine ? <Wrench size={13}/> : <Eye size={13}/>}
                            {isMine ? "Trabalhar" : "Ver detalhes"}
                        </Link>

                        {onAction && actionLabel && (
                            <button
                                onClick={() => onAction(ticket.id)}
                                className="flex items-center justify-center gap-1 px-3 py-3 bg-card border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white rounded-2xl font-black text-[10px] uppercase transition-all"
                                title={actionLabel}
                            >
                                {actionLabel === "Retomar" ? <Play size={13}/> : <ArrowRight size={13}/>}
                                <span className="hidden sm:inline">{actionLabel}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}