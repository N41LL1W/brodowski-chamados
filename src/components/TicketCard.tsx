//src\components\TicketCard.tsx

"use client";

import Link from "next/link";
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCheck, MapPin, Wrench, Eye, Clock, ArrowRight, Play } from 'lucide-react';
import SLABadge from '@/components/SLABadge';

export default function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    const detailHref = `/tecnico/chamado/${ticket.id}`;

    return (
        <Card className={`group relative p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-l-[6px] shadow-sm ${
            isMine 
            ? 'border-l-blue-600 bg-linear-to-br from-blue-50/50 to-transparent dark:from-blue-900/10' 
            : (isDisabled ? 'border-l-slate-300 opacity-75 grayscale' : 'border-l-amber-500 bg-card dark:bg-slate-900')
        }`}>
            <div className="flex-1 space-y-5">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-slate-900 text-white rounded-md uppercase">
                        {ticket.protocol}
                    </span>
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                    <SLABadge ticketId={ticket.id} compact />
                </div>
                
                <h3 className="font-black text-slate-800 dark:text-white text-xl leading-tight uppercase group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                </h3>
                
                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-blue-600">
                            {ticket.requester?.name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 leading-none">Solicitante</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ticket.requester?.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-slate-400"/>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-slate-400 leading-none">Localização</span>
                            <span className="text-xs font-bold text-muted truncate max-w-[150px]">{ticket.location || "N/A"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
                {isDisabled ? (
                    <div className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-muted uppercase tracking-widest">
                        <CheckCheck size={16} className="text-emerald-500"/> Atendimento Finalizado
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {/* Botão Ver Detalhes / Trabalhar */}
                        <Link 
                            href={detailHref} 
                            className={`flex-2 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-md ${
                                isMine ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {isMine ? <Wrench size={14}/> : <Eye size={14}/>}
                            {isMine ? "Trabalhar Agora" : "Ver Detalhes"}
                        </Link>

                        {/* Botão de Ação (Assumir ou Retomar) */}
                        {onAction && actionLabel && (
                            <button 
                                onClick={() => onAction(ticket.id)} 
                                className="flex-1 flex items-center justify-center gap-2 bg-card dark:bg-slate-800 border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase transition-all"
                                title={actionLabel}
                            >
                                {actionLabel === "Retomar" ? <Play size={14}/> : <ArrowRight size={14}/>}
                                <span className="hidden sm:inline">{actionLabel}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}