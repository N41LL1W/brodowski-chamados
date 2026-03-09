"use client";

import Link from "next/link";
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCheck, MapPin, Wrench, Eye } from 'lucide-react';

export default function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    const detailHref = `/tecnico/chamado/${ticket.id}`;

    return (
        <Card className={`group p-5 flex flex-col h-full transition-all hover:shadow-xl border-l-[6px] ${
            isMine 
            ? 'border-l-blue-600 bg-blue-50/20 dark:bg-blue-900/10' 
            : (isDisabled ? 'border-l-slate-300 opacity-80' : 'border-l-amber-500 bg-white dark:bg-slate-900')
        }`}>
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black px-2 py-1 bg-slate-900 text-white rounded uppercase tracking-tighter">
                        {ticket.protocol}
                    </span>
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                </div>
                
                <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight line-clamp-2 uppercase">
                    {ticket.subject}
                </h3>
                
                <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">
                            {ticket.requester?.name?.charAt(0)}
                        </div>
                        {ticket.requester?.name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin size={14} className="text-blue-500"/> 
                        <span className="truncate">{ticket.location || "Local não informado"}</span>
                    </div>
                </div>
            </div>

            {/* ÁREA DE AÇÕES - BOTÕES CORRIGIDOS */}
            <div className="mt-6 flex flex-col gap-2">
                {isDisabled ? (
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase py-2">
                        <CheckCheck size={16}/> Finalizado
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {/* Botão de Ver Detalhes (Sempre Visível) */}
                        <Link 
                            href={detailHref} 
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all border-2 ${
                                isMine 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500'
                            }`}
                        >
                            {isMine ? <Wrench size={14}/> : <Eye size={14}/>}
                            {isMine ? "Trabalhar" : "Detalhes"}
                        </Link>

                        {/* Botão de Ação (Apenas se não for meu e estiver disponível) */}
                        {!isMine && onAction && (
                            <button 
                                onClick={() => onAction(ticket.id)} 
                                className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                            >
                                {actionLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}